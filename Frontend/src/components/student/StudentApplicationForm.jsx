import '../Dashboard/add.css'
import React, { useState, useEffect } from "react" 
import axios from "axios"
import { Link, useNavigate } from "react-router-dom" 

const ApplyMissedExam = () => { 
  const navigate = useNavigate()

  //const [userInfo, setUserInfo] = useState({ studentId: "", name: "" }) // auto added
  const [section, setSection] = useState("")
  const [courses, setCourses] = useState([{ courseTitle: "", facultyAcr: "", courseId: "", missedExamDate: "", fine: 2000 }])
  const [totalFine, setTotalFine] = useState(courses.length * 2000)
  const [showPopup, setShowPopup] = useState(true);
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    missedExamType: "",
    missedExamDate: getTodayDate(),
    semester: "",
    section: "",
    department: '', 
    reason: "",
    attachment: null
  })

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await axios.get("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data.success) {
        const user = res.data.user

        setFormData(prev => ({
          ...prev,
          studentId: user.userID, // auto-fill studentId
          name: user.name,        // auto-fill name
          department: user.department // auto-fill department
        }))
      }
    } catch (err) {
      console.error("Failed to fetch user info", err)
    }
  }

  fetchUser()
}, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "attachment" ? files[0] : value
    }))
  }

  const handleCourseChange = (index, e) => {
    const { name, value } = e.target
    const updatedCourses = [...courses]
    updatedCourses[index][name] = value
    setCourses(updatedCourses)
  }

  const addCourse = () => {
    const newCourses = [
      ...courses,
      { courseTitle: "", facultyAcr: "", courseId: "", missedExamDate: getTodayDate(), fine: 2000 }
    ]
    setCourses(newCourses)
    setTotalFine(newCourses.length * 2000)
  }

  const removeCourse = (index) => {
    const newCourses = courses.filter((_, i) => i !== index)
    setCourses(newCourses)
    setTotalFine(newCourses.length * 2000)
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return alert("Unauthorized");

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
  data.append("courses", JSON.stringify(courses));
  if (formData.attachment) data.append("attachment", formData.attachment);

  try {
    const res = await axios.post("http://localhost:8000/api/student-application/apply", data, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });
    if (res.data.success) {
      alert("Application submitted successfully");
      navigate("/student-dashboard");
    }
  } catch (err) {
    alert(err.response?.data?.error || "Application already submitted");
  }
};

  return (
    <div className="main-content">
      {showPopup && (
      <div className="popup-overlay">
        <div className="popup-box">
          <h2>Fill the Application Carefully</h2>
          <button onClick={() => setShowPopup(false)}>OK</button>
        </div>
      </div>
    )}
      <div className="user-dashboard">
        <h2 className="form-title">Special Exam Application</h2>

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
              onChange={(e) => {
                const value = e.target.value
                // if (/^\d*$/.test(value)) {
                //   setFormData(prev => ({ ...prev, studentId: value }))
                // }
              }}
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
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              placeholder="Department Name"
              name="name"
              readOnly                                   
              value={formData.department}
              onChange={handleChange}
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
            <select name="semester" required value={formData.semester} onChange={handleChange}>
              <option value="">Select</option>
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
              <option value="3rd">3rd Semester</option>
              <option value="4th">4th Semester</option>
              <option value="5th">5th Semester</option>
              <option value="6th">6th Semester</option>
              <option value="7th">7th Semester</option>
              <option value="8th">8th Semester</option>
              <option value="9th">9th Semester</option>
              <option value="10th">10th Semester</option>
              <option value="11th">11th Semester</option>
              <option value="12th">12th Semester</option>
            </select>
          </div>

          <div className="form-group">
            <label>Section</label>
            <input
              type="text"
              name="section"
              placeholder="Insert Section"
              required
              value={section}
              onChange={(e) => {
                const val = e.target.value.toUpperCase()
                setSection(val)
                setFormData(prev => ({ ...prev, section: val }))
              }}
            />
          </div>

          <div className="form-group">
            <label>Missed Exam Type</label>
            <select name="missedExamType" required value={formData.missedExamType} onChange={handleChange}>
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
                onChange={(e) => handleCourseChange(index, e)}
              />

              <label>Course Title</label>
              <input
                className="course-title"
                type="text"
                name="courseTitle"
                placeholder="Full course Name"
                required
                value={course.courseTitle}
                onChange={(e) => handleCourseChange(index, e)}
              />

              <label>Faculty Acronym</label>
              <input
                className="course-title"
                type="text"
                name="facultyAcr"
                placeholder="Capital Letter"
                required
                onInput={(e) => e.target.value = e.target.value.replace(/[^A-Z\s]/g, '')}
                value={course.facultyAcr}
                onChange={(e) => handleCourseChange(index, e)}
              />

              <label>Course Id</label>
              <input
                className="course-title"
                type="text"
                name="courseId"
                placeholder="Capital letter"
                required
                onInput={(e) => e.target.value = e.target.value.replace(/[^A-Z0-9\s]/g, '')}
                value={course.courseId}
                onChange={(e) => handleCourseChange(index, e)}
              />

              {courses.length > 1 && (
                <button type="button" onClick={() => removeCourse(index)}>❌</button>
              )}
            </div>
          ))}

          <button type="button" className="add-btn" onClick={addCourse}>
            + Add Another Course
          </button>

          <div className="form-group">
            <label>Attachment (PDF)</label>
            <input
              type="file"
              name="attachment"
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
  )
}

export default ApplyMissedExam
