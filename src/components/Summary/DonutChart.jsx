import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import './DonutChart.css'; // Import the CSS file

// Register Chart.js components
Chart.register(...registerables);

const DonutChart = ({ type }) => {
    const [chartData, setChartData] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let endpoint = '';
                let labelField = '';

                switch (type) {
                    case 'affiliations':
                        endpoint = `${process.env.REACT_APP_SERVER_URL}/api/top-affiliations`;
                        labelField = 'Affiliation';
                        break;
                    case 'specialties':
                        endpoint = `${process.env.REACT_APP_SERVER_URL}/api/top-specialties`;
                        labelField = 'Specialty';
                        break;
                    default:
                        return;
                }

                const response = await axios.get(endpoint);
                const data = response.data;
                const labels = data.map(item => item[labelField]);
                const kolCounts = data.map(item => item.KOL_Count);

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Count',
                            data: kolCounts,
                            backgroundColor: [ 
                                //'#FF6384',
                                '#FF5733',
                                //'#36A2EB',
                                '#33C3F0',
                               // '#FFCE56',
                               '#FFC300', 
                                //'#FF6384',
                                '#DAF7A6',
                                //'#36A2EB',
                                '#C70039',
                                //'#FFCE56',
                                '#900C3F',
                                //'#FF6384',
                                '#581845',
                                //'#36A2EB',
                                '#FF9F33',
                                //'#FFCE56',
                                '#808000',
                                //'#FF6384'
                                '#FF6384 ',
                            ],
                            borderColor: '#fff',
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
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
              position: 'right', // Position the legend on the right
              align: 'center',
            },
          },

          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }
          }
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
            onClick={handleClickOpen}
        >
            <CardHeader title={`Top 10 ${type.charAt(0).toUpperCase() + type.slice(1)}`} />
            <CardContent>
                <div className="chart-container">
                    {chartData ? <Doughnut data={chartData} options={options} /> : <p>Loading...</p>}
                </div>
            </CardContent>
        </Card>
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{`Top 10 ${type.charAt(0).toUpperCase() + type.slice(1)}`}</DialogTitle>
        <DialogContent>
          <div className="chart-container">
            {chartData ? <Doughnut data={chartData} options={options} /> : <p>Loading...</p>}
          </div>
        </DialogContent>
      </Dialog>
      </>
    );
};

export default DonutChart;
