-- Set up the root user with the appropriate authentication plugin and password
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'rootpassword';
FLUSH PRIVILEGES;

-- Create the application-specific user if it doesn't already exist
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';

-- Grant all necessary permissions on the database to the user
GRANT ALL PRIVILEGES ON campuslink_db.* TO 'user'@'%';

-- Ensure the database exists
CREATE DATABASE IF NOT EXISTS campuslink_db;

-- Finalize privileges
FLUSH PRIVILEGES;
