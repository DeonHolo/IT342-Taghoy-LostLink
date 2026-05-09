package com.taghoy.lostlink.features.auth

import android.util.Patterns
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import com.taghoy.lostlink.R
import com.taghoy.lostlink.core.network.RegisterRequest
import com.taghoy.lostlink.databinding.ActivityRegisterBinding
import com.taghoy.lostlink.features.auth.data.AuthResult

/**
 * Registration screen Activity.
 *
 * **Design Patterns Applied:**
 *
 * 1. **Template Method (Behavioral)** — Extends [BaseAuthActivity] which defines
 *    the algorithm skeleton for auth screens. This class overrides only the
 *    variable steps: [initializeBinding], [setupListeners], [getProgressBar],
 *    and [getErrorTextView]. Shared operations like setLoading(), showError(),
 *    saveSessionAndNavigate(), and navigateToDashboard() are inherited from
 *    the base class.
 *
 * 2. **Adapter (Structural)** — Uses [AuthRepository] (from [BaseAuthActivity])
 *    which adapts Retrofit's complex Callback<ApiResponse<AuthData>> interface
 *    into a simple sealed class: AuthResult.Success or AuthResult.Error.
 *
 * Before refactoring:
 *   - Extended AppCompatActivity directly
 *   - Duplicated setLoading(), showError() (identical to LoginActivity)
 *   - Contained ~40 lines of Retrofit callback boilerplate with manual error parsing
 *   - Duplicated navigateToDashboard() and session save logic
 *
 * After refactoring:
 *   - Extends BaseAuthActivity (inherits all shared auth methods)
 *   - Uses authRepository.register() with a clean sealed-class callback
 *   - Total lines reduced from 207 to ~120
 */
class RegisterActivity : BaseAuthActivity() {

    private lateinit var binding: ActivityRegisterBinding

    // Regex matching the backend validation: XX-XXXX-XXX
    private val studentIdPattern = Regex("^\\d{2}-\\d{4}-\\d{3}$")

    // ── Template Method: provide the specific ViewBinding ──

    override fun initializeBinding() {
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }

    // ── Template Method: return layout-specific views ──

    override fun getProgressBar(): ProgressBar = binding.progressBar
    override fun getErrorTextView(): TextView = binding.tvError

    // ── Template Method: wire up form-specific listeners ──

    override fun setupListeners() {
        binding.btnRegister.setOnClickListener {
            clearErrors()
            if (validateInputs()) {
                performRegistration()
            }
        }

        binding.tvLoginLink.setOnClickListener {
            finish() // Go back to login
        }
    }

    // ── Registration-specific logic ──

    private fun validateInputs(): Boolean {
        val studentId = binding.etStudentId.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val firstName = binding.etFirstName.text.toString().trim()
        val lastName = binding.etLastName.text.toString().trim()
        val password = binding.etPassword.text.toString()
        val confirmPassword = binding.etConfirmPassword.text.toString()

        var isValid = true

        // Student ID validation
        if (studentId.isEmpty()) {
            binding.tilStudentId.error = getString(R.string.error_field_required)
            isValid = false
        } else if (!studentIdPattern.matches(studentId)) {
            binding.tilStudentId.error = getString(R.string.error_invalid_student_id)
            isValid = false
        }

        // Email validation
        if (email.isEmpty()) {
            binding.tilEmail.error = getString(R.string.error_field_required)
            isValid = false
        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = getString(R.string.error_invalid_email)
            isValid = false
        }

        // First name
        if (firstName.isEmpty()) {
            binding.tilFirstName.error = getString(R.string.error_field_required)
            isValid = false
        }

        // Last name
        if (lastName.isEmpty()) {
            binding.tilLastName.error = getString(R.string.error_field_required)
            isValid = false
        }

        // Password validation
        if (password.isEmpty()) {
            binding.tilPassword.error = getString(R.string.error_field_required)
            isValid = false
        } else if (password.length < 8) {
            binding.tilPassword.error = getString(R.string.error_password_short)
            isValid = false
        }

        // Confirm password
        if (confirmPassword.isEmpty()) {
            binding.tilConfirmPassword.error = getString(R.string.error_field_required)
            isValid = false
        } else if (password != confirmPassword) {
            binding.tilConfirmPassword.error = getString(R.string.error_password_mismatch)
            isValid = false
        }

        return isValid
    }

    private fun clearErrors() {
        binding.tilStudentId.error = null
        binding.tilEmail.error = null
        binding.tilFirstName.error = null
        binding.tilLastName.error = null
        binding.tilPassword.error = null
        binding.tilConfirmPassword.error = null
        hideError()
    }

    /**
     * Perform registration using the Adapter (AuthRepository).
     *
     * The authRepository.register() call adapts the raw Retrofit callback
     * into a clean AuthResult sealed class — replacing ~40 lines of
     * callback boilerplate with ~8 lines.
     */
    private fun performRegistration() {
        val studentId = binding.etStudentId.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val firstName = binding.etFirstName.text.toString().trim()
        val lastName = binding.etLastName.text.toString().trim()
        val password = binding.etPassword.text.toString()

        // Template Method: shared loading state management
        setLoading(true, binding.btnRegister, getString(R.string.loading), getString(R.string.btn_register))

        val request = RegisterRequest(studentId, email, firstName, lastName, password)

        // Adapter pattern: simplified callback via AuthRepository
        authRepository.register(request) { result ->
            runOnUiThread {
                setLoading(false, binding.btnRegister, getString(R.string.loading), getString(R.string.btn_register))
                when (result) {
                    is AuthResult.Success -> {
                        // Template Method: shared session save + navigation
                        saveSessionAndNavigate(result.authData, "Account created successfully!")
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
