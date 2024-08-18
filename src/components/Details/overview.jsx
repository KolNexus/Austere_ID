import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, LinearProgress, Tooltip, Card, CardContent, Divider } from '@mui/material';
import axios from 'axios';

const Overview = ({ kolDetails, setValue }) => {
  const [bioText, setBioText] = useState('');
  const [progressValues, setProgressValues] = useState({
    congress: 0,
    trials: 0,
    investigator: 0,
    firstAuthor: 0,
    keyTopic: 0
  });
  const [maxValues, setMaxValues] = useState({});
  const [medianValues, setMedianValues] = useState({});

  useEffect(() => {
    const fetchWeightages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/weightages/all`);
        const weightages = response.data.reduce((acc, item) => {
          acc[item.column_name.toLowerCase().replace(/ /g, '')] = parseFloat(item.max);
          return acc;
        }, {});
        setMaxValues(weightages);

        // Assuming median values are also provided in the same API response
        const medians = response.data.reduce((acc, item) => {
          acc[item.column_name.toLowerCase().replace(/ /g, '')] = parseFloat(item.median);
          return acc;
        }, {});
        setMedianValues(medians);
      } catch (error) {
        console.error('Failed to fetch weightages:', error);
      }
    };

    fetchWeightages();
  }, []);

  useEffect(() => {
    const animateBioText = async () => {
      const text = kolDetails['Biosummary'] || '';
      const delay = 10;
      let tempText = '';
      for (let i = 0; i <= text.length; i++) {
        tempText = text.slice(0, i);
        setBioText(tempText);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    };
  
    animateBioText();
  
    setProgressValues({
      congress: kolDetails['Congress Count'],
      trials: kolDetails['Key topic Trials Count'],
      investigator: kolDetails['Principal Investigator'],
      firstAuthor: kolDetails['First Author Pubs Count'],
      keyTopic: kolDetails['Key topic Pubs Count']
    });
  }, [kolDetails, maxValues]);

  const ProgressWithLabel = ({ value, label, targetValue, maxValue, medianValue, color }) => {
    const title = `${targetValue} / ${maxValue} , Median:${medianValue}`;
    
    return (
      <Tooltip title={<span>{title}</span>} arrow>
        <div>
          <Typography variant="body1">{label}</Typography>
          <Box sx={{ mb: 2, width: '100%', position: 'relative' }}>
            <LinearProgress 
              variant="determinate" 
              value={(value / maxValue) * 100} 
              sx={{
                '& .MuiLinearProgress-bar': {
                backgroundColor: color}, // Change the bar background color
                backgroundColor:"#ccc", height: 30, borderRadius: 5, marginTop: "20px"
              }} 
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: `${(medianValue / maxValue) * 100}%`,
                width: '2px',
                height: '100%',
                backgroundColor: 'white'
              }}
            />
          </Box>
        </div>
      </Tooltip>
    );
  };
  
  
  return (
    <Box sx={{ flexGrow: 1, width: '100%', p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="#3D52A0">Bio Summary</Typography>
          <Typography variant="body1">{bioText}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ width: '100%' }} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="#3D52A0">Statistics</Typography>
        </Grid>
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item xs={12} sm={4}>
              <Box
                component={Card}
                variant="outlined"
                onClick={() => setValue('events')}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#EDE8F5' } }}
              >
                <CardContent>
                  <Typography variant="body1"><strong>Total Events Attended:</strong> {kolDetails.totalEvents}</Typography>
                </CardContent>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                component={Card}
                variant="outlined"
                onClick={() => setValue('clinical-trials')}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#EDE8F5' } }}
              >
                <CardContent>
                  <Typography variant="body1"><strong>Trials Participated:</strong> {kolDetails.totalTrials}</Typography>
                </CardContent>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                component={Card}
                variant="outlined"
                onClick={() => setValue('publications')}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#EDE8F5' } }}
              >
                <CardContent>
                  <Typography variant="body1"><strong>Publication Count:</strong> {kolDetails.totalPublications}</Typography>
                </CardContent>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ProgressWithLabel value={progressValues.congress} label="Congress" targetValue={kolDetails['Congress Count']} maxValue={maxValues.congresscount} medianValue={medianValues.congresscount} color={"#3D52A0"} />
            </Grid>
            <Grid item xs={6}>
              <ProgressWithLabel value={progressValues.trials} label="Trials" targetValue={kolDetails['Key topic Trials Count']} maxValue={maxValues.keytopictrialscount} medianValue={medianValues.keytopictrialscount} color={"#7091E6"}/>
            </Grid>
            <Grid item xs={6}>
              <ProgressWithLabel value={progressValues.investigator} label="Principal Investigator" targetValue={kolDetails['Principal Investigator']} maxValue={maxValues.principalinvestigator} medianValue={medianValues.principalinvestigator} color={"#7091E6"} />
            </Grid>
            <Grid item xs={6}>
              <ProgressWithLabel value={progressValues.firstAuthor} label="First Author Pubs" targetValue={kolDetails['First Author Pubs Count']} maxValue={maxValues.firstauthorpubscount} medianValue={medianValues.firstauthorpubscount} color={"#3D52A0"}/>
            </Grid>
            <Grid item xs={6}>
              <ProgressWithLabel value={progressValues.keyTopic} label="Key Topic Pubs" targetValue={kolDetails['Key topic Pubs Count']} maxValue={maxValues.keytopicpubscount} medianValue={medianValues.keytopicpubscount} color={"#3D52A0"} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
