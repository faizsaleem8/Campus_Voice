import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  complaintTitle: {
    type: String,
    required: true,
  },
  newStatus: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 