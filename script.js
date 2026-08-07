document.addEventListener('DOMContentLoaded', () => {

  /* ================= 1. MOBILE NAVIGATION & DROPDOWNS ================= */
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const dropdowns = document.querySelectorAll('.dropdown');

  // Toggle main mobile menu drawer on hamburger click
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
    });
  }

  // Toggle dropdown submenus on tap for mobile screens (<= 768px)
  dropdowns.forEach(dropdown => {
    const toggleBtn = dropdown.querySelector('.dropdown-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault(); // Stop instant anchor navigation on parent drop
          e.stopPropagation();
          
          // Close other open dropdowns for a clean accordion effect
          dropdowns.forEach(other => {
            if (other !== dropdown) {
              other.classList.remove('active');
            }
          });

          // Toggle clicked dropdown
          dropdown.classList.toggle('active');
        }
      });
    }
  });

  
  // Close mobile drawer when clicking any actual link (excluding dropdown toggles)
  const navAnchors = document.querySelectorAll('.nav-links a:not(.dropdown-toggle)');
  navAnchors.forEach(anchor => {
    anchor.addEventListener('click', () => {
      if (window.innerWidth <= 768 && navLinks) {
        navLinks.classList.remove('active');
      }
    });
  });

  // Close mobile menu when tapping anywhere outside the header
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && navLinks && navLinks.classList.contains('active')) {
      if (!e.target.closest('header')) {
        navLinks.classList.remove('active');
        dropdowns.forEach(d => d.classList.remove('active'));
      }
    }
  });


  /* ================= 2. HERO IMAGE SLIDER ================= */
  // Ensure image paths point to your relative folder structure
  const heroImages = [
    'images/hero1.jpg',
    'images/hero2.jpg',
    'images/hero3.jpg'
  ];

  let currentImageIndex = 0;
  const heroSection = document.querySelector('.hero');

  function updateHeroBackground() {
    if (!heroSection || heroImages.length === 0) return;
    
    // Applies dark transparent gradient overlay on top of rotating background image
    heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('${heroImages[currentImageIndex]}')`;
    
    // Increment index and loop around
    currentImageIndex = (currentImageIndex + 1) % heroImages.length;
  }

  // Initialize initial background image immediately on load
  updateHeroBackground();

  // Rotate hero background image every 5 seconds (5000ms)
  setInterval(updateHeroBackground, 5000);


  /* ================= 3. SMOOTH SCROLLING FOR ANCHORS ================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      // Allow dropdown tap toggle on mobile without breaking
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
