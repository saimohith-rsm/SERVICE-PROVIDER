# ServeEase – Local Service Provider Booking Platform

ServeEase is a production-style full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed to connect homeowners and commercial clients with verified local service professionals (electricians, plumbers, AC technicians, cleaners, carpenters, and mechanics). The platform features regional demonstration data for **Guntur and Andhra Pradesh**, complete appointment lifecycle tracking, provider verification, and role-based permissions.

---

## 1. Problem Statement

Finding skilled and dependable local tradespeople in neighborhoods like Brodipet, Arundelpet, and Lakshmipuram often relies on word-of-mouth. Customers face unpredictable pricing, lack of verifiable qualifications, unconfirmed arrival times, and no formal recourse for substandard craftsmanship. Concurrently, local service providers struggle to market their skills, coordinate bookings efficiently, and build a trusted digital reputation.

---

## 2. Proposed Solution

ServeEase unifies discovery, scheduling, payment status tracking, and quality assurance into one platform:
- **For Customers:** Discover vetted experts by specialty, compare upfront rates, view verified ratings, book collision-free appointment slots, and track service dispatch in real time.
- **For Service Providers:** A portal to manage listings, customize operating schedules and time windows, accept/decline booking requests, advance dispatch status, and monitor earnings.
- **For Administrators:** Comprehensive moderation suite to review partner credential applications, curate service taxonomy, supervise platform bookings, manage user access, and resolve grievance tickets.

---

## 3. Core Objectives

- Deliver a high-performance, responsive React interface styled with Tailwind CSS (navy blue and teal palette).
- Maintain data integrity through MongoDB schemas with automated validation and compound indexes preventing appointment collisions.
- Secure operations with bcryptjs password hashing and JWT authentication with role-based authorization middleware.
- Provide real, live API-driven metric dashboards without mock data.

---

## 4. Technology Stack

### Frontend
- **Framework:** React.js (v18) bootstrapped with Vite
- **Styling:** Tailwind CSS (Navy `#0f172a` primary, Teal `#0d9488` accent, slate backgrounds)
- **Routing:** React Router DOM (v6) with `ProtectedRoute` and `RoleRoute` guards
- **HTTP Client:** Axios with request/response interceptors for automatic JWT header injection
- **Icons:** Lucide React
- **Forms & Validation:** Controlled components and standard validation

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (v4)
- **API Style:** RESTful JSON Architecture
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Validation:** express-validator middleware
- **Logging & Security:** Morgan, CORS

### Database
- **Engine:** MongoDB (Local or MongoDB Atlas)
- **ODM:** Mongoose (v8) with custom pre/post hooks, compound unique indexes, and schema statics

### Cloud & Deployment
- **Monorepo Full-Stack Platform:** Vercel (Frontend React SPA + Serverless Express REST API via `api/index.js` and `vercel.json`)
- **Container / Standalone Alternative:** Render (`render.yaml`)
- **Database:** MongoDB Atlas (Cloud) / Local MongoDB instance
- **Security Hardening:** Helmet (HTTP headers), express-rate-limit (Brute-force protection), Custom NoSQL injection sanitizer, bcryptjs password hashing

---

## 5. Security & Production Hardening

ServeEase is built to enterprise security and performance standards:
- **Rate Limiting:** Protects API endpoints against denial-of-service and brute-force attacks (`30 requests / 15 mins` on authentication endpoints, `300 requests / 15 mins` globally).
- **HTTP Security Headers:** Protected with `helmet` for X-Content-Type-Options, HSTS, X-Frame-Options, and referrer policy.
- **NoSQL Injection Sanitization:** Custom recursive request sanitizer strips keys prefixed with `$` or containing `.` from query parameters, route params, and request bodies.
- **Double-Booking Atomic Prevention:** Unique compound partial index in MongoDB on `(providerId, bookingDate, timeSlot)` filtered for active bookings (`Pending`, `Accepted`, `On The Way`, `In Progress`, `Completed`).
- **Live Provider Rating Recalculation:** Mongoose `post('save')` and `post('findOneAndDelete')` hooks calculate rolling `averageRating` and `totalReviews` via aggregation pipeline.
- **Code Splitting & Asset Optimization:** Vite production bundle with vendor chunking (`vendor-react`, `vendor-icons`, `vendor-http`) ensuring small, cacheable bundles.

---

## 5. System Architecture

