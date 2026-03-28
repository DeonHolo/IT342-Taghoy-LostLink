package com.taghoy.lostlink.api

import com.google.gson.annotations.SerializedName

// ── Request DTOs ──

data class RegisterRequest(
    @SerializedName("studentId") val studentId: String,
    @SerializedName("email") val email: String,
    @SerializedName("firstName") val firstName: String,
    @SerializedName("lastName") val lastName: String,
    @SerializedName("password") val password: String
)

data class LoginRequest(
    @SerializedName("identifier") val identifier: String,
    @SerializedName("password") val password: String
)

// ── Response DTOs ──
// Matches the SDD contract: { "success": boolean, "data": object|null, "error": {...}, "timestamp": string }

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("error") val error: ErrorDetails?,
    @SerializedName("timestamp") val timestamp: String?
)

data class ErrorDetails(
    @SerializedName("code") val code: String?,
    @SerializedName("message") val message: String?,
    @SerializedName("details") val details: Any?
)

// The "data" payload for auth responses
data class AuthData(
    @SerializedName("user") val user: UserData?,
    @SerializedName("accessToken") val accessToken: String?
)

data class UserData(
    @SerializedName("studentId") val studentId: String?,
    @SerializedName("email") val email: String?,
    @SerializedName("firstName") val firstName: String?,
    @SerializedName("lastName") val lastName: String?,
    @SerializedName("role") val role: String?
)
