import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import SearchIcon from '@mui/icons-material/Search';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Link to="/feed" className="no-underline flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <SearchIcon sx={{ color: 'white', fontSize: 18 }} />
            </div>
            <span className="text-xl font-bold text-[var(--color-primary-dark)] tracking-tight">
              Lost<span className="text-[var(--color-primary)]">Link</span>
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/feed">
            <Button
              size="small"
              sx={{
                color: isActive('/feed') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive('/feed') ? 700 : 500,
                bgcolor: isActive('/feed') ? 'var(--color-primary-light)/10' : 'transparent',
                '&:hover': { bgcolor: 'var(--color-bg)' }
              }}
            >
              Feed
            </Button>
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/post">
                <Button
                  size="small"
                  sx={{
                    color: isActive('/post') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: isActive('/post') ? 700 : 500,
                    bgcolor: isActive('/post') ? 'var(--color-primary-light)/10' : 'transparent',
                    '&:hover': { bgcolor: 'var(--color-bg)' }
                  }}
                >
                  Report Item
                </Button>
              </Link>
              <Link to="/my-posts">
                <Button
                  size="small"
                  sx={{
                    color: isActive('/my-posts') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: isActive('/my-posts') ? 700 : 500,
                    bgcolor: isActive('/my-posts') ? 'var(--color-primary-light)/10' : 'transparent',
                    '&:hover': { bgcolor: 'var(--color-bg)' }
                  }}
                >
                  My Posts
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/post">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    bgcolor: 'var(--color-primary)',
                    '&:hover': { bgcolor: 'var(--color-primary-dark)' },
                    display: { xs: 'none', sm: 'flex' },
                    boxShadow: '0 2px 8px rgba(26,86,219,0.25)',
                  }}
                >
                  Post Item
                </Button>
              </Link>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'var(--color-primary)',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: { sx: { mt: 1.5, minWidth: 200, borderRadius: '12px !important' } } }}
              >
                <div className="px-4 py-2">
                  <p className="font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
                </div>
                <Divider />
                <MenuItem onClick={() => { setAnchorEl(null); navigate('/my-posts'); }}>
                  <ListItemIcon><ArticleIcon fontSize="small" /></ListItemIcon>
                  My Posts
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="outlined" size="small" sx={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="contained" size="small" sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}>
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