```text
serveease/
│
├── client/                     # Frontend Vite + React Application
│   ├── public/                 # Static assets
│   └── src/
│       ├── assets/             # Images and design assets
│       ├── components/
│       │   ├── common/         # Navbar, Footer, StatusBadge, StarRating, Modals
│       │   ├── customer/       # Customer-specific widgets
│       │   ├── provider/       # Provider cards and schedule pickers
│       │   └── admin/          # Administrative tables & filters
│       ├── layouts/            # MainLayout (public) & DashboardLayout (portals)
│       ├── pages/
│       │   ├── public/         # Home, Login, Register, Services, ServiceDetails, About, Contact
│       │   ├── customer/       # CustomerDashboard, BookService, MyBookings, BookingDetails, MyReviews
│       │   ├── provider/       # ProviderDashboard, ManageServices, AddService, Bookings, Schedule
│       │   └── admin/          # AdminDashboard, ManageProviders, Users, Categories, Complaints
│       ├── context/            # AuthContext (JWT state) & NotificationContext
│       ├── services/           # Axios API instance with token interceptors
│       ├── App.jsx             # Route definitions and access control
│       ├── main.jsx            # React root mount
│       └── index.css           # Tailwind base directives
│
├── server/                     # Backend Node.js & Express REST API
│   ├── config/                 # Database connection (Mongoose)
│   ├── controllers/            # Feature controllers (auth, booking, provider, etc.)
│   ├── middleware/             # auth (protect, authorize), validate, errorHandler
│   ├── models/                 # Mongoose schemas (8 collections)
│   ├── routes/                 # Express route definitions
│   ├── services/               # Shared backend logic
│   ├── utils/                  # Seed script & automated 14-step E2E test runner
│   └── server.js               # Application entry point
│
├── .gitignore                  # Git exclusion rules
├── package.json                # Root orchestration scripts
└── README.md                   # Full documentation
```

---

## 6. Database Collections & Schema Design

| Collection | Key Fields | Description & Constraints |
| :--- | :--- | :--- |
| **User** | `name`, `email` (unique), `password` (hashed, `select: false`), `phone`, `role` (`customer`, `provider`, `admin`), `address`, `isActive` | Core identity model. Passwords are never returned in JSON serialization. |
| **Provider** | `userId` (ref User), `businessName`, `description`, `experience`, `serviceAreas`, `verificationStatus` (`pending`, `approved`, `rejected`), `averageRating`, `totalReviews`, `availability` (`days`, `timeSlots`, `isAcceptingBookings`) | Provider profile linked 1-to-1 to a User. Only approved providers can publish services. |
| **Category** | `name` (unique), `description`, `image`, `isActive` | Service taxonomy (Electrician, Plumbing, AC Repair, Cleaning, etc.). |
| **Service** | `providerId` (ref Provider), `categoryId` (ref Category), `title`, `description`, `price`, `estimatedDuration`, `isActive` | Concrete service offerings created by approved providers. |
| **Booking** | `bookingId` (unique `SE-YYYYMMDD-XXXX`), `customerId`, `providerId`, `serviceId`, `bookingDate`, `timeSlot`, `serviceAddress`, `customerPhone`, `problemDescription`, `estimatedPrice`, `finalPrice`, `bookingStatus`, `paymentMethod`, `paymentStatus`, `statusHistory` | Appointment state machine with atomic compound index on `(providerId, bookingDate, timeSlot)` preventing overlapping bookings. |
| **Review** | `customerId`, `providerId`, `bookingId` (unique), `rating` (1-5), `comment` | Customer feedback permitted only for completed bookings. Automatically recalculates provider's `averageRating` via Mongoose statics. |
| **Notification** | `userId`, `title`, `message`, `type`, `link`, `isRead` | In-app alerts for status updates, booking approvals, and customer reviews. |
| **Complaint** | `customerId`, `bookingId`, `subject`, `description`, `status` (`Open`, `Under Review`, `Resolved`, `Dismissed`), `adminResponse` | Grievance resolution tickets supervised by administrators. |

---

## 7. Booking Lifecycle State Machine

```text
       [ Customer Books Slot ]
                  │
                  ▼
              (Pending)
             /         \
Provider Accepts      Provider Declines / Customer Cancels
           /             \
          ▼               ▼
     (Accepted)      (Rejected / Cancelled)
          │
Provider Dispatched
          │
          ▼
    (On The Way)
          │
Technician Arrives
          │
          ▼
   (In Progress)
          │
Work Completed & Payment Verified
          │
          ▼
    (Completed) ────► [ Customer Can Submit 1-5 Star Review ]
```

---

## 8. REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register customer account
- `POST /api/auth/register-provider` – Register provider partner application
- `POST /api/auth/login` – Authenticate user and receive JWT token
- `GET /api/auth/me` – Retrieve authenticated session identity
- `PUT /api/auth/update-profile` – Update contact details & service address
- `PUT /api/auth/update-password` – Change password

### Providers & Services (`/api/providers`, `/api/services`)
- `GET /api/providers` – Filter approved providers by search, location, rating
- `GET /api/providers/:id` – Public provider profile, catalog, and reviews
- `PUT /api/providers/profile` – Update provider trade details (Provider only)
- `PUT /api/providers/availability` – Configure operating days & time windows
- `GET /api/providers/dashboard/stats` – Provider dashboard performance analytics
- `GET /api/services` – Search services with category, price range, and rating filters
- `GET /api/services/:id` – Individual service details with assigned provider
- `POST /api/services` – Create service (Approved providers only)
- `PUT /api/services/:id` – Edit service (Owner provider or admin)
- `DELETE /api/services/:id` – Remove service

