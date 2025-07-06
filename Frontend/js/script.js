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

// --- Gallery Rendering for Horizontal Scrolling Layout ---
function renderGallery() {
    const container = document.getElementById('gallery-container'); 
    if (!container) return;
    container.innerHTML = ''; // Clear existing content

    // Limit to only 5 images for homepage
    const limitedData = galleryData.slice(0, 5);

    if (galleryData.length === 0) {
        // Show a message for empty gallery
        container.innerHTML = `
            <div class="gallery-item" style="flex: 0 0 100%; text-align: center; padding: 3rem;">
                <p style="font-size: 1.2rem; color: #64748b;">No gallery images available yet.</p>
            </div>
        `;
        return;
    }

    limitedData.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');
        galleryItem.style.animationDelay = `${(index + 1) * 0.1}s`;
        galleryItem.innerHTML = `
            <div class="caption">${item.caption}</div>
            <img src="${item.imageUrl}" alt="${item.caption}" onerror="this.onerror=null;this.src='https://placehold.co/400x300/cccccc/000000?text=No+Image';" />
        `;
        container.appendChild(galleryItem);
    });
    
    // Re-initialize slider after rendering
    setTimeout(() => {
        setupGallerySlider();
    }, 200);
}

// --- Gallery Horizontal Scrolling with Arrow Controls ---
function setupGallerySlider() {
    const container = document.getElementById('gallery-container');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');

    if (!container || !leftBtn || !rightBtn) return;

    // Calculate scroll amount based on container width
    const getScrollAmount = () => {
        const containerWidth = container.clientWidth;
        const itemWidth = 350; // Base item width
        const gap = 32; // 2rem gap
        const itemsPerScroll = Math.floor(containerWidth / (itemWidth + gap));
        return itemsPerScroll * (itemWidth + gap);
    };

    // Check scroll position and update button states
    const checkScroll = () => {
        if (!container) return;
        
        // Disable left arrow if at the beginning
        leftBtn.disabled = container.scrollLeft <= 0;
        
        // Disable right arrow if at the end
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        rightBtn.disabled = container.scrollLeft >= maxScrollLeft - 1;
        
        // Add visual feedback
        if (leftBtn.disabled) {
            leftBtn.style.opacity = '0.3';
        } else {
            leftBtn.style.opacity = '1';
        }
        
        if (rightBtn.disabled) {
            rightBtn.style.opacity = '0.3';
        } else {
            rightBtn.style.opacity = '1';
        }
    };

    // Smooth scroll right
    rightBtn.addEventListener('click', () => {
        const scrollAmount = getScrollAmount();
        container.scrollBy({ 
            left: scrollAmount, 
            behavior: 'smooth' 
        });
        
        // Add click animation
        rightBtn.style.transform = 'translateY(-50%) scale(0.95)';
        setTimeout(() => {
            rightBtn.style.transform = 'translateY(-50%) scale(1)';
        }, 150);
    });

    // Smooth scroll left
    leftBtn.addEventListener('click', () => {
        const scrollAmount = getScrollAmount();
        container.scrollBy({ 
            left: -scrollAmount, 
            behavior: 'smooth' 
        });
        
        // Add click animation
        leftBtn.style.transform = 'translateY(-50%) scale(0.95)';
        setTimeout(() => {
            leftBtn.style.transform = 'translateY(-50%) scale(1)';
        }, 150);
    });

    // Update buttons on scroll and resize
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    // Initial check
    setTimeout(checkScroll, 100);
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !leftBtn.disabled) {
            leftBtn.click();
        } else if (e.key === 'ArrowRight' && !rightBtn.disabled) {
            rightBtn.click();
        }
    });
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
    renderFacilities();
    
    // Setup interactive elements
    setupSmoothScrolling();
    setupGallerySlider(); // Setup the gallery slider controls
    setupStudentLifeAnimations(); // Setup enhanced student life animations

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

