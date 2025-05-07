const API_BASE_URL = 'http://localhost:3000'; 

// Global variables
let currentStudentId = null;
let currentStudentName = null;

// Function to fetch and display courses on index.html
async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        const courses = await response.json();
        const courseList = document.getElementById('courseList');
        courseList.innerHTML = ''; 

        // Create a table to display courses
        const table = document.createElement('table');
        table.className = 'course-table';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Course ID</th>
                <th>Course Name</th>
                <th>Section</th>
                <th>Capacity</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.course_id}</td>
                <td>${course.course_name}</td>
                <td>${course.section}</td>
                <td>${course.capacity}</td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        courseList.appendChild(table);
    } catch (error) {
        console.error('Error loading courses:', error);
        const courseList = document.getElementById('courseList');
        courseList.innerHTML = '<div class="error">Error loading courses</div>';
    }
}

// Function to load registered courses for a student
async function loadRegisteredCourses(studentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}/registrations`);
        if (!response.ok) {
            throw new Error('Failed to fetch registered courses');
        }
        const registrations = await response.json();
        const registeredCoursesList = document.getElementById('registeredCoursesList');
        
        if (registrations.length === 0) {
            registeredCoursesList.innerHTML = '<p>No courses registered yet</p>';
            return;
        }

        // Create table
        const table = document.createElement('table');
        table.className = 'course-table';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Course ID</th>
                <th>Course Name</th>
                <th>Section</th>
                <th>Action</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        registrations.forEach(reg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reg.course_id}</td>
                <td>${reg.course_name}</td>
                <td>${reg.section}</td>
                <td>
                    <button class="drop-btn" onclick="dropCourse(${reg.reg_id})">Drop</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        registeredCoursesList.innerHTML = '';
        registeredCoursesList.appendChild(table);
    } catch (error) {
        console.error('Error loading registered courses:', error);
        const registeredCoursesList = document.getElementById('registeredCoursesList');
        registeredCoursesList.innerHTML = '<p class="error">Error loading registered courses</p>';
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
            } else {
                registrationMessage.textContent = data.error || 'Registration failed';
                registrationMessage.className = 'message error';
            }
            
            // Always load registered courses after any registration attempt
            await loadRegisteredCourses(studentId);
            
            // Clear the course ID input
            document.getElementById('courseId').value = '';
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
        studentList.innerHTML = ''; 
        
        for (const student of students) {
            // Create student entry container
            const studentEntry = document.createElement('div');
            studentEntry.className = 'student-entry';

            // Create student name and email heading
            const studentHeading = document.createElement('h3');
            studentHeading.textContent = `${student.name} (${student.email})`;
            studentEntry.appendChild(studentHeading);

            // Add "Registered for:" text
            const registeredText = document.createElement('p');
            registeredText.textContent = 'Registered for:';
            studentEntry.appendChild(registeredText);

            // Create list for registered courses
            const coursesList = document.createElement('ul');
            coursesList.className = 'registered-courses';

            // Fetch and display registrations for this student
            try {
                const registrationsResponse = await fetch(`${API_BASE_URL}/students/${student.student_id}/registrations`);
                if (!registrationsResponse.ok) {
                    throw new Error('Failed to fetch registrations');
                }
                const registrations = await registrationsResponse.json();
                
                if (registrations.length === 0) {
                    const noCoursesItem = document.createElement('li');
                    noCoursesItem.textContent = 'No courses registered yet';
                    coursesList.appendChild(noCoursesItem);
                } else {
                    registrations.forEach(reg => {
                        const courseItem = document.createElement('li');
                        courseItem.textContent = `${reg.course_name} (Section ${reg.section})`;
                        coursesList.appendChild(courseItem);
                    });
                }
            } catch (error) {
                console.error(`Error loading registrations for student ${student.student_id}:`, error);
                const errorItem = document.createElement('li');
                errorItem.textContent = 'No courses registered yet';
                coursesList.appendChild(errorItem);
            }

            studentEntry.appendChild(coursesList);
            studentList.appendChild(studentEntry);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        const studentList = document.getElementById('studentList');
        studentList.innerHTML = '<div class="error">Error loading student data</div>';
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

// Function to handle student login
async function handleLogin(studentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`);
        if (!response.ok) {
            throw new Error('Student not found');
        }
        const student = await response.json();
        
        if (!student) {
            throw new Error('Student not found');
        }

        currentStudentId = studentId;
        currentStudentName = student.name;
        
        // Show course management section
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('courseManagementSection').style.display = 'block';
        document.getElementById('studentName').textContent = student.name;
        
        // Load both tables
        await loadAvailableCourses();
        await loadRegisteredCourses(studentId);
    } catch (error) {
        console.error('Login error:', error);
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = 'Invalid Student ID';
        loginMessage.className = 'message error';
    }
}

// Function to load available courses
async function loadAvailableCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        const courses = await response.json();
        const availableCoursesList = document.getElementById('availableCoursesList');
        
        // Create table
        const table = document.createElement('table');
        table.className = 'course-table';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Course ID</th>
                <th>Course Name</th>
                <th>Section</th>
                <th>Capacity</th>
                <th>Available Seats</th>
                <th>Action</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        courses.forEach(course => {
            const row = document.createElement('tr');
            const availableSeats = course.available_seats;
            const isFull = availableSeats <= 0;
            
            row.innerHTML = `
                <td>${course.course_id}</td>
                <td>${course.course_name}</td>
                <td>${course.section}</td>
                <td>${course.capacity}</td>
                <td class="${isFull ? 'full' : ''}">${availableSeats}</td>
                <td>
                    <button class="add-btn" onclick="registerForCourse(${course.course_id})" ${isFull ? 'disabled' : ''}>
                        ${isFull ? 'Full' : 'Add'}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        availableCoursesList.innerHTML = '';
        availableCoursesList.appendChild(table);
    } catch (error) {
        console.error('Error loading available courses:', error);
        const availableCoursesList = document.getElementById('availableCoursesList');
        availableCoursesList.innerHTML = '<p class="error">Error loading available courses</p>';
    }
}

// Function to register for a course
async function registerForCourse(courseId) {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ student_id: currentStudentId, course_id: courseId }),
        });

        const data = await response.json();
        const messageDiv = document.createElement('div');
        messageDiv.className = response.ok ? 'message success' : 'message error';
        messageDiv.textContent = data.message || data.error;
        document.body.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => messageDiv.remove(), 3000);

        // Refresh both tables
        await loadAvailableCourses();
        await loadRegisteredCourses(currentStudentId);
    } catch (error) {
        console.error('Error registering for course:', error);
    }
}

// Function to drop a course
async function dropCourse(regId) {
    try {
        const response = await fetch(`${API_BASE_URL}/deregister/${regId}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        const messageDiv = document.createElement('div');
        messageDiv.className = response.ok ? 'message success' : 'message error';
        messageDiv.textContent = data.message || data.error;
        document.body.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => messageDiv.remove(), 3000);

        // Refresh both tables
        await loadAvailableCourses();
        await loadRegisteredCourses(currentStudentId);
    } catch (error) {
        console.error('Error dropping course:', error);
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Failed to drop course';
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Event listener for login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const studentId = document.getElementById('studentId').value;
        handleLogin(studentId);
    });
}
