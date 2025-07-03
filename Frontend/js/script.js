// --- Navigation Menu Toggle ---
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');
}

// --- Card Expansion Logic ---
function expandCard(button) {
    const card = button.closest('.card');
    card.classList.toggle('expanded');
    const moreInfo = card.querySelector('.more-info');
    if (card.classList.contains('expanded')) {
        button.querySelector('span').textContent = 'View less';
    } else {
        button.querySelector('span').textContent = 'View more';
    }
}

// --- Image Slider Logic ---
let slideIndex = 0;
function showSlides() {
    const slides = document.getElementById('slider');
    if (!slides) return; // Exit if slider element not found

    const images = slides.getElementsByTagName('img');
    if (images.length === 0) return; // Exit if no images

    slideIndex++;
    if (slideIndex >= images.length) {
        slideIndex = 0;
    }
    slides.style.transform = `translateX(${-slideIndex * 100}%)`;
    setTimeout(showSlides, 3000); // Change image every 3 seconds
}

// --- Data Loading from localStorage ---
// These arrays will now be populated from localStorage
let programsData = [];
let newsEventsData = [];
let testimonialsData = [];
let facultyData = [];
let galleryData = [];
let quickLinksData = [];

/**
 * Loads all data from localStorage for the frontend.
 */
function loadFrontendData() {
    console.log("Attempting to load data from localStorage...");
    try {
        programsData = JSON.parse(localStorage.getItem('programsData')) || [];
        newsEventsData = JSON.parse(localStorage.getItem('newsEventsData')) || [];
        testimonialsData = JSON.parse(localStorage.getItem('testimonialsData')) || [];
        facultyData = JSON.parse(localStorage.getItem('facultyData')) || [];
        galleryData = JSON.parse(localStorage.getItem('galleryData')) || [];
        quickLinksData = JSON.parse(localStorage.getItem('quickLinksData')) || [];

        console.log("Data loaded from localStorage:");
        console.log("Programs:", programsData);
        console.log("News Events:", newsEventsData);
        console.log("Testimonials:", testimonialsData);
        console.log("Faculty:", facultyData);
        console.log("Gallery:", galleryData);
        console.log("Quick Links:", quickLinksData);

        // If localStorage is empty (first load), populate with initial data
        // This block will only run if localStorage is completely empty for a given key.
        // If you've added data via admin panel, these checks will likely be false.
        if (programsData.length === 0) {
            console.log("Programs data empty in localStorage, populating with defaults.");
            programsData = [
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
                    title: 'Literature & Language Arts',
                    description: 'Our program emphasizes classical and contemporary literature, critical analysis, and creative writing, fostering strong communication skills.'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucude-calculator"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M17 22H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2z"/></svg>',
                    title: 'Mathematics & Sciences',
                    description: 'We offer a rigorous STEM curriculum, including AP Calculus and Physics, with state-of-the-art labs for hands-on experimentation and research.'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.648 0-.485-.37-.864-.848-1.124-.461-.252-.914-.573-1.313-.957-.39-.379-.71-.795-.947-1.247-.237-.443-.356-.906-.356-1.373 0-.87-.73-1.57-1.6-1.57-.87 0-1.57.7-1.57 1.57 0 .385.118.748.333 1.047.42.567.985 1.13 1.613 1.656.63.526 1.323 1.038 2.07 1.49.747.453 1.56.83 2.436 1.115.876.286 1.8.428 2.73.428C17.5 20 22 15.5 22 10 22 6.5 17.5 2 12 2z"/></svg>',
                    title: 'Visual & Performing Arts',
                    description: 'Our vibrant arts programs include studio art, drama, choir, and instrumental music, culminating in annual showcases and performances.'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M2 12h20"/></svg>',
                    title: 'Social Studies & History',
                    description: 'Our curriculum explores global history, civics, economics, and geography, encouraging students to understand diverse cultures and historical contexts.'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-microscope"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M12 10L12 2"/><path d="M10 9.5 6.5 3 2 4.5"/><path d="M15.5 3 19 4.5 22 3"/><path d="M11 2h2"/><path d="M12 10a4 4 0 0 0 4 4H8a4 4 0 0 0 4-4Z"/></svg>',
                    title: 'Research & Innovation',
                    description: 'We offer dedicated research projects, innovation challenges, and access to advanced technology to foster creativity and problem-solving skills.'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="9" cy="18" r="4"/><path d="M22 16.35V5.5"/><path d="M22 8.5L12 11"/></svg>',
                    title: 'Music & Performance',
                    description: 'Our music program includes band, choir, and orchestra, with regular concerts, competitions, and opportunities for individual instruction.'
                }
            ];
            localStorage.setItem('programsData', JSON.stringify(programsData));
        }

        if (newsEventsData.length === 0) {
            console.log("News Events data empty in localStorage, populating with defaults.");
            newsEventsData = [
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-newspaper"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 0 2-2V4a2 2 0 0 1 2-2h7.5L22 7.5V20a2 2 0 0 1-2 2Z"/><path d="M10 12.5h8"/><path d="M10 16.5h8"/><path d="M10 8.5h8"/></svg>',
                    title: 'Annual Sports Day Success',
                    date: 'June 15, 2025',
                    description: 'Our annual sports day was a resounding success, with students showcasing their athletic prowess and sportsmanship.',
                    link: '#'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-check"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="m16 20 2 2 4-4"/></svg>',
                    title: 'Parent-Teacher Conference',
                    date: 'July 20, 2025',
                    description: 'Mark your calendars for our upcoming parent-teacher conferences. An opportunity to discuss student progress.',
                    link: '#'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.43 11.75c-.23-.39-.58-.74-1.01-1.07-1.12-.87-2.31-1.63-3.6-2.29a3.39 3.39 0 0 0-2.15-.42 3.39 3.39 0 0 0-2.15.42c-1.29.66-2.48 1.42-3.6 2.29-.43.33-.78.68-1.01 1.07-.36.6-.57 1.29-.63 2H21c-.06-.71-.27-1.4-.63-2Z"/><path d="M12 2v3"/><path d="M12 14v6"/><path d="M16 14v6"/><path d="M8 14v6"/></svg>',
                    title: 'New Student Orientation',
                    date: 'August 1, 2025',
                    description: 'Welcome new students! Join us for an orientation session to get familiar with our campus and faculty.',
                    link: '#'
                }
            ];
            localStorage.setItem('newsEventsData', JSON.stringify(newsEventsData));
        }

        if (testimonialsData.length === 0) {
            console.log("Testimonials data empty in localStorage, populating with defaults.");
            testimonialsData = [
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote"><path d="M10 11H6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3.5c.34 0 .68-.1.97-.29l2.53-2.53V3H10v8Zm11 0h-4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3.5c.34 0 .68-.1.97-.29l2.53-2.53V3H21v8Z"/></svg>',
                    quote: "Acme School has transformed my child's learning journey. The dedication of the teachers is truly remarkable!",
                    author: "Jane Doe",
                    role: "Parent of Class 5 Student"
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
                    quote: "I've gained so much confidence and knowledge here. The supportive environment makes learning enjoyable.",
                    author: "John Smith",
                    role: "Student, Class 10"
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
                    quote: "The extracurricular activities at Acme School are fantastic! They truly help in holistic development.",
                    author: "Emily White",
                    role: "Parent of Class 7 Student"
                }
            ];
            localStorage.setItem('testimonialsData', JSON.stringify(testimonialsData));
        }

        if (facultyData.length === 0) {
            console.log("Faculty data empty in localStorage, populating with defaults.");
            facultyData = [
                {
                    imageUrl: 'https://placehold.co/100x100/007bff/ffffff?text=Teacher+1',
                    name: 'Ms. Alice Johnson',
                    role: 'Head of English Department',
                    description: 'Dedicated educator with over 15 years of experience in literature and language arts.'
                },
                {
                    imageUrl: 'https://placehold.co/100x100/007bff/ffffff?text=Teacher+2',
                    name: 'Mr. Bob Williams',
                    role: 'Senior Math Teacher',
                    description: 'Passionate about making mathematics engaging and accessible for all students.'
                },
                {
                    imageUrl: 'https://placehold.co/100x100/007bff/ffffff?text=Teacher+3',
                    name: 'Dr. Carol Davis',
                    role: 'Science Coordinator',
                    description: 'Leads innovative science programs, fostering curiosity and scientific inquiry.'
                }
            ];
            localStorage.setItem('facultyData', JSON.stringify(facultyData));
        }

        if (galleryData.length === 0) {
            console.log("Gallery data empty in localStorage, populating with defaults.");
            galleryData = [
                {
                    imageUrl: 'https://placehold.co/400x300/28a745/ffffff?text=Sports+Day',
                    caption: 'Exciting moments from our Annual Sports Day.'
                },
                {
                    imageUrl: 'https://placehold.co/400x300/007bff/ffffff?text=Science+Fair',
                    caption: 'Students showcasing their innovative science projects.'
                },
                {
                    imageUrl: 'https://placehold.co/400x300/ffc107/1e3a8a?text=Cultural+Event',
                    caption: 'Vibrant performances during Cultural Week.'
                },
                {
                    imageUrl: 'https://placehold.co/400x300/6f42c1/ffffff?text=Classroom',
                    caption: 'Engaged learning in a modern classroom setting.'
                },
                {
                    imageUrl: 'https://placehold.co/400x300/dc3545/ffffff?text=Library',
                    caption: 'Our well-stocked library, a hub for knowledge.'
                },
                {
                    imageUrl: 'https://placehold.co/400x300/20c997/1a202c?text=Graduation',
                    caption: 'Celebrating our graduates\' achievements.'
                }
            ];
            localStorage.setItem('galleryData', JSON.stringify(galleryData));
        }

        if (quickLinksData.length === 0) {
            console.log("Quick Links data empty in localStorage, populating with defaults.");
            quickLinksData = [
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
                    title: 'Academic Calendar',
                    description: 'View important dates and holidays for the academic year.',
                    link: '#'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
                    title: 'Student Handbook',
                    description: 'Access rules, policies, and guidelines for students and parents.',
                    link: '#'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 15h4"/><path d="M8 11h.01"/><path d="M8 15h.01"/></svg>',
                    title: 'Admissions Form',
                    description: 'Download the application form for new enrollments and admission requirements.',
                    link: '#'
                },
                {
                    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
                    title: 'Contact Directory',
                    description: 'Find contact information for various school departments and staff.',
                    link: '#school-contact-section'
                }
            ];
            localStorage.setItem('quickLinksData', JSON.stringify(quickLinksData));
        }

    } catch (e) {
        console.error("Error loading frontend data from localStorage:", e);
        // Fallback to empty arrays if data is corrupted
        programsData = [];
        newsEventsData = [];
        testimonialsData = [];
        facultyData = [];
        galleryData = [];
        quickLinksData = [];
    }
}


