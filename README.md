# Military Asset Management System

- Frontend: React + Vite + Tailwind CSS + Axios + React Router + Lucide React
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- Authentication: JWT + bcrypt
- Charts: Recharts

## 1. Project structure

```text
military-asset-management/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── purchaseController.js
│   │   │   ├── transferController.js
│   │   │   ├── assignmentController.js
│   │   │   └── masterController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── rbac.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── purchaseRoutes.js
│   │   │   ├── transferRoutes.js
│   │   │   ├── assignmentRoutes.js
│   │   │   └── masterRoutes.js
│   │   ├── utils/
│   │   │   └── audit.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── NetMovementModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Purchases.jsx
│   │   │   ├── Transfers.jsx
│   │   │   └── Assignments.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 2. Database

Install PostgreSQL and create a database:

```sql
CREATE DATABASE military_assets;
```

Backend `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/military_assets?schema=public"
JWT_SECRET="change_this_to_a_long_random_secret"
PORT=5000
```

Then:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 4. Seed accounts

| Role | Username | Password | Base |
|---|---|---|---|
| Admin | admin_user | AdminPass123! | All |
| Base Commander | commander_alpha | CommandPass123! | Fort Alpha |
| Logistics Officer | logistics_officer | LogisticsPass123! | Fort Alpha |

The seed also creates sample bases, equipment types, purchases, transfers, assignments and expenditures.

## 5. RBAC

### ADMIN
- Can view all bases.
- Can create purchases.
- Can create transfers.
- Can create assignments/expenditures.
- Can view audit logs through the dashboard data.
- Can use all master data.

### BASE_COMMANDER
- Can only view their assigned base.
- Can create purchases for their own base.
- Can create transfers from their own base.
- Can receive transfers into their own base.
- Can create assignments/expenditures for their own base.

### LOGISTICS_OFFICER
- Can work with purchases and transfers.
- Data is automatically limited to the assigned base for reads.
- Transfer source must be the officer's assigned base.

## 6. Inventory calculation

The API calculates:

```text
Opening Balance =
  all purchases before start
  + transfers in before start
  - transfers out before start
  - assignments before start
  - expenditures before start

Net Movement =
  purchases during period
  + transfers in during period
  - transfers out during period

Closing Balance =
  Opening Balance
  + Net Movement
  - Assigned
  - Expended
```

This avoids storing a duplicate balance column.

## 7. Important design decision

This simple version uses quantity-based inventory events instead of individual serial-number tracking.

For example:

```text
5.56mm Ammunition = quantity 1000
Humvee = quantity 5
M4 Carbine = quantity 50
```

That keeps the assignment understandable while still implementing the required transactional inventory model.

For a production military system, physical assets such as vehicles and serialized weapons would normally receive a separate asset/serial-number table and stricter approval workflows.

## 8. API endpoints

### Authentication

```text
POST /api/auth/login
GET  /api/auth/me
```

### Master data

```text
GET /api/master/bases
GET /api/master/equipment-types
```

### Dashboard

```text
GET /api/dashboard?baseId=&equipmentTypeId=&startDate=&endDate=
```

### Purchases

```text
GET  /api/purchases
POST /api/purchases
```

### Transfers

```text
GET  /api/transfers
POST /api/transfers
```

### Assignments / expenditures

```text
GET  /api/assignments
POST /api/assignments
POST /api/assignments/:id/expend