<div align="center">

<img src="frontend/public/favicon.svg" alt="Foundly Logo" width="80" height="80" />

# 🔍 Foundly

### *Find what's lost. Return what's found.*

A community-driven lost & found platform that connects people who've lost items with those who've found them.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔎 **Browse & Search** | Search items by keyword with real-time filtering |
| 🏷️ **Smart Filtering** | Filter by category, type (lost/found), and status |
| 📸 **Photo Uploads** | Attach images to help identify items |
| 📋 **Claim System** | Submit and manage claims on found items |
| 👤 **User Dashboard** | Track your posted items and submitted claims |
| 🛡️ **Admin Panel** | Platform-wide stats and user management |
| 🔐 **Secure Auth** | JWT-based authentication with protected routes |
| 📄 **Pagination** | Smooth browsing through large item lists |

---

## 🗂️ Item Categories

`Electronics` · `Documents` · `Clothing` · `Keys` · `Bags` · `Others`

---

## 🏗️ Tech Stack

```
foundly/
├── frontend/          React 19 + Vite + React Router v7
└── backend/           Node.js + Express 5 + MongoDB + Mongoose
```

| Layer | Technology |
|---|---|
| **UI** | React 19, React Router v7, Vite 8 |
| **API** | Node.js, Express 5 |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, bcryptjs |
| **File Uploads** | Multer |
| **Validation** | express-validator |
| **Testing** | Vitest, Testing Library, MSW, fast-check |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/foundly.git
cd foundly
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lostandfound
JWT_SECRET=your_secret_key_here
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Run the app

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | — |
| `POST` | `/api/auth/login` | Login and get token | — |
| `GET` | `/api/items` | List all items (paginated) | — |
| `GET` | `/api/items/:id` | Get item details | — |
| `POST` | `/api/items` | Post a new item | ✅ |
| `PUT` | `/api/items/:id` | Update an item | ✅ |
| `DELETE` | `/api/items/:id` | Delete an item | ✅ |
| `GET` | `/api/items/myitems` | Get current user's items | ✅ |
| `POST` | `/api/claims` | Submit a claim | ✅ |
| `GET` | `/api/admin/stats` | Platform statistics | 🛡️ Admin |

---

## 🧪 Running Tests

```bash
cd frontend
npm test
```

Tests use **Vitest** + **Testing Library** + **MSW** for API mocking, and **fast-check** for property-based testing.

---

## 📁 Project Structure

```
foundly/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth middleware
│   ├── models/          # Mongoose schemas (User, Item, Claim)
│   ├── routes/          # Express routers
│   ├── uploads/         # Uploaded item images
│   └── server.js        # Entry point
│
└── frontend/
    └── src/
        ├── api/         # Axios client
        ├── components/  # Reusable UI (Navbar, ItemCard, ClaimForm...)
        ├── context/     # Auth context
        ├── pages/       # Route-level views
        ├── routes/      # App routing
        └── test/        # Test setup & MSW handlers
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by the Hardik Khanduja

*Helping communities reconnect people with their belongings.*

</div>
