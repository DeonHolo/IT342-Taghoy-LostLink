package com.taghoy.lostlink.features.dashboard

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.taghoy.lostlink.databinding.ActivityDashboardBinding
import com.taghoy.lostlink.core.session.SessionManager

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        // Guard: if not logged in, redirect to login
        if (!sessionManager.isLoggedIn()) {
            navigateToLogin()
            return
        }

        displayUserInfo()
        setupListeners()
    }

    private fun displayUserInfo() {
        binding.tvUserName.text = sessionManager.getFullName()
        binding.tvStudentId.text = sessionManager.getStudentId().ifEmpty { "N/A" }
        binding.tvEmail.text = sessionManager.getEmail().ifEmpty { "N/A" }
        binding.tvRole.text = sessionManager.getRole()
    }

    private fun setupListeners() {
        binding.btnLogout.setOnClickListener {
            sessionManager.clearSession()
            Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show()
            navigateToLogin()
        }
    }

    private fun navigateToLogin() {
        val intent = Intent(this, com.taghoy.lostlink.features.auth.LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
