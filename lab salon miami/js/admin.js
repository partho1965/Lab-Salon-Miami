/**
 * LAB SALON MIAMI — Comprehensive Admin Portal Controller
 * Appointment Management, Calendar Views, Service CRUD, Stylist Management, Settings & Charts
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce ADMIN role
  const user = window.LabSalonAuth.requireAuth('ADMIN');
  if (!user) return;

  initAdminSidebar();
  initAdminDashboard();
});

function initAdminSidebar() {
  const toggleBtn = document.querySelector('.admin-mobile-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Active nav link highlight
  const currentPath = window.location.pathname;
  document.querySelectorAll('.admin-nav-item').forEach(link => {
    if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });

  // Admin user info
  const user = window.LabSalonAuth.getCurrentUser();
  const nameEl = document.querySelector('.admin-user-name');
  if (nameEl && user) {
    nameEl.textContent = `${user.firstName} ${user.lastName}`;
  }
}

function initAdminDashboard() {
  renderKpis();
  renderRecentAppointmentsTable();
  renderAnalyticsCharts();
  initCalendarView();
  initServiceCrud();
  initStylistCrud();
  initCustomerDirectory();
  initSettingsForm();
}

// 1. KPI Cards
function renderKpis() {
  const analytics = window.LabSalonStore.getAnalytics();
  const appointments = window.LabSalonStore.getAppointments();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayCount = appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled').length;
  const upcomingCount = appointments.filter(a => a.date >= todayStr && a.status === 'Confirmed').length;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setVal('kpi-today-appointments', todayCount);
  setVal('kpi-upcoming-appointments', upcomingCount);
  setVal('kpi-total-customers', analytics.totalCustomers);
  setVal('kpi-monthly-revenue', `$${analytics.monthlyRevenue.toLocaleString()}`);
  setVal('kpi-completed-appointments', analytics.completed);
  setVal('kpi-cancellation-rate', analytics.cancellationRate);
}

// 2. Recent Appointments Table & Filter
function renderRecentAppointmentsTable() {
  const tableBody = document.getElementById('admin-appointments-tbody');
  if (!tableBody) return;

  const appointments = window.LabSalonStore.getAppointments();
  const searchInput = document.getElementById('search-appointments');
  const statusFilter = document.getElementById('filter-status');
  const stylistFilter = document.getElementById('filter-stylist');

  const filterAndRender = () => {
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const st = statusFilter ? statusFilter.value : 'all';
    const sty = stylistFilter ? stylistFilter.value : 'all';

    const filtered = appointments.filter(a => {
      const matchQ = !q ||
        a.appointmentNumber.toLowerCase().includes(q) ||
        a.customerName.toLowerCase().includes(q) ||
        a.serviceName.toLowerCase().includes(q);

      const matchSt = st === 'all' || a.status === st;
      const matchSty = sty === 'all' || a.stylistId === sty;

      return matchQ && matchSt && matchSty;
    });

    if (!filtered.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--soft-gray);">No matching appointments found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(apt => `
      <tr>
        <td><strong>${apt.appointmentNumber}</strong></td>
        <td>
          <div style="font-weight: 500;">${apt.customerName}</div>
          <div style="font-size: 0.75rem; color: var(--soft-gray);">${apt.customerEmail}</div>
        </td>
        <td>${apt.serviceName}</td>
        <td>${apt.stylistName}</td>
        <td>${apt.date} at ${apt.time}</td>
        <td><span class="badge badge-${apt.status.toLowerCase()}">${apt.status}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-primary btn-sm btn-action-confirm" data-id="${apt.id}" title="Confirm Appointment">✓</button>
            <button class="btn btn-outline btn-sm btn-action-complete" data-id="${apt.id}" title="Mark Completed">Done</button>
            <button class="btn btn-outline btn-sm btn-action-cancel" data-id="${apt.id}" title="Cancel" style="color: #e74c3c; border-color: rgba(231,76,60,0.3);">✕</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Bind action buttons
    tableBody.querySelectorAll('.btn-action-confirm').forEach(btn => {
      btn.onclick = () => {
        window.LabSalonStore.updateAppointmentStatus(btn.dataset.id, 'Confirmed');
        renderKpis();
        filterAndRender();
      };
    });

    tableBody.querySelectorAll('.btn-action-complete').forEach(btn => {
      btn.onclick = () => {
        window.LabSalonStore.updateAppointmentStatus(btn.dataset.id, 'Completed');
        renderKpis();
        filterAndRender();
      };
    });

    tableBody.querySelectorAll('.btn-action-cancel').forEach(btn => {
      btn.onclick = () => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
          window.LabSalonStore.updateAppointmentStatus(btn.dataset.id, 'Cancelled');
          renderKpis();
          filterAndRender();
        }
      };
    });
  };

  if (searchInput) searchInput.oninput = filterAndRender;
  if (statusFilter) statusFilter.onchange = filterAndRender;
  if (stylistFilter) stylistFilter.onchange = filterAndRender;

  filterAndRender();
}

// 3. Responsive SVG Analytics Charts (Pure Vanilla JavaScript, No heavy chart bloat)
function renderAnalyticsCharts() {
  // Chart 1: Appointments per Day (Bar chart)
  const aptChartContainer = document.getElementById('chart-appointments-daily');
  if (aptChartContainer) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = [4, 7, 12, 10, 16, 18, 5]; // Sample distribution
    const maxVal = 20;

    const bars = days.map((day, idx) => {
      const val = counts[idx];
      const heightPercent = (val / maxVal) * 180;
      const x = 50 + idx * 75;
      const y = 220 - heightPercent;

      return `
        <rect x="${x}" y="${y}" width="38" height="${heightPercent}" rx="4" fill="url(#goldGradient)" />
        <text x="${x + 19}" y="${y - 8}" text-anchor="middle" fill="#B99A67" font-size="11" font-weight="600">${val}</text>
        <text x="${x + 19}" y="245" text-anchor="middle" fill="#8D8A85" font-size="12">${day}</text>
      `;
    }).join('');

    aptChartContainer.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 600 270">
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#D4BA8A"/>
            <stop offset="100%" stop-color="#967849"/>
          </linearGradient>
        </defs>
        <line x1="30" y1="220" x2="570" y2="220" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        ${bars}
      </svg>
    `;
  }

  // Chart 2: Top Popular Services
  const topServicesContainer = document.getElementById('chart-popular-services');
  if (topServicesContainer) {
    const analytics = window.LabSalonStore.getAnalytics();
    const top = analytics.popularServices.slice(0, 5);

    topServicesContainer.innerHTML = top.map(item => `
      <div style="margin-bottom: 1.2rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px; font-size: 0.85rem;">
          <span>${item.name}</span>
          <strong style="color: var(--gold);">${item.count} bookings</strong>
        </div>
        <div style="width:100%; height:8px; background:#222; border-radius:4px; overflow:hidden;">
          <div style="width:${Math.min(100, item.count * 25)}%; height:100%; background: var(--gold);"></div>
        </div>
      </div>
    `).join('');
  }
}

// 4. Calendar Day / Week / Month Grid View
function initCalendarView() {
  const calendarContainer = document.getElementById('admin-calendar-grid');
  if (!calendarContainer) return;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const appointments = window.LabSalonStore.getAppointments();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // First day of month
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let html = days.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

  // Blank cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-cell" style="opacity:0.3;"></div>`;
  }

  // Month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(a => a.date === dayStr);

    const isToday = day === today.getDate();

    html += `
      <div class="calendar-cell ${isToday ? 'today' : ''}">
        <div class="calendar-cell-date">${day}</div>
        ${dayAppointments.map(a => `
          <div class="calendar-event ${a.status.toLowerCase()}" title="${a.serviceName} - ${a.stylistName}">
            ${a.time} ${a.customerName.split(' ')[0]}
          </div>
        `).join('')}
      </div>
    `;
  }

  calendarContainer.innerHTML = html;
}

// 5. Service CRUD Management
function initServiceCrud() {
  const tbody = document.getElementById('admin-services-tbody');
  if (!tbody) return;

  const renderServices = () => {
    const services = window.LabSalonStore.getServices(false);
    tbody.innerHTML = services.map(s => `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.category}</td>
        <td>$${s.price}</td>
        <td>${s.duration} mins</td>
        <td>
          <span class="badge ${s.active ? 'badge-completed' : 'badge-cancelled'}">
            ${s.active ? 'Active' : 'Disabled'}
          </span>
        </td>
        <td>
          <button class="btn btn-outline btn-sm btn-edit-service" data-id="${s.id}">Edit</button>
          <button class="btn btn-text btn-delete-service" data-id="${s.id}" style="color:#e74c3c; margin-left:8px;">Delete</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-delete-service').forEach(btn => {
      btn.onclick = () => {
        if (confirm('Delete this service permanently?')) {
          window.LabSalonStore.deleteService(btn.dataset.id);
          renderServices();
        }
      };
    });

    tbody.querySelectorAll('.btn-edit-service').forEach(btn => {
      btn.onclick = () => openServiceModal(btn.dataset.id);
    });
  };

  const addBtn = document.getElementById('btn-add-service');
  if (addBtn) addBtn.onclick = () => openServiceModal();

  renderServices();
}

function openServiceModal(serviceId = null) {
  const isEdit = !!serviceId;
  const s = isEdit ? window.LabSalonStore.getServiceById(serviceId) : null;

  let modal = document.getElementById('service-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'service-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <button class="modal-close">&times;</button>
        <h3 class="modal-title" style="margin-bottom: 1.5rem;">${isEdit ? 'Edit Service' : 'Add New Service'}</h3>
        <form id="service-form">
          <div class="form-group">
            <label class="form-label">Service Name</label>
            <input type="text" id="svc-name" class="form-control" required>
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="svc-cat" class="form-control form-select">
              <option value="CUT & STYLE">CUT & STYLE</option>
              <option value="COLOR">COLOR</option>
              <option value="BLONDING">BLONDING</option>
              <option value="TREATMENTS">TREATMENTS</option>
              <option value="EXTENSIONS">EXTENSIONS</option>
              <option value="CONSULTATION">CONSULTATION</option>
            </select>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Price ($)</label>
              <input type="number" id="svc-price" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Duration (Minutes)</label>
              <input type="number" id="svc-duration" class="form-control" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="svc-desc" class="form-control" rows="3"></textarea>
          </div>
          <div style="display:flex; gap:1rem; margin-top:2rem;">
            <button type="submit" class="btn btn-primary" style="flex:1;">Save Service</button>
            <button type="button" class="btn btn-outline modal-close-btn" style="flex:1;">Cancel</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const form = modal.querySelector('#service-form');
  const nameIn = modal.querySelector('#svc-name');
  const catIn = modal.querySelector('#svc-cat');
  const priceIn = modal.querySelector('#svc-price');
  const durIn = modal.querySelector('#svc-duration');
  const descIn = modal.querySelector('#svc-desc');

  if (s) {
    nameIn.value = s.name;
    catIn.value = s.category;
    priceIn.value = s.price;
    durIn.value = s.duration;
    descIn.value = s.description;
  } else {
    form.reset();
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const data = {
      id: serviceId,
      name: nameIn.value.trim(),
      category: catIn.value,
      price: Number(priceIn.value),
      duration: Number(durIn.value),
      description: descIn.value.trim(),
      active: true
    };
    window.LabSalonStore.saveService(data);
    modal.classList.remove('active');
    initServiceCrud();
  };

  modal.querySelectorAll('.modal-close, .modal-close-btn').forEach(b => b.onclick = () => modal.classList.remove('active'));
  modal.classList.add('active');
}

// 6. Stylist Management
function initStylistCrud() {
  const container = document.getElementById('admin-stylists-grid');
  if (!container) return;

  const renderStylists = () => {
    const stylists = window.LabSalonStore.getStylists(false);
    container.innerHTML = stylists.map(s => `
      <div class="admin-card" style="margin-bottom:0;">
        <div style="display:flex; gap:1.2rem; align-items:center; margin-bottom:1rem;">
          <img src="${s.image}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; border:1px solid var(--gold);">
          <div>
            <h4 style="font-size:1.1rem; margin-bottom:2px;">${s.name}</h4>
            <span style="font-size:0.75rem; color:var(--gold); letter-spacing:0.1em; text-transform:uppercase;">${s.title}</span>
          </div>
        </div>
        <p style="font-size:0.85rem; color:var(--soft-gray); margin-bottom:1rem;">${s.bio}</p>
        <div style="font-size:0.8rem; margin-bottom:1rem;">
          <strong>Hours:</strong> ${s.workingHours.start} - ${s.workingHours.end}
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="alert('Stylist schedule updated.')">Edit Schedule</button>
        </div>
      </div>
    `).join('');
  };

  renderStylists();
}

// 7. Customer Directory
function initCustomerDirectory() {
  const tbody = document.getElementById('admin-customers-tbody');
  if (!tbody) return;

  const customers = window.LabSalonStore.getCustomers().filter(c => c.role === 'CUSTOMER');
  const appointments = window.LabSalonStore.getAppointments();

  tbody.innerHTML = customers.map(c => {
    const clientApts = appointments.filter(a => a.customerId === c.id || a.customerEmail === c.email);
    return `
      <tr>
        <td><strong>${c.firstName} ${c.lastName}</strong></td>
        <td>${c.email}</td>
        <td>${c.phone || 'N/A'}</td>
        <td>${c.hairType || 'Normal'}</td>
        <td>${clientApts.length} bookings</td>
        <td><span class="badge badge-confirmed">Active</span></td>
      </tr>
    `;
  }).join('');
}

// 8. Salon Settings Form
function initSettingsForm() {
  const form = document.getElementById('admin-settings-form');
  if (!form) return;

  const settings = window.LabSalonStore.getSettings();

  const nameInput = form.querySelector('[name="salonName"]');
  const phoneInput = form.querySelector('[name="phone"]');
  const openInput = form.querySelector('[name="openTime"]');
  const closeInput = form.querySelector('[name="closeTime"]');
  const breakStartInput = form.querySelector('[name="breakStart"]');
  const breakEndInput = form.querySelector('[name="breakEnd"]');

  if (nameInput) nameInput.value = settings.salonName || '';
  if (phoneInput) phoneInput.value = settings.phone || '';
  if (openInput) openInput.value = settings.openTime || '09:00';
  if (closeInput) closeInput.value = settings.closeTime || '19:00';
  if (breakStartInput) breakStartInput.value = settings.breakStart || '13:00';
  if (breakEndInput) breakEndInput.value = settings.breakEnd || '14:00';

  form.onsubmit = (e) => {
    e.preventDefault();
    settings.salonName = nameInput.value.trim();
    settings.phone = phoneInput.value.trim();
    settings.openTime = openInput.value;
    settings.closeTime = closeInput.value;
    settings.breakStart = breakStartInput.value;
    settings.breakEnd = breakEndInput.value;

    window.LabSalonStore.saveSettings(settings);
    alert('Salon operating settings successfully updated.');
  };
}
