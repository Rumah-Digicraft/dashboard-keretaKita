import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { db } from '../../services/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { useData } from '../../context/DataContext';

const formatCurrency = (value) => {
  if (!value) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const parseCurrency = (value) => {
  if (!value) return '';
  return value.replace(/\./g, '');
};

const CurrencyInput = ({ control, name, placeholder }) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { onChange, value, ref } }) => (
      <input
        type="text"
        ref={ref}
        value={formatCurrency(value)}
        onChange={(e) => {
          const rawValue = parseCurrency(e.target.value);
          if (/^\d*$/.test(rawValue)) {
            onChange(rawValue);
          }
        }}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
        placeholder={placeholder}
      />
    )}
  />
);

export default function SpecialFareForm({ isOpen, onClose, fareToEdit }) {
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { schedules } = useData();

  // Extract unique train names for autocomplete
  const uniqueTrainNames = [...new Set(schedules.map(s => s.name_ka))].sort();

  useEffect(() => {
    if (fareToEdit) {
      setValue('relasi', fareToEdit.relasi);
      setValue('berlaku_arah_sebaliknya', fareToEdit.berlaku_arah_sebaliknya);
      setValue('nama_ka', fareToEdit.nama_ka);
      // Handle fares object safely
      setValue('fares.eksekutif', fareToEdit.fares?.eksekutif?.toString() || '');
      setValue('fares.bisnis', fareToEdit.fares?.bisnis?.toString() || '');
      setValue('fares.ekonomi', fareToEdit.fares?.ekonomi?.toString() || '');
      setValue('fares.wisata', fareToEdit.fares?.wisata?.toString() || '');
    } else {
      reset();
      setValue('berlaku_arah_sebaliknya', true); // Default to true
    }
  }, [fareToEdit, setValue, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fareData = {
        relasi: data.relasi,
        berlaku_arah_sebaliknya: data.berlaku_arah_sebaliknya,
        nama_ka: data.nama_ka,
        fares: {
          eksekutif: data.fares.eksekutif ? parseInt(data.fares.eksekutif) : null,
          bisnis: data.fares.bisnis ? parseInt(data.fares.bisnis) : null,
          ekonomi: data.fares.ekonomi ? parseInt(data.fares.ekonomi) : null,
          wisata: data.fares.wisata ? parseInt(data.fares.wisata) : null,
        },
        updatedAt: serverTimestamp(),
      };

      if (fareToEdit) {
        await updateDoc(doc(db, "tarifKhusus", fareToEdit.id), fareData);
        Swal.fire('Berhasil', 'Tarif khusus berhasil diperbarui', 'success');
      } else {
        await addDoc(collection(db, "tarifKhusus"), {
          ...fareData,
          createdAt: serverTimestamp()
        });
        Swal.fire('Berhasil', 'Tarif khusus baru berhasil ditambahkan', 'success');
      }

      onClose();
      reset();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal menyimpan tarif khusus', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {fareToEdit ? 'Edit Tarif Khusus' : 'Tambah Tarif Khusus'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Relasi & Checkbox */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Relasi (Perjalanan)</label>
              <input
                {...register("relasi", { required: "Relasi wajib diisi" })}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
                placeholder="Contoh: Gambir - Cirebon"
              />
              {errors.relasi && <span className="text-xs text-red-500">{errors.relasi.message}</span>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("berlaku_arah_sebaliknya")}
                className="rounded border-slate-300 text-kai-blue focus:ring-kai-blue"
              />
              <span className="text-sm text-slate-600">Berlaku arah sebaliknya</span>
            </label>
          </div>

          {/* Nama KA */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama KA</label>
            <input
              {...register("nama_ka", { required: "Nama KA wajib diisi" })}
              list="train-names"
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue"
              placeholder="Contoh: Argo Lawu"
            />
            <datalist id="train-names">
              {uniqueTrainNames.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
            {errors.nama_ka && <span className="text-xs text-red-500">{errors.nama_ka.message}</span>}
          </div>

          {/* Fares */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase">Tarif (Rp)</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <label className="w-24 text-sm font-medium text-slate-600">Eksekutif</label>
                <CurrencyInput
                  control={control}
                  name="fares.eksekutif"
                  placeholder="Opsional"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-24 text-sm font-medium text-slate-600">Bisnis</label>
                <CurrencyInput
                  control={control}
                  name="fares.bisnis"
                  placeholder="Opsional"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-24 text-sm font-medium text-slate-600">Ekonomi</label>
                <CurrencyInput
                  control={control}
                  name="fares.ekonomi"
                  placeholder="Opsional"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-24 text-sm font-medium text-slate-600">Wisata</label>
                <CurrencyInput
                  control={control}
                  name="fares.wisata"
                  placeholder="Opsional"
                />
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
              {loading ? 'Menyimpan...' : 'Simpan Tarif'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
