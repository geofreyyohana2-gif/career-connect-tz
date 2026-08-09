/**
 * =============================================================
 * SCRIPT.JS - Custom JavaScript for TBS-style Page
 * =============================================================
 */

document.addEventListener('DOMContentLoaded', function() {

    // ──────────────────────────────────────────────────────────
    // 1. SMOOTH SCROLL FOR ANCHOR LINKS (if any)
    // ──────────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Skip if it's just "#" or empty
            if (targetId === '#' || targetId === '') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = 80; // adjust based on your header height
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ──────────────────────────────────────────────────────────
    // 2. AUTO-CLOSE BOOTSTRAP DROPDOWNS ON MOBILE (optional)
    //    Closes dropdown when a link is clicked inside it.
    // ──────────────────────────────────────────────────────────
    var dropdownLinks = document.querySelectorAll('.navbar-custom .dropdown-menu .dropdown-item');
    var navbarToggler = document.querySelector('.navbar-custom .navbar-toggler');
    var navbarCollapse = document.querySelector('.navbar-custom .navbar-collapse');

    dropdownLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            // Close dropdown menu on mobile
            if (window.innerWidth <= 991) {
                // Close the dropdown
                var parentDropdown = this.closest('.dropdown-menu');
                if (parentDropdown) {
                    var toggle = parentDropdown.closest('.dropdown').querySelector('.dropdown-toggle');
                    if (toggle) {
                        toggle.click(); // this toggles the dropdown
                    }
                }
                // Collapse the navbar if open
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    if (navbarToggler) {
                        navbarToggler.click();
                    }
                }
            }
        });
    });

    // ──────────────────────────────────────────────────────────
    // 3. HERO CAROUSEL – PAUSE ON HOVER (enhancement)
    // ──────────────────────────────────────────────────────────
    var heroCarousel = document.getElementById('heroCarousel');
    if (heroCarousel) {
        var carouselInstance = new bootstrap.Carousel(heroCarousel, {
            interval: 5000,
            pause: 'hover',
            wrap: true
        });

        // Optional: Add keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                carouselInstance.prev();
            } else if (e.key === 'ArrowRight') {
                carouselInstance.next();
            }
        });
    }

    // ──────────────────────────────────────────────────────────
    // 4. ACTIVE NAV LINK HIGHLIGHT (based on scroll)
    // ──────────────────────────────────────────────────────────
    // Get all sections that have an ID
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.navbar-custom .navbar-nav .nav-link:not(.dropdown-toggle)');

    if (sections.length > 0 && navLinks.length > 0) {
        // Find which section matches each nav link's href
        window.addEventListener('scroll', function() {
            var scrollPosition = window.pageYOffset + 120; // offset for header

            var currentSection = null;
            sections.forEach(function(section) {
                var sectionTop = section.offsetTop;
                var sectionHeight = section.offsetHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = section;
                }
            });

            navLinks.forEach(function(link) {
                link.classList.remove('active');
                var href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    var targetId = href.substring(1);
                    if (currentSection && currentSection.id === targetId) {
                        link.classList.add('active');
                    }
                }
            });
        });
    }

    // ──────────────────────────────────────────────────────────
    // 5. ADD "ACTIVE" CLASS TO CURRENT PAGE IN NAV (for non-home pages)
    // ──────────────────────────────────────────────────────────
    // If you have multiple pages, this will highlight the current page link
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-custom .navbar-nav .nav-link').forEach(function(link) {
        var linkHref = link.getAttribute('href');
        if (linkHref && linkHref === currentPath) {
            link.classList.add('active');
        }
        // Also handle index.html vs /
        if ((currentPath === 'index.html' || currentPath === '') && linkHref === 'index.html') {
            link.classList.add('active');
        }
    });

    // ──────────────────────────────────────────────────────────
    // 6. SEARCH FORM – PREVENT DEFAULT SUBMIT (optional)
    // ──────────────────────────────────────────────────────────
    var searchForm = document.querySelector('.navbar-custom form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var input = this.querySelector('input[type="search"]');
            if (input && input.value.trim() !== '') {
                // Redirect to a search page or handle the query
                console.log('Searching for:', input.value.trim());
                // window.location.href = '/search?q=' + encodeURIComponent(input.value.trim());
                alert('Search feature coming soon! You searched for: "' + input.value.trim() + '"');
            }
        });
    }

    // ──────────────────────────────────────────────────────────
    // 7. COUNTER ANIMATION (optional – for stats section if you add one)
    // ──────────────────────────────────────────────────────────
    // This is a placeholder for a counter animation – uncomment and use if needed.
    /*
    function animateCounters() {
        var counters = document.querySelectorAll('.counter');
        counters.forEach(function(counter) {
            var target = parseInt(counter.getAttribute('data-target'));
            var duration = 2000;
            var startTime = null;

            function updateCounter(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                var current = Math.floor(progress * target);
                counter.textContent = current.toLocaleString();
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    // Trigger counters when they come into view
    var counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter-section').forEach(function(section) {
        counterObserver.observe(section);
    });
    */

    console.log('✅ TBS-style page loaded successfully!');
});
