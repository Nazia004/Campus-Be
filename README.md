# Campusync API — Backend Service

This is the backend service for **Campusync**, a role-based student engagement and placement platform. It provides a robust RESTful API built with Node.js, Express, and MongoDB to handle authentication, data management, and media uploads.

---

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt.js
- **File Handling:** Multer & Cloudinary SDK
- **Middleware:** CORS, Helmet (recommended), Dotenv

---

## 🛠️ API Architecture

The project follows a standard MVC-inspired architecture:
- `controllers/`: Logic for handling requests and generating responses.
- `models/`: Mongoose schemas and database interaction logic.
- `routes/`: Express route definitions.
- `middleware/`: Custom auth and validation logic.
- `utils/`: Reusable helper functions.

---

## 📡 Key API Endpoints

| Route | Description | Auth Required |
| :--- | :--- | :--- |
| `POST /api/auth/register` | Register a new user | No |
| `POST /api/auth/login` | Authenticate user & get token | No |
| `GET /api/admin/*` | Administrative management routes | Yes (Admin) |
| `GET /api/club/*` | Club activity and membership routes | Yes |
| `GET /api/student/*` | Student profile and application routes | Yes (Student) |
| `GET /api/faculty/*` | Faculty-specific management routes | Yes (Faculty) |
| `GET /api/placement/*` | Placement and career opportunity routes | Yes |
| `POST /api/upload` | Handle media uploads to Cloudinary | Yes |

---

## 📂 Project Structure

```text
backend/
├── config/             # Database and environment configuration
├── controllers/        # Route controllers (Business logic)
├── middleware/         # Auth and custom middleware
├── models/             # Mongoose models (Database schemas)
├── routes/             # API route definitions
├── scripts/            # Database seeding and maintenance scripts
├── utils/              # Helper functions (API response formatters, etc.)
├── server.js           # Entry point
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── package.json        # Dependencies and scripts
```

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nazia004/Campus-Be.git
   cd Campus-Be
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Copy `.env.example` to `.env`.
   - Update the `MONGO_URI`, `JWT_SECRET`, and Cloudinary credentials.

4. **Run the server:**
   - **Development:** `npm run dev` (uses nodemon)
   - **Production:** `npm start`

---

## 🤝 Contributing

Please feel free to submit issues or pull requests to improve the API.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).