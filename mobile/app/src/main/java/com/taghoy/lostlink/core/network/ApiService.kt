package com.taghoy.lostlink.core.network

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Retrofit API service interface matching the LostLink SDD endpoints.
 * Phase 2: Authentication endpoints only.
 */
interface ApiService {

    /**
     * POST /api/auth/register
     * Creates a new user account.
     */
    @POST("api/auth/register")
    fun register(@Body request: RegisterRequest): Call<ApiResponse<AuthData>>

    /**
     * POST /api/auth/login
     * Authenticates a user with Student ID/Email + password.
     */
    @POST("api/auth/login")
    fun login(@Body request: LoginRequest): Call<ApiResponse<AuthData>>
}
