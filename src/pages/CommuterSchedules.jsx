import { Clock } from 'lucide-react';

export default function CommuterSchedules() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="p-4 bg-blue-50 rounded-full mb-4">
        <Clock className="w-12 h-12 text-kai-blue" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Jadwal Kereta Commuter</h1>
      <p className="text-slate-500 max-w-md">
        Fitur jadwal kereta commuter line sedang dalam pengembangan.
      </p>
    </div>
  );
}
