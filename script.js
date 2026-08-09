/**
 * =============================================================
 * SCRIPT.JS - Custom JavaScript for CareerConnectTZ
 * =============================================================
 */

document.addEventListener('DOMContentLoaded', function() {

    // ── LANGUAGE SWITCHER ──
    var langLinks = document.querySelectorAll('.language-switch-nav a');
    langLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            langLinks.forEach(function(l) { l.classList.remove('active'); });
            this.classList.add('active');
            var lang = this.getAttribute('data-lang');
            alert('🌍 Language switched to ' + lang.toUpperCase() + ' (demo)');
        });
    });

    // ── SEARCH ──
    var searchForm = document.querySelector('.navbar-custom form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var input = this.querySelector('input[type="search"]');
            if (input && input.value.trim() !== '') {
                alert('🔍 You searched for: "' + input.value.trim() + '"');
            }
        });
    }

    // ── MARQUEE PAUSE ON HOVER ──
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

    // ── FLOATING WHATSAPP POPUP ──
    var popup = document.getElementById('waPopup');
    var toggle = document.getElementById('waToggle');
    var close = document.getElementById('waClose');
    var popupVisible = false;

    setTimeout(function() {
        if (popup) {
            popup.classList.add('show');
            popupVisible = true;
        }
    }, 2500);

    if (toggle) {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (popup) {
                popup.classList.toggle('show');
                popupVisible = popup.classList.contains('show');
            }
        });
    }

    if (close) {
        close.addEventListener('click', function(e) {
            e.stopPropagation();
            if (popup) {
                popup.classList.remove('show');
                popupVisible = false;
            }
        });
    }

    document.addEventListener('click', function(e) {
        if (popupVisible && popup && !popup.contains(e.target) && e.target !== toggle) {
            popup.classList.remove('show');
            popupVisible = false;
        }
    });

    // ── HERO CAROUSEL ──
    var heroCarousel = document.getElementById('heroCarousel');
    if (heroCarousel) {
        new bootstrap.Carousel(heroCarousel, {
            interval: 5000,
            pause: 'hover',
            wrap: true
        });
    }

    console.log('✅ CareerConnectTZ loaded successfully!');
});
