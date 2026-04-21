import { useState } from 'react';
import { db } from '../services/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { Plus, Search, MapPin, Edit, Trash2, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import StationForm from '../components/features/StationForm';
import { useData } from '../context/DataContext';

export default function Stations() {
  const { stations, loadingStations: loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);

  // useEffect removed: Data is now fetched globally in DataContext


  const handleDelete = async (station) => {
    const result = await Swal.fire({
      title: 'Hapus Stasiun?',
      text: `Anda yakin ingin menghapus stasiun ${station.nameStasiun}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "stasiun", station.id));
        Swal.fire('Terhapus!', 'Stasiun berhasil dihapus.', 'success');
      } catch (error) {
        console.error("Error deleting station:", error);
        Swal.fire('Error', 'Gagal menghapus stasiun', 'error');
      }
    }
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingStation(null);
    setIsFormOpen(true);
  };

  const filteredStations = stations.filter(station =>
    (station.nameStasiun && station.nameStasiun.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (station.kodeStasiun && station.kodeStasiun.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (station.city && station.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Stasiun</h1>
          <p className="text-slate-500">Kelola daftar stasiun kereta api disini.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-kai-orange text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Stasiun</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama stasiun, kode, atau kota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-kai-blue focus:border-kai-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Nama Stasiun</th>
                <th className="px-6 py-4">Kode</th>
                {/* <th className="px-6 py-4">Kota/Wilayah</th> */}
                <th className="px-6 py-4">Koordinat</th>
                <th className="px-6 py-4">Info (PDF)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredStations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data stasiun ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStations.map((station) => (
                  <tr key={station.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{station.nameStasiun}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                        {station.kodeStasiun}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4">{station.city}</td> */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {station.lat}, {station.lon}
                    </td>
                    <td className="px-6 py-4">
                      {station.infoStasiunUrl ? (
                         <a href={station.infoStasiunUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-kai-blue hover:underline">
                           <FileText className="w-4 h-4" />
                           Lihat PDF
                         </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Tidak ada info</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(station)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(station)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <StationForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          stationToEdit={editingStation}
        />
      )}
    </div>
  );
}
