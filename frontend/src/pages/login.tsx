import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);

    if (email === '') {
      setEmailError(true);
    }
    if (password === '') {
      setPasswordError(true);
    }
    if (email && password) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:4000/v1/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        const responseData = await response.json();
        console.log('Login response:', responseData);
        if (response.status === 401) {
          alert(responseData.message);
        }
        if (response.ok) {
          // will have to write 
          // logic for handling JWT token later
          navigate('/dashboard'); 
        }
      } catch (error) {
        console.error('An unexpected error occurred:', error);
        alert('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="login-container">
      <div className="form-box">
        <h2 className="login-title">Login</h2>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <div className="styled-textfield">
            <label htmlFor="email">Email Address</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <div className="error-text">Email is required</div>}
          </div>
          <div className="styled-textfield">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordError && <div className="error-text">Password is required</div>}
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <div className="loader-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <div className="link-container">
          <span
            className="styled-link"
            onClick={() => {
              navigate('/signup');
            }}
          >
            Don't have an account? Sign up here
          </span>
        </div>
      </div>
    </div>
  );
}