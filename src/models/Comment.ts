import mongoose from 'mongoose';

// Define the Comment schema
const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  // Reference to the Photo model
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
    required: [true, 'Photo is required']
  },
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-update hook to update the updatedAt field
CommentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Create the model if it doesn't exist already
const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

export default Comment; 