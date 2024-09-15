import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../utils/apiClient';
import {
  TextField, Card, CardContent, CardMedia,
  Typography, Box, CircularProgress, LinearProgress, Tooltip, Button, ThemeProvider, createTheme
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ID_Content.css';
import { useNavigate } from 'react-router-dom';

// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: 'Aptos',
  },
});
// ProgressWithLabel Component
const ProgressWithLabel = ({ value, median, max, label, color }) => {
  const title = `${value} / ${max}, Median: ${median}`;
  const medianPosition = (median / max) * 100;
  const valuePosition = (value / max) * 100;

  return (
    <Tooltip title={<span>{title}</span>} arrow>
      <Box sx={{ mb: 0, width: '100%', position: 'relative' }}>
        <Box sx={{ position: 'relative', width: '175px', mt: 1, minWidth: "130px" }}>
          <LinearProgress
            variant="determinate"
            value={valuePosition}
            sx={{
              backgroundColor: "#ccc",
              height: "20px",
              borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                backgroundColor: color, // Bar background color
              }
            }}
          />

          {/* Value Indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: `${valuePosition}%`,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              backgroundColor: 'red',
              width: '1px',
              height: '100%',
            }}
          />

          {/* Value Label */}
          <Typography variant="body2" color="text.secondary"
            sx={{
              position: 'absolute',
              top: "20px",
              left: `${valuePosition}%`,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </Typography>

          {/* Median Indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: `${medianPosition}%`,
              width: '2px',
              height: '100%',
              backgroundColor: 'orange'
            }}
          />

          {/* Max Label */}
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: -20,
              transform: 'translateX(50%)',
              whiteSpace: 'nowrap',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {max}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
};

// Main Content Component
const Content = () => {
  // State Variables
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // 1-based index
  const itemsPerPage = 25; // Fixed items per page
  const [totalItems, setTotalItems] = useState(0);

  // Weightage States
  const [medianValue, setMedianValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [medianTrials, setMedianTrials] = useState(0);
  const [maxTrials, setMaxTrials] = useState(0);
  const [medianPubs, setMedianPubs] = useState(0);
  const [maxPubs, setMaxPubs] = useState(0);
  const [medianAssociation, setMedianAssociation] = useState(0);
  const [maxAssociation, setMaxAssociation] = useState(0);

  // References and Loading States
  const doctorCardsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Navigation
  const navigate = useNavigate();

  // Color Mapping for Progress Bars
  const colorMapping = {
    congress: '#3D52A0',
    pubs: '#8697C4',
    trials: '#7091E6',
    association: '#ADBBDA'
  };

  // Fetch Doctors Function
  const fetchDoctors = useCallback(async (page, query, limit, append = false) => {
    try {
      const response = await apiClient.get(`/doctors`, {
        params: { page, limit, query }
      });
      const newDoctors = response.data.doctors;
      setTotalItems(response.data.totalItems);
      setFilteredDoctors(prevDoctors => append ? [...prevDoctors, ...newDoctors] : newDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, []);

  // Fetch Weightage Data Function
  const fetchAllWeightageData = useCallback(async () => {
    try {
      const response = await apiClient.get(`/weightages/all`);
      const weightageData = response.data;
      weightageData.forEach(item => {
        switch (item.column_name) {
          case 'Congress Count':
            setMedianValue(Number(item.median));
            setMaxValue(Number(item.max));
            break;
          case 'Key topic Trials Count':
            setMedianTrials(Number(item.median));
            setMaxTrials(Number(item.max));
            break;
          case 'Key topic Pubs Count':
            setMedianPubs(Number(item.median));
            setMaxPubs(Number(item.max));
            break;
          case 'ASSOCIATION Count':
            setMedianAssociation(Number(item.median));
            setMaxAssociation(Number(item.max));
            break;
          default:
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching all weightage data:', error);
    }
  }, []);

  // Fetch Weightage Data Once on Mount
  useEffect(() => {
    fetchAllWeightageData();
  }, [fetchAllWeightageData]);

  // Fetch Doctors Data on Page or Query Change
  useEffect(() => {
    const fetchData = async () => {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      await fetchDoctors(currentPage, query, itemsPerPage, currentPage > 1);
      if (currentPage === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    };
    fetchData();
  }, [currentPage, query, fetchDoctors, itemsPerPage]);

  // Handle Search Input Change
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setFilteredDoctors([]);
    setCurrentPage(1);
  };

  // Handle "Load More" Button Click
  const handleLoadMore = () => {
    if (filteredDoctors.length < totalItems) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // Handle Card Click to Navigate to Profile
  const handleCardClick = (doctor) => {
    console.log('Card clicked:', doctor['KOL ID']);
    navigate(`/profile/${doctor['KOL ID']}`);
  };

  const handleImageError = (event) => {
    event.target.src = '/blank_profile.png';  // Path to the image in the public directory
  };

  return (
    <ThemeProvider theme={theme}>

      <div className="content" style={{ overflowY: "auto" }}>
        {/* Search Bar and Legend */}
        <Box className="search-bar" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', padding: 1 }}>
          <Box sx={{ width: "27%" }} >
            <TextField
              variant="outlined"
              placeholder="Search By Name"
              value={query}
              onChange={handleInputChange}
              sx={{
                minWidth: "300px",
                '& .MuiInputBase-root': {
                  height: "25px",
                }
              }}
            />
          </Box>
          <Box sx={{
            width: '8%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-evenly',
            backgroundColor: '#ADBBDA',
            borderRadius: '5px',
            padding: '5px',
            fontWeight: 'bold',
            color: 'black',
            gap: "0px"
          }}>
            <Typography variant="body2">Rank | Score</Typography>
          </Box>

          <Box sx={{ width: '65%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
            <Typography variant="body2" color="black" sx={{ width: "25%", display: "flex", justifyContent: "center" }}>
              <span style={{ color: colorMapping.congress }}>■ </span>Congress
            </Typography>
            <Typography variant="body2" color="black" sx={{ width: "25%", display: "flex", justifyContent: "center" }} >
              <span style={{ color: colorMapping.pubs }}>■ </span>Key topic Pubs
            </Typography>
            <Typography variant="body2" color="black" sx={{ width: "25%", display: "flex", justifyContent: "center" }}>
              <span style={{ color: colorMapping.trials }}>■ </span>Key topic Trials
            </Typography>
            <Typography variant="body2" color="black" sx={{ width: "25%", display: "flex", justifyContent: "center" }}>
              <span style={{ color: colorMapping.association }}>■ </span>Association
            </Typography>
          </Box>

          {/* Optional Update Weightage Button */}
          {/* <Button variant="contained" color="warning" onClick={() => setShowPopup(true)}>
          Update Weightage
        </Button> */}
        </Box>

        {/* Loading Indicator */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress />
          </div>
        ) : (
          <>
            {/* Doctor Cards */}
            <div className="doctor-cards" ref={doctorCardsRef}>
              {filteredDoctors.map((doctor, index) => (
                <Card
                  className="doctor-card"
                  sx={{ my: 0, display: 'flex', overflowX: "auto", height: '70px' }}
                  onClick={() => handleCardClick(doctor)}
                  key={`${doctor['KOL ID']}-${index}`} // Use a combination of KOL ID and index for a unique key
                >
                  {/* Doctor Image and Details */}
                  <Box sx={{ width: '5%', display: 'flex', alignItems: 'center', maxHeight: 100 }}>
                    <CardMedia
                      component="img"
                      image={doctor.Image}
                      alt={`${doctor['First name']} ${doctor['Last name']}`}
                      onError={handleImageError}
                      className="doctor-image"
                      sx={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', marginRight: 2 }}
                    />
                  </Box>

                  <Box className="doctor-details" sx={{ p: 0, width: '22%' }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {doctor.Salutation} {doctor['First name']} {doctor['Last name']}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ paddingBottom: "0px" }}>
                      {doctor.Suffix} | {doctor['Country']}
                    </Typography>
                  </Box>

                  {/* Rank and Score */}
                  <Box className="circular-container" sx={{
                    width: '8%',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-evenly',
                    backgroundColor: '#ADBBDA',
                    borderRadius: '5px',
                    padding: '5px',
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                      {doctor['KOL Rank']} | {doctor['KOL Score']}
                    </Typography>
                  </Box>

                  {/* Progress Bars */}
                  <Box sx={{ width: '65%', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', minWidth: '45vw' }}>
                    <CardContent>
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <ProgressWithLabel
                          value={doctor['Congress Count']}
                          median={medianValue}
                          max={maxValue}
                          label="Congress Count"
                          color={colorMapping.congress}
                        />
                      </Box>
                    </CardContent>
                    <CardContent>
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <ProgressWithLabel
                          value={doctor['Key topic Pubs Count']}
                          median={medianPubs}
                          max={maxPubs}
                          label="Key topic Pubs Count"
                          color={colorMapping.pubs}
                        />
                      </Box>
                    </CardContent>
                    <CardContent>
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <ProgressWithLabel
                          value={doctor['Key topic Trials Count']}
                          median={medianTrials}
                          max={maxTrials}
                          label="Key topic Trials Count"
                          color={colorMapping.trials}
                        />
                      </Box>
                    </CardContent>
                    <CardContent>
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <ProgressWithLabel
                          value={doctor['ASSOCIATION Count']}
                          median={medianAssociation}
                          max={maxAssociation}
                          label="ASSOCIATION Count"
                          color={colorMapping.association}
                        />
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, marginBottom: 3, padding: '0 20px' }}>
              <Typography variant="body1">
                {`${filteredDoctors.length}-${totalItems} results`}
              </Typography>
              {filteredDoctors.length < totalItems && (
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  sx={{ height: "30px", color: 'black' }}
                >
                  {loadingMore ? <CircularProgress size={24} /> : 'Load More ....'}
                </Button>
              )}
            </Box>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Content;
