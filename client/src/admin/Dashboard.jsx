import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';
import { LogOut, RefreshCcw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        fetchEnquiries(u);
      } else {
        navigate('/admin/login');
      }
    });
    return unsub;
  }, [navigate]);

  const fetchEnquiries = async (currentUser) => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_BASE}/api/enquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnquiries(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching enquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = await user.getIdToken();
      await axios.patch(`${API_BASE}/api/enquiries/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (!user) return null;

  const total = enquiries.length;
  const pending = enquiries.filter(e => e.status === 'pending').length;
  const completed = enquiries.filter(e => e.status === 'done').length;

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-outfit text-dark">Admin Dashboard</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-muted hover:text-dark">
            <LogOut size={20} /> Logout
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-border">
            <div className="text-muted text-sm font-bold uppercase tracking-wider mb-2">Total Enquiries</div>
            <div className="text-4xl font-outfit text-dark">{total}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-border">
            <div className="text-muted text-sm font-bold uppercase tracking-wider mb-2">Pending</div>
            <div className="text-4xl font-outfit text-brand">{pending}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-border">
            <div className="text-muted text-sm font-bold uppercase tracking-wider mb-2">Completed</div>
            <div className="text-4xl font-outfit text-green-600">{completed}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-lg">Recent Enquiries</h2>
            <button onClick={() => fetchEnquiries(user)} className="text-brand flex items-center gap-1 hover:underline">
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg text-muted text-sm uppercase">
                  <th className="p-4 border-b border-border">Date</th>
                  <th className="p-4 border-b border-border">Customer</th>
                  <th className="p-4 border-b border-border">Service</th>
                  <th className="p-4 border-b border-border">Details</th>
                  <th className="p-4 border-b border-border">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-muted">Loading...</td></tr>
                ) : enquiries.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-muted">No enquiries found.</td></tr>
                ) : (
                  enquiries.map((e) => (
                    <tr key={e.id} className="border-b border-border hover:bg-gray-50">
                      <td className="p-4 whitespace-nowrap text-sm text-muted">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="font-bold">{e.name}</div>
                        <div className="text-sm text-muted">{e.phone}</div>
                        <div className="text-sm text-muted">{e.email}</div>
                      </td>
                      <td className="p-4 uppercase text-sm font-medium">{e.service}</td>
                      <td className="p-4 max-w-xs text-sm text-muted break-words">
                        {e.details && Object.entries(e.details).map(([k, v]) => (
                          <div key={k}><span className="font-semibold capitalize">{k}:</span> {v}</div>
                        ))}
                      </td>
                      <td className="p-4">
                        <select 
                          value={e.status} 
                          onChange={(ev) => updateStatus(e.id, ev.target.value)}
                          className={`p-2 rounded-lg text-sm font-semibold border ${
                            e.status === 'pending' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            e.status === 'progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="progress">In Progress</option>
                          <option value="done">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
