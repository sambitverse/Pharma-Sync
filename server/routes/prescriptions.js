import express from 'express';
import { dbQuery } from '../config/db.js';
import { authenticateToken, isDoctor } from '../middleware/auth.js';

const router = express.Router();

// GET /api/prescriptions
// Returns prescriptions list for the logged-in user with joined names
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
        SELECT pr.id, pr.medicines, pr.notes, pr.created_at, u.name AS doctor_name, d.specialization 
        FROM prescriptions pr 
        JOIN doctors d ON pr.doctor_id = d.id 
        JOIN users u ON d.user_id = u.id 
        WHERE pr.patient_id = $1 
        ORDER BY pr.created_at DESC
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
        SELECT pr.id, pr.medicines, pr.notes, pr.created_at, u.name AS patient_name 
        FROM prescriptions pr 
        JOIN patients p ON pr.patient_id = p.id 
        JOIN users u ON p.user_id = u.id 
        WHERE pr.doctor_id = $1 
        ORDER BY pr.created_at DESC
      `, [doctorId]);

      return res.json(result.rows);
    }

    return res.status(400).json({ message: 'Invalid user role.' });
  } catch (err) {
    console.error("Fetch Prescriptions Error:", err);
    return res.status(500).json({ message: 'Failed to retrieve prescriptions.' });
  }
});

// POST /api/prescriptions
// Creates a new digital prescription (Doctor only)
router.post('/', authenticateToken, isDoctor, async (req, res) => {
  const { patient_id, medicines, notes } = req.body;

  if (!patient_id || !medicines) {
    return res.status(400).json({ message: 'Patient selection and medicines list are required.' });
  }

  try {
    const { id: userId } = req.user;

    // Resolve doctor profile id from doctors table
    const docRes = await dbQuery('SELECT id FROM doctors WHERE user_id = $1', [userId]);
    if (docRes.rows.length === 0) {
      return res.status(400).json({ message: 'Doctor profile not found.' });
    }
    const doctorId = docRes.rows[0].id;

    const result = await dbQuery(
      'INSERT INTO prescriptions (patient_id, doctor_id, medicines, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [patient_id, doctorId, medicines, notes]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Prescription Error:", err);
    return res.status(500).json({ message: 'Failed to create digital prescription.' });
  }
});

export default router;
