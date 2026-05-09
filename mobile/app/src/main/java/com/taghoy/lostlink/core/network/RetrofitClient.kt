package com.taghoy.lostlink.core.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Singleton Retrofit client for connecting to the Spring Boot backend.
 *
 * **Design Pattern: Singleton (Creational)**
 *
 * This object uses Kotlin's `object` keyword to guarantee exactly one instance
 * exists throughout the application lifecycle. Combined with `lazy` initialization,
 * the OkHttpClient and Retrofit instances are only created when first accessed,
 * avoiding unnecessary resource allocation at app startup.
 *
 * Why Singleton?
 * - Prevents multiple OkHttpClient instances (each spawns its own thread pool)
 * - Ensures consistent interceptor configuration across all API calls
 * - Provides a single, global point of access for the API service
 *
 * Base URL:
 *   - Android Emulator: 10.0.2.2 maps to host machine's localhost
 *   - Physical device:  Replace with your machine's local IP address
 */
object RetrofitClient {

    // Change this to your machine's IP when testing on a physical device
    private const val BASE_URL = "http://10.0.2.2:8080/"

    /**
     * Lazy-initialized logging interceptor.
     * Only created when the first API call is made.
     */
    private val loggingInterceptor by lazy {
        HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    /**
     * Lazy-initialized OkHttpClient.
     * Singleton ensures only one thread pool and connection pool exist.
     */
    private val httpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    /**
     * Lazy-initialized Retrofit instance.
     * Configured once and reused for all API service creation.
     */
    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    /**
     * The single ApiService instance used across the entire application.
     * Lazy initialization ensures creation only on first access.
     */
    val apiService: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
}
