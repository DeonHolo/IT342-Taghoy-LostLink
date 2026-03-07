# IT342-G

# System Integration and

# Architecture

## System Design Document (SDD)

### Project Title: LostLink

### Prepared By: Taghoy, Ron Luigi F.

### Version: 1.

### Date: February 2 8 , 2026

### Status: Final


##### REVISION HISTORY TABLE

```
Versio
n Date^ Author^ Changes Made^ Status^
0.1 02/21/26 Ron Luigi Taghoy Initial draft Draft
1.0 02/28/26 Ron Luigi Taghoy Added API specifications Final
```
```
0.3 [Date] [Your Name] Updated database design Review
0.4 [Date] [Your Name] Added UI/UX designs Review
0.5 [Date] [Your Name] Incorporated feedback Revised
```
```
0.6 [Date] [Your Name] Final review and corrections Final
```
```
1 [Date] [Your Name] Baseline version for development Approved
```

## TABLE OF CONTENTS

- EXECUTIVE SUMMARY Contents
   - 1.0 INTRODUCTION
   - 2.0 FUNCTIONAL REQUIREMENTS SPECIFICATION
   - 3.0 NON-FUNCTIONAL REQUIREMENTS
   - 4.0 SYSTEM ARCHITECTURE
   - 5.0 API CONTRACT & COMMUNICATION
   - Authentication Endpoints
      - User Registration
      - User Login
      - Google OAuth Login
      - User Logout
      - Get Current User
   - Core Business Endpoints
      - Post New Item
      - Get All Items (Feed)
      - Get Single Item Details
      - Update Own Item
      - Delete Own Item
      - Reveal Item Details (Audit Trail)
      - Get All Categories (Utility)
   - Admin Endpoints
      - Admin: Mark Item as Resolved
      - Admin: Delete Inappropriate Item
   - User Management Endpoints
      - Update User Profile (Settings)
   - 6.0 DATABASE DESIGN
   - 7.0 UI/UX DESIGN
   - 8.0 PLAN


EXECUTIVE SUMMARY

**1.1 Project Overview**

LostLink is a centralized campus utility platform that digitizes the traditional lost and
found process. The system allows university students and staff to report lost items,
browse found inventory, and facilitate item recovery through a searchable database. The
solution integrates a Spring Boot backend API, a React web dashboard, and an Android
mobile application to ensure accessibility across all devices.

**1.2 Objectives**

1. Develop a fully functional Lost & Found MVP with secure authentication, item
    reporting, and search capabilities.
2. Implement a scalable three-tier architecture utilizing Spring Boot (backend),
    React (web), and Android (mobile).
3. Create RESTful APIs for real-time data synchronization between the database
    and client applications.
4. Design a responsive user interface that allows users to post reports in under 1
    minute.
5. Deploy the system to cloud hosting environments for the final demonstration

**1.3 Scope**

**Included Features:**

```
● User registration and secure login with Student ID format validation and Google
OAuth.
● "Post Item" transaction (Report Lost or Found items) with conditional image file
uploads.
● A centralized portal for users to update contact preferences (MS Teams/Phone),
manage security credentials (passwords), and track their personal post history.
● Main Feed with search and filtering (by hardcoded category, status, and Imagga-
generated search tags).
● External Imagga AI API integration for automatic item image tagging to enrich
search metadata.
● Item Detail view with protected contact information.
```
```
● "My Posts" management (Edit/Delete own reports).
```

```
● Admin dashboard for moderation and Role-Based Access Control (RBAC).
● Automated SMTP email notifications for account welcome messages and system
alerts
```
**Excluded Features:**

```
● Real-time in-app chat.
● GPS map integration.
● Push notifications.
● Reward payment processing.
```
### 1.0 INTRODUCTION

**1.1 Purpose**

This document serves as the comprehensive design specification for the LostLink
system. It details the functional requirements, user journeys, and acceptance criteria
required to build the platform, serving as the official blueprint for the development
phase.

### 2.0 FUNCTIONAL REQUIREMENTS SPECIFICATION

**2.1 Project Overview**

**Project Name:** LostLink
**Domain:** Campus Utility/Management
**Primary Users:**

1. Students
2. Faculty
3. Administrators (Campus Security)

**Problem Statement:** The traditional campus lost and found relies on manual logbooks,
which are inefficient, physically isolated, and difficult for students to search through
quickly.
**Solution:** A centralized, digital platform that allows users to quickly report lost or
found items and search a campus-wide database with a consistent experience across
web and mobile.

**2.2 Core User Journeys**


**Journey 1: Browsing as a Guest**

1. User opens the mobile or web app without logging in.
2. Browses the main feed of recently posted items.
3. Clicks an item to view details but is prompted to "Log In" to see the contact
    information.

**Journey 2: Reporting a Lost/Found Item (The Transaction)**

