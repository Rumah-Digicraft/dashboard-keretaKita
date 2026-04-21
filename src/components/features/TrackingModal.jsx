import { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { X, Save, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TrackingModal({ isOpen, onClose, schedule }) {
  const [lat, setLat] = useState(schedule?.current_lat || '');
  const [lng, setLng] = useState(schedule?.current_lng || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, "schedules", schedule.id), {
        current_lat: parseFloat(lat),
        current_lng: parseFloat(lng),
        last_tracking_update: serverTimestamp()
      });
      Swal.fire({
        icon: 'success',
        title: 'Lokasi Terupdate',
        text: `Posisi ${schedule.name_ka} berhasil diperbarui.`,
        timer: 1500,
        showConfirmButton: false
      });
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal mengupdate lokasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-kai-orange" />
            Update Lokasi KA
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-700">{schedule.name_ka} ({schedule.no_ka})</p>
          <p className="text-xs text-slate-500">{schedule.lintas}</p>
        </div>

        <form onSubmit={handleUpdate} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="-6.200000"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              placeholder="106.800000"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-kai-blue text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Updating...' : 'Update Posisi'}
          </button>
        </form>
      </div>
    </div>
  );
}
