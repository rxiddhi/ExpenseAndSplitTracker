# Expense Tracker & Splitter

Manage your money and split bills with friends.

This is a web app to help you track expenses. It also helps you split bills with groups.

Note: Does not use MongoDB. Uses a local json file "data.json" to save everything.

---

## Features

### Personal Finances
*   Track daily expenses.
*   Search by title or category.
*   See monthly summaries.

### Group Splitting
*   Create Groups.
*   Split expenses equally.
*   See who owes you money.
*   Mark debts as settled.

### Security
*   Login and Register.
*   Passwords are encrypted.

---

## Tech Stack

*   Backend: Node.js & Express.js
*   Language: TypeScript
*   Database: Local JSON file
*   Frontend: HTML, CSS, JS

---

## How to Run

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the server:
    ```bash
    npm run dev
    ```

3.  Open browser:
    http://localhost:5001

---

## API

*   Auth routes: /api/auth/register, /api/auth/login
*   Expense routes: /api/expenses
*   Group routes: /api/groups
*   Settlement routes: /api/group-expenses/balances/

Happy Tracking
