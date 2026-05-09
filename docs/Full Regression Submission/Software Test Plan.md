# LostLink Software Test Plan

## 1. Purpose

This Software Test Plan defines the verification approach for LostLink after applying Vertical Slice Architecture refactoring. It covers the implemented backend, React web application, and Android mobile application against the approved requirements in `docs/Project Requirements.md` and `docs/SDD_LostLink.md`.

## 2. Test Scope

### In Scope

- Backend Spring Boot REST API package refactor and application startup.
- Authentication, JWT session handling, Google OAuth endpoint surface, logout, and `/auth/me` behavior coverage.
- Role-based access control at API and UI route level.
- Item feed, item CRUD, search/filter, image upload endpoint, reveal audit trail, categories, profile, admin moderation, and SMTP-triggering flows as implemented.
- React web routing, protected routes, API client token injection, item pages, profile, and admin dashboard.
- Android Kotlin/XML auth and dashboard flow using Retrofit and persisted JWT session data.
- Regression documentation for implemented features and explicit marking of gaps.

### Out of Scope / Documented Gaps

- Payment gateway: marked not applicable because the SDD explicitly excludes reward payment processing.
- Real-time feature: optional/bonus only and not implemented.
- Mobile item feed, item CRUD, reveal, profile, and admin screens: not implemented in the current mobile app; documented as requirement gaps.
- Imagga external API auto-tagging: data fields exist, but a concrete backend API client was not found during inspection; documented as a requirement gap.

## 3. Test Environment

- Backend: Java 17+ target, Spring Boot 3.5.11, Maven Wrapper, MySQL/H2-capable JPA configuration.
- Web: React 19, Vite, Tailwind CSS, Material UI, Axios, npm.
- Mobile: Android Kotlin, XML layouts, ViewBinding, Retrofit, Android API 34, Gradle Wrapper.
- Branch: `deonholo/ref/vertical-slice-regression`.

## 4. Test Strategy

- Structural regression: verify all moved files compile/build after package/path changes.
- Automated tests: run existing framework test commands and build commands.
- Static validation: run web linting and production build.
- Manual regression checklist: define functional test cases for requirements that need UI/API exercise.
- Traceability: map every required feature to implemented, partially implemented, not implemented, not applicable, and tested status.

## 5. Automated Test Commands

| Area | Command | Expected Result | Actual Result |
| --- | --- | --- | --- |
| Backend | `backend\\mvnw.cmd test` | Compile backend and run Spring tests | Passed: 1 test, 0 failures |
| Web lint | `npm run lint` in `web/` | ESLint completes with 0 errors | Passed: 0 errors |
| Web build | `npm run build` in `web/` | Vite production build succeeds | Passed |
| Mobile | `mobile\\gradlew.bat test` | Compile debug/release and run unit tests | Passed: build successful |

## 6. Functional Test Cases

