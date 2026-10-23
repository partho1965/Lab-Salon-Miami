/**
 * LAB SALON MIAMI — Data Architecture & Local Entity Store
 * Simulates a RESTful Backend with LocalStorage Persistence
 */

const STORAGE_KEYS = {
  SERVICES: 'lab_salon_services',
  STYLISTS: 'lab_salon_stylists',
  APPOINTMENTS: 'lab_salon_appointments',
  CUSTOMERS: 'lab_salon_customers',
  SETTINGS: 'lab_salon_settings',
  CURRENT_USER: 'lab_salon_current_user',
  REVIEWS: 'lab_salon_reviews'
};

// Initial Seed Data
const DEFAULT_SERVICES = [
  {
    id: 'srv-1',
    name: 'Precision Cut',
    category: 'CUT & STYLE',
    price: 165,
    duration: 60,
    description: 'Bespoke architectural haircut customized to your facial structure, hair texture, and natural movement.',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-2',
    name: "Women's Editorial Cut & Style",
    category: 'CUT & STYLE',
    price: 150,
    duration: 60,
    description: 'Detailed consultation, signature wash, precision haircut and editorial styling finish.',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-3',
    name: "Men's Precision Cut",
    category: 'CUT & STYLE',
    price: 95,
    duration: 45,
    description: 'Tailored men’s scissors and clipper work, neck shave, scalp massage and natural styling.',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-4',
    name: 'Dimensional Hair Color',
    category: 'COLOR',
    price: 280,
    duration: 120,
    description: 'Artisanal multi-tonal color designed to complement skin tone, natural base and grow-out lifestyle.',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-5',
    name: 'Luxury Balayage',
    category: 'COLOR',
    price: 350,
    duration: 180,
    description: 'Hand-painted sun-kissed dimension with seamless gradients, custom gloss toner and conditioning bond builder.',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-6',
    name: 'Full Blonding & Brightening',
    category: 'BLONDING',
    price: 390,
    duration: 210,
    description: 'Maximum blonde impact via baby-lights, foilayage, root melt and personalized tone calibration.',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-7',
    name: 'Corrective Color Restoration',
    category: 'COLOR',
    price: 450,
    duration: 240,
    description: 'Comprehensive restorative color process for banded, compromised or shifted tones. Focuses on hair integrity.',
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-8',
    name: 'Keratin Smoothing Infusion',
    category: 'TREATMENTS',
    price: 320,
    duration: 150,
    description: 'Formaldehyde-free smoothing therapy that eliminates frizz, humidity reactivity, and reduces blow-dry time by 60%.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-9',
    name: 'Editorial Blowout & Texture',
    category: 'CUT & STYLE',
    price: 85,
    duration: 45,
    description: 'Luxury wash, scalp stimulation, thermal protection and signature Miami effortless wave finish.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-10',
    name: 'Custom Hair Extensions',
    category: 'EXTENSIONS',
    price: 650,
    duration: 180,
    description: 'Micro-invisible bead or tape-in extensions matched to individual texture, color nuances and desired density.',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    id: 'srv-11',
    name: 'Personalized Hair Consultation',
    category: 'CONSULTATION',
    price: 50,
    duration: 30,
    description: 'Comprehensive 1-on-1 scalp, texture, lifestyle analysis and roadmap. Fee applied toward subsequent service.',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    active: true
  }
];

