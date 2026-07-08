import express from 'express';
import { dbQuery } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/appointments
// Returns appointments for the currently logged-in user with joined names
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    if (role === 'patient') {
      // Find patient profile id
      const patRes = await dbQuery('SELECT id FROM patients WHERE user_id = $1', [userId]);
      if (patRes.rows.length === 0) {
        return res.json([]);
      }
      const patientId = patRes.rows[0].id;
      
      const result = await dbQuery(`
        SELECT a.id, a.date, a.status, u.name AS doctor_name, d.specialization 
        FROM appointments a 
        JOIN doctors d ON a.doctor_id = d.id 
        JOIN users u ON d.user_id = u.id 
        WHERE a.patient_id = $1 
        ORDER BY a.date DESC
      `, [patientId]);
      
      return res.json(result.rows);
    } 
    
    else if (role === 'doctor') {
      // Find doctor profile id
      const docRes = await dbQuery('SELECT id FROM doctors WHERE user_id = $1', [userId]);
      if (docRes.rows.length === 0) {
        return res.json([]);
      }
      const doctorId = docRes.rows[0].id;

      const result = await dbQuery(`
        SELECT a.id, a.date, a.status, u.name AS patient_name, p.age, p.gender, p.medical_history 
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id 
        JOIN users u ON p.user_id = u.id 
        WHERE a.doctor_id = $1 
        ORDER BY a.date DESC
      `, [doctorId]);

      return res.json(result.rows);
    } 
    
    else if (role === 'admin') {
      const result = await dbQuery(`
        SELECT a.id, a.date, a.status, up.name AS patient_name, ud.name AS doctor_name 
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id 
        JOIN users up ON p.user_id = up.id 
        JOIN doctors d ON a.doctor_id = d.id 
        JOIN users ud ON d.user_id = ud.id 
        ORDER BY a.date DESC
      `);
      return res.json(result.rows);
    }

    return res.status(400).json({ message: 'Invalid user role.' });
  } catch (err) {
    console.error("Fetch Appointments Error:", err);
    return res.status(500).json({ message: 'Failed to retrieve appointments.' });
  }
});

// POST /api/appointments
// Creates a new appointment (Patient only)
router.post('/', authenticateToken, async (req, res) => {
  const { doctor_id, date } = req.body;

  if (!doctor_id || !date) {
    return res.status(400).json({ message: 'Doctor and date/time are required.' });
  }

  try {
    const { id: userId, role } = req.user;

    if (role !== 'patient') {
      return res.status(403).json({ message: 'Access denied: Only patients can book appointments.' });
    }

    // Resolve patient profile id
    const patRes = await dbQuery('SELECT id FROM patients WHERE user_id = $1', [userId]);
    if (patRes.rows.length === 0) {
      return res.status(400).json({ message: 'Patient profile not found. Please complete registration.' });
    }
    const patientId = patRes.rows[0].id;

    const result = await dbQuery(
      'INSERT INTO appointments (patient_id, doctor_id, date) VALUES ($1, $2, $3) RETURNING *',
      [patientId, doctor_id, date]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Appointment Error:", err);
    return res.status(500).json({ message: 'Failed to schedule appointment.' });
  }
});

// PUT /api/appointments/:id
// Updates status (Doctor only)
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    const result = await dbQuery(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Appointment Error:", err);
    return res.status(500).json({ message: 'Failed to update appointment.' });
  }
});

export default router;
