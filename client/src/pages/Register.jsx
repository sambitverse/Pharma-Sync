import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Loader, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient');
  
  // Patient Fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Doctor Fields
  const [specialization, setSpecialization] = useState('');

  const [error, setError] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword || !role) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const extraFields = {};
    if (role === 'patient') {
      if (!age || !gender) {
        setError('Please fill in age and gender fields.');
        return;
      }
      extraFields.age = parseInt(age);
      extraFields.gender = gender;
      extraFields.medical_history = medicalHistory;
    } else if (role === 'doctor') {
      if (!specialization) {
        setError('Please specify your medical specialization.');
        return;
      }
      extraFields.specialization = specialization;
    }

    setLoadingState(true);
    try {
      await register(name, email, password, role, extraFields);
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
      <div className="flex items-center space-x-2 mb-6">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-card shadow-sm">
          <HeartPulse className="h-5 w-5" />
        </span>
        <span className="text-xl font-bold text-text">Pharma Sync</span>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-lg bg-card border border-primary/10 rounded-2xl p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text">Create your account</h2>
          <p className="text-sm text-text/60 mt-1">Join Pharma Sync in a minute.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl flex items-start space-x-2 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-1" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-text text-sm transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-text text-sm transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password & Confirm Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-text text-sm transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1" htmlFor="confirm">
                Confirm
              </label>
              <input
                id="confirm"
                type="password"
                className="w-full px-4 py-2 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-text text-sm transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-semibold text-text mb-1" htmlFor="role">
              I am a
            </label>
            <select
              id="role"
              className="w-full px-4 py-2 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-text text-sm transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Conditional Sub-forms */}
          {role === 'patient' && (
            <div className="border-t border-primary/10 pt-4 space-y-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-text/50">Patient Details</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1" htmlFor="age">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none text-xs"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1" htmlFor="gender">
                    Gender
                  </label>
                  <select
                    id="gender"
                    className="w-full px-3 py-2 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none text-xs"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text mb-1" htmlFor="history">
                  Medical History
                </label>
                <textarea
                  id="history"
                  className="w-full px-3 py-2 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none text-xs"
                  rows="2"
                  placeholder="e.g. Asthma, Penicillin allergy"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                />
              </div>
            </div>
          )}

          {role === 'doctor' && (
            <div className="border-t border-primary/10 pt-4 space-y-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-text/50">Doctor Details</span>
              <div>
                <label className="block text-xs font-semibold text-text mb-1" htmlFor="specialization">
                  Specialization
                </label>
                <input
                  id="specialization"
                  type="text"
                  className="w-full px-3 py-2 bg-[#FFFCF6] border border-primary/20 rounded-xl focus:outline-none text-xs"
                  placeholder="e.g. Cardiology, Diagnostics"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loadingState}
            className="w-full mt-2 py-3 bg-primary text-card hover:bg-primary-dark font-semibold rounded-xl transition-all shadow-sm flex justify-center items-center space-x-2 disabled:opacity-50 hover-scale text-sm cursor-pointer"
          >
            {loadingState ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create account</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text/75">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
