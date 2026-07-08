import express from 'express';
import { dbQuery } from '../config/db.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/medicines
// Open to all authenticated users (Doctors, patients, admins can check stock)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await dbQuery('SELECT * FROM medicines');
    return res.json(result.rows);
  } catch (err) {
    console.error("Fetch Medicines Error:", err);
    return res.status(500).json({ message: 'Failed to retrieve medicine stock.' });
  }
});

// POST /api/medicines
// Add new medicine (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name, quantity } = req.body;

  if (!name || quantity === undefined) {
    return res.status(400).json({ message: 'Medicine name and quantity are required.' });
  }

  try {
    const result = await dbQuery(
      'INSERT INTO medicines (name, quantity) VALUES ($1, $2) RETURNING *',
      [name, parseInt(quantity)]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add Medicine Error:", err);
    if (err.message && err.message.includes('already exists')) {
      return res.status(400).json({ message: 'Medicine name already exists in inventory.' });
    }
    return res.status(500).json({ message: 'Failed to add medicine to inventory.' });
  }
});

// PUT /api/medicines/:id
// Update medicine stock quantity (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: 'Valid quantity is required.' });
  }

  try {
    const result = await dbQuery(
      'UPDATE medicines SET quantity = $1 WHERE id = $2 RETURNING *',
      [parseInt(quantity), id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Medicine not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Medicine Error:", err);
    return res.status(500).json({ message: 'Failed to update medicine stock.' });
  }
});

// DELETE /api/medicines/:id
// Delete medicine (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await dbQuery('DELETE FROM medicines WHERE id = $1', [id]);
    return res.json({ message: 'Medicine successfully removed from stock.' });
  } catch (err) {
    console.error("Delete Medicine Error:", err);
    return res.status(500).json({ message: 'Failed to remove medicine.' });
  }
});

export default router;
