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

// --- Academic Programs Data and Rendering ---
const programsData = [
    {
        // SVG for BookOpen icon
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        title: 'Literature & Language Arts',
        description: 'Comprehensive English and world literature programs that develop critical thinking and communication skills.',
        color: 'bg-emerald-500'
    },
    {
        // SVG for Calculator icon
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucude-calculator"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M17 22H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2z"/></svg>',
        title: 'Mathematics & Sciences',
        description: 'Advanced STEM programs including calculus, physics, chemistry, and biology with hands-on laboratory experience.',
        color: 'bg-blue-500'
    },
    {
        // SVG for Palette icon
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.648 0-.485-.37-.864-.848-1.124-.461-.252-.914-.573-1.313-.957-.39-.379-.71-.795-.947-1.247-.237-.443-.356-.906-.356-1.373 0-.87-.73-1.57-1.6-1.57-.87 0-1.57.7-1.57 1.57 0 .385.118.748.333 1.047.42.567.985 1.13 1.613 1.656.63.526 1.323 1.038 2.07 1.49.747.453 1.56.83 2.436 1.115.876.286 1.8.428 2.73.428C17.5 20 22 15.5 22 10 22 6.5 17.5 2 12 2z"/></svg>',
        title: 'Visual & Performing Arts',
        description: 'Creative programs in visual arts, theater, music, and digital media to nurture artistic expression.',
        color: 'bg-purple-500'
    },
    {
        // SVG for Globe icon
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><path d="M2 12h20"/></svg>',
        title: 'Social Studies & History',
        description: 'Comprehensive programs covering world history, geography, civics, and cultural studies.',
        color: 'bg-orange-500'
    },
    {
        // SVG for Microscope icon
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-microscope"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M12 10L12 2"/><path d="M10 9.5 6.5 3 2 4.5"/><path d="M15.5 3 19 4.5 22 3"/><path d="M11 2h2"/><path d="M12 10a4 4 0 0 0 4 4H8a4 4 0 0 0 4-4Z"/></svg>',
        title: 'Research & Innovation',
        description: 'Student-led research projects and innovation labs fostering scientific inquiry and problem-solving.',
        color: 'bg-teal-500'
    },
    {
        // SVG for Music icon
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="9" cy="18" r="4"/><path d="M22 16.35V5.5"/><path d="M22 8.5L12 11"/></svg>',
        title: 'Music & Performance',
        description: 'Band, choir, orchestra, and individual music instruction with regular performances and competitions.',
        color: 'bg-pink-500'
    }
];

// Function to render the program cards
function renderPrograms() {
    const programsGrid = document.getElementById('programs-grid');
    if (!programsGrid) return; // Exit if element not found

    programsGrid.innerHTML = ''; // Clear existing content

    programsData.forEach(program => {
        const programCard = document.createElement('div');
        programCard.className = 'program-card';

        programCard.innerHTML = `
            <div class="program-card-content">
                <div class="program-icon-wrapper ${program.color}">
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

// Initialize all functions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    showSlides(); // Start the slider
    renderPrograms(); // Render academic programs
});
