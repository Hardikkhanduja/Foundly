import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import PostItem from './pages/PostItem';
import EditItem from './pages/EditItem';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('page-enter');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('page-exit');
    }
  }, [location, displayLocation]);

  return (
    <div
      className={transitionStage}
      onAnimationEnd={() => {
        if (transitionStage === 'page-exit') {
          setDisplayLocation(location);
          setTransitionStage('page-enter');
        }
      }}
    >
      <Routes location={displayLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/items/:id" element={<ItemDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/post-item" element={<PostItem />} />
          <Route path="/items/:id/edit" element={<EditItem />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <AnimatedRoutes />
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
