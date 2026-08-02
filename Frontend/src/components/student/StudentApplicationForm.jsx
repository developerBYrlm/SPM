import "../Dashboard/add.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ApplyMissedExam = () => {
  const navigate = useNavigate();

  const [section, setSection] = useState("");

  const [courses, setCourses] = useState([
    {
      courseTitle: "",
      facultyAcr: "",
      courseId: "",
      missedExamDate: "",
      fine: 2000
    }
  ]);

  const [totalFine, setTotalFine] = useState(2000);
  const [showPopup, setShowPopup] = useState(true);

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    missedExamType: "",
    missedExamDate: getTodayDate(),
    semester: "",
    section: "",
    department: "",
    reason: "",
    attachment: null
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("https://spm-1-u37a.onrender.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data.success) {
          const user = res.data.user;

          setFormData(prev => ({
            ...prev,
            studentId: user.userID,
            name: user.name,
            department: user.department
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    setTotalFine(courses.length * 2000);
  }, [courses]);

  const handleChange = e => {
    const { name, value, files } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === "attachment" ? files[0] : value
    }));
  };

  const handleCourseChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCourses = [...courses];

    if (name === "facultyAcr") {
      updatedCourses[index][name] = value
        .toUpperCase()
        .replace(/[^A-Z\s]/g, "");
    } else if (name === "courseId") {
      updatedCourses[index][name] = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "");
    } else {
      updatedCourses[index][name] = value;
    }

    setCourses(updatedCourses);
  };

  const addCourse = () => {
    setCourses(prev => [
      ...prev,
      {
        courseTitle: "",
        facultyAcr: "",
        courseId: "",
        missedExamDate: "",
        fine: 2000
      }
    ]);
  };

  const removeCourse = index => {
    const newCourses = courses.filter((_, i) => i !== index);
    setCourses(newCourses);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized");

    const fixedCourses = courses.map(course => ({
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

    if (formData.attachment) {
      data.append("attachment", formData.attachment);
    }

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
        alert("Application submitted successfully");
        navigate("/student-dashboard");
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
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Fill the Application Carefully</h2>
            <button type="button" onClick={() => setShowPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className="user-dashboard">
        <h2 className="form-title">Special Exam Application form</h2>

        <div className="back">
          <Link to="/student-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="glass-form">
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              placeholder="Insert Full ID"
              readOnly
              value={formData.studentId}
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              readOnly
              value={formData.name}
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              placeholder="Department Name"
              name="department"
              readOnly
              value={formData.department}
            />
          </div>

          <div className="form-group">
            <label>Application Date</label>
            <input
              type="date"
              name="missedExamDate"
              required
              value={formData.missedExamDate}
              onChange={handleChange}
              max={getTodayDate()}
            />
          </div>

          <div className="form-group">
            <label>Semester</label>
           <input
           type="text"
           name="semester"
           placeholder="Summer 2026 .. .."
           required
           value={formData.semester}
           onChange={handleChange}
           />
          </div>

          <div className="form-group">
            <label>Section</label>
            <input
              type="text"
              name="section"
              placeholder="1A, 2B, 4C .. .."
              required
              value={section}
              onChange={e => {
                const val = e.target.value.toUpperCase();
                setSection(val);
                setFormData(prev => ({
                  ...prev,
                  section: val
                }));
              }}
            />
          </div>

          <div className="form-group">
            <label>Missed Exam Type</label>
            <select
              name="missedExamType"
              required
              value={formData.missedExamType}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="mid">Mid</option>
              <option value="final">Final</option>
            </select>
          </div>

          {courses.map((course, index) => (
            <div key={index} className="course-box">
              <label>Missed Exam Date</label>
              <input
                className="course-title"
                type="date"
                name="missedExamDate"
                required
                value={course.missedExamDate}
                onChange={e => handleCourseChange(index, e)}
              />

              <label>Course Title</label>
              <input
                className="course-title"
                type="text"
                name="courseTitle"
                placeholder="Full course Name"
                required
                value={course.courseTitle}
                onChange={e => handleCourseChange(index, e)}
              />

              <label>Faculty Acronym</label>
              <input
                className="course-title"
                type="text"
                name="facultyAcr"
                placeholder="Capital Letter"
                required
                value={course.facultyAcr}
                onChange={e => handleCourseChange(index, e)}
              />

              <label>Course Id</label>
              <input
                className="course-title"
                type="text"
                name="courseId"
                placeholder="Capital letter"
                required
                value={course.courseId}
                onChange={e => handleCourseChange(index, e)}
              />

              {courses.length > 1 && (
                <button type="button" onClick={() => removeCourse(index)}>
                  ❌
                </button>
              )}
            </div>
          ))}

          <button type="button" className="add-btn" onClick={addCourse}>
            + Add Another Course
          </button>

          <div className="form-group">
            <label>Must Add your Application & Necessary Attachment (PDF)</label>
            <input
              type="file"
              name="attachment"
              required
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
              name="reason"
              placeholder="Write down short Application...."
              minLength={50}
              required
              rows={5}
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyMissedExam;
