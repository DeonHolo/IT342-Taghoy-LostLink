# IT342 Phase 2 – Mobile Development Completed

**Student Name:** Ron Luigi F. Taghoy
**Course / Subject:** IT342 — Systems Integration and Architecture 1
**Project Name:** LostLink

---

## 1. GitHub Link
**Repository:** [IT342-Taghoy-LostLink](https://github.com/YOUR_USERNAME/IT342-Taghoy-LostLink)

---

## 2. Final Commit
**Commit Message:** `IT342 Phase 2 – Mobile Development Completed`
**Commit Hash:** `c7265e09c252c104d2a031a33aec9e1fefe7d1c2`
**Commit Link:** [View Commit on GitHub](https://github.com/YOUR_USERNAME/IT342-Taghoy-LostLink/commit/c7265e09c252c104d2a031a33aec9e1fefe7d1c2)

---

## 3. Screenshots

*(Instructions: Replace the bracketed placeholders below with your actual screenshots before exporting this to PDF.)*

### Registration Screen
[ Insert Registration Screen Screenshot Here ]
*Caption: The registration form containing fields for Student ID, Email, First/Last Name, Password, and Confirm Password.*

### Successful Registration
[ Insert Successful Registration Screenshot Here ]
*Caption: Shows the success Toast message / immediate transition to Dashboard after successful registration.*

### Login Screen
[ Insert Login Screen Screenshot Here ]
*Caption: The login form displaying the identifier (Student ID or Email) and password fields.*

### Successful Login
[ Insert Successful Login Screenshot Here ]
*Caption: Shows the success Toast message upon entering valid credentials.*

### After Login Screen (Dashboard)
[ Insert Dashboard Screenshot Here ]
*Caption: The Dashboard screen displaying the user's name, Student ID, Email, and Role after logging in.*

### Database Record
[ Insert Database Record Screenshot Here ]
*Caption: Output from MySQL Workbench showing the newly registered user in the `users` table.*

---

## 4. Short Summary

### How Registration Works
The mobile registration process collects the user's Student ID, Email, First Name, Last Name, and Password. The Android application first performs client-side validation, ensuring:
1. The Student ID matches the strict format: `XX-XXXX-XXX`.
2. The email matches a valid format pattern.
3. Passwords must be at least 8 characters long, and the "Confirm Password" field matches the initial password.
4. No required fields are left blank.

Once validation passes, the `RegisterActivity` sends an HTTP `POST` request containing a JSON payload (using Retrofit) to the Spring Boot backend at `/api/auth/register`. The backend hashes the password (using BCrypt) and stores the user in the MySQL database. Upon a successful `201 Created` response containing the user data and access token, the app uses `SessionManager` (SharedPreferences) to save the session state globally and automatically redirects the user to the `DashboardActivity` (auto-login flow).

### How Login Works
The login process allows users to authenticate using either their configured Student ID or Email Address alongside their password. The application performs basic client-side validation to ensure both fields are not empty before dispatching an HTTP `POST` request to the Spring Boot backend at `/api/auth/login`.

The backend validates the credentials against the hashed password in the MySQL database. If successful, it responds with the user's details and an access token. The `LoginActivity` parses this response, saves the token and user details into the `SessionManager`, and transitions the user to the `DashboardActivity`. If the credentials fail, the app parses the API's custom error response and displays a helpful error message to the user directly on the login screen.

### API Integration Used
The mobile application is fully integrated with the Phase 1 Spring Boot backend using the **Retrofit 2** library and **Gson** for JSON serialization/deserialization. OkHttp is utilized beneath Retrofit to handle the underlying TCP connections and apply custom configurations, such as timeouts.

Two main endpoints were integrated:
- `POST /api/auth/register` — Maps to the Retrofit `register()` function. It takes a `RegisterRequest` Data Transfer Object (DTO) and returns a generic `ApiResponse<AuthData>` wrapper containing success metadata and the nested data.
- `POST /api/auth/login` — Maps to the Retrofit `login()` function. It takes a `LoginRequest` DTO and returns the same generic `ApiResponse<AuthData>` wrapper.

Because the app is being tested on an Android emulator, the base URL was configured to `http://10.0.2.2:8080/` to correctly route requests to the development machine's `localhost`. A custom `network_security_config.xml` manifest was implemented to explicitly allow cleartext traffic solely for local development while bypassing standard Android runtime security policies.
