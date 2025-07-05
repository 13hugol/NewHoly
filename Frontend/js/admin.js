// admin.js - Handles Admin Panel UI, Authentication, and CRUD operations

// Global variables for DOM elements (will be assigned inside DOMContentLoaded)
let loginSection;
let adminPanel;
let loginForm;
let loginError;
let logoutBtn;

let sections = {}; // Object to hold section content containers

// Forms
let programForm;
let newsEventForm;
let testimonialForm;
let facultyForm;
let galleryForm;
let quickLinkForm;

// Lists
let programsList;
let newsEventsList;
let testimonialsList;
let facultyList;
let galleryList;
let quickLinksList;
let contactMessagesList;

// Dashboard counts
let dashboardCounts = {};

// Current editing IDs (to keep track of which item is being edited)
let currentEditing = {
    program: null,
    newsEvent: null,
    faculty: null,
    gallery: null,
    testimonial: null,
    quickLink: null,
    contact: null
};

// Reply Modal Elements (removed as they are no longer needed for direct mailto links)
// let replyModal;
// let replyToEmailInput;
// let replySubjectInput;
// let replyMessageInput;
// let replyForm;
// let closeModalButton;

// let currentContactId = null; // Removed as it's no longer needed for direct mailto links


// --- Helper Functions (can remain global as they don't directly access DOM elements until called) ---

/**
 * Displays a temporary message box instead of alert.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', 'warning', or 'info' for styling.
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
    } else if (type === 'warning') {
        msgBox.style.backgroundColor = '#ffc107'; // Yellow/Orange
        msgBox.style.border = '1px solid #ffc107';
        msgBox.style.color = '#333'; // Darker text for warning
    } else {
        msgBox.style.backgroundColor = '#2196F3'; // Blue
        msgBox.style.border = '19px solid #2196F3';
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
 * Automatically handles Content-Type for FormData.
 * @param {string} endpoint - The API endpoint URL.
 * @param {object} options - Fetch options (method, body, headers, etc.).
 * @returns {Promise<object>} - The JSON response data.
 */
async function authenticatedFetch(endpoint, options = {}) {
    console.log(`[authenticatedFetch] Attempting to fetch from: ${endpoint}`);
    const token = localStorage.getItem('adminToken');
    if (!token) {
        showMessageBox('Authentication required. Please log in.', 'error');
        showLogin();
        throw new Error('No authentication token found.');
    }

    const { silent, ...fetchOpts } = options;

    // Do not force JSON header if using FormData
    const headers = fetchOpts.body instanceof FormData
      ? { 'Authorization': `Bearer ${token}` } // Only Authorization header for FormData
      : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };


    try {
        const response = await fetch(endpoint, { ...fetchOpts, headers });
        console.log(`[authenticatedFetch] Response status for ${endpoint}: ${response.status}`);
        if (response.status === 401 || response.status === 403) {
            showMessageBox('Session expired or unauthorized. Please log in again.', 'error');
            localStorage.removeItem('adminToken');
            showLogin();
            throw new Error('Unauthorized or expired token.');
        }
        // Attempt to parse JSON only if the response is not HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json();
            console.log(`[authenticatedFetch] Response data for ${endpoint}:`, responseData);
            if (!response.ok) {
                throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
            }
            return responseData;
        } else {
            // If not JSON, it's likely an HTML page (e.g., 404 or redirect)
            const errorText = await response.text();
            console.error(`[authenticatedFetch] Non-JSON response from ${endpoint}:`, errorText);
            throw new Error(`Unexpected response from server. Expected JSON, got ${contentType || 'unknown'}.`);
        }
    } catch (error) {
        console.error(`[authenticatedFetch] Error during fetch to ${endpoint}:`, error);
        if (!silent) { // Use silent option here
            showMessageBox(`Error: ${error.message}`, 'error');
        }
        throw error; // Re-throw to be handled by calling function
    }
}


// --- Confirmation Modal Implementation (can remain global) ---
function showConfirmationModal(message) {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.35)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '2000';

        // Create modal box
        const modal = document.createElement('div');
        modal.style.background = '#fff';
        modal.style.padding = '32px 28px 20px 28px';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
        modal.style.maxWidth = '350px';
        modal.style.width = '90%';
        modal.style.textAlign = 'center';
        modal.style.fontFamily = 'Inter, sans-serif';

        // Message
        const msg = document.createElement('div');
        msg.textContent = message;
        msg.style.marginBottom = '24px';
        msg.style.fontSize = '1.08rem';
        msg.style.color = '#333';

        // Buttons
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'center';
        btnContainer.style.gap = '18px';

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.style.background = '#f44336';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.border = 'none';
        confirmBtn.style.padding = '8px 20px';
        confirmBtn.style.borderRadius = '5px';
        confirmBtn.style.fontWeight = '600';
        confirmBtn.style.cursor = 'pointer';
        confirmBtn.style.fontSize = '1rem';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.background = '#eee';
        cancelBtn.style.color = '#333';
        cancelBtn.style.border = 'none';
        cancelBtn.style.padding = '8px 20px';
        cancelBtn.style.borderRadius = '5px';
        cancelBtn.style.fontWeight = '600';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.fontSize = '1rem';

        // Button actions
        confirmBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };

        // Keyboard accessibility
        overlay.tabIndex = -1;
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                resolve(false);
            }
        });

        btnContainer.appendChild(confirmBtn);
        btnContainer.appendChild(cancelBtn);
        modal.appendChild(msg);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        overlay.focus();
    });
}


