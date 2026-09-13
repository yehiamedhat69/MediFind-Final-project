\# MediFind



\## Medicine Availability \& Reservation Platform



MediFind is a full-stack web platform designed to help users search for medicines, check their availability in pharmacies, and make medicine reservations. The platform provides dedicated functionality for customers, pharmacies, and administrators.



\---



\## 1. Project Name \& Description



\*\*Project Name:\*\* MediFind



\*\*Description:\*\*

MediFind connects customers with pharmacies through a centralized platform for medicine search, availability checking, and reservations.



The system supports different user roles, including customers, pharmacies, and administrators, with secure authentication and role-based access control.



\---



\## 2. Main Features



\### Customer Features



\* User registration and login.

\* Secure authentication using JWT.

\* Search for medicines.

\* Check medicine availability.

\* View pharmacy information.

\* Make and manage medicine reservations.

\* Receive notifications.

\* Manage user account information.



\### Pharmacy Features



\* Pharmacy authentication and management.

\* Manage medicines and inventory.

\* Update medicine stock and availability.

\* Manage customer reservations.

\* Access pharmacy-related information.



\### Admin Features



\* Administrative authentication and authorization.

\* Manage users and pharmacies.

\* Manage medicines and inventory.

\* Monitor reservations.

\* Manage platform data.



\### Security Features



\* JWT-based authentication.

\* Password hashing using bcryptjs.

\* Role-based authorization.

\* CORS configuration.

\* Helmet security middleware.

\* Centralized error handling.



\---



\## 3. Technologies Used



\### Frontend



\* React 19

\* Vite

\* React Router

\* Lucide React

\* JavaScript

\* ESLint



\### Backend



\* Node.js

\* Express.js

\* MongoDB

\* Mongoose

\* JWT

\* bcryptjs

\* CORS

\* Helmet

\* dotenv



\### Database



\* MongoDB

\* Mongoose



\---



\## 4. Installation Steps



\### Prerequisites



Make sure the following are installed:



\* Node.js

\* npm

\* MongoDB

\* Git



\### Clone the Repository



```bash

git clone https://github.com/yehiamedhat69/MediFind-Final-project.git

cd MediFind-Final-project

```



\### Install Backend Dependencies



```bash

cd Backend

npm install

```



\### Install Frontend Dependencies



Open a new terminal and run:



```bash

cd Frontend

npm install

```



\---



\## 5. Required Environment Variables



Create a `.env` file inside the `Backend` directory.



Use the following variables:



```env

PORT=3000

MONGO\_URI=your\_mongodb\_connection\_string\_here

JWT\_SECRET=your\_jwt\_secret\_key\_here

```



\### Environment Variables



| Variable     | Description                            |

| ------------ | -------------------------------------- |

| `PORT`       | Port used by the backend server        |

| `MONGO\_URI`  | MongoDB connection string              |

| `JWT\_SECRET` | Secret key used for JWT authentication |



> Never commit your `.env` file or expose your MongoDB credentials or JWT secret.



\---



\## 6. How to Run Backend and Frontend



\### Run Backend



Navigate to the Backend directory:



```bash

cd Backend

```



For development:



```bash

npm run dev

```



For normal execution:



```bash

npm start

```



The backend runs on the port specified in the `.env` file.



\### Run Frontend



Open another terminal and navigate to the Frontend directory:



```bash

cd Frontend

```



Run the development server:



```bash

npm run dev

```



Vite will display the local development URL in the terminal.



\### Build Frontend



To create a production build:



```bash

npm run build

```



\---



\## 7. API Overview



The backend provides REST API endpoints for the main MediFind functionalities.



\### Authentication



\* User registration

\* User login

\* JWT authentication

\* Authorization



\### Users



\* User account management

\* User profile operations



\### Pharmacies



\* Pharmacy management

\* Pharmacy-related operations



\### Medicines



\* Medicine management

\* Medicine search



\### Inventory



\* Inventory management

\* Medicine stock and availability



\### Reservations



\* Create and manage medicine reservations



\### Notifications



\* Notification management



\### Administration



\* Administrative operations

\* User and pharmacy management



The API routes are organized inside:



```text

Backend/src/routes/

```



Available route modules include:



```text

adminRoutes.js

authRoutes.js

inventoryRoutes.js

medicineRoutes.js

medicineSearchRoutes.js

notificationRoutes.js

pharmacyRoutes.js

reservationRoutes.js

userRoutes.js

```



\---



\## 8. Project Structure



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

│   └── .env.example

│

├── Database/

│   ├── mudels/

│   ├── queries/

│   ├── seed/

│   └── README.md

│

├── Frontend/

│   ├── public/

│   ├── src/

│   ├── package.json

│   └── vite.config.js

│

├── docs/

├── package.json

└── README.md

```



\---



\## 9. Team Members and Contributions



\### Database



| Team Member                             | Role     | Contributions                                   |

| --------------------------------------- | -------- | ----------------------------------------------- |

| Abdulrahman Mohamed Mohamed Abdulrahman | Database | Database development and database-related tasks |



\### Backend



| Team Member      | Role    | Contributions          |

| ---------------- | ------- | ---------------------- |

| Yehia Medhat     | Backend | Tasks 1, 3, 4, 8, 9    |

| Abdelrahman Samy | Backend | Tasks 2, 5, 10, 11, 14 |

| Hossam           | Backend | Tasks 6, 7, 12, 13, 15 |



\### Frontend



| Team Member                  | Role     | Contributions                     |

| ---------------------------- | -------- | --------------------------------- |

| Abdullah Fathy Mohamed Fathy | Frontend | Tasks 2, 10, 11                   |

| Taha Ashraf Taha             | Frontend | Tasks 3, 14, 15                   |

| Shahd Mohy                   | Frontend | Tasks 3, 13, 17                   |

| Adham Marwan                 | Frontend | Tasks 1, 4, 5, 6, 7, 8, 9, 12, 18 |



\---



\## 10. Demo / Live Demo



\*\*Live Demo:\*\*

https://medi-find-final-project.vercel.app



\## GitHub Repository



\*\*Repository:\*\*

https://github.com/yehiamedhat69/MediFind-Final-project



\---



\## License



This project was developed as a team project for educational and practical purposes.



