import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import '../components/Dashboard/add.css'
import './pageAnimation.css';


const ForgotPassword = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    studentId: '', // ID / Acronym
    phone: '',
    password: '' 
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("https://spm-1-u37a.onrender.com/api/auth/reset-password", formData)

      if (res.data.success) {
        alert("Password updated successfully!") // Success Popup
        navigate("/login")
      }
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.error || "Verification failed! Check your details.")
    }
  }

  return (
    <div className="page slide-right">
    <div className="main-content-forgot">
      <div className="user-dashboard">

        <h2 className="form-title">Forgot Password</h2>

            <div className="back">
              
                  <Link to="/login">
                    <i className="fa-solid fa-backward"></i>
                  </Link>
        
            </div>

        <form className="glass-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email*</label>
            <input type="email" name="email" placeholder='Insert Email'
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9a-z@.]/g, '')}

            required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>ID / Acronym*</label>
            <input type="text" name="studentId" placeholder='Insert ID / Acronym' value={formData.studentId} required
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9A-Z]/g, '')}
            onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Phone*</label>
            <input type="tel" name="phone" placeholder='01xxxxxxxxx'required
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
            onChange={handleChange}
             />
          </div>

          <div className="form-group">
            <label>Update Password</label>
            <input type="password" placeholder='Include letters, symbol & numbers'  name="password" required onChange={handleChange} />
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>

        </form>

      </div>
    </div></div>
  )
};

export default ForgotPassword
