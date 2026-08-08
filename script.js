document.addEventListener('DOMContentLoaded', () => {

  /* ================= 1. MOBILE NAVIGATION ================= */
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const dropdowns = document.querySelectorAll('.dropdown');

  // Toggle mobile navigation menu
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = navLinks.classList.toggle('active');
      mobileBtn.setAttribute('aria-expanded', isActive);
      mobileBtn.textContent = isActive ? '✕' : '☰';
    });
  }

  // Toggle dropdowns on mobile tap
  dropdowns.forEach(dropdown => {
    const toggleBtn = dropdown.querySelector('.dropdown-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();

          // Close other active dropdowns
          dropdowns.forEach(other => {
            if (other !== dropdown) {
              other.classList.remove('active');
            }
          });

          dropdown.classList.toggle('active');
        }
      });
    }
  });

  // Close nav drawer when clicking internal anchor links
  const navAnchors = document.querySelectorAll('.nav-links a:not(.dropdown-toggle)');
  navAnchors.forEach(anchor => {
    anchor.addEventListener('click', () => {
      if (window.innerWidth <= 768 && navLinks) {
        navLinks.classList.remove('active');
        if (mobileBtn) {
          mobileBtn.textContent = '☰';
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Close menu when clicking outside header
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && navLinks && navLinks.classList.contains('active')) {
      if (!e.target.closest('header')) {
        navLinks.classList.remove('active');
        dropdowns.forEach(d => d.classList.remove('active'));
        if (mobileBtn) {
          mobileBtn.textContent = '☰';
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });


  /* ================= 2. HERO IMAGE SLIDER ================= */
  const heroImages = [
    'images/hero1.jpg',
    'images/hero2.jpg',
    'images/hero3.jpg'
  ];

  let currentImageIndex = 0;
  const heroSection = document.querySelector('.hero');

  function updateHeroBackground() {
    if (!heroSection || heroImages.length === 0) return;

    // Gradient layer for contrast on top of changing background image
    heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('${heroImages[currentImageIndex]}')`;

    currentImageIndex = (currentImageIndex + 1) % heroImages.length;
  }

  updateHeroBackground();
  setInterval(updateHeroBackground, 5000);


  /* ================= 3. SMOOTH SCROLL ================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');

      if (this.classList.contains('dropdown-toggle') && window.innerWidth <= 768) {
        return;
      }

      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });

});
