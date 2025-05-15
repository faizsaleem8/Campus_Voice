import express from 'express';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role must be either student or faculty').isIn(['student', 'faculty']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      user = new User({
        name,
        email,
        password,
        role,
      });

      await user.save();

      const payload = {
        userId: user.id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'fd993c0cdca553e5827c77ea0c3aba991a4725d254f121f00e28e971b3b189e4efd7a915a98f9cb882df4bfd3e2eaa1e8e81aedae689db813e73fb272392ddef8253e4022ef9bec3bfe5df5e6b4696feb341189d3cf31ae3cda61a02c85bbc8735b1cd414c6393bf47819babede9929a047a029068d86a07fa6fa4e1228beeff981841286c032ec7205c33ee1d1aecc6c983a6a35125184e12ec2076e7d26bd709d5967b094ca2075875165b9406a3d583ffbf66babb0659b06026b4c29b27597768aed926ee7f3bbdb8d20ad4cf067682327c645a94ff75a3359f8e4b6de9197f3d73eea52849d97f9af1dee037b33afa9f0b491b808cb95780f10e5287bd42', { expiresIn: '24h' });

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const payload = {
        userId: user.id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'fd993c0cdca553e5827c77ea0c3aba991a4725d254f121f00e28e971b3b189e4efd7a915a98f9cb882df4bfd3e2eaa1e8e81aedae689db813e73fb272392ddef8253e4022ef9bec3bfe5df5e6b4696feb341189d3cf31ae3cda61a02c85bbc8735b1cd414c6393bf47819babede9929a047a029068d86a07fa6fa4e1228beeff981841286c032ec7205c33ee1d1aecc6c983a6a35125184e12ec2076e7d26bd709d5967b094ca2075875165b9406a3d583ffbf66babb0659b06026b4c29b27597768aed926ee7f3bbdb8d20ad4cf067682327c645a94ff75a3359f8e4b6de9197f3d73eea52849d97f9af1dee037b33afa9f0b491b808cb95780f10e5287bd42', { expiresIn: '24h' });

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Get authenticated user
router.get('/user', auth, async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };
    
    res.json({ user });
  } catch (err) {
    console.error('Error retrieving user:', err);
    res.status(500).send('Server error');
  }
});

export default router;