1. User logs in using existing student credentials or via Google OAuth.
2. Navigates to the "Post Item" section.
3. Fills out the text details (Item Name, Description, Category, Location, Contact
    Info).
4. Selects the status tag (Lost or Found).
5. Uploads a photo of the item (System Rule: Image upload is strictly required for
    "Found" items to prove possession, but optional for "Lost" items)
6. If an image was provided, system sends the image to the Imagga API, which
    returns descriptive Search Tags (e.g., "Black," "Leather," "Wallet").
7. Selects the Item Status (Dynamic Form Logic): If holding the item, they confirm
    their contact preference. If surrendered, they select the campus office from a
    dropdown or specify a custom location in an open text field.
8. Submits the report.
9. The system then saves the item to the database and updates the global feed.
10. The system automatically sends a System Notification Email (SMTP) to the user
    confirming the successful post.

**Journey 3: Searching and Claiming an Item**

1. User visits the web or mobile application and logs in.
2. Browses the main feed or uses the search bar for specific keywords (e.g., "Keys").
3. The system queries the database for matches in the Title, Description, and the
    AI-generated Search Tags, ensuring the item is found even if the description is
    brief
4. Filters the feed to show only "Found" items.
5. Clicks on a matching item to view full details.
6. Views the item details, but the "Contact Info" or "Place Deposited" remains
    hidden behind a "Reveal Details" button.


7. Clicks the "Reveal Details" button. The frontend triggers an API call that logs the
    user's ID and the item's ID into the claims table to create a security audit trail.
8. The UI updates to display the sensitive retrieval data, and the user either contacts
    the finder externally or goes to the specified campus office to retrieve the item.

**Journey 4: Administrator Moderation**

1. Admin logs in with administrative credentials.
2. Views the complete list of all active reports.
3. Marks items as "Resolved/Returned" to remove them from the active feed.
4. Deletes inappropriate or spam posts.
5. Manages hardcoded categories (e.g., Electronics, Documents) to ensure the feed
    remains organized.
6. Suspends user accounts violating community guidelines.

**2.3 Feature List (MoSCoW)**

**MUST HAVE**

1. User authentication (register, login, logout, /me endpoint, Google OAuth).
2. Role-Based Access Control (Admin vs. Regular User).
3. Item reporting (Create, Read, Update, Delete personal posts).
4. File upload functionality for item images (Conditionally Required).
5. Category tagging (Electronics, Documents, Personal Items).
6. Public API integration (AI Image Auto-Tagging for uploaded items).
7. Automated SMTP email notifications (account welcome and claim/post alerts).
8. Global feed with search and filtering (Lost vs. Found).
9. Protected contact or place deposited information (hidden from non-logged-in
    users).
10. Contact/Place info hidden behind a button with a mandatory claims audit log
    entry.
11. Admin moderation panel.

**SHOULD HAVE**

1. "Resolved" status toggle.
2. Self-service portal to update name, contact handles, and security credentials.
3. Ability for uploaders to toggle items as "Resolved" to auto-archive them from the
    feed.
4. Responsive design for all screen sizes.
5. A log for users to see which items they have "claimed" or "revealed.

**COULD HAVE**


1. Campus map integration with drop-pins for locations.
2. Basic analytics (most common lost items).
3. Simple badges for users who successfully return items (e.g., "Verified Finder").

**WON'T HAVE**

1. In-app chat/messaging system.
2. Mobile OS Push Notifications (FCM).
3. Real-time GPS location tracking.
4. Reward payment processing.

**2.4 Detailed Feature Specifications**

**Feature: User Authentication**

```
● Screens: Registration, Standard Login, Google OAuth Login.
● Fields: Student ID or Email (for Login), First Name, Last Name, Password, Confirm
Password.
● Validation: Valid Student ID format (XX-XXXX-XXX), password strength, unique
ID check
● API Endpoints: POST /api/auth/register, POST /api/auth/login, POST
/api/auth/logout, GET /api/auth/me
● Security: JWT session tokens, BCrypt password hashing, UI/API Role-Based
Access Control (RBAC).
```
**Feature: Item Feed & Search**

● **Screens:** Main Dashboard/Feed, Item Detail View
● **Display:** Card layout, item titles, item details, "Lost" or "Found" badges, and
Imagga AI-generated tag chips.
● **Search:** By keyword (title/description/AI tags), filter by hardcoded categories,
status, or date.
● **Privacy & Audit Trail:** Sensitive retrieval data (Contact Info or Place Deposited) is
completely hidden from Guest users. For logged-in users, this data remains
obfuscated behind a "Reveal" button. Clicking this button triggers a POST
/api/claims request that records the action in the database, creating a permanent
audit trail to deter malicious scraping and protect user privacy.
● **API Endpoints:** GET /items, GET /items/{id}, GET /items/search
● **Admin Functions:** DELETE /items/{id}, PUT /items/{id}/status
**Feature: Item Reporting (Transactional)**

