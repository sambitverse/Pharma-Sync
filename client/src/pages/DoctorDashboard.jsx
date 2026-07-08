import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, Check, X, FilePlus, Loader, CheckCircle, AlertCircle, Users, Clipboard } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    todaysVisits: 0,
    activePatients: 0,
    pendingReports: 0,
    prescriptionsCount: 0
  });

  // Prescription form states
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');
  const [prescLoading, setPrescLoading] = useState(false);
  const [prescSuccess, setPrescSuccess] = useState('');
  const [prescError, setPrescError] = useState('');
  const [showCompiler, setShowCompiler] = useState(false);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [apptsRes, patientsRes, statsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
        api.get('/doctors/stats')
      ]);
      setAppointments(apptsRes.data);
      setPatients(patientsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctor dashboard data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      fetchData(); // Refresh list & stats
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status.');
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setPrescError('');
    setPrescSuccess('');

    if (!selectedPatient || !medicines) {
      setPrescError('Please choose a patient and enter medicines.');
      return;
    }

    setPrescLoading(true);
    try {
      await api.post('/prescriptions', {
        patient_id: selectedPatient,
        medicines,
        notes,
      });
      setPrescSuccess('E-prescription successfully issued to patient!');
      setSelectedPatient('');
      setMedicines('');
      setNotes('');
      fetchData(); // Refresh stats count
      setTimeout(() => setShowCompiler(false), 2000);
    } catch (err) {
      setPrescError(err.response?.data?.message || 'Failed to generate prescription.');
    } finally {
      setPrescLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader className="animate-spin rounded-full h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full">
      {/* Header */}
      <div className="mb-8">
        <span className="text-primary font-bold text-xs uppercase tracking-wider">Doctor Dashboard</span>
        <h2 className="text-3xl font-extrabold text-text mt-1">Welcome back, Dr. {user.name} 👋</h2>
        <p className="text-text/70 text-sm mt-1">You have {stats.todaysVisits} appointments scheduled today.</p>
      </div>

      {/* Row of stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Today's visits */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Today's visits</span>
            <span className="text-2xl font-extrabold text-text">{stats.todaysVisits}</span>
          </div>
        </div>

        {/* Active patients */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Active patients</span>
            <span className="text-2xl font-extrabold text-text">{stats.activePatients}</span>
          </div>
        </div>

        {/* Pending reports */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Clipboard className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Pending reports</span>
            <span className="text-2xl font-extrabold text-text">{stats.pendingReports}</span>
          </div>
        </div>

        {/* Total prescriptions */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Prescriptions</span>
            <span className="text-2xl font-extrabold text-text">{stats.prescriptionsCount}</span>
          </div>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Tables */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's appointments */}
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-4">Today's appointments</h3>
            {appointments.length === 0 ? (
              <p className="text-text/60 text-sm italic py-4">No appointments scheduled today.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-primary/10 text-xs text-text/60 uppercase">
                      <th className="py-2.5 px-2">Patient</th>
                      <th className="py-2.5 px-2">Time</th>
                      <th className="py-2.5 px-2">Status</th>
                      <th className="py-2.5 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5 text-sm">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-background/25">
                        <td className="py-3 px-2">
                          <p className="font-semibold text-text">{appt.patient_name}</p>
                          <span className="text-[10px] text-text/50">Age: {appt.age} | {appt.gender}</span>
                        </td>
                        <td className="py-3 px-2 text-text/80">
                          {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                            appt.status === 'confirmed' ? 'bg-success/20 text-primary-dark' :
                            appt.status === 'completed' ? 'bg-primary/20 text-primary-dark' :
                            appt.status === 'cancelled' ? 'bg-danger/25 text-danger' :
                            'bg-warning/25 text-text-muted'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {appt.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                                  className="p-1.5 bg-success/20 text-primary-dark hover:bg-success hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Confirm"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                                  className="p-1.5 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {appt.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                className="px-2.5 py-1.5 bg-primary text-card hover:bg-primary-dark text-xs font-semibold rounded-lg transition-all cursor-pointer hover-scale"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Patients */}
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-4">Recent patients</h3>
            {patients.length === 0 ? (
              <p className="text-text/60 text-sm italic py-4">No patient charts registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-primary/10 text-xs text-text/60 uppercase">
                      <th className="py-2.5 px-2">Name</th>
                      <th className="py-2.5 px-2">Age</th>
                      <th className="py-2.5 px-2">Gender</th>
                      <th className="py-2.5 px-2">Medical History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5 text-sm">
                    {patients.map((pat) => (
                      <tr key={pat.id} className="hover:bg-background/25">
                        <td className="py-3 px-2 font-semibold text-text">{pat.name}</td>
                        <td className="py-3 px-2 text-text/80">{pat.age}</td>
                        <td className="py-3 px-2 text-text/80">{pat.gender}</td>
                        <td className="py-3 px-2 text-xs italic text-text/70">{pat.medical_history || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right side panel: Quick Actions & Optional Compiler Drawer */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-4">Quick actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowCompiler(!showCompiler)}
                className="w-full py-2.5 bg-primary text-card hover:bg-primary-dark font-bold text-sm rounded-xl transition-all hover-scale cursor-pointer"
              >
                {showCompiler ? 'Hide prescription form' : 'New prescription'}
              </button>
              
              <button
                onClick={() => alert("Clinic notes logging tool is currently under development.")}
                className="w-full py-2.5 bg-[#FFFCF6] border border-primary/25 text-primary font-bold text-sm rounded-xl transition-all hover-scale cursor-pointer"
              >
                Add clinical note
              </button>

              <button
                onClick={() => alert("Gemini Clinical helper is available inside AI Assistant tab.")}
                className="w-full py-2.5 bg-[#FFFCF6] border border-primary/25 text-primary font-bold text-sm rounded-xl transition-all hover-scale cursor-pointer"
              >
                AI clinical assistant
              </button>
            </div>
          </div>

          {/* Issue E-Prescription Form (Collapsible / Toggleable) */}
          {(showCompiler || stats.prescriptionsCount === 0) && (
            <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-bold text-text mb-4 flex items-center space-x-2">
                <FilePlus className="h-5 w-5 text-primary" />
                <span>Issue Prescription</span>
              </h3>

              {prescSuccess && (
                <div className="mb-4 p-3 bg-success/20 border border-success/30 text-primary-dark rounded-xl flex items-center space-x-2 text-xs">
                  <CheckCircle className="h-4 w-4" />
                  <span>{prescSuccess}</span>
                </div>
              )}

              {prescError && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl flex items-center space-x-2 text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <span>{prescError}</span>
                </div>
              )}

              <form onSubmit={handleCreatePrescription} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1" htmlFor="patientSelect">
                    Patient
                  </label>
                  <select
                    id="patientSelect"
                    className="w-full px-3 py-2 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} (Age: {pat.age})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1" htmlFor="medicines">
                    Medicines & Frequency
                  </label>
                  <textarea
                    id="medicines"
                    className="w-full px-3 py-2 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none placeholder-text/40 text-xs"
                    rows="4"
                    placeholder="e.g. Paracetamol 500mg (1-0-1) - 5 days"
                    value={medicines}
                    onChange={(e) => setMedicines(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1" htmlFor="instructions">
                    Instructions
                  </label>
                  <textarea
                    id="instructions"
                    className="w-full px-3 py-2 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none placeholder-text/40 text-xs"
                    rows="2"
                    placeholder="e.g. Take after meals."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={prescLoading}
                  className="w-full py-3 bg-primary text-card hover:bg-primary-dark text-sm font-semibold rounded-xl transition-all shadow-sm hover-scale flex justify-center items-center space-x-1.5 cursor-pointer"
                >
                  {prescLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Prescription</span>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
