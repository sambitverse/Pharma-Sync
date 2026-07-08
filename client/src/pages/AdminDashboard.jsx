import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, AlertTriangle, Package, Plus, Loader, Trash, RefreshCw, HeartPulse } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Dashboard stats
  const [stats, setStats] = useState({
    patientsCount: 0,
    doctorsCount: 0,
    appointmentsCount: 0,
    lowStockCount: 0,
  });

  // Data lists
  const [medicines, setMedicines] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedQty, setNewMedQty] = useState('');
  const [loading, setLoading] = useState(true);
  const [medLoading, setMedLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, medsRes, apptsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/medicines'),
        api.get('/appointments') // Fetch appointments for list
      ]);
      setStats(statsRes.data);
      setMedicines(medsRes.data);
      
      // Seed details for recent appointments list
      setRecentAppointments(apptsRes.data.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!newMedName || !newMedQty) {
      setErrorMessage('Please fill in name and quantity.');
      return;
    }

    setMedLoading(true);
    try {
      await api.post('/medicines', {
        name: newMedName,
        quantity: parseInt(newMedQty),
      });
      setNewMedName('');
      setNewMedQty('');
      setShowAddForm(false);
      fetchData(); // Reload stats and inventory list
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to add medicine.');
    } finally {
      setMedLoading(false);
    }
  };

  const handleUpdateQuantity = async (medId, newQty) => {
    if (newQty < 0) return;
    try {
      await api.put(`/medicines/${medId}`, { quantity: newQty });
      setMedicines(medicines.map(m => m.id === medId ? { ...m, quantity: newQty } : m));
      // Re-fetch stats quietly to update lowStock count
      api.get('/admin/stats').then(res => setStats(res.data));
    } catch (err) {
      alert('Failed to update stock quantity.');
    }
  };

  const handleDeleteMedicine = async (medId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await api.delete(`/medicines/${medId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete medicine.');
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-wider">Admin Dashboard</span>
          <h2 className="text-3xl font-extrabold text-text mt-1">Welcome back, Admin 👋</h2>
          <p className="text-text/70 text-sm mt-1">Here's the clinic overview for today.</p>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchData(); }}
          className="p-2 border border-primary/20 text-primary rounded-xl hover:bg-background hover-scale transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Row of stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total patients */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Total patients</span>
            <span className="text-2xl font-extrabold text-text">{stats.patientsCount}</span>
          </div>
        </div>

        {/* Doctors */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Doctors</span>
            <span className="text-2xl font-extrabold text-text">{stats.doctorsCount}</span>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Appointments</span>
            <span className="text-2xl font-extrabold text-text">{stats.appointmentsCount}</span>
            <span className="text-[10px] text-text/50">This week</span>
          </div>
        </div>

        {/* Low-stock meds */}
        <div className="bg-card border border-primary/10 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stats.lowStockCount > 0 ? 'bg-danger/10 text-danger animate-pulse' : 'bg-primary/15 text-primary'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-text/60 font-semibold block">Low-stock meds</span>
            <span className="text-2xl font-extrabold text-text">{stats.lowStockCount}</span>
          </div>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Appointments table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-4">Recent appointments</h3>
            {recentAppointments.length === 0 ? (
              <p className="text-text/60 text-sm italic py-4">No appointments recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-primary/10 text-xs text-text/60 uppercase">
                      <th className="py-2.5 px-2">Patient</th>
                      <th className="py-2.5 px-2">Doctor</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5 text-sm">
                    {recentAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-background/25">
                        <td className="py-3 px-2 font-semibold text-text">{appt.patient_name || 'John Doe'}</td>
                        <td className="py-3 px-2 text-text/80">Dr. {appt.doctor_name || 'Gregory House'}</td>
                        <td className="py-3 px-2 text-text/80">{new Date(appt.date).toISOString().split('T')[0]}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right side panel: Quick Actions & Forms */}
        <div className="space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-4">Quick actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => alert("To add a doctor/patient user, simply create an account on the Sign Up screen.")}
                className="w-full py-2.5 bg-primary text-card hover:bg-primary-dark font-bold text-sm rounded-xl transition-all hover-scale cursor-pointer"
              >
                + Add user
              </button>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full py-2.5 bg-[#FFFCF6] border border-primary/25 text-primary font-bold text-sm rounded-xl transition-all hover-scale cursor-pointer"
              >
                {showAddForm ? 'Hide stock form' : '+ Add medicine'}
              </button>

              <button
                onClick={() => alert("Report generation tool is under development.")}
                className="w-full py-2.5 bg-[#FFFCF6] border border-primary/25 text-primary font-bold text-sm rounded-xl transition-all hover-scale cursor-pointer"
              >
                Generate report
              </button>
            </div>
          </div>

          {/* Add Medicine Form Card (Collapsible) */}
          {(showAddForm || medicines.length === 0) && (
            <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-bold text-text mb-4 flex items-center space-x-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Add Medicine</span>
              </h3>

              {errorMessage && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl flex items-center space-x-2 text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleAddMedicine} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1" htmlFor="medName">
                    Medicine / Item Name
                  </label>
                  <input
                    id="medName"
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none placeholder-text/40"
                    placeholder="e.g. Paracetamol 500mg"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1" htmlFor="medQty">
                    Stock Quantity
                  </label>
                  <input
                    id="medQty"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none placeholder-text/40"
                    placeholder="e.g. 100"
                    value={newMedQty}
                    onChange={(e) => setNewMedQty(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={medLoading}
                  className="w-full py-2.5 bg-primary text-card hover:bg-primary-dark text-sm font-semibold rounded-xl transition-all shadow-sm hover-scale flex justify-center items-center space-x-1.5 cursor-pointer"
                >
                  {medLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Medicine</span>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Full Width Medicine Inventory Section */}
      <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-text mb-6 flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <span>Medicine stock</span>
        </h3>

        {medicines.length === 0 ? (
          <p className="text-text/60 text-sm italic py-4">No medicines registered in stock.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-xs text-text/60 uppercase">
                  <th className="py-3 px-2">Medicine</th>
                  <th className="py-3 px-2">Stock</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {medicines.map((med) => {
                  const isLow = med.quantity <= 10;
                  const isCritical = med.quantity <= 0;
                  return (
                    <tr key={med.id} className="hover:bg-background/25">
                      <td className="py-3 px-2 font-semibold text-text">{med.name}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(med.id, med.quantity - 1)}
                            className="w-6 h-6 bg-background rounded hover:bg-primary/20 text-xs font-bold transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-bold w-8 text-center text-text">{med.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(med.id, med.quantity + 1)}
                            className="w-6 h-6 bg-background rounded hover:bg-primary/20 text-xs font-bold transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {isCritical ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold text-white bg-danger rounded-full uppercase tracking-wider">
                            Critical
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold text-[#b45309] bg-warning/30 border border-[#b45309]/30 rounded-full uppercase tracking-wider">
                            Low
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold text-primary-dark bg-success/20 rounded-full uppercase tracking-wider">
                            In stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleDeleteMedicine(med.id)}
                          className="p-1.5 text-danger/80 hover:text-white hover:bg-danger rounded-lg transition-colors cursor-pointer inline-block"
                          title="Remove Medicine"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
