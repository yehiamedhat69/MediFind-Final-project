# MediFind

## Medicine Availability & Reservation Platform

MediFind is a full-stack web platform that helps users search for medicines, check their availability in pharmacies, and make reservations. The system connects customers, pharmacies, and administrators through a secure and organized platform.

---

## Main Features

* Search for medicines by name.
* Check medicine availability in pharmacies.
* View pharmacy and medicine information.
* Reserve available medicines.
* Customer account management.
* Pharmacy management.
* Inventory management.
* Notifications.
* Admin management and control.
* Authentication and authorization using JWT.
* Role-based access control for different users.
* Secure password hashing.
* MongoDB database integration.

---

## Technologies Used

### Frontend

* React.js
* Vite
* React Router
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* CORS
* Helmet
* dotenv

### Database

* MongoDB
* Mongoose

---

## Project Structure

```text
MediFind-Final-project/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
│
├── Database/
│   ├── mudels/
│   ├── queries/
│   ├── seed/
│   └── README.md
│
├── Frontend/
│   └── ...
│
├── docs/
├── package.json
├── package-lock.json
└── README.md
```

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yehiamedhat69/MediFind-Final-project.git
cd MediFind-Final-project
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd Frontend
npm install
```

### 4. Configure Environment Variables

Inside the `Backend` folder, create a `.env` file.

Use the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
```

Replace the values with your own MongoDB connection string and JWT secret.

---

## Database Setup

MediFind uses MongoDB with Mongoose.

Make sure MongoDB is running and the `MONGO_URI` environment variable is configured correctly.

The database also includes seed data that can be used to populate the required initial data.

From the project root:

```bash
npm install
npm run seed
```

---

## How to Run the Backend

Navigate to the Backend folder:

```bash
cd Backend
```

For development:

```bash
npm run dev
```

Or to run normally:

```bash
npm start
```

The backend
runs on:

```text
http://localhost:3000
```

---

## How to Run the Frontend

Navigate to the Frontend folder:

```bash
cd Frontend
```

Run:

```bash
npm run dev
```

Vite will provide the local development URL in the terminal, usually:

```text
http://localhost:5173
```

---

## API Overview

The backend provides RESTful API endpoints for:

* Authentication
* Users
* Medicines
* Medicine Search
* Pharmacies
* Inventory
* Reservations
* Notifications
* Admin operations

Main route files include:

```text
/auth
/users
/medicines
/medicine-search
/pharmacies
/inventory
/reservations
/notifications
/admin
```

The API implementation can be found inside:

```text
Backend/src/routes/
```

---

## Team Members & Contributions

| Team Member                             | Contribution                               |
| --------------------------------------- | ------------------------------------------ |
| Abdulrahman Mohamed Mohamed Abdulrahman | Database                                   |
| Yehia Medhat                            | Tasks 1, 3, 4, 8, 9 + Backend              |
| Abdelrahman Samy                        | Tasks 2, 5, 10, 11, 14 + Backend           |
| Hossam                                  | Tasks 6, 7, 12, 13, 15 + Backend           |
| Abdullah Fathy Mohamed Fathy            | Frontend Tasks 2, 10, 11                   |
| Taha Ashraf Taha                        | Frontend Tasks 3, 14, 15                   |
| Shahd Mohy                              | Frontend Tasks 3, 13, 17                   |
| Adham Marwan                            | Frontend Tasks 1, 4, 5, 6, 7, 8, 9, 12, 18 |

---

## Demo

Live Demo:

https://medi-find-final-project.vercel.app

---

## GitHub Repository

https://github.com/yehiamedhat69/MediFind-Final-project

---

## License

This project was developed as part of an academic team project.
