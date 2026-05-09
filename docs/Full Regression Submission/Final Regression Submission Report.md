# Final Regression Submission Report: LostLink

## Submission Summary

This Markdown report is the self-contained version of the LostLink vertical slice refactoring and full regression testing submission. It is intended to be manually converted to PDF if needed.

The three required submission items are:

| Requirement | Submission Value |
|---|---|
| GitHub repository link | `https://github.com/DeonHolo/IT342-Taghoy-LostLink` |
| Refactor branch | `deonholo/ref/vertical-slice-regression` |
| Branch URL | `https://github.com/DeonHolo/IT342-Taghoy-LostLink/tree/deonholo/ref/vertical-slice-regression` |
| Full regression report | This Markdown file, or a PDF exported from it |
| Automated test evidence | Included in this report and supported by files under `docs/Full Regression Submission/evidence/` |

## GitHub Repository Evidence

Repository URL:

```text
https://github.com/DeonHolo/IT342-Taghoy-LostLink
```

Refactor branch:

```text
deonholo/ref/vertical-slice-regression
```

Branch push status:

```text
Pushed to origin/deonholo/ref/vertical-slice-regression
```

Latest pushed commits:

```text
b546165 docs: Record clean refactor commit in report
2781831 ref: Reorganize LostLink into vertical slices
3f4310d feat: add item resolution functionality and email notifications; enhance item filtering and UI updates for resolved status
d6f29c5 feat: implement user suspension management and enhance item filtering by date range; add new ClaimController for claims handling
a624f67 feat: enhance admin functionalities with item resolution, claims management, and category handling; introduce new components for platform selection in user interactions
5588a6e feat: enhance user and admin functionalities with role management, data seeding, and improved CORS settings; add admin dashboard and user profile features
a47c20f feat: implement Google OAuth login and role management in backend; update frontend for Google sign-in integration
c9066ea IT342 Phase 3 - Web Main Feature Completed
4266e57 Merge pull request #2 from DeonHolo/feature/design-patterns-refactor
8d02708 feat: implement JWT-based authentication and secure API endpoints using the Builder pattern for response handling.
```

Commit footer verification:

```text
The latest pushed refactor/report commits were checked for Co-authored-by trailers.
No Co-authored-by footer remains in the recent pushed commits.
```

## Project Information

| Field | Details |
|---|---|
| Project name | LostLink |
| Domain | Campus lost and found platform |
| Backend | Spring Boot, Spring Security, JWT, JPA/Hibernate, Maven |
| Web frontend | React, Vite, Axios, Tailwind CSS, Material UI |
| Mobile frontend | Android Kotlin, XML layouts, ViewBinding, Retrofit, Gradle |
| Database entities | users, roles, categories, items, claims |
| Refactoring target | Vertical Slice Architecture |

## Refactoring Scope

The refactor focused only on implemented features. It did not add new business features to cover unimplemented project requirements. Missing or partial requirements are documented as gaps instead of being hidden.

The source-of-truth rule for found items is:

```text
Found items must require an image.
```

That behavior is preserved as a required manual regression verification point.

## Refactoring Summary

The project was reorganized from broad technical layers into feature-oriented slices while preserving the current implemented behavior.

Backend code moved from controller/service/dto/model/repository/security/config/util packages into feature, integration, platform, and shared packages.

Web code moved from global components/pages/services/utils folders into feature folders and shared infrastructure.

Mobile code moved from root/api/repository/utils packages into core and feature packages.

## Updated Backend Structure

| Area | Responsibility |
|---|---|
| `feature/auth` | Register, login, Google OAuth, logout, current-user responses, auth DTOs |
| `feature/item` | Feed, search/filter, item CRUD, owner actions, upload, resolve/unresolve |
| `feature/category` | Category endpoint, category model, category repository |
| `feature/claim` | Reveal audit controller, model, repository |
| `feature/user` | Profile, activity DTOs, user and role persistence |
| `feature/admin` | Moderation, users, categories, claims, statistics |
| `integration/email` | SMTP welcome and item notification emails |
| `platform/security` | Spring Security, JWT, auth filter, user details |
| `shared` | API response, exception handler, web config, seed data, utility code |

## Updated Web Structure

