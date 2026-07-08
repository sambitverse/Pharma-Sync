import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbQuery } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey12345';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, age, gender, medical_history, specialization } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All general fields are required.' });
  }

  try {
    // Check if user already exists
    const checkUser = await dbQuery('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email address already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const userResult = await dbQuery(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    const user = userResult.rows[0];

    // Role-specific profile insertions
    if (role === 'patient') {
      const patResult = await dbQuery(
        'INSERT INTO patients (user_id, age, gender, medical_history) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.id, age || null, gender || null, medical_history || '']
      );
      user.age = patResult.rows[0].age;
      user.gender = patResult.rows[0].gender;
      user.medical_history = patResult.rows[0].medical_history;
    } else if (role === 'doctor') {
      const docResult = await dbQuery(
        'INSERT INTO doctors (user_id, specialization) VALUES ($1, $2) RETURNING *',
        [user.id, specialization || 'General Practice']
      );
      user.specialization = docResult.rows[0].specialization;
    }

    // Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    // Exclude password from response
    delete user.password;

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await dbQuery('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Load profile specific fields
    if (user.role === 'patient') {
      const pat = await dbQuery('SELECT age, gender, medical_history FROM patients WHERE user_id = $1', [user.id]);
      if (pat.rows.length > 0) {
        user.age = pat.rows[0].age;
        user.gender = pat.rows[0].gender;
        user.medical_history = pat.rows[0].medical_history;
      }
    } else if (user.role === 'doctor') {
      const doc = await dbQuery('SELECT specialization FROM doctors WHERE user_id = $1', [user.id]);
      if (doc.rows.length > 0) {
        user.specialization = doc.rows[0].specialization;
      }
    }

    // Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    delete user.password;

    return res.json({ token, user });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await dbQuery('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = result.rows[0];

    // Load profile details
    if (user.role === 'patient') {
      const pat = await dbQuery('SELECT age, gender, medical_history FROM patients WHERE user_id = $1', [user.id]);
      if (pat.rows.length > 0) {
        user.age = pat.rows[0].age;
        user.gender = pat.rows[0].gender;
        user.medical_history = pat.rows[0].medical_history;
      }
    } else if (user.role === 'doctor') {
      const doc = await dbQuery('SELECT specialization FROM doctors WHERE user_id = $1', [user.id]);
      if (doc.rows.length > 0) {
        user.specialization = doc.rows[0].specialization;
      }
    }

    return res.json({ user });
  } catch (err) {
    console.error("Auth Me Error:", err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, age, gender, medical_history, specialization } = req.body;

  try {
    // Update name
    await dbQuery('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id]);

    // Update specific role fields
    if (req.user.role === 'patient') {
      await dbQuery(
        'UPDATE patients SET age = $1, gender = $2, medical_history = $3 WHERE user_id = $4',
        [age, gender, medical_history, req.user.id]
      );
    } else if (req.user.role === 'doctor') {
      await dbQuery(
        'UPDATE doctors SET specialization = $1 WHERE user_id = $2',
        [specialization, req.user.id]
      );
    }

    // Reload and return updated user
    const result = await dbQuery('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (user.role === 'patient') {
      const pat = await dbQuery('SELECT age, gender, medical_history FROM patients WHERE user_id = $1', [user.id]);
      user.age = pat.rows[0].age;
      user.gender = pat.rows[0].gender;
      user.medical_history = pat.rows[0].medical_history;
    } else if (user.role === 'doctor') {
      const doc = await dbQuery('SELECT specialization FROM doctors WHERE user_id = $1', [user.id]);
      user.specialization = doc.rows[0].specialization;
    }

    return res.json({ user });
  } catch (err) {
    console.error("Profile Update Error:", err);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

export default router;
