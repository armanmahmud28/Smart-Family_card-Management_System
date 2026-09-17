# Smart Family Card Management System

## DBMS Lab Project

The **Smart Family Card Management System** is a database-driven web application developed as a project for the Database Management System lab. It provides a digital platform for citizens to apply for family cards and allows administrators to review applications, manage beneficiaries, monitor payments, and handle complaints.

## Project Team

- **M. Arman Mahmud**
- **Shihab**
- **Badhan**
- **Ruhul**

## Project Objectives

- Store citizen, family, application, payment, and complaint data in a structured relational database.
- Reduce manual paperwork in the family card application process.
- Allow administrators to verify and manage applications efficiently.
- Track family card eligibility, approval status, and payment history.
- Demonstrate practical use of database relationships, constraints, authentication, and CRUD operations.

## Main Features

### Citizen Portal

- Citizen registration and login
- Family card application submission
- Family member and income information management
- Application status tracking
- Digital family card information
- Payment history viewing
- Complaint submission and tracking

### Administrator Portal

- Secure administrator login
- Dashboard with application and payment statistics
- Application review and approval/rejection
- Citizen and family information management
- Payment record management
- Complaint resolution
- Administrative activity auditing

## Database Concepts Used

- Relational database design
- Primary and foreign keys
- One-to-many relationships
- Data validation and constraints
- Normalized tables for citizens, families, applications, cards, payments, and complaints
- SQL queries for insertion, retrieval, updating, and deletion
- Sequelize ORM for database communication

## Technology Stack

| Layer            | Technology                      |
| ---------------- | ------------------------------- |
| Frontend         | HTML5, CSS3, Vanilla JavaScript |
| Backend          | Node.js, Express.js             |
| Database         | MySQL 8.0+                      |
| ORM              | Sequelize                       |
| Authentication   | JWT and bcrypt                  |
| Supporting Tools | Multer, Joi, Winston, Node Cron |

## Project Structure

```text
smart-family-card-system-final/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request and business logic
│   ├── db/              # Database migration files
│   ├── jobs/            # Scheduled payment jobs
│   ├── middleware/      # Authentication and request middleware
│   ├── models/          # Sequelize database models
│   ├── routes/          # API routes
│   ├── services/        # Eligibility, payment, fraud, and audit services
│   ├── utils/           # Helpers and validators
│   ├── server.js        # Backend entry point
│   └── seedAdmin.js     # Administrator seed script
├── db/
│   └── schema.sql       # MySQL database schema
├── frontend/            # Citizen and administrator web pages
└── README.md
```

## Database Entities

The database includes tables for:

- Divisions, districts, and upazilas
- Citizens and administrators
- Families and family members
- Applications and family cards
- Income records and payments
- Complaints and audit logs
- OTP verification and refresh tokens

## Installation and Setup

### Prerequisites

- Node.js 18 or later
- MySQL 8.0 or later, or XAMPP
- A modern web browser

### 1. Create the Database

Start MySQL and create the project database:

```sql
CREATE DATABASE family_card_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Import the schema from `db/schema.sql` using MySQL Workbench, phpMyAdmin, or the MySQL command line.

### 2. Configure the Backend

Open a terminal in the backend directory and install the dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` and configure the database connection. The main values are:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=family_card_system
DB_PORT=3306
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### 3. Create the Default Administrator

```bash
node seedAdmin.js
```

### 4. Start the Backend

```bash
npm run dev
```

The backend will run at `http://localhost:5000`.

### 5. Open the Frontend

Open `frontend/index.html` with the VS Code Live Server extension or another local web server. The frontend communicates with the backend through the API.

## Example API Areas

- `/api/auth` - registration, login, OTP, and password management
- `/api/applications` - citizen applications
- `/api/admin` - administrative application management
- `/api/families` - family and family member information
- `/api/payments` - payment records and disbursement operations
- `/api/grievances` - complaints and resolutions
- `/api/audit` - administrative audit logs

## Academic Purpose

This project demonstrates how a relational database can support a complete information system. It combines database schema design with a web-based interface and server-side APIs to model a real-world social welfare management process.

## License

This project was developed for academic purposes as part of a Database Management System lab course.
