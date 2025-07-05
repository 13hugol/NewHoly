function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// --- Image Slider Logic (Smoother with requestAnimationFrame) ---
let slideIndex = 0;
let lastFrameTime = 0;
const slideInterval = 3000;

function animateSlider(currentTime) {
    if (!lastFrameTime) lastFrameTime = currentTime;
    const elapsed = currentTime - lastFrameTime;

    if (elapsed > slideInterval) {
        const slides = document.getElementById('slider');
        if (slides) {
            const images = slides.getElementsByTagName('img');
            if (images.length > 0) {
                slideIndex = (slideIndex + 1) % images.length;
                slides.style.transform = `translateX(${-slideIndex * 100}%)`;
            }
        }
        lastFrameTime = currentTime;
    }
    requestAnimationFrame(animateSlider);
}

// --- Data Loading from Backend API ---

// Helper function to fetch data from API
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data || []; // Assuming API returns { data: [...] }
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return []; // Return empty array on error
    }
}

let programsData = [];
let newsEventsData = [];
let testimonialsData = [];
let facultyData = [];
let galleryData = [];
let quickLinksData = [];

// Function to load all frontend data from the backend
async function loadFrontendData() {
    programsData = await fetchData('/api/programs');
    newsEventsData = await fetchData('/api/newsEvents');
    testimonialsData = await fetchData('/api/testimonials');
    facultyData = await fetchData('/api/facultys');
    galleryData = await fetchData('/api/gallerys'); // This fetches our gallery data
    quickLinksData = await fetchData('/api/quickLinks');
}

// Render functions
function renderPrograms() {
    const container = document.getElementById('programs-grid');
    if (!container) return;
    container.innerHTML = '';
    if (programsData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No academic programs available yet.</p>';
        return;
    }
    programsData.forEach(program => {
        const programCard = document.createElement('div');
        programCard.classList.add('program-card');
        programCard.innerHTML = `
            <div class="program-icon">${program.iconSvg || '<i class="fas fa-book"></i>'}</div>
            <h3>${program.title}</h3>
            <p>${program.description}</p>
        `;
        container.appendChild(programCard);
    });
}

function renderNewsEvents() {
    const container = document.getElementById('news-events-grid');
    if (!container) return;
    container.innerHTML = '';
    if (newsEventsData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No news or events available yet.</p>';
        return;
    }
    newsEventsData.forEach(item => {
        const newsEventCard = document.createElement('div');
        newsEventCard.classList.add('news-event-card');
        newsEventCard.innerHTML = `
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" class="news-image" onerror="this.onerror=null;this.src='https://placehold.co/400x250/cccccc/000000?text=No+Image';" />` : ''}
            <div class="news-event-content">
                <div class="news-event-icon">${item.iconSvg || '<i class="fas fa-calendar-alt"></i>'}</div>
                <h3>${item.title} (${item.date})</h3>
                <p>${item.description}</p>
                ${item.link ? `<a href="${item.link}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>` : ''}
            </div>
        `;
        container.appendChild(newsEventCard);
    });
}

function renderTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;
    container.innerHTML = '';
    if (testimonialsData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No testimonials available yet.</p>';
        return;
    }
    testimonialsData.forEach(testimonial => {
        const testimonialCard = document.createElement('div');
        testimonialCard.classList.add('testimonial-card');
        testimonialCard.innerHTML = `
            <div class="quote-icon">${testimonial.iconSvg || '<i class="fas fa-quote-left"></i>'}</div>
            <p class="quote">"${testimonial.quote}"</p>
            <p class="author">- ${testimonial.author}, ${testimonial.role}</p>
        `;
        container.appendChild(testimonialCard);
    });
}

const FACULTY_DISPLAY_LIMIT = 3; 
let facultyVisibleCount = FACULTY_DISPLAY_LIMIT;

function renderFaculty() {
    const container = document.getElementById('faculty-grid');
    const showMoreBtn = document.getElementById('showMoreFacultyBtn');
    const facultyDisplayContainer = document.getElementById('faculty-display-container');
    const facultyOverlay = document.getElementById('faculty-overlay');
    if (!container || !showMoreBtn || !facultyDisplayContainer || !facultyOverlay) return;
    container.innerHTML = '';
    if (facultyData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No faculty members available yet.</p>';
        showMoreBtn.style.display = 'none';
        facultyOverlay.style.opacity = '0';
        facultyDisplayContainer.classList.remove('expanded');
        return;
    }
    facultyData.sort((a, b) => a.name.localeCompare(b.name));
    const facultyToDisplay = facultyData.slice(0, facultyVisibleCount);
    facultyToDisplay.forEach(member => {
        const facultyCard = document.createElement('div');
        facultyCard.classList.add('faculty-card');
        facultyCard.innerHTML = `
            <img src="${member.imageUrl || 'https://placehold.co/150x150/cccccc/000000?text=Faculty'}" alt="${member.name}" onerror="this.onerror=null;this.src='https://placehold.co/150x150/cccccc/000000?text=Faculty';" />
            <h3>${member.name}</h3>
            <p class="role">${member.role}</p>
            <p class="description">${member.description}</p>
        `;
        container.appendChild(facultyCard);
    });
    if (facultyData.length > FACULTY_DISPLAY_LIMIT) {
        showMoreBtn.style.display = 'block';
        if (facultyVisibleCount >= facultyData.length) {
            showMoreBtn.textContent = 'Show Less Faculty';
            facultyDisplayContainer.classList.add('expanded');
            facultyOverlay.style.opacity = '0';
        } else {
            showMoreBtn.textContent = 'Show More Faculty';
            facultyDisplayContainer.classList.remove('expanded');
            facultyOverlay.style.opacity = '1';
        }
    } else {
        showMoreBtn.style.display = 'none';
        facultyDisplayContainer.classList.add('expanded');
        facultyOverlay.style.opacity = '0';
    }
}

function toggleFacultyVisibility() {
    if (facultyVisibleCount >= facultyData.length) {
        facultyVisibleCount = FACULTY_DISPLAY_LIMIT;
    } else {
        facultyVisibleCount = facultyData.length;
    }
    renderFaculty();
}

// --- [MODIFIED] Gallery Rendering for New Slider ---
function renderGallery() {
    // Note the ID change to 'gallery-container'
    const container = document.getElementById('gallery-container'); 
    if (!container) return;
    container.innerHTML = ''; // Clear existing content

    if (galleryData.length === 0) {
        // To prevent breaking the layout, we'll hide the whole section or show a message inside the wrapper
        const gallerySection = document.getElementById('gallery-section');
        if(gallerySection) gallerySection.style.display = 'none';
        return;
    }

    galleryData.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');
        galleryItem.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.caption}" onerror="this.onerror=null;this.src='https://placehold.co/400x300/cccccc/000000?text=No+Image';" />
            <p>${item.caption}</p>
        `;
        container.appendChild(galleryItem);
    });
}