// --- Enhanced Student Life Animations ---
function setupStudentLifeAnimations() {
    const studentLifeSection = document.getElementById('student-life-section');
    if (!studentLifeSection) return;

    // Intersection Observer for triggering animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation classes to columns
                const columns = entry.target.querySelectorAll('.student-life-column');
                columns.forEach((column, index) => {
                    setTimeout(() => {
                        column.style.animation = `slideInColumn 0.8s ease-out ${index * 0.2}s forwards`;
                    }, index * 200);
                });

                // Add animation classes to list items
                const listItems = entry.target.querySelectorAll('.student-life-list li');
                listItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.animation = `slideInListItem 0.6s ease-out ${0.6 + (index * 0.1)}s forwards`;
                    }, 600 + (index * 100));
                });

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(studentLifeSection);

    // Add hover effects for list items
    const listItems = studentLifeSection.querySelectorAll('.student-life-list li');
    listItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px) scale(1.02)';
            this.style.background = 'linear-gradient(135deg, rgba(224, 242, 254, 0.9), rgba(186, 230, 253, 0.9))';
            this.style.borderLeftColor = '#0284c7';
            this.style.boxShadow = '0 8px 20px rgba(14, 165, 233, 0.2)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
            this.style.background = 'linear-gradient(135deg, rgba(240, 249, 255, 0.8), rgba(224, 242, 254, 0.8))';
            this.style.borderLeftColor = '#0ea5e9';
            this.style.boxShadow = 'none';
        });
    });

    // Add click effects for columns
    const columns = studentLifeSection.querySelectorAll('.student-life-column');
    columns.forEach(column => {
        column.addEventListener('click', function() {
            // Add a subtle click animation
            this.style.transform = 'translateY(-5px) scale(1.01)';
            setTimeout(() => {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }, 150);
        });
    });

    // Add floating animation to icons
    const icons = studentLifeSection.querySelectorAll('.icon-prefix');
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.animation = 'iconSpin 0.6s ease-out';
            this.style.color = '#0284c7';
        });

        icon.addEventListener('mouseleave', function() {
            this.style.animation = 'iconPulse 2s ease-in-out infinite';
            this.style.color = '#0ea5e9';
        });
    });
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    // Set message and type
    notificationMessage.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
        notification.style.display = 'none';
        notification.classList.remove('hide');
    }, 300);
}

// Check for URL parameters on page load
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const message = urlParams.get('message');
    
    if (status && message) {
        showNotification(decodeURIComponent(message), status);
        
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}

// Initialize notification system
document.addEventListener('DOMContentLoaded', function() {
    // Check for URL parameters
    checkUrlParameters();
    
    // Add event listener for notification close button
    const closeButton = document.getElementById('notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', hideNotification);
    }
});

// Render Facilities
async function renderFacilities() {
    const facilitiesGrid = document.getElementById('facilities-grid');
    if (!facilitiesGrid) return;

    try {
        const response = await fetch('/api/facilities');
        const data = await response.json();
        const facilities = data.data || [];

        facilitiesGrid.innerHTML = '';

        if (facilities.length === 0) {
            facilitiesGrid.innerHTML = `
                <div class="facility-card">
                    <div class="facility-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <h3>Modern Classrooms</h3>
                    <p>Well-equipped classrooms with modern teaching aids and comfortable learning environments.</p>
                    <ul class="facility-features">
                        <li>Smart boards and projectors</li>
                        <li>Comfortable seating arrangements</li>
                        <li>Proper ventilation and lighting</li>
                    </ul>
                </div>
                <div class="facility-card">
                    <div class="facility-icon">
                        <i class="fas fa-flask"></i>
                    </div>
                    <h3>Science Laboratories</h3>
                    <p>State-of-the-art laboratories for practical learning in Physics, Chemistry, and Biology.</p>
                    <ul class="facility-features">
                        <li>Modern equipment and apparatus</li>
                        <li>Safety measures and protocols</li>
                        <li>Experienced lab assistants</li>
                    </ul>
                </div>
                <div class="facility-card">
                    <div class="facility-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <h3>Library & Resource Center</h3>
                    <p>Extensive collection of books, digital resources, and study spaces for students.</p>
                    <ul class="facility-features">
                        <li>Wide range of books and journals</li>
                        <li>Digital learning resources</li>
                        <li>Quiet study areas</li>
                    </ul>
                </div>
            `;
            return;
        }

        facilities.forEach(facility => {
            const facilityCard = document.createElement('div');
            facilityCard.className = 'facility-card';
            
            let featuresHTML = '';
            if (facility.features && facility.features.length > 0) {
                featuresHTML = `
                    <ul class="facility-features">
                        ${facility.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                `;
            }

            facilityCard.innerHTML = `
                ${facility.imageUrl ? `<img src="${facility.imageUrl}" alt="${facility.name}" class="facility-image" onerror="this.style.display='none';">` : ''}
                <div class="facility-icon">
                    ${facility.iconSvg || '<i class="fas fa-building"></i>'}
                </div>
                <h3>${facility.name}</h3>
                <p>${facility.description}</p>
                ${featuresHTML}
            `;
            
            facilitiesGrid.appendChild(facilityCard);
        });

    } catch (error) {
        console.error('Error loading facilities:', error);
        facilitiesGrid.innerHTML = `
            <div class="facility-card">
                <div class="facility-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Facilities Loading Error</h3>
                <p>Unable to load facilities information at the moment. Please try again later.</p>
            </div>
        `;
    }
}

// Initialize all sections
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing website...');
    
    // Initialize all sections
    renderPrograms();
    renderNewsEvents();
    renderTestimonials();
    renderFaculty();
    renderGallery();
    renderQuickLinks();
    renderFacilities();
    
    // Initialize other features
    initializeCounters();
    initializeContactForm();
    initializeScrollToTop();
    initializeSmoothScrolling();
    initializeFadeInAnimations();
    
    console.log('Website initialization complete');
});