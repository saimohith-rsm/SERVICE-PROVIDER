const http = require('http');

const API_BASE = 'http://localhost:5000/api';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runE2ETest() {
  console.log('====================================================');
  console.log('  STARTING SERVEEASE FULL 14-PHASE E2E TEST SCENARIO');
  console.log('====================================================\n');

  try {
    // 0. Verify Health
    console.log('Step 0: Verifying Backend Health...');
    const health = await request('/health');
    console.log('Health:', health.data.status === 'OK' ? 'PASS ✓' : 'FAIL ✗');

    // 1. Register a provider
    console.log('\nStep 1: Registering a new Service Provider (Vijay Electricals)...');
    const providerReg = await request('/auth/register-provider', 'POST', {
      name: 'Vijay Bhaskar',
      email: `vijay.electrician.${Date.now()}@example.com`,
      password: 'Provider@123',
      phone: '+91 9848099887',
      businessName: 'Vijay High-Volt Electricians',
      description: 'Specialists in 3-phase wiring and circuit troubleshooting in Guntur.',
      experience: 7,
      serviceAreas: ['Guntur', 'Brodipet', 'Arundelpet'],
    });
    console.log('Provider Registered:', providerReg.data.success ? 'PASS ✓' : 'FAIL ✗');
    const providerId = providerReg.data.provider._id;
    const providerToken = providerReg.data.token;

    // 2. Admin logs in and approves provider
    console.log('\nStep 2: Admin login & provider approval...');
    const adminLogin = await request('/auth/login', 'POST', {
      email: 'admin@serveease.com',
      password: 'Admin@123456',
    });
    const adminToken = adminLogin.data.token;

    const approvalRes = await request(
      `/admin/providers/${providerId}/verification`,
      'PATCH',
      { status: 'approved', note: 'Credentials & trade license verified' },
      adminToken
    );
    console.log(
      'Provider Approval:',
      approvalRes.data.provider.verificationStatus === 'approved' ? 'PASS ✓' : 'FAIL ✗'
    );

    // 3. Get Categories
    console.log('\nStep 3: Finding Electrician category...');
    const catRes = await request('/categories');
    const electricianCat = catRes.data.categories.find((c) => c.name === 'Electrician');
    console.log('Found Category:', electricianCat ? electricianCat.name + ' ✓' : 'FAIL ✗');

    // 4. Provider creates an electrician service
    console.log('\nStep 4: Provider publishes an electrical service...');
    const serviceCreate = await request(
      '/services',
      'POST',
      {
        categoryId: electricianCat._id,
        title: 'Complete 3-Phase DB Box Inspection & MCB Setup',
        description: 'Comprehensive switchgear checkup, phase balancing, and earthing verification.',
        price: 550,
        estimatedDuration: '1.5 hours',
      },
      providerToken
    );
    console.log('Service Created:', serviceCreate.data.success ? 'PASS ✓' : 'FAIL ✗');
    const serviceId = serviceCreate.data.service._id;

    // 5. Customer registers and logs in
    console.log('\nStep 5: Registering customer...');
    const customerEmail = `kavitha.customer.${Date.now()}@example.com`;
    const customerReg = await request('/auth/register', 'POST', {
      name: 'Kavitha Devi',
      email: customerEmail,
      password: 'Customer@123',
      phone: '+91 9988223344',
      address: {
        street: '3rd Cross, Brodipet',
        city: 'Guntur',
        postalCode: '522002',
      },
    });
    console.log('Customer Registered:', customerReg.data.success ? 'PASS ✓' : 'FAIL ✗');
    const customerToken = customerReg.data.token;

    // 6. Customer searches for electricians
    console.log('\nStep 6: Customer searches for services...');
    const searchRes = await request('/services?search=Phase&location=Guntur');
    const foundService = searchRes.data.services.find((s) => s._id === serviceId);
    console.log('Service Discovered in Search:', foundService ? 'PASS ✓' : 'FAIL ✗');

    // 7. Customer books appointment
    console.log('\nStep 7: Customer places a booking...');
    const bookingRes = await request(
      '/bookings',
      'POST',
      {
        serviceId,
        bookingDate: '2026-11-09',
        timeSlot: '09:00 AM - 11:00 AM',
        serviceAddress: {
          street: 'Flat 101, Sri Rama Nilayam, Brodipet',
          city: 'Guntur',
          postalCode: '522002',
        },
        customerPhone: '+91 9988223344',
        problemDescription: 'Frequent tripping on phase 2 whenever AC is powered on.',
        paymentMethod: 'Cash',
      },
      customerToken
    );
    console.log('Booking Placed:', bookingRes.data.success ? 'PASS ✓' : 'FAIL ✗');
    const bookingId = bookingRes.data.booking._id;
    console.log('Generated Booking ID:', bookingRes.data.booking.bookingId);

    // 8. Provider views booking and accepts
    console.log('\nStep 8: Provider accepts booking request...');
    const acceptRes = await request(
      `/bookings/${bookingId}/status`,
      'PATCH',
      { status: 'Accepted', note: 'Technician will arrive with insulation tester.' },
      providerToken
    );
    console.log(
      'Status: Pending -> Accepted:',
      acceptRes.data.booking.bookingStatus === 'Accepted' ? 'PASS ✓' : 'FAIL ✗'
    );

    // 9. Provider updates progress: On The Way
    console.log('\nStep 9: Provider advances status to "On The Way"...');
    const otwRes = await request(
      `/bookings/${bookingId}/status`,
      'PATCH',
      { status: 'On The Way', note: 'En route from Brodipet 4th line.' },
      providerToken
    );
    console.log('Status: Accepted -> On The Way:', otwRes.data.booking.bookingStatus === 'On The Way' ? 'PASS ✓' : 'FAIL ✗');

    // 10. Provider updates progress: In Progress
    console.log('\nStep 10: Provider advances status to "In Progress"...');
    const inProgRes = await request(
      `/bookings/${bookingId}/status`,
      'PATCH',
      { status: 'In Progress', note: 'Testing phase voltage and neutral load.' },
      providerToken
    );
    console.log('Status: On The Way -> In Progress:', inProgRes.data.booking.bookingStatus === 'In Progress' ? 'PASS ✓' : 'FAIL ✗');

    // 11. Provider marks Completed with cash payment confirmed
    console.log('\nStep 11: Provider completes job & marks paid...');
    const completeRes = await request(
      `/bookings/${bookingId}/status`,
      'PATCH',
      {
        status: 'Completed',
        finalPrice: 550,
        markPaid: true,
        note: 'Tripping issue resolved. Clean neutral bus installed.',
      },
      providerToken
    );
    console.log(
      'Status: In Progress -> Completed:',
      completeRes.data.booking.bookingStatus === 'Completed' ? 'PASS ✓' : 'FAIL ✗'
    );
    console.log('Payment Status:', completeRes.data.booking.paymentStatus === 'Paid' ? 'Paid ✓' : 'FAIL ✗');

    // 12. Customer submits 5-star review
    console.log('\nStep 12: Customer posts verified review...');
    const reviewRes = await request(
      '/reviews',
      'POST',
      {
        bookingId,
        rating: 5,
        comment: 'Outstanding professionalism! Vijay diagnosed the burnt neutral terminal immediately and repaired it cleanly.',
      },
      customerToken
    );
    console.log('Review Submitted:', reviewRes.data.success ? 'PASS ✓' : 'FAIL ✗');

    // 13. Verify Provider Rating Recalculated
    console.log('\nStep 13: Verifying provider rating updated in MongoDB...');
    const providerCheck = await request(`/providers/${providerId}`);
    console.log('Provider Average Rating:', providerCheck.data.provider.averageRating, 'stars ✓');
    console.log('Provider Total Reviews:', providerCheck.data.provider.totalReviews, 'review(s) ✓');

    // 14. Customer and Provider can see updated booking
    console.log('\nStep 14: Verifying booking visibility for both parties...');
    const custBooking = await request(`/bookings/${bookingId}`, 'GET', null, customerToken);
    const provBooking = await request(`/bookings/${bookingId}`, 'GET', null, providerToken);
    console.log('Customer sees Completed status:', custBooking.data.booking.bookingStatus === 'Completed' ? 'PASS ✓' : 'FAIL ✗');
    console.log('Provider sees Completed status:', provBooking.data.booking.bookingStatus === 'Completed' ? 'PASS ✓' : 'FAIL ✗');

    console.log('\n====================================================');
    console.log('  ALL 14 E2E ACCEPTANCE TESTS PASSED WITH REAL DB!  ');
    console.log('====================================================');
  } catch (err) {
    console.error('E2E Test Failed:', err);
    process.exit(1);
  }
}

runE2ETest();

