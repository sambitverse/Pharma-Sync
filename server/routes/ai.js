import express from 'express';
import { generateHealthReply } from '../services/gemini.js';
import { authenticateToken, isPatient } from '../middleware/auth.js';

const router = express.Router();

// POST /api/ai/chat
// Restricted to patients for health support
router.post('/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Input message is required.' });
  }

  try {
    const reply = await generateHealthReply(message);
    return res.json({ reply });
  } catch (err) {
    console.error("AI Route Error:", err);
    return res.status(500).json({ message: 'Failed to obtain AI response.' });
  }
});

export default router;
