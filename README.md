# 🔗 LostLink

> A centralized campus Lost & Found platform that digitizes the traditional lost and found process.

LostLink allows university students and staff to report lost items, browse found inventory, and facilitate item recovery through a searchable database. The system integrates a **Spring Boot backend API**, a **React web dashboard**, and an **Android mobile application**.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Backend Setup](#1-backend-spring-boot)
  - [Web Frontend Setup](#2-web-frontend-react--vite)
  - [Mobile App Setup](#3-mobile-app-android--kotlin)
- [API Endpoints](#-api-endpoints)
- [Features](#-features)
- [Development Environments](#-development-environments)
- [Author](#-author)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 17, Spring Boot 3.5.x, Spring Security 6.x (JWT), Spring Data JPA |
| **Database** | MySQL 8.x |
| **Web Frontend** | React 19, Vite, Axios, React Router |
| **Mobile** | Kotlin 1.9, XML Layouts, Retrofit 2.9, Gson, OkHttp 4.12, Material Design 3 |
| **Build Tools** | Maven (Backend), npm (Web), Gradle (Android) |
| **Deployment** | Railway (Backend & DB), Vercel (Web), APK (Mobile) |

---

## 📁 Project Structure

```
IT342-Taghoy-LostLink/
├── src/                    # Spring Boot backend source
│   └── main/
│       ├── java/edu/cit/taghoy/lostlink/
│       │   ├── config/     # Security, CORS, exception handling
│       │   ├── controller/ # REST controllers
│       │   ├── dto/        # Request/Response DTOs
│       │   ├── model/      # JPA entities
│       │   ├── repository/ # Spring Data repositories
│       │   └── service/    # Business logic
│       └── resources/
│           └── application.properties
├── web/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Login, Register, Dashboard
│   │   └── services/       # Axios API client
│   └── package.json
├── mobile/                 # Android (Kotlin) mobile app
│   ├── app/src/main/
│   │   ├── java/com/taghoy/lostlink/
│   │   │   ├── api/        # Retrofit client, models, service
│   │   │   ├── utils/      # Session manager
│   │   │   ├── LoginActivity.kt
│   │   │   ├── RegisterActivity.kt
│   │   │   └── DashboardActivity.kt
│   │   └── res/            # Layouts, drawables, values
│   └── build.gradle.kts
├── docs/                   # SDD, environment guide, summaries
├── pom.xml                 # Maven build config
└── README.md
```

---

## ✅ Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Java JDK** | 17+ | Backend runtime |
| **MySQL** | 8.x | Database (MySQL Workbench or XAMPP) |
| **Node.js** | 18+ | Web frontend tooling |
| **npm** | 9+ | Web dependency management |
| **Android Studio** | Latest | Mobile app development & emulator |
| **Git** | Any | Version control |

---

## 🚀 Getting Started

### 1. Backend (Spring Boot)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/IT342-Taghoy-LostLink.git
cd IT342-Taghoy-LostLink
```

**Configure the database** — edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lostlink_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root    # Your MySQL password
```

> 💡 The database `lostlink_db` will be created automatically on first run.

```bash
# Build and run the backend
mvnw clean compile
mvnw spring-boot:run
```

The API will be available at **http://localhost:8080**.

---

### 2. Web Frontend (React + Vite)

```bash
# Navigate to the web directory
cd web

# Install dependencies
npm install

# Start the development server
npm run dev
```

The web app will be available at **http://localhost:5173**.

> Make sure the backend is running on port 8080 before using the web app.

---

### 3. Mobile App (Android + Kotlin)

1. Open **Android Studio**
2. Select **Open** → navigate to the `mobile/` folder
3. Let Gradle sync finish (downloads dependencies automatically)
4. Connect an emulator (API 24+) or physical device
5. Click **Run ▶️**

**For emulator testing:**
The app connects to `http://10.0.2.2:8080/` which maps to your host machine's `localhost:8080`.

**For physical device testing:**
Edit `RetrofitClient.kt` and change the `BASE_URL` to your machine's local IP:
```kotlin
private const val BASE_URL = "http://192.168.x.x:8080/"
```

> Make sure the backend is running before launching the mobile app.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | None |
| `POST` | `/api/auth/login` | Login with Student ID/Email + password | None |

### Request/Response Format

All responses follow the standardized wrapper:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-03-28T12:00:00"
}
```

**Register Request:**
```json
{
  "studentId": "20-0649-750",
  "email": "user@example.com",
  "firstName": "Ron Luigi",
  "lastName": "Taghoy",
  "password": "SecurePassword123!"
}
```

**Login Request:**
```json
{
  "identifier": "20-0649-750",
  "password": "SecurePassword123!"
}
```

---

## ✨ Features

### Implemented (Phase 1 & 2)
- ✅ User registration with **Student ID format validation** (`XX-XXXX-XXX`)
- ✅ User login with **email or Student ID** as identifier
- ✅ **BCrypt password hashing** (salt rounds = 12)
- ✅ Standardized **API error responses** (`VALID-001`, `AUTH-001`, `DB-002`)
- ✅ **React web** login & registration with form validation
- ✅ **Android mobile** login & registration with Material Design 3
- ✅ **Session persistence** (localStorage on web, SharedPreferences on mobile)
- ✅ **CORS** configured for cross-origin frontend access

### Planned (Future Phases)
- 🔲 JWT token authentication
- 🔲 Item CRUD (Post, Edit, Delete lost/found reports)
- 🔲 Image upload with **Imagga AI auto-tagging**
- 🔲 Main feed with search & filtering
- 🔲 Contact info reveal with **audit trail logging**
- 🔲 Admin moderation panel
- 🔲 SMTP email notifications
- 🔲 Google OAuth integration
- 🔲 Cloud deployment (Railway + Vercel)

---

## 🔄 Development Environments

This project supports two development environments. See [`docs/ENVIRONMENT_GUIDE.md`](docs/ENVIRONMENT_GUIDE.md) for full details.

| Setting | 🏫 Lab (CIT) | 🏠 Home |
|---------|--------------|---------|
| Java | 11 | 17+ |
| Spring Boot | 2.7.18 | 3.5.x |
| Imports | `javax.*` | `jakarta.*` |
| Security API | 5.x (chained) | 6.x (lambda DSL) |
| MySQL Password | *(empty)* | `root` |

---

## 👤 Author

**Ron Luigi F. Taghoy**
- Student ID: 20-0649-750
- Course: IT342 — Systems Integration and Architecture 1
- Project: LostLink — Campus Lost & Found Platform
