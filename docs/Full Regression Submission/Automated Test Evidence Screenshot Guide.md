# Automated Test Evidence Screenshot Guide: LostLink

Use this guide to capture the screenshots needed for the Automated Test Evidence submission.

## What Went Wrong In The Failed Screenshot

The failed screenshot shows this command was run from the repository root:

```cmd
backend\mvnw.cmd test
```

That starts Maven while the current directory is still:

```cmd
D:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink
```

Maven then searches for `pom.xml` in the repository root. There is no root-level `pom.xml`, so Maven correctly reports:

```text
The goal you specified requires a project to execute but there is no POM in this directory.
```

Do not use that failed screenshot as passing test evidence. Retake the screenshot after running the corrected backend command below.

## Screenshot Capture Method

For every command:

1. Open a terminal.
2. Run the exact command listed in this guide.
3. Wait until the command finishes.
4. Make sure the success message is visible.
5. Press `Windows + Shift + S`.
6. Select the terminal output area.
7. Save the screenshot in:

```text
docs\Full Regression Submission\evidence\
```

Recommended screenshot filenames:

```text
backend-test-screenshot.png
backend-coverage-screenshot.png
web-lint-screenshot.png
web-build-screenshot.png
mobile-test-screenshot.png
```

## Screenshot 1: Backend Maven Test

### Correct CMD Commands

Run this in `cmd.exe`:

```cmd
cd /d "D:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\backend"
mvnw.cmd test
```

Alternative from the repository root:

```cmd
cd /d "D:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink"
backend\mvnw.cmd -f backend\pom.xml test
```

### Screenshot Must Show

Your screenshot should show these lines or equivalent success output:

```text
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] --- jacoco:0.8.12:report (report) @ lostlink ---
[INFO] BUILD SUCCESS
```

### Placeholder

```text
[INSERT backend-test-screenshot.png HERE]
```

## Screenshot 2: Backend JaCoCo Coverage Report

After the backend test succeeds, open the generated coverage report.

### Correct CMD Command

```cmd
start "" "D:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\backend\target\site\jacoco\index.html"
```

### Screenshot Must Show

Your screenshot should show the browser page for the JaCoCo report. It should show the coverage table/summary.

Recorded backend coverage:

```text
Line coverage: 118/826 lines covered (14.29%)
```

### Placeholder

```text
[INSERT backend-coverage-screenshot.png HERE]
```

## Screenshot 3: Web ESLint

### Correct CMD Commands

```cmd
cd /d "D:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\web"
npm run lint
```

### Screenshot Must Show

Your screenshot should show that the command completed without ESLint errors.

Expected result:

```text
npm run lint completed successfully
No ESLint errors
```

If the command prints no errors and returns to the prompt, that is acceptable evidence.

### Placeholder

```text
[INSERT web-lint-screenshot.png HERE]
```

## Screenshot 4: Web Production Build

### Correct CMD Commands

```cmd
cd /d "D:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\web"
npm run build
```

### Screenshot Must Show

Your screenshot should show Vite build success.

Expected success output includes lines like:

```text
vite v...
✓ built in ...
```

### Placeholder

```text
[INSERT web-build-screenshot.png HERE]
```

## Screenshot 5: Mobile Gradle Test

### Correct CMD Commands

```cmd
cd /d "D:\SchoolStuff\College Stuff\3rd Year College BSIT\Second Semester\IT342 (Systems Integrations and Architecture 1)\IT342-Taghoy-LostLink\mobile"
gradlew.bat test
```

### Screenshot Must Show

Your screenshot should show Gradle success.

Expected success output:

```text
BUILD SUCCESSFUL
```

### Placeholder

```text
[INSERT mobile-test-screenshot.png HERE]
```

## Final Evidence Checklist

Before converting the report to PDF or submitting:

| Evidence | Screenshot File | Required Status |
|---|---|---|
| Backend Maven test | `backend-test-screenshot.png` | Must show `BUILD SUCCESS` |
| Backend JaCoCo coverage | `backend-coverage-screenshot.png` | Must show JaCoCo HTML report |
| Web ESLint | `web-lint-screenshot.png` | Must show no lint errors |
| Web production build | `web-build-screenshot.png` | Must show Vite build success |
| Mobile Gradle test | `mobile-test-screenshot.png` | Must show `BUILD SUCCESSFUL` |

## What Not To Submit As Passing Evidence

Do not submit screenshots that show:

- `BUILD FAILURE`
- `MissingProjectException`
- `there is no POM in this directory`
- `npm ERR!`
- `BUILD FAILED`
- ESLint errors
- Gradle compilation errors

If any of those appear, fix the command or issue first, rerun, and screenshot the successful output.