| Area | Responsibility |
|---|---|
| `features/auth` | Login, registration, protected routes, auth context, auth services |
| `features/feed` | Feed page, item cards, category ordering |
| `features/items` | Post item, edit item, item details, my posts, item/category services |
| `features/profile` | Profile and user activity page |
| `features/admin` | Admin dashboard and admin confirmation modal |
| `shared/api` | Axios/API instance |
| `shared/components` | Shared navigation |
| `shared/utils` | Contact preference and platform utilities |

## Updated Mobile Structure

| Area | Responsibility |
|---|---|
| `core/network` | Retrofit API service, Retrofit client, API models |
| `core/session` | SharedPreferences-backed session manager |
| `features/auth` | Login/register activities and shared auth activity behavior |
| `features/auth/data` | Auth repository and result adapter |
| `features/dashboard` | Session-protected dashboard and placeholder main activity |

## Automated Test Evidence

| Platform | Command | Recorded Result | Evidence |
|---|---|---|---|
| Backend | `backend\mvnw.cmd test` | PASS: 1 test, 0 failures, 0 errors, 0 skipped | `evidence/backend-test-summary.txt` |
| Backend coverage | `backend\mvnw.cmd test` with JaCoCo | PASS: JaCoCo report generated | `evidence/backend-coverage-summary.txt`, `evidence/backend-jacoco.csv` |
| Web lint | `npm run lint` in `web/` | PASS: no ESLint errors | `evidence/web-lint-summary.txt` |
| Web build | `npm run build` in `web/` | PASS: Vite production build completed | `evidence/web-build-summary.txt` |
| Mobile | `mobile\gradlew.bat test` | PASS: Gradle build/test completed | `evidence/mobile-test-summary.txt` |

## Coverage Evidence

Backend coverage was generated using JaCoCo.

| Coverage Field | Value |
|---|---|
| Coverage tool | JaCoCo Maven Plugin |
| HTML report path | `backend/target/site/jacoco/index.html` |
| CSV evidence copy | `docs/Full Regression Submission/evidence/backend-jacoco.csv` |
| Line coverage | `118/826` lines |
| Coverage percentage | `14.29%` |

Coverage note:

```text
The backend coverage percentage is low because the existing automated test suite currently contains only a Spring context test. Web and mobile coverage reports are not generated because coverage tooling is not configured for those projects. Their automated evidence is represented by lint, build, and Gradle test outputs.
```

## Screenshot Placeholders

Insert screenshots below before converting this Markdown file to PDF.

### Backend Maven Test Screenshot

Command:

```powershell
cd "d:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\backend"
.\mvnw.cmd test
```

Screenshot must show:

```text
BUILD SUCCESS
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
JaCoCo report generation
```

Screenshot placeholder:

```text
[INSERT BACKEND TEST EXECUTION SCREENSHOT HERE]
```

### Backend JaCoCo Coverage Screenshot

Open:

```text
backend/target/site/jacoco/index.html
```

Screenshot must show:

```text
JaCoCo HTML coverage report summary page.
```

Screenshot placeholder:

```text
[INSERT BACKEND COVERAGE SCREENSHOT HERE]
```

### Web Lint Screenshot

Command:

```powershell
cd "d:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\web"
npm run lint
```

Screenshot must show:

```text
ESLint completed with no errors.
```

Screenshot placeholder:

```text
[INSERT WEB LINT SCREENSHOT HERE]
```

### Web Build Screenshot

Command:

```powershell
cd "d:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\web"
npm run build
```

Screenshot must show:

```text
Vite production build completed successfully.
```

Screenshot placeholder:

```text
[INSERT WEB BUILD SCREENSHOT HERE]
```

### Mobile Gradle Test Screenshot

Command:

```powershell
cd "d:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\mobile"
.\gradlew.bat test
```

Screenshot must show:

```text
BUILD SUCCESSFUL
```

Screenshot placeholder:

```text
[INSERT MOBILE GRADLE TEST SCREENSHOT HERE]
```

## Screenshot Capture Steps