```
● Screens: Post Item Form
● Functions: Add new report, edit own report, delete own report
```

● **Form Logic** : Dynamic fields based on Item Status (e.g., revealing "Contact
Preference" if holding the item, or a "Campus Office" dropdown if surrendered).
● **File Uploads** : Image upload is strictly required for "Found" items; optional for
"Lost" items.
● **Persistence:** Database storage linked to User ID
● **API Endpoints:** POST /items, PUT /items/{id}, DELETE /items/{id}, POST
/items/{id}/upload-image
**Feature: User Account & Profile Management**

● **Screens:** User Account & Profile Management
● **Profile View:** Users can view their registered information, including Student ID,
Email, and current Contact Preferences.
● **Account Settings** : Users can update their display name, contact handle (e.g., MS
Teams/Messenger), and reset their password.
● **My Activity** : A dedicated view allowing users to track items they have posted and
items they have "claimed" (revealed details for).
● **API Endpoints:** GET /auth/me, PUT /users/profile, GET /users/activity
**Feature: Admin Panel**

● **Screens:** Content Moderation Dashboard
● **Data Collected:** Delete inappropriate posts, mark items as resolved, monitor
claims audit trail, suspend users, manage hardcoded categories.
● **Process:** Admin role strictly required
● **API Endpoints:** DELETE /admin/items/{id}, PUT /admin/items/{id}/resolve, GET
/admin/users, DELETE /admin/users/{id}
**Feature: System Integrations (External API & Email)**

```
● External API (Imagga): Automatically analyzes uploaded item images to
generate descriptive "Search Tags" (e.g., "leather", "black") for enriched
searchability.
● Email Notifications (SMTP): Automatically triggers a Welcome email upon
successful registration and a System Notification email when an item is
successfully posted.
```
**2.5 Acceptance Criteria**

**AC- 1 a: Successful User Registration (Format Validation & SMTP)**

```
➢ Given I am an unregistered student
➢ When I enter valid email, valid Student ID, and strong password
➢ And confirm password matches
```

```
➢ And click "Register Account"
➢ Then the system must validate the ID format against the required Regex
➢ Then my account should be successfully created with the ID stored as a Unique
Key in the database
➢ And the system should automatically trigger a Welcome email via SMTP to my
registered email address
➢ And I should be automatically logged in
➢ And redirected to the homepage
```
**AC-1b: Failed Registration (Invalid ID Format)**

```
➢ Given I am an unregistered student
➢ When I attempt to register with an incorrectly formatted ID (e.g., 123456 or 21-
ABC-123)
➢ Then the frontend must prevent submission and display a validation error:
"Student ID must follow the XX-XXXX-XXX format."
```
**AC-2: Google OAuth Integration**

```
➢ Given I am on the login page
➢ When I click "Login with Google"
➢ And successfully authenticate with my Google account
➢ Then the system must link/save my user in the database and generate a custom
JWT.
```
**AC- 3 a: Posting a "Found" Item (Image Attached)**

```
➢ Given I am an authenticated user
➢ When I navigate to the Post form
➢ And enter item details, location, contact details, and select "Found"
➢ And I attach an image file
➢ And submit the form
➢ Then the system must reject the request and show a UI validation error: "An
image is required when reporting a found item."
```
**AC-3b: Posting a "Found" Item (No Image Attached)**

```
➢ Given I am an authenticated user
```

```
➢ When I navigate to the Post form
➢ And enter item details, location, contact details, and select "Found"
➢ And I do not attach an image file
➢ And submit the form
➢ Then the item should be saved to the database
➢ And a System Notification Email must be sent confirming the "Found" item was
posted
➢ And it should immediately appear at the top of the main feed under the "Found"
items category
```
**AC-3c: Posting a "Lost" Item (Image Optional)**

```
➢ Given I am an authenticated user
➢ When I fill out the "Post Item" form and select the status "Lost"
➢ And enter lost item details
➢ And I attack or do not attach an image file
➢ And submit the form
➢ Then the system must successfully save the item to the database without an
image link and bypass the AI tagging API.
➢ And a System Notification Email must be sent confirming the "Lost" item was
posted
➢ And it should immediately appear at the top of the main feed under the "Lost"
items category
```
**AC-4: Contact Info Privacy (Guest View)**

```
➢ Given I am a Guest (not logged in)
➢ When I click on an item in the feed to view its details
➢ Then I should see the item description and location
➢ But the "Contact Info" section and “Place Deposited” should be hidden or
replaced with a "Log in to view" button if the finder has chosen to put their
contact info.
```
**AC-5: Search Functionality**

```
➢ Given I am on the main feed
➢ When I type "Wallet" into the search bar
➢ Then the feed should update to display only items with "Wallet" in the title or
description.
```

**AC-6: Post Deletion (Data Integrity)**

```
➢ Given I am an authenticated user
➢ When I view an item that I posted
➢ Then I should see a "Delete" option
➢ And when I click it, the item should be permanently removed from the database
and feed.
```
**AC-7: Email Notification**

```
➢ Given I am an authenticated user
➢ When I successfully submit the "Post Item" form
➢ Then the system should save the item to the database
➢ And the Spring Boot backend should automatically trigger an SMTP email to my
registered email address
➢ And the email subject and body must explicitly state the item's title and
whether its status is "Lost" or "Found".
```
**AC-8: External API & AI Auto-Tagging**

```
➢ Given I have uploaded an image for a post
➢ When the post is saved, the backend must consume the External AI API
➢ Then the generated tags (e.g., "Wallet", "Black") must be displayed
meaningfully on the Item Detail page.
```
**AC-9: Secure Information Reveal & Audit Logging**

```
➢ Given I am an authenticated user viewing an item detail page
➢ When I click the "Reveal Contact Info / Drop-off Location" button
➢ Then the system must send a POST request to the backend to log my User ID and
the Item ID in the claims table
➢ And the UI must dynamically update to display the hidden retrieval details
➢ And if a database error prevents the audit log from saving, the information must
remain hidden.
```
**AC-10: Profile Update and Persistence**

```
➢ Given I am a logged-in user on the "Profile" page.
➢ When I change my "Contact Preference" to a new value and click "Save."
➢ Then the system must update my record in the users table.
➢ And the next time I "Reveal" an item I posted, other users must see my updated
contact info.
```

**AC-11: Password Change Security**

```
➢ Given I am a logged-in user on the "Settings" page.
➢ When I attempt to change my password
➢ And I enter a new password that meets the strength requirements.
➢ Then the system must update my record in the users table.
➢ And the next time I "Reveal" an item I posted, other users must see my updated
contact info.
```
### 3.0 NON-FUNCTIONAL REQUIREMENTS

**3.1 Performance Requirements**

● API response time: ≤ 2 seconds for 95% of requests
● Main feed load time: ≤ 3 seconds on standard campus Wi-Fi.
● Mobile app cold start: ≤ 3 seconds
● File Upload limit: Image uploads must be restricted to a maximum of 5MB to
ensure fast processing and prevent server overload.
● Support for 50 concurrent users (e.g., an entire classroom checking at once).
● Database queries complete within 500ms
**3.2 Security Requirements**

● HTTPS for all communications
● JWT token authentication for session management.
● Password hashing with bcrypt (salt rounds = 12)
● File validation: The system must strictly validate uploaded files to accept only safe
image formats (JPEG, PNG) to prevent malicious script execution.
● SQL injection prevention
● XSS protection
● Contact information/place deposited strictly protected behind authentication
checks.
● Admin endpoints require role verification
**3.3 Compatibility Requirements**

● **Web Browsers:** Chrome, Firefox, Safari, Edge (latest 2 versions)
● **Android:** Android API Level 34 (Android 14)
● **Screen Sizes:** Mobile (360px+), Tablet (768px+), Desktop (1024px+)
● **Operating Systems:** Windows 10+, macOS 10.15+, Linux Ubuntu 20.04+
**3.4 Usability Requirements**

```
● Ability to complete a "Post Item" report within 1 minute.
```

● Clear visual distinction (color coding) between Lost items and Found items.
● Consistent navigation across all pages
● Clear error messages with recovery options
● Touch targets minimum 44x44px on mobile
● Keyboard navigation support
● If the external Imagga API or SMTP service experiences downtime, the application
must still allow users to successfully post items without crashing.


### 4.0 SYSTEM ARCHITECTURE

**4.1 Component Diagram**


**Technology Stack:**

```
● Backend: Java 17, Spring Boot 3.x, Spring Security 6.x (JWT), Spring Data JPA
● Database: MySQL 8.x (Cloud Hosted)
● Web Frontend: React 19 (Vite), Tailwind CSS, Material UI (MUI), Axios
● Mobile: Kotlin 1.9.0, XML-Based UI Layouts (with View Binding), Retrofit, Gson
● Build Tools: Maven (Backend), npm (Web), Gradle (Android)
● Deployment: Railway (Backend & Database), Vercel (Web frontend), APK
(Mobile app)
```
**4.2 Backend Architecture Pattern**

The LostLink backend strictly follows a Layered Architecture pattern to separate
concerns, improve code maintainability, and ensure system scalability. This structure
isolates web request handling from business logic and database operations using the
following components:

**Controller Layer** : Handles incoming HTTP REST requests from the React and Android
clients, orchestrates input routing, and returns standard HTTP status codes.

**Service Layer** : Contains the core business logic of the LostLink system, such as
processing item status updates, managing the claims audit trail, and interacting with
the external Imagga API.

**Repository Layer** : Utilizes Spring Data JPA to manage all direct data persistence and
retrieval operations with the MySQL database.

**DTOs (Data Transfer Objects)** : Used to encapsulate data sent to and from the API,
ensuring sensitive database entities (like user passwords) are never directly exposed in
API responses.

**Security Configuration** : Implements Spring Security with custom JWT filters to handle
Role-Based Access Control (RBAC) and protect authenticated endpoints.

**Global Exception Handling** : Centralizes error management to return consistent,
properly formatted JSON error responses (e.g., standardizing VALID-001 or AUTH- 001
error codes) across the entire application.


### 5.0 API CONTRACT & COMMUNICATION

**5.1 API Standards**

```
Base URL https://[server_hostname]:[port]/api/v
Format JSON for all requests/responses (except
file uploads using multipart/form-data)
Authentication Bearer token (JWT) in Authorization
header
Response Structure {
"success": boolean,
"data": object|null,
"error": {
"code": string,
"message": string,
"details": object|null
},
"timestamp": string
}
```

**5.2 Endpoint Specifications**

### Authentication Endpoints

#### User Registration

```
Description User Registration
API URL /auth/register
HTTP Request Method POST
Format JSON
Authentication None
Request Payload {
"studentId": " 20 - 0649 - 750 ",
"email": "holodeon@gmail.com",
"firstName": "Ron Luigi",
"lastName": "Taghoy",
"password": "SecurePassword123!"
}
Response Structure {
"success": true,
"data": {
"user": {
"studentId": "20- 0649 - 750",
"email": "holodeon@gmail.com",
"firstName": "Ron Luigi",
"lastName": "Taghoy",
"role": "USER"
},
"accessToken": "eyJh..."
},
"error": null,
"timestamp": "2026- 02 - 28T18:00:00Z"
}
```

#### User Login

```
Description User Login
API URL /auth/login
HTTP Method POST
Format JSON
Authentication None
Request Payload {
"identifier": " 20 - 0649 - 750 ",
"password": "SecurePassword123!"
}
Response Structure {
"success": true,
"data": {
"user": {
"email": "ronluigi.taghoy@cit.edu",
"firstName": "Ron Luigi",
"lastName": "Taghoy",
"role": "USER"
},
"accessToken":
"eyJhbGciOiJIUzI1NiIsInR5cCI6..."
},
"error": null,
"timestamp": "2026- 02 - 28T18:05:00Z"
}
```

#### Google OAuth Login

```
Description Authenticates a user via Google OAuth
using an ID token provided by the
frontend. If the user doesn't exist, it
automatically registers them.
API URL /auth/google
```
```
HTTP Request Method POST
```
```
Format JSON
Authentication None
```
```
Request Payload {
"token":
"eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhMmIz
YzRkNWU2Z..."
}
```
```
Response Structure {
"success": true,
"data": {
"user": {
"studentId": null,
"email": "ronluigi.taghoy@cit.edu",
"firstName": "Ron Luigi",
"lastName": "Taghoy",
"role": "USER"
},
"accessToken":
"eyJhbGciOiJIUzI1NiJ9.eyJzdWI..."
},
"error": null,
"timestamp": "2026- 02 - 28T23:15:00Z"
}
```

#### User Logout

```
Description Invalidates the user's current session or
instructs the client to discard the token.
API URL /auth/logout
```
```
HTTP Method POST
Format JSON
```
```
Authentication Required (Bearer JWT)
```
```
Request Payload None
Response Structure {
"success": true,
"data": {
"message": "Successfully logged out."
},
"error": null,
"timestamp": "2026- 02 - 28T20:35:00Z"
}
```

#### Get Current User

```
Description Retrieves the profile data of the currently
logged-in user using their active JWT.
API URL /auth/me
```
```
HTTP Method GET
Format JSON
```
```
Authentication Required (Bearer JWT)
```
```
Request Payload None
Response Structure {
"success": true,
"data": {
"user": {
"identifier": " 20 - 0649 - 750 ",
"email": "ronluigi.taghoy@cit.edu",
"firstname": "Ron Luigi",
"lastname": "Taghoy",
"role": "USER"
}
},
"error": null,
"timestamp": "2026- 02 - 28T20:30:00Z"
}
```

### Core Business Endpoints

#### Post New Item

```
Description Post New Item
```
```
API URL /items
HTTP Method POST
```
```
Format multipart/form-data (Required to handle
the file upload)
Authentication Required (Bearer JWT)
```
```
Request Payload {
"title": "Black Casio Calculator",
"description": "Found near the library
stairs.",
"location": "3rd Floor Library",
"categoryId": 1,
"status": "FOUND",
"currentStatus": "SURRENDERED",
"dropoffLocation": "Library Desk",
"image": "<file_attachment:
calculator.jpg>"
}
Response Structure {
"success": true,
"data": {
"id": 101,
"title": "Black Casio Calculator",
"description": "Found near the library
stairs.",
"location": "3rd Floor Library",
"categoryId": 1,
"status": "FOUND",
"currentStatus": "SURRENDERED",
"dropoffLocation": "Library Desk",
"imageUrl":
"https://storage.provider.com/calculator
.jpg",
"aiTags": ["calculator", "electronics",
"black", "casio"],
"createdAt": "2026- 02 - 28T18:10:00Z"
```

##### },

"error": null,
"timestamp": "2026- 02 - 28T18:10:05Z"
}


