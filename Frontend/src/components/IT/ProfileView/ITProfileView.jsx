import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import '../../Dashboard/ViewActionButton/ViewActionButton.css'

const ITProfileView = () => {
  const { id } = useParams()             
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(
          `https://spm-1-u37a.onrender.com/api/it/it-view/${id}`,
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
        alert("authority not found")
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id])


  if (loading) { 
    return ( 
     <div className="loading">
        <div className="ring"></div>
    </div>
    );
  }
  if (!student) { return <div>No IT data found</div> }

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h2 className="dashboard-title">IT Member Details</h2>

        <div className="back">
          <Link to="/it-dashboard/it">
            <i className="fa-solid fa-backward"></i>
          </Link>
        </div>

        <div className="ImageFrame">
          <img
            src={`https://spm-1-u37a.onrender.com/imageUploads/uploads/${student.user.profileImage}`}
            alt="IT"
          />
        </div>

        <div className="student-info">
          <p><strong>Department:</strong> {student.user.department}</p>
          <p><strong>IT ID:</strong> {student.studentId}</p>
          <p><strong>IT Name:</strong> {student.user.name}</p>
          <p><strong>Email:</strong> {student.user.email}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Gender:</strong> {student.gender}</p>
        </div>
      </div>
    </div>
  );
};

export default ITProfileView;
