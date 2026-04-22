import "../Dashboard/add.css"
import React, { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

const UpdateMissedExam = () => {
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [totalFine, setTotalFine] = useState(0)
  const [reason, setReason] = useState("")
  const [attachment, setAttachment] = useState(null)
  const [isLocked, setIsLocked] = useState(false)

// find student submitted applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await axios.get(
          "http://localhost:8000/api/student-application/my-application",
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const app = res.data.application

        if (app.authorityStatus === "Approved") {
          setIsLocked(true) // lock state on
          alert("You can't update your application because it has already been approved by authority.")
          navigate("/student-dashboard") // redirect
          return
        }

        setCourses(app.courses)
        setTotalFine(app.totalFine)
        setReason(app.reason)

      } catch (err) {
        alert("No application found")
        navigate("/student-dashboard")
      }
    }

    fetchData()
  }, [navigate])

// updated info
  const handleCourseChange = (index, e) => {
    const { name, value } = e.target
    const updated = [...courses]
    updated[index][name] = value
    setCourses(updated)
    setTotalFine(updated.length * 2000)
  }

  const addCourse = () => {
    const updated = [
      ...courses,
      { courseTitle: "", facultyAcr: "", courseId: "", missedExamDate: "", fine: 2000 }
    ]
    setCourses(updated)
    setTotalFine(updated.length * 2000)
  }

  const removeCourse = (index) => {
    const updated = courses.filter((_, i) => i !== index)
    setCourses(updated)
    setTotalFine(updated.length * 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLocked) {
      alert("Update not allowed. Application already approved.")
      return
    }

    const token = localStorage.getItem("token")
    const data = new FormData()

    data.append("courses", JSON.stringify(courses))
    data.append("reason", reason)
    if (attachment) data.append("attachment", attachment)

    try {
      const res = await axios.put(
        "http://localhost:8000/api/student-application/application-update",
        data,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      if (res.data.success) {
        alert("Application updated successfully")
        navigate("/student-dashboard")
      }

    } catch (err) {
      alert("Update failed")
    }
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
                value={course.missedExamDate}
                onChange={(e) => handleCourseChange(index, e)}
              />

              <label>Course Title</label>
              <input
                className="course-title"
                type="text"
                name="courseTitle"
                value={course.courseTitle}
                onChange={(e) => handleCourseChange(index, e)}
              />

              <label>Faculty Acronym</label>
              <input
                className="course-title"
                type="text"
                name="facultyAcr"
                value={course.facultyAcr}
                onChange={(e) => handleCourseChange(index, e)}
              />

              <label>Course Id</label>
              <input
                className="course-title"
                type="text"
                name="courseId"
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
            <label>Replace Attachment (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setAttachment(e.target.files[0])}
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
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn"  disabled={isLocked}>
            Update Application
          </button>

        </form>
      </div>
    </div>
  )
}

export default UpdateMissedExam