#### Get All Items (Feed)

```
Description Get All Items (Feed)
API URL /items
```
```
HTTP Method GET
Format JSON for all requests/responses
```
```
Authentication None (Public view allowed, but contact
info is hidden)
```
```
Request Payload None
Response Structure {
"success": true,
"data": [
{
"id": 101,
"title": "Black Casio Calculator",
"description": "Found near the library
stairs.",
"status": "FOUND",
"category": "Electronics",
"aiTags": [
"calculator",
"electronics",
"black",
"casio"
],
"location": "3rd Floor Library",
"posterId": "21- 1234 - 567",
"contactPreference": null
}
],
"error": null,
"timestamp": "2026- 02 - 28T18:15:00Z"
}
```

#### Get Single Item Details

```
Description Fetch the full details of a specific item
when a user clicks its card.
API URL /items/{id}
```
```
HTTP Method GET
Format JSON
```
```
Authentication None (Public view allowed, but retrieval
details remain hidden)
```
```
Request Payload None
Response Structure {
"success": true,
"data": {
"id": 101,
"title": "Black Casio Calculator",
"description": "Found near the library
stairs.",
"status": "FOUND",
"currentStatus": "SURRENDERED",
"imageUrl":
"https://storage.provider.com/calculator
.jpg",
"aiTags": ["calculator", "electronics",
"black", "casio"],
"location": "3rd Floor Library",
"posterId": "21- 1234 - 567",
"contactPreference": null,
"dropoffLocation": null,
"createdAt": "2026- 02 - 28T18:10:00Z"
},
"error": null,
"timestamp": "2026- 02 - 28T18:16:00Z"
}
```

