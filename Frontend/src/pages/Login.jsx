import axios from 'axios';
import React, { useState } from 'react';
import './website.css';
import './pageAnimation.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';  // Add only if exists

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);    // password hide & show

    const { login } = useAuth();                        // remove or use correctly
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:8000/api/auth/login",
                { email, password }
            );
 
            if (response.data.success) {


                login(response.data.user)
                localStorage.setItem("token", response.data.token)

                const idToSave = response.data.user.studentId || response.data.user._id; 
                localStorage.setItem("studentId", idToSave);

                if(response.data.user.role === "authority"){
                    navigate('/authority-dashboard')
                } else if(response.data.user.role === "student"){
                    navigate('/student-dashboard')
                } else if(response.data.user.role === "faculty"){
                    navigate('/faculty-dashboard')
                } else {
                    navigate('/ACAD-dashboard')
                }
            } 

        } catch (error) {
            if (error.response && !error.response.data.success) {
                setError(error.response.data.error);
            } else {
                setError("Invalid User");
            }

        }
    };

    return (
     <>
      <div className="page slide-left">
        <div className="wrapper">
            <form onSubmit={handleSubmit}>
                <h1>Special Exam Management</h1>
                <h2>LogIn</h2>

                {error && <p className="text">{error}</p>}

                <div className="input-box">
                    <input
                        type="email"
                        placeholder="Enter email"
                        required
                        onInput={(e) => e.target.value = e.target.value.replace(/[^0-9a-z@.]/g, '')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <i className="fa-solid fa-user"></i>
                </div>

                <div className="input-box">
                    <input
                        type={ showPassword? "text" : "password"}
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <i
                    className={`fa-solid ${ showPassword ? "fa-eye-slash" : "fa-eye"  }`} onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}
                    ></i>
                </div>

                <div className="remember-forgot">
                    <Link to="/forgot">Forgot password</Link>
                </div>

                <button type="submit" className="button">Login</button>
            </form>
        </div>
      </div>
     </> 
    );
};

export default Login;
