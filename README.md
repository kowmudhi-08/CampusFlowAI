# CampusFlow AI — Complete Full-Stack College Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Flyway](https://img.shields.io/badge/Flyway-10-red.svg)](https://flywaydb.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

**CampusFlow AI** is an intelligent, full-stack college management system designed to centralize academic, administrative, and placement activities within higher education institutions. Built with Spring Boot 3, React 18, Vite, TypeScript, MySQL 8, and a Python FastAPI machine learning microservice.

---

## Key Features

- **Role-Based Access Control (RBAC)**: Dedicated portals and navigational sidebars for **Administrators**, **Faculty Members**, and **Students**.
- **Initial Single-Admin Flow**: Secure initial Administrator setup endpoint (`/api/v1/auth/setup-admin`), locked down automatically once the first administrator account is created.
- **Zero Seed Data Policy**: Starts with a completely empty business database. Schema creation handled by Flyway migrations without sample or fake data.
- **Academic Administration**: Manage departments, academic calendars, student and faculty directories, course curricula, and class enrollments.
- **Attendance Roll-Call**: Course-wise attendance rosters with one-click marking (Present / Absent / Late) and automatic low-attendance warnings (< 75%).
- **Examinations & Marksheets**: Midterm/Final/Quiz scheduling, grade entry rosters, and one-click score publication.
- **Coursework & Assignments**: Homework prompts, file/text submissions, and instructor grading interfaces with feedback remarks.
- **Campus Notice Bulletin**: Role-targeted bulletin board (All, Students, Faculty).
- **Placement & Career Cell**: Corporate drives with CGPA cutoffs, candidate applications, and status pipeline tracking (Shortlisted, Selected, Rejected).
- **AI Academic Diagnostics**: Microservice powered by Scikit-Learn Ridge Regression forecasting academic trajectories and placement readiness, featuring transparent data-sufficiency fallback when records are insufficient.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts |
| **Backend** | Java 17+, Spring Boot 3.3.4, Maven, Spring Data JPA, Hibernate, Spring Security 6, JJWT 0.12.6, Flyway |
| **Database** | MySQL 8.x (15 normalized relational tables, foreign key constraints, indexes) |
| **AI / ML** | Python 3.11, FastAPI, Uvicorn, Scikit-Learn, Pandas, NumPy |
| **API Docs** | SpringDoc OpenAPI 3, Swagger UI (`/swagger-ui/index.html`) |

---

## Project Structure

```
CampusFlow AI/
├── backend/                  # Spring Boot 3.3.4 REST API
│   ├── src/main/java/        # Entities, Repositories, Services, Controllers, Security
│   ├── src/main/resources/   # application.yml, Flyway migrations (V1__init_schema.sql)
│   ├── src/test/java/        # JUnit 5 & Mockito test suites
│   └── pom.xml
├── frontend/                 # React 18 + Vite + TypeScript application
│   ├── src/                  # Components, Contexts, Pages, API services, Types
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── ai-service/               # Python FastAPI machine learning service
│   ├── main.py               # FastAPI endpoints & CORS
│   ├── ml_engine.py          # Scikit-Learn Ridge Regression engine
│   ├── models.py             # Pydantic schemas
│   └── requirements.txt
├── database/
│   └── schema.sql            # Master DDL schema reference
├── docs/                     # System architecture, API docs, user guide
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

Ensure the following runtimes are installed on your machine:

- **Java JDK**: 17 or later (JDK 25 / 21 / 17 supported)
- **Apache Maven**: 3.8+ (`mvn`)
- **Node.js**: 18+ and `npm`
- **Python**: 3.10+ (`python`)
- **MySQL Server**: 8.0+ running on port `3306`

---

## Getting Started (Step-by-Step Instructions)

### 1. Database Setup (MySQL)

Create the `campusflow` database in your local MySQL instance:

```sql
CREATE DATABASE campusflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update your MySQL credentials in `backend/src/main/resources/application.yml` or through environment variables:
```properties
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/campusflow?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
```

---

### 2. Run the Python AI Microservice

In a new terminal window:

```powershell
cd "ai-service"

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI microservice on port 8000
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- Verify AI health: `http://localhost:8000/health`

---

### 3. Run the Spring Boot Backend

In a second terminal window:

```powershell
cd "backend"

# Run tests and build backend JAR
mvn clean package

# Run the Spring Boot backend
mvn spring-boot:run
```

- Backend REST API: `http://localhost:8080/api/v1`
- Interactive Swagger UI: `http://localhost:8080/swagger-ui/index.html`

Flyway will automatically run on startup and establish all 15 relational tables with zero dummy records.

---

### 4. Run the React Frontend

In a third terminal window:

```powershell
cd "frontend"

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

- Frontend Application: `http://localhost:5173`

---

## Initial System Initialization

1. Open your browser and navigate to `http://localhost:5173/`.
2. The application will detect an empty database and navigate to the **Initial Admin Setup** screen (`/setup-admin`).
3. Enter your Administrator credentials (name, email, password) and click **Create Administrator**.
4. Once completed, you are logged in to the **Admin Dashboard** and the setup endpoint is permanently locked.
5. Create Academic Sessions, Departments, Faculty, and Students to begin institutional operations!

---

## Running Automated Tests

### Backend Unit & Integration Tests (JUnit 5 & Mockito)
```powershell
cd "backend"
mvn test
```
*Includes tests for initial admin creation, duplicate rejection, role safety validation, and Flyway zero-seed database migration integrity.*

### Frontend Production Build Test
```powershell
cd "frontend"
npm run build
```
*Validates full TypeScript type checks and bundles production assets via Vite.*

---

## Port Allocation Summary

| Service | Port | Description |
|---|---|---|
| **Frontend** | `5173` | React / Vite Web Application |
| **Backend** | `8080` | Spring Boot REST API & Swagger UI |
| **AI Service** | `8000` | FastAPI Machine Learning Engine |
| **MySQL** | `3306` | MySQL Relational Database Server |
