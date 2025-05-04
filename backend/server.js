const express = require('express');
const getConn = require('./db');    
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let conn; // Declare conn in the outer scope

// Initialize the connection
(async () => {
  try {
    conn = await getConn;

    // API endpoints
    // GET all courses
    app.get('/courses', async (req, res) => {
      try {
        const [rows] = await conn.query('SELECT * FROM courses');
        res.json(rows);
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
      }
    });

    // GET all students
    app.get('/students', async (req, res) => {
      try {
        const [rows] = await conn.query('SELECT * FROM students');
        res.json(rows);
      } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
      }
    });

    // GET student's course registrations
    app.get('/students/:student_id/registrations', async (req, res) => {
      const student_id = req.params.student_id;
      try {
        const [rows] = await conn.query(`
          SELECT r.reg_id, r.course_id, c.course_name, c.section 
          FROM registrations r
          JOIN courses c ON r.course_id = c.course_id
          WHERE r.student_id = ?
        `, [student_id]);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching student registrations:', error);
        res.status(500).json({ error: 'Failed to fetch student registrations' });
      }
    });

    // POST register student to a course
    app.post('/register', async (req, res) => {
      const { student_id, course_id } = req.body;
      if (!student_id || !course_id) {
        return res.status(400).json({ error: 'Student ID and Course ID are required' });
      }
      try {
        // 1. Check if student is already registered for this course
        const [existingReg] = await conn.query(
          'SELECT * FROM registrations WHERE student_id = ? AND course_id = ?',
          [student_id, course_id]
        );
        if (existingReg.length > 0) {
          return res.status(400).json({ error: 'You have already registered for this course' });
        }

        // 2. Get course capacity
        const [courseRows] = await conn.query('SELECT * FROM courses WHERE course_id = ?', [course_id]);
        if (courseRows.length === 0) {
          return res.status(400).json({ error: 'Course not found' });
        }
        const capacity = courseRows[0].capacity;

        // 3. Count existing registrations
        const [registrationCountRows] = await conn.query(
          'SELECT COUNT(*) AS count FROM registrations WHERE course_id = ?',
          [course_id]
        );
        const registrationCount = registrationCountRows[0].count;

        // 4. Check capacity
        if (registrationCount >= capacity) {
          return res.status(400).json({ error: 'Course is full' });
        }

        // 5. Insert registration (if not full)
        const [result] = await conn.query(
          'INSERT INTO registrations (student_id, course_id) VALUES (?, ?)',
          [student_id, course_id]
        );
        res.status(201).json({ 
          message: 'Registration successful', 
          reg_id: result.insertId,
          course: courseRows[0] // Include course details in response
        });
      } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Failed to register student' });
      }
    });

    // PUT (Update student's course)
    app.put('/update-registration', async (req, res) => {
      const { reg_id, course_id } = req.body;
      if (!reg_id || !course_id) {
        return res.status(400).json({ error: 'Registration ID and new Course ID are required' });
      }
      try {
        const [result] = await conn.query(
          'UPDATE registrations SET course_id = ? WHERE reg_id = ?',
          [course_id, reg_id]
        );
        if (result.affectedRows > 0) {
          res.json({ message: 'Registration updated successfully' });
        } else {
          res.status(404).json({ error: 'Registration not found' });
        }
      } catch (error) {
        console.error('Error updating registration:', error);
        res.status(500).json({ error: 'Failed to update registration' });
      }
    });

    // DELETE (Remove registration)
    app.delete('/deregister/:reg_id', async (req, res) => {
      const reg_id = req.params.reg_id;
      try {
        const [result] = await conn.query(
          'DELETE FROM registrations WHERE reg_id = ?',
          [reg_id]
        );
        if (result.affectedRows > 0) {
          res.json({ message: 'Registration deleted successfully' });
        } else {
          res.status(404).json({ error: 'Registration not found' });
        }
      } catch (error) {
        console.error('Error deregistering student:', error);
        res.status(500).json({ error: 'Failed to deregister student' });
      }
    });

    // Start the server after the connection is established
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    // Handle initial connection error
    console.error("Failed to connect to database:", error);
  }
})();