// Function to render the academic programs (using loaded data)
function renderPrograms() {
    console.log("Rendering Academic Programs with data:", programsData);
    const programsGrid = document.getElementById('programs-grid');
    if (!programsGrid) {
        console.warn("Element #programs-grid not found.");
        return;
    }

    programsGrid.innerHTML = '';

    if (programsData.length === 0) {
        programsGrid.innerHTML = '<p class="no-data-message">No academic programs available. Please add some via the admin panel.</p>';
        return;
    }

    programsData.forEach(program => {
        const programCard = document.createElement('div');
        programCard.className = 'program-card';

        programCard.innerHTML = `
            <div class="program-card-content">
                <div class="program-icon-wrapper">
                    ${program.iconSvg}
                </div>
                <h3>${program.title}</h3>
                <p>${program.description}</p>
            </div>
            <div class="program-card-footer">
                <button class="program-learn-more-btn">
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right">
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                </button>
            </div>
        `;
        programsGrid.appendChild(programCard);
    });
}

// Function to render News & Events (using loaded data)
function renderNewsEvents() {
    console.log("Rendering News & Events with data:", newsEventsData);
    const newsEventsGrid = document.getElementById('news-events-grid');
    if (!newsEventsGrid) {
        console.warn("Element #news-events-grid not found.");
        return;
    }

    newsEventsGrid.innerHTML = '';

    if (newsEventsData.length === 0) {
        newsEventsGrid.innerHTML = '<p class="no-data-message">No news or events available. Please add some via the admin panel.</p>';
        return;
    }

    newsEventsData.forEach(item => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-event-card';

        newsCard.innerHTML = `
            <div class="news-icon-wrapper">
                ${item.iconSvg}
            </div>
            <div class="news-content">
                <h3>${item.title}</h3>
                <p class="news-date">${item.date}</p>
                <p>${item.description}</p>
                <a href="${item.link}" class="news-read-more-btn">Read More &rarr;</a>
            </div>
        `;
        newsEventsGrid.appendChild(newsCard);
    });
}

