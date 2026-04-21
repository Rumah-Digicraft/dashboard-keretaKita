import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { db } from '../../services/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { X, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import Swal from 'sweetalert2';
import { useData } from '../../context/DataContext';

export default function ScheduleForm({ isOpen, onClose, scheduleToEdit }) {
  const { stations } = useData();
  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      stops: [{ station_name: '', station_kode: '', arrival_time: '', departure_time: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stops"
  });

  const [loading, setLoading] = useState(false);
  // const [stations, setStations] = useState([]); // Removed local state

  // useEffect removed: Data is fetched via DataContext


  useEffect(() => {
    if (scheduleToEdit) {
      reset({
        no_ka: scheduleToEdit.no_ka,
        name_ka: scheduleToEdit.name_ka,
        kelas_ka: scheduleToEdit.kelas_ka,
        lintas: scheduleToEdit.lintas,
        time_berangkat: scheduleToEdit.time_berangkat,
        time_tujuan: scheduleToEdit.time_tujuan,
        stops: scheduleToEdit.stops || []
      });
    } else {
      reset({
        stops: [{ station_name: '', station_kode: '', arrival_time: '', departure_time: '' }]
      });
    }
  }, [scheduleToEdit, reset]);

  // Watch for station changes to automatically set the code
  const handleStationChange = (index, e) => {
    const selectedStationName = e.target.value;
    const selectedStation = stations.find(s => s.nameStasiun === selectedStationName);
    if (selectedStation) {
      // UPDATED: 'code' -> 'kodeStasiun'
      setValue(`stops.${index}.station_kode`, selectedStation.kodeStasiun);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const scheduleData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (scheduleToEdit) {
        // UPDATED: 'schedules' -> 'jadwalKereta'
        await updateDoc(doc(db, "jadwalKereta", scheduleToEdit.id), scheduleData);
        Swal.fire('Berhasil', 'Jadwal berhasil diperbarui', 'success');
      } else {
        // UPDATED: 'schedules' -> 'jadwalKereta'
        await addDoc(collection(db, "jadwalKereta"), {
          ...scheduleData,
          createdAt: serverTimestamp()
        });
        Swal.fire('Berhasil', 'Jadwal baru berhasil ditambahkan', 'success');
      }

      onClose();
      reset();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal menyimpan jadwal', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {scheduleToEdit ? 'Edit Jadwal KA' : 'Tambah Jadwal KA Baru'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Main Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">Informasi Utama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">No. KA</label>
                <input
                  {...register("no_ka", { required: true })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                  placeholder="Contoh: 1"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama KA</label>
                <input
                  {...register("name_ka", { required: true })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                  placeholder="Contoh: Argo Bromo Anggrek"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kelas KA</label>
                <input
                  {...register("kelas_ka", { required: true })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                  placeholder="| Eks | Luxury |"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lintas</label>
                <input
                  {...register("lintas", { required: true })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                  placeholder="Contoh: GMR-SBI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Berangkat</label>
                <input
                  type="time"
                  {...register("time_berangkat", { required: true })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Tiba</label>
                <input
                  type="time"
                  {...register("time_tujuan", { required: true })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                />
              </div>
            </div>
          </section>

          {/* Stops (Dynamic) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Rute Perjalanan (Stops)</h3>
              <button
                type="button"
                onClick={() => append({ station_name: '', station_kode: '', arrival_time: '', departure_time: '' })}
                className="flex items-center gap-1 text-xs font-medium text-kai-blue hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Tambah Pemberhentian
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 relative group">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  <div className="w-full pl-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Stasiun</label>
                      <select
                        {...register(`stops.${index}.station_name`, { 
                          required: true, 
                          onChange: (e) => handleStationChange(index, e)
                        })}
                        className="block w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-kai-blue focus:border-kai-blue"
                      >
                        <option value="">Pilih Stasiun</option>
                        {stations.map(s => (
                          <option key={s.id} value={s.nameStasiun}>{s.nameStasiun}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Kode Stasiun</label>
                      <input
                        {...register(`stops.${index}.station_kode`)}
                        readOnly
                        className="block w-full px-2 py-1.5 text-sm bg-slate-100 border border-slate-300 rounded text-slate-500"
                        placeholder="Auto"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Datang</label>
                      <input
                        type="time"
                        {...register(`stops.${index}.arrival_time`)} // Not required for first/origin station usually, but good to have
                        className="block w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-kai-blue focus:border-kai-blue"
                      />
                    </div>

                    <div className="flex gap-2">
                       <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Berangkat</label>
                        <input
                          type="time"
                           {...register(`stops.${index}.departure_time`)}
                          className="block w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-kai-blue focus:border-kai-blue"
                        />
                       </div>
                       <button
                        type="button"
                        onClick={() => remove(index)}
                        className="mt-5 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

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
              {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
