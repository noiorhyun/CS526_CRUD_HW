const express = require('express');
const getConn = require('./db'); // Import the promise of the connection
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let conn; // Declare conn in the outer scope

// Initialize the connection and then start the server and define routes
(async () => {
  try {
    conn = await getConn; // Await the connection
    // API endpoints

    app.get('/courses', async (req, res) => {
      try {
        const [rows] = await conn.query('SELECT * FROM courses');
        res.json(rows);
      } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
      }
    });

    app.get('/students', async (req, res) => {
      try {
        const [rows] = await conn.query('SELECT * FROM students');
        res.json(rows);
      } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
      }
    });

    app.post('/register', async (req, res) => {
      const { student_id, course_id } = req.body;
      if (!student_id || !course_id) {
        return res.status(400).json({ error: 'Student ID and Course ID are required' });
      }
      try {
        // 1. Get course capacity
        const [courseRows] = await conn.query('SELECT capacity FROM courses WHERE course_id = ?', [course_id]);
        if (courseRows.length === 0) {
          return res.status(400).json({ error: 'Course not found' });
        }
        const capacity = courseRows[0].capacity;

        // 2. Count existing registrations
        const [registrationCountRows] = await conn.query(
          'SELECT COUNT(*) AS count FROM registrations WHERE course_id = ?',
          [course_id]
        );
        const registrationCount = registrationCountRows[0].count;

        // 3. Check capacity
        if (registrationCount >= capacity) {
          return res.status(400).json({ error: 'Course is full' });
        }

        // 4. Insert registration (if not full)
        const [result] = await conn.query(
          'INSERT INTO registrations (student_id, course_id) VALUES (?, ?)',
          [student_id, course_id]
        );
        res.status(201).json({ message: 'Registration successful', reg_id: result.insertId });
      } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Failed to register student' });
      }
    });

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
