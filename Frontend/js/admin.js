let programsData = [];
let newsEventsData = [];
let testimonialsData = [];
let facultyData = [];
let galleryData = [];
let quickLinksData = [];

// --- username & pass ---
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';
/**
 * Loads all data from localStorage.
 */
function loadAllData() {
    try {
        programsData = JSON.parse(localStorage.getItem('programsData')) || [];
        newsEventsData = JSON.parse(localStorage.getItem('newsEventsData')) || [];
        testimonialsData = JSON.parse(localStorage.getItem('testimonialsData')) || [];
        facultyData = JSON.parse(localStorage.getItem('facultyData')) || [];
        galleryData = JSON.parse(localStorage.getItem('galleryData')) || [];
        quickLinksData = JSON.parse(localStorage.getItem('quickLinksData')) || [];
    } catch (e) {
        console.error("Error loading data from localStorage:", e);
        programsData = [];
        newsEventsData = [];
        testimonialsData = [];
        facultyData = [];
        galleryData = [];
        quickLinksData = [];
    }
}

function saveAllData() {
    localStorage.setItem('programsData', JSON.stringify(programsData));
    localStorage.setItem('newsEventsData', JSON.stringify(newsEventsData));
    localStorage.setItem('testimonialsData', JSON.stringify(testimonialsData));
    localStorage.setItem('facultyData', JSON.stringify(facultyData));
    localStorage.setItem('galleryData', JSON.stringify(galleryData));
    localStorage.setItem('quickLinksData', JSON.stringify(quickLinksData));
}

// --- Authentication ---

const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const logoutBtn = document.getElementById('logoutBtn');
const loginMessage = document.getElementById('loginMessage');

/**
 * Handles user login.
 * @param {Event} event - The form submission event.
 */
function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (usernameInput.value === ADMIN_USERNAME && passwordInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('loggedIn', 'true');
        showDashboard();
    } else {
        loginMessage.textContent = 'Invalid username or password.';
        loginMessage.style.display = 'block';
    }
}

/**
 * Handles user logout.
 */
function handleLogout() {
    sessionStorage.removeItem('loggedIn');
    hideDashboard();
}

/**
 * Shows the admin dashboard and hides the login section.
 */
function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'flex'; // Use flex for dashboard layout
    logoutBtn.style.display = 'block';
    loginMessage.style.display = 'none'; // Hide any previous error messages
    renderAllManagementTables(); // Render all data tables on login
    activateSidebarLink('programs'); // Activate default section
}

/**
 * Hides the admin dashboard and shows the login section.
 */
function hideDashboard() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    logoutBtn.style.display = 'none';
    // Clear login form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// --- Sidebar Navigation ---

const sidebarLinks = document.querySelectorAll('.sidebar-link');
const managementSections = document.querySelectorAll('.management-section');

/**
 * Activates a specific sidebar link and displays its corresponding management section.
 * @param {string} sectionId - The ID of the section to activate (e.g., 'programs', 'news').
 */
function activateSidebarLink(sectionId) {
    // Deactivate all links and hide all sections
    sidebarLinks.forEach(link => link.classList.remove('active'));
    managementSections.forEach(section => section.classList.remove('active-management-section'));

    // Activate the clicked link and show its section
    const activeLink = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
    const activeSection = document.getElementById(`${sectionId}-management`);

    if (activeLink) activeLink.classList.add('active');
    if (activeSection) activeSection.classList.add('active-management-section');
}

/**
 * Handles sidebar link clicks.
 * @param {Event} event - The click event.
 */
function handleSidebarClick(event) {
    event.preventDefault();
    const sectionId = event.target.dataset.section;
    if (sectionId) {
        activateSidebarLink(sectionId);
    }
}

// --- Data Management (CRUD) Functions ---

/**
 * Renders all management tables.
 */
function renderAllManagementTables() {
    renderProgramsTable();
    renderNewsTable();
    renderTestimonialsTable();
    renderFacultyTable();
    renderGalleryTable();
    renderQuickLinksTable();
}

/**
 * Clears the form fields for a given data type.
 * @param {string} type - The type of form to clear (e.g., 'program', 'news').
 */
function clearForm(type) {
    const form = document.getElementById(`${type}Form`);
    if (form) {
        form.reset();
        document.getElementById(`${type}Index`).value = ''; // Clear hidden index
    }
}

// --- Academic Programs CRUD ---

const programForm = document.getElementById('programForm');
const programsTableBody = document.getElementById('programsTableBody');

/**
 * Renders the academic programs table.
 */