const DEFAULT_STYLISTS = [
  {
    id: 'sty-1',
    name: 'Peter Rodriguez',
    title: 'Founder & Master Stylist',
    bio: 'Known for architectural precision cutting, natural dimensional color, and a high-touch consultative approach. Over 15 years in luxury beauty.',
    specialties: ['Precision Cutting', 'Dimensional Color', 'Corrective Color', 'Blonding'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    workingHours: { start: '09:00', end: '18:00' },
    workingDays: [2, 3, 4, 5, 6], // Tue - Sat (0=Sun, 1=Mon, ..., 6=Sat)
    active: true
  },
  {
    id: 'sty-2',
    name: 'Sofia Elena',
    title: 'Master Colorist',
    bio: 'Specialist in lived-in balayage, Miami golden blondes, and hair integrity restoration. Former editorial hair colorist in New York and Paris.',
    specialties: ['Balayage', 'Blonding', 'Dimensional Color', 'Gloss Formulations'],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    workingHours: { start: '10:00', end: '19:00' },
    workingDays: [2, 3, 4, 5, 6],
    active: true
  },
  {
    id: 'sty-3',
    name: 'Mateo Cruz',
    title: 'Texture & Styling Specialist',
    bio: 'Pioneer of organic motion haircuts, smoothing treatments, and customized extension blending for effortless Miami lifestyles.',
    specialties: ['Precision Cuts', 'Keratin / Smoothing', 'Extensions', 'Texture Work'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    workingHours: { start: '09:30', end: '18:30' },
    workingDays: [3, 4, 5, 6, 0], // Wed - Sun
    active: true
  }
];

const DEFAULT_SETTINGS = {
  salonName: 'LAB Salon Miami',
  address: '1442 NE Miami Pl, Suite 229, Miami, FL 33132',
  phone: '+1 (305) 448-0540',
  email: 'concierge@labsalon.miami',
  openTime: '09:00',
  closeTime: '19:00',
  workingDays: [2, 3, 4, 5, 6], // Tue - Sat
  breakStart: '13:00',
  breakEnd: '14:00',
  slotInterval: 30, // minutes
  cancellationNoticeHours: 24,
  blockedDates: ['2026-11-26', '2026-12-25', '2027-01-01']
};

const DEFAULT_CUSTOMERS = [
  {
    id: 'cust-1',
    firstName: 'Camila',
    lastName: 'Vargas',
    email: 'client@labsalon.miami',
    phone: '(305) 555-0192',
    passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // 'password123'
    role: 'CUSTOMER',
    hairType: 'Type 2A - Fine / Wavy',
    hairLength: 'Mid-Back',
    preferredStylist: 'sty-1',
    createdAt: '2026-08-10'
  },
  {
    id: 'admin-1',
    firstName: 'Peter',
    lastName: 'Rodriguez',
    email: 'admin@labsalon.miami',
    phone: '(305) 448-0540',
    passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // 'admin123'
    role: 'ADMIN',
    hairType: 'N/A',
    hairLength: 'N/A',
    preferredStylist: 'sty-1',
    createdAt: '2026-01-01'
  }
];

const DEFAULT_APPOINTMENTS = [
  {
    id: 'apt-101',
    appointmentNumber: 'LAB-9842',
    customerId: 'cust-1',
    customerName: 'Camila Vargas',
    customerEmail: 'client@labsalon.miami',
    customerPhone: '(305) 555-0192',
    serviceId: 'srv-5',
    serviceName: 'Luxury Balayage',
    stylistId: 'sty-1',
    stylistName: 'Peter Rodriguez',
    date: '2026-11-04',
    time: '11:00',
    duration: 180,
    price: 350,
    status: 'Confirmed',
    notes: 'Lived-in blonding with soft root melt. Client prefers cool neutral tone.',
    createdAt: '2026-10-20'
  },
  {
    id: 'apt-102',
    appointmentNumber: 'LAB-9811',
    customerId: 'cust-1',
    customerName: 'Camila Vargas',
    customerEmail: 'client@labsalon.miami',
    customerPhone: '(305) 555-0192',
    serviceId: 'srv-1',
    serviceName: 'Precision Cut',
    stylistId: 'sty-1',
    stylistName: 'Peter Rodriguez',
    date: '2026-09-15',
    time: '14:00',
    duration: 60,
    price: 165,
    status: 'Completed',
    notes: 'Face-framing layers and split-end dusting.',
    createdAt: '2026-09-01'
  },
  {
    id: 'apt-103',
    appointmentNumber: 'LAB-9856',
    customerId: 'cust-2',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@gmail.com',
    customerPhone: '(786) 334-1189',
    serviceId: 'srv-6',
    serviceName: 'Full Blonding & Brightening',
    stylistId: 'sty-2',
    stylistName: 'Sofia Elena',
    date: '2026-10-25',
    time: '13:00',
    duration: 210,
    price: 390,
    status: 'Confirmed',
    notes: 'Platinum micro-weaving with Olaplex infusion.',
    createdAt: '2026-10-18'
  },
  {
    id: 'apt-104',
    appointmentNumber: 'LAB-9870',
    customerId: 'cust-3',
    customerName: 'Julian Thorne',
    customerEmail: 'j.thorne@artbaselmiami.com',
    customerPhone: '(305) 991-4421',
    serviceId: 'srv-3',
    serviceName: "Men's Precision Cut",
    stylistId: 'sty-3',
    stylistName: 'Mateo Cruz',
    date: '2026-10-24',
    time: '10:00',
    duration: 45,
    price: 95,
    status: 'Confirmed',
    notes: 'Scissor over comb taper.',
    createdAt: '2026-10-19'
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Sienna Miller-White',
    text: 'Peter took the time to understand my texture and transformed my overgrown hair into an effortless signature cut that falls into place without styling.',
    rating: 5,
    date: '2 weeks ago',
    service: 'Precision Cut'
  },
  {
    id: 'rev-2',
    name: 'Alexandra DuPont',
    text: 'Sofia formulated the most breathtaking dimensional balayage I have ever received in Miami. The boutique atmosphere is calm, refined, and entirely private.',
    rating: 5,
    date: '1 month ago',
    service: 'Luxury Balayage'
  },
  {
    id: 'rev-3',
    name: 'Marcus Sterling',
    text: 'LAB is not your typical salon — it feels like an architectural sanctuary. Mateo’s precision and attention to detail are second to none in South Florida.',
    rating: 5,
    date: '3 weeks ago',
    service: "Men's Precision Cut"
  }
];

// Data Store Class
class DataStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STYLISTS)) {
      localStorage.setItem(STORAGE_KEYS.STYLISTS, JSON.stringify(DEFAULT_STYLISTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    }
  }

