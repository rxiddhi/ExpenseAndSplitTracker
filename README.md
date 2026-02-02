# Full-Stack Expense Tracker & Splitter

A comprehensive expense tracking and group splitting application built with Node.js, Express, TypeScript, and MongoDB.

## Features

### 💰 Personal Expense Tracker
- **CRUD Operations**: Add, view, edit, and delete personal expenses.
- **Filtering & Search**: Filter by category, date range, and search by title.
- **Pagination**: Efficiently browse through large lists of expenses.
- **Monthly Summary**: View total spending for each month.

### 👥 Group Expense Splitter
- **Group Management**: Create groups and manage members (add/remove).
- **Expense Splitting**: Automatically splits expenses equally among group members.
- **Balance Tracking**: View "Who owes me" and "Whom I owe" summaries.
- **Settlement**: Mark debts as settled when paid.

### 🔐 Authentication
- **Secure Auth**: JWT-based authentication with password hashing (bcrypt).
- **Protected Routes**: All API endpoints are secured.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Architecture**: OOP (Controller-Service-Repository pattern)
- **Frontend**: Vanilla HTML/CSS/JS (served statically)

---

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or a connection string)

### Installation

1. **Clone the repository** (if applicable) or navigate to project folder.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Rename `.env.example` to `.env`
   - Update `MONGODB_URI` if needed (default: `mongodb://localhost:27017/expense-tracker`)
   - keys are pre-filled for development convenience.

4. **Build and Run**:
   ```bash
   # Development mode (auto-reload)
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

5. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Personal Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses (supports `page`, `limit`, `category`, `startDate`, `endDate`, `search`)
- `GET /api/expenses/:id` - Get specific expense
- `GET /api/expenses/summary` - Get monthly totals
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - List user's groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/members` - Add member (by email)
- `DELETE /api/groups/:id/members/:userId` - Remove member
- `DELETE /api/groups/:id` - Delete group

### Group Expenses & Splitting
- `POST /api/group-expenses` - Add shared expense (auto-splits)
- `GET /api/group-expenses/group/:groupId` - Call expenses for a group
- `GET /api/group-expenses/balances/who-owes-me` - Get receivables
- `GET /api/group-expenses/balances/whom-i-owe` - Get debts
- `PATCH /api/group-expenses/settle/:splitId` - Mark debt as settled

---

## Folder Structure

```
src/
 ├── controllers/    # Request handlers
 ├── services/       # Business logic
 ├── repositories/   # Database access
 ├── models/         # Mongoose models
 ├── routes/         # API routes
 ├── middlewares/    # Auth & Error handling
 ├── utils/          # Helpers (DB, Errors)
 ├── app.ts          # Express app setup
 └── server.ts       # Entry point
public/              # Static frontend files
```
