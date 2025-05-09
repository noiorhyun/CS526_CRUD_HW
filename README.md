# Student Course Registration Portal

This is a full-stack web application that simulates a university's course registration portal. Students can view available courses, register for courses, update their registration, and deregister from courses.

## Setup Instructions

1.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```

2.  **Set up the database schema:**
    * Navigate to the `database` directory:
        ```bash
        cd database
        ```
    * Execute the `schema.sql` file against your MySQL database using the `mysql` command-line client:
        ```bash
        mysql -u root -p YuexuanLu_161034_DB < schema.sql
        ```

3.  **Start the backend server:**
    ```bash
    cd backend
    npm start
    ```
    This command runs the `server.js` file using Node.js, and your backend API will be accessible on `http://localhost:3000`.

## Access the Frontend

    The frontend of this application is designed to be served from a local development server. To access the frontend pages, ensure your backend server is running, and then use the following URLs in your web browser:



* **Course Listing and Registration:** `http://127.0.0.1:5500/frontend/index.html`
* **Student Registrations:** `http://127.0.0.1:5500/frontend/students.html`
* **Update Registration:** `http://127.0.0.1:5500/frontend/update.html`

* **Course Listing and Registration**: 
![http://127.0.0.1:5500/frontend/index.html](images/home_login.png)
![http://127.0.0.1:5500/frontend/index.html](images/home_page.png)

* **Student Registrations**:
![http://127.0.0.1:5500/frontend/students.html](images/students_page.png)

* **Update Registration**:
![http://127.0.0.1:5500/frontend/update.html](images/update_login.png)
![http://127.0.0.1:5500/frontend/update.html](images/update_page.png)
![http://127.0.0.1:5500/frontend/update.html](sample_output/registration_success.png)
![http://127.0.0.1:5500/frontend/update.html](sample_output/update_drop_confirm.png)
![http://127.0.0.1:5500/frontend/update.html](sample_output/update_drop_success.png)


## API Routes & Sample Requests

The backend API provides the following endpoints:

* **`GET /courses`**: List all available courses.
    * **Sample Request:** `http://localhost:3000/courses`
    * **Sample Request (Postman)**
    ![Get Courses Request in Postman](sample_output/postman_get_courses.png)


* **`GET /students`**: List all students.
    * **Sample Request:** `http://localhost:3000/students`
    * **Sample Response:**
    ![Get Courses Request in Postman](sample_output/postman_get_all_students.png)


* **`POST /register`**: Register a student for a course.
* **Sample Request:** `http://localhost:3000/rigister`
    * **Sample Response:**
    ![Get Courses Request in Postman](sample_output/postman_post_register.png)


* **`PUT /update-registration`**: Update a student's course registration.
* **Sample Request:** `http://localhost:3000/update-registration`
    * **Sample Response:**
    ![Get Courses Request in Postman](sample_output/postman_put_registration.png)

* **`DELETE /deregister/:reg_id`**: Remove a course registration.
* **Sample Request:** `http://localhost:3000/deregister/3`
    * **Sample Response:**
    ![Get Courses Request in Postman](sample_output/postman_delete_registration.png)

* **`GET /export/registrations`**: Export registration data as a CSV file.
* **Sample Request:** `http://localhost:3000/export/registrations`
    * **Sample Response:**
        The browser will download a CSV file named `registrations.csv`. The file will contain the following columns: `reg_id`, `student_id`, `student_name`, `email`, `course_id`, `course_name`, and `section`.


## Assumptions Made or Known Limitations

* **Basic UI:** The frontend styling (`style.css`) is minimal.
* **No Advanced Features:** The application does not include Email confirmation using NodeMailer, when use login, it not like real-worl which need the password.
* **Error Handling:** Backend error handling provides basic messages and status codes. More specific error handling could be implemented.