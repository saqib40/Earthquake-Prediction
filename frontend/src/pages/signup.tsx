import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUsernameError(false);
    setEmailError(false);
    setPasswordError(false);

    if (username === '') {
      setUsernameError(true);
    }
    if (email === '') {
      setEmailError(true);
    }
    if (password === '') {
      setPasswordError(true);
    }

    if (username && email && password) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:4000/v1/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        });
        const responseData = await response.json();
        console.log('Signup response:', responseData);

        if (response.status === 400 || response.status === 409) {
          alert(responseData.message);
        }
        if (response.ok) {
          // Assuming successful signup redirects directly now
          navigate('/login'); // Redirect to login page after successful signup
        }
      } catch (error) {
        console.error('An unexpected error occurred:', error);
        alert('Signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="signup-container">
      <div className="form-box">
        <h2 className="signup-title">Sign Up</h2>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <div className="styled-textfield">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {usernameError && <div className="error-text">Username is required</div>}
          </div>
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
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? (
              <div className="loader-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        <div className="link-container">
          <span
            className="styled-link"
            onClick={() => {
              navigate('/login');
            }}
          >
            Already have an account? Login here
          </span>
        </div>
      </div>
    </div>
  );
}