// frontend/script.js

const API_BASE_URL = 'http://localhost:3000'; // Adjust if your backend runs on a different port

// Function to fetch and display courses on index.html
async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        const courses = await response.json();
        const courseList = document.getElementById('courseList');
        courseList.innerHTML = ''; // Clear existing list
        courses.forEach(course => {
            const listItem = document.createElement('li');
            listItem.textContent = `${course.course_name} (Section ${course.section})`;
            courseList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Event listener for the registration form on index.html
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const studentId = document.getElementById('studentId').value;
        const courseId = document.getElementById('courseId').value;
        const registrationMessage = document.getElementById('registrationMessage');

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ student_id: studentId, course_id: courseId }),
            });

            const data = await response.json();
            if (response.ok) {
                registrationMessage.textContent = data.message;
                registrationMessage.className = 'message success';
                // Optionally reload courses or clear the form
                loadCourses();
            } else {
                registrationMessage.textContent = data.error || 'Registration failed';
                registrationMessage.className = 'message error';
            }
        } catch (error) {
            console.error('Error registering:', error);
            registrationMessage.textContent = 'Failed to connect to the server';
            registrationMessage.className = 'message error';
        }
    });

    // Load courses when index.html is loaded
    loadCourses();
}

// Function to fetch and display students and their registrations on students.html
async function loadStudentRegistrations() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const students = await response.json();
        const studentList = document.getElementById('studentList');
        studentList.innerHTML = ''; // Clear existing list
        for (const student of students) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${student.name}</strong> (${student.email}) - Registered for: <ul id="registrations-${student.student_id}"></ul>`;
            studentList.appendChild(listItem);
            await loadRegistrationsForStudent(student.student_id);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function loadRegistrationsForStudent(studentId) {
    try {
        // This endpoint doesn't exist yet in your backend.
        // You would need to create a new one to fetch registrations for a specific student.
        // For now, we'll just log a message.
        console.log(`Fetching registrations for student ${studentId}`);
        // const response = await fetch(`${API_BASE_URL}/students/${studentId}/registrations`);
        // const registrations = await response.json();
        // const registrationsList = document.getElementById(`registrations-${studentId}`);
        // registrations.forEach(reg => {
        //     const regItem = document.createElement('li');
        //     regItem.textContent = `Course ID: ${reg.course_id}`; // You might want to fetch course name here
        //     registrationsList.appendChild(regItem);
        // });
    } catch (error) {
        console.error(`Error loading registrations for student ${studentId}:`, error);
    }
}

// Load student registrations when students.html is loaded
if (document.getElementById('studentList')) {
    loadStudentRegistrations();
}

// Event listener for the update form on update.html
const updateForm = document.getElementById('updateForm');
if (updateForm) {
    updateForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const regId = document.getElementById('regId').value;
        const newCourseId = document.getElementById('newCourseId').value;
        const updateMessage = document.getElementById('updateMessage');

        try {
            const response = await fetch(`${API_BASE_URL}/update-registration`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reg_id: regId, course_id: newCourseId }),
            });

            const data = await response.json();
            if (response.ok) {
                updateMessage.textContent = data.message;
                updateMessage.className = 'message success';
            } else {
                updateMessage.textContent = data.error || 'Update failed';
                updateMessage.className = 'message error';
            }
        } catch (error) {
            console.error('Error updating registration:', error);
            updateMessage.textContent = 'Failed to connect to the server';
            updateMessage.className = 'message error';
        }
    });
}
