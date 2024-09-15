import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';
import './CognitoCustomUI.css';
import ChangePassword from './ChangePassword';

const CustomSignIn = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [newPasswordRequired, setNewPasswordRequired] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setNewPasswordRequired(true);
      } else if (isSignedIn) {
        onSignIn();
      }
    } catch (error) {
      console.error('Error signing in', error);
      setError('Invalid email or password. Please try again.');
    }
  };

  const handlePasswordChanged = () => {
    setNewPasswordRequired(false);
    onSignIn();
  };

  if (newPasswordRequired) {
    return <ChangePassword username={email} onPasswordChanged={handlePasswordChanged} />;
  }

  return (
    <div className='cont'>
      <div className="auth-container">
        <div className="auth-image"></div>
        <div className="custom-sign-in">
          <div className="auth-header">
            <h2>Sign In</h2>
          </div>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            <button type="submit" className="sign-in-button">Sign in</button>
          </form>
          <p className="forgot-password">
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomSignIn;