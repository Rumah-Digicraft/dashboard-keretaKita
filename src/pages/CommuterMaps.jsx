import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, ChevronRight, Plus } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function CommuterMaps() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "rute_commuter_maps_metadata"),
      orderBy("metadata.last_updated", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaps(mapsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching maps:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Peta Rute Commuter</h1>
          <p className="text-slate-500">Peta interaktif rute kereta api commuter di Indonesia.</p>
        </div>
        <Link 
          to="/commuter-maps/add" 
          className="flex items-center gap-2 px-4 py-2 bg-kai-orange text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
        >
           <Plus className="w-5 h-5" />
          <span>Tambah Peta</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat data peta...</div>
      ) : maps.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
          <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-700">Belum ada peta rute</h3>
          <p className="text-slate-500 mb-4">Silahkan tambahkan peta rute baru.</p>
          <Link 
            to="/commuter-maps/add" 
            className="text-kai-blue font-medium hover:underline"
          >
            Tambah Peta Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map((map) => (
            <Link 
              key={map.id} 
              to={`/commuter-maps/${map.id}`}
              className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden boarder-b border-slate-100">
                 <img 
                   src={map.metadata.image_url} 
                   alt={map.metadata.title} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                   loading="lazy"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                   <span className="text-white text-sm font-medium flex items-center gap-1">
                     Lihat Detail <ChevronRight className="w-4 h-4" />
                   </span>
                 </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Map className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {map.metadata.title}
                    </h3>
                  </div>
                </div>
                
                <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-slate-500">
                   <span>{map.stations?.length || 0} Stasiun</span>
                   <span className="uppercase">{map.metadata.admin_editor || 'Admin'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
