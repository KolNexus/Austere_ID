import React, { useState, useEffect, lazy, Suspense } from 'react';
import apiClient from '../../utils/apiClient';
import {
  Container, Typography, Avatar, Divider, Box, CircularProgress, ThemeProvider, createTheme,
  List, ListItem, ListItemText, AppBar, Toolbar, Tabs, Tab, Link, IconButton
} from '@mui/material';
import { Facebook, Instagram, LinkedIn, Twitter, LocationOn } from '@mui/icons-material';
import { useParams } from 'react-router-dom';

// Lazy load components
const Overview = lazy(() => import('./overview'));
const Biography = lazy(() => import('./Bio'));
const Events = lazy(() => import('./events'));
const Summary = lazy(() => import('./summary'));
const Pubs = lazy(() => import('./pubs'));
const Trials = lazy(() => import('./trials'));
const Prof = lazy(() => import('./prof'));
const HonorsAndAwards = lazy(() => import('./HonorsAndAwards'));
const Press = lazy(() => import('./Press'));
const CompanyAffinity = lazy(() => import('./CompanyAffinity'));
const Qualification = lazy(() => import('./Qualification'));
const SocialMediaActivity = lazy(() => import('./SocialMediaActivity'));
const SocialMediaAccounts = lazy(() => import('./SocialMediaAccounts'));
const Network = lazy(() => import('./networkMap'));

// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: 'Aptos',
    fontSize: 14,
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
          flex: 'none',
        },
        displayedRows: {
          margin: "auto"
        }
      },
    },
  },
});

const SocialLink = ({ href, icon }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer">
    <IconButton size="small">{icon}</IconButton>
  </Link>
);

const MapLink = ({ latitude, longitude }) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <Link href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
      <IconButton size="small">
        <LocationOn color="primary" />
      </IconButton>
    </Link>
  );
};

// Updated Two-Layer AppBar Component
const TwoLayerAppBar = ({ value, handleTabChange }) => {
  const tabGroups = [
    ['summary', 'bio', 'overview', 'events', 'publications', 'clinical-trials', 'professional activities', 'network map'],
    ['honors-and-awards', 'press', 'company-affinity', 'qualification', 'social-media-activity', 'social-media-accounts']
  ];

  return (
    <AppBar position="relative" sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
      backgroundColor: '#8697C4',
      '& .MuiToolbar-root': {
        minHeight: "auto",
      }
    }}>
      {tabGroups.map((group, index) => (
        <Toolbar key={index} sx={{ minHeight: 'auto', padding: 0, display: 'flex', justifyContent: 'space-evenly' }}>
          <Tabs
            value={group.includes(value) ? value : false}
            onChange={(event, newValue) => handleTabChange(event, newValue)}
            aria-label={`nav tabs group ${index + 1}`}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: "#EDE8F5",
              },
              '& .MuiTab-root': {
                color: 'inherit',
                '&.Mui-selected': {
                  color: '#EDE8F5',
                },
              },
            }}
          >
            {group.map((tab) => (
              <Tab
                key={tab}
                label={tab.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                value={tab}
              />
            ))}
          </Tabs>
        </Toolbar>
      ))}
    </AppBar>
  );
};

const handleNullValue = (value) => (value === "NULL" || value === "null" ? '' : value);

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
        const cleanedData = {};
        for (let key in data) {
          cleanedData[key] = handleNullValue(data[key]);
        }

      setKolDetails(cleanedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [kolId]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const justificationItems = kolDetails['Justification'];

  const handleImageError = (event) => {
    event.target.src = '/blank_profile.png';
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'row', overflowY: 'scroll', width: "100%" }}>
        <Box sx={{ width: '23%', minWidth: '300px', padding: '16px', backgroundColor: '#EDE8F5', height: 'max-content' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Avatar
              src={kolDetails['Image Link']}
              onError={handleImageError}
              sx={{ width: 130, height: 135, margin: '0 auto', borderRadius: '10px' }}
            />
            <Typography variant="h6" color="textPrimary" sx={{ marginTop: '4px' }}>
              {kolDetails['Salutation']}{kolDetails['KOL Name']}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {kolDetails['Suffix']} | {kolDetails['Title']}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {kolDetails['Primary Affiliation']}
            </Typography>
            <Box>
              {kolDetails["Linkedin"] && kolDetails["Linkedin"].toLowerCase() !== 'null' && <SocialLink href={kolDetails["Linkedin"]} icon={<LinkedIn />} />}
              {kolDetails["Twitter"] && kolDetails["Twitter"].toLowerCase() !== 'null' && <SocialLink href={kolDetails["Twitter"]} icon={<Twitter />} />}
              {kolDetails["Facebook"] && kolDetails["Facebook"].toLowerCase() !== 'null' && <SocialLink href={kolDetails["Facebook"]} icon={<Facebook />} />}
              {kolDetails["Instagram"] && kolDetails["Instagram"].toLowerCase() !== 'null' && <SocialLink href={kolDetails["Instagram"]} icon={<Instagram />} />}
              <MapLink
                latitude={kolDetails["Latitude"]}
                longitude={kolDetails["Longitude"]}
              />
            </Box>
          </div>
          <Divider />
          <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', padding: '4px', color: 'white' }}>
            Contact Info
          </Typography>
          <List>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={`${kolDetails['Address1']}, ${kolDetails['Address2']}, ${kolDetails['City']}, ${kolDetails['State']} ${kolDetails['Postal_Code']}, ${kolDetails['Country']}`} />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={`Phone: ${kolDetails['Phone']}`} />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={`Fax: ${kolDetails['Fax']}`} />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={`Email: ${kolDetails['Primary_Email']}`} />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={`NPI ID: ${kolDetails['NPI ID']}`} />
            </ListItem>
          </List>
          <Divider />
          <Typography variant="h6" sx={{ backgroundColor: '#3D52A0', padding: '4px', color: 'white' }}>
            Highlights
          </Typography>
          <List>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary={justificationItems} />
            </ListItem>
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
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', width: "77%" }}>
          <TwoLayerAppBar value={value} handleTabChange={handleTabChange} />
          <Box component="main" sx={{ flexGrow: 1, py: 1, height: "92%" }}>
            <Container sx={{ flexGrow: 1, overflow: 'auto', mx: 0, px: { xs: 0, sm: 0 }, height: "100%" }} className='hi'>
              <Suspense fallback={<CircularProgress />}>
                {value === 'overview' && <Overview kolDetails={kolDetails} setValue={setValue} />}
                {value === 'events' && <Events kolId={kolId} />}
                {value === 'summary' && <Summary kolId={kolId} />}
                {value === 'publications' && <Pubs kolId={kolId} />}
                {value === 'clinical-trials' && <Trials kolId={kolId} />}
                {value === 'professional activities' && <Prof kolId={kolId} />}
                {value === 'honors-and-awards' && <HonorsAndAwards kolId={kolId} />}
                {value === 'press' && <Press kolId={kolId} />}
                {value === 'company-affinity' && <CompanyAffinity kolId={kolId} />}
                {value === 'qualification' && <Qualification kolId={kolId} />}
                {value === 'social-media-activity' && <SocialMediaActivity kolId={kolId} />}
                {value === 'social-media-accounts' && <SocialMediaAccounts kolId={kolId} />}
                {value === 'bio' && <Biography kolId={kolId} />}
                {value === 'network map' && <Network kolId={kolId} />}
              </Suspense>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Visual;