// POLIS Frontend JavaScript - Enhanced with Authentication and API Integration

// Global variables
let currentUser = null;
let authToken = localStorage.getItem('polis_token');

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Check if user is authenticated on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
});

// Utility functions
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

function setAuthToken(token) {
    authToken = token;
    localStorage.setItem('polis_token', token);
}

function clearAuthToken() {
    authToken = null;
    localStorage.removeItem('polis_token');
}

function isAuthenticated() {
    return authToken !== null;
}

// API functions
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication functions
async function loginUser(username, password) {
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        setAuthToken(response.token);
        currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        showMessage('Login successful!', 'success');
        
        // Redirect based on user role
        if (response.user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function registerUser(userData) {
    try {
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        setAuthToken(response.token);
        currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        showMessage('Registration successful!', 'success');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        
        // Update UI based on authentication status
        const authLinks = document.querySelectorAll('.auth-link');
        const userLinks = document.querySelectorAll('.user-link');
        
        if (authLinks && userLinks) {
            authLinks.forEach(link => link.style.display = 'none');
            userLinks.forEach(link => link.style.display = 'block');
        }
        
        // Set user name if element exists
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && currentUser) {
            userNameElement.textContent = currentUser.username;
        }
        
        return true;
    }
    
    return false;
}

// Case management functions
async function registerCase(caseData) {
    try {
        const response = await apiCall('/cases', {
            method: 'POST',
            body: JSON.stringify(caseData)
        });
        
        showMessage('Case registered successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return response;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

async function getCaseByNumber(caseNumber) {
    try {
        return await apiCall(`/cases/${caseNumber}`);
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

async function getAllCases() {
    try {
        return await apiCall('/cases');
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Case registration form handler
    const caseForm = document.getElementById('caseRegistrationForm');
    if (caseForm) {
        caseForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!isAuthenticated()) {
                showMessage('You must be logged in to register a case', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            const formData = new FormData(caseForm);
            const caseData = {};
            
            for (const [key, value] of formData.entries()) {
                caseData[key] = value;
            }
            
            try {
                await registerCase(caseData);
            } catch (error) {
                console.error('Error registering case:', error);
            }
        });
    }
    
    // Dashboard cases loading
    const casesContainer = document.getElementById('cases-container');
    if (casesContainer) {
        loadDashboardCases();
    }
});

// Dashboard functions
async function loadDashboardCases() {
    const loadingElement = document.getElementById('loading-cases');
    const noCasesElement = document.getElementById('no-cases');
    const casesTable = document.getElementById('cases-table');
    const casesList = document.getElementById('cases-list');
    
    if (!isAuthenticated()) {
        showMessage('You must be logged in to view cases', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    try {
        const cases = await getAllCases();
        
        // Hide loading message
        loadingElement.style.display = 'none';
        
        if (!cases || cases.length === 0) {
            noCasesElement.style.display = 'block';
            return;
        }
        
        // Show cases table and populate it
        casesTable.style.display = 'table';
        
        // Clear existing cases
        casesList.innerHTML = '';
        
        // Add each case to the table
        cases.forEach(caseItem => {
            const row = document.createElement('tr');
            
            // Format date
            const reportedDate = new Date(caseItem.date_reported);
            const formattedDate = reportedDate.toLocaleDateString() + ' ' + reportedDate.toLocaleTimeString();
            
            row.innerHTML = `
                <td>${caseItem.case_number}</td>
                <td>${caseItem.title}</td>
                <td>${caseItem.crime_type}</td>
                <td><span class="status-badge status-${caseItem.status}">${caseItem.status}</span></td>
                <td><span class="priority-badge priority-${caseItem.priority}">${caseItem.priority}</span></td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn btn-view" onclick="viewCaseDetails('${caseItem.case_number}')">View</button>
                </td>
            `;
            
            casesList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading cases:', error);
        loadingElement.textContent = 'Error loading cases. Please try again.';
    }
}

async function viewCaseDetails(caseNumber) {
    const selectCaseMessage = document.getElementById('select-case-message');
    const caseDetailsContainer = document.getElementById('case-details');
    
    try {
        const caseData = await getCaseByNumber(caseNumber);
        
        // Hide select message and show details
        selectCaseMessage.style.display = 'none';
        caseDetailsContainer.style.display = 'block';
        
        // Format dates
        const reportedDate = new Date(caseData.date_reported);
        const formattedReportedDate = reportedDate.toLocaleDateString() + ' ' + reportedDate.toLocaleTimeString();
        
        let formattedOccurredDate = 'Not specified';
        if (caseData.date_occurred) {
            const occurredDate = new Date(caseData.date_occurred);
            formattedOccurredDate = occurredDate.toLocaleDateString() + ' ' + occurredDate.toLocaleTimeString();
        }
        
        // Populate case details
        caseDetailsContainer.innerHTML = `
            <div class="case-detail-grid">
                <div class="detail-item">
                    <h4>Case Number</h4>
                    <p>${caseData.case_number}</p>
                </div>
                <div class="detail-item">
                    <h4>Title</h4>
                    <p>${caseData.title}</p>
                </div>
                <div class="detail-item">
                    <h4>Status</h4>
                    <p><span class="status-badge status-${caseData.status}">${caseData.status}</span></p>
                </div>
                <div class="detail-item">
                    <h4>Priority</h4>
                    <p><span class="priority-badge priority-${caseData.priority}">${caseData.priority}</span></p>
                </div>
                <div class="detail-item">
                    <h4>Crime Type</h4>
                    <p>${caseData.crime_type}</p>
                </div>
                <div class="detail-item">
                    <h4>Location</h4>
                    <p>${caseData.location || 'Not specified'}</p>
                </div>
                <div class="detail-item">
                    <h4>Date Reported</h4>
                    <p>${formattedReportedDate}</p>
                </div>
                <div class="detail-item">
                    <h4>Date Occurred</h4>
                    <p>${formattedOccurredDate}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Description</h4>
                <p>${caseData.description}</p>
            </div>
            
            <div class="detail-section">
                <h4>Complainant Information</h4>
                <p><strong>Name:</strong> ${caseData.complainant_name}</p>
                <p><strong>Email:</strong> ${caseData.complainant_email}</p>
                <p><strong>Phone:</strong> ${caseData.complainant_phone}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading case details:', error);
        caseDetailsContainer.innerHTML = '<p class="error">Error loading case details. Please try again.</p>';
        caseDetailsContainer.style.display = 'block';
        selectCaseMessage.style.display = 'none';
    }
}

async function logoutUser() {
    clearAuthToken();
    currentUser = null;
    showMessage('Logged out successfully', 'success');
    window.location.href = 'home.html';
}

// Case management functions
async function fetchCases(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/cases${queryParams ? `?${queryParams}` : ''}`;
        const response = await apiCall(endpoint);
        return response.cases;
    } catch (error) {
        showMessage('Failed to fetch cases', 'error');
        return [];
    }
}

async function createCase(caseData) {
    try {
        const response = await apiCall('/cases', {
            method: 'POST',
            body: JSON.stringify(caseData)
        });
        
        showMessage('Case created successfully!', 'success');
        return response.case;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

async function updateCase(caseId, updateData) {
    try {
        const response = await apiCall(`/cases/${caseId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        showMessage('Case updated successfully!', 'success');
        return response.case;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

async function getCaseDetails(caseId) {
    try {
        const response = await apiCall(`/cases/${caseId}`);
        return response;
    } catch (error) {
        showMessage('Failed to fetch case details', 'error');
        return null;
    }
}

async function addCaseUpdate(caseId, updateText) {
    try {
        const response = await apiCall(`/cases/${caseId}/updates`, {
            method: 'POST',
            body: JSON.stringify({ update_text: updateText })
        });
        
        showMessage('Update added successfully!', 'success');
        return response.update;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

// User management functions
async function getUserProfile() {
    try {
        const response = await apiCall('/auth/profile');
        return response.user;
    } catch (error) {
        showMessage('Failed to fetch profile', 'error');
        return null;
    }
}

async function updateUserProfile(profileData) {
    try {
        const response = await apiCall('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        showMessage('Profile updated successfully!', 'success');
        return response.user;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

// Admin functions
async function getSystemStats() {
    try {
        const response = await apiCall('/admin/overview');
        return response;
    } catch (error) {
        showMessage('Failed to fetch system statistics', 'error');
        return null;
    }
}

async function createOfficer(officerData) {
    try {
        const response = await apiCall('/admin/officers', {
            method: 'POST',
            body: JSON.stringify(officerData)
        });
        
        showMessage('Officer account created successfully!', 'success');
        return response.officer;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

// UI Update functions
function updateCasesList(cases) {
    const casesList = document.getElementById('cases-list');
    if (casesList) {
        casesList.innerHTML = '';
        cases.forEach(caseItem => {
            const li = document.createElement('li');
            li.className = 'case-item';
            li.innerHTML = `
                <div class="case-header">
                    <h4>${caseItem.case_number}</h4>
                    <span class="status ${caseItem.status}">${caseItem.status}</span>
                    <span class="priority ${caseItem.priority}">${caseItem.priority}</span>
                </div>
                <h5>${caseItem.title}</h5>
                <p>${caseItem.description || 'No description'}</p>
                <div class="case-meta">
                    <span>Type: ${caseItem.crime_type}</span>
                    <span>Location: ${caseItem.location}</span>
                    <span>Assigned: ${caseItem.assigned_officer_name || 'Unassigned'}</span>
                </div>
                <button onclick="viewCase(${caseItem.id})" class="btn-view">View Details</button>
            `;
            casesList.appendChild(li);
        });
    }
}

function updateDashboardStats(stats) {
    const statsContainer = document.getElementById('dashboard-stats');
    if (statsContainer && stats) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>${stats.total_cases || 0}</h3>
                <p>Total Cases</p>
            </div>
            <div class="stat-card">
                <h3>${stats.open_cases || 0}</h3>
                <p>Open Cases</p>
            </div>
            <div class="stat-card">
                <h3>${stats.closed_cases || 0}</h3>
                <p>Closed Cases</p>
            </div>
            <div class="stat-card">
                <h3>${stats.high_priority || 0}</h3>
                <p>High Priority</p>
            </div>
        `;
    }
}

// Navigation and page functions
function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function viewCase(caseId) {
    if (checkAuth()) {
        window.location.href = `case-details.html?id=${caseId}`;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated on protected pages
    const protectedPages = ['dashboard.html', 'admin-dashboard.html', 'case-details.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !checkAuth()) {
        return;
    }

    // Initialize page-specific functionality
    if (currentPage === 'login.html') {
        initializeLoginPage();
    } else if (currentPage === 'registration.html') {
        initializeRegistrationPage();
    } else if (currentPage === 'dashboard.html') {
        initializeDashboardPage();
    } else if (currentPage === 'admin-dashboard.html') {
        initializeAdminDashboardPage();
    } else if (currentPage === 'case-details.html') {
        initializeCaseDetailsPage();
    }
});

// Page-specific initialization functions
function initializeLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            await loginUser(username, password);
        });
    }
}

function initializeRegistrationPage() {
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registrationForm);
            const userData = Object.fromEntries(formData.entries());
            await registerUser(userData);
        });
    }
}

async function initializeDashboardPage() {
    if (!checkAuth()) return;

    try {
        // Load user profile
        currentUser = await getUserProfile();
        
        // Load cases
        const cases = await fetchCases();
        updateCasesList(cases);
        
        // Load user stats
        const userStats = await apiCall(`/users/${currentUser.id}/stats`);
        updateDashboardStats(userStats.stats);
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
}

async function initializeAdminDashboardPage() {
    if (!checkAuth() || currentUser?.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    try {
        const stats = await getSystemStats();
        if (stats) {
            updateDashboardStats(stats.overallStats);
            // Add more admin-specific UI updates here
        }
    } catch (error) {
        console.error('Admin dashboard initialization error:', error);
    }
}

async function initializeCaseDetailsPage() {
    if (!checkAuth()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('id');
    
    if (!caseId) {
        showMessage('No case ID provided', 'error');
        return;
    }

    try {
        const caseData = await getCaseDetails(caseId);
        if (caseData) {
            // Update case details UI
            updateCaseDetailsUI(caseData);
        }
    } catch (error) {
        console.error('Case details initialization error:', error);
    }
}

function updateCaseDetailsUI(caseData) {
    // Implementation for updating case details UI
    // This would populate the case details page with the fetched data
    console.log('Updating case details UI:', caseData);
}
