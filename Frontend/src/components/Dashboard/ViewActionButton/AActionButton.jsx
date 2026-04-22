import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ViewActionButton.css'; 

const AActionButton = () => {
  const { id } = useParams()             
  const [student, setStudent] = useState(null) 
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/acad/acad-view/${id}`,
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
        alert("ACAD not found")
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
        <h2 className="dashboard-title">ACAD Details</h2>

        <div className="back">
          <Link to="/authority-dashboard/acad">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="ImageFrame">
          <img
            src={`http://localhost:8000/imageUploads/uploads/${student.user.profileImage}`}
            alt="ACAD"
          />
        </div>

        <div className="student-info">
          <p><strong>ACAD ID:</strong> {student.studentId}</p>
          <p><strong>ACAD Name:</strong> {student.user.name}</p>
          <p><strong>Email:</strong> {student.user.email}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Gender:</strong> {student.gender}</p>
        </div>
      </div>
    </div>
  );
};

export default AActionButton;
