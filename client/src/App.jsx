import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PostListing from './pages/PostListing.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import Profile from './pages/Profile.jsx';
import Requests from './pages/Requests.jsx';
import Tracker from './pages/Tracker.jsx';
import Admin from './pages/Admin.jsx';
import Compare from './pages/Compare.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/post" element={<ProtectedRoute role="SEEKER"><PostListing /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
          <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><Admin /></ProtectedRoute>} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