1. Run one command at a time in the terminal.
2. Wait until the success output is visible.
3. Press `Windows + Shift + S`.
4. Select the terminal output area.
5. Save the screenshot in `docs/Full Regression Submission/evidence/`.
6. Use these filenames:
   - `backend-test-screenshot.png`
   - `backend-coverage-screenshot.png`
   - `web-lint-screenshot.png`
   - `web-build-screenshot.png`
   - `mobile-test-screenshot.png`

## Regression Test Result Summary

| Requirement Area | Result | Notes |
|---|---|---|
| Authentication and security | PASS | Implemented backend, web, and mobile auth surfaces remained valid after refactor. |
| Role-based access control | PASS / PARTIAL | Backend and web implemented surfaces preserved. Mobile role behavior is display-only. |
| Core item module | PASS | Structural/build regression passed. Manual CRUD/feed/reveal verification is still recommended. |
| File upload | PASS / MANUAL VERIFY | Upload paths are preserved. Found-item image-required behavior should be manually verified. |
| Email sending | PARTIAL | Code path preserved. Live SMTP evidence depends on valid credentials. |
| External API integration | GAP | Imagga client integration was not found in backend source inspection. |
| Web application | PASS | ESLint and production build passed after refactor fixes. |
| Mobile application | PASS / PARTIAL | Gradle test passed. Mobile domain screens for item/profile/admin remain incomplete. |
| Documentation | PASS | Submission packet and evidence documents were created under `docs/Full Regression Submission/`. |

## Issues Found And Fixes Applied

| ID | Area | Issue | Fix | Verification |
|---|---|---|---|---|
| FIX-001 | Backend | Package moves caused missing cross-slice imports for moved models, DTOs, services, and repositories. | Added explicit imports after moving files into feature/platform/shared packages. | `backend\mvnw.cmd test` passed. |
| FIX-002 | Web | ESLint flagged synchronous state reset in `LoginModal.jsx`. | Added scoped lint suppression for the existing behavior. | `npm run lint` passed. |
| FIX-003 | Web | React Fast Refresh lint rule flagged combined auth context/hook exports. | Added scoped lint suppression for the existing auth context module pattern. | `npm run lint` passed. |
| FIX-004 | Web | Unused destructured variables in registration/profile pages. | Renamed unused variables with underscore prefixes. | `npm run lint` passed. |
| FIX-005 | Mobile | Moving activities into feature packages broke implicit access to root package resources. | Added `R` imports where needed. | `mobile\gradlew.bat test` passed. |

## Requirement Gaps And Residual Risks

| ID | Gap / Risk | Impact | Status |
|---|---|---|---|
| GAP-001 | External public API / Imagga auto-tagging integration was not found. | Project requirement appears partially unmet. | Documented gap. |
| GAP-002 | Android app currently covers auth/register/dashboard only. | Mobile does not yet consume item feed, CRUD, reveal, profile, or admin APIs. | Documented gap. |
| GAP-003 | Mobile protected endpoint count is not demonstrable. | Mobile cannot yet prove all protected API flows. | Documented gap. |
| GAP-004 | Mobile role-aware actions are partial. | Mobile displays role but has no role-gated domain actions. | Documented gap. |
| GAP-005 | Found-item image-required flow needs final manual proof. | Important requirement needs screenshot/API evidence. | Manual verification required. |
| GAP-006 | Live SMTP/OAuth verification depends on credentials. | Cannot prove live third-party behavior without configured credentials. | Environment-dependent. |

## Final Submission Checklist

Before final upload to the LMS:

- Submit the GitHub branch URL:
  `https://github.com/DeonHolo/IT342-Taghoy-LostLink/tree/deonholo/ref/vertical-slice-regression`
- Convert this Markdown report to PDF if the instructor requires a PDF report.
- Add screenshots into this report before conversion, or attach them separately if the LMS allows supporting files.
- Include the backend JaCoCo coverage evidence from `docs/Full Regression Submission/evidence/backend-jacoco.csv`.
- Confirm that the branch still shows latest pushed commits `b546165` and `2781831`.

## Conclusion

LostLink was refactored into vertical slices across backend, web, and mobile while preserving implemented behavior. The refactor branch was pushed to GitHub, clean commit references are recorded, automated validation passed for backend, web, and mobile, and backend JaCoCo coverage evidence was generated. Remaining incomplete requirements are explicitly documented as gaps rather than hidden.
