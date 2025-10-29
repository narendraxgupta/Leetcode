// Authentication API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Authentication state
let currentUser = null;
let authToken = null;

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeAuth();
  setupAuthListeners();
});

// Initialize authentication state
function initializeAuth() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');
  
  if (token && user) {
    authToken = token;
    currentUser = JSON.parse(user);
    showUserInfo();
    loadUserProgress();
  } else {
    showAuthButtons();
  }
}

// Setup event listeners for auth buttons
function setupAuthListeners() {
  // Login button
  document.getElementById('login-btn')?.addEventListener('click', () => {
    openModal('login-modal');
  });
  
  // Register button
  document.getElementById('register-btn')?.addEventListener('click', () => {
    openModal('register-modal');
  });
  
  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  
  // Edit Profile button
  document.getElementById('edit-profile-btn')?.addEventListener('click', openEditProfile);
  
  // Change Password button
  document.getElementById('change-password-btn')?.addEventListener('click', () => {
    openModal('change-password-modal');
  });
  
  // Login form
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  
  // Register form
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);
  
  // Edit Profile form
  document.getElementById('edit-profile-form')?.addEventListener('submit', handleEditProfile);
  
  // Change Password form
  document.getElementById('change-password-form')?.addEventListener('submit', handleChangePassword);
}

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'block';
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  // Clear form errors
  const errorIds = ['login-error', 'register-error', 'edit-profile-error', 'change-password-error'];
  errorIds.forEach(id => {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
  });
}

// Make functions globally accessible
window.openModal = openModal;
window.closeModal = closeModal;

// Switch between login and register modals
function switchToRegister() {
  closeModal('login-modal');
  openModal('register-modal');
}

function switchToLogin() {
  closeModal('register-modal');
  openModal('login-modal');
}

// Make switch functions globally accessible
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store auth data
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update UI
      showUserInfo();
      closeModal('login-modal');
      
      // Load user progress
      await loadUserProgress();
      
      // Show success message
      showNotification('Login successful!', 'success');
      
      // Clear form
      document.getElementById('login-form').reset();
    } else {
      errorDiv.textContent = data.message;
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = 'Server error. Please try again.';
    errorDiv.classList.remove('hidden');
  }
}

// Handle register form submission
async function handleRegister(e) {
  e.preventDefault();
  
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const errorDiv = document.getElementById('register-error');
  
  // Validate passwords match
  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store auth data
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update UI
      showUserInfo();
      closeModal('register-modal');
      
      // Show success message
      showNotification('Registration successful! Welcome!', 'success');
      
      // Clear form
      document.getElementById('register-form').reset();
    } else {
      errorDiv.textContent = data.message;
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Register error:', error);
    errorDiv.textContent = 'Server error. Please try again.';
    errorDiv.classList.remove('hidden');
  }
}

// Logout user
function logout() {
  // Clear auth data
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  
  // Update UI
  showAuthButtons();
  
  // Clear progress data
  clearTableProgressOnly();
  
  // Show message
  showNotification('Logged out successfully', 'info');
}

// Show user info in navbar
function showUserInfo() {
  document.getElementById('auth-buttons').style.display = 'none';
  const userInfo = document.getElementById('user-info');
  userInfo.classList.remove('hidden');
  userInfo.classList.add('flex');
  
  // Hide username display, only show avatar
  const usernameDisplay = document.getElementById('username-display');
  if (usernameDisplay) {
    usernameDisplay.style.display = 'none';
  }
  
  // Set avatar title to show username on hover
  const avatar = document.getElementById('user-avatar');
  if (avatar && currentUser) {
    avatar.setAttribute('title', currentUser.username);
  }
}

// Show auth buttons in navbar
function showAuthButtons() {
  document.getElementById('auth-buttons').style.display = 'flex';
  const userInfo = document.getElementById('user-info');
  userInfo.classList.add('hidden');
  userInfo.classList.remove('flex');
}

// Load user progress from server
async function loadUserProgress() {
  if (!authToken) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store progress in memory for quick access
      window.userProgress = data.progress;
      
      // Update current table if one is displayed
      updateTableWithProgress();
    }
  } catch (error) {
    console.error('Load progress error:', error);
  }
}

