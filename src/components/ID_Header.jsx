import React, { useState, useEffect, useCallback } from 'react';
import './ID_Header.css';
import { Button, Menu, MenuItem, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DatabaseSelector from './Login/DatabaseSelector';
import apiClient, { getUserId } from '../utils/apiClient';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useDatabase } from '../utils/DatabaseContext'; // Update the import path as needed

const Header = ({ signOut, isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getUserId();
  const [anchorEl, setAnchorEl] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const { databaseName } = useDatabase();

  const fetchCompanyName = useCallback(async () => {
    if (!databaseName) return;
    try {
      const response = await apiClient.get('/getCompanyName');
      setCompanyName(response.data.name);
    } catch (error) {
      console.error('Error fetching company name:', error);
      setCompanyName('');
    }
  }, [databaseName]);

  useEffect(() => {
    if (!isAdmin && databaseName) {
      fetchCompanyName();
    }
  }, [isAdmin, databaseName, fetchCompanyName]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClick = () => {
    navigate('/home');
  };

  return (
    <header className="header">
      <div className="logo-div">
        <img src='/company_logo.png' alt="Company Logo" className="logo" />
      </div>

      <div className="header-title">
        {!isAdmin && (
          <h5><strong>{companyName}</strong></h5>
        )}
      </div>

      <div>
        {!isAdmin && location.pathname !== '/home' && (
          <Button
            variant="contained"
            onClick={handleClick}
            sx={{ height: "30px", backgroundColor: '#8697C4' }}
          >
            Summary
          </Button>
        )}
      </div>

      <div className="user-menu">
        <Button
          variant="contained"
          onClick={handleMenuOpen}
          sx={{ height: "30px", backgroundColor: '#8697C4' }}
        >
          <AccountCircle />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {userId}
            </Typography>
          </MenuItem>
          <MenuItem>
            <DatabaseSelector />
          </MenuItem>
          <MenuItem>
            <Button
              variant="contained"
              onClick={signOut}
              sx={{ height: "30px", backgroundColor: '#8697C4', color: 'white' }}
            >
              Sign Out
            </Button>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
};

export default Header;