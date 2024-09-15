import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword, confirmResetPassword } from '@aws-amplify/auth';
import './CognitoCustomUI.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await resetPassword({ username: email });
      setStep('reset');
      setMessage('Verification code sent to your email.');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      setStep('success');
      setMessage('Password reset successfully. You can now sign in with your new password.');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className='cont'>
    <div className="auth-container">
      <div className="auth-image"></div>
      <div className="custom-sign-in">
        <div className="auth-header">
          <h2>Forgot Password</h2>
        </div>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        {step === 'request' && (
          <form onSubmit={handleRequestCode}>
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
            <button type="submit" className="sign-in-button">Send Reset Code</button>
          </form>
        )}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter verification code"
                required
              />
            </div>
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
            <button type="submit" className="sign-in-button">Reset Password</button>
          </form>
        )}
        {step === 'success' && (
          <div>
            <p>Your password has been reset successfully.</p>
            <button onClick={() => navigate('/')} className="sign-in-button">Back to Sign In</button>
          </div>
        )}
        {step !== 'success' && (
          <p className="forgot-password">
            <Link to="/">Back to Sign In</Link>
          </p>
        )}
      </div>
    </div>
    </div>
  );
};

export default ForgotPassword;