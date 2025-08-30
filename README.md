# 🗳️ Voting Application

This is a backend application for a **voting system** where users can vote for candidates. It provides functionalities for **user authentication**, **candidate management**, and **secure voting**. The system uses **JWT authentication** and **role-based access control** to ensure security.

---

## 🚀 Features

- User **sign up** and **login** with **Aadhar Card Number** and **Password**
- Users can **view the list of candidates**
- Users can **vote for a candidate** *(only once)*
- Admins can **add**, **update**, and **delete** candidates
- Admins **cannot vote**
- **JWT-based authentication** for secure APIs
- *(Planned)* Upload **party logos**, **candidate photos**, and **voter photos** using **Multer + Cloudinary**
- *(Planned)* Docker integration and production deployment

---

## 🛠️ Technologies Used

- **Node.js** - Backend runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JSON Web Token (JWT)** - Authentication
- **Multer** *(Planned)* - Image uploads
- **Cloudinary** *(Planned)* - Image storage
- **Docker** *(Planned)* - Containerization

---

## 📦 Installation

### 1️⃣ Clone the repository:






The server will start at: **http://localhost:8000**

---

## 🔑 API Endpoints

### **Authentication**
| Method | Endpoint               | Description                   | Access |
|--------|------------------------|-------------------------------|--------|
| POST   | `/registerCandidate`   | Register a new candidate/user | Public |
| POST   | `/loginCandidate`      | Login with Aadhar & password  | Public |

---

### **User Profile**
| Method | Endpoint     | Description       | Access |
|--------|-------------|-------------------|--------|
| GET    | `/profile`  | Get user profile  | User   |

---

### **Candidates**
| Method | Endpoint          | Description             | Access |
|--------|-------------------|-------------------------|--------|
| GET    | `/allCandidates`  | Get list of candidates  | Public |
| PUT    | `/:candidateID`   | Update candidate        | Admin  |
| DELETE | `/:candidateID`   | Delete candidate        | Admin  |

---

### **Voting**
| Method | Endpoint               | Description            | Access |
|--------|------------------------|------------------------|--------|
| GET    | `/vote/:candidateID`   | Vote for a candidate   | User   |
| GET    | `/vote/count`          | Get total vote counts  | Public |

---


---

## 🛠️ Upcoming Features

- Upload **candidate logos**, **party symbols**, and **voter profile photos**
- Use **Multer + Cloudinary** for image storage
- Docker support for containerized deployment
- Deploy the project to **Render / Vercel / AWS**

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Shahab Fardeen**  
🔗 [GitHub](https://github.com/Shahab-72)


