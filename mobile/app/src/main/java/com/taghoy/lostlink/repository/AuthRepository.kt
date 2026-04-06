package com.taghoy.lostlink.repository

import com.google.gson.Gson
import com.taghoy.lostlink.api.ApiResponse
import com.taghoy.lostlink.api.AuthData
import com.taghoy.lostlink.api.LoginRequest
import com.taghoy.lostlink.api.RegisterRequest
import com.taghoy.lostlink.api.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * Sealed class representing the result of an authentication operation.
 *
 * Used by the Adapter pattern to provide a clean, simplified interface
 * instead of raw Retrofit Callback objects.
 */
sealed class AuthResult {
    /**
     * Successful authentication — contains the auth data payload.
     */
    data class Success(val authData: AuthData) : AuthResult()

    /**
     * Failed authentication — contains a user-friendly error message.
     */
    data class Error(val message: String) : AuthResult()
}

/**
 * Authentication Repository — Adapter Pattern (Structural)
 *
 * **Design Pattern: Adapter (Structural)**
 *
 * This class acts as an Adapter between the Retrofit API layer (which uses
 * [Call]/[Callback] with complex Response objects) and the Activity UI layer
 * (which only needs simple success/error results).
 *
 * **The Adaptation:**
 * - **Adaptee Interface:** Retrofit's `Call<ApiResponse<AuthData>>` with
 *   `Callback.onResponse(Call, Response)` and `Callback.onFailure(Call, Throwable)`
 *   — returns nullable bodies, HTTP status codes, raw error bodies, etc.
 *
 * - **Target Interface:** `(AuthResult) -> Unit` callback with a sealed class
 *   that is either `AuthResult.Success(authData)` or `AuthResult.Error(message)`.
 *
 * **Before (in LoginActivity/RegisterActivity):**
 * Each Activity contained ~40 lines of identical Retrofit callback boilerplate:
 * ```kotlin
 * RetrofitClient.apiService.login(request).enqueue(object : Callback<ApiResponse<AuthData>> {
 *     override fun onResponse(call: Call<...>, response: Response<...>) {
 *         if (response.isSuccessful && response.body()?.success == true) {
 *             val data = response.body()?.data // nullable checks
 *             // ... manual extraction
 *         } else {
 *             val errorBody = response.errorBody()?.string() // nullable
 *             val errorMsg = try { Gson().fromJson(...) } catch (e: Exception) { ... }
 *             // ... complex error parsing
 *         }
 *     }
 *     override fun onFailure(call: Call<...>, t: Throwable) { ... }
 * })
 * ```
 *
 * **After (with Adapter):**
 * ```kotlin
 * authRepository.login(request) { result ->
 *     when (result) {
 *         is AuthResult.Success -> saveSession(result.authData)
 *         is AuthResult.Error -> showError(result.message)
 *     }
 * }
 * ```
 */
class AuthRepository {

    private val apiService = RetrofitClient.apiService

    /**
     * Adapts the Retrofit login call into a simplified AuthResult callback.
     *
     * @param request The login credentials
     * @param callback Simplified callback receiving either Success or Error
     */
    fun login(request: LoginRequest, callback: (AuthResult) -> Unit) {
        apiService.login(request).enqueue(createAuthCallback(callback))
    }

    /**
     * Adapts the Retrofit register call into a simplified AuthResult callback.
     *
     * @param request The registration data
     * @param callback Simplified callback receiving either Success or Error
     */
    fun register(request: RegisterRequest, callback: (AuthResult) -> Unit) {
        apiService.register(request).enqueue(createAuthCallback(callback))
    }

    /**
     * Creates the Retrofit Callback adapter that translates the complex
     * Retrofit response into a clean [AuthResult] sealed class.
     *
     * This is the core of the Adapter pattern — it bridges the gap between
     * Retrofit's callback interface and our simplified result interface.
     */
    private fun createAuthCallback(callback: (AuthResult) -> Unit): Callback<ApiResponse<AuthData>> {
        return object : Callback<ApiResponse<AuthData>> {
            override fun onResponse(
                call: Call<ApiResponse<AuthData>>,
                response: Response<ApiResponse<AuthData>>
            ) {
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    if (data != null) {
                        callback(AuthResult.Success(data))
                    } else {
                        callback(AuthResult.Error("Unexpected empty response from server."))
                    }
                } else {
                    // Parse error from response body
                    val errorMsg = parseErrorResponse(response)
                    callback(AuthResult.Error(errorMsg))
                }
            }

            override fun onFailure(call: Call<ApiResponse<AuthData>>, t: Throwable) {
                callback(
                    AuthResult.Error(
                        "Network error: ${t.localizedMessage ?: "Unable to connect to server."}"
                    )
                )
            }
        }
    }

    /**
     * Parses error details from a Retrofit error response.
     * Handles both structured API errors and raw HTTP errors.
     */
    private fun parseErrorResponse(response: Response<ApiResponse<AuthData>>): String {
        return try {
            val errorBody = response.errorBody()?.string()
            if (errorBody != null) {
                val errorResponse = Gson().fromJson(errorBody, ApiResponse::class.java)
                when {
                    errorResponse.error?.details is Map<*, *> -> {
                        val details = errorResponse.error.details as Map<*, *>
                        details.values.firstOrNull()?.toString() ?: "Validation failed"
                    }
                    errorResponse.error?.details is String -> {
                        errorResponse.error.details.toString()
                    }
                    else -> errorResponse.error?.message ?: "Request failed"
                }
            } else {
                "Request failed (HTTP ${response.code()})"
            }
        } catch (e: Exception) {
            "Request failed. Please try again."
        }
    }
}
