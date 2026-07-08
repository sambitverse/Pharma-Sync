import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [medicalHistory, setMedicalHistory] = useState(user?.medical_history || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-text/70">Please log in to view this profile.</p>
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const updates = { name };
    if (user.role === 'patient') {
      updates.age = parseInt(age);
      updates.gender = gender;
      updates.medical_history = medicalHistory;
    } else if (user.role === 'doctor') {
      updates.specialization = specialization;
    }

    try {
      await updateProfile(updates);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex-grow">
      <div className="bg-card border border-primary/10 rounded-2xl p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>

        <div className="flex items-center space-x-4 mb-8">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text">{user.name}</h2>
            <div className="flex items-center space-x-1 text-xs text-text/70 mt-0.5">
              <Shield className="h-3 w.5-3" />
              <span className="uppercase font-bold tracking-wider">{user.role} Account</span>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-success/20 border border-success/30 text-primary-dark rounded-xl flex items-center space-x-2 text-sm">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/30 text-danger rounded-xl flex items-start space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="email">
              Email Address (Cannot be modified)
            </label>
            <input
              id="email"
              type="text"
              className="w-full px-4 py-2.5 bg-background border border-primary/10 rounded-xl text-text/50 cursor-not-allowed outline-none"
              value={user.email}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2.5 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/45 text-text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {user.role === 'patient' && (
            <div className="border-t border-primary/5 pt-5 space-y-5">
              <h3 className="font-semibold text-text text-sm uppercase tracking-wider">Patient Records</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="age">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="0"
                    max="120"
                    className="w-full px-4 py-2 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/45 text-text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="gender">
                    Gender
                  </label>
                  <select
                    id="gender"
                    className="w-full px-4 py-2 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/45 text-text"
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
                <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="medicalHistory">
                  Medical History & Allergy Log
                </label>
                <textarea
                  id="medicalHistory"
                  className="w-full px-4 py-2 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/45 text-text placeholder-text/40"
                  rows="3"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Allergy to penicillin, family history of type-2 diabetes."
                />
              </div>
            </div>
          )}

          {user.role === 'doctor' && (
            <div className="border-t border-primary/5 pt-5 space-y-4">
              <h3 className="font-semibold text-text text-sm uppercase tracking-wider">Professional Profile</h3>
              <div>
                <label className="block text-sm font-semibold text-text mb-1.5" htmlFor="specialization">
                  Medical Specialization
                </label>
                <input
                  id="specialization"
                  type="text"
                  className="w-full px-4 py-2 bg-background border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/45 text-text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-card hover:bg-primary-dark font-semibold rounded-xl transition-all shadow-sm hover-scale flex justify-center items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Saving updates...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
