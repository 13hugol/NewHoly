// admin.js - Handles Admin Panel UI, Authentication, and CRUD operations

// --- DOM Elements ---
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const pageLoader = document.getElementById('page-loader');

// Section content containers
const sections = {
    dashboard: document.getElementById('dashboard-section-content'),
    programs: document.getElementById('programs-section-content'),
    newsEvents: document.getElementById('news-events-section-content'),
    testimonials: document.getElementById('testimonials-section-content'),
    faculty: document.getElementById('faculty-section-content'),
    gallery: document.getElementById('gallery-section-content'),
    quickLinks: document.getElementById('quick-links-section-content'),
};

// Forms
const programForm = document.getElementById('program-form');
const newsEventForm = document.getElementById('news-event-form');
const testimonialForm = document.getElementById('testimonial-form');
const facultyForm = document.getElementById('faculty-form');
const galleryForm = document.getElementById('gallery-form');
const quickLinkForm = document.getElementById('quick-link-form');

// Lists
const programsList = document.getElementById('programs-list');
const newsEventsList = document.getElementById('news-events-list');
const testimonialsList = document.getElementById('testimonials-list');
const facultyList = document.getElementById('faculty-list');
const galleryList = document.getElementById('gallery-list');
const quickLinksList = document.getElementById('quick-links-list');

// Dashboard counts
const dashboardCounts = {
    programs: document.getElementById('dashboard-programs-count'),
    newsEvents: document.getElementById('dashboard-news-events-count'),
    testimonials: document.getElementById('dashboard-testimonials-count'),
    faculty: document.getElementById('dashboard-faculty-count'),
    gallery: document.getElementById('dashboard-gallery-count'),
    quickLinks: document.getElementById('dashboard-quick-links-count'),
};

// Current editing IDs and image URLs for forms with file uploads
let currentEditing = {
    program: null,
    newsEvent: null,
    faculty: null,
    gallery: null,
    testimonial: null,
    quickLink: null
};

let currentNewsEventImageUrl = null;
let currentFacultyImageUrl = null;
let currentGalleryImageUrl = null;

// --- Helper Functions ---

/**
 * Displays a temporary message box instead of alert.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error' for styling.
 */
function showMessageBox(message, type = 'info') {
    const msgBox = document.createElement('div');
    msgBox.textContent = message;
    msgBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: 'Inter', sans-serif;
        font-size: 16px;
        color: white;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    `;

    if (type === 'success') {
        msgBox.style.backgroundColor = '#4CAF50'; // Green
        msgBox.style.border = '1px solid #4CAF50';
    } else if (type === 'error') {
        msgBox.style.backgroundColor = '#f44336'; // Red
        msgBox.style.border = '1px solid #f44336';
    } else {
        msgBox.style.backgroundColor = '#2196F3'; // Blue
        msgBox.style.border = '1px solid #2196F3';
    }

    document.body.appendChild(msgBox);

    // Animate in
    setTimeout(() => {
        msgBox.style.opacity = '1';
        msgBox.style.transform = 'translateY(0)';
    }, 10); // Small delay to ensure transition applies

    // Animate out and remove
    setTimeout(() => {
        msgBox.style.opacity = '0';
        msgBox.style.transform = 'translateY(-20px)';
        msgBox.addEventListener('transitionend', () => msgBox.remove());
    }, 3000);
}


/**
 * Fetches data from a protected API endpoint with authentication token.
 * @param {string} endpoint - The API endpoint URL.
 * @param {object} options - Fetch options (method, body, headers, etc.).
 * @returns {Promise<object>} - The JSON response data.
 */
async function authenticatedFetch(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        showMessageBox('Authentication required. Please log in.', 'error');
        showLogin();
        throw new Error('No authentication token found.');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers // Allow overriding or adding more headers
    };

    try {
        const response = await fetch(endpoint, { ...options, headers });
        if (response.status === 401 || response.status === 403) {
            showMessageBox('Session expired or unauthorized. Please log in again.', 'error');
            localStorage.removeItem('adminToken');
            showLogin();
            throw new Error('Unauthorized or expired token.');
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error during authenticated fetch to ${endpoint}:`, error);
        showMessageBox(`Error: ${error.message}`, 'error');
        throw error; // Re-throw to be handled by calling function
    }
}

