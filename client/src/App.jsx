import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserPage from './pages/UserPage';
import AdminLogin from './admin/AdminLogin';
import Dashboard from './admin/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
