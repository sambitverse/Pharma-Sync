import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Loader, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !role) {
      setError('Please fill in all fields.');
      return;
    }

    setLoadingState(true);
    try {
      const loggedUser = await login(email, password);
      setLoadingState(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
      setLoadingState(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-background px-6 py-12">
      {/* Top Brand Logo */}
      <div className="flex items-center space-x-2 mb-8">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-card shadow-sm">
          <HeartPulse className="h-5 w-5" />
        </span>
        <span className="text-xl font-bold text-text">Pharma Sync</span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-card border border-primary/10 rounded-2xl p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text">Welcome back</h2>
          <p className="text-sm text-text/60 mt-1">Log in to your Pharma Sync account.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl flex items-start space-x-2 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2.5 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-text placeholder-text/30 text-sm transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2.5 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-text text-sm transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="w-full px-4 py-2.5 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-text text-sm transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loadingState}
            className="w-full mt-2 py-3 bg-primary text-card hover:bg-primary-dark font-semibold rounded-xl transition-all shadow-sm flex justify-center items-center space-x-2 disabled:opacity-50 hover-scale text-sm cursor-pointer"
          >
            {loadingState ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log in</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text/75">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
