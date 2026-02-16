\# Hospital Management System API



\*\*Course:\*\* Applied DevOps (F21AO)  

\*\*Group:\*\* Group 10  

\*\*Developer:\*\* Muhammad Manneh  

\*\*Modules:\*\* Authentication, Patient Management, Ward Admission, Doctor Management, Appointment Booking



\## Project Overview



A comprehensive hospital management REST API built with Node.js, Express, and MongoDB.



\## Features



\### 1. Authentication Module

\- User registration with role-based access

\- JWT-based authentication

\- Secure password hashing



\### 2. Patient Management (OPD)

\- Patient registration

\- Auto-generated patient IDs (PAT000001)

\- Patient search and retrieval

\- Medical history tracking



\### 3. Ward Admission

\- Patient admission to wards

\- Vital signs tracking (temperature, BP, pulse)

\- Discharge management

\- Auto-generated admission IDs (ADM000001)



\### 4. Doctor Management

\- Doctor profile registration

\- Specialization tracking

\- Availability scheduling

\- Consultation fee management



\### 5. Appointment Booking

\- Book patient appointments

\- Schedule management

\- Appointment status tracking

\- Patient appointment history



\## Tech Stack



\- \*\*Backend:\*\* Node.js, Express.js

\- \*\*Database:\*\* MongoDB Atlas (Cloud)

\- \*\*Authentication:\*\* JWT (JSON Web Tokens)

\- \*\*Security:\*\* Bcrypt, Helmet, CORS

\- \*\*Testing:\*\* Jest, Supertest

\- \*\*API Testing:\*\* Postman



\## Installation

```bash

npm install

```



\## Configuration



Create `.env` file:

```

PORT=5000

MONGODB\_URI=your\_mongodb\_connection\_string

JWT\_SECRET=your\_jwt\_secret

JWT\_EXPIRE=24h

```



\## Running the Application

```bash

\# Development

npm run dev



\# Production

npm start



\# Tests

npm test

```



&nbsp;API Endpoints



&nbsp;Authentication

\- POST `/api/auth/register` - Register user

\- POST `/api/auth/login` - Login user

\- GET `/api/auth/me` - Get current user



&nbsp;Patients

\- POST `/api/patients` - Register patient

\- GET `/api/patients` - Get all patients

\- GET `/api/patients/:id` - Get patient by ID

\- PUT `/api/patients/:id` - Update patient

\- DELETE `/api/patients/:id` - Delete patient



&nbsp;Admissions

\- POST `/api/admissions` - Admit patient

\- GET `/api/admissions` - Get all admissions

\- GET `/api/admissions/:id` - Get admission by ID

\- PUT `/api/admissions/:id/vitals` - Add vital signs

\- PUT `/api/admissions/:id/discharge` - Discharge patient



&nbsp;Doctors

\- POST `/api/doctors` - Register doctor

\- GET `/api/doctors` - Get all doctors

\- GET `/api/doctors/:id` - Get doctor by ID

\- PUT `/api/doctors/:id` - Update doctor



&nbsp;Appointments

\- POST `/api/appointments` - Book appointment

\- GET `/api/appointments` - Get all appointments

\- GET `/api/appointments/:id` - Get appointment by ID

\- PUT `/api/appointments/:id` - Update appointment

\- PUT `/api/appointments/:id/cancel` - Cancel appointment



&nbsp;Development Team



\- Muhammad Manneh - REST APIs, Jest Testing, Agile Implementation

\- 









