import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import Header from './components/Header';
import Home from './pages/Home';
import TablePlanner from './pages/TablePlanner';
import Catering from './pages/Catering';;
import Login from './pages/Login';
import EventSchedule from './pages/EventSchedule';
import Faqs from './pages/Faqs';
import Guests from "./pages/Guests"; 



function AppRoutes() {
  const location = useLocation();
  const hideHeader = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideHeader && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/:token" element={<Login />} />
          <Route path="/login/:token/:email" element={<Login />} />
          <Route path="/login/:token/:email/:password" element={<Login />} />
          <Route path="/login/:token/:email/:password/:rememberMe" element={<Login />} />
          <Route path="/login/:token/:email/:password/:rememberMe/:redirect" element={<Login />} />
          <Route path="/login/:token/:email/:password/:rememberMe/:redirect/:error" element={<Login />} />
          <Route path="/login/:token/:email/:password/:rememberMe/:redirect/:error/:message" element={<Login />} />
          <Route path="/login/:token/:email/:password/:rememberMe/:redirect/:error/:message/:success" element={<Login />} />
          <Route path="/login/:token/:email/:password/:rememberMe/:redirect/:error/:message/:success/:info" element={<Login />} />
          <Route path="/login/:token/:email/:password/:rememberMe/:redirect/:error/:message/:success/:info/:warning" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/mesas" element={<TablePlanner />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/eventos" element={<EventSchedule />} />
          <Route path="/invitados" element={<Guests />} />
      
        </Routes>
      </main>
      {!hideHeader && (
        <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
          © 2025 Las Rocas - Todos los derechos reservados
        </footer>
      )}
    </div>
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
