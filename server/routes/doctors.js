import express from 'express';
import { dbQuery } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/doctors/stats
router.get('/stats', authenticateToken, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctor role required.' });
  }
  try {
    const docRes = await dbQuery('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
    if (docRes.rows.length === 0) {
      return res.status(200).json({ todaysVisits: 0, activePatients: 0, pendingReports: 0, prescriptionsCount: 0 });
    }
    const doctorId = docRes.rows[0].id;

    const [visitsRes, patientsRes, pendingRes, prescRes] = await Promise.all([
      dbQuery("SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND date::date = CURRENT_DATE", [doctorId]),
      dbQuery('SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1', [doctorId]),
      dbQuery("SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'pending'", [doctorId]),
      dbQuery('SELECT COUNT(*) FROM prescriptions WHERE doctor_id = $1', [doctorId])
    ]);

    return res.json({
      todaysVisits: parseInt(visitsRes.rows[0].count || 0),
      activePatients: parseInt(patientsRes.rows[0].count || 0),
      pendingReports: parseInt(pendingRes.rows[0].count || 0),
      prescriptionsCount: parseInt(prescRes.rows[0].count || 0)
    });
  } catch (err) {
    console.error("Doctor Stats Error:", err);
    return res.status(500).json({ message: 'Failed to retrieve stats.' });
  }
});

// GET /api/doctors
// Return lists of doctors for appointment booking
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await dbQuery(
      'SELECT d.id, u.name, d.specialization FROM doctors d JOIN users u ON d.user_id = u.id'
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Fetch Doctors Error:", err);
    return res.status(500).json({ message: 'Failed to load doctors list.' });
  }
});

export default router;