/**
 * Handles image upload to the backend.
 * @param {File} imageFile - The image file to upload.
 * @returns {Promise<string|null>} - The URL of the uploaded image or null on failure.
 */
async function uploadImage(imageFile) {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await authenticatedFetch('/api/upload', {
            method: 'POST',
            body: formData,
            // Do NOT set 'Content-Type' header for FormData, browser sets it automatically
            headers: {
                // Only Authorization header is needed; Content-Type is handled by FormData
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        if (response.imageUrl) {
            showMessageBox('Image uploaded successfully!', 'success');
            return response.imageUrl;
        } else {
            showMessageBox('Image upload failed: ' + (response.message || 'Unknown error'), 'error');
            return null;
        }
    } catch (error) {
        console.error('Image upload error:', error);
        showMessageBox('Image upload failed.', 'error');
        return null;
    }
}


/**
 * Shows the login section and hides the admin panel.
 */
function showLogin() {
    loginSection.style.display = 'flex';
    adminPanel.style.display = 'none';
    pageLoader.style.display = 'none'; // Hide loader if showing
    loginForm.reset(); // Clear login form
    loginError.textContent = ''; // Clear any previous error messages
}

/**
 * Shows the admin panel and hides the login section.
 */
function showAdminPanel() {
    loginSection.style.display = 'none';
    adminPanel.style.display = 'flex';
    pageLoader.style.display = 'none'; // Hide loader
    loadDashboardCounts(); // Load dashboard data on panel entry
    showSection('dashboard'); // Default to dashboard
}

/**
 * Hides all admin sections and shows the specified one.
 * @param {string} sectionId - The ID of the section to show (e.g., 'dashboard', 'programs').
 */
function showSection(sectionId) {
    Object.values(sections).forEach(section => {
        if (section) section.classList.add('hidden');
    });
    const targetSection = sections[sectionId];
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Reset forms and lists when changing sections
    resetForms();
    loadAllData(); // Reload data for the active section
}

/**
 * Resets all forms and hides their containers.
 */
function resetForms() {
    programForm.reset();
    programForm.closest('.form-container').classList.add('hidden');
    currentEditing.program = null;

    newsEventForm.reset();
    newsEventForm.closest('.form-container').classList.add('hidden');
    currentEditing.newsEvent = null;
    document.getElementById('current-news-event-image-url').textContent = '';

    testimonialForm.reset();
    testimonialForm.closest('.form-container').classList.add('hidden');
    currentEditing.testimonial = null;

    facultyForm.reset();
    facultyForm.closest('.form-container').classList.add('hidden');
    currentEditing.faculty = null;
    document.getElementById('current-faculty-image-url').textContent = '';

    galleryForm.reset();
    galleryForm.closest('.form-container').classList.add('hidden');
    currentEditing.gallery = null;
    document.getElementById('current-gallery-image-url').textContent = '';

    quickLinkForm.reset();
    quickLinkForm.closest('.form-container').classList.add('hidden');
    currentEditing.quickLink = null;
}

/**
 * Loads dashboard counts from the backend.
 */
async function loadDashboardCounts() {
    try {
        const counts = {
            programs: (await authenticatedFetch('/api/programs')).data.length,
            newsEvents: (await authenticatedFetch('/api/newsEvents')).data.length,
            testimonials: (await authenticatedFetch('/api/testimonials')).data.length,
            faculty: (await authenticatedFetch('/api/faculty')).data.length,
            gallery: (await authenticatedFetch('/api/gallery')).data.length,
            quickLinks: (await authenticatedFetch('/api/quickLinks')).data.length,
        };

        dashboardCounts.programs.textContent = counts.programs;
        dashboardCounts.newsEvents.textContent = counts.newsEvents;
        dashboardCounts.testimonials.textContent = counts.testimonials;
        dashboardCounts.faculty.textContent = counts.faculty;
        dashboardCounts.gallery.textContent = counts.gallery;
        dashboardCounts.quickLinks.textContent = counts.quickLinks;

    } catch (error) {
        console.error('Failed to load dashboard counts:', error);
        // Specific error handling for dashboard counts if needed
    }
}

/**
 * Loads data for all sections (or specific ones) and renders them.
 */
async function loadAllData() {
    await loadPrograms();
    await loadNewsEvents();
    await loadTestimonials();
    await loadFaculty();
    await loadGallery();
    await loadQuickLinks();
    await loadContactMessages(); // Load contact messages for admin
}

// --- Specific Section Load and Render Functions ---

async function loadPrograms() {
    const dataList = programsList;
    dataList.innerHTML = '<p class="loading-message">Loading programs...</p>';
    try {
        const response = await authenticatedFetch('/api/programs');
        const programs = response.data;
        dataList.innerHTML = ''; // Clear loading message

        if (programs.length === 0) {
            dataList.innerHTML = '<p class="no-data-message">No programs added yet.</p>';
            return;
        }
        programs.forEach(program => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('data-item');
            itemDiv.innerHTML = `
                <div class="item-details">
                    <div class="item-icon">${program.iconSvg || '<i class="fas fa-book"></i>'}</div>
                    <div class="item-text">
                        <h3>${program.title}</h3>
                        <p>${program.description}</p>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${program._id}" data-type="program"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-id="${program._id}" data-type="program"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            dataList.appendChild(itemDiv);
        });
    } catch (error) {
        dataList.innerHTML = '<p class="error-message">Failed to load programs.</p>';
        console.error('Error loading programs:', error);
    }
}

async function loadNewsEvents() {
    const dataList = newsEventsList;
    dataList.innerHTML = '<p class="loading-message">Loading news & events...</p>';
    try {
        const response = await authenticatedFetch('/api/newsEvents');
        const newsEvents = response.data;
        dataList.innerHTML = '';

        if (newsEvents.length === 0) {
            dataList.innerHTML = '<p class="no-data-message">No news or events added yet.</p>';
            return;
        }
        newsEvents.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('data-item');
            itemDiv.innerHTML = `
                <div class="item-details">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" class="item-image" onerror="this.onerror=null;this.src='https://placehold.co/80x80/cccccc/000000?text=No+Image';" />` : ''}
                    <div class="item-text">
                        <h3>${item.title} (${item.date})</h3>
                        <p>${item.description}</p>
                        ${item.link ? `<a href="${item.link}" target="_blank">Link</a>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${item._id}" data-type="newsEvent"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-id="${item._id}" data-type="newsEvent"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            dataList.appendChild(itemDiv);
        });
    } catch (error) {
        dataList.innerHTML = '<p class="error-message">Failed to load news & events.</p>';
        console.error('Error loading news & events:', error);
    }
}

async function loadTestimonials() {
    const dataList = testimonialsList;
    dataList.innerHTML = '<p class="loading-message">Loading testimonials...</p>';
    try {
        const response = await authenticatedFetch('/api/testimonials');
        const testimonials = response.data;
        dataList.innerHTML = '';

        if (testimonials.length === 0) {
            dataList.innerHTML = '<p class="no-data-message">No testimonials added yet.</p>';
            return;
        }
        testimonials.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('data-item');
            itemDiv.innerHTML = `
                <div class="item-details">
                    <div class="item-icon">${item.iconSvg || '<i class="fas fa-quote-right"></i>'}</div>
                    <div class="item-text">
                        <h3>"${item.quote}"</h3>
                        <p>- ${item.author}, ${item.role}</p>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${item._id}" data-type="testimonial"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-id="${item._id}" data-type="testimonial"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            dataList.appendChild(itemDiv);
        });
    } catch (error) {
        dataList.innerHTML = '<p class="error-message">Failed to load testimonials.</p>';
        console.error('Error loading testimonials:', error);
    }
}

async function loadFaculty() {
    const dataList = facultyList;
    dataList.innerHTML = '<p class="loading-message">Loading faculty...</p>';
    try {
        const response = await authenticatedFetch('/api/faculty');
        const faculty = response.data;
        dataList.innerHTML = '';

        if (faculty.length === 0) {
            dataList.innerHTML = '<p class="no-data-message">No faculty members added yet.</p>';
            return;
        }
        faculty.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('data-item');
            itemDiv.innerHTML = `
                <div class="item-details">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="item-image faculty-image" onerror="this.onerror=null;this.src='https://placehold.co/80x80/cccccc/000000?text=No+Image';" />` : ''}
                    <div class="item-text">
                        <h3>${item.name}</h3>
                        <p>${item.role}</p>
                        <p>${item.description}</p>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${item._id}" data-type="faculty"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-id="${item._id}" data-type="faculty"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            dataList.appendChild(itemDiv);
        });
    } catch (error) {
        dataList.innerHTML = '<p class="error-message">Failed to load faculty.</p>';
        console.error('Error loading faculty:', error);
    }
}

