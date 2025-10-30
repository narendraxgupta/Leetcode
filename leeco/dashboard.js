// Dashboard Functionality
console.log('🚀 Dashboard.js is loading...');

let progressChart, difficultyChart, companyChart;

// API Base URL - dynamically set based on environment
const API_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : '/api';

// Export functions IMMEDIATELY (before DOMContentLoaded) so they're available when script.js runs
console.log('📦 Initializing window.dashboardFunctions...');
window.dashboardFunctions = {
  openDashboard: null,  // Will be set after functions are defined
  markProblemAsSolved: null,
  unmarkProblemAsSolved: null,
  checkProblemSolved: null,
  toggleBookmark: null,
  openNotesModal: null,
  saveNotesFromModal: null,
  addSnippetFromModal: null,
  deleteSnippetFromModal: null,
  toggleRevisionQueue: null
};
console.log('✅ window.dashboardFunctions object created');

// Initialize Dashboard
async function initDashboard() {
  const dashboardBtn = document.getElementById('dashboard-btn');
  
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', openDashboard);
  }
}

// Open Dashboard Modal
async function openDashboard() {
  console.log('Opening dashboard...');
  
  const modal = document.getElementById('dashboard-modal');
  const loading = document.getElementById('dashboard-loading');
  const content = document.getElementById('dashboard-content');
  
  if (!modal || !loading || !content) {
    console.error('Dashboard elements not found', { modal, loading, content });
    return;
  }
  
  modal.classList.remove('hidden');
  loading.classList.remove('hidden');
  content.classList.add('hidden');
  
  try {
    // Check for token (try both 'authToken' and 'token' for compatibility)
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'missing');
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'none');
    
    if (!token) {
      throw new Error('Not authenticated. Please login first.');
    }
    
    console.log('Fetching analytics from:', `${API_URL}/progress/analytics`);
    
    // Fetch analytics data from backend
    const response = await fetch(`${API_URL}/progress/analytics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Analytics data received:', data);
    
    if (data.success) {
      renderDashboard(data.analytics);
      loading.classList.add('hidden');
      content.classList.remove('hidden');
      
      // Re-initialize feather icons
      if (typeof feather !== 'undefined') {
        feather.replace();
      }
    } else {
      throw new Error(data.message || 'Failed to load analytics');
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    loading.classList.add('hidden');
    
    // Show error message in modal
    content.innerHTML = `
      <div class="text-center py-12">
        <i data-feather="alert-circle" class="mx-auto w-16 h-16 text-red-500 mb-4"></i>
        <h3 class="text-xl font-bold text-white mb-2">Failed to Load Dashboard</h3>
        <p class="text-gray-400 mb-4">${error.message}</p>
        <p class="text-gray-500 text-sm mb-4">Check the browser console for more details</p>
        <button onclick="openDashboard()" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition">
          Try Again
        </button>
        <button onclick="document.getElementById('dashboard-modal').classList.add('hidden')" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition ml-2">
          Close
        </button>
      </div>
    `;
    content.classList.remove('hidden');
    
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
    
    // Also show notification
    if (typeof showNotification !== 'undefined') {
      showNotification('Failed to load dashboard data. Please try again.', 'error');
    }
  }
}

// Render Dashboard with Data
function renderDashboard(analytics) {
  // Update stat cards
  document.getElementById('stat-total').textContent = analytics.totalSolved || 0;
  document.getElementById('stat-streak').textContent = analytics.currentStreak || 0;
  document.getElementById('stat-bookmarked').textContent = analytics.bookmarkedCount || 0;
  document.getElementById('stat-longest').textContent = analytics.longestStreak || 0;
  
  // Render charts
  renderProgressChart(analytics.progressTimeline);
  renderDifficultyChart(analytics.difficultyStats);
  renderCompanyChart(analytics.topCompanies);
  
  // Render recently solved
  renderRecentlySolved(analytics.recentlySolved);
}

// Progress Over Time Chart (Line)
function renderProgressChart(timeline) {
  const ctx = document.getElementById('progress-chart');
  
  // Destroy existing chart
  if (progressChart) {
    progressChart.destroy();
  }
  
  progressChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeline.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Total Problems Solved',
        data: timeline.map(d => d.cumulative),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#fff'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Total: ${context.parsed.y} problems`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#9ca3af',
            stepSize: 1
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#9ca3af',
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

// Difficulty Distribution Chart (Pie)
function renderDifficultyChart(difficultyStats) {
  const ctx = document.getElementById('difficulty-chart');
  
  // Destroy existing chart
  if (difficultyChart) {
    difficultyChart.destroy();
  }
  
  const data = {
    Easy: difficultyStats.Easy || 0,
    Medium: difficultyStats.Medium || 0,
    Hard: difficultyStats.Hard || 0
  };
  
  difficultyChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Easy', 'Medium', 'Hard'],
      datasets: [{
        data: [data.Easy, data.Medium, data.Hard],
        backgroundColor: [
          'rgb(34, 197, 94)',   // Green for Easy
          'rgb(234, 179, 8)',   // Yellow for Medium
          'rgb(239, 68, 68)'    // Red for Hard
        ],
        borderColor: '#1f2937',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Company Chart (Horizontal Bar)
function renderCompanyChart(topCompanies) {
  const ctx = document.getElementById('company-chart');
  
  // Destroy existing chart
  if (companyChart) {
    companyChart.destroy();
  }
  
  if (!topCompanies || topCompanies.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-gray-400 text-center py-8">No company data available yet. Start solving problems!</p>';
    return;
  }
  
  companyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topCompanies.map(c => c.company.charAt(0).toUpperCase() + c.company.slice(1)),
      datasets: [{
        label: 'Problems Solved',
        data: topCompanies.map(c => c.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.x} problems`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: '#9ca3af',
            stepSize: 1
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        y: {
          ticks: {
            color: '#9ca3af'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Render Recently Solved Problems
function renderRecentlySolved(problems) {
  const container = document.getElementById('recently-solved-list');
  
  if (!problems || problems.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center py-4">No problems solved yet. Start your journey!</p>';
    return;
  }
  
  container.innerHTML = problems.map(problem => {
    const difficultyColor = {
      'Easy': 'text-green-400',
      'Medium': 'text-yellow-400',
      'Hard': 'text-red-400'
    }[problem.difficulty] || 'text-gray-400';
    
    const date = new Date(problem.solvedAt);
    const timeAgo = getTimeAgo(date);
    
    return `
      <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
        <div class="flex-1">
          <h4 class="font-semibold text-white">${problem.title}</h4>
          <div class="flex items-center space-x-3 mt-1 text-sm">
            <span class="${difficultyColor}">${problem.difficulty}</span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-400">${problem.company}</span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-500">${timeAgo}</span>
          </div>
        </div>
        <i data-feather="check-circle" class="w-5 h-5 text-green-400"></i>
      </div>
    `;
  }).join('');
  
  feather.replace();
}

// Helper function to get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return 'Just now';
}

// Mark Problem as Solved
async function markProblemAsSolved(problemData) {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      if (typeof showNotification !== 'undefined') {
        showNotification('Please login to track progress', 'error');
      }
      return false;
    }
    
    const response = await fetch(`${API_URL}/progress/mark-solved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(problemData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (typeof showNotification !== 'undefined') {
        showNotification(data.message, 'success');
      }
      return true;
    } else {
      if (typeof showNotification !== 'undefined') {
        showNotification(data.message || 'Failed to mark problem', 'error');
      }
      return false;
    }
  } catch (error) {
    console.error('Mark solved error:', error);
    if (typeof showNotification !== 'undefined') {
      showNotification('Failed to save progress', 'error');
    }
    return false;
  }
}

// Unmark Problem as Solved
async function unmarkProblemAsSolved(problemId) {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    const response = await fetch(`${API_URL}/progress/unmark-solved/${problemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (typeof showNotification !== 'undefined') {
        showNotification(data.message, 'success');
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Unmark solved error:', error);
    return false;
  }
}

// Check if problem is solved
async function checkProblemSolved(problemId) {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    const response = await fetch(`${API_URL}/progress/check-solved/${problemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.isSolved;
  } catch (error) {
    console.error('Check solved error:', error);
    return false;
  }
}

// Toggle bookmark for a problem
async function toggleBookmark(problemId, meta = {}) {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return { success: false, message: 'Not authenticated' };

    const response = await fetch(`${API_URL}/progress/toggle-bookmark/${encodeURIComponent(problemId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(meta || {})
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return { success: false, message: 'Server error' };
  }
}

// Open notes modal for a problem
async function openNotesModal(problemId, metadata = {}) {
  console.log('=== openNotesModal called ===');
  console.log('Problem ID:', problemId);
  console.log('Metadata:', metadata);
  
  try {
    console.log('Looking for modal elements...');
    const modal = document.getElementById('notes-modal');
    console.log('Modal element:', modal);
    
    const notesArea = document.getElementById('problem-notes');
    console.log('Notes textarea:', notesArea);
    
    const snippetsList = document.getElementById('snippets-list');
    console.log('Snippets list:', snippetsList);
    
    const toggleBtn = document.getElementById('toggle-revision-btn');
    console.log('Toggle button:', toggleBtn);
    
    const saveBtn = document.getElementById('save-notes-btn');
    console.log('Save button:', saveBtn);
    
    const addSnippetBtn = document.getElementById('add-snippet-btn');
    console.log('Add snippet button:', addSnippetBtn);

    if (!modal) {
      console.error('❌ Modal element #notes-modal not found!');
      showNotification && showNotification('Modal not found in page', 'error');
      return;
    }
    
    if (!notesArea) {
      console.error('❌ Notes textarea #problem-notes not found!');
      showNotification && showNotification('Notes textarea not found', 'error');
      return;
    }
    
    console.log('✅ All required elements found');

    // Store metadata for later use
    modal.dataset.problemId = problemId;
    modal.dataset.problemMeta = JSON.stringify(metadata);

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      showNotification && showNotification('Please login to edit notes', 'error');
      return;
    }

    console.log('Fetching problem data...');
    console.log('API_URL:', API_URL);
    console.log('Full URL:', `${API_URL}/progress/check-solved/${encodeURIComponent(problemId)}`);
    
    // Fetch problem details (if exists)
    const resp = await fetch(`${API_URL}/progress/check-solved/${encodeURIComponent(problemId)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Response status:', resp.status);
    console.log('Response ok:', resp.ok);
    
    if (!resp.ok) {
      console.error('Fetch failed with status:', resp.status);
      const errorText = await resp.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    
    const info = await resp.json();
    console.log('Problem info fetched:', info);
    console.log('Full info object:', JSON.stringify(info, null, 2));
    console.log('info.problem:', info.problem);
    console.log('Type of info.problem:', typeof info.problem);
    console.log('info.success:', info.success);
    console.log('info.isSolved:', info.isSolved);

    // Reset UI AFTER we have the data
    notesArea.value = '';
    snippetsList.innerHTML = '';

    if (info && info.problem) {
      const problem = info.problem;
      console.log('Loading notes:', problem.notes);
      console.log('Notes length:', problem.notes ? problem.notes.length : 0);
      notesArea.value = problem.notes || '';
      toggleBtn.textContent = problem.inRevisionQueue ? 'Remove from Revision Queue' : 'Add to Revision Queue';
      toggleBtn.dataset.inRevision = problem.inRevisionQueue ? '1' : '0';

      // Render snippets
      if (Array.isArray(problem.codeSnippets)) {
        snippetsList.innerHTML = problem.codeSnippets.map(sn => {
          return `<div class="p-3 bg-gray-800 rounded-lg" data-snippet-id="${sn._id}">
                    <div class="flex justify-between items-center">
                      <div class="font-semibold text-white">${escapeHtml(sn.title || 'Solution')} <span class="text-sm text-gray-400">(${escapeHtml(sn.language || '')})</span></div>
                      <div>
                        <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs" data-action="delete-snippet" data-snippet-id="${sn._id}">Delete</button>
                      </div>
                    </div>
                    <pre class="whitespace-pre-wrap text-sm text-gray-200 mt-2">${escapeHtml(sn.code || '')}</pre>
                  </div>`;
        }).join('');
      }
    } else {
      console.log('No problem data found, showing empty form');
      toggleBtn.textContent = 'Add to Revision Queue';
      toggleBtn.dataset.inRevision = '0';
    }

    // Show modal
    console.log('Showing modal');
    modal.classList.remove('hidden');

    // Wire up actions
    saveBtn.onclick = async () => {
      await saveNotesFromModal(problemId);
    };

    addSnippetBtn.onclick = async () => {
      await addSnippetFromModal(problemId);
    };

    // Delegate delete snippet clicks
    snippetsList.onclick = async (e) => {
      const btn = e.target.closest('button[data-action="delete-snippet"]');
      if (btn) {
        const snippetId = btn.dataset.snippetId;
        await deleteSnippetFromModal(problemId, snippetId);
        // refresh modal with metadata
        openNotesModal(problemId, metadata);
      }
    };

    toggleBtn.onclick = async () => {
      const inRev = toggleBtn.dataset.inRevision === '1';
      await toggleRevisionQueue(problemId, { inRevisionQueue: !inRev });
      toggleBtn.textContent = inRev ? 'Add to Revision Queue' : 'Remove from Revision Queue';
      toggleBtn.dataset.inRevision = inRev ? '0' : '1';
    };

  } catch (error) {
    console.error('Open notes modal error:', error);
    showNotification && showNotification('Failed to open notes', 'error');
  }
}

async function saveNotesFromModal(problemId) {
  try {
    const notes = document.getElementById('problem-notes').value;
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return showNotification && showNotification('Not authenticated', 'error');

    // Get metadata from modal
    const modal = document.getElementById('notes-modal');
    let metadata = {};
    try {
      metadata = JSON.parse(modal.dataset.problemMeta || '{}');
    } catch (e) {
      console.error('Failed to parse metadata:', e);
    }

    console.log('Saving notes:', { problemId, notes, metadata });

    const resp = await fetch(`${API_URL}/progress/notes/${encodeURIComponent(problemId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        notes,
        title: metadata.title,
        difficulty: metadata.difficulty,
        company: metadata.company,
        duration: metadata.duration
      })
    });
    const data = await resp.json();
    console.log('Save notes response:', data);
    if (data.success) {
      showNotification && showNotification('Notes saved', 'success');
      document.getElementById('notes-modal').classList.add('hidden');
    } else {
      showNotification && showNotification(data.message || 'Failed to save notes', 'error');
    }
  } catch (error) {
    console.error('Save notes error:', error);
    showNotification && showNotification('Failed to save notes', 'error');
  }
}

async function addSnippetFromModal(problemId) {
  try {
    const title = document.getElementById('snippet-title').value || 'Solution';
    const language = document.getElementById('snippet-lang').value || 'javascript';
    const code = document.getElementById('snippet-code').value || '';
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return showNotification && showNotification('Not authenticated', 'error');

    // Get metadata from modal
    const modal = document.getElementById('notes-modal');
    let metadata = {};
    try {
      metadata = JSON.parse(modal.dataset.problemMeta || '{}');
    } catch (e) {
      console.error('Failed to parse metadata:', e);
    }

    const resp = await fetch(`${API_URL}/progress/snippet/${encodeURIComponent(problemId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        title, 
        language, 
        code,
        problemTitle: metadata.title,
        difficulty: metadata.difficulty,
        company: metadata.company,
        duration: metadata.duration
      })
    });
    const data = await resp.json();
    if (data.success) {
      showNotification && showNotification('Snippet added', 'success');
      // refresh modal with metadata
      openNotesModal(problemId, metadata);
    } else {
      showNotification && showNotification(data.message || 'Failed to add snippet', 'error');
    }
  } catch (error) {
    console.error('Add snippet error:', error);
    showNotification && showNotification('Failed to add snippet', 'error');
  }
}

async function deleteSnippetFromModal(problemId, snippetId) {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return showNotification && showNotification('Not authenticated', 'error');

    const resp = await fetch(`${API_URL}/progress/snippet/${encodeURIComponent(problemId)}/${encodeURIComponent(snippetId)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    if (data.success) {
      showNotification && showNotification('Snippet deleted', 'success');
      return true;
    } else {
      showNotification && showNotification(data.message || 'Failed to delete snippet', 'error');
      return false;
    }
  } catch (error) {
    console.error('Delete snippet error:', error);
    showNotification && showNotification('Failed to delete snippet', 'error');
    return false;
  }
}

async function toggleRevisionQueue(problemId, body = {}) {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return { success: false };

    const resp = await fetch(`${API_URL}/progress/revision/${encodeURIComponent(problemId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    return await resp.json();
  } catch (error) {
    console.error('Toggle revision error:', error);
    return { success: false };
  }
}

// Small helper to escape HTML when rendering snippets
function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialize dashboard when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  initDashboard();
  
  // Show dashboard button when user logs in
  const userInfo = document.getElementById('user-info');
  if (userInfo && !userInfo.classList.contains('hidden')) {
    const dashboardBtn = document.getElementById('dashboard-btn');
    if (dashboardBtn) {
      dashboardBtn.classList.remove('hidden');
    }
  }
});

// Update function references NOW (not in DOMContentLoaded)
window.dashboardFunctions.openDashboard = openDashboard;
window.dashboardFunctions.markProblemAsSolved = markProblemAsSolved;
window.dashboardFunctions.unmarkProblemAsSolved = unmarkProblemAsSolved;
window.dashboardFunctions.checkProblemSolved = checkProblemSolved;
window.dashboardFunctions.toggleBookmark = toggleBookmark;
window.dashboardFunctions.openNotesModal = openNotesModal;
window.dashboardFunctions.saveNotesFromModal = saveNotesFromModal;
window.dashboardFunctions.addSnippetFromModal = addSnippetFromModal;
window.dashboardFunctions.deleteSnippetFromModal = deleteSnippetFromModal;
window.dashboardFunctions.toggleRevisionQueue = toggleRevisionQueue;

// Also make openDashboard globally accessible for onclick handlers
window.openDashboard = openDashboard;

console.log('✅ Dashboard functions exported and ready:', Object.keys(window.dashboardFunctions));
