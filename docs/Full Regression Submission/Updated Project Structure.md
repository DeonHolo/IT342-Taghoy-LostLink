# Updated Project Structure

## Refactoring Summary

LostLink was refactored from technical-layer-first organization toward Vertical Slice Architecture. API routes and user-visible behavior were kept stable while source files were moved closer to their owning feature.

## Backend Before

```text
backend/src/main/java/edu/cit/taghoy/lostlink/
  controller/
  service/
  repository/
  model/
  dto/
  security/
  config/
  util/
```

## Backend After

```text
backend/src/main/java/edu/cit/taghoy/lostlink/
  LostlinkApplication.java
  feature/
    admin/
    auth/
      dto/
    category/
      model/
      repository/
    claim/
      model/
      repository/
    item/
      dto/
      model/
      repository/
    user/
      dto/
      model/
      repository/
  integration/
    email/
  platform/
    security/
  shared/
    api/
    config/
    exception/
    util/
```

## Backend Slice Mapping

| Slice | Responsibilities |
| --- | --- |
| `feature.auth` | Register, login, Google OAuth, logout, current user DTO responses |
| `feature.item` | Feed, search/filter, item CRUD, owner actions, image upload, resolve/unresolve |
| `feature.claim` | Reveal details and claim/audit persistence model |
| `feature.category` | Category utility endpoint and category persistence |
| `feature.user` | Profile, activity, user and role persistence models |
| `feature.admin` | Admin moderation, users, categories, claims, and statistics |
| `integration.email` | SMTP welcome and item notification emails |
| `platform.security` | JWT filter/service, Spring Security config, user-details adapter |
| `shared` | API response envelope, exception handling, web config, shared utilities |

## Web Before

```text
web/src/
  components/
  context/
  pages/
  services/
  utils/
  App.jsx
```

## Web After

```text
web/src/
  App.jsx
  features/
    admin/
      components/
      pages/
    auth/
      components/
      context/
      pages/
      services/
    feed/
      components/
      pages/
      utils/
    items/
      components/
      pages/
      services/
    profile/
      pages/
  shared/
    api/
    components/
    utils/
```

## Web Slice Mapping

| Slice | Responsibilities |
| --- | --- |
| `features.auth` | Login, registration, auth context, protected route, login modal, auth service facade |
| `features.feed` | Public feed page, item cards, feed category ordering |
| `features.items` | Post, edit, detail, my posts, item/category API services, contact field component |
| `features.profile` | Profile and activity page |
| `features.admin` | Admin dashboard and confirmation modal |
| `shared.api` | Axios singleton and endpoint helpers |
| `shared.components` | Navbar used across feature pages |
| `shared.utils` | Contact formatting and platform helpers |

## Mobile Before

```text
mobile/app/src/main/java/com/taghoy/lostlink/
  LoginActivity.kt
  RegisterActivity.kt
  BaseAuthActivity.kt
  DashboardActivity.kt
  MainActivity.kt
  api/
  repository/
  utils/
```

## Mobile After

```text
mobile/app/src/main/java/com/taghoy/lostlink/
  core/
    network/
    session/
  features/
    auth/
      data/
    dashboard/
```

## Mobile Slice Mapping

| Slice | Responsibilities |
| --- | --- |
| `core.network` | Retrofit service, client, API models |
| `core.session` | SharedPreferences-backed session manager |
| `features.auth` | Login/register activities and shared auth template activity |
| `features.auth.data` | Auth repository and result adapter |
| `features.dashboard` | Session-protected dashboard and placeholder main activity |

## Compatibility Notes

- Backend request mappings remain under the same API paths.
- React Router paths are unchanged.
- Android manifest now points to `.features.auth.LoginActivity`, `.features.auth.RegisterActivity`, and `.features.dashboard.DashboardActivity`.
