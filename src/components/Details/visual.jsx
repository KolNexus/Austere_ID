import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Container, Typography, AppBar, Toolbar, Tabs, Tab, List, ListItem, ListItemText,
  Avatar, Divider, Box, CircularProgress
} from '@mui/material';
import { useParams } from 'react-router-dom';

// Lazy load components
const Overview = lazy(() => import('./overview'));
const Events = lazy(() => import('./events'));
const PieChartsComponent = lazy(() => import('./summary'));
const Pubs = lazy(() => import('./pubs'));
const Trials = lazy(() => import('./trials'));
const Prof = lazy(() => import('./prof'));

const Visual = () => {
  const [kolDetails, setKolDetails] = useState({});
  const [value, setValue] = useState('summary');
  const { kolId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/data`, {
          params: { kolId }
        });
        const data = response.data;

        if (Object.keys(data).length === 0) {
          throw new Error('No data received');
        }

        setKolDetails(data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [kolId]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };
  const justificationItems = kolDetails['Justification'] ? kolDetails['Justification'].split(',') : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', overflowY: 'scroll' }}>
      <Box sx={{ width: '25%', minWidth: '300px', padding: '16px', backgroundColor: '#EDE8F5', height:'fit-content'}}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Avatar
            alt="KOL Avatar"
            src={kolDetails['Image']}
            sx={{ width: 130, height: 135, margin: '0 auto', borderRadius: '10px' }}
          />
          <Typography variant="h6" color="textPrimary" sx={{ marginTop: '4px' }}>
            {kolDetails['Salutation']}{kolDetails['KOL Name']}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {kolDetails['Suffix']} | {kolDetails['Designation']}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {kolDetails['Affiliation']}
          </Typography>
        </div>
        <Divider />
        <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', padding: '4px', color: 'white' }}>
          Contact Info
        </Typography>
        <List>
          <ListItem sx={{ py: 0 }}>
            <ListItemText primary={`${kolDetails['Address']}, ${kolDetails['City']}, ${kolDetails['State']} ${kolDetails['Zip Code']}, ${kolDetails['Country']}`} />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemText primary={`Phone: ${kolDetails['Phone']}`} />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemText primary={`Fax: ${kolDetails['Fax']}`} />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemText primary={`Email: ${kolDetails['Email']}`} />
          </ListItem>
        </List>
        <Divider />
        <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', padding: '4px', color: 'white' }}>
          Justification
        </Typography>
        <List>
          {justificationItems.map((item, index) => (
            <ListItem key={index} sx={{ py: 0 }}>
              <ListItemText primary={item.trim()} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', padding: '4px', color: 'white' }}>
          Department
        </Typography>
        <List>
          <ListItem sx={{ py: 0 }}>
            <ListItemText primary={kolDetails['Department']} />
          </ListItem>
        </List>
        <Divider />
        <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', padding: '4px', color: 'white' }}>
          Specialty
        </Typography>
        <List>
          <ListItem sx={{ py: 0 }}>
            <ListItemText primary={kolDetails['Specialty']} />
          </ListItem>
        </List>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="relative" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, height: '60px', backgroundColor: '#8697C4' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tabs
              value={value}
              onChange={handleTabChange}
              aria-label="nav tabs"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: "#EDE8F5", // Change the bar background color
                }
              }}
              indicatorColor="primary"
              textColor="inherit"
            >
              <Tab label="Summary" value="summary" />
              <Tab label="Overview" value="overview" />
              <Tab label="Events" value="events" />
              <Tab label="Publications" value="publications" />
              <Tab label="Clinical Trials" value="clinical-trials" />
              <Tab label="Professional Activities" value="prof" />
            </Tabs>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
          <Container sx={{ flexGrow: 1, overflow: 'auto', mx: 0, px: 0 }}>
            <Suspense fallback={<CircularProgress />}>
              {/* Render content based on tab selection */}
              {value === 'overview' ? (
                <Overview kolDetails={kolDetails} setValue={setValue} />
              ) : value === 'events' ? (
                <Events kolId={kolId} />
              ) : value === 'summary' ? (
                <PieChartsComponent kolDetails={kolDetails} />
              ) : value === 'publications' ? (
                <Pubs kolId={kolId} />
              ) : value === 'clinical-trials' ? (
                <Trials kolId={kolId} />
              ) : value === 'prof' ? (
                <Prof kolId={kolId} />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                  <Typography variant="h5">Select a tab to view content</Typography>
                </Box>
              )}
            </Suspense>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Visual;
