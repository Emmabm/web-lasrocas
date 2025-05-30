import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Utensils, LayoutGrid, HelpCircle } from 'lucide-react';
import { Users } from 'lucide-react';


const Header: React.FC = () => {
  return (
    <header className="bg-[#FF6B35] text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold font-sans">Las Rocas</h1>
              <span className="ml-3 text-white/90 hidden md:inline">Arma tu evento</span>
            </div>
            <button className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <nav className="md:flex md:items-center mt-3 md:mt-0">
            <ul className="flex justify-around md:space-x-8">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${isActive ? 'text-white font-medium' : ''}`
                  }
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs mt-1">Inicio</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/catering"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${isActive ? 'text-white font-medium' : ''}`
                  }
                >
                  <Utensils className="h-5 w-5" />
                  <span className="text-xs mt-1">Catering</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/mesas"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${isActive ? 'text-white font-medium' : ''}`
                  }
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="text-xs mt-1">Mesas</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/eventos"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${isActive ? 'text-white font-medium' : ''}`
                  }
                >
                  <span className="h-5 w-5 flex items-center justify-center">📅</span>
                  <span className="text-xs mt-1">Organizador de horarios</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/faqs"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${isActive ? 'text-white font-medium' : ''}`
                  }
                >
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-xs mt-1">FAQs</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/invitados"
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white/90 hover:text-white transition-colors ${isActive ? 'text-white font-medium' : ''}`
                  }
                >
                  <Users className="h-5 w-5" />
                  <span className="text-xs mt-1">Invitados</span>
                </NavLink>
              </li>


            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;