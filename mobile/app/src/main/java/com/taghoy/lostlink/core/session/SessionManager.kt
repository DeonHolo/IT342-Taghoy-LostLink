package com.taghoy.lostlink.core.session

import android.content.Context
import android.content.SharedPreferences

/**
 * Session manager using SharedPreferences to store authentication state.
 * Stores user data and access token for session persistence.
 */
class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("LostLinkSession", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_TOKEN = "access_token"
        private const val KEY_STUDENT_ID = "student_id"
        private const val KEY_EMAIL = "email"
        private const val KEY_FIRST_NAME = "first_name"
        private const val KEY_LAST_NAME = "last_name"
        private const val KEY_ROLE = "role"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
    }

    fun saveSession(
        token: String,
        studentId: String?,
        email: String?,
        firstName: String?,
        lastName: String?,
        role: String?
    ) {
        prefs.edit().apply {
            putString(KEY_TOKEN, token)
            putString(KEY_STUDENT_ID, studentId ?: "")
            putString(KEY_EMAIL, email ?: "")
            putString(KEY_FIRST_NAME, firstName ?: "")
            putString(KEY_LAST_NAME, lastName ?: "")
            putString(KEY_ROLE, role ?: "USER")
            putBoolean(KEY_IS_LOGGED_IN, true)
            apply()
        }
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)
    fun getStudentId(): String = prefs.getString(KEY_STUDENT_ID, "") ?: ""
    fun getEmail(): String = prefs.getString(KEY_EMAIL, "") ?: ""
    fun getFirstName(): String = prefs.getString(KEY_FIRST_NAME, "") ?: ""
    fun getLastName(): String = prefs.getString(KEY_LAST_NAME, "") ?: ""
    fun getRole(): String = prefs.getString(KEY_ROLE, "USER") ?: "USER"
    fun isLoggedIn(): Boolean = prefs.getBoolean(KEY_IS_LOGGED_IN, false)

    fun getFullName(): String = "${getFirstName()} ${getLastName()}".trim()

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
