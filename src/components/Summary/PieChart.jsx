import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import './PieChart.css'; // Import the CSS file

// Register Chart.js components
Chart.register(...registerables);

const PieChart = ({ title }) => {
    const [chartData, setChartData] = useState(null);
    const [open, setOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/top-keywords-publications`);
                const data = response.data;
                const labels = data.map(item => item.keyword);
                const sums = data.map(item => item.sum);

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Sum',
                            data: sums,
                            backgroundColor: [
                                //'#FF6384',
                                '#4E79A7',
                                //'#36A2EB',
                                '#F28E2B',
                               // '#FFCE56',
                               '#E15759', 
                                //'#FF6384',
                                '#76B7B2',
                                //'#36A2EB',
                                '#59A14F',
                                //'#FFCE56',
                                '#EDC949',
                                //'#FF6384',
                                '#AF7AA1',
                                //'#36A2EB',
                                '#FF9DA7',
                                //'#FFCE56',
                                '#9C755F',
                                //'#FF6384'
                                '#BAB0AC ',
                            ],
                            borderColor: '#fff',
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
                <CardHeader title={title} />
                <CardContent>
                    <div className="chart-container">
                        {chartData ? <Pie data={chartData} options={options} /> : <p>Loading...</p>}
                    </div>
                </CardContent>
            </Card>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <div className="chart-container">
                        {chartData ? <Pie data={chartData} options={options} /> : <p>Loading...</p>}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PieChart;
