import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ViewActionButton.css';


const FActionButton = () => {
  const { id } = useParams()             
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/faculty/faculty-view/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )

        if (response.data.success) {
          setStudent(response.data.student)
        }
      } catch (error) {
        console.error(error)
        alert("Faculty not found")
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id])

  if (loading) { return <div>Loading...</div>}

  if (!student) { return <div>No student data found</div> }

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Faculty Details</h2>

        <div className="back">
          <Link to="/authority-dashboard/faculty">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="ImageFrame">
          <img
            src={`http://localhost:8000/imageUploads/uploads/${student.user.profileImage}`}
            alt="faculty"
          />
        </div>

        <div className="student-info">
          <p><strong>Department:</strong> {student.user.department}</p>
          <p><strong>Faculty Acronym:</strong> {student.studentId}</p>
          <p><strong>Faculty Name:</strong> {student.user.name}</p>
          <p><strong>Email:</strong> {student.user.email}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Gender:</strong> {student.gender}</p>
        </div>
      </div>
    </div>
  );
}

export default FActionButton