async function loadGallery() {
    const dataList = galleryList;
    dataList.innerHTML = '<p class="loading-message">Loading gallery items...</p>';
    try {
        const response = await authenticatedFetch('/api/gallery');
        const galleryItems = response.data;
        dataList.innerHTML = '';

        if (galleryItems.length === 0) {
            dataList.innerHTML = '<p class="no-data-message">No gallery items added yet.</p>';
            return;
        }
        galleryItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('data-item');
            itemDiv.innerHTML = `
                <div class="item-details">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.caption}" class="item-image" onerror="this.onerror=null;this.src='https://placehold.co/80x80/cccccc/000000?text=No+Image';" />` : ''}
                    <div class="item-text">
                        <h3>${item.caption}</h3>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${item._id}" data-type="gallery"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-id="${item._id}" data-type="gallery"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            dataList.appendChild(itemDiv);
        });
    } catch (error) {
        dataList.innerHTML = '<p class="error-message">Failed to load gallery items.</p>';
        console.error('Error loading gallery items:', error);
    }
}

async function loadQuickLinks() {
    const dataList = quickLinksList;
    dataList.innerHTML = '<p class="loading-message">Loading quick links...</p>';
    try {
        const response = await authenticatedFetch('/api/quickLinks');
        const quickLinks = response.data;
        dataList.innerHTML = '';

        if (quickLinks.length === 0) {
            dataList.innerHTML = '<p class="no-data-message">No quick links added yet.</p>';
            return;
        }
        quickLinks.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('data-item');
            itemDiv.innerHTML = `
                <div class="item-details">
                    <div class="item-icon">${item.iconSvg || '<i class="fas fa-link"></i>'}</div>
                    <div class="item-text">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <a href="${item.url}" target="_blank">${item.url}</a>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${item._id}" data-type="quickLink"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-id="${item._id}" data-type="quickLink"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            dataList.appendChild(itemDiv);
        });
    } catch (error) {
        dataList.innerHTML = '<p class="error-message">Failed to load quick links.</p>';
        console.error('Error loading quick links:', error);
    }
}

async function loadContactMessages() {
    const dataList = document.getElementById('contact-messages-list'); // Assuming you'll add a section for contacts
    if (!dataList) return; // Exit if contact messages section doesn't exist yet
    dataList.innerHTML = '<p class="loading-message">Loading contact messages...</p>';
    try {
        const response = await authenticatedFetch('/api/contacts');
        const contacts = response.data;
        dataList.innerHTML = '';

        if (contacts.length === 0) {
            dataList.innerHTML = '<p class="no-data-message">No contact messages received yet.</p>';
            return;
        }
        contacts.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('data-item');
            itemDiv.innerHTML = `
                <div class="item-details">
                    <div class="item-text">
                        <h3>From: ${item.name} (${item.email})</h3>
                        <p>Message: ${item.message}</p>
                        <p class="date">Received: ${new Date(item.submittedAt).toLocaleString()}</p>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" data-id="${item._id}" data-type="contact"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            dataList.appendChild(itemDiv);
        });
    } catch (error) {
        dataList.innerHTML = '<p class="error-message">Failed to load contact messages.</p>';
        console.error('Error loading contact messages:', error);
    }
}