// Function to render Testimonials (using loaded data)
function renderTestimonials() {
    console.log("Rendering Testimonials with data:", testimonialsData);
    const testimonialsContainer = document.getElementById('testimonials-container');
    if (!testimonialsContainer) {
        console.warn("Element #testimonials-container not found.");
        return;
    }

    testimonialsContainer.innerHTML = '';

    if (testimonialsData.length === 0) {
        testimonialsContainer.innerHTML = '<p class="no-data-message">No testimonials available. Please add some via the admin panel.</p>';
        return;
    }

    testimonialsData.forEach(testimonial => {
        const testimonialCard = document.createElement('div');
        testimonialCard.className = 'testimonial-card';

        testimonialCard.innerHTML = `
            <div class="testimonial-icon-wrapper">
                ${testimonial.iconSvg}
            </div>
            <p class="testimonial-quote">"${testimonial.quote}"</p>
            <p class="testimonial-author">- ${testimonial.author}</p>
            <p class="testimonial-role">${testimonial.role}</p>
        `;
        testimonialsContainer.appendChild(testimonialCard);
    });
}

// Function to render Faculty (using loaded data)
function renderFaculty() {
    console.log("Rendering Faculty with data:", facultyData);
    const facultyGrid = document.getElementById('faculty-grid');
    if (!facultyGrid) {
        console.warn("Element #faculty-grid not found.");
        return;
    }

    facultyGrid.innerHTML = '';

    if (facultyData.length === 0) {
        facultyGrid.innerHTML = '<p class="no-data-message">No faculty members listed. Please add some via the admin panel.</p>';
        return;
    }

    facultyData.forEach(faculty => {
        const facultyCard = document.createElement('div');
        facultyCard.className = 'faculty-card';

        facultyCard.innerHTML = `
            <img src="${faculty.imageUrl}" alt="${faculty.name}" class="faculty-photo">
            <h3>${faculty.name}</h3>
            <p class="faculty-role">${faculty.role}</p>
            <p class="faculty-description">${faculty.description}</p>
        `;
        facultyGrid.appendChild(facultyCard);
    });
}

