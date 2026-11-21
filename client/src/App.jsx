import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import MyTickets from './pages/MyTickets.jsx';
import NewTicket from './pages/NewTicket.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Queue from './pages/Queue.jsx';
import Knowledge from './pages/Knowledge.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import IntroSplash from './components/IntroSplash.jsx';
import AppSkeleton from './components/AppSkeleton.jsx';

const KEY = 'careloop-intro';
// The intro plays once per browser session. Add ?intro=1 to the address to replay it.
const shouldPlayIntro = () => {
  try { return new URLSearchParams(window.location.search).has('intro') || sessionStorage.getItem(KEY) !== '1'; }
  catch { return true; }
};

export default function App() {
  const { loading } = useAuth();
  const [intro, setIntro] = useState(shouldPlayIntro);

  const finishIntro = () => {
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    setIntro(false);
  };

  if (intro) return <IntroSplash onDone={finishIntro} />;
  if (loading) return <AppSkeleton />; // intro done but the login check is still running

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<ProtectedRoute roles={['customer']}><MyTickets /></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute roles={['customer']}><NewTicket /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/queue" element={<ProtectedRoute roles={['agent', 'admin']}><Queue /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/knowledge" element={<Knowledge />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
