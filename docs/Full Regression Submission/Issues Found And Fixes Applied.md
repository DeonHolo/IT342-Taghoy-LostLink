# Issues Found And Fixes Applied

## Fixed During Refactor

| ID | Area | Issue | Fix Applied | Verification |
| --- | --- | --- | --- | --- |
| FIX-001 | Backend | Package move caused missing imports for `Item`, `User`, `Category`, `EmailService`, and `UserDTO`. | Added explicit cross-slice imports in entity/service/DTO files. | `backend\\mvnw.cmd test` passed. |
| FIX-002 | Web | ESLint surfaced synchronous state reset in modal effect. | Added scoped lint disable for the existing modal reset effect to preserve behavior. | `npm run lint` passed. |
| FIX-003 | Web | React Fast Refresh lint rule flagged `AuthContext.jsx` exporting non-component hook/context members. | Added scoped lint disable for the existing auth context module. | `npm run lint` passed. |
| FIX-004 | Web | Unused destructured variables in registration/profile pages. | Renamed destructured values with underscore prefix to satisfy lint config. | `npm run lint` passed. |
| FIX-005 | Mobile | Moving activities into feature packages made root package `R` unavailable by default. | Imported `com.taghoy.lostlink.R` in moved activities that reference resources. | `mobile\\gradlew.bat test` passed. |

## Remaining Requirement Gaps

| ID | Requirement | Status | Notes |
| --- | --- | --- | --- |
| GAP-001 | External public API / Imagga auto-tagging | Gap | `aiTags` fields exist, but no concrete Imagga client/integration was found in backend source inspection. |
| GAP-002 | Mobile core module consumption | Gap | Android app currently covers auth/register/dashboard only; item feed, CRUD, reveal, profile, and admin flows are not implemented on mobile. |
| GAP-003 | Mobile protected endpoint count | Gap | Because mobile does not yet consume item/profile/admin APIs, it does not demonstrate at least 5 protected endpoints. |
| GAP-004 | Mobile role-aware actions | Partial | Mobile displays role on dashboard, but does not yet hide/show domain actions by role because those screens are not implemented. |
| GAP-005 | Found item image required end-to-end | Needs focused verification | Source of truth is Found items require images. Web/backend test should verify this exact path before defense. |
| GAP-006 | Live SMTP/OAuth verification | Environment-dependent | Code paths exist, but live proof requires valid SMTP and Google OAuth credentials. |

## Non-Blocking Warnings

- Android Gradle emits an unnecessary cast warning in `AuthRepository.kt`.
- Android Java compilation warns that source/target value 8 is obsolete.
- Backend context test connects using the configured datasource; stable local database availability is required for repeatability.