// --- DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DOMContentLoaded] Initializing admin panel...');

    // Assign DOM elements AFTER the DOM is fully loaded
    loginSection = document.getElementById('login-section');
    adminPanel = document.getElementById('admin-panel');
    loginForm = document.getElementById('login-form');
    loginError = document.getElementById('login-error');
    logoutBtn = document.getElementById('logout-btn');

    sections = {
        dashboard: document.getElementById('dashboard-section-content'),
        programs: document.getElementById('programs-section-content'),
        newsEvents: document.getElementById('news-events-section-content'),
        testimonials: document.getElementById('testimonials-section-content'),
        faculty: document.getElementById('faculty-section-content'),
        gallery: document.getElementById('gallery-section-content'),
        quickLinks: document.getElementById('quick-links-section-content'),
        contacts: document.getElementById('contacts-section-content'),
    };

    programForm = document.getElementById('program-form');
    newsEventForm = document.getElementById('news-event-form');
    testimonialForm = document.getElementById('testimonial-form');
    facultyForm = document.getElementById('faculty-form');
    galleryForm = document.getElementById('gallery-form');
    quickLinkForm = document.getElementById('quick-link-form');

    programsList = document.getElementById('programs-list');
    newsEventsList = document.getElementById('news-events-list');
    testimonialsList = document.getElementById('testimonials-list');
    facultyList = document.getElementById('faculty-list');
    galleryList = document.getElementById('gallery-list');
    quickLinksList = document.getElementById('quick-links-list');
    // Ensure this ID is present in admin.html for contacts list
    contactMessagesList = document.getElementById('contacts-list');


    dashboardCounts = {
        programs: document.getElementById('dashboard-programs-count'),
        newsEvents: document.getElementById('dashboard-news-events-count'),
        testimonials: document.getElementById('dashboard-testimonials-count'),
        faculty: document.getElementById('dashboard-faculty-count'),
        gallery: document.getElementById('dashboard-gallery-count'),
        quickLinks: document.getElementById('dashboard-quick-links-count'),
        contacts: document.getElementById('dashboard-contacts-count'),
    };


    // --- Functions that rely on DOM elements (defined within DOMContentLoaded scope) ---

    /**
     * Shows the login section and hides the admin panel.
     */
    function showLogin() {
        loginSection.style.display = 'flex';
        adminPanel.style.display = 'none';
    }

    /**
     * Shows the admin panel and hides the login section.
     */
    function showAdminPanel() {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'flex';
        loadDashboardCounts(); // Load dashboard data on panel entry
        showSection('dashboard'); // Default to dashboard
    }

    /**
     * Hides all admin sections and shows the specified one.
     * @param {string} sectionId - The ID of the section to show (e.g., 'dashboard', 'programs').
     */
    function showSection(sectionId) {
        // Remove 'active' class from all nav links
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active-nav-item'); // Assuming 'active-nav-item' is the class from admin.css
        });

        // Add 'active' class to the clicked nav link
        const activeNavLink = document.querySelector(`.sidebar-nav .nav-link[data-section="${sectionId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active-nav-item');
        }

        // Hide all content sections
        Object.values(sections).forEach(section => {
            if (section) section.classList.add('hidden');
        });
        // Show the target section
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
        const allFormContainers = document.querySelectorAll('.form-container'); // Corrected selector
        allFormContainers.forEach(container => {
            container.classList.add('hidden');
            const form = container.querySelector('form');
            if (form) {
                form.reset();
                // Clear hidden ID inputs
                const idInput = form.querySelector('input[type="hidden"][name="_id"]');
                if (idInput) idInput.value = '';

                // Clear file input displays and current image URLs
                const fileNameDisplay = form.querySelector('.file-name-display');
                if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen';
                const currentImageUrlElement = form.querySelector('.current-image-info');
                if (currentImageUrlElement) {
                    currentImageUrlElement.textContent = '';
                    currentImageUrlElement.dataset.currentUrl = '';
                }
            }
        });
        // Reset currentEditing state
        for (const key in currentEditing) {
            currentEditing[key] = null;
        }
    }

    /**
     * Loads dashboard counts from the backend.
     */
    async function loadDashboardCounts() {
        console.log('[loadDashboardCounts] Loading dashboard counts...');
        try {
            // Fetch counts for each collection
            const programsCount = (await authenticatedFetch('/api/programs', { silent: true })).data.length;
            const newsEventsCount = (await authenticatedFetch('/api/newsEvents', { silent: true })).data.length;
            const testimonialsCount = (await authenticatedFetch('/api/testimonials', { silent: true })).data.length;
            // Corrected API endpoints for faculty and gallery
            const facultyCount = (await authenticatedFetch('/api/facultys', { silent: true })).data.length;
            const galleryCount = (await authenticatedFetch('/api/gallerys', { silent: true })).data.length;
            const quickLinksCount = (await authenticatedFetch('/api/quickLinks', { silent: true })).data.length;
            const contactsCount = (await authenticatedFetch('/api/contacts', { silent: true })).data.length;

            // Update dashboard UI elements
            if (dashboardCounts.programs) dashboardCounts.programs.textContent = programsCount;
            if (dashboardCounts.newsEvents) dashboardCounts.newsEvents.textContent = newsEventsCount;
            if (dashboardCounts.testimonials) dashboardCounts.testimonials.textContent = testimonialsCount;
            if (dashboardCounts.faculty) dashboardCounts.faculty.textContent = facultyCount;
            if (dashboardCounts.gallery) dashboardCounts.gallery.textContent = galleryCount;
            if (dashboardCounts.quickLinks) dashboardCounts.quickLinks.textContent = quickLinksCount;
            if (dashboardCounts.contacts) dashboardCounts.contacts.textContent = contactsCount;

            console.log('[loadDashboardCounts] Dashboard counts loaded successfully.');

        } catch (error) {
            console.error('[loadDashboardCounts] Failed to load dashboard counts:', error);
            // Display 0 or N/A if counts fail to load
            for (const key in dashboardCounts) {
                if (dashboardCounts[key]) dashboardCounts[key].textContent = 'N/A';
            }
        }
    }

    /**
     * Loads data for all sections (or specific ones) and renders them.
     */
    async function loadAllData() {
        console.log('[loadAllData] Loading all section data...');
        // Load data for each section concurrently
        await Promise.all([
            loadPrograms(),
            loadNewsEvents(),
            loadTestimonials(),
            loadFaculty(),
            loadGallery(),
            loadQuickLinks(),
            loadContactMessages()
        ]);
        console.log('[loadAllData] All section data loading initiated.');
    }

    // --- Specific Section Load and Render Functions ---

    async function loadPrograms() {
        const dataList = programsList;
        if (!dataList) return; // Guard clause
        dataList.innerHTML = '<p class="loading-message">Loading programs...</p>';
        console.log('[loadPrograms] Fetching programs...');
        try {
            const response = await authenticatedFetch('/api/programs');
            const programs = response.data;
            dataList.innerHTML = ''; // Clear loading message

            if (programs.length === 0) {
                dataList.innerHTML = '<p class="no-data-message">No programs added yet.</p>';
                console.log('[loadPrograms] No programs found.');
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
            console.log(`[loadPrograms] ${programs.length} programs rendered.`);
        } catch (error) {
            dataList.innerHTML = '<p class="error-message">Failed to load programs.</p>';
            console.error('[loadPrograms] Error loading programs:', error);
        }
    }

    async function loadNewsEvents() {
        const dataList = newsEventsList;
        if (!dataList) return;
        dataList.innerHTML = '<p class="loading-message">Loading news & events...</p>';
        console.log('[loadNewsEvents] Fetching news & events...');
        try {
            const response = await authenticatedFetch('/api/newsEvents');
            const newsEvents = response.data;
            dataList.innerHTML = '';

            if (newsEvents.length === 0) {
                dataList.innerHTML = '<p class="no-data-message">No news or events added yet.</p>';
                console.log('[loadNewsEvents] No news or events found.');
                return;
            }
            newsEvents.forEach(item => {
                console.log(`[loadNewsEvents] Rendering item: ${item.title}, Image URL: ${item.imageUrl}`); // Added log
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
            console.log(`[loadNewsEvents] ${newsEvents.length} news & events rendered.`);
        } catch (error) {
            dataList.innerHTML = '<p class="error-message">Failed to load news & events.</p>';
            console.error('[loadNewsEvents] Error loading news & events:', error);
        }
    }

    async function loadTestimonials() {
        const dataList = testimonialsList;
        if (!dataList) return;
        dataList.innerHTML = '<p class="loading-message">Loading testimonials...</p>';
        console.log('[loadTestimonials] Fetching testimonials...');
        try {
            const response = await authenticatedFetch('/api/testimonials');
            const testimonials = response.data;
            dataList.innerHTML = '';

            if (testimonials.length === 0) {
                dataList.innerHTML = '<p class="no-data-message">No testimonials added yet.</p>';
                console.log('[loadTestimonials] No testimonials found.');
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
            console.log(`[loadTestimonials] ${testimonials.length} testimonials rendered.`);
        } catch (error) {
            dataList.innerHTML = '<p class="error-message">Failed to load testimonials.</p>';
            console.error('[loadTestimonials] Error loading testimonials:', error);
        }
    }

    async function loadFaculty() {
        const dataList = facultyList;
        if (!dataList) return;
        dataList.innerHTML = '<p class="loading-message">Loading faculty...</p>';
        console.log('[loadFaculty] Fetching faculty...');
        try {
            // Corrected API endpoint to match server.js plural route
            const response = await authenticatedFetch('/api/facultys');
            const faculty = response.data;
            dataList.innerHTML = '';

            if (faculty.length === 0) {
                dataList.innerHTML = '<p class="no-data-message">No faculty members added yet.</p>';
                console.log('[loadFaculty] No faculty members found.');
                return;
            }
            faculty.forEach(item => {
                console.log(`[loadFaculty] Rendering item: ${item.name}, Image URL: ${item.imageUrl}`); // Added log
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
            console.log(`[loadFaculty] ${faculty.length} faculty members rendered.`);
        } catch (error) {
            dataList.innerHTML = '<p class="error-message">Failed to load faculty.</p>';
            console.error('[loadFaculty] Error loading faculty:', error);
        }
    }

    async function loadGallery() {
        const dataList = galleryList;
        if (!dataList) return;
        dataList.innerHTML = '<p class="loading-message">Loading gallery items...</p>';
        console.log('[loadGallery] Fetching gallery items...');
        try {
            // Corrected API endpoint to match server.js plural route
            const response = await authenticatedFetch('/api/gallerys');
            const galleryItems = response.data;
            dataList.innerHTML = '';

            if (galleryItems.length === 0) {
                dataList.innerHTML = '<p class="no-data-message">No gallery items added yet.</p>';
                console.log('[loadGallery] No gallery items found.');
                return;
            }
            galleryItems.forEach(item => {
                console.log(`[loadGallery] Rendering item: ${item.caption}, Image URL: ${item.imageUrl}`); // Added log
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
            console.log(`[loadGallery] ${galleryItems.length} gallery items rendered.`);
        } catch (error) {
            dataList.innerHTML = '<p class="error-message">Failed to load gallery items.</p>';
            console.error('[loadGallery] Error loading gallery items:', error);
        }
    }

    async function loadQuickLinks() {
        const dataList = quickLinksList;
        if (!dataList) return;
        dataList.innerHTML = '<p class="loading-message">Loading quick links...</p>';
        console.log('[loadQuickLinks] Fetching quick links...');
        try {
            const response = await authenticatedFetch('/api/quickLinks');
            const quickLinks = response.data;
            dataList.innerHTML = '';

            if (quickLinks.length === 0) {
                dataList.innerHTML = '<p class="no-data-message">No quick links added yet.</p>';
                console.log('[loadQuickLinks] No quick links found.');
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
            console.log(`[loadQuickLinks] ${quickLinks.length} quick links rendered.`);
        } catch (error) {
            dataList.innerHTML = '<p class="error-message">Failed to load quick links.</p>';
            console.error('[loadQuickLinks] Error loading quick links:', error);
        }
    }

    async function loadContactMessages() {
        const dataList = contactMessagesList;
        if (!dataList) {
            console.error('[loadContactMessages] contactMessagesList element not found.');
            return; // Guard clause
        }
        dataList.innerHTML = '<p class="loading-message">Loading contact messages...</p>';
        console.log('[loadContactMessages] Fetching contact messages...');
        try {
            const response = await authenticatedFetch('/api/contacts');
            const contacts = response.data;
            console.log('[loadContactMessages] Received contacts data:', contacts); // Log the received data
            dataList.innerHTML = '';

            if (contacts.length === 0) {
                dataList.innerHTML = '<p class="no-data-message">No contact messages received yet.</p>';
                console.log('[loadContactMessages] No contact messages found.');
                return;
            }
            contacts.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('data-item');
                // Encode subject and body for mailto link
                const emailSubject = encodeURIComponent(`Re: Inquiry from ${item.name}`);
                const emailBody = encodeURIComponent(`Dear ${item.name},\n\nRegarding your message:\n"${item.message}"\n\n`);

                itemDiv.innerHTML = `
                    <div class="item-details">
                        <div class="item-text">
                            <h3>From: ${item.name} (${item.email})</h3>
                            <p>Message: ${item.message}</p>
                            <p class="date">Received: ${new Date(item.submittedAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="item-actions">
                        <a href="mailto:${item.email}?subject=${emailSubject}&body=${emailBody}" class="btn btn-reply"><i class="fas fa-reply"></i> Reply</a>
                        <button class="delete-btn" data-id="${item._id}" data-type="contact"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                `;
                dataList.appendChild(itemDiv);
            });
            console.log(`[loadContactMessages] ${contacts.length} contact messages rendered.`);
        } catch (error) {
            dataList.innerHTML = '<p class="error-message">Failed to load contact messages.</p>';
            console.error('[loadContactMessages] Error loading contact messages:', error);
        }
    }

    // Removed openReplyModal, closeReplyModal, and sendReply functions as they are no longer needed.


    // --- Event Listeners ---

    // Login Form Submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;
        console.log('[Login] Attempting login...');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            console.log('[Login] Login API response:', data);

            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                showMessageBox('Login successful!', 'success');
                showAdminPanel();
                console.log('[Login] Login successful, showing admin panel.');
            } else {
                loginError.textContent = data.message || 'Login failed. Please try again.';
                showMessageBox('Login failed.', 'error');
                console.error('[Login] Login failed:', data.message);
            }
        } catch (error) {
            console.error('[Login] Login error:', error);
            loginError.textContent = 'An error occurred during login.';
            showMessageBox('An error occurred during login!', 'error');
        }
    });

    // Logout Button
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        showMessageBox('Logged out successfully.', 'info');
        showLogin();
        console.log('[Logout] User logged out.');
    });

    // Sidebar Navigation
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = event.currentTarget.dataset.section;
            console.log(`[Navigation] Navigating to section: ${sectionId}`);
            showSection(sectionId);
        });
    });

    // Dashboard Card Clickability
    document.querySelectorAll('.dashboard-card').forEach(card => {
        card.addEventListener('click', (event) => {
            const targetCard = event.target.closest('.dashboard-card');
            if (targetCard) {
                const sectionId = targetCard.dataset.targetSection;
                if (sectionId) {
                    console.log(`[Dashboard Card] Navigating to section via card: ${sectionId}`);
                    showSection(sectionId);
                }
            }
        });
    });


    // --- CRUD Form Submissions ---

    /**
     * Generic form submission handler for Add/Edit operations.
     * @param {Event} event - The form submit event.
     * @param {string} type - The type of item (e.g., 'program', 'newsEvent').
     * @param {HTMLFormElement} formElement - The form element being submitted.
     */
    async function handleFormSubmit(e, type, formElement) {
        e.preventDefault();
        const formData = new FormData(formElement);

        const imageInput = formElement.querySelector('input[type="file"]');
        const hasFile = imageInput && imageInput.files && imageInput.files.length > 0;

        let bodyToSend;
        let headersToSend = { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` };
        const id = formData.get('_id'); // Get ID from formData directly
        const isEditing = !!id; // Determine if it's an edit operation

        const requiresImageUpload = ['newsEvent', 'faculty', 'gallery'].includes(type);

        if (requiresImageUpload && hasFile) {
            // Step 1: Upload the image first
            const imageUploadFormData = new FormData();
            imageUploadFormData.append('image', imageInput.files[0]);

            try {
                const uploadResponse = await authenticatedFetch('/api/upload', {
                    method: 'POST',
                    body: imageUploadFormData,
                    // Do not set Content-Type for FormData; browser handles it
                    silent: true // Suppress default message box for this intermediate step
                });
                if (!uploadResponse.imageUrl) {
                    throw new Error('Image upload failed: No URL returned from server.');
                }
                // Add the uploaded image URL to the main form data
                formData.set('imageUrl', uploadResponse.imageUrl);
                console.log('[handleFormSubmit] Image uploaded successfully:', uploadResponse.imageUrl);

                // Now, prepare the main form data as JSON
                const data = {};
                formData.forEach((value, key) => {
                    // Exclude the original file input from the JSON payload
                    if (key !== imageInput.name) {
                        data[key] = value;
                    }
                });
                bodyToSend = JSON.stringify(data);
                headersToSend['Content-Type'] = 'application/json';
                console.log('[handleFormSubmit] Preparing JSON payload with new image URL. Data:', data);

            } catch (uploadError) {
                console.error('[handleFormSubmit] Image upload failed:', uploadError);
                showMessageBox(`Image upload failed: ${uploadError.message}`, 'error');
                return; // Stop the submission if image upload fails
            }

        } else {
            // If no new file, or for non-image forms, prepare JSON.
            const data = {};
            formData.forEach((value, key) => {
                // Exclude file input from JSON if no new file is selected, as its value would be an empty string
                // and we want to handle image URLs explicitly for existing images.
                if (imageInput && key === imageInput.name) {
                    // Skip the file input itself if no new file is selected.
                    return;
                }
                data[key] = value;
            });

            // For image-enabled forms (newsEvent, faculty, gallery), if no new file is uploaded:
            // 1. If editing and there's an existing image URL, retain it.
            // 2. If editing and the user cleared the image (no new file, no existing URL in dataset),
            //    explicitly send imageUrl as empty string to tell backend to clear it.
            const currentImageUrlElement = formElement.querySelector('.current-image-info'); // Use formElement to find the element
            const currentImageUrl = currentImageUrlElement ? currentImageUrlElement.dataset.currentUrl : null;

            if (requiresImageUpload) {
                if (isEditing) {
                    if (currentImageUrl) {
                        // Retain existing image URL if no new file and it existed
                        data.imageUrl = currentImageUrl;
                        console.log('[handleFormSubmit] Retaining existing image URL in JSON.');
                    } else if (currentImageUrlElement && currentImageUrlElement.textContent === '') {
                        // If image was cleared by user (no current URL, no new file)
                        data.imageUrl = ''; // Explicitly tell backend to remove image
                        console.log('[handleFormSubmit] Explicitly clearing image URL in JSON.');
                    }
                } else if (!hasFile) {
                    // For new items requiring an image, if no file is provided, this should have been caught earlier.
                    // This path should ideally not be reached if the frontend validation for required images is strong.
                    // However, for robustness, we ensure imageUrl is not undefined if required.
                    if (requiresImageUpload) {
                        data.imageUrl = ''; // Send empty string if required but no file
                    }
                }
            }
            
            // Ensure _id is included for PUT requests when sending JSON
            // For new items, _id should NOT be set, so the `id` variable being empty string is fine.
            // MongoDB will generate a new _id automatically.
            if (isEditing && id) {
                data._id = id;
            }

            bodyToSend = JSON.stringify(data);
            headersToSend['Content-Type'] = 'application/json';
            console.log('[handleFormSubmit] Preparing JSON payload without file. Data:', data);
        }

        try {
            let response;
            // Ensure the API path is pluralized correctly for all types
            const apiPath = `/api/${type}s${id ? '/' + id : ''}`;
            const method = id ? 'PUT' : 'POST';

            console.log(`[handleFormSubmit] Sending ${method} request to ${apiPath}. Body type: ${bodyToSend instanceof FormData ? 'FormData' : 'JSON'}`);

            response = await authenticatedFetch(apiPath, {
                method: method,
                headers: headersToSend, // Pass the constructed headers
                body: bodyToSend,
                silent: true // Suppress authenticatedFetch's default message box, handle here
            });

            // Check response.ok for success, as authenticatedFetch now throws on !response.ok
            if (response) { // If response is not null (meaning no error was thrown by authenticatedFetch)
                showMessageBox(response.message || `${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`, 'success');
                formElement.reset();
                formElement.closest('.form-container').classList.add('hidden'); // Corrected selector
                currentEditing[type] = null;

                // Clear file input display name and current image URL display
                const imageInput = formElement.querySelector('input[type="file"]');
                if (imageInput) {
                    const fileNameDisplay = imageInput.closest('.form-group').querySelector('.file-name-display');
                    if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen';
                    imageInput.value = ''; // Clear the actual file input
                }
                const currentImageUrlElement = formElement.querySelector('.current-image-info');
                if (currentImageUrlElement) {
                    currentImageUrlElement.textContent = '';
                    currentImageUrlElement.dataset.currentUrl = '';
                }

                console.log(`[handleFormSubmit] ${type} saved successfully. Reloading data...`);
                await loadAllData(); // Reload data for all relevant sections
                await loadDashboardCounts(); // Update dashboard counts
                console.log(`[handleFormSubmit] Data reloaded after ${type} save.`);
            }
        } catch (error) {
            // Error message already shown by authenticatedFetch due to silent: false (default) or explicit showMessageBox
            console.error(`[handleFormSubmit] Failed to save ${type}:`, error);
            // showMessageBox(`Failed to save ${type}.`, 'error'); // Avoid double message
        }
    }


    // Program Form
    if (programForm) {
        programForm.addEventListener('submit', (event) => {
            handleFormSubmit(event, 'program', programForm);
        });
        document.getElementById('cancel-program-edit').addEventListener('click', () => {
            programForm.reset();
            programForm.closest('.form-container').classList.add('hidden');
            currentEditing.program = null;
            console.log('[Program Form] Edit cancelled.');
        });
    }


    // News & Event Form
    if (newsEventForm) {
        newsEventForm.addEventListener('submit', (event) => {
            // Corrected call: pass idFieldId and imageUrlDisplayId
            handleFormSubmit(event, 'newsEvent', newsEventForm);
        });
        document.getElementById('cancel-news-event-edit').addEventListener('click', () => {
            newsEventForm.reset();
            newsEventForm.closest('.form-container').classList.add('hidden');
            currentEditing.newsEvent = null;
            document.getElementById('current-news-event-image-url').textContent = '';
            document.getElementById('news-event-image').value = ''; // Clear file input
            const fileNameDisplay = newsEventForm.querySelector('.file-name-display');
            if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen';
            console.log('[News Event Form] Edit cancelled.');
        });
    }

    // Testimonial Form
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', (event) => {
            handleFormSubmit(event, 'testimonial', testimonialForm);
        });
        document.getElementById('cancel-testimonial-edit').addEventListener('click', () => {
            testimonialForm.reset();
            testimonialForm.closest('.form-container').classList.add('hidden');
            currentEditing.testimonial = null;
            console.log('[Testimonial Form] Edit cancelled.');
        });
    }

    // Faculty Form
    if (facultyForm) {
        facultyForm.addEventListener('submit', (event) => {
            // Corrected call: pass idFieldId and imageUrlDisplayId
            handleFormSubmit(event, 'faculty', facultyForm);
        });
        document.getElementById('cancel-faculty-edit').addEventListener('click', () => {
            facultyForm.reset();
            facultyForm.closest('.form-container').classList.add('hidden');
            currentEditing.faculty = null;
            document.getElementById('current-faculty-image-url').textContent = '';
            document.getElementById('faculty-image').value = ''; // Clear file input
            const fileNameDisplay = facultyForm.querySelector('.file-name-display');
            if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen';
            console.log('[Faculty Form] Edit cancelled.');
        });
    }

    // Gallery Form
    if (galleryForm) {
        galleryForm.addEventListener('submit', (event) => {
            // Corrected call: pass idFieldId and imageUrlDisplayId
            handleFormSubmit(event, 'gallery', galleryForm);
        });
        document.getElementById('cancel-gallery-edit').addEventListener('click', () => {
            galleryForm.reset();
            galleryForm.closest('.form-container').classList.add('hidden');
            currentEditing.gallery = null;
            document.getElementById('current-gallery-image-url').textContent = '';
            document.getElementById('gallery-image').value = ''; // Clear file input
            const fileNameDisplay = galleryForm.querySelector('.file-name-display');
            if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen';
            console.log('[Gallery Form] Edit cancelled.');
        });
    }

    // Quick Link Form
    if (quickLinkForm) {
        quickLinkForm.addEventListener('submit', (event) => {
            handleFormSubmit(event, 'quickLink', quickLinkForm);
        });
        document.getElementById('cancel-quick-link-edit').addEventListener('click', () => {
            quickLinkForm.reset();
            quickLinkForm.closest('.form-container').classList.add('hidden');
            currentEditing.quickLink = null;
            console.log('[Quick Link Form] Edit cancelled.');
        });
    }


    // --- Edit and Delete Button Delegation ---
    document.addEventListener('click', async (event) => {
        // Handle Edit
        if (event.target.classList.contains('edit-btn') || event.target.closest('.edit-btn')) {
            const btn = event.target.closest('.edit-btn');
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            console.log(`[Edit Button] Clicked edit for ${type} with ID: ${id}`);

            // Hide all forms first
            resetForms(); // Use the unified resetForms function

            try {
                // Ensure the API path is pluralized for fetching single items too
                const response = await authenticatedFetch(`/api/${type}s/${id}`);
                const item = response.data;

                if (!item) {
                    showMessageBox('Item not found for editing.', 'error');
                    console.error(`[Edit Button] Item not found for ${type} with ID: ${id}`);
                    return;
                }

                currentEditing[type] = id; // Store ID of item being edited
                console.log(`[Edit Button] Fetched item for editing:`, item);

                let formToPopulate;
                let idFieldElement;
                let imageUrlDisplayElement;
                let fileNameDisplayElement;

                switch (type) {
                    case 'program':
                        formToPopulate = programForm;
                        idFieldElement = document.getElementById('program-id');
                        if (formToPopulate) { // Ensure form exists before accessing elements
                            formToPopulate.querySelector('#program-title').value = item.title || '';
                            formToPopulate.querySelector('#program-description').value = item.description || '';
                            formToPopulate.querySelector('#program-icon-svg').value = item.iconSvg || '';
                        }
                        break;
                    case 'newsEvent':
                        formToPopulate = newsEventForm;
                        idFieldElement = document.getElementById('news-event-id');
                        imageUrlDisplayElement = document.getElementById('current-news-event-image-url');
                        fileNameDisplayElement = formToPopulate ? formToPopulate.querySelector('.file-name-display') : null;

                        if (formToPopulate) {
                            formToPopulate.querySelector('#news-event-title').value = item.title || '';
                            formToPopulate.querySelector('#news-event-date').value = item.date || '';
                            formToPopulate.querySelector('#news-event-description').value = item.description || '';
                            formToPopulate.querySelector('#news-event-link').value = item.link || '';
                            formToPopulate.querySelector('#news-event-icon-svg').value = item.iconSvg || '';
                        }

                        if (item.imageUrl && imageUrlDisplayElement) {
                            imageUrlDisplayElement.textContent = `Current Image: ${item.imageUrl.split('/').pop().split('?')[0]}`;
                            imageUrlDisplayElement.dataset.currentUrl = item.imageUrl;
                            if (fileNameDisplayElement) fileNameDisplayElement.textContent = item.imageUrl.split('/').pop().split('?')[0];
                        } else if (imageUrlDisplayElement) {
                            imageUrlDisplayElement.textContent = '';
                            imageUrlDisplayElement.dataset.currentUrl = '';
                            if (fileNameDisplayElement) fileNameDisplayElement.textContent = 'No file chosen';
                        }
                        break;
                    case 'testimonial':
                        formToPopulate = testimonialForm;
                        idFieldElement = document.getElementById('testimonial-id');
                        if (formToPopulate) {
                            formToPopulate.querySelector('#testimonial-quote').value = item.quote || '';
                            formToPopulate.querySelector('#testimonial-author').value = item.author || '';
                            formToPopulate.querySelector('#testimonial-role').value = item.role || '';
                            formToPopulate.querySelector('#testimonial-icon-svg').value = item.iconSvg || '';
                        }
                        break;
                    case 'faculty':
                        formToPopulate = facultyForm;
                        idFieldElement = document.getElementById('faculty-id');
                        imageUrlDisplayElement = document.getElementById('current-faculty-image-url');
                        fileNameDisplayElement = formToPopulate ? formToPopulate.querySelector('.file-name-display') : null;

                        if (formToPopulate) {
                            formToPopulate.querySelector('#faculty-name').value = item.name || '';
                            formToPopulate.querySelector('#faculty-role').value = item.role || '';
                            formToPopulate.querySelector('#faculty-description').value = item.description || '';
                        }

                        if (item.imageUrl && imageUrlDisplayElement) {
                            imageUrlDisplayElement.textContent = `Current Image: ${item.imageUrl.split('/').pop().split('?')[0]}`;
                            imageUrlDisplayElement.dataset.currentUrl = item.imageUrl;
                            if (fileNameDisplayElement) fileNameDisplayElement.textContent = item.imageUrl.split('/').pop().split('?')[0];
                        } else if (imageUrlDisplayElement) {
                            imageUrlDisplayElement.textContent = '';
                            imageUrlDisplayElement.dataset.currentUrl = '';
                            if (fileNameDisplayElement) fileNameDisplayElement.textContent = 'No file chosen';
                        }
                        break;
                    case 'gallery':
                        formToPopulate = galleryForm;
                        idFieldElement = document.getElementById('gallery-id');
                        imageUrlDisplayElement = document.getElementById('current-gallery-image-url');
                        fileNameDisplayElement = formToPopulate ? formToPopulate.querySelector('.file-name-display') : null;

                        if (formToPopulate) {
                            formToPopulate.querySelector('#gallery-caption').value = item.caption || '';
                        }

                        if (item.imageUrl && imageUrlDisplayElement) {
                            imageUrlDisplayElement.textContent = `Current Image: ${item.imageUrl.split('/').pop().split('?')[0]}`;
                            imageUrlDisplayElement.dataset.currentUrl = item.imageUrl;
                            if (fileNameDisplayElement) fileNameDisplayElement.textContent = item.imageUrl.split('/').pop().split('?')[0];
                        } else if (imageUrlDisplayElement) {
                            imageUrlDisplayElement.textContent = '';
                            imageUrlDisplayElement.dataset.currentUrl = '';
                            if (fileNameDisplayElement) fileNameDisplayElement.textContent = 'No file chosen';
                        }
                        break;
                    case 'quickLink':
                        formToPopulate = quickLinkForm;
                        idFieldElement = document.getElementById('quick-link-id');
                        if (formToPopulate) {
                            formToPopulate.querySelector('#quick-link-title').value = item.title || '';
                            formToPopulate.querySelector('#quick-link-description').value = item.description || '';
                            formToPopulate.querySelector('#quick-link-url').value = item.url || '';
                            formToPopulate.querySelector('#quick-link-icon-svg').value = item.iconSvg || '';
                        }
                        break;
                    default:
                        console.warn('[Edit Button] Unknown item type for edit:', type);
                        return;
                }
                if (idFieldElement) idFieldElement.value = id;
                if (formToPopulate) {
                    formToPopulate.closest('.form-container').classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    console.log(`[Edit Button] Form for ${type} populated and shown.`);
                } else {
                    console.error(`[Edit Button] Form element for type ${type} not found.`);
                    showMessageBox('Error: Form not found for editing.', 'error');
                }
            } catch (error) {
                console.error('[Edit Button] Failed to fetch item for edit:', error);
                showMessageBox('Failed to load item for editing.', 'error');
            }
        }

        // Handle Delete
        if (event.target.classList.contains('delete-btn') || event.target.closest('.delete-btn')) {
            const btn = event.target.closest('.delete-btn');
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            console.log(`[Delete Button] Clicked delete for ${type} with ID: ${id}`);

            // --- Client-side validation for MongoDB ObjectId format ---
            // A valid MongoDB ObjectId is a 24-character hexadecimal string.
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!id || !objectIdRegex.test(id)) {
                console.error(`[Delete Button] Invalid ID format for deletion: ${id}`);
                showMessageBox('Error: Invalid item ID for deletion. Please refresh the page.', 'error');
                return; // Stop the deletion process
            }
            // --- End client-side validation ---

            // Show a real confirmation modal and wait for user input
            const userConfirmed = await showConfirmationModal(`Are you sure you want to delete this ${type}? This action cannot be undone.`);

            if (!userConfirmed) {
                console.log('[Delete Button] Deletion cancelled by user (or auto-cancel).');
                return;
            }

            try {
                // Ensure the API path is pluralized for deletion too
                const response = await authenticatedFetch(`/api/${type}s/${id}`, {
                    method: 'DELETE'
                });
                console.log(`[Delete Button] API response for ${type} deletion:`, response);
                if (response) { // Check response existence for success
                    showMessageBox(response.message || 'Item deleted successfully!', 'success');                console.log(`[Delete Button] ${type} deleted successfully. Reloading data...`);
                    await loadAllData();
                    await loadDashboardCounts();
                    console.log(`[Delete Button] Data reloaded after ${type} deletion.`);
                } else {
                    // This block might not be reached if authenticatedFetch throws on !response.ok
                    const errorData = await response.json(); // Try to parse error message
                    showMessageBox('Deletion failed: ' + (errorData.message || 'Unknown error'), 'error');
                    console.error(`[Delete Button] ${type} deletion failed:`, errorData.message);
                }
            } catch (error) {
                console.error(`[Delete Button] Error deleting ${type}:`, error);
                showMessageBox(`Failed to delete ${type}.`, 'error');
            }
        }
        // Removed the reply button click handler as it's now a direct mailto link
        // else if (event.target.classList.contains('btn-reply') || event.target.closest('.btn-reply')) {
        //     const btn = event.target.closest('.btn-reply');
        //     const contactId = btn.dataset.id;
        //     const contactEmail = btn.dataset.email;
        //     const contactName = btn.dataset.name;
        //     console.log(`[Reply Button] Clicked reply for contact ID: ${contactId}, Email: ${contactEmail}`);
        //     openReplyModal(contactId, contactEmail, contactName);
        // }
    });

    // --- Add New Item Buttons ---
    document.querySelectorAll('.admin-section').forEach(section => {
        const addBtn = section.querySelector('.add-new-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const formContainer = section.querySelector('.form-container'); // Corrected selector
                if (formContainer) {
                    console.log('[Add New Button] Clicked. Resetting forms and showing new form.');
                    resetForms(); // Reset all forms first
                    formContainer.classList.remove('hidden'); // Show specific form
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    });

    // File input change listener to display file name
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            const fileNameDisplay = this.closest('.form-group').querySelector('.file-name-display');
            if (fileNameDisplay) {
                if (this.files.length > 0) {
                    fileNameDisplay.textContent = this.files[0].name;
                    console.log(`[File Input] Selected file: ${this.files[0].name}`);
                } else {
                    fileNameDisplay.textContent = 'No file chosen';
                    console.log('[File Input] No file chosen.');
                }
            }
        });
    });

    // Removed reply form submission and close modal event listeners
    // if (replyForm) {
    //     replyForm.addEventListener('submit', sendReply);
    // }
    // if (closeModalButton) {
    //     closeModalButton.addEventListener('click', closeReplyModal);
    // }
    // window.addEventListener('click', (event) => {
    //     if (event.target === replyModal) {
    //         closeReplyModal();
    //     }
    // });


    // Initial check for authentication token
    if (localStorage.getItem('adminToken')) {
        console.log('[DOMContentLoaded] Admin token found, showing admin panel.');
        showAdminPanel();
    } else {
        console.log('[DOMContentLoaded] No admin token found, showing login page.');
        showLogin();
    }
});