#### Update Own Item

```
Description Allows the uploader to edit the title,
description, or status (e.g., changing
"Holding" to "Surrendered").
API URL /items/{id}
```
```
HTTP Method PUT
Format JSON
```
```
Authentication Required (Bearer JWT)
```
```
Request Payload {
"title": "Black Casio Calculator -
UPDATED",
"description": "Found near the library.
Now at the guard house.",
"categoryId": 1,
"status": "FOUND",
"currentStatus": "SURRENDERED",
"dropoffLocation": "Main Building Guard
House"
}
Response Structure {
"success": true,
"data": {
"id": 101,
"title": "Black Casio Calculator -
UPDATED",
"status": "FOUND",
"currentStatus": "SURRENDERED",
"updatedAt": "2026- 02 - 28T20:45:00Z"
},
"error": null,
"timestamp": "2026- 02 - 28T20:45:05Z"
}
```

#### Delete Own Item

```
Description Removes a post created by the user from
the database.
API URL /items/{id}
```
```
HTTP Method DELETE
Format JSON
```
```
Authentication Required (Bearer JWT)
```
```
Request Payload None
Response Structure {
"success": true,
"data": {
"message": "Item successfully
deleted."
},
"error": null,
"timestamp": "2026- 02 - 28T20:50:00Z"
}
```

