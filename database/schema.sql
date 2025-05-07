DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE
);

CREATE TABLE courses (
  course_id INT PRIMARY KEY AUTO_INCREMENT,
  course_name VARCHAR(100),
  section VARCHAR(10),
  capacity INT
);

CREATE TABLE registrations (
  reg_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  course_id INT,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- insert data for students table
INSERT INTO students (name, email) VALUES
('Alice Smith', 'alice.smith@example.com'),
('Bob Johnson', 'bob.johnson@example.com'),
('Jane Wang', 'jane.wang@example.com'),
('May Du', 'may.du@example.com');

-- insert data for courses table
INSERT INTO courses (course_name, section, capacity) VALUES
('Introduction to Programming', 'A', 1),  -- Capacity set to 1
('Introduction to Programming', 'B', 1),  -- Capacity set to 1
('Database Management', 'C', 1),      -- Capacity set to 1
('Database Management', 'D', 1),      -- Capacity set to 1
('Advanced Web Programming', 'A', 1),      -- Capacity set to 1
('Advanced Web Programming', 'B', 1); -- Capacity set to 1 

-- insert data for registrations table
INSERT INTO registrations (student_id, course_id) VALUES
(1, 1), -- Alice registered Introduction to Programming A
(2, 4), -- Bob registered Database Management D
(3, 2), -- Jane registered Database Management C
(4, 3); -- May registered Advanced Web Programming A



