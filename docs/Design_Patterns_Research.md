# Software Design Patterns Research Document

**Student Name:** Ron Luigi F. Taghoy  
**Course / Subject:** IT342 — Systems Integration and Architecture 1  
**Project Name:** LostLink  
**Date:** April 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Creational Patterns](#creational-patterns)
   - [Builder Pattern](#1-builder-pattern)
   - [Singleton Pattern](#2-singleton-pattern)
3. [Structural Patterns](#structural-patterns)
   - [Facade Pattern](#3-facade-pattern)
   - [Adapter Pattern](#4-adapter-pattern)
4. [Behavioral Patterns](#behavioral-patterns)
   - [Template Method Pattern](#5-template-method-pattern)
   - [Observer Pattern](#6-observer-pattern)
5. [Summary Table](#summary-table)

---

## Introduction

Software design patterns are proven, reusable solutions to common software design problems. They provide templates for writing code that is maintainable, scalable, and easy to understand. In the context of system integration — where a backend (Spring Boot), web frontend (React), and mobile application (Android/Kotlin) must work together — applying the right patterns is critical for managing complexity across layers.

This document researches six design patterns (two Creational, two Structural, two Behavioral) and maps each to a concrete use case within the **LostLink** lost-and-found campus platform.

---

## Creational Patterns

Creational patterns deal with **object creation** mechanisms, abstracting the instantiation process to make the system independent of how objects are created.

---

### 1. Builder Pattern

| Attribute | Details |
|---|---|
| **Pattern Name** | Builder |
| **Category** | Creational |
| **Gang of Four Classification** | Object Creational |

#### Problem It Solves

When an object requires many optional parameters, constructors become unwieldy (the "telescoping constructor" anti-pattern). For example, constructing an API response with success status, data payload, error details, and a timestamp produces constructor overloads that are hard to read and error-prone. The Builder pattern eliminates this by providing a step-by-step fluent API for object construction.

#### How It Works

The Builder pattern separates the construction of a complex object from its representation. A **Builder** class exposes setter-like methods (often returning `this` for chaining) that configure each part. A final `build()` method assembles and returns the completed object. This ensures:

- Immutable objects can be constructed without massive constructor parameter lists.
- Optional fields have sensible defaults without requiring overloaded constructors.
- The construction process is self-documenting and readable.

```
Director (optional)
   │
   └──▶ Builder
           ├── setPartA()   → returns Builder
           ├── setPartB()   → returns Builder
           └── build()      → returns Product
```

#### Real-World Example

In backend web development with Spring Boot, response DTOs often need to convey multiple pieces of information (success flag, data payload, error details, timestamps). The **Lombok `@Builder`** annotation generates a Builder automatically at compile time, allowing controllers to construct responses fluently:

```java
ApiResponse.builder()
    .success(true)
    .data(payload)
    .timestamp(LocalDateTime.now().toString())
    .build();
```

This pattern is used extensively in frameworks like **Spring WebFlux**, **Retrofit's Request.Builder**, and **OkHttp's Request.Builder**.

#### Possible Use Case in LostLink

In LostLink's backend, the `AuthController` currently constructs API response payloads using raw `LinkedHashMap<String, Object>` instances. This is not type-safe and is hard to refactor if the response shape changes. By creating a `UserDTO` with a Builder and an `AuthResponseData` with a Builder, the controller becomes:

```java
UserDTO userDto = UserDTO.fromEntity(user);
AuthResponseData data = AuthResponseData.builder()
    .user(userDto)
    .accessToken(tokenValue)
    .build();
return ResponseEntity.ok(ApiResponse.ok(data));
```

This replaces ~10 lines of manual map construction with a single type-safe, readable expression.

---

### 2. Singleton Pattern

| Attribute | Details |
|---|---|
| **Pattern Name** | Singleton |
| **Category** | Creational |
| **Gang of Four Classification** | Object Creational |

#### Problem It Solves

Some objects should exist **exactly once** throughout the application lifecycle — database connections, API clients, logging systems, or configuration managers. Without the Singleton pattern, multiple instances may be created accidentally, leading to wasted resources, inconsistent state, or conflicting configurations (e.g., two HTTP clients with different timeout settings).

#### How It Works

The Singleton pattern restricts a class to a **single instance** and provides a global point of access to it. Implementations typically involve:

1. A **private constructor** to prevent external instantiation.
2. A **static field** holding the single instance.
3. A **static accessor method** (e.g., `getInstance()`) that lazily initializes or returns the existing instance.

Thread-safe variants use synchronized initialization, double-checked locking, or language-level constructs (Kotlin's `object` keyword, JavaScript module caching).

```
Client ──▶ Singleton.getInstance() ──▶ [Single Instance]
```

#### Real-World Example

In Android development, **Retrofit** API clients are almost always implemented as singletons. Creating multiple Retrofit instances for the same API wastes memory (each creates its own OkHttpClient thread pool) and makes it impossible to apply consistent interceptors. Similarly, in JavaScript/React applications, the **Axios instance** (created once with `axios.create()`) acts as a module-level singleton shared across all service files.

#### Possible Use Case in LostLink

- **Mobile (`RetrofitClient.kt`):** Already uses Kotlin's `object` keyword (language-enforced Singleton), but can be improved with `lazy` initialization so the OkHttpClient and Retrofit instance are only created when first accessed.
- **Web (`api.js`):** The Axios instance is a module-level singleton, but lacks interceptors for automatic token injection and centralized error handling. Adding interceptors to this single instance ensures every API call in the application benefits from consistent auth headers and error handling.

---

## Structural Patterns

Structural patterns deal with **object composition**, defining how classes and objects are combined to form larger structures while keeping them flexible and efficient.

---

### 3. Facade Pattern

| Attribute | Details |
|---|---|
| **Pattern Name** | Facade |
| **Category** | Structural |
| **Gang of Four Classification** | Object Structural |

#### Problem It Solves

When a subsystem consists of multiple classes or APIs (e.g., an HTTP client, local storage, and error parsing), client code becomes tightly coupled to the internal complexity of that subsystem. Changes to any internal component ripple through all clients. The Facade pattern provides a **simplified, unified interface** to the subsystem, shielding clients from its internal details.

#### How It Works

A **Facade** class sits in front of one or more subsystem classes and exposes high-level methods that orchestrate calls to the subsystem. Clients interact only with the Facade, not with the individual subsystem components.

```
Client ──▶ Facade
              ├── SubsystemA (Axios API)
              ├── SubsystemB (localStorage)
              └── SubsystemC (Error parsing)
```

Key benefits:
- **Reduced coupling** — clients depend only on the Facade.
- **Simplified interface** — complex multi-step operations become single method calls.
- **Easier refactoring** — internal subsystem changes don't affect client code.

#### Real-World Example

In enterprise applications, an **AuthenticationService** facade commonly wraps token management, API calls, and session storage. Instead of every component making raw HTTP requests and manually parsing tokens, they call `authService.login(credentials)` which handles everything internally. Libraries like **Firebase Auth** and **AWS Amplify Auth** are real-world facades over complex OAuth/token refresh flows.

#### Possible Use Case in LostLink

In LostLink's React web frontend, `Login.jsx`, `Register.jsx`, and `Dashboard.jsx` each independently:
- Call the Axios API directly
- Parse error responses manually
- Read/write `localStorage` for session data

This duplicated logic can be consolidated into an `AuthService` facade:
- `AuthService.login(form)` — calls API, stores session, returns clean result
- `AuthService.register(form)` — calls API, parses errors, returns result
- `AuthService.logout()` — clears all stored data
- `AuthService.getCurrentUser()` — reads stored user
- `AuthService.isAuthenticated()` — checks for valid token

---

### 4. Adapter Pattern

| Attribute | Details |
|---|---|
| **Pattern Name** | Adapter |
| **Category** | Structural |
| **Gang of Four Classification** | Object Structural |

#### Problem It Solves

When two interfaces are incompatible — e.g., a library provides callbacks in one format but the application expects data in another — the Adapter pattern creates a **wrapper** that translates between the two. This avoids modifying either the library or the client code.

#### How It Works

An **Adapter** class implements the interface expected by the client and internally delegates to the adaptee (the incompatible class). It translates requests from the client interface into calls the adaptee understands, and converts the adaptee's responses back into the format the client expects.

```
Client ──▶ Adapter (implements TargetInterface)
               └── Adaptee (incompatible interface)
```

Variants:
- **Object Adapter** — uses composition (holds a reference to the adaptee).
- **Class Adapter** — uses inheritance (extends the adaptee). Less common in modern code.

#### Real-World Example

In Android development, a **Repository** layer commonly adapts Retrofit's callback-based API (`Call<T>` / `Callback<T>`) into a cleaner format consumable by ViewModels or Activities. For instance, Retrofit returns raw `Response<ApiResponse<T>>` objects with HTTP status codes and nullable bodies. A Repository adapter can convert these into sealed classes like `Result.Success(data)` or `Result.Error(message)`, simplifying the UI layer's error handling from ~30 lines to ~5 lines.

#### Possible Use Case in LostLink

In LostLink's mobile app, both `LoginActivity` and `RegisterActivity` contain ~40 lines of nearly identical Retrofit callback boilerplate:
- Create a `Callback<ApiResponse<AuthData>>`
- Check `response.isSuccessful`
- Parse `response.body()`
- Parse `response.errorBody()` with `Gson`
- Handle `onFailure()`

An `AuthRepository` adapter wraps this complexity and exposes:
```kotlin
authRepository.login(request) { result ->
    when (result) {
        is AuthResult.Success -> { /* use result.authData */ }
        is AuthResult.Error -> { /* show result.message */ }
    }
}
```

---

## Behavioral Patterns

Behavioral patterns deal with **communication between objects**, defining how objects interact and distribute responsibility.

---

### 5. Template Method Pattern

| Attribute | Details |
|---|---|
| **Pattern Name** | Template Method |
| **Category** | Behavioral |
| **Gang of Four Classification** | Class Behavioral |

#### Problem It Solves

When multiple classes follow the **same sequence of steps** but differ in specific steps, code duplication occurs. For example, two Activity classes both initialize view binding, create a session manager, set up click listeners, validate inputs, call an API, handle loading states, and navigate on success — but differ only in *which* inputs they collect and *which* API they call. The Template Method pattern extracts the shared algorithm skeleton into a base class, allowing subclasses to override only the steps that vary.

#### How It Works

A **base class** defines the overall algorithm as a series of method calls (the "template method"). Some methods provide default implementations (common behavior), while others are declared `abstract` and must be overridden by subclasses. This enforces a consistent order of operations while allowing customization.

```
AbstractClass (Template Method)
   │
   ├── step1()           ← concrete (shared)
   ├── step2()           ← abstract (subclass overrides)
   ├── step3()           ← concrete (shared)
   └── templateMethod()  ← defines: step1() → step2() → step3()
        │
        ├── ConcreteClassA (overrides step2)
        └── ConcreteClassB (overrides step2)
```

#### Real-World Example

In Android, `AppCompatActivity` itself is an example of the Template Method pattern — it defines the lifecycle (`onCreate → onStart → onResume`) and subclasses override specific hooks. More specifically, many apps create a `BaseActivity` that handles common concerns (toolbar setup, analytics tracking, loading indicators), and screen-specific activities override only the content-specific methods.

#### Possible Use Case in LostLink

`LoginActivity` and `RegisterActivity` share **identical** implementations of:
- `setLoading(loading: Boolean)` — toggle progress bar and button state
- `showError(message: String)` — display/hide error text
- `navigateToDashboard()` — create intent with clear flags
- `saveSessionAndNavigate()` — save to SessionManager and navigate
- Session check in `onCreate`

A `BaseAuthActivity` can extract these into a template, requiring subclasses to implement only:
- `getViewBinding()` — return the specific binding
- `setupListeners()` — wire up form-specific buttons
- `validateAndSubmit()` — validate form-specific inputs

---

### 6. Observer Pattern

| Attribute | Details |
|---|---|
| **Pattern Name** | Observer |
| **Category** | Behavioral |
| **Gang of Four Classification** | Object Behavioral |

#### Problem It Solves

When multiple objects need to stay **synchronized** with the state of another object, hardcoding these dependencies creates tight coupling. For example, if a user logs out, the navigation bar, dashboard, and profile panel all need to update — but they shouldn't depend on each other. The Observer pattern establishes a **one-to-many** dependency: when the subject's state changes, all observers are notified and updated automatically.

#### How It Works

The pattern involves two roles:
- **Subject** (Observable) — maintains a list of observers and notifies them of state changes.
- **Observer** — registers with the subject and reacts to notifications.

```
Subject (AuthState)
   │
   ├── notify() ──▶ Observer A (Navbar)
   ├── notify() ──▶ Observer B (Dashboard)
   └── notify() ──▶ Observer C (ProfilePanel)
```

Modern implementations use language-specific mechanisms:
- **React**: Context API + `useContext()` hook (components automatically re-render when context changes)
- **Android**: `LiveData` / `StateFlow` with `observe()`
- **Java**: `PropertyChangeListener` or custom event systems

#### Real-World Example

React's **Context API** is a direct implementation of the Observer pattern. When an `AuthProvider` component updates its state (e.g., `user` becomes `null` after logout), every component that calls `useAuth()` automatically re-renders with the new state. This is identical to the classical Observer pattern where the context is the Subject and the `useContext` consumers are the Observers.

Other real-world examples include:
- **Event-driven architectures** (Kafka, RabbitMQ)
- **DOM event listeners** in browsers
- **Redux/Zustand** state management libraries

#### Possible Use Case in LostLink

In LostLink's React web frontend, auth state is currently stored in `localStorage` and read independently by each page component. This has problems:
1. No reactivity — if another tab logs out, open components don't update.
2. Each component duplicates `localStorage.getItem('user')` logic.
3. No single source of truth for auth state.

By implementing an `AuthContext` (Observer pattern), the auth state becomes centralized:
- `AuthProvider` acts as the **Subject** — manages `user`, `token`, and `isAuthenticated` state.
- Page components act as **Observers** — they call `useAuth()` and automatically re-render when auth state changes.
- `ProtectedRoute` can guard routes reactively — if `isAuthenticated` becomes `false`, the user is immediately redirected.

---

## Summary Table

| # | Pattern | Category | Problem Solved | Applied In LostLink |
|---|---|---|---|---|
| 1 | Builder | Creational | Complex object construction with many parameters | Backend `ApiResponse` + `UserDTO` construction |
| 2 | Singleton | Creational | Ensuring single instance of shared resources | Mobile `RetrofitClient` + Web Axios instance |
| 3 | Facade | Structural | Simplifying complex subsystem interfaces | Web `AuthService` unifying API + storage + error parsing |
| 4 | Adapter | Structural | Bridging incompatible interfaces | Mobile `AuthRepository` adapting Retrofit callbacks → sealed results |
| 5 | Template Method | Behavioral | Eliminating duplicated algorithm skeletons | Mobile `BaseAuthActivity` for Login/Register |
| 6 | Observer | Behavioral | Keeping multiple objects in sync with state changes | Web `AuthContext` for reactive auth state management |

---

*End of Research Document*
