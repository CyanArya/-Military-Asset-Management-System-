# Military Asset Management System

A comprehensive system for managing military assets across multiple bases, including tracking, transfers, and assignments.

## Features

- **Asset Management**
  - Track opening balances, closing balances, and net movements
  - Record asset assignments and expenditures
  - Monitor asset status (Available, Assigned, Expended, In Transit)

- **Transfer Management**
  - Facilitate asset transfers between bases
  - Track transfer history with timestamps
  - Maintain transfer status and documentation

- **Purchase Management**
  - Record new asset purchases
  - Track purchase history and costs
  - Generate purchase statistics

- **Base Management**
  - Manage multiple military bases
  - Track assets and personnel per base
  - Generate base-specific statistics

- **Role-Based Access Control**
  - Admin: Full system access
  - Base Commander: Base-specific access
  - Logistics Officer: Limited access to purchases and transfers

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Role-based access control

### Frontend (Coming Soon)
- React
- Material-UI
- Redux for state management
- React Router for navigation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/military-asset-management.git
   cd military-asset-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables with your configuration

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Assets
- GET `/api/assets` - List all assets
- GET `/api/assets/:id` - Get asset details
- POST `/api/assets` - Create new asset
- PUT `/api/assets/:id` - Update asset
- POST `/api/assets/:id/assign` - Assign asset to user
- POST `/api/assets/:id/expend` - Mark asset as expended

### Transfers
- GET `/api/transfers` - List all transfers
- GET `/api/transfers/:id` - Get transfer details
- POST `/api/transfers` - Create new transfer
- POST `/api/transfers/:id/complete` - Complete transfer

### Purchases
- GET `/api/purchases` - List all purchases
- GET `/api/purchases/:id` - Get purchase details
- POST `/api/purchases` - Create new purchase
- GET `/api/purchases/stats/summary` - Get purchase statistics

### Bases
- GET `/api/bases` - List all bases
- GET `/api/bases/:id` - Get base details
- POST `/api/bases` - Create new base
- PUT `/api/bases/:id` - Update base
- GET `/api/bases/:id/stats` - Get base statistics

## Security

- All API endpoints (except login/register) require JWT authentication
- Role-based access control for all operations
- Input validation for all requests
- Audit logging for all operations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. #   - M i l i t a r y - A s s e t - M a n a g e m e n t - S y s t e m -  
 