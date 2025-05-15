import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fd993c0cdca553e5827c77ea0c3aba991a4725d254f121f00e28e971b3b189e4efd7a915a98f9cb882df4bfd3e2eaa1e8e81aedae689db813e73fb272392ddef8253e4022ef9bec3bfe5df5e6b4696feb341189d3cf31ae3cda61a02c85bbc8735b1cd414c6393bf47819babede9929a047a029068d86a07fa6fa4e1228beeff981841286c032ec7205c33ee1d1aecc6c983a6a35125184e12ec2076e7d26bd709d5967b094ca2075875165b9406a3d583ffbf66babb0659b06026b4c29b27597768aed926ee7f3bbdb8d20ad4cf067682327c645a94ff75a3359f8e4b6de9197f3d73eea52849d97f9af1dee037b33afa9f0b491b808cb95780f10e5287bd42');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.error('User not found for token:', decoded.userId);
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Middleware to check if user is faculty
const isFaculty = (req, res, next) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ message: 'Access denied. Faculty only.' });
  }
  next();
};

export { auth, isFaculty };