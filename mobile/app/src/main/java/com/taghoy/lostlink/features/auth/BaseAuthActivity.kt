package com.taghoy.lostlink.features.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.taghoy.lostlink.core.network.AuthData
import com.taghoy.lostlink.features.auth.data.AuthRepository
import com.taghoy.lostlink.features.auth.data.AuthResult
import com.taghoy.lostlink.core.session.SessionManager

/**
 * Abstract base class for authentication Activities (Login, Register).
 *
 * **Design Pattern: Template Method (Behavioral)**
 *
 * This class defines the **template** (skeleton algorithm) for auth screens:
 *
 * ```
 * onCreate() {
 *     initializeBinding()     ← abstract (subclass provides specific ViewBinding)
 *     initSessionManager()    ← concrete (shared by all auth screens)
 *     checkExistingSession()  ← hook (overridable, Login skips to dashboard if logged in)
 *     setupListeners()        ← abstract (subclass wires up form-specific buttons)
 * }
 * ```
 *
 * **Common operations** are implemented once in this base class:
 * - setLoading() — toggle progress bar and button state
 * - showError() — display error text
 * - saveSessionAndNavigate() — save AuthData to SessionManager and navigate to Dashboard
 * - navigateToDashboard() — create intent with clear flags
 *
 * **Variable steps** are declared abstract and must be overridden by subclasses:
 * - initializeBinding() — each screen has its own ViewBinding
 * - setupListeners() — each screen has different form buttons/links
 * - getProgressBar() — returns the screen's ProgressBar view
 * - getErrorTextView() — returns the screen's error TextView
 *
 * Before this pattern, LoginActivity and RegisterActivity each duplicated:
 * - setLoading() (identical 3-line implementation)
 * - showError() (identical 2-line implementation)
 * - navigateToDashboard() (identical 4-line implementation)
 * - SessionManager initialization (identical)
 * - Session save logic (nearly identical)
 */
abstract class BaseAuthActivity : AppCompatActivity() {

    protected lateinit var sessionManager: SessionManager
    protected val authRepository = AuthRepository()

    // ── Template Method: defines the algorithm skeleton ──

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Step 1: Subclass provides its specific ViewBinding
        initializeBinding()

        // Step 2: Shared — initialize SessionManager (same for all auth screens)
        sessionManager = SessionManager(this)

        // Step 3: Hook — check for existing session (Login overrides to skip to dashboard)
        checkExistingSession()

        // Step 4: Subclass wires up form-specific buttons and links
        setupListeners()
    }

    // ── Abstract steps (subclasses MUST override) ──

    /**
     * Initialize the ViewBinding for this screen and call setContentView().
     * Each auth screen has its own layout binding (ActivityLoginBinding, ActivityRegisterBinding).
     */
    protected abstract fun initializeBinding()

    /**
     * Wire up form-specific click listeners (login button, register button, navigation links).
     */
    protected abstract fun setupListeners()

    /**
     * Return the ProgressBar view from this screen's layout.
     */
    protected abstract fun getProgressBar(): ProgressBar

    /**
     * Return the error TextView from this screen's layout.
     */
    protected abstract fun getErrorTextView(): TextView

    // ── Hook method (optional override) ──

    /**
     * Check for an existing session. By default does nothing.
     * LoginActivity overrides this to skip to the dashboard if already logged in.
     */
    protected open fun checkExistingSession() {
        // Default: do nothing. Login overrides to auto-navigate.
    }

    // ── Concrete shared methods (used by all auth screens) ──

    /**
     * Toggle the loading state — show/hide progress bar and disable/enable the submit button.
     * This was previously duplicated identically in both LoginActivity and RegisterActivity.
     *
     * @param loading Whether the screen is in a loading state
     * @param button The submit button to enable/disable
     * @param loadingText Text to show on the button while loading
     * @param defaultText Text to show on the button when not loading
     */
    protected fun setLoading(loading: Boolean, button: android.widget.Button, loadingText: String, defaultText: String) {
        getProgressBar().visibility = if (loading) View.VISIBLE else View.GONE
        button.isEnabled = !loading
        button.text = if (loading) loadingText else defaultText
    }

    /**
     * Display an error message in the error TextView.
     * This was previously duplicated identically in both LoginActivity and RegisterActivity.
     *
     * @param message The error message to display
     */
    protected fun showError(message: String) {
        getErrorTextView().text = message
        getErrorTextView().visibility = View.VISIBLE
    }

    /**
     * Hide the error TextView.
     */
    protected fun hideError() {
        getErrorTextView().visibility = View.GONE
    }

    /**
     * Save authentication data to SessionManager and navigate to the Dashboard.
     * This consolidates the session save + navigation logic that was previously
     * duplicated in both LoginActivity and RegisterActivity.
     *
     * @param authData The authentication data from a successful login/register
     * @param successMessage Toast message to display
     */
    protected fun saveSessionAndNavigate(authData: AuthData, successMessage: String) {
        val user = authData.user
        sessionManager.saveSession(
            token = authData.accessToken ?: "",
            studentId = user?.studentId,
            email = user?.email,
            firstName = user?.firstName,
            lastName = user?.lastName,
            role = user?.role
        )

        Toast.makeText(this, successMessage, Toast.LENGTH_SHORT).show()
        navigateToDashboard()
    }

    /**
     * Navigate to the DashboardActivity, clearing the back stack.
     * This was previously duplicated identically in LoginActivity and RegisterActivity.
     */
    protected fun navigateToDashboard() {
        val intent = Intent(this, com.taghoy.lostlink.features.dashboard.DashboardActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
