require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');

const viewDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/serveease';
    console.log(`Connecting to: ${mongoUri}\n`);
    await mongoose.connect(mongoUri);

    const [
      users,
      providers,
      categories,
      services,
      bookings,
      reviews,
      notifications,
      complaints,
    ] = await Promise.all([
      User.find().select('name email role phone isActive createdAt'),
      Provider.find().select('businessName verificationStatus averageRating totalReviews serviceAreas'),
      Category.find().select('name description isActive'),
      Service.find().populate('categoryId', 'name').select('title price estimatedDuration isActive'),
      Booking.find().select('bookingId bookingDate timeSlot estimatedPrice bookingStatus paymentStatus paymentMethod'),
      Review.find().populate('providerId', 'businessName').select('rating comment'),
      Notification.find().select('title type isRead'),
      Complaint.find().select('subject status'),
    ]);

    console.log('================================================================');
    console.log(`           SERVEEASE MONGODB DATABASE EXPLORER`);
    console.log(`           Database Name: ${mongoose.connection.name}`);
    console.log('================================================================\n');

    console.log(`📊 1. USERS (${users.length} records):`);
    console.table(
      users.map((u) => ({
        ID: u._id.toString().slice(-6),
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Phone: u.phone,
        Active: u.isActive,
      }))
    );

    console.log(`\n🏢 2. PROVIDERS (${providers.length} records):`);
    console.table(
      providers.map((p) => ({
        ID: p._id.toString().slice(-6),
        Business: p.businessName,
        Status: p.verificationStatus,
        Rating: p.averageRating,
        Reviews: p.totalReviews,
        Areas: p.serviceAreas.slice(0, 2).join(', '),
      }))
    );

    console.log(`\n🏷️  3. CATEGORIES (${categories.length} records):`);
    console.table(
      categories.map((c) => ({
        Name: c.name,
        Active: c.isActive,
        Description: c.description.slice(0, 45) + '...',
      }))
    );

    console.log(`\n⚡ 4. SERVICES (${services.length} records):`);
    console.table(
      services.map((s) => ({
        ID: s._id.toString().slice(-6),
        Title: s.title.slice(0, 32),
        Category: s.categoryId?.name,
        Price: `₹${s.price}`,
        Duration: s.estimatedDuration,
        Active: s.isActive,
      }))
    );

    console.log(`\n📅 5. BOOKINGS (${bookings.length} records):`);
    console.table(
      bookings.map((b) => ({
        BookingID: b.bookingId,
        Date: b.bookingDate,
        Slot: b.timeSlot.slice(0, 15),
        Price: `₹${b.estimatedPrice}`,
        Status: b.bookingStatus,
        Payment: b.paymentStatus,
      }))
    );

    console.log(`\n⭐ 6. REVIEWS (${reviews.length} records):`);
    console.table(
      reviews.map((r) => ({
        Provider: r.providerId?.businessName,
        Rating: `⭐ ${r.rating}`,
        Comment: r.comment.slice(0, 45) + '...',
      }))
    );

    console.log(`\n🔔 7. NOTIFICATIONS (${notifications.length} records)`);
    console.log(`⚖️  8. COMPLAINTS (${complaints.length} records)`);

    console.log('\n================================================================');
    console.log('MongoDB connection active and verified.');
    console.log('================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to view database:', error.message);
    process.exit(1);
  }
};

viewDb();