// --- [NEW] Logic for Gallery Slider Arrow Controls ---
function setupGallerySlider() {
    const container = document.getElementById('gallery-container');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');

    if (!container || !leftBtn || !rightBtn) return;

    const checkScroll = () => {
        if (!container) return;
        // Disable left arrow if at the beginning
        leftBtn.disabled = container.scrollLeft <= 0;
        // Disable right arrow if at the end
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        rightBtn.disabled = container.scrollLeft >= maxScrollLeft - 1; // -1 for precision
    };

    rightBtn.addEventListener('click', () => {
        const scrollAmount = container.clientWidth;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    leftBtn.addEventListener('click', () => {
        const scrollAmount = container.clientWidth;
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    // Update buttons on scroll (for touch/manual scroll) and resize
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    // Initial check in case there are few items and no scrolling is needed
    // Use a small timeout to ensure layout is complete after rendering
    setTimeout(checkScroll, 100); 
}


function renderQuickLinks() {
    const container = document.getElementById('quick-links-grid');
    if (!container) return;
    container.innerHTML = '';
    if (quickLinksData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No quick links available yet.</p>';
    } else {
        quickLinksData.forEach(link => {
            const quickLinkCard = document.createElement('a');
            quickLinkCard.href = link.url;
            quickLinkCard.classList.add('quick-link-card');
            quickLinkCard.innerHTML = `
                <div class="quick-link-icon">${link.iconSvg || '<i class="fas fa-link"></i>'}</div>
                <h3>${link.title}</h3>
                <p>${link.description}</p>
            `;
            container.appendChild(quickLinkCard);
        });
    }
}

// --- Smooth Scrolling for Navigation Links ---
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                const menu = document.getElementById('menu');
                if (menu && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                }
            }
        });
    });
}

// --- Counter Animation ---
function animateCounter(entry) {
    if (entry.isIntersecting) {
        const counterItems = entry.target.querySelectorAll('.counter-item');
        counterItems.forEach(item => {
            item.classList.add('animated');
            const countUpSpan = item.querySelector('.count-up');
            const target = parseInt(item.dataset.target);
            let current = 0;
            const duration = 2000;
            const startTimestamp = performance.now();
            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTimestamp;
                const progress = Math.min(elapsed / duration, 1);
                current = progress * target;
                countUpSpan.textContent = Math.floor(current);
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    countUpSpan.textContent = target;
                }
            };
            requestAnimationFrame(updateCount);
        });
        counterObserver.unobserve(entry.target);
    }
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => animateCounter(entry));
}, { threshold: 0.5 });

// --- DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', async () => {
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) pageLoader.style.display = 'flex';

    await loadFrontendData();
    requestAnimationFrame(animateSlider);

    // Render all sections
    renderPrograms();
    renderNewsEvents();
    renderTestimonials();
    renderFaculty();
    renderGallery(); // Render the new gallery
    renderQuickLinks();
    
    // Setup interactive elements
    setupSmoothScrolling();
    setupGallerySlider(); // Setup the new gallery slider controls

    const showMoreFacultyBtn = document.getElementById('showMoreFacultyBtn');
    if (showMoreFacultyBtn) {
        showMoreFacultyBtn.addEventListener('click', toggleFacultyVisibility);
    }
    const counterSection = document.getElementById('counter-section');
    if (counterSection) {
        counterObserver.observe(counterSection);
    }
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }
            try {
                const response = await fetch('/submit-contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });
                if (response.ok) {
                    alert('Thank you! Your message has been submitted successfully.');
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    alert('Submission failed: ' + (errorData.error || 'Please try again later.'));
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
            }
        });
    }

    // Fade-in animation observer
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    fadeEls.forEach(el => observer.observe(el));

    if (pageLoader) pageLoader.style.display = 'none';
});

// --- Other existing functions (Principal card, scroll to top) ---
const principalCard = document.querySelector('.principal-message-card');
if (principalCard) {
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    principalCard.classList.add('visible');
                    observer.unobserve(principalCard);
                }
            });
        },
        { threshold: 0.4 }
    );
    observer.observe(principalCard);
}

const scrollToTopBtn = document.getElementById("scrollToTopBtn");
if (scrollToTopBtn) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
            scrollToTopBtn.style.display = "flex";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    });
    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}