import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [schedules, setSchedules] = useState([]);
  const [stations, setStations] = useState([]);
  const [specialFares, setSpecialFares] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingSpecialFares, setLoadingSpecialFares] = useState(true);

  useEffect(() => {
    // 1. Listen to Schedules (jadwalKereta)
    const qSchedules = query(collection(db, "jadwalKereta"));
    const unsubSchedules = onSnapshot(qSchedules, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSchedules(data);
      setLoadingSchedules(false);
    }, (error) => {
      console.error("Error fetching schedules in context:", error);
      setLoadingSchedules(false);
    });

    // 2. Listen to Stations (stasiun)
    const qStations = query(collection(db, "stasiun"), orderBy("nameStasiun", "asc"));
    const unsubStations = onSnapshot(qStations, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStations(data);
      setLoadingStations(false);
    }, (error) => {
      console.error("Error fetching stations in context:", error);
      setLoadingStations(false);
    });

    // 3. Listen to Special Fares (tarifKhusus)
    const qSpecialFares = query(collection(db, "tarifKhusus"), orderBy("updatedAt", "desc"));
    const unsubSpecialFares = onSnapshot(qSpecialFares, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSpecialFares(data);
      setLoadingSpecialFares(false);
    }, (error) => {
      console.error("Error fetching special fares in context:", error);
      setLoadingSpecialFares(false);
    });

    return () => {
      unsubSchedules();
      unsubStations();
      unsubSpecialFares();
    };
  }, []);

  const value = {
    schedules,
    stations,
    specialFares,
    loadingSchedules,
    loadingStations,
    loadingSpecialFares,
    loading: loadingSchedules || loadingStations || loadingSpecialFares
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