### Bookings (`/api/bookings`)
- `POST /api/bookings` – Place appointment booking (Customer only)
- `GET /api/bookings/my` – Customer booking history with status filters
- `GET /api/bookings/provider` – Provider incoming appointment requests
- `GET /api/bookings/:id` – Full booking details and activity audit log
- `PATCH /api/bookings/:id/status` – Advance lifecycle status (`Accepted` &rarr; `On The Way` &rarr; `In Progress` &rarr; `Completed`)
- `PATCH /api/bookings/:id/cancel` – Cancel booking (Customer or Admin)
- `PATCH /api/bookings/:id/payment` – Update cash/online payment status

### Reviews, Complaints & Notifications
- `POST /api/reviews` – Submit review for a completed booking
- `GET /api/reviews/provider/:providerId` – List public reviews for a provider
- `GET /api/reviews/my` – Customer's authored reviews
- `PUT /api/reviews/:id` – Edit review
- `DELETE /api/reviews/:id` – Delete review (Recalculates provider score)
- `GET /api/notifications` – Fetch user notifications & unread badge count
- `PATCH /api/notifications/:id/read` – Mark notification read
- `POST /api/complaints` – File support grievance ticket
- `GET /api/complaints/my` – Customer grievance status

### Administration (`/api/admin`)
- `GET /api/admin/dashboard` – Real-time platform analytics (Customers, Providers, Volume, Complaints)
- `GET /api/admin/providers` – Provider directory with approval filters
- `PATCH /api/admin/providers/:id/verification` – Approve or reject partner application
- `GET /api/admin/bookings` – Comprehensive platform booking master log
- `GET /api/admin/users` – User directory with activation/deactivation toggle
- `GET /api/admin/services` – Platform inventory management

---

## 9. Quick Demo Accounts

For immediate testing, use the pre-seeded accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin@serveease.com` | `Admin@123456` | Full platform dashboard, provider approvals, complaints resolution |
| **Approved Provider (Electrician)** | `ramesh.electrician@serveease.com` | `Provider@123` | Sri Venkateswara Electricals, Brodipet, Guntur (Active services) |
| **Pending Provider (Mechanic)** | `anji.mechanic@serveease.com` | `Provider@123` | Amaravati Precision Auto Works (Test admin approval flow) |
| **Customer** | `rahul.customer@example.com` | `Customer@123` | Rahul Sharma, Brodipet, Guntur (Sample active & completed bookings) |

*(One-click demo login buttons are also provided on the `/login` page).*

---

## 10. Local Setup & Execution Instructions

### Prerequisites
- Node.js v18 or newer
- MongoDB installed locally on port `27017` or a MongoDB Atlas URI

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd serveease

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables Configuration

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/serveease
JWT_SECRET=your_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `client/.env` (Optional in development, Vite proxies `/api` to port 5000 automatically):
```env
VITE_API_URL=/api
```

### 3. Seed Database
```bash
npm run seed
```
*Seeds Guntur & Andhra Pradesh categories, approved & pending providers, active services, customer accounts, and demo bookings.*

### 4. Run Automated Test Suites
```bash
# Run Unit & Model Constraint Tests
npm test

# Run Schema & Foreign Key Verification
npm run verify:db

# Run Complete 14-Step Acceptance E2E Scenario
npm run test:e2e
```

### 5. Build for Production
```bash
npm run build
```

### 6. Start Development Servers
```bash
# Start frontend client (Vite dev server)
npm run dev

# Or start backend server directly
npm run dev:server
```

Open your browser at **`http://localhost:5173`** (or **`http://localhost:5000`**).

---

## 11. Deployment Guide

### Option A: Monorepo Full-Stack Deployment to Vercel (Recommended)

Because ServeEase includes `vercel.json` and `api/index.js`, the entire application (React frontend + Express Serverless API) deploys in a single Vercel project:

1. Push your repository to GitHub:
   ```bash
   git push -u origin main
   ```
2. In [Vercel](https://vercel.com), click **Add New &rarr; Project** and import `SERVICE-PROVIDER`.
3. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: A 32+ character secure secret
   - `NODE_ENV`: `production`
4. Click **Deploy**. Vercel will build the React SPA and serve the Express REST API under `/api/*`.

### Option B: Deploy Backend to Render & Frontend to Vercel
1. In Render, select **New + &rarr; Web Service** and connect repository using `server/render.yaml`.
2. Add `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` environment variables.
3. In Vercel, import `client` directory and set `VITE_API_URL` to your Render backend URL.

---

## 12. Project Team

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Team Member 1** | Full-Stack Architect | Express API Architecture, MongoDB Data Modeling, JWT Authentication |
| **Team Member 2** | Frontend & UI Engineer | React Component Architecture, Tailwind Design System, Responsive Layouts |
| **Team Member 3** | Quality & Test Engineer | End-to-End Workflow Testing, Concurrency Constraints, Deployment Configs |

---

## 13. License

Distributed under the MIT License. See `LICENSE` for more information.

