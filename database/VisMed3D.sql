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
    body_part VARCHAR(50) NULL,
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
    report_content TEXT NOT NULL,
    report_image VARCHAR(255) NULL,
    report_status ENUM('Draft', 'completed') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accession_id) REFERENCES accession(accession_id) ON DELETE CASCADE,
    FOREIGN KEY (volume_id) REFERENCES volumes(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
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

INSERT INTO doctor_profiles (doctor_id, doctor_code, license_number, years_experience, specialty, profile_image_url) VALUES
(1, 'DOC-0015', 'SCFHS-123456', 9, 'Orthopedist',  '/profiles/1.png'),
(2, 'DOC-0016', 'SCFHS-654321', 7, 'Radiologist',   '/profiles/2.png');

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
(1, 'TECH-0001', 'TECH001567', NULL, 'Radiology Technician', '/profiles/3.png');

-- ============================================================
-- Sample Data: Users
-- ============================================================

INSERT INTO users (username, password_hash, role, first_name, last_name, gender, email, phone, profile_picture, is_active, doctor_id, patient_id, technician_id) VALUES
('doc1001',  '$2b$10$OviHdfLTd6h4sW0op/bLCegQ3ot0EKl8jwGuOmfMDQOOeAAA2H22S', 'doctor',     'Doctor',  'One',      'male',   'doc1@vismed.com',  '+966501111111', '/profiles/1.png', 1, 1, NULL, NULL),
('doc1002',  '$2b$10$Y7/AZQSUSXdcAUxza7Qpc.SBKCfrLWpo/lF3A8VSTcjgYLEofAMnO', 'doctor',     'Doctor',  'Two',      'female', 'doc2@vismed.com',  '+966502222222', '/profiles/2.png', 1, 2, NULL, NULL),
('rt2001',   '$2b$10$UtdwuZdSh7s9AqrUtceZJuONhQNpgD24DFfOKS.O9zf07GrW.8fqm', 'technician', 'RT',      'Tech',     'male',   'rt@vismed.com',    '+966503333333', '/profiles/3.png', 1, NULL, NULL, 1),
('pat3001',  '$2b$10$Di1ypEMeJ343tbaJDPQUFe6LnczWaed.iYace8ASokAbABXYt2K2.', 'patient',    'Noura',   'Alrashid', 'female', 'pat1@vismed.com',  '+966551234567', '/profiles/4.png', 1, NULL, 1, NULL),
('pat3002',  '$2b$10$IMLc8FLGX1BdRnpK9zwC/OME6kG64WoMz5QnXipmLu/vMWnBVH1Z2', 'patient',   'Yousef',  'Alshehri', 'male',   'pat2@vismed.com',  '+966552345678', '/profiles/5.png', 1, NULL, 2, NULL),
('pat3003',  '$2b$10$sD1nCnnaO1QW12XvIRRzh.BUDj9Q/L5bZrp5qxyuqvCf8ovon8Kba', 'patient',   'Hessa',   'Alotaibi', 'female', 'pat3@vismed.com',  '+966553456789', '/profiles/6.png', 1, NULL, 3, NULL);

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

INSERT INTO accession (accession_number, patient_id, exam_date, modality, body_part) VALUES
(NULL, 1, '2023-03-12', 'CT', 'Skull'),
(NULL, 2, '2023-03-12', 'CT', 'Foot'),
(NULL, 3, '2023-03-12', 'CT', 'Head');