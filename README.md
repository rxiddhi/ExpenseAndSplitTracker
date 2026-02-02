# 💸 Expense Tracker & Splitter

**Manage your money and split bills with friends—hassle-free.**

Welcome to the Expense Tracker! This is a robust, full-stack application designed to make personal finance and group settlements easy. Whether you're tracking your daily coffee runs or splitting a vacation bill with 10 friends, this app covers it all.

> **Note:** This project has been optimized for simplicity. It uses a **local JSON file system** for data storage, meaning you don't need to install or configure MongoDB to get started. Just standard Node.js and you're good to go!

---

## ✨ Features

### 💰 Master Your Personal Finances
*   **Track Everything**: Easily log your daily expenses.
*   **Find It Fast**: Search your history by title, valid dates, or categories.
*   **Stay Organized**: See exactly how much you spent on "Food" vs "Transport" with monthly summaries.

### 🤝 Group Splitting Made Simple
*   **Create Groups**: Perfect for roommates, trips, or events.
*   **Fair Splitting**: Add an expense, and we automatically divide it equally among members.
*   **Debt Tracking**: No more "I forgot I owed you." See clear "Who owes me" and "Whom I owe" dashboards.
*   **Settle Up**: Mark debts as paid with a single click.

### 🔒 Secure & Private
*   User-friendly sign-up and login.
*   Password encryption to keep your account safe.

---

## 🛠️ Tech Stack

We built this with modern, reliable web technologies:

*   **Backend**: Node.js & Express.js
*   **Language**: TypeScript (for reliable, bug-free code)
*   **Database**: Custom **FileStore** (Local JSON storage - *No external DB required!*)
*   **Frontend**: Clean Vanilla HTML/CSS/JS

---

## 🚀 Getting Started

You can have this running on your machine in less than 2 minutes.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v14 or higher)

### Installation

1.  **Clone the repo** (or download the files):
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the server**:
    ```bash
    npm run dev
    ```
    *This will start the backend on port 5001 and serve the frontend files.*

4.  **Open your browser**:
    Go to `http://localhost:5001`

---

## 📚 API Overview

The backend provides a full REST API. Here are a few endpoints you might interact with:

*   **Auth**: `/api/auth/register`, `/api/auth/login`
*   **Expenses**: POST/GET `/api/expenses`
*   **Groups**: Create groups, add members, and manage bills at `/api/groups`.
*   **Settlements**: Check your balances at `/api/group-expenses/balances/`.

---

*Happy Tracking!* 📈
