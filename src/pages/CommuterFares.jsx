import { Ticket } from 'lucide-react';

export default function CommuterFares() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="p-4 bg-orange-50 rounded-full mb-4">
        <Ticket className="w-12 h-12 text-kai-orange" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Tarif Perjalanan</h1>
      <p className="text-slate-500 max-w-md">
        Fitur cek tarif perjalanan commuter line sedang dalam pengembangan.
      </p>
    </div>
  );
}
