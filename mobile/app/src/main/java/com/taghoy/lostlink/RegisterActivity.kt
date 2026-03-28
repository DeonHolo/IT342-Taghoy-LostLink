package com.taghoy.lostlink

import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.Gson
import com.taghoy.lostlink.api.ApiResponse
import com.taghoy.lostlink.api.AuthData
import com.taghoy.lostlink.api.RegisterRequest
import com.taghoy.lostlink.api.RetrofitClient
import com.taghoy.lostlink.databinding.ActivityRegisterBinding
import com.taghoy.lostlink.utils.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private lateinit var sessionManager: SessionManager

    // Regex matching the backend validation: XX-XXXX-XXX
    private val studentIdPattern = Regex("^\\d{2}-\\d{4}-\\d{3}$")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        setupListeners()
    }

    private fun setupListeners() {
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
        binding.tvError.visibility = View.GONE
    }

    private fun performRegistration() {
        val studentId = binding.etStudentId.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val firstName = binding.etFirstName.text.toString().trim()
        val lastName = binding.etLastName.text.toString().trim()
        val password = binding.etPassword.text.toString()

        setLoading(true)

        val request = RegisterRequest(studentId, email, firstName, lastName, password)

        RetrofitClient.apiService.register(request).enqueue(object : Callback<ApiResponse<AuthData>> {
            override fun onResponse(
                call: Call<ApiResponse<AuthData>>,
                response: Response<ApiResponse<AuthData>>
            ) {
                setLoading(false)

                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    val user = data?.user

                    // Save session (auto-login after registration per SDD AC-1a)
                    sessionManager.saveSession(
                        token = data?.accessToken ?: "",
                        studentId = user?.studentId,
                        email = user?.email,
                        firstName = user?.firstName,
                        lastName = user?.lastName,
                        role = user?.role
                    )

                    Toast.makeText(
                        this@RegisterActivity,
                        "Account created successfully!",
                        Toast.LENGTH_SHORT
                    ).show()

                    // Navigate to dashboard (auto-login per SDD)
                    val intent = Intent(this@RegisterActivity, DashboardActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()

                } else {
                    // Parse error from response body
                    val errorBody = response.errorBody()?.string()
                    val errorMsg = try {
                        val errorResponse = Gson().fromJson(errorBody, ApiResponse::class.java)
                        when {
                            errorResponse.error?.details is Map<*, *> -> {
                                // Validation errors — show the first one
                                val details = errorResponse.error.details as Map<*, *>
                                details.values.firstOrNull()?.toString() ?: "Validation failed"
                            }
                            errorResponse.error?.details is String -> {
                                errorResponse.error.details.toString()
                            }
                            else -> errorResponse.error?.message ?: "Registration failed"
                        }
                    } catch (e: Exception) {
                        "Registration failed. Please try again."
                    }
                    showError(errorMsg)
                }
            }

            override fun onFailure(call: Call<ApiResponse<AuthData>>, t: Throwable) {
                setLoading(false)
                showError(getString(R.string.error_network) + "\n" + t.localizedMessage)
            }
        })
    }

    private fun showError(message: String) {
        binding.tvError.text = message
        binding.tvError.visibility = View.VISIBLE
    }

    private fun setLoading(loading: Boolean) {
        binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        binding.btnRegister.isEnabled = !loading
        binding.btnRegister.text = if (loading) getString(R.string.loading) else getString(R.string.btn_register)
    }
}
