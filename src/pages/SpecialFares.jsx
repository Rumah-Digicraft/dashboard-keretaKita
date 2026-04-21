import { useState, useMemo } from 'react';
import { db } from '../services/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { Plus, Tag, Trash2, Edit, CheckCircle2, Search, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import SpecialFareForm from '../components/features/SpecialFareForm';
import { useData } from '../context/DataContext';

export default function SpecialFares() {
  const { specialFares, loadingSpecialFares } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFare, setEditingFare] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelasi, setFilterRelasi] = useState('');
  const [filterArah, setFilterArah] = useState(false);

  // Derived Data
  const uniqueRelasi = useMemo(() => {
    return [...new Set(specialFares.map(f => f.relasi))].sort();
  }, [specialFares]);

  const filteredFares = specialFares.filter(fare => {
    const matchesSearch = fare.nama_ka.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelasi = filterRelasi ? fare.relasi === filterRelasi : true;
    const matchesArah = filterArah ? fare.berlaku_arah_sebaliknya === true : true;
    return matchesSearch && matchesRelasi && matchesArah;
  });

  const handleDelete = async (fare) => {
    const result = await Swal.fire({
      title: 'Hapus?',
      text: `Yakin ingin menghapus tarif ${fare.nama_ka}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "tarifKhusus", fare.id));
        Swal.fire('Terhapus', 'Data telah dihapus', 'success');
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  const openModal = (fare = null) => {
    setEditingFare(fare);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFare(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tarif Khusus</h1>
          <p className="text-slate-500">Kelola promo dan tarif khusus kereta api.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-kai-orange text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Tambah Tarif</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari Nama KA..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue text-sm"
          />
        </div>
        
        <div className="relative w-full md:w-64">
           <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <select 
             value={filterRelasi} 
             onChange={(e) => setFilterRelasi(e.target.value)}
             className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-kai-blue focus:border-kai-blue text-sm appearance-none bg-white"
           >
             <option value="">Semua Relasi</option>
             {uniqueRelasi.map(relasi => (
               <option key={relasi} value={relasi}>{relasi}</option>
             ))}
           </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-full md:w-auto p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
          <input 
            type="checkbox" 
            checked={filterArah}
            onChange={(e) => setFilterArah(e.target.checked)}
            className="rounded border-slate-300 text-kai-blue focus:ring-kai-blue"
          />
          <span className="text-sm text-slate-600 font-medium whitespace-nowrap">2 Arah</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingSpecialFares ? (
          <p className="col-span-full text-center text-slate-500 py-8">Memuat data...</p>
        ) : filteredFares.length === 0 ? (
          <p className="col-span-full text-center text-slate-500 py-8">
            {specialFares.length === 0 ? "Belum ada data tarif khusus." : "Tidak ada data yang cocok dengan filter."}
          </p>
        ) : (
          filteredFares.map((fare) => (
            <div key={fare.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full relative group hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Tag className="w-5 h-5 text-purple-600" />
                    </div>
                    {fare.berlaku_arah_sebaliknya && (
                      <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 2 Arah
                      </span>
                    )}
                 </div>
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => openModal(fare)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                   <button onClick={() => handleDelete(fare)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                 </div>
               </div>

               <h3 className="text-lg font-bold text-slate-800 mb-1">{fare.nama_ka}</h3>
               <p className="text-sm font-medium text-slate-500 mb-4">{fare.relasi}</p>

               <div className="mt-auto space-y-2 pt-4 border-t border-slate-50">
                 {/* Fares Display */}
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Eksekutif</span>
                   <span className="font-semibold text-slate-700">
                     {fare.fares?.eksekutif ? `Rp ${fare.fares.eksekutif.toLocaleString('id-ID')}` : '-'}
                   </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Bisnis</span>
                   <span className="font-semibold text-slate-700">
                     {fare.fares?.bisnis ? `Rp ${fare.fares.bisnis.toLocaleString('id-ID')}` : '-'}
                   </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Ekonomi</span>
                   <span className="font-semibold text-slate-700">
                     {fare.fares?.ekonomi ? `Rp ${fare.fares.ekonomi.toLocaleString('id-ID')}` : '-'}
                   </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Wisata</span>
                   <span className="font-semibold text-slate-700">
                     {fare.fares?.wisata ? `Rp ${fare.fares.wisata.toLocaleString('id-ID')}` : '-'}
                   </span>
                 </div>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <SpecialFareForm
          isOpen={isModalOpen}
          onClose={closeModal}
          fareToEdit={editingFare}
        />
      )}
    </div>
  );
}
