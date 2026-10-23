/**
 * LAB SALON MIAMI — Animations & Interactive Showcase
 * Scroll Reveals, Before/After Slider, Testimonials Carousel, Horizontal Carousel
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveals();
  initTransformationSlider();
  initTestimonialsCarousel();
  initColorHorizontalScroll();
  initNumberCounters();
  initParallaxEffects();
});

// 1. Scroll-triggered Reveals via IntersectionObserver
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal, .clip-reveal');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// 2. Before / After Interactive Draggable Comparison Slider
function initTransformationSlider() {
  const slider = document.querySelector('.transformation-wrapper');
  if (!slider) return;

  const beforeBox = slider.querySelector('.transformation-before');
  const beforeImg = beforeBox.querySelector('img');
  const handle = slider.querySelector('.transformation-handle');

  let isDragging = false;

  const updatePosition = (clientX) => {
    const rect = slider.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;

    const percentage = (offsetX / rect.width) * 100;
    beforeBox.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;

    // Keep before image matching the parent slider width
    if (beforeImg) {
      beforeImg.style.width = `${rect.width}px`;
      beforeImg.style.height = `${rect.height}px`;
    }
  };

  // Sync size on window resize
  window.addEventListener('resize', () => {
    const rect = slider.getBoundingClientRect();
    if (beforeImg) {
      beforeImg.style.width = `${rect.width}px`;
      beforeImg.style.height = `${rect.height}px`;
    }
  });

  // Mouse Events
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  });

  // Touch Events for Mobile
  handle.addEventListener('touchstart', (e) => {
    isDragging = true;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches.length) return;
    updatePosition(e.touches[0].clientX);
  }, { passive: true });

  // Initial call to calibrate image dimensions
  const rect = slider.getBoundingClientRect();
  if (beforeImg && rect.width) {
    beforeImg.style.width = `${rect.width}px`;
    beforeImg.style.height = `${rect.height}px`;
  }
}

// 3. Testimonials Autoplay Carousel with Interaction Pause
function initTestimonialsCarousel() {
  const container = document.querySelector('.testimonial-container');
  if (!container) return;

  const slides = container.querySelectorAll('.testimonial-slide');
  const dotsContainer = container.querySelector('.carousel-dots');
  const prevBtn = container.querySelector('.carousel-prev');
  const nextBtn = container.querySelector('.carousel-next');

  if (!slides.length) return;

  let currentIndex = 0;
  let autoplayInterval = null;
  const slideDuration = 6000;

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        goToSlide(idx);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  const goToSlide = (idx) => {
    slides[currentIndex].classList.remove('active');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
    if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

    currentIndex = (idx + slides.length) % slides.length;

    slides[currentIndex].classList.add('active');
    if (dots[currentIndex]) dots[currentIndex].classList.add('active');
  };

  const nextSlide = () => goToSlide(currentIndex + 1);
  const prevSlide = () => goToSlide(currentIndex - 1);

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      restartAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      restartAutoplay();
    });
  }

  const startAutoplay = () => {
    if (autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = setInterval(nextSlide, slideDuration);
  };

  const pauseAutoplay = () => {
    if (autoplayInterval) clearInterval(autoplayInterval);
  };

  const restartAutoplay = () => {
    pauseAutoplay();
    startAutoplay();
  };

  // Pause on user hover
  container.addEventListener('mouseenter', pauseAutoplay);
  container.addEventListener('mouseleave', startAutoplay);
  container.addEventListener('touchstart', pauseAutoplay, { passive: true });

  startAutoplay();
}

// 4. Color Horizontal Drag / Scroll
function initColorHorizontalScroll() {
  const slider = document.querySelector('.color-carousel-wrapper');
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.8; // scroll speed multiplier
    slider.scrollLeft = scrollLeft - walk;
  });
}

// 5. Number Counters on Scroll Into View
function initNumberCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-counter'));
        const isDecimal = target % 1 !== 0;
        let current = 0;
        const duration = 1600;
        const stepTime = 30;
        const steps = duration / stepTime;
        const increment = target / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = isDecimal ? target.toFixed(1) : Math.round(target);
            clearInterval(timer);
          } else {
            el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
          }
        }, stepTime);

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// 6. Subtle Parallax Effect
function initParallaxEffects() {
  if (window.innerWidth < 992) return;
  const heroBg = document.querySelector('.hero-bg-img');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (heroBg && scrollY < window.innerHeight) {
      heroBg.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0) scale(1.02)`;
    }
  }, { passive: true });
}
