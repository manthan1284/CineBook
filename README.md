# 🎬 CineBook — Premium Movie Ticket Booking Platform

CineBook is a full-stack MERN application providing a modern, seamless movie ticket booking experience with real-time seat selection, interactive theater maps, administrative management, and secure authentication.

---

## ✨ Features

- **User Authentication**: Secure user registration, login, and JWT-based session management.
- **Movie Discovery**: Explore trending, currently running, and upcoming movies with rich details, trailers, and ratings.
- **Showtimes & Theatres**: Browse shows by date, screen, and cinema location.
- **Interactive Seat Selection**: Real-time visual seat layout with temporary seat locking to prevent double bookings.
- **Booking & Tickets**: Booking confirmation with digital tickets and order history.
- **Admin Dashboard**: Full administrative suite for managing movies, screens, theatres, shows, and user bookings.
- **User Feedback & Ratings**: Collect and showcase user reviews for movies.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 18** with **Vite**
- **Tailwind CSS / Custom Styling**
- **Lucide Icons**
- **Axios** for API requests

### Backend (`server/`)
- **Node.js** & **Express.js**
- **MongoDB** with **Mongoose**
- **JWT (JSON Web Tokens)** & **Bcrypt.js**
- **Morgan** & **CORS**

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/manthan1284/CineBook.git

# Navigate to project directory
cd CineBook

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` folder based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cinebook
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Seed Database (Optional)

```bash
cd server
npm run seed
```

### 5. Run the Application

From the root directory:

```bash
# Run both frontend & backend concurrently (or run in separate terminals)
# Server:
npm run server

# Client:
npm run client
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📂 Project Structure

```
CineBook/
├── client/              # React frontend (Vite)
│   ├── public/          # Static assets
│   ├── src/             # React components, pages, hooks, state
│   └── package.json
├── server/              # Express backend
│   ├── config/          # Database configuration
│   ├── controllers/     # Route logic & controllers
│   ├── middleware/      # Auth, error, and validation middleware
│   ├── models/          # Mongoose database models
│   ├── routes/          # API route definitions
│   ├── seeds/           # Database seed scripts
│   ├── server.js        # Main server entrypoint
│   └── package.json
├── .gitignore           # Git ignore configuration
└── README.md            # Project documentation
```

---

## 📄 License

This project is licensed under the MIT License.
