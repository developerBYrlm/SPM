import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import '../add.css' 

const EditStudent = () => {
  const navigate = useNavigate()
  const { id } = useParams() 

  const [formData, setFormData] = useState({
    email: '',
    studentId: '',
    name: '',
    phone: '', 
    password: '',
    image: null
  })

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/students/view/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        )

        if (res.data.success) {
          const s = res.data.student

          setFormData({
            email: s.user.email,
            studentId: s.studentId,   
            name: s.user.name,
            phone: s.phone,
            password: '',
            image: null
          })
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchStudent()
  }, [id])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "image" ? files[0] : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Unauthorized.")
      return
    }

    const formDataObj = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formDataObj.append(key, value)
      }
    })

    try {
      const res = await axios.post(
        `http://localhost:8000/api/students/edit/${id}`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (res.data.success) {
        alert("Account update successfully")
        navigate("/authority-dashboard/students")
      }

    } catch (error) {
      console.error(error)
      alert(
        error.response?.data?.error ||
        "Server error occurred"
      )
    }
  }
 
  return (
    <div className="main-content">
      <div className="user-dashboard">

        <h2 className="form-title">Update Student Information</h2>

            <div className="back">
              
                  <Link to="/authority-dashboard/students">
                    <i className="fa-solid fa-backward"></i>
                  </Link>
        
            </div>

        <form className="glass-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder='Insert Email' 
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9a-z@.]/g, '')}
            onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>ID </label>
            <input type="text" name="studentId" placeholder='Insert ID' value={formData.studentId}
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
            required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" placeholder='Insert Full Name'   value={formData.name}
            onInput={(e) => e.target.value = e.target.value.replace(/[^A-Za-z.\s]/g, '')}
            onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" placeholder='01xxxxxxxxx'
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
            onChange={handleChange}
             />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder='Include letters, symbol & numbers'  name="password"  onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Profile Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} />
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>

        </form>

      </div>
    </div>
  )
}

export default EditStudent
