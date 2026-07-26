import "../Dashboard/add.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../Dashboard/ViewActionButton/ViewActionButton.css";

const UpdateMissedExam = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [totalFine, setTotalFine] = useState(0);
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const formatDateForInput = date => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "https://spm-1-u37a.onrender.com/api/student-application/my-application",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const app = res.data.application;

        if (app.authorityStatus === "Approved") {
          setIsLocked(true);
          alert(
            "You can't update your application because it has already been approved by authority."
          );
          navigate("/student-dashboard");
          return;
        }

        const fixedCourses = app.courses?.map(course => ({
          courseTitle: course.courseTitle || "",
          facultyAcr: course.facultyAcr || "",
          courseId: course.courseId || "",
          missedExamDate: formatDateForInput(course.missedExamDate),
          fine: course.fine || 2000
        }));

        setCourses(fixedCourses || []);
        setTotalFine((fixedCourses || []).length * 2000);
        setReason(app.reason || "");
      } catch (err) {
        alert("No application found");
        navigate("/student-dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    setTotalFine(courses.length * 2000);
  }, [courses]);

  const handleCourseChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...courses];

    if (name === "facultyAcr") {
      updated[index][name] = value.toUpperCase().replace(/[^A-Z\s]/g, "");
    } else if (name === "courseId") {
      updated[index][name] = value.toUpperCase().replace(/[^A-Z0-9\s]/g, "");
    } else {
      updated[index][name] = value;
    }

    setCourses(updated);
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
    const updated = courses.filter((_, i) => i !== index);
    setCourses(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (isLocked) {
      alert("Update not allowed. Application already approved.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized");

    const fixedCourses = courses.map(course => ({
      courseTitle: course.courseTitle,
      facultyAcr: course.facultyAcr.trim().toUpperCase(),
      courseId: course.courseId.trim().toUpperCase(),
      missedExamDate: course.missedExamDate,
      fine: 2000
    }));

    const data = new FormData();

    data.append("courses", JSON.stringify(fixedCourses));
    data.append("reason", reason);
    data.append("totalFine", totalFine);

    if (attachment) {
      data.append("attachment", attachment);
    }

    try {
      const res = await axios.put(
        "https://spm-1-u37a.onrender.com/api/student-application/application-update",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res.data.success) {
        alert("Application updated successfully");
        navigate("/student-dashboard");
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Update failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="ring"></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="user-dashboard">
        <h2 className="form-title">Update Special Exam Application</h2>

        <div className="back">
          <Link to="/student-dashboard">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="glass-form">
          <h3 className="form-title">Missed Exam</h3>

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
            <label>Replace Attachment (PDF)</label>
            <input
              type="file"
              name="attachment"
              accept="application/pdf"
              onChange={e => setAttachment(e.target.files[0])}
            />
          </div>

          <div className="form-group">
            <label>Total Fine (Tk)</label>
            <input type="text" value={totalFine} readOnly />
          </div>

          <div className="form-group full-width">
            <label>Reason</label>
            <textarea
              minLength={50}
              required
              rows={5}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLocked}>
            Update Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateMissedExam;