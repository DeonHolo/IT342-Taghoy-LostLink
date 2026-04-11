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
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/feed" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
