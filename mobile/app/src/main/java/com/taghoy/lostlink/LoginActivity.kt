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
import com.taghoy.lostlink.api.LoginRequest
import com.taghoy.lostlink.api.RetrofitClient
import com.taghoy.lostlink.databinding.ActivityLoginBinding
import com.taghoy.lostlink.utils.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        // If already logged in, skip to dashboard
        if (sessionManager.isLoggedIn()) {
            navigateToDashboard()
            return
        }

        setupListeners()
    }

    private fun setupListeners() {
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
        binding.tvError.visibility = View.GONE
    }

    private fun performLogin() {
        val identifier = binding.etIdentifier.text.toString().trim()
        val password = binding.etPassword.text.toString()

        setLoading(true)

        val request = LoginRequest(identifier, password)

        RetrofitClient.apiService.login(request).enqueue(object : Callback<ApiResponse<AuthData>> {
            override fun onResponse(
                call: Call<ApiResponse<AuthData>>,
                response: Response<ApiResponse<AuthData>>
            ) {
                setLoading(false)

                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    val user = data?.user

                    // Save session
                    sessionManager.saveSession(
                        token = data?.accessToken ?: "",
                        studentId = user?.studentId,
                        email = user?.email,
                        firstName = user?.firstName,
                        lastName = user?.lastName,
                        role = user?.role
                    )

                    Toast.makeText(this@LoginActivity, "Login successful!", Toast.LENGTH_SHORT).show()
                    navigateToDashboard()

                } else {
                    // Parse error from response body
                    val errorBody = response.errorBody()?.string()
                    val errorMsg = try {
                        val errorResponse = Gson().fromJson(errorBody, ApiResponse::class.java)
                        errorResponse.error?.message ?: "Login failed"
                    } catch (e: Exception) {
                        "Invalid credentials. Please try again."
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
        binding.btnLogin.isEnabled = !loading
        binding.btnLogin.text = if (loading) getString(R.string.loading) else getString(R.string.btn_login)
    }

    private fun navigateToDashboard() {
        val intent = Intent(this, DashboardActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
