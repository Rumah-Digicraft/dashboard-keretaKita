import { useState, useEffect } from 'react';
import { TrainFront, MapPin, Tag, Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import PlayStoreReviews from '../components/features/PlayStoreReviews';

export default function Dashboard() {
  const { schedules, stations, specialFares, loading } = useData();
  const [stats, setStats] = useState([
    { title: 'Total Kereta', value: '...', icon: TrainFront, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Stasiun', value: '...', icon: MapPin, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Tarif Khusus', value: '-', icon: Tag, color: 'text-green-600', bg: 'bg-green-100' }, // Placeholder for now
    { title: 'Admin Active', value: '1', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]);

  useEffect(() => {
    if (!loading) {
      setStats(prev => [
          { ...prev[0], value: schedules.length.toString() },
          { ...prev[1], value: stations.length.toString() },
          { ...prev[2], value: specialFares.length.toString() },
          prev[3]
      ]);
    }
  }, [schedules, stations, specialFares, loading]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <PlayStoreReviews />
      </div>
    </div>
  );
}
