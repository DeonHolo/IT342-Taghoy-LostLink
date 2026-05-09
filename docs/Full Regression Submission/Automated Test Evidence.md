# Automated Test Evidence: LostLink

## Purpose

This document centralizes all automated test evidence required for submission, including automated test results, log summaries, coverage status, and placeholders for screenshots that should be inserted after the commands are rerun locally.

## Repository And Branch

Repository URL: https://github.com/DeonHolo/IT342-Taghoy-LostLink
Refactor branch: deonholo/ref/vertical-slice-regression

## Evidence Checklist

- Backend test execution screenshot: PLACEHOLDER
- Backend JaCoCo coverage screenshot: PLACEHOLDER
- Web lint execution screenshot: PLACEHOLDER
- Web build execution screenshot: PLACEHOLDER
- Mobile Gradle test execution screenshot: PLACEHOLDER
- Backend test log summary: Included
- Web lint/build log summary: Included
- Mobile test log summary: Included
- Backend JaCoCo line coverage: 118/826 lines covered (14.29%). HTML report: backend/target/site/jacoco/index.html. CSV copy: docs/Full Regression Submission/evidence/backend-jacoco.csv.
- Automated test results: Included

## Screenshot Capture Instructions

Use Windows screenshot shortcuts after each command finishes:
1. Run the command in a terminal.
2. Make sure the terminal shows the success lines.
3. Press Windows + Shift + S.
4. Select the terminal area.
5. Save the image into docs/Full Regression Submission/evidence/.
6. Recommended filenames:
   - backend-test-screenshot.png
   - backend-coverage-screenshot.png
   - web-lint-screenshot.png
   - web-build-screenshot.png
   - mobile-test-screenshot.png

## Backend Automated Test Result

Command:
cd "d:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\backend"
.\mvnw.cmd test

Expected screenshot: terminal showing BUILD SUCCESS and Tests run: 1, Failures: 0, Errors: 0, Skipped: 0.
Actual recorded result: PASS.
Log summary file: evidence/backend-test-summary.txt.
Backend JaCoCo line coverage: 118/826 lines covered (14.29%). HTML report: backend/target/site/jacoco/index.html. CSV copy: docs/Full Regression Submission/evidence/backend-jacoco.csv.

[SCREENSHOT PLACEHOLDER: Backend Maven test result]

## Web Lint Automated Result

Command:
cd "d:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\web"
npm run lint

Expected screenshot: terminal showing ESLint completed without errors.
Actual recorded result: PASS.
Log summary file: evidence/web-lint-summary.txt.
Coverage report: Not generated. No frontend test coverage tool is configured.

[SCREENSHOT PLACEHOLDER: Web npm run lint result]

## Web Build Automated Result

Command:
cd "d:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\web"
npm run build

Expected screenshot: terminal showing Vite build success and generated dist assets.
Actual recorded result: PASS.
Log summary file: evidence/web-build-summary.txt.
Coverage report: Not applicable to build-only validation.

[SCREENSHOT PLACEHOLDER: Web npm run build result]

## Mobile Automated Test Result

Command:
cd "d:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\mobile"
.\gradlew.bat test

Expected screenshot: terminal showing BUILD SUCCESSFUL.
Actual recorded result: PASS.
Log summary file: evidence/mobile-test-summary.txt.
Coverage report: Not generated. Android coverage tooling is not configured in the current Gradle project.

[SCREENSHOT PLACEHOLDER: Mobile Gradle test result]

## Automated Test Results Table

Backend Maven Tests: PASS. Spring context test ran with 0 failures.
Web ESLint: PASS. No lint errors after refactor fixes.
Web Production Build: PASS. Vite production build completed.
Mobile Gradle Unit Tests: PASS. Debug/release compilation and unit test tasks completed.

## Coverage Report Status

Backend coverage report: JaCoCo generated a backend coverage report at `backend/target/site/jacoco/index.html`, with a copied CSV evidence file at `docs/Full Regression Submission/evidence/backend-jacoco.csv`.

Backend line coverage: 118/826 lines covered (14.29%).

Web and mobile coverage reports are not generated because their coverage tooling is not configured in the current projects. Their automated evidence is provided through lint, build, and Gradle test results.
