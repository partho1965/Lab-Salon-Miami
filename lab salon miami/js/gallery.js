/**
 * LAB SALON MIAMI — Gallery & Lightbox Controller
 * Category Filtering, Masonry Layout, and Accessible Lightbox Modal
 */

const GALLERY_DATA = [
  {
    id: 1,
    title: 'Architectural Bob with Internal Texture',
    category: 'haircuts',
    categoryLabel: 'Precision Cut',
    src: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=85',
    thumb: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Lived-In Caramel Balayage',
    category: 'balayage',
    categoryLabel: 'Luxury Balayage',
    src: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=85',
    thumb: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'Miami Blonde Foilayage & Root Melt',
    category: 'blonding',
    categoryLabel: 'Blonding',
    src: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=85',
    thumb: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    title: 'Dimensional Rich Espresso Brunette',
    category: 'brunette',
    categoryLabel: 'Dimensional Color',
    src: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=85',
    thumb: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    title: 'Boutique Studio Consultation Lounge',
    category: 'interior',
    categoryLabel: 'Studio Interior',
    src: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=85',
    thumb: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    title: 'Editorial Beachy Waves & High Gloss',
    category: 'styling',
    categoryLabel: 'Styling',
    src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=85',
    thumb: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 7,
    title: 'Platinum Ice Micro-Highlights',
    category: 'blonding',
    categoryLabel: 'Blonding',
    src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=85',
    thumb: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 8,
    title: 'Long Layered Movement & Blowout',
    category: 'haircuts',
    categoryLabel: 'Precision Cut',
    src: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1200&q=85',
    thumb: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 9,
    title: 'Custom Seamless Invisible Extensions',
    category: 'styling',
    categoryLabel: 'Extensions',
    src: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=85',
    thumb: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=600&q=80'
  }
];

class GalleryManager {
  constructor() {
    this.items = GALLERY_DATA;
    this.filteredItems = [...this.items];
    this.currentIndex = 0;
    this.init();
  }

  init() {
    this.renderGrid();
    this.initFilters();
    this.initLightbox();
  }

  renderGrid(itemsToRender = this.filteredItems) {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    grid.innerHTML = itemsToRender.map((item, index) => `
      <div class="gallery-item reveal reveal-scale" data-id="${item.id}" data-index="${index}">
        <img src="${item.thumb}" alt="${item.title}" loading="lazy">
        <div class="gallery-overlay">
          <span class="gallery-category">${item.categoryLabel}</span>
          <h4 class="gallery-title">${item.title}</h4>
        </div>
      </div>
    `).join('');

    // Rebind click to open lightbox
    grid.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', () => {
        const index = parseInt(el.getAttribute('data-index'), 10);
        this.openLightbox(index);
      });
    });

    // Trigger reveal class
    setTimeout(() => {
      grid.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.add('is-revealed');
      });
    }, 50);
  }

  initFilters() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.getAttribute('data-filter');
        if (cat === 'all') {
          this.filteredItems = [...this.items];
        } else {
          this.filteredItems = this.items.filter(item => item.category === cat);
        }
        this.renderGrid();
      });
    });
  }

  initLightbox() {
    let modal = document.querySelector('.lightbox-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'lightbox-modal';
      modal.innerHTML = `
        <button class="lightbox-btn lightbox-close" aria-label="Close Lightbox">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <button class="lightbox-btn lightbox-prev" aria-label="Previous Image">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="lightbox-content">
          <img class="lightbox-img" src="" alt="Gallery visual">
          <div class="lightbox-caption">
            <p class="lightbox-cat"></p>
            <h4 class="lightbox-title"></h4>
          </div>
        </div>
        <button class="lightbox-btn lightbox-next" aria-label="Next Image">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      `;
      document.body.appendChild(modal);
    }

    const closeBtn = modal.querySelector('.lightbox-close');
    const prevBtn = modal.querySelector('.lightbox-prev');
    const nextBtn = modal.querySelector('.lightbox-next');

    closeBtn.addEventListener('click', () => this.closeLightbox());
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.navigate(-1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.navigate(1); });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
    });
  }

  openLightbox(index) {
    this.currentIndex = index;
    const modal = document.querySelector('.lightbox-modal');
    if (!modal) return;

    this.updateLightboxContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    const modal = document.querySelector('.lightbox-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  navigate(direction) {
    this.currentIndex = (this.currentIndex + direction + this.filteredItems.length) % this.filteredItems.length;
    this.updateLightboxContent();
  }

  updateLightboxContent() {
    const item = this.filteredItems[this.currentIndex];
    if (!item) return;

    const modal = document.querySelector('.lightbox-modal');
    const img = modal.querySelector('.lightbox-img');
    const title = modal.querySelector('.lightbox-title');
    const cat = modal.querySelector('.lightbox-cat');

    img.src = item.src;
    img.alt = item.title;
    title.textContent = item.title;
    cat.textContent = item.categoryLabel;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.gallery-grid')) {
    window.LabSalonGallery = new GalleryManager();
  }
});
