import React from 'react';
import './ID_Header.css';
import { Button } from '@mui/material';
import { useNavigate,useLocation } from 'react-router-dom';
const Header = ({ signOut }) => {

  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/home`);
  };
  const location = useLocation();

  return (
    <header className="header">
      <div className="logo-div">
        <img src='/company_logo.png' alt="Company Logo" className="logo" />
      </div>

      <div className="header-title">
        <h6>Welcome to KOL Nexus CRM software</h6>
        <h7>Tris Pharma ADHD USA top 200 KOLs</h7>
      </div>

      <div>
        {/* Conditionally render the button based on the current path */}
        {location.pathname !== '/home' && (
          <>
          <Button
            variant="contained"
            onClick={handleClick}
            sx={{ height: "30px", backgroundColor: '#8697C4' }}
          >
            Go To Summary
          </Button>
          
          <Button
            variant="contained"
            onClick={signOut}
            sx={{ height: "30px", marginLeft: '20px', backgroundColor: '#8697C4', color:'white' }}
          >
            Sign Out
          </Button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
