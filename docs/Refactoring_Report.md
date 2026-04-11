# Design Patterns Refactoring Report

**Student Name:** Ron Luigi F. Taghoy  
**Course / Subject:** IT342 — Systems Integration and Architecture 1  
**Project Name:** LostLink  
**Branch:** `feature/design-patterns-refactor`  
**Date:** April 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Pattern 1: Builder (Creational) — Backend](#pattern-1-builder-creational--backend)
3. [Pattern 2: Singleton (Creational) — Mobile + Web](#pattern-2-singleton-creational--mobile--web)
4. [Pattern 3: Facade (Structural) — Web Frontend](#pattern-3-facade-structural--web-frontend)
5. [Pattern 4: Adapter (Structural) — Mobile](#pattern-4-adapter-structural--mobile)
6. [Pattern 5: Template Method (Behavioral) — Mobile](#pattern-5-template-method-behavioral--mobile)
7. [Pattern 6: Observer (Behavioral) — Web Frontend](#pattern-6-observer-behavioral--web-frontend)
8. [Summary of Improvements](#summary-of-improvements)

---

## Overview

This report documents the refactoring of the LostLink project to apply six software design patterns across all three layers: **Spring Boot backend** (Java), **React web frontend** (JavaScript), and **Android mobile app** (Kotlin). Each pattern was selected to solve a real, observable problem in the existing codebase — not applied superficially.

---

## Pattern 1: Builder (Creational) — Backend

### Before: Original Implementation

The `AuthController` manually constructed API response payloads using raw `LinkedHashMap<String, Object>`:

```java
// BEFORE — AuthController.java (register endpoint)
Map<String, Object> userData = new LinkedHashMap<>();
userData.put("studentId", user.getStudentId());
userData.put("email", user.getEmail());
userData.put("firstName", user.getFirstName());
userData.put("lastName", user.getLastName());
userData.put("role", user.getRole());

Map<String, Object> data = new LinkedHashMap<>();
data.put("user", userData);
data.put("accessToken", "phase1-placeholder-token");

return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(data));
```

**Problems:**
- **No type safety** — keys are raw strings; typos cause runtime errors, not compile errors.
- **Not self-documenting** — the shape of the response is implicit in scattered `put()` calls.
- **Code duplication** — both `register()` and `login()` endpoints had identical Map construction logic.
- **Hard to refactor** — if the response shape changes, every endpoint must be updated manually.

### Applied Design Pattern: Builder

**Where applied:** New `UserDTO.java` and `AuthResponseData.java` DTOs using Lombok `@Builder`, plus refactored `AuthController.java`.

**Justification:** The Builder pattern separates complex object construction from representation. It provides a fluent API that is type-safe, self-documenting, and eliminates telescoping constructors.

### After: Refactored Code

```java
// AFTER — AuthController.java (register endpoint)
AuthResponseData data = AuthResponseData.builder()
        .user(UserDTO.fromEntity(user))
        .accessToken("phase1-placeholder-token")
        .build();

return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(data));
```

```java
// UserDTO.java — Builder with factory method
public static UserDTO fromEntity(User user) {
    return UserDTO.builder()
            .studentId(user.getStudentId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole())
            .build();
}
```

**Improvements:**
- ✅ Compile-time type safety — field names are method calls, not strings
- ✅ Self-documenting — the response shape is defined in the DTO class
- ✅ DRY — `UserDTO.fromEntity()` eliminates map construction duplication
- ✅ Easy to extend — adding a field to the response requires only adding it to the DTO

### Files Changed

| File | Action |
|---|---|
| `src/.../dto/UserDTO.java` | **NEW** |
| `src/.../dto/AuthResponseData.java` | **NEW** |
| `src/.../controller/AuthController.java` | **MODIFIED** |

---

## Pattern 2: Singleton (Creational) — Mobile + Web

### Before: Original Implementation

**Mobile (`RetrofitClient.kt`):**
```kotlin
// BEFORE — Eager initialization
object RetrofitClient {
    private val loggingInterceptor = HttpLoggingInterceptor().apply { ... }
    private val httpClient = OkHttpClient.Builder()...build()
    private val retrofit: Retrofit = Retrofit.Builder()...build()
    val apiService: ApiService = retrofit.create(ApiService::class.java)
}
```

**Web (`api.js`):**
```javascript
// BEFORE — No interceptors
const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
```

**Problems:**
- **Eager initialization** — Mobile: OkHttpClient thread pool and Retrofit instance created at class load, even if never used.
- **No centralized interceptors** — Web: Each component manually handles auth headers; no automatic token injection or 401 handling.
- **No documentation** — The Singleton nature of both implementations was implicit and undocumented.

### Applied Design Pattern: Singleton

**Where applied:** `RetrofitClient.kt` (lazy initialization) and `api.js` (interceptors on the shared instance).

**Justification:** Both API client instances should exist exactly once to ensure consistent configuration, avoid resource duplication, and provide a single point for cross-cutting concerns (auth headers, error handling).

### After: Refactored Code

**Mobile — lazy Singleton:**
```kotlin
// AFTER — Lazy initialization
object RetrofitClient {
    private val loggingInterceptor by lazy {
        HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }
    }
    private val httpClient by lazy {
        OkHttpClient.Builder().addInterceptor(loggingInterceptor)...build()
    }
    private val retrofit by lazy {
        Retrofit.Builder().baseUrl(BASE_URL).client(httpClient)...build()
    }
    val apiService: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
}
```

**Web — Singleton with interceptors:**
```javascript
// AFTER — Centralized interceptors on the Singleton instance
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Improvements:**
- ✅ Lazy initialization defers resource allocation until first use
- ✅ Automatic auth token injection on every request
- ✅ Centralized 401 handling with auto-logout
- ✅ Single point of configuration for timeouts, headers, and error handling

### Files Changed

| File | Action |
|---|---|
| `mobile/.../api/RetrofitClient.kt` | **MODIFIED** |
| `web/src/services/api.js` | **MODIFIED** |

---

## Pattern 3: Facade (Structural) — Web Frontend

### Before: Original Implementation

Each page component independently managed auth operations:

```javascript
// BEFORE — Login.jsx (inline API + localStorage + error parsing)
const handleSubmit = async (e) => {
    try {
      const res = await loginUser(form);           // Direct API call
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.data.user));  // Direct storage
        localStorage.setItem('token', res.data.data.accessToken);
        navigate('/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;              // Manual error parsing
      if (data?.error?.details) { setError(data.error.details); }
      else if (data?.error?.message) { setError(data.error.message); }
      else { setError('Login failed.'); }
    }
};

// BEFORE — Dashboard.jsx (inline localStorage)
useEffect(() => {
    const stored = localStorage.getItem('user');    // Direct storage read
    if (!stored) { navigate('/login'); return; }
    setUser(JSON.parse(stored));
}, []);
const handleLogout = () => {
    localStorage.removeItem('user');                // Direct storage clear
    localStorage.removeItem('token');
    navigate('/login');
};
```

**Problems:**
- **Tight coupling** — Each component directly depends on Axios, localStorage API, and JSON response structure.
- **Code duplication** — Error parsing logic duplicated across Login and Register.
- **Hard to test** — Cannot mock auth operations without mocking multiple subsystems.
- **Fragile** — If the localStorage key names or API response format change, every component breaks.

### Applied Design Pattern: Facade

**Where applied:** New `AuthService.js` providing a unified interface over API calls, localStorage, and error parsing.

**Justification:** The Facade pattern hides subsystem complexity behind a simple, unified interface. Components only need to know about `AuthService.login()`, not about Axios, localStorage, or error response formats.

### After: Refactored Code

```javascript
// AFTER — AuthService.js (Facade)
const AuthService = {
  async login(credentials) {
    try {
      const res = await loginUser(credentials);
      if (res.data.success) {
        const { user, accessToken } = res.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', accessToken);
        return { success: true, user };
      }
    } catch (err) {
      return { success: false, error: this._parseError(err, 'Login failed.') };
    }
  },
  // ... register(), logout(), getCurrentUser(), isAuthenticated()
};

// AFTER — Login.jsx (simplified via Facade)
const result = await auth.login(form);
if (result.success) { navigate('/dashboard'); }
else { setError(result.error); }
```

**Improvements:**
- ✅ Components decoupled from API, localStorage, and error parsing internals
- ✅ Error parsing centralized in one `_parseError()` method
- ✅ Single point of change if localStorage keys or API format changes
- ✅ Easy to unit test components by mocking AuthService

### Files Changed

| File | Action |
|---|---|
| `web/src/services/AuthService.js` | **NEW** |
| `web/src/pages/Login.jsx` | **MODIFIED** |
| `web/src/pages/Register.jsx` | **MODIFIED** |
| `web/src/pages/Dashboard.jsx` | **MODIFIED** |

---

## Pattern 4: Adapter (Structural) — Mobile

### Before: Original Implementation

Both `LoginActivity` and `RegisterActivity` contained nearly identical ~40-line Retrofit callback blocks:

```kotlin
// BEFORE — LoginActivity.kt (raw Retrofit callback)
RetrofitClient.apiService.login(request).enqueue(object : Callback<ApiResponse<AuthData>> {
    override fun onResponse(call: Call<ApiResponse<AuthData>>, response: Response<ApiResponse<AuthData>>) {
        setLoading(false)
        if (response.isSuccessful && response.body()?.success == true) {
            val data = response.body()?.data
            val user = data?.user
            sessionManager.saveSession(
                token = data?.accessToken ?: "",
                studentId = user?.studentId, email = user?.email,
                firstName = user?.firstName, lastName = user?.lastName, role = user?.role
            )
            Toast.makeText(this@LoginActivity, "Login successful!", Toast.LENGTH_SHORT).show()
            navigateToDashboard()
        } else {
            val errorBody = response.errorBody()?.string()
            val errorMsg = try {
                val errorResponse = Gson().fromJson(errorBody, ApiResponse::class.java)
                errorResponse.error?.message ?: "Login failed"
            } catch (e: Exception) { "Invalid credentials." }
            showError(errorMsg)
        }
    }
    override fun onFailure(call: Call<ApiResponse<AuthData>>, t: Throwable) {
        setLoading(false)
        showError(getString(R.string.error_network) + "\n" + t.localizedMessage)
    }
})
```

**Problems:**
- **Code duplication** — RegisterActivity had an almost identical callback block.
- **Tight coupling** — Activities depend directly on Retrofit's `Call/Callback/Response` interfaces.
- **Complex error handling** — Error body parsing with `Gson` duplicated in both activities.
- **Hard to test** — Cannot test auth logic without mocking Retrofit internals.

### Applied Design Pattern: Adapter

**Where applied:** New `AuthRepository.kt` that adapts Retrofit's `Callback<ApiResponse<AuthData>>` interface into a simplified sealed class result.

**Justification:** The Adapter pattern bridges the incompatible Retrofit callback interface (complex, verbose) with the simple interface the UI layer needs (success/error with a message).

### After: Refactored Code

```kotlin
// AFTER — AuthRepository.kt (Adapter)
sealed class AuthResult {
    data class Success(val authData: AuthData) : AuthResult()
    data class Error(val message: String) : AuthResult()
}

class AuthRepository {
    fun login(request: LoginRequest, callback: (AuthResult) -> Unit) {
        apiService.login(request).enqueue(createAuthCallback(callback))
    }
    // createAuthCallback() handles all the Retrofit→AuthResult translation
}

// AFTER — LoginActivity.kt (simplified via Adapter)
authRepository.login(request) { result ->
    runOnUiThread {
        setLoading(false, ...)
        when (result) {
            is AuthResult.Success -> saveSessionAndNavigate(result.authData, "Login successful!")
            is AuthResult.Error -> showError(result.message)
        }
    }
}
```

**Improvements:**
- ✅ ~40 lines of callback boilerplate per Activity reduced to ~8 lines
- ✅ Error parsing centralized in `AuthRepository.parseErrorResponse()`
- ✅ Activities decoupled from Retrofit's `Call/Callback/Response` interfaces
- ✅ Sealed class provides exhaustive `when` checks (compile-time safety)

### Files Changed

| File | Action |
|---|---|
| `mobile/.../repository/AuthRepository.kt` | **NEW** |
| `mobile/.../LoginActivity.kt` | **MODIFIED** |
| `mobile/.../RegisterActivity.kt` | **MODIFIED** |

---

## Pattern 5: Template Method (Behavioral) — Mobile

### Before: Original Implementation

`LoginActivity` and `RegisterActivity` both independently implemented identical helper methods:

```kotlin
// BEFORE — Duplicated in BOTH LoginActivity.kt AND RegisterActivity.kt

private fun showError(message: String) {
    binding.tvError.text = message
    binding.tvError.visibility = View.VISIBLE
}

private fun setLoading(loading: Boolean) {
    binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
    binding.btnLogin.isEnabled = !loading  // btnRegister in RegisterActivity
    binding.btnLogin.text = if (loading) getString(R.string.loading) else getString(R.string.btn_login)
}

private fun navigateToDashboard() {
    val intent = Intent(this, DashboardActivity::class.java)
    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
    startActivity(intent)
    finish()
}

// Session save logic also duplicated (~6 identical lines)
```

**Problems:**
- **Code duplication** — Five methods with identical or near-identical implementations.
- **Inconsistency risk** — If one activity's `setLoading()` is updated but the other isn't, behavior diverges.
- **Shared lifecycle steps** — Both activities follow the exact same `onCreate` sequence: init binding → init session → check session → setup listeners.

### Applied Design Pattern: Template Method

**Where applied:** New `BaseAuthActivity.kt` abstract class that defines the shared algorithm skeleton and concrete shared methods.

**Justification:** The Template Method pattern extracts a shared algorithm skeleton into a base class, allowing subclasses to override only the steps that vary while inheriting all shared behavior.

### After: Refactored Code

```kotlin
// AFTER — BaseAuthActivity.kt (Template Method)
abstract class BaseAuthActivity : AppCompatActivity() {
    protected lateinit var sessionManager: SessionManager
    protected val authRepository = AuthRepository()

    // Template Method: defines the algorithm skeleton
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initializeBinding()        // abstract — subclass provides binding
        sessionManager = SessionManager(this)  // concrete — shared
        checkExistingSession()     // hook — Login overrides, Register uses default
        setupListeners()           // abstract — subclass wires buttons
    }

    // Shared concrete methods (no longer duplicated)
    protected fun setLoading(loading: Boolean, button: Button, ...) { ... }
    protected fun showError(message: String) { ... }
    protected fun navigateToDashboard() { ... }
    protected fun saveSessionAndNavigate(authData: AuthData, ...) { ... }
}

// AFTER — LoginActivity.kt extends BaseAuthActivity
class LoginActivity : BaseAuthActivity() {
    override fun initializeBinding() { binding = ActivityLoginBinding.inflate(layoutInflater); ... }
    override fun setupListeners() { /* login-specific buttons */ }
    override fun checkExistingSession() { if (sessionManager.isLoggedIn()) navigateToDashboard() }
    // NO duplicated setLoading, showError, navigateToDashboard — inherited!
}
```

**Improvements:**
- ✅ Five duplicated methods eliminated from both subclasses
- ✅ Consistent algorithm skeleton enforced by the base class
- ✅ Adding a new auth screen (e.g., ForgotPasswordActivity) requires only implementing abstract methods
- ✅ `LoginActivity` reduced from 149 to ~80 lines; `RegisterActivity` from 207 to ~120 lines

### Files Changed

| File | Action |
|---|---|
| `mobile/.../BaseAuthActivity.kt` | **NEW** |
| `mobile/.../LoginActivity.kt` | **MODIFIED** |
| `mobile/.../RegisterActivity.kt` | **MODIFIED** |

---

## Pattern 6: Observer (Behavioral) — Web Frontend

### Before: Original Implementation

Each page component independently managed auth state via direct `localStorage` access:

```javascript
// BEFORE — Dashboard.jsx (independent state management)
const [user, setUser] = useState(null);
useEffect(() => {
    const stored = localStorage.getItem('user');   // Each component reads independently
    if (!stored) { navigate('/login'); return; }
    setUser(JSON.parse(stored));
}, [navigate]);

// BEFORE — Login.jsx (independent state storage)
localStorage.setItem('user', JSON.stringify(res.data.data.user));
localStorage.setItem('token', res.data.data.accessToken);
```

**Problems:**
- **No single source of truth** — Auth state is scattered across localStorage and individual component state.
- **No reactivity** — If user logs out, other open components don't know about it.
- **Duplicated logic** — Each component independently reads/parses localStorage.
- **No route protection** — Dashboard manually checks auth state instead of using a guard.

### Applied Design Pattern: Observer

**Where applied:** New `AuthContext.jsx` (Context Provider as Subject), `useAuth()` hook (components as Observers), and `ProtectedRoute.jsx` (reactive route guard).

**Justification:** React's Context API implements the Observer pattern — `AuthProvider` is the Subject that manages centralized auth state, and any component using `useAuth()` is an Observer that automatically re-renders when state changes.

### After: Refactored Code

```javascript
// AFTER — AuthContext.jsx (Subject)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (credentials) => {
    const result = await AuthService.login(credentials);
    if (result.success) {
      setUser(result.user);            // State change → all Observers re-render
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);                     // State change → Observers react
    setIsAuthenticated(false);
  }, []);

  return <AuthContext.Provider value={{ user, isAuthenticated, login, logout, ... }}>
    {children}
  </AuthContext.Provider>;
}

// AFTER — Dashboard.jsx (Observer)
function Dashboard() {
  const { user, logout } = useAuth();  // Subscribes as Observer
  // Automatically re-renders when user/logout state changes
}

// AFTER — App.jsx (ProtectedRoute as Observer)
<ProtectedRoute><Dashboard /></ProtectedRoute>
// Automatically redirects if isAuthenticated becomes false
```

**Improvements:**
- ✅ Single source of truth for auth state
- ✅ Reactive — all components automatically update when auth state changes
- ✅ Route protection via `ProtectedRoute` (Observer of auth state)
- ✅ No more direct `localStorage` access in page components

### Files Changed

| File | Action |
|---|---|
| `web/src/context/AuthContext.jsx` | **NEW** |
| `web/src/components/ProtectedRoute.jsx` | **NEW** |
| `web/src/App.jsx` | **MODIFIED** |
| `web/src/pages/Login.jsx` | **MODIFIED** |
| `web/src/pages/Dashboard.jsx` | **MODIFIED** |

---

## Summary of Improvements

| Area | Before | After |
|---|---|---|
| **Type Safety** | Raw `Map<String, Object>` in controller | Type-safe DTOs with `@Builder` |
| **API Client Init** | Eager initialization | Lazy Singleton with `by lazy` |
| **Auth Headers** | Manual per-request | Automatic via Axios interceptor |
| **Auth Logic (Web)** | Scattered across 3 pages | Centralized in AuthService facade |
| **Retrofit Callbacks** | ~40 lines duplicated per Activity | ~8 lines via AuthRepository adapter |
| **Activity Boilerplate** | 5 methods duplicated in 2 Activities | Inherited from BaseAuthActivity |
| **Auth State (Web)** | Independent localStorage reads | Reactive via AuthContext (Observer) |
| **Route Protection** | Manual checks in each page | Declarative via ProtectedRoute |
| **LoginActivity Lines** | 149 | ~80 |
| **RegisterActivity Lines** | 207 | ~120 |
| **Login.jsx Lines** | 91 (with inline logic) | 65 (clean, delegated) |
| **Dashboard.jsx Lines** | 55 (with manual state) | 40 (reactive, clean) |

All patterns were applied to solve **real, observable problems** in the existing codebase. No patterns were forced unnecessarily.

---

*End of Refactoring Report*
