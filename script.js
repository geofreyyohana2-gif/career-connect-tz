/**
 * =============================================================
 * SCRIPT.JS - Custom JavaScript for CareerConnectTZ
 * =============================================================
 */

document.addEventListener('DOMContentLoaded', function() {

    // ──────────────────────────────────────────────────────────
    // 1. SMOOTH SCROLL FOR ANCHOR LINKS
    // ──────────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ──────────────────────────────────────────────────────────
    // 2. AUTO-CLOSE BOOTSTRAP DROPDOWNS ON MOBILE
    // ──────────────────────────────────────────────────────────
    var dropdownLinks = document.querySelectorAll('.navbar-custom .dropdown-menu .dropdown-item');
    var navbarToggler = document.querySelector('.navbar-custom .navbar-toggler');
    var navbarCollapse = document.querySelector('.navbar-custom .navbar-collapse');

    dropdownLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 991) {
                var parentDropdown = this.closest('.dropdown-menu');
                if (parentDropdown) {
                    var toggle = parentDropdown.closest('.dropdown').querySelector('.dropdown-toggle');
                    if (toggle) {
                        toggle.click();
                    }
                }
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    if (navbarToggler) {
                        navbarToggler.click();
                    }
                }
            }
        });
    });

    // ──────────────────────────────────────────────────────────
    // 3. HERO CAROUSEL – PAUSE ON HOVER
    // ──────────────────────────────────────────────────────────
    var heroCarousel = document.getElementById('heroCarousel');
    if (heroCarousel) {
        var carouselInstance = new bootstrap.Carousel(heroCarousel, {
            interval: 5000,
            pause: 'hover',
            wrap: true
        });

        // Keyboard navigation
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
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.navbar-custom .navbar-nav .nav-link:not(.dropdown-toggle)');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', function() {
            var scrollPosition = window.pageYOffset + 120;

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
    // 5. ADD "ACTIVE" CLASS TO CURRENT PAGE IN NAV
    // ──────────────────────────────────────────────────────────
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-custom .navbar-nav .nav-link').forEach(function(link) {
        var linkHref = link.getAttribute('href');
        if (linkHref && linkHref === currentPath) {
            link.classList.add('active');
        }
        if ((currentPath === 'index.html' || currentPath === '') && linkHref === 'index.html') {
            link.classList.add('active');
        }
    });

    // ──────────────────────────────────────────────────────────
    // 6. SEARCH FORM – PREVENT DEFAULT SUBMIT
    // ──────────────────────────────────────────────────────────
    var searchForm = document.querySelector('.navbar-custom form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var input = this.querySelector('input[type="search"]');
            if (input && input.value.trim() !== '') {
                console.log('Searching for:', input.value.trim());
                alert('🔍 Search feature coming soon! You searched for: "' + input.value.trim() + '"');
            }
        });
    }

    // ──────────────────────────────────────────────────────────
    // 7. MARQUEE PAUSE ON HOVER (already handled by CSS)
    //    But we also add a manual toggle for accessibility
    // ──────────────────────────────────────────────────────────
    var marquee = document.querySelector('.marquee-track');
    var heroSection = document.querySelector('.hero-carousel');

    if (marquee && heroSection) {
        heroSection.addEventListener('mouseenter', function() {
            marquee.style.animationPlayState = 'paused';
        });
        heroSection.addEventListener('mouseleave', function() {
            marquee.style.animationPlayState = 'running';
        });
    }

    console.log('✅ CareerConnectTZ page loaded successfully!');
});
