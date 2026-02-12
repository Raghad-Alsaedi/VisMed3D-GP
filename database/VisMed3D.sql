DROP DATABASE IF EXISTS VisMed3D;

CREATE DATABASE VisMed3D;

USE VisMed3D;

-- ============================================================
-- Doctors, Patients, Technicians
-- ============================================================

CREATE TABLE doctors (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    can_annotate_volume TINYINT(1) DEFAULT 1,
    can_upload_volume TINYINT(1) DEFAULT 0
);

CREATE TABLE patients (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    medical_record_number VARCHAR(50) NOT NULL UNIQUE,
    national_id VARCHAR(20) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    patient_code VARCHAR(50) UNIQUE NOT NULL
);

DELIMITER //
CREATE TRIGGER before_insert_patient
BEFORE INSERT ON patients
FOR EACH ROW
BEGIN
    DECLARE next_mrn_number INT;
    
    IF NEW.medical_record_number IS NULL OR NEW.medical_record_number = '' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(medical_record_number, 4) AS UNSIGNED)), 0) + 1
        INTO next_mrn_number
        FROM patients
        WHERE medical_record_number LIKE 'MRN%';
        
        SET NEW.medical_record_number = CONCAT('MRN', LPAD(next_mrn_number, 6, '0'));
    END IF;
END//
DELIMITER ;

CREATE TABLE technicians (
    technician_id INT PRIMARY KEY AUTO_INCREMENT,
    can_upload_volume TINYINT(1) DEFAULT 1
);

-- ============================================================
-- Users
-- ============================================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('doctor', 'patient', 'technician') NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50) NULL,
    last_name VARCHAR(50) NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    email VARCHAR(100) NULL UNIQUE,
    phone VARCHAR(20) NULL,
    profile_picture VARCHAR(255) NULL,
    is_active TINYINT(1) DEFAULT 1,
    doctor_id INT NULL UNIQUE,
    patient_id INT NULL UNIQUE,
    technician_id INT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- Doctor Profiles
-- ============================================================

CREATE TABLE doctor_profiles (
    doctor_id INT PRIMARY KEY,
    doctor_code VARCHAR(20) UNIQUE NULL,
    license_number VARCHAR(50) NULL,
    years_experience INT NULL,
    specialty VARCHAR(100) NULL,
    profile_image_url VARCHAR(255) NULL,
    signature_path VARCHAR(500) NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- ============================================================
-- Technician Profiles
-- ============================================================

CREATE TABLE technician_profiles (
    technician_id INT PRIMARY KEY,
    technician_code VARCHAR(20) UNIQUE NULL,
    license_number VARCHAR(50) NULL,
    years_experience INT NULL,
    specialty VARCHAR(100) NULL,
    profile_image_url VARCHAR(255) NULL,
    FOREIGN KEY (technician_id) REFERENCES technicians(technician_id) ON DELETE CASCADE
);

-- ============================================================
-- Accession
-- ============================================================

CREATE TABLE accession (
    accession_id INT PRIMARY KEY AUTO_INCREMENT,
    accession_number VARCHAR(20) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    exam_date DATE NOT NULL,
    modality VARCHAR(20) DEFAULT 'CT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

DELIMITER //
CREATE TRIGGER before_insert_accession
BEFORE INSERT ON accession
FOR EACH ROW
BEGIN
    DECLARE next_acc_number INT;
    
    IF NEW.accession_number IS NULL OR NEW.accession_number = '' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(accession_number, 4) AS UNSIGNED)), 0) + 1
        INTO next_acc_number
        FROM accession
        WHERE accession_number LIKE 'ACC%';
        
        SET NEW.accession_number = CONCAT('ACC', LPAD(next_acc_number, 6, '0'));
    END IF;
END//
DELIMITER ;

-- ============================================================
-- Volumes
-- ============================================================

