/**
 * LAB SALON MIAMI — Authentication & Session Management
 * Secure Client & Admin Session Handling with Web Crypto API Hashing
 */

class AuthService {
  constructor() {
    this.sessionKey = 'lab_salon_session_token';
  }

  // SHA-256 password hash using standard Web Crypto API
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get current logged-in user
  getCurrentUser() {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      this.logout();
      return null;
    }
  }

  // Register new customer
  async register(customerData) {
    const store = window.LabSalonStore;
    const existing = store.getCustomerByEmail(customerData.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await this.hashPassword(customerData.password);
    const newCustomer = {
      firstName: customerData.firstName.trim(),
      lastName: customerData.lastName.trim(),
      email: customerData.email.trim().toLowerCase(),
      phone: customerData.phone.trim(),
      passwordHash: passwordHash,
      role: 'CUSTOMER',
      hairType: customerData.hairType || '',
      hairLength: customerData.hairLength || '',
      preferredStylist: customerData.preferredStylist || 'sty-1'
    };

    const saved = store.saveCustomer(newCustomer);
    this.createSession(saved);
    return saved;
  }

  // Login for Customers and Admins
  async login(email, password) {
    const store = window.LabSalonStore;
    const user = store.getCustomerByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const inputHash = await this.hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new Error('Invalid email or password.');
    }

    this.createSession(user);
    return user;
  }

  createSession(user) {
    // Avoid storing password hash in session
    const sessionUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      hairType: user.hairType,
      hairLength: user.hairLength,
      preferredStylist: user.preferredStylist,
      token: 'lab_tok_' + Date.now()
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionUser));
    return sessionUser;
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    window.location.href = '/login.html';
  }

  // Reset password simulation
  async resetPassword(email, newPassword) {
    const store = window.LabSalonStore;
    const user = store.getCustomerByEmail(email);
    if (!user) {
      throw new Error('No account found with this email.');
    }
    const hash = await this.hashPassword(newPassword);
    user.passwordHash = hash;
    store.saveCustomer(user);
    return true;
  }

  // Route protection helper
  requireAuth(requiredRole = null) {
    const user = this.getCurrentUser();
    if (!user) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login.html?redirect=${redirect}`;
      return null;
    }
    if (requiredRole && user.role !== requiredRole) {
      alert('Access restricted. Please log in with administrator privileges.');
      window.location.href = user.role === 'ADMIN' ? '/admin/index.html' : '/account.html';
      return null;
    }
    return user;
  }

  // Update navbar state based on auth status
  updateNavbarAuth() {
    const user = this.getCurrentUser();
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (user) {
      const isAdm = user.role === 'ADMIN';
      const targetUrl = isAdm ? '/admin/index.html' : '/account.html';
      const targetLabel = isAdm ? 'ADMIN PORTAL' : 'MY ACCOUNT';

      const existingAuth = document.querySelector('.nav-auth-item');
      if (existingAuth) existingAuth.remove();

      const authContainer = document.createElement('div');
      authContainer.className = 'nav-auth-item';
      authContainer.innerHTML = `
        <a href="${targetUrl}" class="nav-auth-link">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          ${targetLabel}
        </a>
      `;
      navActions.insertBefore(authContainer, navActions.firstChild);
    }
  }
}

window.LabSalonAuth = new AuthService();

document.addEventListener('DOMContentLoaded', () => {
  window.LabSalonAuth.updateNavbarAuth();
});
