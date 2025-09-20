import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { UserProvider } from './hooks/useUserContext';
import Home from './pages/cliente/Home';
import Header from './components/Header';
import TablePlanner from './pages/cliente/mesa/TablePlanner';
import EventSchedule from './pages/cliente/horarios/EventSchedule';
import Login from './pages/auth/Login';
import GuestsWrapper from './pages/cliente/invitados/GuestsWrapper';
import EventoPage from './pages/evento/[token]';
import RequireAuth from './components/RequireAuth';
import ThankYou from './pages/cliente/gracias/ThankYou';
import InvitadosCena from './pages/cliente/cena/InvitadosCena';

// Catering
import Catering from './pages/cliente/catering/Catering';
import ReceptionSelectionMenu1 from './pages/cliente/catering/menu1/ReceptionSelectionMenu1';
import MainCourseSelectionMenu1 from './pages/cliente/catering/menu1/MainCourseSelectionMenu1';
import DessertSelectionMenu1 from './pages/cliente/catering/menu1/DessertSelectionMenu1';
import KidsMenuSelectionMenu1 from './pages/cliente/catering/menu1/KidsMenuSelectionMenu1';
import ReceptionSelectionMenu2 from './pages/cliente/catering/menu2/ReceptionSelectionMenu2';
import EntradaSelectionMenu2 from './pages/cliente/catering/menu2/EntradaSelectionMenu2';
import MainCourseSelectionMenu2 from './pages/cliente/catering/menu2/MainCourseSelectionMenu2';
import DessertSelectionMenu2 from './pages/cliente/catering/menu2/DessertSelectionMenu2';
import KidsMenuSelectionMenu2 from './pages/cliente/catering/menu2/KidsMenuSelectionMenu2';
import ReceptionSelectionMenu3 from './pages/cliente/catering/menu3/ReceptionSelectionMenu3';
import MainCourseSelectionMenu3 from './pages/cliente/catering/menu3/MainCourseSelectionMenu3';
import DessertSelectionMenu3 from './pages/cliente/catering/menu3/DessertSelectionMenu3';
import KidsMenuSelectionMenu3 from './pages/cliente/catering/menu3/KidsMenuSelectionMenu3';
import ReceptionSelectionMenu4 from './pages/cliente/catering/menu4/ReceptionSelectionMenu4';
import LunchSelectionMenu4 from './pages/cliente/catering/menu4/LunchSelectionMenu4';
import DessertSelectionMenu4 from './pages/cliente/catering/menu4/DessertSelectionMenu4';
import DrinksSelection from './pages/cliente/catering/DrinksSelection';
import DanceFoodSelection from './pages/cliente/catering/DanceFoodSelection';
import CateringSummary from './pages/cliente/catering/CateringSummary';
// Organizador
import OrganizadorPanel from './pages/organizador/OrganizadorPanel';
import OrganizadorPanelWrapper from './pages/layouts/OrganizadorPanelWrapper';
import CateringResumenOrganizador from './pages/organizador/CateringResumenOrganizador';
import MesasResumenOrganizador from './pages/organizador/MesasResumenOrganizador';
import HorariosResumenOrganizador from './pages/organizador/HorariosResumenOrganizador';
import InvitadosResumenOrganizador from './pages/organizador/InvitadosResumenOrganizador';
import CenaResumenOrganizador from './pages/organizador/CenaResumenOrganizador';

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  // Ocultar header y footer en la página principal (login) y rutas de organizador
  const hideHeaderFooter = location.pathname === '/' || location.pathname.startsWith('/organizador');

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1">
          <Routes>
            {/* Rutas accesibles para todos */}
            {/* La ruta principal ahora es el login */}
            <Route path="/" element={<Login />} />
            <Route path="/cliente" element={<Home />} />
            <Route path="/evento/:token" element={<EventoPage />} />
            <Route path="/thank-you" element={<ThankYou />} />

            {/* Rutas generales */}
            <Route path="/mesa" element={<TablePlanner />} />
            <Route path="/invitados-cena" element={<InvitadosCena />} />
            <Route path="/horarios" element={<EventSchedule />} />
            <Route path="/invitados" element={<GuestsWrapper />} />

            {/* Rutas protegidas por rol */}
            <Route
              path="/organizador/panel"
              element={
                <RequireAuth allowedRoles={['organizador']}>
                  <OrganizadorPanelWrapper>
                    <OrganizadorPanel />
                  </OrganizadorPanelWrapper>
                </RequireAuth>
              }
            />
            <Route
              path="/organizador/evento/:id/catering"
              element={
                <RequireAuth allowedRoles={['organizador']}>
                  <OrganizadorPanelWrapper>
                    <CateringResumenOrganizador />
                  </OrganizadorPanelWrapper>
                </RequireAuth>
              }
            />
            <Route
              path="/organizador/evento/:id/mesas"
              element={
                <RequireAuth allowedRoles={['organizador']}>
                  <OrganizadorPanelWrapper>
                    <MesasResumenOrganizador />
                  </OrganizadorPanelWrapper>
                </RequireAuth>
              }
            />
            <Route
              path="/organizador/evento/:id/cena"
              element={
                <RequireAuth allowedRoles={['organizador']}>
                  <OrganizadorPanelWrapper>
                    <CenaResumenOrganizador />
                  </OrganizadorPanelWrapper>
                </RequireAuth>
              }
            />
            <Route
              path="/organizador/evento/:id/horarios"
              element={
                <RequireAuth allowedRoles={['organizador']}>
                  <OrganizadorPanelWrapper>
                    <HorariosResumenOrganizador />
                  </OrganizadorPanelWrapper>
                </RequireAuth>
              }
            />
            <Route
              path="/organizador/evento/:id/invitados"
              element={
                <RequireAuth allowedRoles={['organizador']}>
                  <OrganizadorPanelWrapper>
                    <InvitadosResumenOrganizador />
                  </OrganizadorPanelWrapper>
                </RequireAuth>
              }
            />

            {/* Rutas de catering */}
            <Route path="/catering" element={<Catering />} />
            <Route path="/catering/menu1/recepcion" element={<ReceptionSelectionMenu1 />} />
            <Route path="/catering/menu1/main" element={<MainCourseSelectionMenu1 />} />
            <Route path="/catering/menu1/postre" element={<DessertSelectionMenu1 />} />
            <Route path="/catering/menu1/kids" element={<KidsMenuSelectionMenu1 />} />
            <Route path="/catering/menu1/bebidas" element={<DrinksSelection />} />
            <Route path="/catering/menu1/comidas-baile" element={<DanceFoodSelection />} />
            <Route path="/catering/menu1/resumen" element={<CateringSummary />} />
            <Route path="/catering/menu2/recepcion" element={<ReceptionSelectionMenu2 />} />
            <Route path="/catering/menu2/entrada" element={<EntradaSelectionMenu2 />} />
            <Route path="/catering/menu2/main" element={<MainCourseSelectionMenu2 />} />
            <Route path="/catering/menu2/postre" element={<DessertSelectionMenu2 />} />
            <Route path="/catering/menu2/kids" element={<KidsMenuSelectionMenu2 />} />
            <Route path="/catering/menu2/bebidas" element={<DrinksSelection />} />
            <Route path="/catering/menu2/comidas-baile" element={<DanceFoodSelection />} />
            <Route path="/catering/menu2/resumen" element={<CateringSummary />} />
            <Route path="/catering/menu3/recepcion" element={<ReceptionSelectionMenu3 />} />
            <Route path="/catering/menu3/main" element={<MainCourseSelectionMenu3 />} />
            <Route path="/catering/menu3/postre" element={<DessertSelectionMenu3 />} />
            <Route path="/catering/menu3/kids" element={<KidsMenuSelectionMenu3 />} />
            <Route path="/catering/menu3/bebidas" element={<DrinksSelection />} />
            <Route path="/catering/menu3/comidas-baile" element={<DanceFoodSelection />} />
            <Route path="/catering/menu3/resumen" element={<CateringSummary />} />
            <Route path="/catering/menu4/recepcion" element={<ReceptionSelectionMenu4 />} />
            <Route path="/catering/menu4/lunch" element={<LunchSelectionMenu4 />} />
            <Route path="/catering/menu4/postre" element={<DessertSelectionMenu4 />} />
            <Route path="/catering/menu4/bebidas" element={<DrinksSelection />} />
            <Route path="/catering/menu4/comidas-baile" element={<DanceFoodSelection />} />
            <Route path="/catering/menu4/resumen" element={<CateringSummary />} />

            {/* Ruta para cualquier otra URL, redirige al login si no se encuentra */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!hideHeaderFooter && (
          <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
            © 2025 Las Rocas - Todos los derechos reservados
          </footer>
        )}
      </div>
    </>
  );
}

export default App;