import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';


import Home from './pages/Home';
import Header from './components/Header';
import TablePlanner from './pages/TablePlanner';
import Catering from './pages/Catering';;
import EventSchedule from './pages/EventSchedule';
import AdminPanel from './pages/admin/AdminPanel';
import EventoPage from './pages/evento/EventoPage.tsx';



function AppRoutes() {
  const location = useLocation();
  const hideHeader = location.pathname === '/';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mesas" element={<TablePlanner />} />
            <Route path="/catering" element={<Catering />} />
            <Route path="/eventos" element={<EventSchedule />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/evento" element={<EventoPage />} />
          </Routes>
        </main>
        {!hideHeader && (
          <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
            © 2025 Las Rocas - Todos los derechos reservados
          </footer>
        )}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