// Save progress to server
async function saveProgress(problemData) {
  if (!authToken) {
    showNotification('Please login to save progress', 'warning');
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(problemData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update local progress
      if (!window.userProgress) {
        window.userProgress = [];
      }
      const existingIndex = window.userProgress.findIndex(p => p.problemId === problemData.problemId);
      if (existingIndex >= 0) {
        window.userProgress[existingIndex] = data.progress;
      } else {
        window.userProgress.push(data.progress);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Save progress error:', error);
    return false;
  }
}

// Delete progress from server
async function deleteProgress(problemId) {
  if (!authToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/progress/${problemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update local progress
      if (window.userProgress) {
        window.userProgress = window.userProgress.filter(p => p.problemId !== problemId);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Delete progress error:', error);
    return false;
  }
}

// Update table with user progress
function updateTableWithProgress() {
  if (!window.userProgress || window.userProgress.length === 0) return;
  
  window.userProgress.forEach(progress => {
    const checkbox = document.getElementById(`attempt-${progress.problemId}`);
    const dateInput = document.getElementById(`date-${progress.problemId}`);
    
    if (checkbox) {
      checkbox.checked = progress.attempted;
    }
    if (dateInput && progress.dateSolved) {
      dateInput.value = formatDate(new Date(progress.dateSolved));
    }
  });
  
  // Update progress bar
  if (typeof updateProgress === 'function') {
    updateProgress();
  }
}

// Clear only progress-related data from table (not the table itself)
function clearTableProgressOnly() {
  // Just clear the in-memory progress
  window.userProgress = [];
  
  // Uncheck all checkboxes and clear dates if table is displayed
  const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="attempt-"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  
  const dateInputs = document.querySelectorAll('input[type="text"][id^="date-"]');
  dateInputs.forEach(input => {
    input.value = '';
  });
  
  // Update progress bar
  if (typeof updateProgress === 'function') {
    updateProgress();
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease-in-out;
    font-weight: 500;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Check if user is authenticated
function isAuthenticated() {
  return authToken !== null && currentUser !== null;
}

// Get current company and duration selection
function getCurrentSelection() {
  const company = document.getElementById('company-select')?.value || '';
  const duration = document.getElementById('duration-select')?.value || '';
  return { company, duration };
}

// Open Edit Profile modal and populate fields
function openEditProfile() {
  if (!currentUser) return;
  
  document.getElementById('edit-username').value = currentUser.username;
  document.getElementById('edit-email').value = currentUser.email;
  openModal('edit-profile-modal');
}

// Handle Edit Profile form submission
async function handleEditProfile(e) {
  e.preventDefault();
  
  const username = document.getElementById('edit-username').value;
  const email = document.getElementById('edit-email').value;
  const errorDiv = document.getElementById('edit-profile-error');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ username, email })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update current user data
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update username display
      document.getElementById('username-display').textContent = `👤 ${currentUser.username}`;
      
      // Close modal
      closeModal('edit-profile-modal');
      
      // Show success message
      showNotification('Profile updated successfully!', 'success');
      
      // Clear form
      document.getElementById('edit-profile-form').reset();
    } else {
      errorDiv.textContent = data.message;
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Edit profile error:', error);
    errorDiv.textContent = 'Server error. Please try again.';
    errorDiv.classList.remove('hidden');
  }
}

// Handle Change Password form submission
async function handleChangePassword(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmNewPassword = document.getElementById('confirm-new-password').value;
  const errorDiv = document.getElementById('change-password-error');
  
  // Validate passwords match
  if (newPassword !== confirmNewPassword) {
    errorDiv.textContent = 'New passwords do not match';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Close modal
      closeModal('change-password-modal');
      
      // Show success message
      showNotification('Password changed successfully!', 'success');
      
      // Clear form
      document.getElementById('change-password-form').reset();
    } else {
      errorDiv.textContent = data.message;
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Change password error:', error);
    errorDiv.textContent = 'Server error. Please try again.';
    errorDiv.classList.remove('hidden');
  }
}

// Forgot Password Functions
function openForgotPasswordModal() {
  closeModal('login-modal');
  openModal('forgot-password-modal');
}

function backToLogin() {
  closeModal('forgot-password-modal');
  openModal('login-modal');
}

// Make forgot password functions globally accessible
window.openForgotPasswordModal = openForgotPasswordModal;
window.backToLogin = backToLogin;

// Handle forgot password form submission
async function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById('forgot-email').value;
  const messageDiv = document.getElementById('forgot-password-message');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Check if reset link was returned (email not configured)
      if (data.resetLink) {
        messageDiv.innerHTML = `<strong>Click the link to reset your password:</strong><br><a href="${data.resetLink}" target="_blank" class="text-blue-400 hover:underline">${data.resetLink}</a>`;
        messageDiv.classList.remove('hidden', 'text-red-500');
        messageDiv.classList.add('text-green-500');
        
        // Show notification
        showNotification('Reset link generated! Click it to reset your password.', 'success');
      } else {
        messageDiv.textContent = data.message || 'Password reset link has been sent to your email.';
        messageDiv.classList.remove('hidden', 'text-red-500');
        messageDiv.classList.add('text-green-500');
        
        // Show success notification
        showNotification('Check your email for the reset link!', 'success');
      }
      
      // Clear form
      document.getElementById('forgot-password-form').reset();
    } else {
      messageDiv.textContent = data.message || 'Failed to send reset link.';
      messageDiv.classList.remove('hidden', 'text-green-500');
      messageDiv.classList.add('text-red-500');
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    messageDiv.textContent = 'Server error. Please try again.';
    messageDiv.classList.remove('hidden', 'text-green-500');
    messageDiv.classList.add('text-red-500');
  }
}

// Setup forgot password form listener
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('forgot-password-form')?.addEventListener('submit', handleForgotPassword);
});