CREATE TABLE volumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accession_id INT NOT NULL,
  dataset_name VARCHAR(100) NOT NULL,
  modality VARCHAR(20) DEFAULT 'CT',
  file_format VARCHAR(10) NOT NULL,
  width INT NOT NULL,
  height INT NOT NULL,
  depth INT NOT NULL,
  storage_path VARCHAR(255) NOT NULL,
  file_prefix VARCHAR(100) NOT NULL,
  start_index INT DEFAULT 1,
  end_index INT NOT NULL,
  checksum_sha256 CHAR(64),
  status ENUM('PROCESSING','READY','REJECTED') DEFAULT 'PROCESSING',
  rejection_reason VARCHAR(255),
  uploaded_by INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (accession_id) REFERENCES accession(accession_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES technicians(technician_id)
);

-- ============================================================
-- Reports
-- ============================================================

CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    accession_id INT NOT NULL,
    volume_id INT NULL,
    doctor_id INT NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    
    -- معلومات الفحص
    body_part VARCHAR(100) NULL,
    
    -- نص الحفظ التلقائي (للدكتور فقط)
    autosave_text TEXT NULL,
    
    -- النص النهائي (يظهر للمريض)
    report_text TEXT NULL,
    
    -- الصور (Screenshots من الـ Volume)
    images JSON NULL,
    
    -- حالة التقرير
    report_status ENUM('Draft', 'completed') DEFAULT 'Draft',
    
    -- التوقيع
    signed_by INT NULL,
    signed_at TIMESTAMP NULL,
    
    -- الحفظ التلقائي
    last_autosave TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (accession_id) REFERENCES accession(accession_id) ON DELETE CASCADE,
    FOREIGN KEY (volume_id) REFERENCES volumes(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (signed_by) REFERENCES doctors(doctor_id) ON DELETE SET NULL
);

-- ============================================================
-- Doctor - Patient Assignments
-- ============================================================

CREATE TABLE doctor_patient_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (doctor_id, patient_id)
);

-- ============================================================
-- Technician - Patient Assignments
-- ============================================================

CREATE TABLE technician_patient_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    technician_id INT NOT NULL,
    patient_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (technician_id) REFERENCES technicians(technician_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (technician_id, patient_id)
);

-- ============================================================
-- Foreign Keys: Users
-- ============================================================

ALTER TABLE users
    ADD FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    ADD FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    ADD FOREIGN KEY (technician_id) REFERENCES technicians(technician_id) ON DELETE CASCADE;

-- ============================================================
-- Sample Data: Doctors
-- ============================================================

INSERT INTO doctors (can_annotate_volume, can_upload_volume) VALUES
(1, 0),
(1, 0);

-- ============================================================
-- Sample Data: Doctor Profiles
-- ============================================================

INSERT INTO doctor_profiles (doctor_id, doctor_code, license_number, years_experience, specialty, profile_image_url, signature_path) VALUES
(1, 'DOC-0015', 'SCFHS-123456', 9, 'Orthopedist',  '/api/images/1', NULL),
(2, 'DOC-0016', 'SCFHS-654321', 7, 'Radiologist',   '/api/images/2', NULL);

-- ============================================================
-- Sample Data: Patients
-- ============================================================

INSERT INTO patients (medical_record_number, national_id, date_of_birth, patient_code) VALUES
(NULL, '1098765432', '1990-05-15', 'P-001'),
(NULL, '1098765433', '1985-08-22', 'P-002'),
(NULL, '1098765434', '1992-11-03', 'P-003');

-- ============================================================
-- Sample Data: Technicians
-- ============================================================

INSERT INTO technicians (can_upload_volume) VALUES
(1);

-- ============================================================
-- Sample Data: Technician Profiles
-- ============================================================

INSERT INTO technician_profiles (technician_id, technician_code, license_number, years_experience, specialty, profile_image_url) VALUES
(1, 'TECH-0001', 'TECH001567', 5, 'Radiology Technician', '/api/images/3');

-- ============================================================
-- Sample Data: Users
-- ============================================================

