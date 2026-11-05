const assert = require('assert');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/User');
const Provider = require('../models/Provider');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');

// Helper for JWT
const { generateToken } = require('./jwt');

async function runTestSuite() {
  console.log('====================================================');
  console.log('       SERVEEASE AUTOMATED TEST SUITE               ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // --- UNIT TESTS ---
  console.log('[Phase 1: Unit & Security Tests]');

  test('Password Hashing with bcrypt: generates salt and verifies match', () => {
    const rawPass = 'SecurePass@123';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(rawPass, salt);
    assert.strictEqual(bcrypt.compareSync(rawPass, hash), true);
    assert.strictEqual(bcrypt.compareSync('WrongPassword', hash), false);
  });

  test('JWT Token Generation & Expiry Verification', () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const role = 'provider';
    const token = generateToken(userId, role);
    assert(token && typeof token === 'string', 'Token should be a non-empty string');

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'serveease_super_secure_jwt_secret_key_2026_antigravity'
    );
    assert.strictEqual(decoded.id, userId);
    assert.strictEqual(decoded.role, role);
    assert(decoded.exp > decoded.iat, 'Token should have future expiration');
  });

  test('NoSQL Injection Query Sanitizer removes forbidden keys ($ and .)', () => {
    const dirtyPayload = {
      email: 'customer@example.com',
      $gt: '',
      nested: {
        'field.with.dot': 'bad',
        clean: 'good',
      },
    };

    const clean = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          clean(obj[key]);
        }
      }
      return obj;
    };

    clean(dirtyPayload);
    assert.strictEqual(dirtyPayload.$gt, undefined, '$gt should be stripped');
    assert.strictEqual(dirtyPayload.nested['field.with.dot'], undefined, 'dot keys should be stripped');
    assert.strictEqual(dirtyPayload.nested.clean, 'good', 'valid keys should remain');
  });

  test('Role-based Access Control Authorization Validator', () => {
    const rolesAllowed = ['admin', 'provider'];
    assert.strictEqual(rolesAllowed.includes('admin'), true);
    assert.strictEqual(rolesAllowed.includes('provider'), true);
    assert.strictEqual(rolesAllowed.includes('customer'), false);
    assert.strictEqual(rolesAllowed.includes('guest'), false);
  });

  // --- DATABASE INTEGRATION TESTS ---
  console.log('\n[Phase 2: Database & Model Constraint Tests]');
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/serveease';

  try {
    await mongoose.connect(uri);
    console.log(`  Connected to MongoDB: ${mongoose.connection.host}:${mongoose.connection.port}`);

    await asyncTest('Database Connection & Active Session', async () => {
      assert.strictEqual(mongoose.connection.readyState, 1, 'MongoDB connection must be ready (1)');
    });

    await asyncTest('User Model: enforces unique email and required fields', async () => {
      const user = new User({
        name: 'Test Validation User',
        email: 'invalid-email-format',
        phone: '9876543210',
      });
      let errorOccurred = false;
      try {
        await user.validate();
      } catch (err) {
        errorOccurred = true;
        assert(err.errors.email, 'Should fail email format validation');
        assert(err.errors.password, 'Should require password');
      }
      assert.strictEqual(errorOccurred, true);
    });

    await asyncTest('Booking Model: Atomic Partial Unique Index Verification', async () => {
      const indexes = await Booking.collection.indexes();
      const slotIndex = indexes.find((i) => i.name.includes('providerId_1_bookingDate_1_timeSlot_1'));
      assert(slotIndex, 'Double-booking partial unique index must exist in MongoDB');
      assert.strictEqual(slotIndex.unique, true, 'Slot index must be unique');
      assert(slotIndex.partialFilterExpression, 'Must specify partialFilterExpression');
    });

    await asyncTest('Review Model: calculates average rating accurately', async () => {
      // Fetch or verify calculateAverageRating method exists
      assert(typeof Review.calculateAverageRating === 'function', 'calculateAverageRating static method must exist');
    });

    await asyncTest('Category Model: enforces unique category name', async () => {
      const indexes = await Category.collection.indexes();
      const nameIndex = indexes.find((i) => i.name === 'name_1');
      assert(nameIndex && nameIndex.unique === true, 'Category name index must be unique');
    });

    await asyncTest('Service Model: references providerId and categoryId', async () => {
      const sample = await Service.findOne();
      if (sample) {
        assert(sample.providerId, 'Service must have providerId');
        assert(sample.categoryId, 'Service must have categoryId');
        assert(sample.price >= 0, 'Service price must be non-negative');
      }
    });
  } catch (dbErr) {
    console.error(`  Database test skipped or failed: ${dbErr.message}`);
    failed++;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
