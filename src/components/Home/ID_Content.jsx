import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Pagination, TextField, Card, CardContent, CardMedia,
  Typography, Box, CircularProgress, LinearProgress, Tooltip
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ID_Content.css';
import WeightagePopup from './WeightagePopup';
import { useNavigate } from 'react-router-dom';

const ProgressWithLabel = ({ value, median, max, label, color }) => {
  const title = `${value} / ${max}, Median: ${median}`;
  const medianPosition = (median / max) * 100;
  const valuePosition = (value / max) * 100;

  return (
    <Tooltip title={<span>{title}</span>} arrow>
      <Box sx={{ mb: 2, width: '100%', position: 'relative' }}>
        <Box sx={{ position: 'relative', width: '175px', mt: 1, minWidth: "130px" }}>
          <LinearProgress
            variant="determinate"
            value={valuePosition}
            sx={{
              backgroundColor:"#ccc",
              height: "25px", borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                backgroundColor: color, // Change the bar background color
              }
            }}
          />

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
          >
          </Box>
          <Typography variant="body2" color="text.secondary"
            sx={{
              position: 'absolute',
              top: "25px",
              left: `${valuePosition}%`,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </Typography>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: `${medianPosition}%`,
              width: '2px',
              height: '100%',
              backgroundColor: 'orange'
            }}
          >
          </Box>
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

const Content = () => {
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [medianValue, setMedianValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [medianTrials, setMedianTrials] = useState(0);
  const [maxTrials, setMaxTrials] = useState(0);
  const [medianPubs, setMedianPubs] = useState(0);
  const [maxPubs, setMaxPubs] = useState(0);
  const [medianAssociation, setMedianAssociation] = useState(0);
  const [maxAssociation, setMaxAssociation] = useState(0);
  const doctorCardsRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const colorMapping = {
    congress: '#3D52A0',
    pubs: '#8697C4',
    trials: '#7091E6',
    association: '#ADBBDA'
  };

  const fetchDoctors = useCallback(async (page = 1, query = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/doctors`, {
        params: { page, limit: itemsPerPage, query }
      });
      setFilteredDoctors(response.data.doctors);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchDoctors(currentPage, query);
    fetchAllWeightageData();
  }, [currentPage, query, fetchDoctors]);


  const fetchAllWeightageData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/weightages/all`);
      const weightageData = response.data;
      weightageData.forEach(item => {
        switch (item.column_name) {
          case 'Congress Count':
            setMedianValue((Number(item.median)));
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
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setQuery(query);
    setCurrentPage(1);
    fetchDoctors(1, query);
    scrollToTop();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    scrollToTop();
    fetchDoctors(value, query);
  };

  const scrollToTop = () => {
    if (doctorCardsRef.current) {
      doctorCardsRef.current.scrollTop = 0;
    }
  };

  const handleCardClick = (doctor) => {
    console.log('Card clicked:', doctor['KOL ID']);
    navigate(`/profile/${doctor['KOL ID']}`);
  };

  const closePopupHandler = () => {
    setShowPopup(false);
    fetchDoctors(currentPage, query);
  };

  return (
    <div className="content" style={{overflowY:"auto"}}>
      <Box className="search-bar">
        <TextField
          variant="outlined"
          placeholder="Search By Name"
          value={query}
          onChange={handleInputChange}
          sx={{
            width: "30%",
            minWidth: "300px",
            '& .MuiInputBase-root': {
              height: "40px", // Change the bar background color
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: "75%", }}>
          <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '30px' }}>
            <span style={{ color: colorMapping.congress }}>■ Congress</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '50px' }} >
            <span style={{ color: colorMapping.pubs }}>■ Key topic Pubs</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '40px' }} >
            <span style={{ color: colorMapping.trials }}>■ Key topic Trials</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '40px' }}>
            <span style={{ color: colorMapping.association }}>■ ASSOCIATION</span>
          </Typography>
        </Box>
        <Box sx={{ width: '10%', minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', backgroundColor: '#3D52A0', borderRadius: '5px', padding: '5px', fontWeight: 'bold', color: 'white', marginRight:'10px'}}>
          <Typography variant="body2">
            Rank
          </Typography>
          <Typography variant="body2">
            Score
          </Typography>
        </Box>

        {/*<Button variant="contained" color="warning" onClick={() => setShowPopup(true)}>
          Update Weightage
        </Button>*/}
        <WeightagePopup
          showPopup={showPopup}
          closePopup={closePopupHandler}
        />
      </Box>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      ) : (
        <div className="doctor-cards" ref={doctorCardsRef}>
          {filteredDoctors.map((doctor, index) => (
            <Card
              key={index}
              className="doctor-card"
              sx={{ my: 0, borderRadius: '10px', display: 'flex', overflowX: "auto", height: 120 }}
              onClick={() => handleCardClick(doctor)}
            >
              <Box sx={{ width: '30%', display: 'flex', alignItems: 'center', mr: '15px', minWidth: '30vw', maxHeight: 100 }}>
                <CardMedia
                  component="img"
                  image={doctor.Image}
                  alt={doctor['First name']}
                  className="doctor-image"
                  sx={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginRight: 2 }}
                />
                <CardContent className="doctor-details" sx={{p:0}}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {doctor.Salutation} {doctor['First name']} {doctor['Last name']}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doctor.Suffix} | {doctor['Country']}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doctor.Affiliation}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doctor.Specialty}
                  </Typography>
                </CardContent>
              </Box>

              <Box sx={{ width: '65%', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', minWidth: '45vw',marginRight:'10px' }}>
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
              <Box className="circular-container" sx={{ width: '5%', minWidth: '5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', backgroundColor: '#3D52A0', borderRadius: '5px', padding: '5px',marginLeft:'10px' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {doctor['KOL Rank']}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {doctor['KOL Score']}
                </Typography>
              </Box>
            </Card>
          ))}
        </div>
      )}
      <div className="pagination-bar">
        <Pagination
          count={Math.ceil(totalItems / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{
            '& .Mui-selected': {
              backgroundColor: '#7091E6 !important',
              color: 'white',
            },
          }}
        />
      </div>
    </div>
  );
};

export default Content;