INSERT INTO users (username, password_hash, role, first_name, middle_name, last_name, gender, email, phone, profile_picture, is_active, doctor_id, patient_id, technician_id) VALUES
('doc1001',  '$2b$10$OviHdfLTd6h4sW0op/bLCegQ3ot0EKl8jwGuOmfMDQOOeAAA2H22S', 'doctor',     'Ahmed',   'Mohammed', 'Alharbi',   'male',   'ahmed.alharbi@vismed.com',     '+966501111111', '/api/images/1', 1, 1, NULL, NULL),
('doc1002',  '$2b$10$Y7/AZQSUSXdcAUxza7Qpc.SBKCfrLWpo/lF3A8VSTcjgYLEofAMnO', 'doctor',     'Sarah',   'Abdullah', 'Almutairi', 'female', 'sarah.almutairi@vismed.com',   '+966502222222', '/api/images/2', 1, 2, NULL, NULL),
('rt2001',   '$2b$10$UtdwuZdSh7s9AqrUtceZJuONhQNpgD24DFfOKS.O9zf07GrW.8fqm', 'technician', 'Khalid',  'Omar',     'Alqahtani', 'male',   'khalid.alqahtani@vismed.com',  '+966503333333', '/api/images/3', 1, NULL, NULL, 1),
('pat3001',  '$2b$10$Di1ypEMeJ343tbaJDPQUFe6LnczWaed.iYace8ASokAbABXYt2K2.', 'patient',    'Noura',   NULL,       'Alrashid',  'female', 'noura.alrashid@vismed.com',    '+966551234567', '/api/images/4', 1, NULL, 1, NULL),
('pat3002',  '$2b$10$IMLc8FLGX1BdRnpK9zwC/OME6kG64WoMz5QnXipmLu/vMWnBVH1Z2', 'patient',    'Yousef',  NULL,       'Alshehri',  'male',   'yousef.alshehri@vismed.com',   '+966552345678', '/api/images/5', 1, NULL, 2, NULL),
('pat3003',  '$2b$10$sD1nCnnaO1QW12XvIRRzh.BUDj9Q/L5bZrp5qxyuqvCf8ovon8Kba', 'patient',    'Hessa',   NULL,       'Alotaibi',  'female', 'hessa.alotaibi@vismed.com',    '+966553456789', '/api/images/6', 1, NULL, 3, NULL);

-- ============================================================
-- Sample Data: Technician - Patient Assignments
-- ============================================================

INSERT INTO technician_patient_assignments (technician_id, patient_id) VALUES
(1, 1),
(1, 2),
(1, 3);

-- ============================================================
-- Sample Data: Doctor - Patient Assignments
-- ============================================================

INSERT INTO doctor_patient_assignments (doctor_id, patient_id) VALUES
(1, 1),
(1, 2),
(2, 3);

-- ============================================================
-- Sample Data: Accessions
-- ============================================================

INSERT INTO accession (accession_number, patient_id, exam_date, modality) VALUES
(NULL, 1, '2023-03-12', 'CT'),
(NULL, 2, '2023-03-12', 'CT'),
(NULL, 3, '2023-03-12', 'CT');

UPDATE users SET password_hash='$2b$10$a2jhxMMDP4mYrMa7AabQZO58JrLuhHh57QDT/m6F65uA6AuQBr/bW' WHERE username='doc1001';
UPDATE users SET password_hash='$2b$10$P/Pw0bx4SI3UDqNKZLYyOubOQke6NQHtkYWSFWj6tGFcFbHMuUd2y' WHERE username='doc1002';
UPDATE users SET password_hash='$2b$10$rk1mkMFmC9rAnZ4ta4gFROr1LZyg35piOP0D5AOylP25FJdjciOS6' WHERE username='rt2001';
UPDATE users SET password_hash='$2b$10$irpUdxCoUtsbPwu4jjDZt.3xvkVT6rtifEdN7HIo/dF0yfYAabZdm' WHERE username='pat3001';
UPDATE users SET password_hash='$2b$10$220u8vryPF57UBW04CD1.e9/sHeWFp7jHUIEUhl6Pu01JfKoHlrnG' WHERE username='pat3002';
UPDATE users SET password_hash='$2b$10$n9W9/K5ql..0f/MUAvyqeu0j7KG2Ix4oXsD9MHw5EFJUR5UPBg0cS' WHERE username='pat3003';
