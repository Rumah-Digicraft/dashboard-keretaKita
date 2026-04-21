import { useState } from 'react';
import { db } from '../services/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { Plus, Search, Calendar, Edit, Trash2, ArrowRight, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import ScheduleForm from '../components/features/ScheduleForm';
import TrackingModal from '../components/features/TrackingModal';
import { useData } from '../context/DataContext';

export default function Schedules() {
  const { schedules, loadingSchedules: loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // useEffect removed: Data is fetched via DataContext


  const handleDelete = async (schedule) => {
    const result = await Swal.fire({
      title: 'Hapus Jadwal?',
      text: `Anda yakin ingin menghapus jadwal ${schedule.name_ka}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "jadwalKereta", schedule.id));
        Swal.fire('Terhapus!', 'Jadwal berhasil dihapus.', 'success');
      } catch (error) {
        console.error("Error deleting schedule:", error);
        Swal.fire('Error', 'Gagal menghapus jadwal', 'error');
      }
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    setIsFormOpen(true);
  };

  const filteredSchedules = schedules.filter(schedule =>
    (schedule.name_ka && schedule.name_ka.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (schedule.no_ka && schedule.no_ka.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (schedule.lintas && schedule.lintas.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jadwal Kereta</h1>
          <p className="text-slate-500">Kelola jadwal perjalanan dan rute kereta api.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-kai-orange text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal</span>
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
              placeholder="Cari nama KA, nomor, atau lintas..."
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
                <th className="px-6 py-4">No. KA</th>
                <th className="px-6 py-4">Nama Kereta</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Lintas</th>
                <th className="px-6 py-4">Jam</th>
                <th className="px-6 py-4 text-center">Stops</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    Tidak ada jadwal ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{schedule.no_ka}</td>
                    <td className="px-6 py-4 font-medium text-kai-blue">{schedule.name_ka}</td>
                    <td className="px-6 py-4">{schedule.kelas_ka}</td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-xs">
                        {schedule.lintas}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="text-slate-700">{schedule.time_berangkat}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-700">{schedule.time_tujuan}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                         {schedule.stops?.length || 0}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setIsTracking(true);
                          }}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Update Lokasi"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule)}
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

      {isFormOpen && !isTracking && (
        <ScheduleForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          scheduleToEdit={editingSchedule}
        />
      )}

      {isTracking && editingSchedule && (
        <TrackingModal
          isOpen={isTracking}
          onClose={() => {
            setIsTracking(false);
            setEditingSchedule(null);
          }}
          schedule={editingSchedule}
        />
      )}
    </div>
  );
}
