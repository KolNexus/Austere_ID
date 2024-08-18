import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import './ParetoChart.css'; // Import the CSS file

// Register Chart.js components
Chart.register(...registerables);

const ParetoChart = ({ type, title }) => {
  const [chartData, setChartData] = useState(null);
  const [labelField, setLabelField] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = '';
        let field = '';

        switch (type) {
          case 'states':
            endpoint = `${process.env.REACT_APP_SERVER_URL}/api/top-states`;
            field = 'State';
            break;
          case 'cities':
            endpoint = `${process.env.REACT_APP_SERVER_URL}/api/top-cities`;
            field = 'City';
            break;
          case 'conferences':
            endpoint = `${process.env.REACT_APP_SERVER_URL}/api/top-conferences`;
            field = 'Conference Name';
            break;
          case 'kol-conference-distribution':
            endpoint = `${process.env.REACT_APP_SERVER_URL}/api/kol-conference-distribution`;
            field = 'Key topic Congress Count';
            break;
          case 'kol-publication-distribution':
            endpoint = `${process.env.REACT_APP_SERVER_URL}/api/kol-publication-distribution`;
            field = 'Key topic Pubs Count';
            break;
          case 'kol-trials-distribution':
            endpoint = `${process.env.REACT_APP_SERVER_URL}/api/kol-trials-distribution`;
            field = 'Key topic Trials Count';
            break;
          case 'kol-association-distribution':
            endpoint = `${process.env.REACT_APP_SERVER_URL}/api/kol-association-distribution`;
            field = 'ASSOCIATION Count';
            break;
          default:
            return;
        }

        setLabelField(field);

        const response = await axios.get(endpoint);
        const data = response.data;

        // Sort data for specific chart types
        if (type === 'kol-conference-distribution') {
          data.sort((a, b) => b['Key topic Congress Count'] - a['Key topic Congress Count']);
        } else if (type === 'kol-publication-distribution') {
          data.sort((a, b) => b['Key topic Pubs Count'] - a['Key topic Pubs Count']);
        } else if (type === 'kol-trials-distribution') {
          data.sort((a, b) => a['Key topic Trials Count'] - b['Key topic Trials Count']);
        } else if (type === 'kol-association-distribution') {
          data.sort((a, b) => a['ASSOCIATION Count'] - b['ASSOCIATION Count']);
        }

        const labels = data.map(item => item[field]);
        const kolCounts = data.map(item => item.KOL_Count);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Count',
              data: kolCounts,
              backgroundColor: '#54C1DF',
              borderColor: '#54C1DF',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error(`Error fetching data for ${type}:`, error);
      }
    };

    fetchData();
  }, [type]);

  const options = {
    indexAxis: type === 'kol-trials-distribution' || type === 'kol-association-distribution' ? 'x' : 'y',
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      },
      y: {
        title: {
          display: true,
          text: labelField
        }
      },
    },
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Card 
      sx={{ 
        height: '420px', 
        cursor: 'pointer', 
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        }
      }} 
      onClick={handleClickOpen}>
        <CardHeader title={title} />
        <CardContent>
          <div className="chart-container">
            {chartData ? <Bar data={chartData} options={options} /> : <p>Loading...</p>}
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div className="chart-container">
            {chartData ? <Bar data={chartData} options={options} /> : <p>Loading...</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ParetoChart;
