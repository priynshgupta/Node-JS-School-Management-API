-- Simple database setup script for School Management API

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS school_management;

-- Use the database
USE school_management;

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data (optional)
INSERT INTO schools (name, address, latitude, longitude) VALUES
('Central High School', '123 Malad, Mumbai', 40.7128, -74.0060),
('Westside Elementary', '456 Kandivali, Mumbai', 40.7305, -73.9925),
('Eastside Middle School', '789 Colaba, Mumbai', 40.7214, -73.9878);