| ID | Requirement | Preconditions | Test Steps | Expected Result | Type | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TC-AUTH-001 | User registration | Backend running; unique email/student ID | Register with valid student ID `XX-XXXX-XXX`, email, and password | User is saved, password is hashed, welcome email path is triggered, JWT response available where implemented | Manual/API | Ready |
| TC-AUTH-002 | Invalid student ID validation | Registration screen/API available | Register with invalid student ID such as `123456` | Validation error is shown or returned | Manual/API | Ready |
| TC-AUTH-003 | Login and JWT | Existing user | Login with email/student ID and password | Backend returns custom JWT and user DTO without password | Manual/API | Ready |
| TC-AUTH-004 | Current user endpoint | Valid JWT | Call `/api/auth/me` with Bearer token | Current user is returned | Manual/API | Ready |
| TC-AUTH-005 | Logout | Logged-in user | Trigger logout | Client session/token is cleared | Manual | Ready |
| TC-RBAC-001 | Admin endpoint protection | USER token | Call admin endpoint as regular user | Request is denied with 403 | Manual/API | Ready |
| TC-RBAC-002 | UI admin restriction | Logged-in non-admin user | Navigate to admin UI | Admin-only controls are hidden or inaccessible | Manual | Ready |
| TC-ITEM-001 | Public feed | Backend has active items | Open `/feed` or call `GET /api/items` | Active lost/found items are listed without sensitive contact info | Manual/API | Ready |
| TC-ITEM-002 | Search/filter | Backend has matching items | Search by title/description/tag and filter by status/category | Feed only shows matching items | Manual/API | Ready |
| TC-ITEM-003 | Create lost item | Authenticated user | Submit lost item data without image | Item is created and appears in feed | Manual/API | Ready |
| TC-ITEM-004 | Create found item requires image | Authenticated user | Attempt to submit Found item without image | UI/backend should reject with image-required validation | Manual | Needs focused verification |
| TC-ITEM-005 | Image upload validation | Authenticated item owner | Upload JPEG/PNG to `/api/items/{id}/upload-image` | Image is stored and URL is linked to item | Manual/API | Ready |
| TC-ITEM-006 | Invalid image upload | Authenticated item owner | Upload non-JPEG/PNG file | API returns validation error | Manual/API | Ready |
| TC-ITEM-007 | Edit own item | Authenticated item owner | Update title/description/status | Updated item persists | Manual/API | Ready |
| TC-ITEM-008 | Delete own item | Authenticated item owner | Delete item | Item is removed from feed/database | Manual/API | Ready |
| TC-CLAIM-001 | Reveal audit trail | Authenticated user viewing item | Click reveal button/call `/api/items/{id}/reveal` | Claim record is created before sensitive details are returned | Manual/API | Ready |
| TC-CLAIM-002 | Guest privacy | Guest user | View item details | Contact/drop-off information remains hidden | Manual | Ready |
| TC-CAT-001 | Category list | App running | Call `/api/categories` or load post form | Categories populate selection | Manual/API | Ready |
| TC-PROFILE-001 | Profile update | Authenticated user | Update contact preference/profile fields | Data persists and future reveals use updated contact details | Manual/API | Ready |
| TC-ADMIN-001 | Resolve item | Admin user | Mark an item resolved | Item is removed from active feed and retained for records | Manual/API | Ready |
| TC-ADMIN-002 | Delete inappropriate item | Admin user | Delete an item via admin endpoint/UI | Item is removed | Manual/API | Ready |
| TC-MAIL-001 | Welcome email | SMTP configured | Register account | Welcome email is sent through SMTP service | Manual/integration | Ready |
| TC-MAIL-002 | Item notification email | SMTP configured | Post item | Notification email includes item title and Lost/Found status | Manual/integration | Ready |
| TC-WEB-001 | Protected web routes | Browser with no token | Navigate to `/post`, `/my-posts`, `/profile`, `/admin` | User is redirected or blocked by protected route handling | Manual | Ready |
| TC-WEB-002 | Web production build | None | Run `npm run build` | Build succeeds | Automated | Passed |
| TC-MOBILE-001 | Android login | Backend reachable from emulator | Login via mobile app | JWT/user fields are stored in session | Manual | Ready |
| TC-MOBILE-002 | Android dashboard guard | No mobile session | Open dashboard directly | User is redirected to login | Manual | Ready |
| TC-MOBILE-003 | Android logout | Logged in mobile user | Tap logout | Session is cleared and login is shown | Manual | Ready |

## 7. Entry Criteria

- Refactor branch exists.
- Existing implemented features compile/build before regression execution.
- Required documentation sources have been reviewed.

## 8. Exit Criteria

- Backend, web, and mobile validation commands pass or blockers are documented.
- Requirements Traceability Matrix is complete.
- Regression Test Report includes issues found, fixes applied, and remaining gaps.
- Submission packet is present under `docs/Full Regression Submission/`.
