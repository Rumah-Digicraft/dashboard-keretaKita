import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Stations from './pages/Stations';
import Schedules from './pages/Schedules';
import SpecialFares from './pages/SpecialFares';
import CommuterMaps from './pages/CommuterMaps';
import CommuterMapDetail from './pages/CommuterMapDetail';
import CommuterMapForm from './pages/CommuterMapForm';
import CommuterFares from './pages/CommuterFares';
import CommuterSchedules from './pages/CommuterSchedules';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stations" element={<Stations />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/special-fares" element={<SpecialFares />} />
            <Route path="/commuter-maps" element={<CommuterMaps />} />
            <Route path="/commuter-maps/add" element={<CommuterMapForm />} />
            <Route path="/commuter-maps/edit/:id" element={<CommuterMapForm />} />
            <Route path="/commuter-maps/:id" element={<CommuterMapDetail />} />
            <Route path="/commuter-fares" element={<CommuterFares />} />
            <Route path="/commuter-schedules" element={<CommuterSchedules />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
