# LostLink – Phase 1 Implementation Summary

**Student Name:** Ron Luigi Taghoy
**Student ID:** 20-0649-750 
**Course:** IT342
**Project:** LostLink

## Executive Summary
This document summarizes the development and implementation details of Phase 1: User Registration and Login for the LostLink Campus Item Recovery System. The core authentication logic was successfully implemented following the requirements listed in the Software Design Document (SDD) and meets all Phase 1 criteria.

## Technology Stack
- **Backend:** Spring Boot 2.7.x (configured for Lab's Java 11 requirement, downgradable back to 3.5.x for Home use)
- **Frontend:** React + Vite (Single Page Application)
- **Database:** XAMPP MySQL Database (`lostlink_db`)
- **Security:** Spring Security with BCrypt Password Encoding
- **Integration:** Axios for HTTP client communication with proper CORS headers handled by Spring.

## Database Table
- **Table:** `users`
- **Columns:** `id`, `student_id`, `email`, `first_name`, `last_name`, `password_hash`, `contact_preference`, `role`, `created_at`

## API Endpoints
- **POST** `/api/auth/register` - Endpoint to create a new user account.
- **POST** `/api/auth/login` - Endpoint to authenticate a user.

## 1. User Registration Implementation
The system allows new users to register and persists their data into the database.
- **Entity Model:** A `User` JPA entity maps exactly to the `users` table specified in the SDD, including `student_id`, `email`, `first_name`, `last_name`, `password_hash`, `contact_preference`, and `role`. 
- **Validation:** Server-side validation (using `javax.validation` / `jakarta.validation`) ensures required fields are not empty, emails are properly formatted, and Student IDs follow the `XX-XXXX-XXX` regex pattern.
- **Security Configuration:** Plain text passwords are never stored. The `AuthService` hashes the incoming password using `BCryptPasswordEncoder` (configured with a work factor of 12) before persisting it to the database.
- **Duplicate Prevention:** The service layer actively checks both `email` and `studentId` uniqueness against the `UserRepository`. Duplicate entries return an SDD-compliant error JSON (`DB-002`).

## 2. User Login Implementation
Registered users can successfully authenticate and retrieve a session context.
- **Flexible Identifier Lookup:** As specified in the SDD, users can log in using either their `Student ID` or their `Email`. The backend repository possesses a custom derived query method `findByEmailOrStudentIdIdentifier` to look up the user context.
- **Password Verification:** The raw password provided during an authentication attempt is verified against the securely hashed string fetched from the database using Spring Security’s BCrypt encoder `matches()` function.
- **Standardized API Responses:** Responses strictly follow the expected standardized wrapper (`{ success, data, error, timestamp }`). Invalid credentials return a `401 Unauthorized` with an standard `AUTH-001` error code.

## 3. Frontend Integration
The frontend cleanly interfaces with the API to form an end-to-end integration.
- **Routing:** A clean client-side routing structure routes users between `/register`, `/login`, and the protected `/dashboard` routes.
- **Error Handling:** Form fields parse specific `VALID-001` error details from the backend and highlight precisely which input fields need correcting (e.g., highlighting formatting errors for the Student ID).
- **Session Management:** The frontend securely intercepts the login success payload and stores the authenticated user's state temporarily into `localStorage` so the Dashboard can conditionally render context-dependent information (Welcome back name, Role, etc.).

## 4. Current Working Status
* **CORS Policy constraints** have been completely resolved, allowing seamless traffic from the React frontend (`localhost:5173`) to the Spring application (`localhost:8080`).
* **Registration to Login Lifecycle:** Manually end-to-end tested successfully with test user records mapped flawlessly into the MySQL database tables with the expected hash outputs.
