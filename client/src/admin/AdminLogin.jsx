import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-border w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold font-outfit text-dark">Admin Login</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" 
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button 
            type="submit" 
            className="w-full bg-brand text-bg py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
