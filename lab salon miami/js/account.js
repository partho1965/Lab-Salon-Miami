/**
 * LAB SALON MIAMI — Customer Dashboard & Appointment Management
 * Handles Upcoming/Past Appointments, Rescheduling & Cancellation Modals, Profile Settings
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = window.LabSalonAuth.requireAuth();
  if (!user) return;

  initCustomerDashboard(user);
});

function initCustomerDashboard(user) {
  renderProfileInfo(user);
  renderAppointmentsList(user);
  initProfileEditForm(user);
  initDashboardLogout();
}

// 1. Render Customer Profile Overview
function renderProfileInfo(user) {
  const greetingEl = document.getElementById('account-greeting');
  const emailEl = document.getElementById('account-email');
  const hairTypeEl = document.getElementById('account-hair-type');
  const hairLengthEl = document.getElementById('account-hair-length');

  if (greetingEl) greetingEl.textContent = `${user.firstName} ${user.lastName}`;
  if (emailEl) emailEl.textContent = user.email;
  if (hairTypeEl) hairTypeEl.textContent = user.hairType || 'Not specified';
  if (hairLengthEl) hairLengthEl.textContent = user.hairLength || 'Not specified';
}

// 2. Render Upcoming and Past Appointments
function renderAppointmentsList(user) {
  const upcomingContainer = document.getElementById('upcoming-appointments-list');
  const pastContainer = document.getElementById('past-appointments-list');
  if (!upcomingContainer) return;

  const allAppointments = window.LabSalonStore.getAppointments();
  // Filter for this customer (by ID or matching email)
  const userAppointments = allAppointments.filter(a =>
    a.customerId === user.id ||
    (a.customerEmail && a.customerEmail.toLowerCase() === user.email.toLowerCase())
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const upcoming = userAppointments.filter(a =>
    a.date >= todayStr && a.status !== 'Cancelled' && a.status !== 'Completed'
  );

  const past = userAppointments.filter(a =>
    a.date < todayStr || a.status === 'Cancelled' || a.status === 'Completed'
  );

  // Render Upcoming
  if (!upcoming.length) {
    upcomingContainer.innerHTML = `
      <div class="empty-state-card">
        <p>You have no upcoming appointments reserved at this time.</p>
        <a href="/booking.html" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Book an Appointment</a>
      </div>
    `;
  } else {
    upcomingContainer.innerHTML = upcoming.map(apt => `
      <div class="account-apt-card" data-apt-id="${apt.id}">
        <div class="apt-card-header">
          <span class="apt-number">${apt.appointmentNumber}</span>
          <span class="badge badge-${apt.status.toLowerCase()}">${apt.status}</span>
        </div>
        <div class="apt-card-body">
          <h4 class="apt-service-name">${apt.serviceName}</h4>
          <p class="apt-meta-line">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Artist: <strong>${apt.stylistName}</strong>
          </p>
          <p class="apt-meta-line">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Date: <strong>${apt.date}</strong> at <strong>${formatTime12(apt.time)}</strong> (${apt.duration} min)
          </p>
          <p class="apt-meta-line">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Investment: <strong>$${apt.price}</strong>
          </p>
        </div>
        <div class="apt-card-actions">
          <button type="button" class="btn btn-outline btn-sm btn-reschedule" data-id="${apt.id}">Reschedule</button>
          <button type="button" class="btn btn-text btn-cancel-apt" data-id="${apt.id}">Cancel</button>
        </div>
      </div>
    `).join('');
  }

  // Render Past
  if (pastContainer) {
    if (!past.length) {
      pastContainer.innerHTML = `<p class="empty-note">No past appointment records found.</p>`;
    } else {
      pastContainer.innerHTML = past.map(apt => `
        <div class="account-apt-card history" data-apt-id="${apt.id}">
          <div class="apt-card-header">
            <span class="apt-number">${apt.appointmentNumber}</span>
            <span class="badge badge-${apt.status.toLowerCase()}">${apt.status}</span>
          </div>
          <div class="apt-card-body">
            <h5 class="apt-service-name">${apt.serviceName}</h5>
            <p class="apt-meta-line">Artist: ${apt.stylistName} • ${apt.date}</p>
          </div>
          <div class="apt-card-actions">
            <a href="/booking.html?service=${apt.serviceId}" class="btn btn-outline btn-sm">Book Again</a>
          </div>
        </div>
      `).join('');
    }
  }

  // Bind actions
  document.querySelectorAll('.btn-cancel-apt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openCancelModal(id, user);
    });
  });

  document.querySelectorAll('.btn-reschedule').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openRescheduleModal(id, user);
    });
  });
}

// 3. Reschedule Modal Logic
function openRescheduleModal(aptId, user) {
  const apt = window.LabSalonStore.getAppointmentById(aptId);
  if (!apt) return;

  let modal = document.getElementById('reschedule-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reschedule-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <button class="modal-close" aria-label="Close modal">&times;</button>
        <h3 class="modal-title" style="margin-bottom: 0.5rem;">Reschedule Appointment</h3>
        <p style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--soft-gray);">${apt.serviceName} with ${apt.stylistName}</p>

        <div class="form-group">
          <label class="form-label">Select New Date</label>
          <input type="date" id="reschedule-date" class="form-control">
        </div>

        <div class="form-group">
          <label class="form-label">Available Time Slots</label>
          <select id="reschedule-time" class="form-control form-select">
            <option value="">Select a date first...</option>
          </select>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button type="button" id="btn-save-reschedule" class="btn btn-primary" style="flex: 1;">Save Changes</button>
          <button type="button" class="btn btn-outline modal-close-btn" style="flex: 1;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const dateInput = modal.querySelector('#reschedule-date');
  const timeSelect = modal.querySelector('#reschedule-time');
  const saveBtn = modal.querySelector('#btn-save-reschedule');
  const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');

  // Tomorrow min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];

  dateInput.onchange = (e) => {
    const selectedDate = e.target.value;
    if (!selectedDate) return;
    const slots = window.LabSalonStore.getAvailableSlots(apt.stylistId, selectedDate, apt.duration || 60);
    if (!slots.length) {
      timeSelect.innerHTML = `<option value="">No openings on this date</option>`;
    } else {
      timeSelect.innerHTML = slots.map(s => `<option value="${s}">${formatTime12(s)}</option>`).join('');
    }
  };

  saveBtn.onclick = () => {
    const newDate = dateInput.value;
    const newTime = timeSelect.value;
    if (!newDate || !newTime) {
      alert('Please select both a date and an available time slot.');
      return;
    }

    apt.date = newDate;
    apt.time = newTime;
    apt.status = 'Confirmed';
    window.LabSalonStore.saveAppointment(apt);

    alert(`Your appointment has been successfully rescheduled to ${newDate} at ${formatTime12(newTime)}.`);
    modal.classList.remove('active');
    renderAppointmentsList(user);
  };

  closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.classList.add('active');
}

// 4. Cancel Modal Logic (Enforcing salon 24h notice policy)
function openCancelModal(aptId, user) {
  const apt = window.LabSalonStore.getAppointmentById(aptId);
  if (!apt) return;

  const confirmed = confirm(`Are you sure you want to cancel appointment ${apt.appointmentNumber} for ${apt.serviceName}?\n\nPlease note: In accordance with our boutique salon policy, cancellations must be made at least 24 hours in advance.`);
  if (confirmed) {
    window.LabSalonStore.cancelAppointment(aptId, 'Cancelled by client via dashboard');
    alert('Your appointment has been cancelled.');
    renderAppointmentsList(user);
  }
}

// 5. Profile Edit Form
function initProfileEditForm(user) {
  const form = document.getElementById('profile-edit-form');
  if (!form) return;

  const fnInput = form.querySelector('[name="firstName"]');
  const lnInput = form.querySelector('[name="lastName"]');
  const phInput = form.querySelector('[name="phone"]');
  const htInput = form.querySelector('[name="hairType"]');
  const hlInput = form.querySelector('[name="hairLength"]');

  if (fnInput) fnInput.value = user.firstName || '';
  if (lnInput) lnInput.value = user.lastName || '';
  if (phInput) phInput.value = user.phone || '';
  if (htInput) htInput.value = user.hairType || '';
  if (hlInput) hlInput.value = user.hairLength || '';

  form.onsubmit = (e) => {
    e.preventDefault();
    user.firstName = fnInput.value.trim();
    user.lastName = lnInput.value.trim();
    user.phone = phInput.value.trim();
    user.hairType = htInput.value.trim();
    user.hairLength = hlInput.value.trim();

    window.LabSalonStore.saveCustomer(user);
    window.LabSalonAuth.createSession(user);
    renderProfileInfo(user);
    alert('Profile details updated successfully.');
  };
}

// 6. Logout
function initDashboardLogout() {
  document.querySelectorAll('[data-logout-btn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.LabSalonAuth.logout();
    });
  });
}

function formatTime12(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}
