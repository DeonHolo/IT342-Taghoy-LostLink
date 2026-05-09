package com.taghoy.lostlink.features.auth

import android.content.Intent
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import com.taghoy.lostlink.R
import com.taghoy.lostlink.core.network.LoginRequest
import com.taghoy.lostlink.databinding.ActivityLoginBinding
import com.taghoy.lostlink.features.auth.data.AuthResult

/**
 * Login screen Activity.
 *
 * **Design Patterns Applied:**
 *
 * 1. **Template Method (Behavioral)** — Extends [BaseAuthActivity] which defines
 *    the algorithm skeleton for auth screens. This class overrides only the
 *    variable steps: [initializeBinding], [setupListeners], [getProgressBar],
 *    [getErrorTextView], and [checkExistingSession]. Shared operations like
 *    setLoading(), showError(), and navigateToDashboard() are inherited.
 *
 * 2. **Adapter (Structural)** — Uses [AuthRepository] (from [BaseAuthActivity])
 *    which adapts Retrofit's complex Callback<ApiResponse<AuthData>> interface
 *    into a simple sealed class result: AuthResult.Success or AuthResult.Error.
 *
 * Before refactoring:
 *   - Extended AppCompatActivity directly
 *   - Duplicated setLoading(), showError(), navigateToDashboard() (identical to RegisterActivity)
 *   - Contained ~40 lines of Retrofit callback boilerplate with manual error parsing
 *
 * After refactoring:
 *   - Extends BaseAuthActivity (inherits all shared auth methods)
 *   - Uses authRepository.login() with a clean sealed-class callback
 *   - Total lines reduced from 149 to ~80
 */
class LoginActivity : BaseAuthActivity() {

    private lateinit var binding: ActivityLoginBinding

    // ── Template Method: provide the specific ViewBinding ──

    override fun initializeBinding() {
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }

    // ── Template Method: return layout-specific views ──

    override fun getProgressBar(): ProgressBar = binding.progressBar
    override fun getErrorTextView(): TextView = binding.tvError

    // ── Template Method: hook — skip to dashboard if already logged in ──

    override fun checkExistingSession() {
        if (sessionManager.isLoggedIn()) {
            navigateToDashboard()
        }
    }

    // ── Template Method: wire up form-specific listeners ──

    override fun setupListeners() {
        binding.btnLogin.setOnClickListener {
            clearErrors()
            if (validateInputs()) {
                performLogin()
            }
        }

        binding.tvRegisterLink.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    // ── Login-specific logic ──

    private fun validateInputs(): Boolean {
        val identifier = binding.etIdentifier.text.toString().trim()
        val password = binding.etPassword.text.toString()

        var isValid = true

        if (identifier.isEmpty()) {
            binding.tilIdentifier.error = getString(R.string.error_field_required)
            isValid = false
        }

        if (password.isEmpty()) {
            binding.tilPassword.error = getString(R.string.error_field_required)
            isValid = false
        }

        return isValid
    }

    private fun clearErrors() {
        binding.tilIdentifier.error = null
        binding.tilPassword.error = null
        hideError()
    }

    /**
     * Perform login using the Adapter (AuthRepository).
     *
     * The authRepository.login() call adapts the raw Retrofit callback
     * into a clean AuthResult sealed class — replacing ~40 lines of
     * callback boilerplate with ~8 lines.
     */
    private fun performLogin() {
        val identifier = binding.etIdentifier.text.toString().trim()
        val password = binding.etPassword.text.toString()

        // Template Method: shared loading state management
        setLoading(true, binding.btnLogin, getString(R.string.loading), getString(R.string.btn_login))

        val request = LoginRequest(identifier, password)

        // Adapter pattern: simplified callback via AuthRepository
        authRepository.login(request) { result ->
            runOnUiThread {
                setLoading(false, binding.btnLogin, getString(R.string.loading), getString(R.string.btn_login))
                when (result) {
                    is AuthResult.Success -> {
                        // Template Method: shared session save + navigation
                        saveSessionAndNavigate(result.authData, "Login successful!")
                    }
                    is AuthResult.Error -> {
                        // Template Method: shared error display
                        showError(result.message)
                    }
                }
            }
        }
    }
}
