// Import all models here to ensure they're registered
import User from '@/models/User';
import Photo from '@/models/Photo';
import Comment from '@/models/Comment';

// Export models to ensure they're included in the bundle
export { User, Photo, Comment };

// This function doesn't do anything but forces the import of all models
export function ensureModelsAreRegistered() {
  // Simply accessing the models ensures they're registered with Mongoose
  // This is just to make the imports above meaningful to the TypeScript compiler
  return { User, Photo, Comment };
} 