#### Reveal Item Details (Audit Trail)

```
Description Unlocks the hidden contact info or drop-
off location and logs the action in the
claims table.
API URL /items/{id}/reveal
```
```
HTTP Method POST
Format JSON
```
```
Authentication Required (Bearer JWT)
```
```
Request Payload None
Response Structure {
"success": true,
"data": {
"user": {
"identifier": " 20 - 0649 - 750 ",
"email": "ronluigi.taghoy@cit.edu",
"firstname": "Ron Luigi",
"lastname": "Taghoy",
"role": "USER"
}
},
"error": null,
"timestamp": "2026- 02 - 28T20:30:00Z"
}
```

#### Get All Categories (Utility)

```
Description Retrieves the list of hardcoded
categories (e.g., Electronics, Documents)
to populate dropdowns.
API URL /categories
```
```
HTTP Method GET
Format JSON
```
```
Authentication None
```
```
Request Payload None
Response Structure {
"success": true,
"data": [
{
"id": 1,
"name": "Electronics"
},
{
"id": 2,
"name": "Documents & IDs"
},
{
"id": 3,
"name": "School Supplies"
}
],
"error": null,
"timestamp": "2026- 02 - 28T21:05:00Z"
}
```

### Admin Endpoints

#### Admin: Mark Item as Resolved

