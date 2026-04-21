import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, MapPin, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import { db, storage } from '../services/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

export default function CommuterMapForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID for edit mode
  const { currentUser } = useAuth();
  
  const isEditMode = !!id;

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      imageFile: null,
      stations: [{ name: '', x: 0, y: 0, line_color: '#000000', is_transit: false }]
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "stations"
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);

  // Load data for edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          const docRef = doc(db, "rute_commuter_maps_metadata", id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Populate form
            setValue('name', data.metadata.title);
            
            // Handle image preview
            setImagePreview(data.metadata.image_url);
            setImageDimensions(data.metadata.image_dimensions);

            // Populate stations
            if (data.stations && data.stations.length > 0) {
               replace(data.stations.map(st => ({
                   name: st.name,
                   x: st.coordinates.x,
                   y: st.coordinates.y,
                   line_color: st.line_color || '#000000',
                   is_transit: st.is_transit || false
               })));
            }
          } else {
             Swal.fire("Error", "Data tidak ditemukan", "error");
             navigate('/commuter-maps');
          }
        } catch (error) {
           console.error("Error loading data:", error);
           Swal.fire("Error", "Gagal memuat data", "error");
        } finally {
            setInitialLoading(false);
        }
      };
      
      fetchData();
    }
  }, [isEditMode, id, setValue, replace, navigate]);

  // Watch for file changes to update preview
  const imageFile = watch('imageFile');

  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const file = imageFile[0];
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      // Get dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Validate image for new entries
      if (!isEditMode && (!data.imageFile || !data.imageFile[0])) {
        throw new Error("Gambar peta wajib diupload");
      }

      let downloadURL = imagePreview; // Default to existing URL in edit mode
      let currentDimensions = imageDimensions;

      // Handle New Image Upload
      if (data.imageFile && data.imageFile[0]) {
          const file = data.imageFile[0];
          // Path: kaCommuter/petaRute/{filename}
          const storageRef = ref(storage, `kaCommuter/petaRute/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          downloadURL = await getDownloadURL(snapshot.ref);
          // Dimensions already updated by useEffect
          currentDimensions = imageDimensions;
      }

      const docId = isEditMode ? id : generateSlug(data.name);
      
      // Construct Data Object
      const mapData = {
        metadata: {
          title: data.name,
          last_updated: serverTimestamp(),
          admin_editor: currentUser?.displayName || currentUser?.email?.split('@')[0] || "Admin",
          image_url: downloadURL,
          image_dimensions: currentDimensions || { width: 0, height: 0 }
        },
        stations: data.stations.map((station, index) => ({
          id: `st_${String(index + 1).padStart(3, '0')}`,
          name: station.name,
          coordinates: {
            x: parseFloat(station.x),
            y: parseFloat(station.y)
          },
          line_color: station.line_color,
          is_transit: station.is_transit
        }))
      };

      if (isEditMode) {
          await updateDoc(doc(db, "rute_commuter_maps_metadata", docId), mapData);
      } else {
          await setDoc(doc(db, "rute_commuter_maps_metadata", docId), mapData);
      }

      Swal.fire({
        title: 'Berhasil!',
        text: `Data peta berhasil ${isEditMode ? 'diperbarui' : 'disimpan'}.`,
        icon: 'success',
        confirmButtonColor: '#2D3E50',
      }).then(() => {
        navigate(isEditMode ? `/commuter-maps/${id}` : '/commuter-maps');
      });

    } catch (error) {
      console.error("Error saving map:", error);
      Swal.fire({
        title: 'Gagal!',
        text: error.message || 'Terjadi kesalahan saat menyimpan data.',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
      return <div className="text-center py-12 text-slate-500">Memuat data...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link 
          to={isEditMode ? `/commuter-maps/${id}` : "/commuter-maps"}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Edit Peta Rute' : 'Tambah Peta Rute'}</h1>
          <p className="text-slate-500">{isEditMode ? 'Perbarui data peta rute.' : 'Buat peta rute commuter baru.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map Details & Stations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map Info Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Informasi Peta</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Peta Rute</label>
              <input
                {...register("name", { required: "Nama peta wajib diisi" })}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                placeholder="Contoh: Peta Rute Jabodetabek & Merak"
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isEditMode ? 'Ganti Gambar Peta (Opsional)' : 'Upload Gambar Peta'}
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    {...register("imageFile", { required: !isEditMode && "Gambar wajib diupload" })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-600">
                        {isEditMode ? 'Klik untuk mengganti gambar' : 'Klik untuk upload gambar'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, SVG (Max 10MB)</span>
                  </div>
              </div>
              {errors.imageFile && <span className="text-xs text-red-500 mt-1">{errors.imageFile.message}</span>}
            </div>
            {imageDimensions && (
                <p className="text-xs text-slate-500">
                    Dimensi: {imageDimensions.width} x {imageDimensions.height} px
                </p>
            )}
          </div>

          {/* Stations List Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-kai-orange" />
                 Daftar Stasiun
               </h3>
               <button
                 type="button"
                 onClick={() => append({ name: '', x: 0, y: 0, line_color: '#000000', is_transit: false })}
                 className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
               >
                 <Plus className="w-4 h-4" /> Tambah Stasiun
               </button>
             </div>

             <div className="space-y-4">
               {fields.length === 0 && (
                 <p className="text-center text-slate-400 py-8 italic">Belum ada stasiun ditambahkan.</p>
               )}
               
               {fields.map((field, index) => (
                 <div key={field.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                        <span className="bg-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-slate-500 border border-slate-200 shrink-0">
                        {index + 1}
                        </span>
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Nama Stasiun</label>
                            <input
                                {...register(`stations.${index}.name`, { required: true })}
                                placeholder="Nama Stasiun"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue text-sm"
                            />
                        </div>

                        <div>
                             <label className="block text-xs font-medium text-slate-500 mb-1">Koordinat X</label>
                             <input
                                type="number"
                                step="any"
                                {...register(`stations.${index}.x`, { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue text-sm"
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-slate-500 mb-1">Koordinat Y</label>
                             <input
                                type="number"
                                step="any"
                                {...register(`stations.${index}.y`, { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue text-sm"
                             />
                        </div>

                        <div>
                             <label className="block text-xs font-medium text-slate-500 mb-1">Warna Line</label>
                             <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    {...register(`stations.${index}.line_color`)}
                                    className="h-9 w-12 rounded border border-slate-300 cursor-pointer"
                                />
                                <input 
                                    type="text"
                                    {...register(`stations.${index}.line_color`)}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue text-sm uppercase"
                                />
                             </div>
                        </div>

                        <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    {...register(`stations.${index}.is_transit`)}
                                    className="rounded border-slate-300 text-kai-blue focus:ring-kai-blue w-4 h-4"
                                />
                                <span className="text-sm text-slate-600 font-medium">Stasiun Transit</span>
                            </label>
                        </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: Preview & Actions */}
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-sm text-slate-500 uppercase mb-3">Preview Gambar</h3>
             <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative">
               {imagePreview ? (
                 <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
               ) : (
                 <div className="flex flex-col items-center justify-center text-slate-400">
                    <MapPin className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">Preview akan muncul disini</span>
                 </div>
               )}
             </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-kai-blue text-white rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Menyimpan...' : (isEditMode ? 'Update Peta' : 'Simpan Peta')}
            </button>
            <p className="text-xs text-center text-slate-400 mt-3">
              Data akan {isEditMode ? 'diperbarui' : 'disimpan'} ke Firestore & Storage.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
