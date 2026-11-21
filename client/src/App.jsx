import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import MyTickets from './pages/MyTickets.jsx';
import NewTicket from './pages/NewTicket.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Queue from './pages/Queue.jsx';
import Knowledge from './pages/Knowledge.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<ProtectedRoute roles={['customer']}><MyTickets /></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute roles={['customer']}><NewTicket /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/queue" element={<ProtectedRoute roles={['agent', 'admin']}><Queue /></ProtectedRoute>} />
          <Route path="/knowledge" element={<Knowledge />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
