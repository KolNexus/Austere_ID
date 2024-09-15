import React, { useState } from 'react';
import { confirmSignIn } from 'aws-amplify/auth';
import './CognitoCustomUI.css';

// Hardcoded password policy (adjust according to your Cognito User Pool settings)
const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

const ChangePassword = ({ username, onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < PASSWORD_POLICY.minLength) {
      errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
    }
    if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const validationErrors = validatePassword(newPassword);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    try {
      const { isSignedIn } = await confirmSignIn({ challengeResponse: newPassword });
      
      if (isSignedIn) {
        onPasswordChanged();
      } else {
        setError('Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Error changing password', error);
      setError(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className='cont'>
      <div className="auth-container">
        <div className="auth-image"></div>
        <div className="custom-sign-in">
          <div className="auth-header">
            <h2>Change Password</h2>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="password-policy">
            <h3>Password Requirements:</h3>
            <ul>
              <li>Minimum {PASSWORD_POLICY.minLength} characters long</li>
              {PASSWORD_POLICY.requireUppercase && <li>At least one uppercase letter</li>}
              {PASSWORD_POLICY.requireLowercase && <li>At least one lowercase letter</li>}
              {PASSWORD_POLICY.requireNumbers && <li>At least one number</li>}
              {PASSWORD_POLICY.requireSpecialChars && <li>At least one special character</li>}
            </ul>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button type="submit" className="sign-in-button">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;