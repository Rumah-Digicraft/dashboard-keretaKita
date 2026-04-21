import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Edit } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function CommuterMapDetail() {
  const { id } = useParams();
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const docRef = doc(db, "rute_commuter_maps_metadata", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMapData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setMapData(null);
        }
      } catch (error) {
        console.error("Error fetching map detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Memuat detail peta...</div>;
  }

  if (!mapData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800">Peta tidak ditemukan</h2>
        <Link to="/commuter-maps" className="text-blue-600 hover:underline mt-4 inline-block">
          Kembali ke Daftar Peta
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/commuter-maps" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{mapData.metadata.title}</h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
             <span className="flex items-center gap-1">
                <User className="w-3 h-3" /> {mapData.metadata.admin_editor}
             </span>
             {mapData.metadata.last_updated?.seconds && (
                 <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 
                    {new Date(mapData.metadata.last_updated.seconds * 1000).toLocaleDateString('id-ID')}
                 </span>
             )}
          </div>
        </div>
        <Link 
          to={`/commuter-maps/edit/${id}`} 
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
        >
           <Edit className="w-4 h-4" />
          <span>Edit Peta</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Image Section */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="aspect-[4/3] bg-slate-50 rounded-lg overflow-hidden relative flex items-center justify-center">
            <img 
              src={mapData.metadata.image_url} 
              alt={mapData.metadata.title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="mt-2 text-xs text-slate-400 text-center">
             Dimensi Gambar: {mapData.metadata.image_dimensions?.width} x {mapData.metadata.image_dimensions?.height} px
          </div>
        </div>

        {/* Stations List Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit max-h-[calc(100vh-100px)] flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2 shrink-0">
            <MapPin className="w-5 h-5 text-kai-orange" />
            Daftar Stasiun ({mapData.stations?.length || 0})
          </h3>
          
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {mapData.stations?.map((station) => (
              <div 
                key={station.id}
                className="flex items-start justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                style={{ borderLeftColor: station.line_color, borderLeftWidth: '4px' }}
              >
                <div>
                    <div className="font-medium text-slate-700 flex items-center gap-2">
                        {station.name}
                        {station.is_transit && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold border border-yellow-200">
                                TRANSIT
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                        ID: {station.id}
                    </div>
                </div>
                <div className="text-xs text-slate-500 font-mono text-right">
                  <div>x: {station.coordinates.x}</div>
                  <div>y: {station.coordinates.y}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
