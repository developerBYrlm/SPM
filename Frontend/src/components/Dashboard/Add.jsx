import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './add.css'

const Add = () => {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);


  const [formData, setFormData] = useState({
    email: '',
    studentId: '',
    name: '',
    gender: '',
    phone: '',
    role: '', 
    department: '', 
    password: '',
    image: null
  })

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
      alert("Unauthorized. Please login again.")
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
        "http://localhost:8000/api/students/add",
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (res.data.success) {
        alert("Account created successfully")
        navigate("/authority-dashboard")
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

        <h2 className="form-title">Add New User</h2>

            <div className="back">
              
                  <Link to="/authority-dashboard">
                    <i className="fa-solid fa-backward"></i>
                  </Link>
        
            </div>

        <form className="glass-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder='Insert Email' required 
            onInput={(e) => e.target.value = e.target.value.replace(/[^a-z0-9@.\s]/g, '')}
            onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>ID / Acronym</label>
            <input type="text" name="studentId" placeholder='Insert Full ID / Acronym'  required 
            onInput={(e) => e.target.value = e.target.value.replace(/[^A-Z0-9\s]/g, '')}
            onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" placeholder='Insert Full Name'  required
            onInput={(e) => e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')}
            onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" required onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" placeholder='01xxxxxxxxx'  required 
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
            onChange={handleChange}
             />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select name="department" required onChange={handleChange}>
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="EEE">EEE</option>
              <option value="BBA">BBA</option>
              <option value="Law">Law</option>
            </select>
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" required onChange={handleChange}>
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="authority">Authority</option>
              <option value="ACAD">ACAD</option>
            </select>
          </div>




          <div className="form-group password-group">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Include letters, symbol & numbers"
                name="password"
                required
                onChange={handleChange}
              />

              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                onClick={() => setShowPassword(!showPassword)}
             />
            </div>
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

export default Add
