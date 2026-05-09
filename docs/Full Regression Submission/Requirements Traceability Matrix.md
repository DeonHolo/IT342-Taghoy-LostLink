# Requirements Traceability Matrix

## Legend

- Implemented: behavior exists in the current project.
- Partial: some behavior exists but not the full requirement.
- Gap: required by documentation but not implemented or not verified.
- N/A: requirement does not apply because the approved SDD excludes it.

| Requirement | Source | Implementation Evidence | Test Coverage | Status |
| --- | --- | --- | --- | --- |
| User registration | Project Requirements 1; SDD AC-1 | Backend auth slice, web register page, mobile register activity | TC-AUTH-001, TC-AUTH-002 | Implemented |
| User login | Project Requirements 1; SDD AC-1 | Backend auth slice, web login, mobile login | TC-AUTH-003 | Implemented |
| JWT authentication | Project Requirements 1; SDD API standards | Backend security platform slice, web Axios interceptor, mobile session storage | TC-AUTH-003, TC-AUTH-004 | Implemented for backend/web; partial mobile because token is stored but broader protected mobile calls are not present |
| Logout | Project Requirements 1 | Backend logout endpoint surface, web/mobile client session clearing | TC-AUTH-005, TC-MOBILE-003 | Implemented |
| BCrypt password hashing | Project Requirements 1; SDD security | Auth service uses PasswordEncoder | TC-AUTH-001 | Implemented |
| Protected routes/pages | Project Requirements 1 and 4.8 | Web ProtectedRoute, backend security config | TC-WEB-001, TC-RBAC-001 | Implemented |
| `/me` endpoint | Project Requirements 1 | Backend auth controller and web auth hydration | TC-AUTH-004 | Implemented |
| Minimum two roles | Project Requirements 2 | User/Role model and data seeder | TC-RBAC-001 | Implemented |
| API-level role restriction | Project Requirements 2 | Admin endpoints under security config | TC-RBAC-001 | Implemented |
| UI-level role restriction | Project Requirements 2 | Web admin UI and navigation role checks | TC-RBAC-002 | Implemented on web; partial on mobile |
| Major entity besides User | Project Requirements 3 | Item entity and item feature slice | TC-ITEM-001 to TC-ITEM-008 | Implemented |
| Full CRUD for core entity | Project Requirements 3 | Item create/read/update/delete endpoints and web pages | TC-ITEM-001, TC-ITEM-003, TC-ITEM-007, TC-ITEM-008 | Implemented |
| Proper validation | Project Requirements 3 | DTO validation, service/controller validation, upload content type checks | TC-AUTH-002, TC-ITEM-004, TC-ITEM-006 | Partial; Found-image required rule needs focused verification |
| External public API | Project Requirements 4.1; SDD Imagga | `aiTags` fields exist, but no concrete Imagga client found in backend source inspection | TC-ITEM-002, TC-ITEM-005 | Gap |
| Google OAuth login | Project Requirements 4.2; SDD AC-2 | Backend Google OAuth service and web auth service endpoint call | TC-AUTH-003 | Implemented endpoint surface; live OAuth requires configured Google client |
| File upload | Project Requirements 4.3; SDD Item Reporting | Backend upload endpoint and web post/edit support | TC-ITEM-005, TC-ITEM-006 | Implemented |
| Payment gateway | Project Requirements 4.4 | SDD excludes reward payment processing | Not tested | N/A |
| Real-time feature | Project Requirements 4.5 optional bonus | Not implemented | Not tested | N/A / Bonus gap |
| SMTP email sending | Project Requirements 4.6; SDD AC-1, AC-7 | Email service integrated with registration and item posting | TC-MAIL-001, TC-MAIL-002 | Implemented; needs SMTP credentials for live verification |
| Spring Boot backend | Project Requirements 4.7 | `backend/` Maven Spring Boot app | Backend Maven test | Implemented |
| React web app consuming API | Project Requirements 4.8 | `web/` React app with Axios API client | Web lint/build, manual web cases | Implemented |
| Minimum five database tables | Project Requirements 5; SDD DB design | users, roles, categories, items, claims | Backend context load | Implemented |
| Relationships and normalization | Project Requirements 5 | JPA relationships between users, roles, categories, items, claims | Backend context load | Implemented |
| DTOs avoid password exposure | Project Requirements 5 | UserDTO/AuthResponseData DTOs | TC-AUTH-003 | Implemented |
| Architecture pattern documented | Project Requirements 6 | This packet and SDD architecture section | Updated Project Structure | Implemented |
| Controller/service/repository/DTO/security/exception | Project Requirements 6 | Preserved inside vertical slices plus shared/platform packages | Backend Maven test | Implemented |
| Android Kotlin XML API 34 Retrofit | Project Requirements 7.1 | Mobile Gradle config and refactored Android source | Mobile Gradle test | Implemented stack |
| Android JWT auth integration | Project Requirements 7.2 | Mobile login/register/session manager | TC-MOBILE-001 | Partial; token is stored but no broad protected domain calls |
| Android core module consumption | Project Requirements 7.3 | No mobile item feed/API consumption beyond auth | Not tested | Gap |
| Android role awareness | Project Requirements 7.4 | Dashboard displays role only | TC-MOBILE-001 | Partial |
| Android same backend API | Project Requirements 7.5 | Retrofit base URL targets backend | Mobile Gradle test; manual required | Partial |
| Required repository structure | Project Requirements 9 | `backend/`, `web/`, `mobile/`, `docs/`, `README.md` | Git tree | Implemented |
