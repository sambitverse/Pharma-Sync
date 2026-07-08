import express from 'express';
import { dbQuery } from '../config/db.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/stats
// Restricted to Administrator
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [patientsResult, doctorsResult, appointmentsResult, lowStockResult] = await Promise.all([
      dbQuery('SELECT COUNT(*) FROM patients'),
      dbQuery('SELECT COUNT(*) FROM doctors'),
      dbQuery('SELECT COUNT(*) FROM appointments'),
      dbQuery('SELECT COUNT(*) FROM medicines WHERE quantity <= 10')
    ]);

    return res.json({
      patientsCount: parseInt(patientsResult.rows[0].count || 0),
      doctorsCount: parseInt(doctorsResult.rows[0].count || 0),
      appointmentsCount: parseInt(appointmentsResult.rows[0].count || 0),
      lowStockCount: parseInt(lowStockResult.rows[0].count || 0)
    });
  } catch (err) {
    console.error("Fetch Admin Stats Error:", err);
    return res.status(500).json({ message: 'Failed to load system metrics.' });
  }
});

export default router;
