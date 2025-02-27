import mongoose from 'mongoose';

// Define the Photo schema
const PhotoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  votes: {
    type: Number,
    default: 0,
    min: [0, 'Votes cannot be negative']
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
PhotoSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Create virtual property for getting comments
PhotoSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'photo'
});

// Configure schema options
PhotoSchema.set('toJSON', { virtuals: true });
PhotoSchema.set('toObject', { virtuals: true });

// Create the model if it doesn't exist already
const Photo = mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);

export default Photo; 