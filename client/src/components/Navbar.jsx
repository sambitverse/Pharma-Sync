import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, LogOut, User, MessageSquare, LayoutDashboard, Menu, X, ExternalLink } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 shadow-sm border-b border-primary/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Name */}
        <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl hover:opacity-90 transition-opacity">
          <HeartPulse className="h-7 w-7 text-primary animate-pulse" />
          <span className="font-extrabold tracking-tight">Pharma Sync</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          


          {user ? (
            /* Logged In: Hamburger Menu Icon */
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors focus:outline-none flex items-center space-x-1.5 border border-primary/20 hover-scale"
                aria-label="Toggle Menu"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="text-sm font-semibold hidden md:inline">Menu</span>
              </button>

              {/* Collapsible Dropdown Burger Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-card border border-primary/15 rounded-2xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-primary/10 mb-2">
                    <p className="text-xs text-text/50 font-bold uppercase tracking-wider">Account Role</p>
                    <p className="text-sm font-bold text-text truncate">{user.name}</p>
                    <span className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-success/20 text-primary-dark rounded-full mt-1">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-primary bg-primary/5 font-bold' : 'text-text/70 hover:text-primary hover:bg-primary/5'}`}
                  >
                    <HeartPulse className="h-4 w-4" />
                    <span>Home</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-primary bg-primary/5 font-bold' : 'text-text/70 hover:text-primary hover:bg-primary/5'}`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/ai-assistant"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${isActive('/ai-assistant') ? 'text-primary bg-primary/5 font-bold' : 'text-text/70 hover:text-primary hover:bg-primary/5'}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>AI Assistant</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${isActive('/profile') ? 'text-primary bg-primary/5 font-bold' : 'text-text/70 hover:text-primary hover:bg-primary/5'}`}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>

                  <div className="border-t border-primary/10 mt-2 pt-2 px-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest Links */
            <div className="flex items-center space-x-2">
              <Link 
                to="/login" 
                className="px-4 py-2 text-primary font-medium hover:text-primary-dark transition-colors text-sm"
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-primary text-card rounded-lg font-medium hover:bg-primary-dark hover-scale shadow-sm transition-all text-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
