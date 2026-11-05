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

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/serveease';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding.');

    // Clear existing collections
    await User.deleteMany();
    await Provider.deleteMany();
    await Category.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();
    await Complaint.deleteMany();

    console.log('Cleared existing data.');

    // 1. Create Administrator
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@serveease.com',
      password: 'Admin@123456',
      phone: '+91 9876543210',
      role: 'admin',
      address: {
        street: 'Collectorate Road',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522004',
        country: 'India',
      },
    });
    console.log('Admin account created: admin@serveease.com');

    // 2. Create Categories
    const categoriesData = [
      {
        name: 'Electrician',
        description: 'Wiring, switchboard installation, appliance repair, fuse fix & emergency electrical repairs.',
        image: 'Zap',
      },
      {
        name: 'Plumbing',
        description: 'Leak repair, pipe fitting, faucet replacement, drain unclogging & bathroom installations.',
        image: 'Wrench',
      },
      {
        name: 'AC & Appliance Repair',
        description: 'Air conditioner servicing, gas charging, refrigerator, washing machine & microwave care.',
        image: 'Tv',
      },
      {
        name: 'Home Deep Cleaning',
        description: 'Full house cleaning, kitchen degreasing, bathroom scrubbing, sofa & carpet shampooing.',
        image: 'Sparkles',
      },
      {
        name: 'Carpentry',
        description: 'Furniture assembly, modular kitchen fixes, door lock installation & custom woodwork.',
        image: 'Hammer',
      },
      {
        name: 'Painting & Wall Care',
        description: 'Interior & exterior painting, water-proofing, texture finish & wall stencil design.',
        image: 'Paintbrush',
      },
      {
        name: 'Vehicle & Mechanic Care',
        description: 'Two-wheeler and four-wheeler doorstep maintenance, battery jumpstart & oil replacement.',
        image: 'Car',
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`Created ${categories.length} categories.`);

    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    // 3. Create Sample Providers & Provider Users
    // Provider 1: Electrician
    const userP1 = await User.create({
      name: 'Ramesh Kumar',
      email: 'ramesh.electrician@serveease.com',
      password: 'Provider@123',
      phone: '+91 9848011223',
      role: 'provider',
      address: {
        street: '4th Line, Brodipet',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522002',
      },
    });

    const provider1 = await Provider.create({
      userId: userP1._id,
      businessName: 'Sri Venkateswara Electrical Works',
      description: 'Certified electrical contractors with 8+ years of expertise in residential & commercial wiring in Guntur.',
      experience: 8,
      serviceAreas: ['Guntur', 'Brodipet', 'Arundelpet', 'Lakshmipuram', 'Amaravati'],
      verificationStatus: 'approved',
      averageRating: 4.9,
      totalReviews: 24,
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: [
          '09:00 AM - 11:00 AM',
          '11:00 AM - 01:00 PM',
          '02:00 PM - 04:00 PM',
          '04:00 PM - 06:00 PM',
        ],
        isAcceptingBookings: true,
      },
    });

    // Provider 2: Plumber
    const userP2 = await User.create({
      name: 'Suresh Varma',
      email: 'suresh.plumbing@serveease.com',
      password: 'Provider@123',
      phone: '+91 9848022334',
      role: 'provider',
      address: {
        street: 'Main Road, Arundelpet',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522002',
      },
    });

    const provider2 = await Provider.create({
      userId: userP2._id,
      businessName: 'Guntur QuickFix Plumbing & Sanitation',
      description: 'Fast, dependable plumbing solutions, geyser fittings, and leak detections with quality guaranteed.',
      experience: 6,
      serviceAreas: ['Guntur', 'Arundelpet', 'Koretipadu', 'Syamala Nagar'],
      verificationStatus: 'approved',
      averageRating: 4.8,
      totalReviews: 19,
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timeSlots: [
          '09:00 AM - 11:00 AM',
          '11:00 AM - 01:00 PM',
          '02:00 PM - 04:00 PM',
          '04:00 PM - 06:00 PM',
        ],
        isAcceptingBookings: true,
      },
    });

    // Provider 3: AC Technician
    const userP3 = await User.create({
      name: 'Venkat Rao',
      email: 'venkat.ac@serveease.com',
      password: 'Provider@123',
      phone: '+91 9848033445',
      role: 'provider',
      address: {
        street: 'Opposite Rythu Bazar, Lakshmipuram',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522007',
      },
    });

    const provider3 = await Provider.create({
      userId: userP3._id,
      businessName: 'Apex Cooling & AC Services',
      description: 'Specialists in inverter AC repair, high-pressure foam jet cleaning, gas charging and installation.',
      experience: 10,
      serviceAreas: ['Guntur', 'Lakshmipuram', 'Vidyanagar', 'Amaravati Road'],
      verificationStatus: 'approved',
      averageRating: 5.0,
      totalReviews: 32,
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: [
          '09:00 AM - 11:00 AM',
          '11:00 AM - 01:00 PM',
          '02:00 PM - 04:00 PM',
          '04:00 PM - 06:00 PM',
        ],
        isAcceptingBookings: true,
      },
    });

    // Provider 4: Cleaning
    const userP4 = await User.create({
      name: 'Lakshmi Priya',
      email: 'lakshmi.cleaning@serveease.com',
      password: 'Provider@123',
      phone: '+91 9848044556',
      role: 'provider',
      address: {
        street: '7th Cross, Syamala Nagar',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522006',
      },
    });

    const provider4 = await Provider.create({
      userId: userP4._id,
      businessName: 'CleanNest Pro Deep Cleaning',
      description: 'Hospital-grade sanitization, mechanized floor polishing, and chemical-safe eco home cleaning.',
      experience: 5,
      serviceAreas: ['Guntur', 'Syamala Nagar', 'Pattabhipuram', 'Brodipet'],
      verificationStatus: 'approved',
      averageRating: 4.7,
      totalReviews: 15,
      availability: {
        days: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'],
        timeSlots: [
          '09:00 AM - 11:00 AM',
          '11:00 AM - 01:00 PM',
          '02:00 PM - 04:00 PM',
        ],
        isAcceptingBookings: true,
      },
    });

    // Provider 5: Pending Provider (for Admin testing!)
    const userP5 = await User.create({
      name: 'Anji Reddy',
      email: 'anji.mechanic@serveease.com',
      password: 'Provider@123',
      phone: '+91 9848055667',
      role: 'provider',
      address: {
        street: 'Nallapadu Road',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522005',
      },
    });

    await Provider.create({
      userId: userP5._id,
      businessName: 'Amaravati Precision Auto Works',
      description: 'Doorstep vehicle diagnostic, oil servicing, and 2-wheeler breakdown support.',
      experience: 4,
      serviceAreas: ['Guntur', 'Old Guntur', 'Nallapadu'],
      verificationStatus: 'pending', // Test admin approval!
      averageRating: 0,
      totalReviews: 0,
    });

    console.log('Created sample providers (approved and pending).');

    // 4. Create Services
    const servicesData = [
      // Electrician Services
      {
        providerId: provider1._id,
        categoryId: catMap['Electrician'],
        title: 'Complete Home Electrical Safety Inspection',
        description: 'Comprehensive checkup of main distribution board, MCBs, earthing resistance, and appliance loads.',
        price: 499,
        estimatedDuration: '1-2 hours',
        isActive: true,
      },
      {
        providerId: provider1._id,
        categoryId: catMap['Electrician'],
        title: 'Ceiling Fan & Chandelier Installation',
        description: 'Safe mounting, balance tuning, downrod assembly, and switch wiring with warranty.',
        price: 249,
        estimatedDuration: '45 mins',
        isActive: true,
      },
      {
        providerId: provider1._id,
        categoryId: catMap['Electrician'],
        title: 'Short Circuit & Tripping MCB Repair',
        description: 'Emergency pinpointing of wire burns, phase faults, and quick neutral grounding restoration.',
        price: 399,
        estimatedDuration: '1 hour',
        isActive: true,
      },
      // Plumbing Services
      {
        providerId: provider2._id,
        categoryId: catMap['Plumbing'],
        title: 'Concealed Water Pipe Leak Detection & Fix',
        description: 'Ultrasonic acoustic leak detection and non-invasive wall pipe joint tightening.',
        price: 450,
        estimatedDuration: '2 hours',
        isActive: true,
      },
      {
        providerId: provider2._id,
        categoryId: catMap['Plumbing'],
        title: 'Overhead Water Tank Cleaning & Sanitization',
        description: 'Sludge drainage, high-pressure rotary scrubbing, UV sterilization, and anti-bacterial rinse.',
        price: 799,
        estimatedDuration: '2-3 hours',
        isActive: true,
      },
      // AC Services
      {
        providerId: provider3._id,
        categoryId: catMap['AC & Appliance Repair'],
        title: 'Inverter AC Jet Pump Foam Servicing',
        description: 'Deep pressure cleaning of evaporator coils, filter sanitize, condenser blast, and temperature probe test.',
        price: 649,
        estimatedDuration: '1.5 hours',
        isActive: true,
      },
      {
        providerId: provider3._id,
        categoryId: catMap['AC & Appliance Repair'],
        title: 'AC Refrigerant Gas Leakage Repair & Refill',
        description: 'Nitrogen pressure leak test, brazing, copper tube flaring, vacuuming, and pure R32/R410A gas charging.',
        price: 1899,
        estimatedDuration: '2 hours',
        isActive: true,
      },
      // Cleaning Services
      {
        providerId: provider4._id,
        categoryId: catMap['Home Deep Cleaning'],
        title: 'Full 2BHK/3BHK Home Deep Sanitization',
        description: 'Intensive scrubbing of floor tiles, window tracks, ceiling cobweb removal, doors, switches, and balcony wash.',
        price: 2499,
        estimatedDuration: '4-5 hours',
        isActive: true,
      },
      {
        providerId: provider4._id,
        categoryId: catMap['Home Deep Cleaning'],
        title: 'Kitchen Chimney & Counter Degreasing',
        description: 'Heavy chemical oil removal from exhaust filters, backsplash tile grout scrubbing, and stove polishing.',
        price: 899,
        estimatedDuration: '2 hours',
        isActive: true,
      },
    ];

    const services = await Service.insertMany(servicesData);
    console.log(`Created ${services.length} services.`);

    // 5. Create Sample Customers
    const customer1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.customer@example.com',
      password: 'Customer@123',
      phone: '+91 9988776655',
      role: 'customer',
      address: {
        street: 'Flat 204, Sai Residency, Brodipet',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522002',
      },
    });

    const customer2 = await User.create({
      name: 'Priya Reddy',
      email: 'priya.customer@example.com',
      password: 'Customer@123',
      phone: '+91 9988112233',
      role: 'customer',
      address: {
        street: 'Plot 45, Vidyanagar 3rd Line',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522007',
      },
    });

    console.log('Sample customers created.');

    // 6. Create Seed Bookings in different lifecycle stages
    // Booking 1: Completed with review
    const booking1 = await Booking.create({
      bookingId: 'SE-20261101-A1',
      customerId: customer1._id,
      providerId: provider3._id,
      serviceId: services[5]._id, // AC Jet Pump
      bookingDate: '2026-11-04',
      timeSlot: '09:00 AM - 11:00 AM',
      serviceAddress: {
        street: 'Flat 204, Sai Residency, Brodipet',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522002',
        landmark: 'Near Shankar Vilas',
      },
      customerPhone: '+91 9988776655',
      problemDescription: 'AC cooling is weak and blowing dusty air.',
      estimatedPrice: 649,
      finalPrice: 649,
      bookingStatus: 'Completed',
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(Date.now() - 86400000 * 2), note: 'Booking placed.' },
        { status: 'Accepted', timestamp: new Date(Date.now() - 86400000 * 1.8), note: 'Technician confirmed.' },
        { status: 'On The Way', timestamp: new Date(Date.now() - 86400000 * 1.5), note: 'Technician left shop.' },
        { status: 'In Progress', timestamp: new Date(Date.now() - 86400000 * 1.3), note: 'Service started.' },
        { status: 'Completed', timestamp: new Date(Date.now() - 86400000 * 1), note: 'AC deep cleaned and cooling verified.' },
      ],
    });

    // Create Review for completed booking
    await Review.create({
      customerId: customer1._id,
      providerId: provider3._id,
      bookingId: booking1._id,
      rating: 5,
      comment: 'Excellent service! Venkat arrived on time with proper high-pressure equipment. The AC is chilling like brand new now.',
    });

    // Booking 2: Accepted / Active
    await Booking.create({
      bookingId: 'SE-20261105-B2',
      customerId: customer1._id,
      providerId: provider1._id,
      serviceId: services[0]._id, // Safety inspection
      bookingDate: '2026-11-06',
      timeSlot: '11:00 AM - 01:00 PM',
      serviceAddress: {
        street: 'Flat 204, Sai Residency, Brodipet',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522002',
      },
      customerPhone: '+91 9988776655',
      problemDescription: 'MCB is frequently tripping when geyser is switched on.',
      estimatedPrice: 499,
      finalPrice: 499,
      bookingStatus: 'Accepted',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(Date.now() - 3600000 * 4), note: 'Booking submitted.' },
        { status: 'Accepted', timestamp: new Date(Date.now() - 3600000 * 2), note: 'Ramesh accepted the job.' },
      ],
    });

    // Booking 3: Pending request for Provider 2
    await Booking.create({
      bookingId: 'SE-20261105-C3',
      customerId: customer2._id,
      providerId: provider2._id,
      serviceId: services[3]._id, // Leak detection
      bookingDate: '2026-11-07',
      timeSlot: '02:00 PM - 04:00 PM',
      serviceAddress: {
        street: 'Plot 45, Vidyanagar 3rd Line',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        postalCode: '522007',
      },
      customerPhone: '+91 9988112233',
      problemDescription: 'Dampness on living room wall adjacent to bathroom.',
      estimatedPrice: 450,
      finalPrice: 450,
      bookingStatus: 'Pending',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(), note: 'Awaiting provider acceptance.' },
      ],
    });

    console.log('Seed bookings created.');

    // 7. Seed sample notifications
    await Notification.create([
      {
        userId: customer1._id,
        title: 'Booking Confirmed',
        message: 'Your booking #SE-20261105-B2 has been accepted by Sri Venkateswara Electrical Works.',
        type: 'booking',
        link: `/customer/bookings`,
      },
      {
        userId: userP2._id,
        title: 'New Booking Request',
        message: 'Priya Reddy has requested Concealed Water Pipe Leak Detection for Nov 7, 02:00 PM.',
        type: 'booking',
        link: `/provider/bookings`,
      },
    ]);

    console.log('==================================================');
    console.log('  ServeEase Database Seeded Successfully!');
    console.log('  Admin: admin@serveease.com | Admin@123456');
    console.log('  Provider (Approved): ramesh.electrician@serveease.com | Provider@123');
    console.log('  Provider (Pending): anji.mechanic@serveease.com | Provider@123');
    console.log('  Customer: rahul.customer@example.com | Customer@123');
    console.log('==================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();