function renderProgramsTable() {
    programsTableBody.innerHTML = '';
    programsData.forEach((program, index) => {
        const row = programsTableBody.insertRow();
        row.innerHTML = `
            <td>${program.title}</td>
            <td>${program.description}</td>
            <td>
                <button class="admin-button edit-button" onclick="editProgram(${index})">Edit</button>
                <button class="admin-button delete-button" onclick="deleteProgram(${index})">Delete</button>
            </td>
        `;
    });
}

/**
 * Handles program form submission (add/edit).
 * @param {Event} event - The form submission event.
 */
function handleProgramSubmit(event) {
    event.preventDefault();
    const index = document.getElementById('programIndex').value;
    const title = document.getElementById('programTitle').value;
    const description = document.getElementById('programDescription').value;
    const iconSvg = document.getElementById('programIconSvg').value;

    const newProgram = { title, description, iconSvg };

    if (index === '') {
        // Add new program
        programsData.push(newProgram);
    } else {
        // Edit existing program
        programsData[parseInt(index)] = newProgram;
    }
    saveAllData();
    renderProgramsTable();
    clearForm('program');
}

/**
 * Populates the program form for editing.
 * @param {number} index - The index of the program to edit.
 */
function editProgram(index) {
    const program = programsData[index];
    document.getElementById('programIndex').value = index;
    document.getElementById('programTitle').value = program.title;
    document.getElementById('programDescription').value = program.description;
    document.getElementById('programIconSvg').value = program.iconSvg;
}

/**
 * Deletes an academic program.
 * @param {number} index - The index of the program to delete.
 */
function deleteProgram(index) {
    if (confirm('Are you sure you want to delete this program?')) {
        programsData.splice(index, 1);
        saveAllData();
        renderProgramsTable();
        clearForm('program');
    }
}

// --- News & Events CRUD ---

const newsForm = document.getElementById('newsForm');
const newsTableBody = document.getElementById('newsTableBody');

/**
 * Renders the news & events table.
 */
function renderNewsTable() {
    newsTableBody.innerHTML = '';
    newsEventsData.forEach((item, index) => {
        const row = newsTableBody.insertRow();
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.date}</td>
            <td>
                <button class="admin-button edit-button" onclick="editNews(${index})">Edit</button>
                <button class="admin-button delete-button" onclick="deleteNews(${index})">Delete</button>
            </td>
        `;
    });
}

/**
 * Handles news form submission (add/edit).
 * @param {Event} event - The form submission event.
 */
function handleNewsSubmit(event) {
    event.preventDefault();
    const index = document.getElementById('newsIndex').value;
    const title = document.getElementById('newsTitle').value;
    const date = document.getElementById('newsDate').value;
    const description = document.getElementById('newsDescription').value;
    const link = document.getElementById('newsLink').value;
    const iconSvg = document.getElementById('newsIconSvg').value;

    const newItem = { title, date, description, link, iconSvg };

    if (index === '') {
        newsEventsData.push(newItem);
    } else {
        newsEventsData[parseInt(index)] = newItem;
    }
    saveAllData();
    renderNewsTable();
    clearForm('news');
}

/**
 * Populates the news form for editing.
 * @param {number} index - The index of the news item to edit.
 */
function editNews(index) {
    const item = newsEventsData[index];
    document.getElementById('newsIndex').value = index;
    document.getElementById('newsTitle').value = item.title;
    document.getElementById('newsDate').value = item.date;
    document.getElementById('newsDescription').value = item.description;
    document.getElementById('newsLink').value = item.link;
    document.getElementById('newsIconSvg').value = item.iconSvg;
}

/**
 * Deletes a news item.
 * @param {number} index - The index of the news item to delete.
 */
function deleteNews(index) {
    if (confirm('Are you sure you want to delete this news item?')) {
        newsEventsData.splice(index, 1);
        saveAllData();
        renderNewsTable();
        clearForm('news');
    }
}

// --- Testimonials CRUD ---

const testimonialForm = document.getElementById('testimonialForm');
const testimonialsTableBody = document.getElementById('testimonialsTableBody');

/**
 * Renders the testimonials table.
 */
function renderTestimonialsTable() {
    testimonialsTableBody.innerHTML = '';
    testimonialsData.forEach((item, index) => {
        const row = testimonialsTableBody.insertRow();
        row.innerHTML = `
            <td>${item.author}</td>
            <td>${item.quote.substring(0, 50)}...</td>
            <td>
                <button class="admin-button edit-button" onclick="editTestimonial(${index})">Edit</button>
                <button class="admin-button delete-button" onclick="deleteTestimonial(${index})">Delete</button>
            </td>
        `;
    });
}

/**
 * Handles testimonial form submission (add/edit).
 * @param {Event} event - The form submission event.
 */
function handleTestimonialSubmit(event) {
    event.preventDefault();
    const index = document.getElementById('testimonialIndex').value;
    const quote = document.getElementById('testimonialQuote').value;
    const author = document.getElementById('testimonialAuthor').value;
    const role = document.getElementById('testimonialRole').value;
    const iconSvg = document.getElementById('testimonialIconSvg').value;

    const newItem = { quote, author, role, iconSvg };

    if (index === '') {
        testimonialsData.push(newItem);
    } else {
        testimonialsData[parseInt(index)] = newItem;
    }
    saveAllData();
    renderTestimonialsTable();
    clearForm('testimonial');
}

/**
 * Populates the testimonial form for editing.
 * @param {number} index - The index of the testimonial to edit.
 */
function editTestimonial(index) {
    const item = testimonialsData[index];
    document.getElementById('testimonialIndex').value = index;
    document.getElementById('testimonialQuote').value = item.quote;
    document.getElementById('testimonialAuthor').value = item.author;
    document.getElementById('testimonialRole').value = item.role;
    document.getElementById('testimonialIconSvg').value = item.iconSvg;
}

/**
 * Deletes a testimonial.
 * @param {number} index - The index of the testimonial to delete.
 */
function deleteTestimonial(index) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
        testimonialsData.splice(index, 1);
        saveAllData();
        renderTestimonialsTable();
        clearForm('testimonial');
    }
}

// --- Faculty CRUD ---

const facultyForm = document.getElementById('facultyForm');
const facultyTableBody = document.getElementById('facultyTableBody');

/**
 * Renders the faculty table.
 */
function renderFacultyTable() {
    facultyTableBody.innerHTML = '';
    facultyData.forEach((item, index) => {
        const row = facultyTableBody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.role}</td>
            <td>
                <button class="admin-button edit-button" onclick="editFaculty(${index})">Edit</button>
                <button class="admin-button delete-button" onclick="deleteFaculty(${index})">Delete</button>
            </td>
        `;
    });
}

