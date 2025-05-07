const express = require('express');
const getConn = require('./db');    
const cors = require('cors');
const { Parser } = require('json2csv');

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let conn; // Database connection object

(async () => {
  try {
    conn = await getConn;

    // API endpoints
    // GET all courses with available seats information
    app.get('/courses', async (req, res) => {
      try {
        // Query to get courses with current registration count and available seats
        const [rows] = await conn.query(`
          SELECT 
            c.*,
            (SELECT COUNT(*) FROM registrations WHERE course_id = c.course_id) as current_registrations,
            (c.capacity - (SELECT COUNT(*) FROM registrations WHERE course_id = c.course_id)) as available_seats
          FROM courses c
        `);
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

    // GET single student by ID for login
    app.get('/students/:student_id', async (req, res) => {
      const student_id = req.params.student_id;
      try {
        const [rows] = await conn.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Student not found' });
        }
        res.json(rows[0]);
      } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
      }
    });

    // GET student's course registrations
    app.get('/students/:student_id/registrations', async (req, res) => {
      const student_id = req.params.student_id;
      try {
        // Join registrations with courses to get course details
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

    // Export registrations as CSV
    app.get('/export/registrations', async (req, res) => {
      try {
        // 1. Query the database for all registrations with student and course details
        const [registrations] = await conn.query(`
          SELECT
            r.reg_id,
            s.student_id,
            s.name AS student_name,
            s.email,
            c.course_id,
            c.course_name,
            c.section
          FROM registrations r
          JOIN students s ON r.student_id = s.student_id
          JOIN courses c ON r.course_id = c.course_id
        `);

        // 2. Format the data into CSV
        const fields = ['reg_id', 'student_id', 'student_name', 'email', 'course_id', 'course_name', 'section'];
        const parser = new Parser({ fields });
        const csv = parser.parse(registrations);

        // 3. Send the CSV as a downloadable file
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=registrations.csv');
        res.send(csv);
      } catch (error) {
        console.error('Error exporting registrations:', error);
        res.status(500).json({ error: 'Failed to export registrations' });
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
