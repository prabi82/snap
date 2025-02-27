import { connectMongoose } from './mongodb';
import User from '../models/User';
import Photo from '../models/Photo';
import Comment from '../models/Comment';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoose();
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Photo.deleteMany({});
    await Comment.deleteMany({});
    console.log('Existing data cleared.');

    // Create users
    console.log('Creating users...');
    const adminPassword = await bcrypt.hash('password123', 10);
    const user1Password = await bcrypt.hash('userpass123', 10);
    const user2Password = await bcrypt.hash('userpass456', 10);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword
    });

    const user1 = await User.create({
      username: 'johnsmith',
      email: 'john@example.com',
      password: user1Password
    });

    const user2 = await User.create({
      username: 'sarahjones',
      email: 'sarah@example.com',
      password: user2Password
    });

    console.log('Users created.');

    // Create photos
    console.log('Creating photos...');
    const photo1 = await Photo.create({
      title: 'Beautiful Sunset',
      description: 'A stunning sunset over the ocean',
      imageUrl: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7',
      votes: 12,
      user: admin._id
    });

    const photo2 = await Photo.create({
      title: 'Mountain Landscape',
      description: 'Majestic mountains in the morning',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      votes: 8,
      user: user1._id
    });

    const photo3 = await Photo.create({
      title: 'City Lights',
      description: 'Night cityscape with beautiful lights',
      imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
      votes: 15,
      user: user2._id
    });

    console.log('Photos created.');

    // Create comments
    console.log('Creating comments...');
    await Comment.create({
      content: 'This is absolutely gorgeous!',
      photo: photo1._id,
      user: user1._id
    });

    await Comment.create({
      content: 'What camera did you use?',
      photo: photo1._id,
      user: user2._id
    });

    await Comment.create({
      content: 'I love the colors!',
      photo: photo2._id,
      user: admin._id
    });

    await Comment.create({
      content: 'Beautiful composition',
      photo: photo3._id,
      user: user1._id
    });

    console.log('Comments created.');
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase; 