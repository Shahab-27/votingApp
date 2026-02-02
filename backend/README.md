# 🗳️ Voting Application

A robust backend for a **voting system** supporting secure user authentication, candidate management, and voting operations. Built with **Node.js**, **Express**, and **MongoDB**, it features **JWT authentication**, **role-based access control**, and is structured for scalability and maintainability.

---

## 📁 Project Structure

```
g:\votingApp
│
├── src/
│   ├── controllers/
│   │   ├── candidates.controller.js
│   │   └── voter.controller.js
│   ├── DB/
│   │   └── server.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── candidates.model.js
│   │   └── voter.model.js
│   ├── routes/
│   │   ├── candidate.routes.js
│   │   └── voter.routes.js
│   └── utils/
│       └── generateToken.utils.js
│
├── .env.example
├── package.json
├── README.md
└── ...
```

---

## 🚀 Features

- **User Registration & Login** (Aadhar Card Number & Password)
- **JWT Authentication** & **Role-based Access Control**
- **Candidate Management** (CRUD for Admins)
- **Voting** (Users can vote only once; Admins cannot vote)
- **View Candidates & Vote Counts**
- **Planned:** Image uploads (Multer + Cloudinary), Dockerization, Production deployment

---

## 🛠️ Technologies

- **Node.js** / **Express.js**
- **MongoDB** / **Mongoose**
- **JWT** for authentication
- **Multer** & **Cloudinary** *(Planned)*
- **Docker** *(Planned)*

---

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Shahab-27/votingApp.git
   cd votingApp
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values:
     ```
     PORT=8000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

4. **Start the server:**
   ```sh
   npm start
   ```
   The server runs at: [http://localhost:8000](http://localhost:8000)

---

## 🔑 API Endpoints

### Authentication

| Method | Endpoint             | Description                   | Access  |
|--------|----------------------|-------------------------------|---------|
| POST   | `/registerCandidate` | Register a new user/candidate | Public  |
| POST   | `/loginCandidate`    | Login with Aadhar & password  | Public  |

---

### User Profile

| Method | Endpoint    | Description      | Access |
|--------|-------------|------------------|--------|
| GET    | `/profile`  | Get user profile | User   |

---

### Candidates

| Method | Endpoint              | Description             | Access |
|--------|-----------------------|-------------------------|--------|
| GET    | `/allCandidates`      | List all candidates     | Public |
| POST   | `/addCandidate`       | Add a candidate         | Admin  |
| PUT    | `/update/:candidateID`| Update candidate        | Admin  |
| DELETE | `/delete/:candidateID`| Delete candidate        | Admin  |

---

### Voting

| Method | Endpoint                | Description            | Access |
|--------|-------------------------|------------------------|--------|
| POST   | `/vote/:candidateID`    | Vote for a candidate   | User   |
| GET    | `/vote/count`           | Get total vote counts  | Public |

---

## 🧩 Environment Variables

Create a `.env` file in the root with:

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## 🛡️ Security

- **Passwords** are hashed before storage.
- **JWT** tokens secure all protected endpoints.
- **Role-based access** ensures only admins can manage candidates.

---

## 🛠️ Upcoming Features

- Upload **candidate logos**, **party symbols**, and **voter profile photos**
- **Multer + Cloudinary** for image storage
- **Docker** support for containerized deployment
- Production deployment (Render / Vercel / AWS)

---