// --- Event Listeners ---

// Login Form Submission
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('adminToken', data.token);
            showMessageBox('Login successful!', 'success');
            showAdminPanel();
        } else {
            const errorData = await response.json();
            loginError.textContent = errorData.message || 'Login failed. Please try again.';
            showMessageBox('Login failed.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'An error occurred during login.';
        showMessageBox('An error occurred during login.', 'error');
    }
});

// Logout Button
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    showMessageBox('Logged out successfully.', 'info');
    showLogin();
});

// Sidebar Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const sectionId = event.target.dataset.section;
        showSection(sectionId);
    });
});

// --- CRUD Form Submissions ---

// Generic form submission handler
async function handleFormSubmit(event, form, type, idField, imageUrlDisplayId) {
    event.preventDefault();
    const formData = new FormData(form);
    const id = document.getElementById(idField).value;
    const isEditing = !!id;

    const data = {};
    for (let [key, value] of formData.entries()) {
        if (key !== 'image') { // Exclude image file itself from direct data
            data[key] = value;
        }
    }

    let imageUrl = null;
    const imageFile = form.querySelector('input[type="file"]') ? form.querySelector('input[type="file"]').files[0] : null;

    // If there's a new image file, upload it
    if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (imageUrl) {
            data.imageUrl = imageUrl;
        } else {
            // If new image upload fails, and it's an edit, keep old image URL
            if (isEditing && imageUrlDisplayId) {
                data.imageUrl = document.getElementById(imageUrlDisplayId).dataset.currentUrl;
            } else {
                 showMessageBox('Image upload failed. Cannot save item without image.', 'error');
                 return; // Prevent saving if image is required and upload failed
            }
        }
    } else if (isEditing && imageUrlDisplayId) {
        // If no new image, but it's an edit, retain existing image URL
        data.imageUrl = document.getElementById(imageUrlDisplayId).dataset.currentUrl;
    }


    try {
        let response;
        if (isEditing) {
            response = await authenticatedFetch(`/api/${type}s/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } else {
            response = await authenticatedFetch(`/api/${type}s`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }

        if (response.success) {
            showMessageBox(response.message, 'success');
            form.reset();
            form.closest('.form-container').classList.add('hidden');
            currentEditing[type] = null;
            loadAllData(); // Reload data for all relevant sections
            loadDashboardCounts(); // Update dashboard counts
        } else {
            showMessageBox('Operation failed: ' + (response.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error(`Error saving ${type}:`, error);
        showMessageBox(`Failed to save ${type}.`, 'error');
    }
}

// Program Form
programForm.addEventListener('submit', (event) => {
    handleFormSubmit(event, programForm, 'program', 'program-id');
});
document.getElementById('cancel-program-edit').addEventListener('click', () => {
    programForm.reset();
    programForm.closest('.form-container').classList.add('hidden');
    currentEditing.program = null;
});

// News & Event Form
newsEventForm.addEventListener('submit', (event) => {
    handleFormSubmit(event, newsEventForm, 'newsEvent', 'news-event-id', 'current-news-event-image-url');
});
document.getElementById('cancel-news-event-edit').addEventListener('click', () => {
    newsEventForm.reset();
    newsEventForm.closest('.form-container').classList.add('hidden');
    currentEditing.newsEvent = null;
    document.getElementById('current-news-event-image-url').textContent = '';
});

// Testimonial Form
testimonialForm.addEventListener('submit', (event) => {
    handleFormSubmit(event, testimonialForm, 'testimonial', 'testimonial-id');
});
document.getElementById('cancel-testimonial-edit').addEventListener('click', () => {
    testimonialForm.reset();
    testimonialForm.closest('.form-container').classList.add('hidden');
    currentEditing.testimonial = null;
});

// Faculty Form
facultyForm.addEventListener('submit', (event) => {
    handleFormSubmit(event, facultyForm, 'faculty', 'faculty-id', 'current-faculty-image-url');
});
document.getElementById('cancel-faculty-edit').addEventListener('click', () => {
    facultyForm.reset();
    facultyForm.closest('.form-container').classList.add('hidden');
    currentEditing.faculty = null;
    document.getElementById('current-faculty-image-url').textContent = '';
});

// Gallery Form
galleryForm.addEventListener('submit', (event) => {
    handleFormSubmit(event, galleryForm, 'gallery', 'gallery-id', 'current-gallery-image-url');
});
document.getElementById('cancel-gallery-edit').addEventListener('click', () => {
    galleryForm.reset();
    galleryForm.closest('.form-container').classList.add('hidden');
    currentEditing.gallery = null;
    document.getElementById('current-gallery-image-url').textContent = '';
});

// Quick Link Form
quickLinkForm.addEventListener('submit', (event) => {
    handleFormSubmit(event, quickLinkForm, 'quickLink', 'quick-link-id');
});
document.getElementById('cancel-quick-link-edit').addEventListener('click', () => {
    quickLinkForm.reset();
    quickLinkForm.closest('.form-container').classList.add('hidden');
    currentEditing.quickLink = null;
});


// --- Edit and Delete Button Delegation ---
document.addEventListener('click', async (event) => {
    // Handle Edit
    if (event.target.classList.contains('edit-btn')) {
        const id = event.target.dataset.id;
        const type = event.target.dataset.type;
        let form, idField, imageUrlDisplay;

        // Show the correct form and populate it
        Object.values(sections).forEach(section => {
            const formContainer = section.querySelector('.form-container');
            if (formContainer) formContainer.classList.add('hidden');
        });

        try {
            const response = await authenticatedFetch(`/api/${type}s/${id}`);
            const item = response.data;

            if (!item) {
                showMessageBox('Item not found for editing.', 'error');
                return;
            }

            currentEditing[type] = id; // Store ID of item being edited

            switch (type) {
                case 'program':
                    form = programForm;
                    idField = 'program-id';
                    form.querySelector('#program-title').value = item.title;
                    form.querySelector('#program-description').value = item.description;
                    form.querySelector('#program-icon-svg').value = item.iconSvg || '';
                    break;
                case 'newsEvent':
                    form = newsEventForm;
                    idField = 'news-event-id';
                    imageUrlDisplay = document.getElementById('current-news-event-image-url');
                    form.querySelector('#news-event-title').value = item.title;
                    form.querySelector('#news-event-date').value = item.date;
                    form.querySelector('#news-event-description').value = item.description;
                    form.querySelector('#news-event-link').value = item.link || '';
                    form.querySelector('#news-event-icon-svg').value = item.iconSvg || '';
                    if (item.imageUrl) {
                        imageUrlDisplay.textContent = `Current Image: ${item.imageUrl.split('/').pop()}`;
                        imageUrlDisplay.dataset.currentUrl = item.imageUrl; // Store for later use
                    } else {
                        imageUrlDisplay.textContent = '';
                        imageUrlDisplay.dataset.currentUrl = '';
                    }
                    break;
                case 'testimonial':
                    form = testimonialForm;
                    idField = 'testimonial-id';
                    form.querySelector('#testimonial-quote').value = item.quote;
                    form.querySelector('#testimonial-author').value = item.author;
                    form.querySelector('#testimonial-role').value = item.role;
                    form.querySelector('#testimonial-icon-svg').value = item.iconSvg || '';
                    break;
                case 'faculty':
                    form = facultyForm;
                    idField = 'faculty-id';
                    imageUrlDisplay = document.getElementById('current-faculty-image-url');
                    form.querySelector('#faculty-name').value = item.name;
                    form.querySelector('#faculty-role').value = item.role;
                    form.querySelector('#faculty-description').value = item.description;
                    if (item.imageUrl) {
                        imageUrlDisplay.textContent = `Current Image: ${item.imageUrl.split('/').pop()}`;
                        imageUrlDisplay.dataset.currentUrl = item.imageUrl;
                    } else {
                        imageUrlDisplay.textContent = '';
                        imageUrlDisplay.dataset.currentUrl = '';
                    }
                    break;
                case 'gallery':
                    form = galleryForm;
                    idField = 'gallery-id';
                    imageUrlDisplay = document.getElementById('current-gallery-image-url');
                    form.querySelector('#gallery-caption').value = item.caption;
                    if (item.imageUrl) {
                        imageUrlDisplay.textContent = `Current Image: ${item.imageUrl.split('/').pop()}`;
                        imageUrlDisplay.dataset.currentUrl = item.imageUrl;
                    } else {
                        imageUrlDisplay.textContent = '';
                        imageUrlDisplay.dataset.currentUrl = '';
                    }
                    break;
                case 'quickLink':
                    form = quickLinkForm;
                    idField = 'quick-link-id';
                    form.querySelector('#quick-link-title').value = item.title;
                    form.querySelector('#quick-link-description').value = item.description;
                    form.querySelector('#quick-link-url').value = item.url;
                    form.querySelector('#quick-link-icon-svg').value = item.iconSvg || '';
                    break;
                default:
                    console.warn('Unknown item type for edit:', type);
                    return;
            }
            form.querySelector(`#${idField}`).value = id;
            form.closest('.form-container').classList.remove('hidden'); // Show the form
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to show form
        } catch (error) {
            console.error('Failed to fetch item for edit:', error);
            showMessageBox('Failed to load item for editing.', 'error');
        }
    }

    // Handle Delete
    if (event.target.classList.contains('delete-btn')) {
        const id = event.target.dataset.id;
        const type = event.target.dataset.type;

        // Simple confirmation (replace with custom modal if needed)
        if (!confirm(`Are you sure you want to delete this ${type}?`)) {
            return;
        }

        try {
            const response = await authenticatedFetch(`/api/${type}s/${id}`, {
                method: 'DELETE'
            });
            if (response.success) {
                showMessageBox(response.message, 'success');
                loadAllData(); // Reload data for all relevant sections
                loadDashboardCounts(); // Update dashboard counts
            } else {
                showMessageBox('Deletion failed: ' + (response.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            showMessageBox(`Failed to delete ${type}.`, 'error');
        }
    }
});

// --- Add New Item Buttons ---
document.querySelectorAll('.admin-section').forEach(section => {
    const addBtn = section.querySelector('.add-new-btn'); // Assuming you'll add these buttons
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const formContainer = section.querySelector('.form-container');
            if (formContainer) {
                resetForms(); // Reset all forms first
                formContainer.classList.remove('hidden'); // Show specific form
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
});

// Manually add event listeners for "Add New" buttons since they might not exist yet
// Or, ensure they are part of the HTML and then attach listeners
// For now, let's assume the forms are initially hidden and revealed by clicking "Add New" or "Edit"
// We need to add "Add New" buttons to admin.html for each section.

// Initial setup: Hide all forms initially and add event listeners for their "Add New" buttons
document.addEventListener('DOMContentLoaded', () => {
    // Hide all form containers by default
    document.querySelectorAll('.form-container').forEach(container => {
        container.classList.add('hidden');
    });

    // Add "Add New" buttons dynamically or ensure they are in admin.html
    // For now, let's assume they are in admin.html and we just need to attach listeners.
    // If not, you'd add them via JS here.
    // Example for Programs section:
    const programsSection = document.getElementById('programs-section-content');
    if (programsSection) {
        let addProgramBtn = programsSection.querySelector('.add-new-btn');
        if (!addProgramBtn) { // If button doesn't exist, create it
            addProgramBtn = document.createElement('button');
            addProgramBtn.classList.add('add-new-btn', 'save-btn'); // Using save-btn for styling
            addProgramBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Program';
            programsSection.insertBefore(addProgramBtn, programsSection.querySelector('h2:nth-of-type(2)')); // Insert before "Existing Programs" H2
        }
        addProgramBtn.addEventListener('click', () => {
            resetForms();
            programForm.closest('.form-container').classList.remove('hidden');
            document.getElementById('program-id').value = ''; // Ensure ID is clear for new item
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const newsEventsSection = document.getElementById('news-events-section-content');
    if (newsEventsSection) {
        let addNewsEventBtn = newsEventsSection.querySelector('.add-new-btn');
        if (!addNewsEventBtn) {
            addNewsEventBtn = document.createElement('button');
            addNewsEventBtn.classList.add('add-new-btn', 'save-btn');
            addNewsEventBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add New News/Event';
            newsEventsSection.insertBefore(addNewsEventBtn, newsEventsSection.querySelector('h2:nth-of-type(2)'));
        }
        addNewsEventBtn.addEventListener('click', () => {
            resetForms();
            newsEventForm.closest('.form-container').classList.remove('hidden');
            document.getElementById('news-event-id').value = '';
            document.getElementById('current-news-event-image-url').textContent = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const testimonialsSection = document.getElementById('testimonials-section-content');
    if (testimonialsSection) {
        let addTestimonialBtn = testimonialsSection.querySelector('.add-new-btn');
        if (!addTestimonialBtn) {
            addTestimonialBtn = document.createElement('button');
            addTestimonialBtn.classList.add('add-new-btn', 'save-btn');
            addTestimonialBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Testimonial';
            testimonialsSection.insertBefore(addTestimonialBtn, testimonialsSection.querySelector('h2:nth-of-type(2)'));
        }
        addTestimonialBtn.addEventListener('click', () => {
            resetForms();
            testimonialForm.closest('.form-container').classList.remove('hidden');
            document.getElementById('testimonial-id').value = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const facultySection = document.getElementById('faculty-section-content');
    if (facultySection) {
        let addFacultyBtn = facultySection.querySelector('.add-new-btn');
        if (!addFacultyBtn) {
            addFacultyBtn = document.createElement('button');
            addFacultyBtn.classList.add('add-new-btn', 'save-btn');
            addFacultyBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Faculty Member';
            facultySection.insertBefore(addFacultyBtn, facultySection.querySelector('h2:nth-of-type(2)'));
        }
        addFacultyBtn.addEventListener('click', () => {
            resetForms();
            facultyForm.closest('.form-container').classList.remove('hidden');
            document.getElementById('faculty-id').value = '';
            document.getElementById('current-faculty-image-url').textContent = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const gallerySection = document.getElementById('gallery-section-content');
    if (gallerySection) {
        let addGalleryBtn = gallerySection.querySelector('.add-new-btn');
        if (!addGalleryBtn) {
            addGalleryBtn = document.createElement('button');
            addGalleryBtn.classList.add('add-new-btn', 'save-btn');
            addGalleryBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Gallery Item';
            gallerySection.insertBefore(addGalleryBtn, gallerySection.querySelector('h2:nth-of-type(2)'));
        }
        addGalleryBtn.addEventListener('click', () => {
            resetForms();
            galleryForm.closest('.form-container').classList.remove('hidden');
            document.getElementById('gallery-id').value = '';
            document.getElementById('current-gallery-image-url').textContent = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const quickLinksSection = document.getElementById('quick-links-section-content');
    if (quickLinksSection) {
        let addQuickLinkBtn = quickLinksSection.querySelector('.add-new-btn');
        if (!addQuickLinkBtn) {
            addQuickLinkBtn = document.createElement('button');
            addQuickLinkBtn.classList.add('add-new-btn', 'save-btn');
            addQuickLinkBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Quick Link';
            quickLinksSection.insertBefore(addQuickLinkBtn, quickLinksSection.querySelector('h2:nth-of-type(2)'));
        }
        addQuickLinkBtn.addEventListener('click', () => {
            resetForms();
            quickLinkForm.closest('.form-container').classList.remove('hidden');
            document.getElementById('quick-link-id').value = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Initial check for authentication token
    if (localStorage.getItem('adminToken')) {
        showAdminPanel();
    } else {
        showLogin();
    }
});

