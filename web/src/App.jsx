import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Feed from './pages/Feed';
import PostItem from './pages/PostItem';
import ItemDetail from './pages/ItemDetail';
import EditItem from './pages/EditItem';
import MyPosts from './pages/MyPosts';

/**
 * Application Root Component
 *
 * Routes:
 *  /feed          — Public feed (main page)
 *  /items/:id     — Item detail (public, but reveal requires auth)
 *  /post          — Post new item (protected)
 *  /items/:id/edit — Edit item (protected)
 *  /my-posts      — User's own posts (protected)
 *  /login         — Login page
 *  /register      — Register page
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <PostItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:id/edit"
            element={
              <ProtectedRoute>
                <EditItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-posts"
            element={
              <ProtectedRoute>
                <MyPosts />
              </ProtectedRoute>
            }
          />
          {/* Legacy dashboard redirect */}
          <Route path="/dashboard" element={<Navigate to="/feed" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
