// --- Navigation Menu Toggle ---
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
    facultyData = await fetchData('/api/faculty');
    galleryData = await fetchData('/api/gallery');
    quickLinksData = await fetchData('/api/quickLinks');
}

// Render functions
function renderPrograms() {
    const container = document.getElementById('programs-grid'); // Updated ID
    if (!container) return;
    container.innerHTML = ''; // Clear existing content

    if (programsData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No academic programs available yet.</p>';
        return;
    }

    programsData.forEach(program => {
        const programCard = document.createElement('div');
        programCard.classList.add('program-card');
        programCard.innerHTML = `
            <div class="program-icon">
                ${program.iconSvg || '<i class="fas fa-book"></i>'}
            </div>
            <h3>${program.title}</h3>
            <p>${program.description}</p>
        `;
        container.appendChild(programCard);
    });
}

function renderNewsEvents() {
    const container = document.getElementById('news-events-grid'); // Updated ID
    if (!container) return;
    container.innerHTML = ''; // Clear existing content

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
                <div class="news-event-icon">
                    ${item.iconSvg || '<i class="fas fa-calendar-alt"></i>'}
                </div>
                <h3>${item.title}</h3>
                <p class="date">${item.date}</p>
                <p>${item.description}</p>
                ${item.link ? `<a href="${item.link}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>` : ''}
            </div>
        `;
        container.appendChild(newsEventCard);
    });
}

function renderTestimonials() {
    const container = document.getElementById('testimonials-container'); // ID remains the same
    if (!container) return;
    container.innerHTML = ''; // Clear existing content

    if (testimonialsData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No testimonials available yet.</p>';
        return;
    }

    testimonialsData.forEach(testimonial => {
        const testimonialCard = document.createElement('div');
        testimonialCard.classList.add('testimonial-card');
        testimonialCard.innerHTML = `
            <div class="quote-icon">
                ${testimonial.iconSvg || '<i class="fas fa-quote-left"></i>'}
            </div>
            <p class="quote">"${testimonial.quote}"</p>
            <p class="author">- ${testimonial.author}, ${testimonial.role}</p>
        `;
        container.appendChild(testimonialCard);
    });
}

const FACULTY_DISPLAY_LIMIT = 6; // Number of faculty members to show initially
let facultyVisibleCount = FACULTY_DISPLAY_LIMIT;

function renderFaculty() {
    const container = document.getElementById('faculty-grid'); // Updated ID
    const showMoreBtn = document.getElementById('showMoreFacultyBtn');
    if (!container || !showMoreBtn) return;

    container.innerHTML = ''; // Clear existing content

    if (facultyData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No faculty members available yet.</p>';
        showMoreBtn.style.display = 'none'; // Hide button if no faculty
        return;
    }

    // Sort facultyData alphabetically by name
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
        showMoreBtn.textContent = facultyVisibleCount >= facultyData.length ? 'Show Less Faculty' : 'Show More Faculty';
    } else {
        showMoreBtn.style.display = 'none';
    }
}

function toggleFacultyVisibility() {
    if (facultyVisibleCount >= facultyData.length) {
        facultyVisibleCount = FACULTY_DISPLAY_LIMIT; // Reset to initial limit
    } else {
        facultyVisibleCount = facultyData.length; // Show all
    }
    renderFaculty(); // Re-render faculty cards
}


function renderGallery() {
    const container = document.getElementById('gallery-grid'); // Updated ID
    if (!container) return;
    container.innerHTML = ''; // Clear existing content

    if (galleryData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No gallery items available yet.</p>';
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

function renderQuickLinks() {
    const container = document.getElementById('quick-links-grid'); // Updated ID
    // const footerContainer = document.getElementById('footer-quick-links'); // This ID is not in new index.html

    if (!container) return; // Only check the main container now

    container.innerHTML = ''; // Clear existing content
    if (quickLinksData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No quick links available yet.</p>';
    } else {
        quickLinksData.forEach(link => {
            const quickLinkCard = document.createElement('a');
            quickLinkCard.href = link.url;
            quickLinkCard.classList.add('quick-link-card');
            quickLinkCard.innerHTML = `
                <div class="quick-link-icon">
                    ${link.iconSvg || '<i class="fas fa-link"></i>'}
                </div>
                <h3>${link.title}</h3>
                <p>${link.description}</p>
            `;
            container.appendChild(quickLinkCard);
        });
    }

    // The footer quick links are no longer dynamic in the provided index.html,
    // so this part is commented out or removed if not needed.
    // if (footerContainer) {
    //     footerContainer.innerHTML = '';
    //     if (quickLinksData.length === 0) {
    //         footerContainer.innerHTML = '<li><a href="#">Student Portal</a></li><li><a href="#">Parent Resources</a></li>';
    //     } else {
    //         quickLinksData.forEach(link => {
    //             const listItem = document.createElement('li');
    //             listItem.innerHTML = `<a href="${link.url}">${link.title}</a>`;
    //             footerContainer.appendChild(listItem);
    //         });
    //     }
    // }
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
            // Removed suffix from data-target, it's now in a separate span
            // const suffix = item.dataset.suffix || ''; // This is no longer needed here
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
                    countUpSpan.textContent = target; // Ensure final value is exact
                    // Removed the suffix appending here because it's already in the HTML
                    // if (suffix) {
                    //     countUpSpan.textContent += suffix;
                    // }
                }
            };
            requestAnimationFrame(updateCount);
        });
        counterObserver.unobserve(entry.target);
    }
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        animateCounter(entry);
    });
}, {
    threshold: 0.5
});

// --- DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', async () => {
    // Show page loader
    const pageLoader = document.getElementById('page-loader'); // Assuming index.html has a page-loader
    if (pageLoader) {
        pageLoader.style.display = 'flex'; // Show loader
    }

    await loadFrontendData(); // Load data from backend first
    requestAnimationFrame(animateSlider); // Start slider animation

    // Render all sections after data is loaded
    renderPrograms();
    renderNewsEvents();
    renderTestimonials();
    renderFaculty();
    renderGallery();
    renderQuickLinks();
    setupSmoothScrolling();

    // Show more/less faculty button logic
    const showMoreFacultyBtn = document.getElementById('showMoreFacultyBtn');
    if (showMoreFacultyBtn) {
        showMoreFacultyBtn.addEventListener('click', toggleFacultyVisibility);
    }

    // Counter section observer
    const counterSection = document.getElementById('counter-section');
    if (counterSection) {
        counterObserver.observe(counterSection);
    }

    // Year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Contact Form Submission Using Fetch ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !email || !message) {
                // Replace alert with a custom modal or message box
                console.warn('Please fill in all fields.');
                // Example of a simple message box (you'd style this properly)
                const msgBox = document.createElement('div');
                msgBox.textContent = 'Please fill in all fields.';
                msgBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #ffdddd; border: 1px solid #ffaaaa; padding: 10px; border-radius: 5px; z-index: 1000;';
                document.body.appendChild(msgBox);
                setTimeout(() => msgBox.remove(), 3000);
                return;
            }

            try {
                const response = await fetch('/submit-contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, message })
                });

                if (response.ok) {
                    // Replace alert with a custom modal or message box
                    console.log('Thank you! Your message has been submitted successfully.');
                    const msgBox = document.createElement('div');
                    msgBox.textContent = 'Thank you! Your message has been submitted successfully.';
                    msgBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #ddffdd; border: 1px solid #aaffaa; padding: 10px; border-radius: 5px; z-index: 1000;';
                    document.body.appendChild(msgBox);
                    setTimeout(() => msgBox.remove(), 3000);
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    // Replace alert with a custom modal or message box
                    console.error('Submission failed:', errorData.error || 'Please try again later.');
                    const msgBox = document.createElement('div');
                    msgBox.textContent = 'Submission failed: ' + (errorData.error || 'Please try again later.');
                    msgBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #ffdddd; border: 1px solid #ffaaaa; padding: 10px; border-radius: 5px; z-index: 1000;';
                    document.body.appendChild(msgBox);
                    setTimeout(() => msgBox.remove(), 3000);
                }
            } catch (error) {
                console.error('Submission error:', error);
                // Replace alert with a custom modal or message box
                const msgBox = document.createElement('div');
                msgBox.textContent = 'An error occurred while submitting the form. Please try again.';
                msgBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #ffdddd; border: 1px solid #ffaaaa; padding: 10px; border-radius: 5px; z-index: 1000;';
                document.body.appendChild(msgBox);
                setTimeout(() => msgBox.remove(), 3000);
            }
        });
    }

    // Fade-in animation
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

    // Hide page loader after all content is loaded and rendered
    if (pageLoader) {
        pageLoader.style.display = 'none'; // Hide loader
    }
});


// --- Principal card visibility animation ---
const principalCard = document.querySelector('.principal-message-card');
if (principalCard) {
    // There is no expand/collapse logic for the principal card in this index.html
    // So, we'll just ensure it becomes visible.
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
