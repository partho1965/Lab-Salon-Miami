-- ============================================================================
-- LAB SALON MIAMI — RELATIONAL DATABASE SCHEMA & SEED DATA
-- Target DBMS: PostgreSQL / MySQL 8.0+ / Standard SQL
-- Description: Core tables, foreign keys, indexes, and initial salon records.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & SCHEMAS (PostgreSQL optional)
-- ----------------------------------------------------------------------------
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 2. SALON OPERATING SETTINGS & BUSINESS HOURS
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS salon_settings CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS stylist_services CASCADE;
DROP TABLE IF EXISTS stylists CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE salon_settings (
    id SERIAL PRIMARY KEY,
    salon_name VARCHAR(150) NOT NULL DEFAULT 'LAB Salon Miami',
    address VARCHAR(255) NOT NULL DEFAULT '1442 NE Miami Pl, Suite 229, Miami, FL 33132',
    phone VARCHAR(50) NOT NULL DEFAULT '+1 (305) 448-0540',
    email VARCHAR(120) NOT NULL DEFAULT 'concierge@labsalon.miami',
    open_time TIME NOT NULL DEFAULT '09:00:00',
    close_time TIME NOT NULL DEFAULT '19:00:00',
    break_start TIME DEFAULT '13:00:00',
    break_end TIME DEFAULT '14:00:00',
    slot_interval_minutes INT NOT NULL DEFAULT 30,
    cancellation_notice_hours INT NOT NULL DEFAULT 24,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocked_dates (
    id SERIAL PRIMARY KEY,
    blocked_date DATE NOT NULL UNIQUE,
    reason VARCHAR(255) NOT NULL DEFAULT 'Holiday Closure',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. USERS & CLIENT ACCOUNTS
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
    hair_type VARCHAR(100),
    hair_length VARCHAR(100),
    preferred_stylist_id VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- 4. SERVICES CATALOG
-- ----------------------------------------------------------------------------
CREATE TABLE services (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('CUT & STYLE', 'COLOR', 'BLONDING', 'TREATMENTS', 'EXTENSIONS', 'CONSULTATION')),
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);

-- ----------------------------------------------------------------------------
-- 5. STYLISTS & ARTIST ROSTER
-- ----------------------------------------------------------------------------
CREATE TABLE stylists (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    title VARCHAR(120) NOT NULL,
    bio TEXT,
    specialties TEXT, -- Comma-separated or JSON array of specialties
    image_url VARCHAR(500),
    working_hours_start TIME NOT NULL DEFAULT '09:00:00',
    working_hours_end TIME NOT NULL DEFAULT '18:00:00',
    working_days VARCHAR(50) NOT NULL DEFAULT '2,3,4,5,6', -- 0=Sun, 1=Mon, ..., 6=Sat
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stylist-Service Assignment
CREATE TABLE stylist_services (
    stylist_id VARCHAR(64) NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
    service_id VARCHAR(64) NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (stylist_id, service_id)
);

-- ----------------------------------------------------------------------------
-- 6. APPOINTMENTS & RESERVATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE appointments (
    id VARCHAR(64) PRIMARY KEY,
    appointment_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    service_id VARCHAR(64) REFERENCES services(id) ON DELETE RESTRICT,
    service_name VARCHAR(150) NOT NULL,
    stylist_id VARCHAR(64) NOT NULL REFERENCES stylists(id) ON DELETE RESTRICT,
    stylist_name VARCHAR(150) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    cancel_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance & Anti-Collision Indexes
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_stylist_date ON appointments(stylist_id, appointment_date, appointment_time);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ----------------------------------------------------------------------------
-- 7. REVIEWS & TESTIMONIALS
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
    id VARCHAR(64) PRIMARY KEY,
    client_name VARCHAR(120) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    service_name VARCHAR(150),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- Settings
INSERT INTO salon_settings (id, salon_name, address, phone, email, open_time, close_time, break_start, break_end, slot_interval_minutes, cancellation_notice_hours)
VALUES (1, 'LAB Salon Miami', '1442 NE Miami Pl, Suite 229, Miami, FL 33132', '+1 (305) 448-0540', 'concierge@labsalon.miami', '09:00:00', '19:00:00', '13:00:00', '14:00:00', 30, 24)
ON CONFLICT (id) DO NOTHING;

-- Blocked Holiday Dates
INSERT INTO blocked_dates (blocked_date, reason) VALUES
('2026-11-26', 'Thanksgiving Day'),
('2026-12-25', 'Christmas Day'),
('2027-01-01', 'New Year Day')
ON CONFLICT (blocked_date) DO NOTHING;

-- Stylists
INSERT INTO stylists (id, name, title, bio, specialties, image_url, working_hours_start, working_hours_end, working_days) VALUES
('sty-1', 'Peter Rodriguez', 'Founder & Master Stylist', 'Known for architectural precision cutting, natural dimensional color, and a consultative approach. Over 15 years in luxury beauty.', 'Precision Cutting, Dimensional Color, Corrective Color, Blonding', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', '09:00:00', '18:00:00', '2,3,4,5,6'),
('sty-2', 'Sofia Elena', 'Master Colorist', 'Specialist in lived-in balayage, Miami golden blondes, and hair integrity restoration. Former editorial colorist in New York and Paris.', 'Balayage, Blonding, Dimensional Color, Gloss Formulations', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', '10:00:00', '19:00:00', '2,3,4,5,6'),
('sty-3', 'Mateo Cruz', 'Texture & Styling Specialist', 'Pioneer of organic motion haircuts, smoothing treatments, and customized extension blending for effortless Miami lifestyles.', 'Precision Cuts, Keratin / Smoothing, Extensions, Texture Work', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', '09:30:00', '18:30:00', '3,4,5,6,0')
ON CONFLICT (id) DO NOTHING;

-- Services Catalog
INSERT INTO services (id, name, category, price, duration_minutes, description, image_url) VALUES
('srv-1', 'Precision Cut', 'CUT & STYLE', 165.00, 60, 'Bespoke architectural haircut customized to your facial structure, hair texture, and natural movement.', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80'),
('srv-2', 'Women''s Editorial Cut & Style', 'CUT & STYLE', 150.00, 60, 'Detailed consultation, signature wash, precision haircut and editorial styling finish.', 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80'),
('srv-3', 'Men''s Precision Cut', 'CUT & STYLE', 95.00, 45, 'Tailored men’s scissors and clipper work, neck shave, scalp massage and natural styling.', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80'),
('srv-4', 'Dimensional Hair Color', 'COLOR', 280.00, 120, 'Artisanal multi-tonal color designed to complement skin tone, natural base and grow-out lifestyle.', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'),
('srv-5', 'Luxury Balayage', 'COLOR', 350.00, 180, 'Hand-painted sun-kissed dimension with seamless gradients, custom gloss toner and conditioning bond builder.', 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80'),
('srv-6', 'Full Blonding & Brightening', 'BLONDING', 390.00, 210, 'Maximum blonde impact via baby-lights, foilayage, root melt and personalized tone calibration.', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80'),
('srv-7', 'Corrective Color Restoration', 'COLOR', 450.00, 240, 'Comprehensive restorative color process for banded, compromised or shifted tones. Focuses on hair integrity.', 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80'),
('srv-8', 'Keratin Smoothing Infusion', 'TREATMENTS', 320.00, 150, 'Formaldehyde-free smoothing therapy that eliminates frizz, humidity reactivity, and reduces blow-dry time by 60%.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'),
('srv-9', 'Editorial Blowout & Texture', 'CUT & STYLE', 85.00, 45, 'Luxury wash, scalp stimulation, thermal protection and signature Miami effortless wave finish.', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80'),
('srv-10', 'Custom Hair Extensions', 'EXTENSIONS', 650.00, 180, 'Micro-invisible bead or tape-in extensions matched to individual texture, color nuances and desired density.', 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80'),
('srv-11', 'Personalized Hair Consultation', 'CONSULTATION', 50.00, 30, 'Comprehensive 1-on-1 scalp, texture, lifestyle analysis and roadmap. Fee applied toward subsequent service.', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Default Users (SHA-256 for 'password123' and 'admin123')
INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, hair_type, hair_length, preferred_stylist_id) VALUES
('cust-1', 'Camila', 'Vargas', 'client@labsalon.miami', '(305) 555-0192', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'CUSTOMER', 'Type 2A - Fine / Wavy', 'Mid-Back', 'sty-1'),
('admin-1', 'Peter', 'Rodriguez', 'admin@labsalon.miami', '(305) 448-0540', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'ADMIN', 'N/A', 'N/A', 'sty-1')
ON CONFLICT (id) DO NOTHING;

-- Default Appointments
INSERT INTO appointments (id, appointment_number, customer_id, customer_name, customer_email, customer_phone, service_id, service_name, stylist_id, stylist_name, appointment_date, appointment_time, duration_minutes, price, status, notes) VALUES
('apt-101', 'LAB-9842', 'cust-1', 'Camila Vargas', 'client@labsalon.miami', '(305) 555-0192', 'srv-5', 'Luxury Balayage', 'sty-1', 'Peter Rodriguez', '2026-11-04', '11:00:00', 180, 350.00, 'Confirmed', 'Lived-in blonding with soft root melt. Client prefers cool neutral tone.'),
('apt-102', 'LAB-9811', 'cust-1', 'Camila Vargas', 'client@labsalon.miami', '(305) 555-0192', 'srv-1', 'Precision Cut', 'sty-1', 'Peter Rodriguez', '2026-09-15', '14:00:00', 60, 165.00, 'Completed', 'Face-framing layers and split-end dusting.')
ON CONFLICT (id) DO NOTHING;

-- Reviews
INSERT INTO reviews (id, client_name, rating, comment, service_name) VALUES
('rev-1', 'Sienna Miller-White', 5, 'Peter took the time to understand my texture and transformed my overgrown hair into an effortless signature cut that falls into place without styling.', 'Precision Cut'),
('rev-2', 'Alexandra DuPont', 5, 'Sofia formulated the most breathtaking dimensional balayage I have ever received in Miami. The boutique atmosphere is calm, refined, and entirely private.', 'Luxury Balayage'),
('rev-3', 'Marcus Sterling', 5, 'LAB is not your typical salon — it feels like an architectural sanctuary. Mateo’s precision and attention to detail are second to none in South Florida.', 'Men''s Precision Cut')
ON CONFLICT (id) DO NOTHING;
