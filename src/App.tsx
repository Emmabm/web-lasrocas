import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

import Home from './pages/Home';
import Header from './components/Header';
import TablePlanner from './pages/TablePlanner';
import Catering, {
  DishSelection,
  SideSelection,
  ExtraSelection,
} from './pages/Catering';
import Guests from './pages/Guests';
import EventSchedule from './pages/EventSchedule';
import AdminPanel from './pages/admin/AdminPanel';
import Login from './pages/auth/Login';
import EventoPage from './pages/evento/[token]';
import RequireAuth from './components/RequireAuth';

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
            <Route path="/catering/:menuId/platos" element={<DishSelection />} />
            <Route path="/catering/:menuId/acompanamientos" element={<SideSelection />} />
            <Route path="/catering/:menuId/extras" element={<ExtraSelection />} />
            <Route path="/invitados" element={<Guests />} />
            <Route path="/eventos" element={<EventSchedule />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/auth" element={<Login />} />
            <Route path="/evento/:token" element={<EventoPage />} />
            <Route path="/admin"element={
    <RequireAuth>
      <AdminPanel />
    </RequireAuth>
  }
/>

            {/* Catch-all: redirige rutas desconocidas al home */}
            <Route path="*" element={<Navigate to="/" replace />} />
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