  // SERVICES API
  getServices(activeOnly = true) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
    return activeOnly ? list.filter(s => s.active) : list;
  }

  getServiceById(id) {
    return this.getServices(false).find(s => s.id === id);
  }

  saveService(serviceData) {
    const services = this.getServices(false);
    if (serviceData.id) {
      const idx = services.findIndex(s => s.id === serviceData.id);
      if (idx !== -1) services[idx] = { ...services[idx], ...serviceData };
    } else {
      serviceData.id = 'srv-' + Date.now();
      services.push(serviceData);
    }
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    return serviceData;
  }

  deleteService(id) {
    const services = this.getServices(false).filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    return true;
  }

  // STYLISTS API
  getStylists(activeOnly = true) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.STYLISTS) || '[]');
    return activeOnly ? list.filter(s => s.active) : list;
  }

  getStylistById(id) {
    return this.getStylists(false).find(s => s.id === id);
  }

  saveStylist(stylistData) {
    const stylists = this.getStylists(false);
    if (stylistData.id) {
      const idx = stylists.findIndex(s => s.id === stylistData.id);
      if (idx !== -1) stylists[idx] = { ...stylists[idx], ...stylistData };
    } else {
      stylistData.id = 'sty-' + Date.now();
      stylists.push(stylistData);
    }
    localStorage.setItem(STORAGE_KEYS.STYLISTS, JSON.stringify(stylists));
    return stylistData;
  }

  deleteStylist(id) {
    const stylists = this.getStylists(false).filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STYLISTS, JSON.stringify(stylists));
    return true;
  }

  // APPOINTMENTS API
  getAppointments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
  }

  getAppointmentById(id) {
    return this.getAppointments().find(a => a.id === id);
  }

  saveAppointment(appointment) {
    const list = this.getAppointments();
    if (!appointment.id) {
      appointment.id = 'apt-' + Date.now();
      appointment.appointmentNumber = 'LAB-' + Math.floor(1000 + Math.random() * 9000);
      appointment.createdAt = new Date().toISOString().split('T')[0];
      appointment.status = appointment.status || 'Confirmed';
      list.unshift(appointment);
    } else {
      const idx = list.findIndex(a => a.id === appointment.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...appointment };
    }
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    return appointment;
  }

  updateAppointmentStatus(id, newStatus) {
    const list = this.getAppointments();
    const apt = list.find(a => a.id === id);
    if (apt) {
      apt.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
      return apt;
    }
    return null;
  }

  cancelAppointment(id, reason = '') {
    const apt = this.updateAppointmentStatus(id, 'Cancelled');
    if (apt) {
      apt.cancelReason = reason;
      const list = this.getAppointments();
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    }
    return apt;
  }

  // DYNAMIC AVAILABILITY ENGINE: Strictly prevents double bookings & adheres to stylist/salon schedule
  getAvailableSlots(stylistId, dateStr, durationMinutes = 60) {
    const settings = this.getSettings();
    const stylist = this.getStylistById(stylistId);
    if (!stylist) return [];

    // Parse date
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ...

    // Check if salon or stylist works on this day
    if (!settings.workingDays.includes(dayOfWeek) || !stylist.workingDays.includes(dayOfWeek)) {
      return [];
    }

    // Check if date is blocked/holiday
    if (settings.blockedDates && settings.blockedDates.includes(dateStr)) {
      return [];
    }

    // Determine working hours window
    const startTimeStr = stylist.workingHours.start || settings.openTime;
    const endTimeStr = stylist.workingHours.end || settings.closeTime;

    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    // Break period
    let breakStart = -1, breakEnd = -1;
    if (settings.breakStart && settings.breakEnd) {
      const [bsh, bsm] = settings.breakStart.split(':').map(Number);
      const [beh, bem] = settings.breakEnd.split(':').map(Number);
      breakStart = bsh * 60 + bsm;
      breakEnd = beh * 60 + bem;
    }

    // Fetch existing non-cancelled appointments for this stylist on this date
    const existingAppointments = this.getAppointments().filter(a =>
      a.stylistId === stylistId &&
      a.date === dateStr &&
      a.status !== 'Cancelled'
    );

    const bookedIntervals = existingAppointments.map(a => {
      const [h, m] = a.time.split(':').map(Number);
      const start = h * 60 + m;
      return { start, end: start + (a.duration || 60) };
    });

    const slots = [];
    const interval = settings.slotInterval || 30;

    for (let cur = startTotalMinutes; cur + durationMinutes <= endTotalMinutes; cur += interval) {
      const slotEnd = cur + durationMinutes;

      // Check break collision
      if (breakStart !== -1 && !(slotEnd <= breakStart || cur >= breakEnd)) {
        continue;
      }

      // Check collision with existing appointments (Strict anti-double booking)
      const hasConflict = bookedIntervals.some(booked => {
        return (cur < booked.end && slotEnd > booked.start);
      });

      if (!hasConflict) {
        const hh = String(Math.floor(cur / 60)).padStart(2, '0');
        const mm = String(cur % 60).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }

    return slots;
  }

  // SETTINGS API
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  }

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }

  // CUSTOMERS API
  getCustomers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
  }

  getCustomerById(id) {
    return this.getCustomers().find(c => c.id === id);
  }

  getCustomerByEmail(email) {
    return this.getCustomers().find(c => c.email.toLowerCase() === email.toLowerCase());
  }

  saveCustomer(customer) {
    const list = this.getCustomers();
    if (!customer.id) {
      customer.id = 'cust-' + Date.now();
      customer.createdAt = new Date().toISOString().split('T')[0];
      customer.role = customer.role || 'CUSTOMER';
      list.push(customer);
    } else {
      const idx = list.findIndex(c => c.id === customer.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...customer };
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
    return customer;
  }

  // REVIEWS API
  getReviews() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
  }

  // ANALYTICS CALCULATION
  getAnalytics() {
    const appointments = this.getAppointments();
    const customers = this.getCustomers().filter(c => c.role === 'CUSTOMER');

    const totalAppointments = appointments.length;
    const completed = appointments.filter(a => a.status === 'Completed').length;
    const cancelled = appointments.filter(a => a.status === 'Cancelled').length;
    const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
    const pending = appointments.filter(a => a.status === 'Pending').length;

    const totalRevenue = appointments
      .filter(a => a.status === 'Completed' || a.status === 'Confirmed')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    const avgValue = totalAppointments ? Math.round(totalRevenue / (completed + confirmed || 1)) : 0;
    const cancellationRate = totalAppointments ? ((cancelled / totalAppointments) * 100).toFixed(1) : 0;

    // Service popularity tally
    const serviceCounts = {};
    appointments.forEach(a => {
      serviceCounts[a.serviceName] = (serviceCounts[a.serviceName] || 0) + 1;
    });

    const popularServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalAppointments,
      completed,
      cancelled,
      confirmed,
      pending,
      totalCustomers: customers.length,
      monthlyRevenue: totalRevenue,
      averageValue: avgValue,
      cancellationRate: cancellationRate + '%',
      popularServices
    };
  }
}

// Global instance
window.LabSalonStore = new DataStore();
