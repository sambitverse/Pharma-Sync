import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, Bot, Plus, Loader, CheckCircle, AlertCircle, Heart, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({
    upcomingVisits: 0,
    activePrescriptions: 0,
    heartRate: '72 bpm',
    doctorsCount: 0
  });

  // Book Appointment form states
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [apptsRes, prescRes, docsRes, statsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/prescriptions'),
        api.get('/doctors'),
        api.get('/patients/stats')
      ]);
      setAppointments(apptsRes.data);
      setPrescriptions(prescRes.data);
      setDoctors(docsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      setBookingError('Please fill in all booking fields.');
      return;
    }

    setBookingLoading(true);
    try {
      const dateString = `${appointmentDate}T${appointmentTime}:00`;
      await api.post('/appointments', {
        doctor_id: selectedDoctor,
        date: dateString,
      });
      setBookingSuccess('Appointment requested successfully!');
      setSelectedDoctor('');
      setAppointmentDate('');
      setAppointmentTime('');
      fetchData(); // Refresh lists
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
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
      {/* Welcome Banner */}
      <div className="mb-8">
        <span className="text-primary font-bold text-xs uppercase tracking-wider">Patient Dashboard</span>
        <h2 className="text-3xl font-extrabold text-text mt-1">Welcome back, {user.name} 👋</h2>
        <p className="text-text/70 text-sm mt-1">Here's a quick look at your health today.</p>
      </div>

      {/* Row of stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Upcoming visits */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Upcoming visits</span>
            <span className="text-2xl font-extrabold text-text">{stats.upcomingVisits}</span>
          </div>
        </div>

        {/* Active prescriptions */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Active prescriptions</span>
            <span className="text-2xl font-extrabold text-text">{stats.activePrescriptions}</span>
          </div>
        </div>

        {/* Heart rate */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center animate-pulse">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Heart rate</span>
            <span className="text-2xl font-extrabold text-text">{stats.heartRate}</span>
            <span className="text-[10px] text-success font-semibold">Normal</span>
          </div>
        </div>

        {/* Doctors count */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Doctors</span>
            <span className="text-2xl font-extrabold text-text">{stats.doctorsCount}</span>
          </div>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left main grids: Appointments & Prescriptions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Appointments List */}
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-text flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Recent appointments</span>
              </h3>
            </div>

            {appointments.length === 0 ? (
              <p className="text-text/60 text-sm italic py-4">No appointments scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-primary/10 text-xs text-text/60 uppercase">
                      <th className="py-2.5 px-2">Doctor</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Time</th>
                      <th className="py-2.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5 text-sm">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-background/25">
                        <td className="py-3 px-2 font-semibold text-text">Dr. {appt.doctor_name}</td>
                        <td className="py-3 px-2 text-text/80">{new Date(appt.date).toISOString().split('T')[0]}</td>
                        <td className="py-3 px-2 text-text/80">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                            appt.status === 'confirmed' ? 'bg-success/20 text-primary-dark' :
                            appt.status === 'completed' ? 'bg-primary/20 text-primary-dark' :
                            appt.status === 'cancelled' ? 'bg-danger/25 text-danger' :
                            'bg-warning/25 text-text-muted'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Prescriptions List */}
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Prescriptions List</span>
            </h3>

            {prescriptions.length === 0 ? (
              <p className="text-text/60 text-sm italic py-4">No active prescriptions.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {prescriptions.map((presc) => (
                  <div key={presc.id} className="bg-background/40 border border-primary/10 rounded-xl p-4 flex flex-col justify-between hover-scale">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-text text-sm">Dr. {presc.doctor_name}</h4>
                        <span className="text-[10px] text-text/50">{new Date(presc.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-primary font-medium">{presc.specialization}</p>
                      
                      <div className="mt-3">
                        <span className="text-xs font-bold text-text/80 uppercase">Prescribed Medicines:</span>
                        <p className="text-sm font-semibold text-primary-dark mt-0.5 whitespace-pre-wrap">{presc.medicines}</p>
                      </div>

                      {presc.notes && (
                        <div className="mt-2.5 border-t border-primary/5 pt-2">
                          <span className="text-[10px] font-bold text-text/60">Instructions:</span>
                          <p className="text-xs text-text/75 italic mt-0.5">{presc.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right side panel: Book Appointment & Quick Actions */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-4">Quick actions</h3>
            <div className="space-y-3">
              <Link 
                to="/ai-assistant"
                className="w-full py-2.5 bg-success/20 hover:bg-success/30 text-primary-dark text-center font-bold text-sm rounded-xl block transition-colors hover-scale"
              >
                Ask the AI assistant
              </Link>
              <Link 
                to="/profile"
                className="w-full py-2.5 bg-primary/10 hover:bg-primary/25 text-primary font-bold text-center text-sm rounded-xl block transition-colors hover-scale"
              >
                Update profile
              </Link>
            </div>
          </div>

          {/* Book Appointment Card */}
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Book Appointment</span>
            </h3>

            {bookingSuccess && (
              <div className="mb-4 p-3 bg-success/20 border border-success/30 text-primary-dark rounded-xl flex items-center space-x-2 text-xs">
                <CheckCircle className="h-4 w-4" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            {bookingError && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl flex items-center space-x-2 text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1" htmlFor="docSelect">
                  Doctor
                </label>
                <select
                  id="docSelect"
                  className="w-full px-3 py-2.5 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1" htmlFor="apptDate">
                  Date
                </label>
                <input
                  id="apptDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1" htmlFor="apptTime">
                  Time
                </label>
                <input
                  id="apptTime"
                  type="time"
                  className="w-full px-3 py-2.5 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3 bg-primary text-card hover:bg-primary-dark text-sm font-semibold rounded-xl transition-all shadow-sm hover-scale flex justify-center items-center space-x-1.5 cursor-pointer"
              >
                {bookingLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <span>Book new</span>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
