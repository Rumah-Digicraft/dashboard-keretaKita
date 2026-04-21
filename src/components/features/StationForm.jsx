import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { db, storage } from '../../services/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Upload, Save, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

export default function StationForm({ isOpen, onClose, stationToEdit }) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null); // Changed from previewImage
  const [uploadFile, setUploadFile] = useState(null); // Changed from imageFile

  useEffect(() => {
    if (stationToEdit) {
      // UPDATED: Field mapping
      setValue('nameStasiun', stationToEdit.nameStasiun);
      setValue('kodeStasiun', stationToEdit.kodeStasiun);
      setValue('city', stationToEdit.city || ''); // Keep city if exists, optional
      setValue('lat', stationToEdit.lat);
      setValue('lon', stationToEdit.lon); // Changed lng to lon
      setPreviewFile(stationToEdit.infoStasiunUrl);
    } else {
      reset();
      setPreviewFile(null);
    }
  }, [stationToEdit, setValue, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        Swal.fire('Error', 'Mohon upload file PDF', 'error');
        return;
      }
      setUploadFile(file);
      setPreviewFile(file.name);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let infoStasiunUrl = stationToEdit?.infoStasiunUrl || '';

      if (uploadFile) {
        const storageRef = ref(storage, `infoStasiun/${Date.now()}_${uploadFile.name}`);
        const snapshot = await uploadBytes(storageRef, uploadFile);
        infoStasiunUrl = await getDownloadURL(snapshot.ref);
      }

      const stationData = {
        nameStasiun: data.nameStasiun,
        kodeStasiun: data.kodeStasiun.toUpperCase(),
        city: data.city,
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon), // Changed lng to lon
        infoStasiunUrl,
        updatedAt: serverTimestamp(),
      };

      if (stationToEdit) {
        await updateDoc(doc(db, "stasiun", stationToEdit.id), stationData);
        Swal.fire('Berhasil', 'Data stasiun berhasil diperbarui', 'success');
      } else {
        await addDoc(collection(db, "stasiun"), {
          ...stationData,
          createdAt: serverTimestamp()
        });
        Swal.fire('Berhasil', 'Stasiun baru berhasil ditambahkan', 'success');
      }

      onClose();
      reset();
      setUploadFile(null);
      setPreviewFile(null);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal menyimpan data stasiun', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {stationToEdit ? 'Edit Stasiun' : 'Tambah Stasiun Baru'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Stasiun</label>
                <input
                  {...register("nameStasiun", { required: "Nama stasiun wajib diisi" })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                  placeholder="Contoh: Gambir"
                />
                {errors.nameStasiun && <span className="text-xs text-red-500">{errors.nameStasiun.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Stasiun</label>
                <input
                  {...register("kodeStasiun", { required: "Kode wajib diisi" })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue uppercase"
                  placeholder="Contoh: GMR"
                />
                {errors.kodeStasiun && <span className="text-xs text-red-500">{errors.kodeStasiun.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kota / Wilayah</label>
                <input
                  {...register("city")} // Made optional as it wasn't strictly in schema but good for UI
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                  placeholder="Contoh: Jakarta Pusat"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  {...register("lat", { required: "Latitude wajib diisi" })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                  placeholder="-6.176..."
                />
                {errors.lat && <span className="text-xs text-red-500">{errors.lat.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  {...register("lon", { required: "Longitude wajib diisi" })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                  placeholder="106.8..."
                />
                {errors.lon && <span className="text-xs text-red-500">{errors.lon.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Info Stasiun (PDF)</label>
                <div className="flex items-center gap-4">
                  {previewFile && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                       <FileText className="w-4 h-4" />
                       <span className="truncate max-w-[100px]">{typeof previewFile === 'string' ? 'File PDF' : previewFile}</span>
                    </div>
                  )}
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    Upload PDF
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-kai-blue text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Menyimpan...' : 'Simpan Stasiun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
