import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
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
            endpoint = `/top-states`;
            field = 'State';
            break;
          case 'cities':
            endpoint = `/top-cities`;
            field = 'City';
            break;
          case 'conferences':
            endpoint = `/top-conferences`;
            field = 'Event_Name';
            break;
          case 'kol-conference-distribution':
            endpoint = `/kol-conference-distribution`;
            field = 'Key topic Congress Count';
            break;
          case 'kol-publication-distribution':
            endpoint = `/kol-publication-distribution`;
            field = 'Key topic Pubs Count';
            break;
          case 'kol-trials-distribution':
            endpoint = `/kol-trials-distribution`;
            field = 'Key topic Trials Count';
            break;
          case 'kol-association-distribution':
            endpoint = `/kol-association-distribution`;
            field = 'ASSOCIATION Count';
            break;
          case 'kol-industry-distribution':
            endpoint = `/kol-industry-distribution`;
            field = 'Industry Count';
            break;
          case 'kol-journal-distribution':
            endpoint = `/kol-journal-distribution`;
            field = 'Journal Count';
            break;
          default:
            return;
        }

        setLabelField(field);

        const response = await apiClient.get(endpoint);
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
        } else if (type === 'kol-industry-distribution') {
          data.sort((a, b) => a['Industry Count'] - b['Industry Count']);
        } else if (type === 'kol-journal-distribution') {
          data.sort((a, b) => a['Journal Count'] - b['Journal Count']);
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
    indexAxis: type === 'kol-trials-distribution' || type === 'kol-association-distribution' || type === 'kol-industry-distribution' || type === 'kol-journal-distribution' ? 'x' : 'y',
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
          cursor: 'pointer',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 6,
          }
        }}
        onClick={handleClickOpen}>
        <CardHeader title={title} sx={{
          paddingBottom: "0px",
          '& .MuiCardHeader-title': {
            fontSize: '20px',
            fontFamily: "Aptos",
            fontWeight: 50,
            display: "flex",
            justifyContent: "center"
          },
        }} />
        <CardContent sx={{ px: 1, py: 0, paddingBottom: "0px", '&:last-child ': { paddingBottom: "0px" } }}>
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
