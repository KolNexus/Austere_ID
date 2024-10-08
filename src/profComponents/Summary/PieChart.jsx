import React, { useEffect, useState } from 'react';
import apiClient from '../../../../client/src/utils/apiClient';
import { Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import './PieChart.css'; // Import the CSS file

// Register Chart.js components
Chart.register(...registerables);

const PieChart = ({ title, apiUrl, labelField, dataField }) => {
    const [chartData, setChartData] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get(apiUrl);
                const data = response.data;

                // Extract the labels and data dynamically based on props
                const labels = data.map(item => item[labelField]);
                const values = data.map(item => item[dataField]);

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Count',
                            data: values,
                            backgroundColor: [
                                '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC949', '#AF7AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
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
    }, [apiUrl, labelField, dataField]); // Re-fetch when apiUrl, labelField, dataField changes

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                align: 'center',
            },
        },
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
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
                onClick={handleClickOpen}
            >
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
