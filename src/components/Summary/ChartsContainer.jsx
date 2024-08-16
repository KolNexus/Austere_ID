import React from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import ParetoChart from './ParetoChart'; // Ensure you have the correct path
import DonutChart from './DonutChart'; // Import the DonutChart component
import PieChart from './PieChart'; // Import the PieChart component
import HeatMap from './HeatMap'; // Import the HeatMap component
import { useNavigate } from 'react-router-dom';


const ChartsContainer = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/`);
  };
  return (
    <Container style={{ maxWidth: "100%",height:"90vh",backgroundColor:'#EDE8F5', overflowY:'scroll' }}>
      <Box sx={{ display: "flex", justifyContent: "space-between",alignItems:"center" }}>
        <Typography variant="h5" gutterBottom style={{ color: '#3D52A0', fontWeight: '600', marginTop: '20px' }}>
          Overall Summary
        </Typography>
        <Button variant="contained"  onClick={handleClick} sx={{height:"30px", backgroundColor:'#8697C4'}}>
          Go To Profiles
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <HeatMap />
        </Grid>
        <Grid item xs={12} md={3}>
          <ParetoChart type="states" title="Top 10 States" />
        </Grid>
        <Grid item xs={12} md={3}>
          <ParetoChart type="cities" title="Top 10 Cities" />
        </Grid>
        <Grid item xs={12} md={3}>
          <DonutChart type="affiliations" title="Top 10 Affiliations" />
        </Grid>
        <Grid item xs={12} md={3}>
          <DonutChart type="specialties" title="Top 10 Specialties" />
        </Grid>
        <Grid item xs={12} md={3}>
          <ParetoChart type="conferences" title="Top 10 Conferences" />
        </Grid>
        <Grid item xs={12} md={3}>
          <PieChart title="Top 10 Keywords in Publications" />
        </Grid>
        <Grid item xs={12} md={3}>
          Top 10 Drugs
        </Grid>
        <Grid item xs={12} md={3}>
          <ParetoChart type="kol-trials-distribution" title="Distribution of KOLs by Trials" />
        </Grid>
        <Grid item xs={12} md={3}>
          <ParetoChart type="kol-conference-distribution" title="Distribution of KOLs by Conferences" />
        </Grid>
        <Grid item xs={12} md={3}>
          <ParetoChart type="kol-publication-distribution" title="Distribution of KOLs by Publications" />
        </Grid>
        <Grid item xs={12} md={3}>
          <ParetoChart type="kol-association-distribution" title="Distribution of KOLs by Associations" />
        </Grid>

        {/* Add more ParetoChart components as needed */}
      </Grid>
    </Container>
  );
};

export default ChartsContainer;