// Function to render Gallery (using loaded data)
function renderGallery() {
    console.log("Rendering Gallery with data:", galleryData);
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) {
        console.warn("Element #gallery-grid not found.");
        return;
    }

    galleryGrid.innerHTML = '';

    if (galleryData.length === 0) {
        galleryGrid.innerHTML = '<p class="no-data-message">No gallery items available. Please add some via the admin panel.</p>';
        return;
    }

    galleryData.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        galleryItem.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.caption}">
            <div class="gallery-item-caption">${item.caption}</div>
        `;
        galleryGrid.appendChild(galleryItem);
    });
}

// Function to render Quick Links (using loaded data)
function renderQuickLinks() {
    console.log("Rendering Quick Links with data:", quickLinksData);
    const quickLinksGrid = document.getElementById('quick-links-grid');
    if (!quickLinksGrid) {
        console.warn("Element #quick-links-grid not found.");
        return;
    }

    quickLinksGrid.innerHTML = '';

    if (quickLinksData.length === 0) {
        quickLinksGrid.innerHTML = '<p class="no-data-message">No quick links available. Please add some via the admin panel.</p>';
        return;
    }

    quickLinksData.forEach(item => {
        const quickLinkCard = document.createElement('a'); // Use <a> tag for links
        quickLinkCard.href = item.link;
        quickLinkCard.className = 'quick-link-card';

        quickLinkCard.innerHTML = `
            <div class="quick-link-icon-wrapper">
                ${item.iconSvg}
            </div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        `;
        quickLinksGrid.appendChild(quickLinkCard);
    });
}


// Initialize all functions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded for index.html");
    loadFrontendData(); // Load data from localStorage first

    showSlides(); // Start the slider
    renderPrograms(); // Render academic programs
    renderNewsEvents(); // Render news and events
    renderTestimonials(); // Render testimonials
    renderFaculty(); // Render faculty
    renderGallery(); // Render gallery
    renderQuickLinks(); // Render quick links

    // Contact and Footer JS logic
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;

            console.log('Contact Form Submitted!');
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Message:', message);

            console.log('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
});
