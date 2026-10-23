/**
 * LAB SALON MIAMI — Multi-Step Interactive Booking Engine
 * Strict Anti-Collision Slot Generation, Dynamic Stylist Calendars, & Confirmation
 */

class BookingEngine {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 6;
    this.bookingData = {
      serviceId: null,
      service: null,
      stylistId: null,
      stylist: null,
      date: null,
      time: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      hairNotes: ''
    };
    this.init();
  }

  init() {
    this.autofillUser();
    this.renderServices();
    this.renderStylists();
    this.initDatePicker();
    this.initStepNavigation();
    this.checkUrlParams();
  }

  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    if (serviceParam) {
      const srv = window.LabSalonStore.getServiceById(serviceParam);
      if (srv) {
        this.selectService(srv);
      }
    }
  }

  autofillUser() {
    const user = window.LabSalonAuth ? window.LabSalonAuth.getCurrentUser() : null;
    if (user) {
      this.bookingData.firstName = user.firstName || '';
      this.bookingData.lastName = user.lastName || '';
      this.bookingData.email = user.email || '';
      this.bookingData.phone = user.phone || '';
      this.bookingData.hairNotes = `Hair Type: ${user.hairType || 'N/A'}, Length: ${user.hairLength || 'N/A'}`;
    }
  }

  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) return;

    // Validate requirements before advancing
    if (stepNumber > 1 && !this.bookingData.service) {
      alert('Please select a service first.');
      return;
    }
    if (stepNumber > 2 && !this.bookingData.stylist) {
      alert('Please select your preferred stylist.');
      return;
    }
    if (stepNumber > 3 && !this.bookingData.date) {
      alert('Please choose an appointment date.');
      return;
    }
    if (stepNumber > 4 && !this.bookingData.time) {
      alert('Please select an available time slot.');
      return;
    }

    this.currentStep = stepNumber;

    // Update Step Indicators
    document.querySelectorAll('.booking-step-badge').forEach((badge, idx) => {
      const stepIdx = idx + 1;
      badge.classList.toggle('active', stepIdx === this.currentStep);
      badge.classList.toggle('completed', stepIdx < this.currentStep);
    });

    // Update Step Screens
    document.querySelectorAll('.booking-step-pane').forEach((pane, idx) => {
      pane.classList.toggle('active', idx + 1 === this.currentStep);
    });

    // Run step-specific logic
    if (this.currentStep === 4) {
      this.renderAvailableSlots();
    } else if (this.currentStep === 5) {
      this.renderReviewSummary();
    }

    // Scroll to top of booking container
    const container = document.querySelector('.booking-wizard-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  initStepNavigation() {
    document.querySelectorAll('[data-next-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(this.currentStep + 1);
      });
    });

    document.querySelectorAll('[data-prev-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(this.currentStep - 1);
      });
    });
  }

  // STEP 1: RENDER SERVICES
  renderServices() {
    const container = document.getElementById('step-services-list');
    if (!container) return;

    const services = window.LabSalonStore.getServices();
    const categories = [...new Set(services.map(s => s.category))];

    container.innerHTML = categories.map(cat => `
      <div class="service-booking-group">
        <h4 class="booking-group-title">${cat}</h4>
        <div class="booking-cards-grid">
          ${services.filter(s => s.category === cat).map(s => `
            <div class="booking-select-card service-item ${this.bookingData.serviceId === s.id ? 'selected' : ''}" data-service-id="${s.id}">
              <div class="card-top">
                <span class="card-name">${s.name}</span>
                <span class="card-price">$${s.price}</span>
              </div>
              <p class="card-desc">${s.description}</p>
              <div class="card-bottom">
                <span class="card-duration">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ${s.duration} min
                </span>
                <button type="button" class="btn btn-primary btn-sm select-btn">Select</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.service-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-service-id');
        const s = window.LabSalonStore.getServiceById(id);
        this.selectService(s);
      });
    });
  }

  selectService(service) {
    this.bookingData.serviceId = service.id;
    this.bookingData.service = service;

    document.querySelectorAll('#step-services-list .service-item').forEach(el => {
      el.classList.toggle('selected', el.getAttribute('data-service-id') === service.id);
    });

    setTimeout(() => this.goToStep(2), 250);
  }

  // STEP 2: RENDER STYLISTS
  renderStylists() {
    const container = document.getElementById('step-stylists-list');
    if (!container) return;

    const stylists = window.LabSalonStore.getStylists();

    container.innerHTML = stylists.map(sty => `
      <div class="booking-select-card stylist-item ${this.bookingData.stylistId === sty.id ? 'selected' : ''}" data-stylist-id="${sty.id}">
        <img src="${sty.image}" alt="${sty.name}" class="stylist-portrait">
        <div class="stylist-info">
          <span class="stylist-role">${sty.title}</span>
          <h4 class="stylist-name">${sty.name}</h4>
          <p class="stylist-bio">${sty.bio}</p>
          <div class="stylist-tags">
            ${sty.specialties.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <button type="button" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Select Stylist</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.stylist-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-stylist-id');
        const sty = window.LabSalonStore.getStylistById(id);
        this.selectStylist(sty);
      });
    });
  }

  selectStylist(stylist) {
    this.bookingData.stylistId = stylist.id;
    this.bookingData.stylist = stylist;

    document.querySelectorAll('#step-stylists-list .stylist-item').forEach(el => {
      el.classList.toggle('selected', el.getAttribute('data-stylist-id') === stylist.id);
    });

    setTimeout(() => this.goToStep(3), 250);
  }

  // STEP 3: DATE PICKER
  initDatePicker() {
    const input = document.getElementById('booking-date-input');
    if (!input) return;

    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minStr = tomorrow.toISOString().split('T')[0];
    input.min = minStr;

    // Set max date to 60 days ahead
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    input.max = maxDate.toISOString().split('T')[0];

    input.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (!selected) return;

      const dateObj = new Date(selected + 'T00:00:00');
      const day = dateObj.getDay();

      if (this.bookingData.stylist && !this.bookingData.stylist.workingDays.includes(day)) {
        alert(`${this.bookingData.stylist.name} is not available on this day of the week. Please choose another date.`);
        input.value = '';
        return;
      }

      this.bookingData.date = selected;
      setTimeout(() => this.goToStep(4), 200);
    });
  }

  // STEP 4: RENDER AVAILABLE SLOTS
  renderAvailableSlots() {
    const container = document.getElementById('step-slots-list');
    const notice = document.getElementById('slots-notice');
    if (!container) return;

    const { stylistId, date, service } = this.bookingData;
    const duration = service ? service.duration : 60;

    const slots = window.LabSalonStore.getAvailableSlots(stylistId, date, duration);

    if (notice) {
      notice.textContent = `Showing real-time openings for ${this.bookingData.stylist.name} on ${this.bookingData.date}`;
    }

    if (!slots.length) {
      container.innerHTML = `
        <div class="empty-slots-msg">
          <p>No available appointment windows found on this date. Please select another date.</p>
          <button type="button" class="btn btn-outline" data-prev-step>Choose Different Date</button>
        </div>
      `;
      container.querySelector('[data-prev-step]').addEventListener('click', () => this.goToStep(3));
      return;
    }

    container.innerHTML = `
      <div class="time-slots-grid">
        ${slots.map(slot => `
          <button type="button" class="time-slot-btn ${this.bookingData.time === slot ? 'selected' : ''}" data-slot="${slot}">
            ${this.formatTime12Hour(slot)}
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.bookingData.time = btn.getAttribute('data-slot');
        setTimeout(() => this.goToStep(5), 200);
      });
    });
  }

  formatTime12Hour(time24) {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  }

  // STEP 5: REVIEW SUMMARY & DETAILS CONFIRMATION
  renderReviewSummary() {
    const summaryCard = document.getElementById('booking-summary-card');
    if (!summaryCard) return;

    summaryCard.innerHTML = `
      <div class="summary-row">
        <span class="label">Service</span>
        <span class="value">${this.bookingData.service.name}</span>
      </div>
      <div class="summary-row">
        <span class="label">Artist</span>
        <span class="value">${this.bookingData.stylist.name}</span>
      </div>
      <div class="summary-row">
        <span class="label">Date & Time</span>
        <span class="value">${this.bookingData.date} at ${this.formatTime12Hour(this.bookingData.time)}</span>
      </div>
      <div class="summary-row">
        <span class="label">Duration</span>
        <span class="value">${this.bookingData.service.duration} Minutes</span>
      </div>
      <div class="summary-row total">
        <span class="label">Investment</span>
        <span class="value">$${this.bookingData.service.price}</span>
      </div>
    `;

    // Fill input fields if data exists
    const fnInput = document.getElementById('book-fn');
    const lnInput = document.getElementById('book-ln');
    const emInput = document.getElementById('book-em');
    const phInput = document.getElementById('book-ph');
    const ntInput = document.getElementById('book-notes');

    if (fnInput) fnInput.value = this.bookingData.firstName;
    if (lnInput) lnInput.value = this.bookingData.lastName;
    if (emInput) emInput.value = this.bookingData.email;
    if (phInput) phInput.value = this.bookingData.phone;
    if (ntInput && this.bookingData.hairNotes) ntInput.value = this.bookingData.hairNotes;

    const confirmBtn = document.getElementById('btn-confirm-appointment');
    if (confirmBtn) {
      confirmBtn.onclick = () => this.submitAppointment();
    }
  }

  // STEP 6: SUBMIT & RENDER RECEIPT
  submitAppointment() {
    const fnInput = document.getElementById('book-fn');
    const lnInput = document.getElementById('book-ln');
    const emInput = document.getElementById('book-em');
    const phInput = document.getElementById('book-ph');
    const ntInput = document.getElementById('book-notes');

    if (!fnInput.value.trim() || !lnInput.value.trim() || !emInput.value.trim() || !phInput.value.trim()) {
      alert('Please fill out all required contact fields.');
      return;
    }

    this.bookingData.firstName = fnInput.value.trim();
    this.bookingData.lastName = lnInput.value.trim();
    this.bookingData.email = emInput.value.trim();
    this.bookingData.phone = phInput.value.trim();
    this.bookingData.hairNotes = ntInput ? ntInput.value.trim() : '';

    const currentUser = window.LabSalonAuth ? window.LabSalonAuth.getCurrentUser() : null;

    const newAppointment = {
      customerId: currentUser ? currentUser.id : 'guest-' + Date.now(),
      customerName: `${this.bookingData.firstName} ${this.bookingData.lastName}`,
      customerEmail: this.bookingData.email,
      customerPhone: this.bookingData.phone,
      serviceId: this.bookingData.service.id,
      serviceName: this.bookingData.service.name,
      stylistId: this.bookingData.stylist.id,
      stylistName: this.bookingData.stylist.name,
      date: this.bookingData.date,
      time: this.bookingData.time,
      duration: this.bookingData.service.duration,
      price: this.bookingData.service.price,
      status: 'Confirmed',
      notes: this.bookingData.hairNotes
    };

    const saved = window.LabSalonStore.saveAppointment(newAppointment);
    this.renderReceipt(saved);
    this.goToStep(6);
  }

  renderReceipt(apt) {
    const receiptBox = document.getElementById('booking-receipt-box');
    if (!receiptBox) return;

    receiptBox.innerHTML = `
      <div class="receipt-success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <span class="eyebrow">RESERVATION CONFIRMED</span>
      <h2 class="receipt-title">Your Appointment is Set</h2>
      <p class="receipt-number">Confirmation Number: <strong>${apt.appointmentNumber}</strong></p>

      <div class="receipt-details">
        <div class="receipt-item">
          <span>Client:</span>
          <strong>${apt.customerName}</strong>
        </div>
        <div class="receipt-item">
          <span>Service:</span>
          <strong>${apt.serviceName}</strong>
        </div>
        <div class="receipt-item">
          <span>Artist:</span>
          <strong>${apt.stylistName}</strong>
        </div>
        <div class="receipt-item">
          <span>Date & Time:</span>
          <strong>${apt.date} at ${this.formatTime12Hour(apt.time)}</strong>
        </div>
        <div class="receipt-item">
          <span>Studio Address:</span>
          <strong>1442 NE Miami Pl, Suite 229, Miami, FL 33132</strong>
        </div>
      </div>

      <div class="receipt-actions">
        <a href="/account.html" class="btn btn-primary">View in Dashboard</a>
        <a href="/index.html" class="btn btn-outline">Return to Home</a>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.booking-wizard-container')) {
    window.LabSalonBooking = new BookingEngine();
  }
});
