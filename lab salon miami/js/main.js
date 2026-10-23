/**
 * LAB SALON MIAMI — Main Orchestrator
 * Preloader, Navigation blur, Mobile drawer, Desktop Custom Cursor, Floating Previews
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initHeaderScroll();
  initMobileNav();
  initCustomCursor();
  initServiceCardPreviews();
  initMagneticButtons();
});

// 1. Initial Luxury Preloader (< 1.5s)
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  const hero = document.querySelector('.hero');

  if (!preloader) {
    if (hero) hero.classList.add('loaded');
    return;
  }

  // Preloader duration 1.25s
  setTimeout(() => {
    preloader.classList.add('fade-out');
    if (hero) hero.classList.add('loaded');

    setTimeout(() => {
      preloader.style.display = 'none';
    }, 850);
  }, 1100);
}

// 2. Header Scroll Effect (Transparent to Solid/Blurred Glass)
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// 3. Mobile Navigation Toggle
function initMobileNav() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.classList.toggle('open');
    navMenu.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close when clicking nav link
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('open');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// 4. Custom Editorial Cursor (Desktop Only)
function initCustomCursor() {
  // Only activate on devices with a fine pointer (desktop mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';

  const follower = document.createElement('div');
  follower.className = 'custom-cursor-follower';

  const cursorText = document.createElement('span');
  cursorText.className = 'custom-cursor-text';
  cursor.appendChild(cursorText);

  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Smooth follower animation loop
  const renderFollower = () => {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(renderFollower);
  };
  requestAnimationFrame(renderFollower);

  // Dynamic context interactions
  const setupHoverTargets = () => {
    // Gallery & portfolio images -> "VIEW"
    document.querySelectorAll('.gallery-item, .transformation-wrapper').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        follower.classList.add('cursor-hover');
        cursorText.textContent = el.classList.contains('transformation-wrapper') ? 'DRAG' : 'VIEW';
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        follower.classList.remove('cursor-hover');
        cursorText.textContent = '';
      });
    });

    // Buttons & CTAs -> "OPEN"
    document.querySelectorAll('.btn-primary, .btn-outline, .service-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        follower.classList.add('cursor-hover');
        cursorText.textContent = 'OPEN';
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        follower.classList.remove('cursor-hover');
        cursorText.textContent = '';
      });
    });

    // Standard links -> subtle ring expansion
    document.querySelectorAll('a:not(.btn), button:not(.btn)').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-subtle');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-subtle');
      });
    });
  };

  setupHoverTargets();
}

// 5. Floating Service Preview Overlay on Desktop Hover
function initServiceCardPreviews() {
  const cards = document.querySelectorAll('.service-card[data-preview]');
  if (!cards.length || window.innerWidth < 992) return;

  let overlay = document.querySelector('.service-preview-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'service-preview-overlay';
    overlay.innerHTML = `<img src="" alt="Service preview">`;
    document.body.appendChild(overlay);
  }

  const previewImg = overlay.querySelector('img');

  cards.forEach(card => {
    const imgUrl = card.getAttribute('data-preview');
    card.addEventListener('mouseenter', (e) => {
      if (imgUrl) {
        previewImg.src = imgUrl;
        overlay.classList.add('active');
      }
    });

    card.addEventListener('mousemove', (e) => {
      overlay.style.left = `${e.clientX + 160}px`;
      overlay.style.top = `${e.clientY}px`;
    });

    card.addEventListener('mouseleave', () => {
      overlay.classList.remove('active');
    });
  });
}

// 6. Magnetic Buttons on Desktop
function initMagneticButtons() {
  if (window.innerWidth < 992) return;
  const magneticEls = document.querySelectorAll('.magnetic');

  magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0px, 0px)';
    });
  });
}
