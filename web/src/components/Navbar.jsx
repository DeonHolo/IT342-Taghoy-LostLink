import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/feed');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-white/15 text-gold-300'
        : 'text-maroon-100 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-maroon-900 shadow-[0_4px_24px_rgba(123,17,19,0.3)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/feed"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center shadow-[0_2px_8px_rgba(201,162,39,0.4)] transition-transform duration-300 group-hover:scale-105">
              <SearchIcon sx={{ fontSize: 20, color: '#44080a' }} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">
                LostLink
              </span>
              <span className="text-[10px] font-medium tracking-widest uppercase text-gold-400/80 leading-none mt-0.5">
                CIT-U
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/feed" className={navLinkClass('/feed')}>
              <SearchIcon sx={{ fontSize: 18 }} />
              Feed
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/post" className={navLinkClass('/post')}>
                  <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
                  Report Item
                </Link>
                <Link to="/my-posts" className={navLinkClass('/my-posts')}>
                  <ListAltIcon sx={{ fontSize: 18 }} />
                  My Posts
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className={navLinkClass('/admin')}>
                    <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18 }} />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                    <PersonOutlineIcon sx={{ fontSize: 16, color: '#e6bb3a' }} />
                  </div>
                  <span className="text-sm font-medium text-maroon-100">
                    {user?.firstName || 'User'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-maroon-200 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <LogoutIcon sx={{ fontSize: 16 }} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-maroon-100 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  Sign In
                </button>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gold-500 text-maroon-950 hover:bg-gold-400 transition-all duration-200 shadow-[0_2px_8px_rgba(201,162,39,0.3)] active:scale-[0.98]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-maroon-100 hover:bg-white/10 transition-colors cursor-pointer"
          >
            {mobileOpen ? (
              <CloseIcon sx={{ fontSize: 24 }} />
            ) : (
              <MenuIcon sx={{ fontSize: 24 }} />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/10 animate-fade-in-up">
            <div className="flex flex-col gap-1">
              <Link
                to="/feed"
                onClick={() => setMobileOpen(false)}
                className={navLinkClass('/feed')}
              >
                <SearchIcon sx={{ fontSize: 18 }} />
                Feed
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/post"
                    onClick={() => setMobileOpen(false)}
                    className={navLinkClass('/post')}
                  >
                    <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
                    Report Item
                  </Link>
                  <Link
                    to="/my-posts"
                    onClick={() => setMobileOpen(false)}
                    className={navLinkClass('/my-posts')}
                  >
                    <ListAltIcon sx={{ fontSize: 18 }} />
                    My Posts
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className={navLinkClass('/admin')}
                    >
                      <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18 }} />
                      Admin
                    </Link>
                  )}
                </>
              )}

              <div className="border-t border-white/10 mt-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-maroon-100 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <PersonOutlineIcon sx={{ fontSize: 18, color: '#e6bb3a' }} />
                      {user?.firstName} {user?.lastName}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-maroon-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                    >
                      <LogoutIcon sx={{ fontSize: 18 }} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <button
                      onClick={() => { setMobileOpen(false); setLoginModalOpen(true); }}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-center text-maroon-100 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Sign In
                    </button>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm font-semibold text-center bg-gold-500 text-maroon-950 hover:bg-gold-400 transition-all"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </nav>
  );
}
