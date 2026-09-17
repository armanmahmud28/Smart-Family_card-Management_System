CREATE DATABASE IF NOT EXISTS family_card_system;

USE family_card_system;

CREATE TABLE divisions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    division_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE districts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    district_name VARCHAR(100) NOT NULL,
    division_id INT,
    FOREIGN KEY (division_id) REFERENCES divisions(id)
);

CREATE TABLE upazilas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    upazila_name VARCHAR(100) NOT NULL,
    district_id INT,
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('super_admin', 'admin', 'officer') DEFAULT 'officer',
    status ENUM('active', 'inactive') DEFAULT 'active',
    district_id INT,
    upazila_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (upazila_id) REFERENCES upazilas(id)
);

CREATE TABLE citizens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nid VARCHAR(17) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other'),
    father_name VARCHAR(150),
    mother_name VARCHAR(150),
    phone VARCHAR(20),
    email VARCHAR(100),
    occupation VARCHAR(100),
    marital_status ENUM('single', 'married', 'widowed'),
    address TEXT,
    division_id INT,
    district_id INT,
    upazila_id INT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (division_id) REFERENCES divisions(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (upazila_id) REFERENCES upazilas(id)
);

CREATE TABLE families (
    id INT PRIMARY KEY AUTO_INCREMENT,
    head_citizen_id INT NOT NULL,
    monthly_income DECIMAL(10,2) DEFAULT 0,
    upazila_poverty_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
    has_disabled_member BOOLEAN DEFAULT FALSE,
    has_orphan_child BOOLEAN DEFAULT FALSE,
    has_elderly_member BOOLEAN DEFAULT FALSE,
    has_luxury_assets BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (head_citizen_id) REFERENCES citizens(id)
);

CREATE TABLE income_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    citizen_id INT NOT NULL,
    income_source VARCHAR(100),
    monthly_income DECIMAL(10,2),
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE family_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    citizen_id INT NOT NULL,
    family_id INT,
    relationship VARCHAR(50),
    monthly_income DECIMAL(10,2) DEFAULT 0,
    nid_or_birth_cert VARCHAR(20),
    is_disabled BOOLEAN DEFAULT FALSE,
    is_orphan BOOLEAN DEFAULT FALSE,
    is_elderly BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    citizen_id INT NOT NULL,
    family_id INT,
    application_date DATE,
    personal_info JSON,
    address_info JSON,
    financial_info JSON,
    eligibility_info JSON,
    status ENUM('submitted', 'under_review', 'approved', 'rejected') DEFAULT 'submitted',
    approval_level ENUM('none', 'local_officer', 'district_admin') DEFAULT 'none',
    reviewed_by INT,
    approved_by INT,
    remarks TEXT,
    eligibility_score INT DEFAULT 0,
    eligibility_recommendation ENUM('auto_approve', 'manual_review', 'likely_reject'),
    fraud_risk_score INT DEFAULT 0,
    fraud_flags JSON,
    fraud_recommendation ENUM('approve', 'manual_review', 'reject') DEFAULT 'approve',
    is_duplicate BOOLEAN DEFAULT FALSE,
    district_id INT,
    submission_count INT DEFAULT 1,
    submitter_ip VARCHAR(45),
    documents JSON,
    override_justification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES citizens(id),
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (reviewed_by) REFERENCES admins(id),
    FOREIGN KEY (approved_by) REFERENCES admins(id),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE family_cards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    citizen_id INT,
    family_id INT,
    issue_date DATE,
    expiry_date DATE,
    status ENUM('active', 'expired', 'suspended') DEFAULT 'active',
    approved_by INT,
    FOREIGN KEY (citizen_id) REFERENCES citizens(id),
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (approved_by) REFERENCES admins(id)
);

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    citizen_id INT,
    family_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('bkash', 'nagad', 'bank'),
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    payment_month INT NOT NULL,
    payment_year INT NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    failure_reason VARCHAR(255),
    FOREIGN KEY (citizen_id) REFERENCES citizens(id),
    FOREIGN KEY (family_id) REFERENCES families(id)
);

CREATE TABLE refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_type ENUM('citizen', 'admin') NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    citizen_id INT,
    otp_code VARCHAR(10),
    expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES citizens(id)
);

CREATE TABLE complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    citizen_id INT,
    subject VARCHAR(200),
    complaint_text TEXT,
    status ENUM('pending', 'resolved') DEFAULT 'pending',
    resolved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES citizens(id),
    FOREIGN KEY (resolved_by) REFERENCES admins(id)
);

CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    action_performed TEXT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

CREATE INDEX idx_citizens_district ON citizens(district_id);
CREATE INDEX idx_citizens_upazila ON citizens(upazila_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_month_year ON payments(payment_month, payment_year);
CREATE INDEX idx_family_members_citizen ON family_members(citizen_id);
CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_income_records_citizen ON income_records(citizen_id);