```
Description Admin updates an item's status to
"RESOLVED" to remove it from the active
feed while keeping it in the database for
records
```
```
API URL /admin/items/{id}/resolve
HTTP Method PUT
```
```
Format JSON
```
```
Authentication Required (Bearer JWT, Must have
ROLE_ADMIN)
Request Payload None
```
```
Response Structure {
"success": true,
"data": {
"id": 101,
"title": "Black Casio Calculator",
"status": "RESOLVED"
},
"error": null,
"timestamp": "2026- 02 - 28T18:30:00Z"
}
```

#### Admin: Delete Inappropriate Item

```
Description Admin permanently deletes a spam or
inappropriate post from the database.
API URL /admin/items/{id}
```
```
HTTP Method DELETE
Format JSON
```
```
Authentication Required (Bearer JWT, Must have
ROLE_ADMIN)
```
```
Request Payload None
Response Structure {
"success": true,
"data": {
"message": "Item successfully
deleted."
},
"error": null,
"timestamp": "2026- 02 - 28T18:35:00Z"
}
```

### User Management Endpoints

#### Update User Profile (Settings)

```
Description Allows the user to update their name,
contact handle (MS Teams/Phone), or
password.
```
```
API URL /users/profile
HTTP Method PUT
```
```
Format JSON
```
```
Authentication Required (Bearer JWT)
Request Payload {
"firstname": "Ron Luigi",
"lastname": "Taghoy",
"contactPreference": "MS Teams: “20-
0649 - 750 ",
"password": "newSecurePassword123!"
}
```
```
Response Structure {
"success": true,
"data": {
"identifier": " 20 - 0649 - 750 ",
"email": "ronluigi.taghoy@cit.edu",
"contactPreference": "MS Teams:
@ron.taghoy",
"message": "Profile updated
successfully."
},
"error": null,
"timestamp": "2026- 02 - 28T20:40:00Z"
}
```

**5.3 Error Handling**

**HTTP Status Codes**

● 200 OK - Successful request
● 201 Created - Resource created
● 400 Bad Request - Invalid input
● 401 Unauthorized - Authentication required/failed
● 403 Forbidden - Insufficient permissions
● 404 Not Found - Resource doesn't exist
● 409 Conflict - Duplicate resource
● 500 Internal Server Error - Server error
**Error Code Examples**

```
Example 1 {
"success": false,
"data": null,
"error": {
"code": "VALID- 001 ",
"message": "Validation failed",
"details": {
"image": "An image is required when reporting a found item."
}
},
"timestamp": "2026- 02 - 28T18:20:00Z"
}
```
```
Example 2 {
"success": false,
"data": null,
"error": {
"code": "AUTH-001",
"message": "Invalid credentials",
"details": "Student ID, Email, or password is incorrect"
},
"timestamp": "2026- 02 - 28T18:21:00Z"
}
```
**Common Error Codes**

```
● AUTH-001: Invalid credentials
● AUTH-002: Token expired
● AUTH-003: Insufficient permissions
● VALID-001: Validation failed
```

● DB-001: Resource not found
● DB-002: Duplicate entry
● BUSINESS-001: Insufficient stock
● SYSTEM-001: Internal server error


### 6.0 DATABASE DESIGN

**6.1 Entity Relationship Diagram**

**Detailed Relationships:**

```
● One-to-One: Roles ↔ Users (One role can be assigned to multiple users)
```
```
● One-to-Many: User → Items (One user can post multiple lost or found items)
● One-to-Many: Categories → Items (One user can reveal contact info for multiple
items)
● One-to-Many: Users → Claims (One user can reveal contact info for multiple
```
```
items)
● One-to-Many: Items → Claims (One item can have its contact info revealed to
multiple users)
```

**Key Tables:**

1. **users** - User accounts, Google OAuth data, and authentication credentials.
2. **roles** - Role-Based Access Control (RBAC) definitions to separate Admins and
    Students.
3. **categories** - Hardcoded classification tags (e.g., Electronics, Documents) to
    keep the database normalized.
4. **items** - The core business module storing lost and found reports, images, and
    Imagga AI metadata.
5. **claims** - The security audit trail logging exactly which user revealed the hidden
    contact information of a specific item.
**Table Structure Summary:**

```
● roles: id, role_name
● categories: id, category_name
● users: id, student_id, email, first_name, last_name, password_hash,
contact_preference, role_id, created_at
● items: id, title, description, status, current_status, dropoff_location, image_url,
ai_tags, category_id, user_id, created_at
● claims: id, item_id, user_id, revealed_at
```

### 7.0 UI/UX DESIGN

**7.1 Web Application Wireframes**

**Login**