/**
 * Handles faculty form submission (add/edit).
 * @param {Event} event - The form submission event.
 */
function handleFacultySubmit(event) {
    event.preventDefault();
    const index = document.getElementById('facultyIndex').value;
    const name = document.getElementById('facultyName').value;
    const role = document.getElementById('facultyRole').value;
    const description = document.getElementById('facultyDescription').value;
    const imageUrl = document.getElementById('facultyImageUrl').value;

    const newItem = { name, role, description, imageUrl };

    if (index === '') {
        facultyData.push(newItem);
    } else {
        facultyData[parseInt(index)] = newItem;
    }
    saveAllData();
    renderFacultyTable();
    clearForm('faculty');
}

/**
 * Populates the faculty form for editing.
 * @param {number} index - The index of the faculty member to edit.
 */
function editFaculty(index) {
    const item = facultyData[index];
    document.getElementById('facultyIndex').value = index;
    document.getElementById('facultyName').value = item.name;
    document.getElementById('facultyRole').value = item.role;
    document.getElementById('facultyDescription').value = item.description;
    document.getElementById('facultyImageUrl').value = item.imageUrl;
}

/**
 * Deletes a faculty member.
 * @param {number} index - The index of the faculty member to delete.
 */
function deleteFaculty(index) {
    if (confirm('Are you sure you want to delete this faculty member?')) {
        facultyData.splice(index, 1);
        saveAllData();
        renderFacultyTable();
        clearForm('faculty');
    }
}

// --- Gallery CRUD ---

const galleryForm = document.getElementById('galleryForm');
const galleryTableBody = document.getElementById('galleryTableBody');

/**
 * Renders the gallery table.
 */
function renderGalleryTable() {
    galleryTableBody.innerHTML = '';
    galleryData.forEach((item, index) => {
        const row = galleryTableBody.insertRow();
        row.innerHTML = `
            <td>${item.caption}</td>
            <td><img src="${item.imageUrl}" alt="${item.caption}" style="width: 50px; height: 50px; object-fit: cover;"></td>
            <td>
                <button class="admin-button edit-button" onclick="editGallery(${index})">Edit</button>
                <button class="admin-button delete-button" onclick="deleteGallery(${index})">Delete</button>
            </td>
        `;
    });
}

