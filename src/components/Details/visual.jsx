import React, { useState, useEffect, lazy, Suspense } from 'react';
import apiClient from '../../utils/apiClient';
import {
  Container, Typography, AppBar, Toolbar, Tabs, Tab, List, ListItem, ListItemText,
  Avatar, Divider, Box, CircularProgress, ThemeProvider, createTheme
} from '@mui/material';
import { useParams } from 'react-router-dom';

// Lazy load components
const Overview = lazy(() => import('./overview'));
const Events = lazy(() => import('./events'));
const PieChartsComponent = lazy(() => import('./summary'));
const Pubs = lazy(() => import('./pubs'));
const Trials = lazy(() => import('./trials'));
const Prof = lazy(() => import('./prof'));
const Network = lazy(() => import('./networkMap'));


// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: 'Aptos',
    fontSize: 14, // Slightly smaller font size
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '4px',
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        selectLabel: {
          display: "contents"
        },
        spacer: {
          flex: 'none', // This removes the flex grow
        },
        displayedRows: {
          margin: "auto"
        }
      },
    },
  },
});

const Visual = () => {
  const [kolDetails, setKolDetails] = useState({});
  const [value, setValue] = useState('summary');
  const { kolId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(`/data`, {
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

  const handleImageError = (event) => {
    event.target.src = '/blank_profile.png';  // Path to the image in the public directory
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'row', overflowY: 'scroll', width: "100%" }}>
        <Box sx={{ width: '23%', minWidth: '300px', padding: '16px', backgroundColor: '#EDE8F5', height: 'max-content' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <Avatar
              src={kolDetails['Image']}
              onError={handleImageError}
              sx={{ width: 130, height: 135, margin: '0 auto', borderRadius: '10px' }}
            />
            <Typography variant="h6" color="textPrimary" sx={{ marginTop: '2px' }}>
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
          <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', px: 2, color: 'white' }}>
            Contact Info
          </Typography>
          <List>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={`${kolDetails['Address']}, ${kolDetails['City']}, ${kolDetails['State']} ${kolDetails['Zip Code']}, ${kolDetails['Country']}`} />
            </ListItem>
            {kolDetails['Phone'] !== "NULL" && (
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary={<Typography variant="body1"><strong>Phone:</strong> {kolDetails['Phone']}</Typography>} />
              </ListItem>
            )}
            {kolDetails['Fax'] !== "NULL" && (
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary={<Typography variant="body1"><strong>Fax:</strong> {kolDetails['Fax']}</Typography>} />
              </ListItem>
            )}
            {kolDetails['Email'] !== "NULL" && (
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary={<Typography variant="body1"><strong>Email:</strong> {kolDetails['Email']}</Typography>} />
              </ListItem>
            )}
          </List>
          <Divider />
          <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', px: 2, color: 'white' }}>
            Highlights
          </Typography>
          <List>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={kolDetails['Justification']} />
            </ListItem>
          </List>
          <Divider />
          <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', px: 2, color: 'white' }}>
            Department
          </Typography>
          <List>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={kolDetails['Department']} />
            </ListItem>
          </List>
          <Divider />
          <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', px: 2, color: 'white' }}>
            Specialty
          </Typography>
          <List>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={kolDetails['Specialty']} />
            </ListItem>
          </List>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', width: "77%" }}>
          <AppBar position="relative" sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#8697C4', '& .MuiToolbar-root': {
              minHeight: "auto", // Change the bar background color
            }
          }}>
            <Toolbar sx={{
              display: 'flex', justifyContent: 'space-evenly'
            }}>
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
                <Tab label="Network Map" value="network" />
              </Tabs>
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ flexGrow: 1, py: 1, height: "92%" }}>
            <Container sx={{ flexGrow: 1, overflow: 'auto', mx: 0, px: { xs: 0, sm: 0 }, height: "100%" }} className='hi'>
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
                ) : value === 'network' ? (
                  <Network kolId={kolId} />
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
    </ThemeProvider>
  );
};

export default Visual;