**Register**


**Main Dashboard**


**Post New Item Form**


**Item Detail View**


**Admin Dashboard**


**7.2 Mobile Application Wireframes**

**Mobile Login**


**Mobile Register**


**Mobile Main Dashboard**


**Mobile Post New Item Form**


**Mobile Item Detail View**


### 8.0 PLAN

**8.1 Project Timeline**

**Phase 1: Planning & Design (Week 1-2)**

Week 1: Requirements & Architecture

Day 1-2: Project setup, GitHub repository initialization, and documentation.

Day 3-4: Complete functional (FRS) and non-functional requirements.

Day 5-7: System architecture design and final ERD (5 tables) creation.

Week 2: Detailed Design

Day 1-2: API specification and JWT security flow mapping.

Day 3-4: Database schema finalization and seed data generation (Categories, Roles).
Day 5-6: UI/UX wireframes for React Web and Android Mobile.

Day 7: Implementation plan finalization and task assignment.

**Phase 2: Backend Development (Week 3-4)**

Week 3: Foundation

Day 1: Spring Boot setup with required dependencies.

Day 2: Database configuration and entity mappings (users, items, categories, roles,
claims).

Day 3: JWT authentication implementation (Register, Login, /me).

Day 4: User profile and activity management endpoints.

Day 5: Core Item CRUD operations (Post, Update, Delete own item).

Week 4: Core Features

Day 1: Global Feed endpoints with search and filtering (status, category).

Day 2: External Imagga AI API integration for auto-tagging uploaded images.

Day 3: "Reveal Details" security logic and Claims Audit Trail endpoints.


Day 4: Admin moderation functions (Resolve, Delete inappropriate posts).

Day 5: API documentation (Postman/Swagger) and backend unit testing.

**Phase 3: Web Application (Week 5-6)**

Week 5: Frontend Foundation

Day 1: React setup with TypeScript and Tailwind CSS.

Day 2: Authentication pages (Login, Register).

Day 3: Main Dashboard (Global Feed) and category filter UI.

Day 4: "Post New Item" form with image upload handling.

Day 5: Item Detail page with protected contact info.

Week 6: Complete Web Features

Day 1: "Reveal Details" button integration and audit log testing.

Day 2: User Account page (Profile settings, My Activity, Settings).

Day 3: Admin Moderation Dashboard.

Day 4: Responsive design polish for desktop and tablet screens.

Day 5: Complete backend API integration and web testing.

**Phase 4: Mobile Application (Week 7-8)**

Week 7: Android Foundation

Day 1: Android Studio Kotlin setup and project structure.

Day 2: Authentication screens and JWT token storage.

Day 3: Main Feed browsing and RecyclerView implementation.

Day 4: "Post Item" screen with camera/gallery intents.

Day 5: Retrofit API service layer setup.


Week 8: Complete Mobile App

Day 1: Item Detail view and "Reveal" button interaction.

Day 2: User Profile, My Activity, Settings screens.

Day 3: UI polish, material design components, and animations.

Day 4: Testing on physical devices and emulators.

Day 5: Release APK generation and mobile documentation.

**Phase 5: Integration & Deployment (Week 9 - 10)**

Week 9: Integration Testing

Day 1: End-to-end testing across Web, Mobile, and Spring Boot platforms.

Day 2: Bug fixes, Imagga API rate-limit handling, and optimization.

Day 3: Security review (verifying contact info is hidden for guests).

Day 4: Performance testing with large image uploads.

Day 5: Documentation updates for final submission.

Week 10: Deployment

Day 1: Backend deployment (Railway) and remote MySQL database setup.

Day 2: Web app deployment (Vercel).

Day 3: Mobile APK distribution via GitHub Releases or Google Drive link.

Day 4: End-to-End (E2E) Live Testing.

Day 5: Project presentation and submission.

**Milestones:**

```
● M1 (End Week 2): All design documents, wireframes, and ERD complete.
● M2 (End Week 4): Backend API fully functional
● M3 (End Week 6): React Web application complete and integrated.
● M4 (End Week 8): Kotlin Mobile application complete and integrated.
```
```
● M5 (End Week 10): Full system deployed and integrated
```

**Critical Path:**

1. Authentication system & RBAC setup (Week 3)
2. Item reporting API with Image Uploads & Imagga AI (Week 3- 4 )
3. Global Feed search and filtering functionality (Week 4)
4. Secure "Reveal" Audit Trail process (Week 4, 6, 8)
5. Cross-platform integration testing (Week 9)

**Risk Mitigation:**

```
● Start with the simplest working version of each feature (e.g., manual tags
before AI tags).
● Test integration points early and often (especially the file upload to the
backend).
● Keep backups of working versions (strict Git branching and committing).
● Focus on core functionality (Posting and Claiming) before enhancements (Admin
dashboards).
```

