import "../Dashboard/add.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ApplyMissedExam = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState("");
  const [courses, setCourses] = useState([
    { courseTitle: "", facultyAcr: "", courseId: "", missedExamDate: "", fine: 2000 }
  ]);
  const [totalFine, setTotalFine] = useState(2000);
  const [showPopup, setShowPopup] = useState(true);
  const [deadlinePassedPopup, setDeadlinePassedPopup] = useState(false);
  const [showSpecialWarningPopup, setShowSpecialWarningPopup] = useState(false);
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    studentId: "", name: "", missedExamType: "", missedExamDate: getTodayDate(),
    semester: "", section: "", department: "", reason: "", attachment: null
  });

  // Get user data and exam deadline
  useEffect(() => {
    const fetchUserAndSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const resUser = await axios.get(
          "https://spm-1-u37a.onrender.com/api/auth/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resUser.data.success) {
          const user = resUser.data.user;
          setFormData((prev) => ({
            ...prev,
            studentId: user.userID,
            name: user.name,
            department: user.department
          }));
        }

        const resSchedule = await axios.get(
          "https://spm-1-u37a.onrender.com/api/exam-schedule",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resSchedule.data.success && resSchedule.data.schedule) {
          const deadline = new Date(resSchedule.data.schedule.applicationDeadlineDate);
          deadline.setHours(23, 59, 59, 999);

          if (new Date() > deadline) {
            setDeadlinePassedPopup(true);
            setShowPopup(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchUserAndSchedule();
  }, []);

  // Update total fine
  useEffect(() => {
    setTotalFine(courses.length * 2000);
  }, [courses]);

  // Update form data
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "attachment" ? files[0] : value
    }));
  };

  // Update course data
  const handleCourseChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCourses = [...courses];

    if (name === "facultyAcr") {
      updatedCourses[index][name] = value.toUpperCase().replace(/[^A-Z\s]/g, "");
    } else if (name === "courseId") {
      updatedCourses[index][name] = value.toUpperCase().replace(/[^A-Z0-9\s]/g, "");
    } else {
      updatedCourses[index][name] = value;
    }

    setCourses(updatedCourses);
  };

  // Add a new course
  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      { courseTitle: "", facultyAcr: "", courseId: "", missedExamDate: "", fine: 2000 }
    ]);
  };

  // Remove a course
  const removeCourse = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized");

    const fixedCourses = courses.map((course) => ({
      ...course,
      facultyAcr: course.facultyAcr.trim().toUpperCase(),
      courseId: course.courseId.trim().toUpperCase(),
      fine: 2000
    }));

    const data = new FormData();
    data.append("studentId", formData.studentId);
    data.append("name", formData.name);
    data.append("missedExamType", formData.missedExamType);
    data.append("missedExamDate", formData.missedExamDate);
    data.append("semester", formData.semester);
    data.append("section", section);
    data.append("department", formData.department);
    data.append("reason", formData.reason);
    data.append("totalFine", totalFine);
    data.append("courses", JSON.stringify(fixedCourses));

    if (formData.attachment) data.append("attachment", formData.attachment);

    try {
      const res = await axios.post(
        "https://spm-1-u37a.onrender.com/api/student-application/apply",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res.data.success) {
        if (res.data.requiresSpecialPermission) {
          setShowSpecialWarningPopup(true);
        } else {
          alert("Application submitted successfully");
          navigate("/student-dashboard");
        }
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Application already submitted"
      );
    }
  };

  return (
    <div className="main-content">
      {/* Show 5+ special exams red warning popup */}
      {showSpecialWarningPopup && (
        <div className="popup-overlay" style={{ zIndex: 9999 }}>
          <div
            className="popup-box"
            style={{
              border: "3px solid #ef4444",
              boxShadow: "0 15px 35px rgba(239, 68, 68, 0.45)",
              background: "linear-gradient(145deg, #181824, #2c151c)",
              color: "#ffffff",
              maxWidth: "490px",
              padding: "30px 24px",
              borderRadius: "14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "50px", color: "#ef4444", marginBottom: "14px" }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2
              style={{
                color: "#ef4444",
                fontSize: "20px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: "0 0 14px"
              }}
            >
              Special Exam Warning
            </h2>
            <p
              style={{
                color: "#fecaca",
                fontSize: "15px",
                fontWeight: "600",
                lineHeight: "1.6",
                margin: "0 0 24px"
              }}
            >
              You already attend 5 times on special exam and now you meet on Head of department to approve your application with necessary documents IF you have!
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSpecialWarningPopup(false);
                navigate("/student-dashboard/current-application");
              }}
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                border: "none",
                padding: "12px 34px",
                fontSize: "15px",
                fontWeight: "700",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(239, 68, 68, 0.5)"
              }}
            >
              OK, I Understand
            </button>
          </div>
        </div>
      )}

      {/* Show deadline message */}
      {deadlinePassedPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2 style={{ color: "red" }}>Application Deadline is Over!</h2>
            <p>You cannot submit any new applications at this time.</p>
            <button type="button" onClick={() => navigate("/student-dashboard")}>
              Go Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Show welcome message */}
      {showPopup && !deadlinePassedPopup && !showSpecialWarningPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Fill the Application Carefully</h2>
            <button type="button" onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}

      {/* Show form before deadline */}
      {!deadlinePassedPopup && (
        <div className="user-dashboard">
          <h2 className="form-title">Special Exam Application Form</h2>

          <div className="back">
            <Link to="/student-dashboard">
              <i className="fa-solid fa-backward"></i>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="glass-form">
            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text" name="studentId" placeholder="Insert Full ID"
                readOnly value={formData.studentId}
              />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text" name="name" placeholder="Full Name"
                readOnly value={formData.name}
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text" name="department" placeholder="Department Name"
                readOnly value={formData.department}
              />
            </div>

            <div className="form-group">
              <label>Application Date</label>
              <input
                type="date" name="missedExamDate" required
                value={formData.missedExamDate}
                onChange={handleChange}
                max={getTodayDate()}
              />
            </div>

            <div className="form-group">
              <label>Semester</label>
              <input
                type="text" name="semester" placeholder="Summer 2026 .. .."
                required value={formData.semester} onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Section</label>
              <input
                type="text" name="section" placeholder="1A, 2B, 4C .. .."
                required value={section}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setSection(val);
                  setFormData((prev) => ({ ...prev, section: val }));
                }}
              />
            </div>

            <div className="form-group">
              <label>Missed Exam Type</label>
              <select
                name="missedExamType" required
                value={formData.missedExamType}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Special Mid">Special Mid</option>
                <option value="Special Final">Special Final</option>
              </select>
            </div>

            {/* Course information */}
            {courses.map((course, index) => (
              <div key={index} className="course-box">
                <label>Missed Exam Date</label>
                <input
                  className="course-title" type="date" name="missedExamDate"
                  required value={course.missedExamDate}
                  onChange={(e) => handleCourseChange(index, e)}
                />

                <label>Course Title</label>
                <input
                  className="course-title" type="text" name="courseTitle"
                  placeholder="Full Course Name" required
                  value={course.courseTitle}
                  onChange={(e) => handleCourseChange(index, e)}
                />

                <label>Faculty Acronym</label>
                <input
                  className="course-title" type="text" name="facultyAcr"
                  placeholder="Capital Letter" required
                  value={course.facultyAcr}
                  onChange={(e) => handleCourseChange(index, e)}
                />

                <label>Course ID</label>
                <input
                  className="course-title" type="text" name="courseId"
                  placeholder="Capital Letter" required
                  value={course.courseId}
                  onChange={(e) => handleCourseChange(index, e)}
                />

                {courses.length > 1 && (
                  <button type="button" onClick={() => removeCourse(index)}>
                    <i className="fa-solid fa-trash-can"></i> Remove Course
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="add-btn" onClick={addCourse}>
              <i className="fa-solid fa-plus"></i> Add Another Course
            </button>

            <div className="form-group">
              <label>Must Add Your Application & Necessary Attachment (PDF)</label>
              <input
                type="file" name="attachment"
                accept="application/pdf"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Total Fine (Tk)</label>
              <input type="text" value={totalFine} readOnly />
            </div>

            <div className="form-group full-width">
              <label>Reason</label>
              <textarea
                name="reason" placeholder="Write Down Short Application..."
                minLength={50} required rows={5}
                value={formData.reason}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="submit-btn">
              <i className="fa-solid fa-paper-plane"></i> Submit Application
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ApplyMissedExam;