/**
 * Handles gallery form submission (add/edit).
 * @param {Event} event - The form submission event.
 */
function handleGallerySubmit(event) {
    event.preventDefault();
    const index = document.getElementById('galleryIndex').value;
    const caption = document.getElementById('galleryCaption').value;
    const imageUrl = document.getElementById('galleryImageUrl').value;

    const newItem = { caption, imageUrl };

    if (index === '') {
        galleryData.push(newItem);
    } else {
        galleryData[parseInt(index)] = newItem;
    }
    saveAllData();
    renderGalleryTable();
    clearForm('gallery');
}

/**
 * Populates the gallery form for editing.
 * @param {number} index - The index of the gallery item to edit.
 */
function editGallery(index) {
    const item = galleryData[index];
    document.getElementById('galleryIndex').value = index;
    document.getElementById('galleryCaption').value = item.caption;
    document.getElementById('galleryImageUrl').value = item.imageUrl;
}

/**
 * Deletes a gallery item.
 * @param {number} index - The index of the gallery item to delete.
 */
function deleteGallery(index) {
    if (confirm('Are you sure you want to delete this gallery item?')) {
        galleryData.splice(index, 1);
        saveAllData();
        renderGalleryTable();
        clearForm('gallery');
    }
}

// --- Quick Links CRUD ---

const quickLinkForm = document.getElementById('quickLinkForm');
const quickLinksTableBody = document.getElementById('quickLinksTableBody');

/**
 * Renders the quick links table.
 */
function renderQuickLinksTable() {
    quickLinksTableBody.innerHTML = '';
    quickLinksData.forEach((item, index) => {
        const row = quickLinksTableBody.insertRow();
        row.innerHTML = `
            <td>${item.title}</td>
            <td><a href="${item.link}" target="_blank">${item.link}</a></td>
            <td>
                <button class="admin-button edit-button" onclick="editQuickLink(${index})">Edit</button>
                <button class="admin-button delete-button" onclick="deleteQuickLink(${index})">Delete</button>
            </td>
        `;
    });
}

/**
 * Handles quick link form submission (add/edit).
 * @param {Event} event - The form submission event.
 */
function handleQuickLinkSubmit(event) {
    event.preventDefault();
    const index = document.getElementById('quickLinkIndex').value;
    const title = document.getElementById('quickLinkTitle').value;
    const description = document.getElementById('quickLinkDescription').value;
    const link = document.getElementById('quickLinkUrl').value;
    const iconSvg = document.getElementById('quickLinkIconSvg').value;

    const newItem = { title, description, link, iconSvg };

    if (index === '') {
        quickLinksData.push(newItem);
    } else {
        quickLinksData[parseInt(index)] = newItem;
    }
    saveAllData();
    renderQuickLinksTable();
    clearForm('quickLink');
}

/**
 * Populates the quick link form for editing.
 * @param {number} index - The index of the quick link to edit.
 */
function editQuickLink(index) {
    const item = quickLinksData[index];
    document.getElementById('quickLinkIndex').value = index;
    document.getElementById('quickLinkTitle').value = item.title;
    document.getElementById('quickLinkDescription').value = item.description;
    document.getElementById('quickLinkUrl').value = item.link;
    document.getElementById('quickLinkIconSvg').value = item.iconSvg;
}

/**
 * Deletes a quick link.
 * @param {number} index - The index of the quick link to delete.
 */
function deleteQuickLink(index) {
    if (confirm('Are you sure you want to delete this quick link?')) {
        quickLinksData.splice(index, 1);
        saveAllData();
        renderQuickLinksTable();
        clearForm('quickLink');
    }
}


// --- Event Listeners and Initial Load ---

document.addEventListener('DOMContentLoaded', () => {
    loadAllData(); // Load data when the page loads

    // Set up form submission listeners
    programForm.addEventListener('submit', handleProgramSubmit);
    newsForm.addEventListener('submit', handleNewsSubmit);
    testimonialForm.addEventListener('submit', handleTestimonialSubmit);
    facultyForm.addEventListener('submit', handleFacultySubmit);
    galleryForm.addEventListener('submit', handleGallerySubmit);
    quickLinkForm.addEventListener('submit', handleQuickLinkSubmit);

    // Set up login/logout listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    // Set up sidebar navigation listeners
    sidebarLinks.forEach(link => {
        link.addEventListener('click', handleSidebarClick);
    });

    // Check login status on page load
    if (sessionStorage.getItem('loggedIn') === 'true') {
        showDashboard();
    } else {
        hideDashboard();
    }
});
