# Blood Bank Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application designed to manage blood donations, inventory, hospitals, and administrative tasks efficiently. 

## 🚀 Features

- **Role-Based Access Control:** Role-specific dashboards and features for:
  - **Admin:** Manage donors, hospitals, and organisations.
  - **Donor:** Track donation history and view where their blood was used.
  - **Hospital:** Request blood, track received blood inventory, and view consumption.
  - **Organisation:** Manage blood inventory, track incoming donations (in) and outgoing supplies (out).
- **Authentication & Security:** Secure login/registration with JWT (JSON Web Tokens) and password hashing via bcrypt.
- **Inventory Management:** Track blood groups (O+, O-, AB+, AB-, A+, A-, B+, B-) and monitor their inflow/outflow.
- **Analytics Dashboard:** View statistics and analytics of available blood group stock.
- **Responsive UI:** Built with React for a fast and seamless user experience.

## 🛠️ Tech Stack

### Frontend
- **React.js:** UI components and view layer.
- **Redux Toolkit:** Global state management (Authentication, user data).
- **React Router Dom:** For client-side routing and protected routes.
- **Axios:** For making HTTP requests to the backend API.
- **React Toastify:** For elegant notifications.

### Backend
- **Node.js & Express.js:** Server runtime and RESTful API framework.
- **MongoDB & Mongoose:** NoSQL database and local data modeling.
- **JSON Web Token (JWT):** For securing endpoints and managing sessions.
- **Bcrypt & Bcryptjs:** For encrypting and verifying user passwords.
- **Morgan & Cors:** Middleware for request logging and cross-origin resource sharing.

## 📂 Project Structure

```text
blood-bank-management-system/
├── client/              # React frontend application
│   ├── public/
│   └── src/
│       ├── components/  # Reusable UI components & Layouts
│       ├── pages/       # Complete pages (Dashboard, Admin, Auth)
│       ├── redux/       # Redux slices and store configuration
│       └── services/    # API calling functions
├── config/              # Database connection setup
├── controllers/         # Backend workflow logic (Auth, Inventory, Admin)
├── middlewares/         # Route protection (JWT verify, Admin verify)
├── models/              # Mongoose schemas (User, Inventory, UrgentRequest)
├── routes/              # Express API route definitions
├── server.js            # Main backend entry point
└── .env                 # Environment variables
```

## ⚙️ Installation & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- MongoDB connection URI (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/biswa069/blood-bank-management-system.git
cd blood-bank-management-system
```

### 2. Install Dependencies
Install the backend dependencies from the root directory:
```bash
npm install
```
Install the frontend dependencies:
```bash
cd client
npm install
cd ..
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add the following configuration:
```env
PORT=8080
DEV_MODE=development
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 4. Run the Application
You can run both the Express backend and the React frontend concurrently from the root directory using the `dev` script:
```bash
npm run dev
```

- Node Server will run on `http://localhost:8080`
- React Client will run on `http://localhost:3000` (proxy configured to redirect API calls to the backend running on 8080).

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.
