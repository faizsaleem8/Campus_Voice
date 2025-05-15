import express from 'express';
import { check, validationResult } from 'express-validator';
import Complaint from '../models/Complaint.js';
import Comment from '../models/Comment.js';
import { auth, isFaculty } from '../middleware/auth.js';

const router = express.Router();

// Get all public complaints
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, sort = 'newest' } = req.query;
    
    // Build filter object
    const filter = { status: { $ne: 'resolved' } }; // Exclude resolved complaints
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Build sort object
    let sortOptions = {};
    
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'most-votes':
        sortOptions = { votes: -1, createdAt: -1 };
        break;
      case 'least-votes':
        sortOptions = { votes: 1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
    }
    
    const complaints = await Complaint.find(filter)
      .select('-voters') // Exclude voters array
      .sort(sortOptions)
      .lean();
    
    // For each complaint, count its comments
    const complaintsWithCommentCount = await Promise.all(
      complaints.map(async (complaint) => {
        const commentCount = await Comment.countDocuments({ complaint: complaint._id });
        return {
          ...complaint,
          comments: commentCount,
        };
      })
    );
    
    res.json(complaintsWithCommentCount);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).send('Server error');
  }
});

// Get all complaints for faculty
router.get('/all', auth, isFaculty, async (req, res) => {
  try {
    const { category, status, sort = 'newest' } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Build sort object
    let sortOptions = {};
    
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'most-votes':
        sortOptions = { votes: -1, createdAt: -1 };
        break;
      case 'least-votes':
        sortOptions = { votes: 1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
    }
    
    const complaints = await Complaint.find(filter)
      .select('-voters') // Exclude voters array
      .sort(sortOptions)
      .lean();
    
    // For each complaint, count its comments
    const complaintsWithCommentCount = await Promise.all(
      complaints.map(async (complaint) => {
        const commentCount = await Comment.countDocuments({ complaint: complaint._id });
        return {
          ...complaint,
          comments: commentCount,
        };
      })
    );
    
    res.json(complaintsWithCommentCount);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user's own complaints
router.get('/user', auth, async (req, res) => {
  try {
    const { status, sort = 'newest' } = req.query;
    
    // Build filter object
    const filter = { author: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    // Build sort object
    let sortOptions = {};
    
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
    }
    
    const complaints = await Complaint.find(filter)
      .select('-voters') // Exclude voters array
      .sort(sortOptions)
      .lean();
    
    // For each complaint, count its comments
    const complaintsWithCommentCount = await Promise.all(
      complaints.map(async (complaint) => {
        const commentCount = await Comment.countDocuments({ complaint: complaint._id });
        return {
          ...complaint,
          comments: commentCount,
        };
      })
    );
    
    res.json(complaintsWithCommentCount);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a single complaint by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.query.id).select('-voters');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    const commentCount = await Comment.countDocuments({ complaint: complaint._id });
    
    res.json({
      ...complaint.toObject(),
      comments: commentCount,
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// Create a new complaint
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, category, isAnonymous = true } = req.body;

      const newComplaint = new Complaint({
        title,
        description,
        category,
        author: req.user._id,
        isAnonymous,
      });

      const complaint = await newComplaint.save();
      res.json(complaint);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Vote on a complaint
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if user has already voted
    if (complaint.voters.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already voted on this complaint' });
    }
    
    // Add vote and user to voters array
    complaint.votes += 1;
    complaint.voters.push(req.user._id);
    
    await complaint.save();
    
    res.json({ votes: complaint.votes });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// Update complaint status (faculty only)
router.patch('/:id/status', auth, isFaculty, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in-progress', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaint.status = status;
    await complaint.save();
    
    res.json({ status: complaint.status });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// Get comments for a complaint
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ complaint: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: 1 });
    
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a comment to a complaint
router.post(
  '/:id/comments',
  [
    auth,
    [
      check('text', 'Comment text is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const complaint = await Complaint.findById(req.params.id);
      
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      const { text, isAnonymous = true } = req.body;
      
      const newComment = new Comment({
        complaint: req.params.id,
        author: req.user._id,
        text,
        isAnonymous,
      });
      
      const comment = await newComment.save();
      
      // Populate author information
      await comment.populate('author', 'name');
      
      res.json(comment);
    } catch (err) {
      console.error(err.message);
      
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      res.status(500).send('Server error');
    }
  }
);

export default router;