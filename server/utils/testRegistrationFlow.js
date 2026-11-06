const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function post(path, data) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('================ TESTING 10 REGISTRATION SCENARIOS ================');

  const timestamp = Date.now();
  const validEmail = `test_customer_${timestamp}@serveease.com`;
  const validPhone = `+9198480${String(timestamp).slice(-5)}`;

  // 1. Valid customer registration
  const s1 = await post('/api/auth/register', {
    name: 'Valid Customer',
    email: validEmail,
    password: 'Password@123',
    phone: validPhone,
    address: { street: 'Main Road', city: 'Guntur' },
  });
  console.log(
    `[Scenario 1 - Valid Customer Registration]: ${s1.status === 201 && s1.body.success ? 'PASSED (HTTP 201)' : 'FAILED'} ->`,
    s1.body?.message || s1.body
  );

  // 2. Duplicate email registration
  const s2 = await post('/api/auth/register', {
    name: 'Duplicate Email User',
    email: validEmail,
    password: 'Password@123',
    phone: '+919988112233',
  });
  console.log(
    `[Scenario 2 - Duplicate Email Registration]: ${s2.status === 400 && s2.body.message.includes('already registered') ? 'PASSED (HTTP 400 Rejected Duplicate Email)' : 'FAILED'} ->`,
    s2.body?.message
  );

  // 3. Duplicate mobile number registration
  const s3 = await post('/api/auth/register', {
    name: 'Duplicate Phone User',
    email: `unique_${timestamp}@serveease.com`,
    password: 'Password@123',
    phone: validPhone, // already used by s1
  });
  console.log(
    `[Scenario 3 - Duplicate Mobile Registration]: ${s3.status === 400 && s3.body.message.includes('Mobile number is already registered') ? 'PASSED (HTTP 400 Rejected Duplicate Phone)' : 'FAILED'} ->`,
    s3.body?.message
  );

  // 4. Invalid email format
  const s4 = await post('/api/auth/register', {
    name: 'Invalid Email User',
    email: 'notanemail',
    password: 'Password@123',
    phone: '+919848099887',
  });
  console.log(
    `[Scenario 4 - Invalid Email Format]: ${s4.status === 400 ? 'PASSED (HTTP 400 Invalid Email)' : 'FAILED'} ->`,
    s4.body?.message
  );

  // 5. Invalid mobile number format
  const s5 = await post('/api/auth/register', {
    name: 'Invalid Phone User',
    email: `invalidphone_${timestamp}@serveease.com`,
    password: 'Password@123',
    phone: '1234', // too short
  });
  console.log(
    `[Scenario 5 - Invalid Mobile Format]: ${s5.status === 400 ? 'PASSED (HTTP 400 Invalid Phone)' : 'FAILED'} ->`,
    s5.body?.message
  );

  // 6. Empty form
  const s6 = await post('/api/auth/register', {});
  console.log(
    `[Scenario 6 - Empty Form Submission]: ${s6.status === 400 ? 'PASSED (HTTP 400 Form Validation)' : 'FAILED'} ->`,
    s6.body?.message
  );

  // 7. Invalid short password (< 6 chars)
  const s7 = await post('/api/auth/register', {
    name: 'Short Password User',
    email: `shortpass_${timestamp}@serveease.com`,
    password: '123',
    phone: '+919848011222',
  });
  console.log(
    `[Scenario 7 - Short Password (< 6 chars)]: ${s7.status === 400 ? 'PASSED (HTTP 400 Password Length)' : 'FAILED'} ->`,
    s7.body?.message
  );

  // 8. Valid Provider registration
  const validProviderEmail = `provider_${timestamp}@serveease.com`;
  const validProviderPhone = `+9198481${String(timestamp).slice(-5)}`;
  const s8 = await post('/api/auth/register-provider', {
    name: 'Rao Bahadur',
    businessName: 'Guntur Precision Carpentry',
    email: validProviderEmail,
    password: 'Provider@123',
    phone: validProviderPhone,
    description: 'Custom furniture, wardrobe repair, and door fitting.',
    experience: 5,
    serviceAreas: ['Guntur', 'Arundelpet'],
  });
  console.log(
    `[Scenario 8 - Valid Provider Registration]: ${s8.status === 201 && s8.body.success ? 'PASSED (HTTP 201 Pending Provider Created)' : 'FAILED'} ->`,
    s8.body?.message || s8.body
  );

  // 9. Verify User Stored in MongoDB & Query Directly
  await mongoose.connect('mongodb://127.0.0.1:27018/serveease');
  const userColl = mongoose.connection.collection('users');
  const storedUser = await userColl.findOne({ email: validEmail });
  const userExists = !!storedUser && storedUser.phone === validPhone && storedUser.role === 'customer';
  console.log(
    `[Scenario 9 - Database Persistence Verification]: ${userExists ? 'PASSED (User persisted in MongoDB with correct attributes)' : 'FAILED'}`
  );

  // 10. Verify Password is Bcrypt Hashed (Never plain text)
  const isHashed = storedUser.password.startsWith('$2a$') || storedUser.password.startsWith('$2b$');
  const isMatch = bcrypt.compareSync('Password@123', storedUser.password);
  const isPlainStored = storedUser.password === 'Password@123';
  console.log(
    `[Scenario 10 - Secure Bcrypt Password Hashing]: ${isHashed && isMatch && !isPlainStored ? 'PASSED (Password is 100% securely hashed and never plain text)' : 'FAILED'}`
  );

  await mongoose.disconnect();
}

run();

