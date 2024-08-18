import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, Typography } from '@mui/material';
import './summary.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartsComponent = ({ kolDetails }) => {
  const [keywords, setKeywords] = useState([]);
  const [associationData, setAssociationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = [
    '#4ce1f9',
    '#7a7a7a',
    '#567fb3',
    '#eb716c',
    '#fbcc3e',
    '#84cfae',
    '#e9a246',
    '#c2c6c9',
    '#278a5e',
    '#0185cd',
  ];

  const borderColors = [
    '#ffffff',
  ];

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/keywords`);
        setKeywords(response.data.keywords);
      } catch (err) {
        console.error('Error fetching keywords:', err);
        setError('Error fetching keywords');
      }
    };

    const fetchAssociationData = async () => {
      if (kolDetails && kolDetails['KOL ID']) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/associations/${kolDetails['KOL ID']}`);
          setAssociationData(response.data);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            console.warn('Association data not found:', err);
            setAssociationData(null); // Reset associationData to null on 404 error
          } else {
            console.error('Error fetching association data:', err);
            setError('Error fetching association data');
          }
        }
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchKeywords(), fetchAssociationData()]);
      setLoading(false);
    };

    fetchData();
  }, [kolDetails]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!kolDetails) {
    return <div>No KOL details available</div>;
  }

  const processChartData = (dataKeyPrefix = '') => {
    const labels = keywords;
    const dataValues = labels.map(label => {
      const key = `${dataKeyPrefix}${label}`;
      return kolDetails[key] || 0;
    });

    return {
      labels,
      datasets: [
        {
          label: `Count`,
          data: dataValues,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  };

  const isDataEmpty = (data) => {
    return data.datasets[0].data.every(value => value === "0" || value === 0);
  };
  
  const chartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels
                .map((label, i) => {
                  const value = data.datasets[0].data[i];
                  if (value > 0) {
                    return {
                      text: `${label}`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor[i],
                      lineWidth: data.datasets[0].borderWidth,
                      hidden: false,
                      index: i,
                    };
                  }
                  return null;
                })
                .filter(item => item !== null); // Filter out null items
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.label || '';
            const value = tooltipItem.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };
  
  
  const publicationsData = processChartData('PUBS_');
  const clinicalTrialsData = processChartData('CT_');
  const conferencesData = processChartData('');

  const combinedPublicationsData = {
    labels: ['First Author Pubs Count', 'Co-Author Pubs Count'],
    datasets: [
      {
        label: 'Publications Count',
        data: [
          kolDetails['First Author Pubs Count'] || 0,
          (kolDetails['Key topic Pubs Count'] || 0) - (kolDetails['First Author Pubs Count'] || 0),
        ],
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const principalInvestigatorData = {
    labels: ['Principal Investigator', 'Investigator'],
    datasets: [
      {
        label: 'Trials Count',
        data: [
          kolDetails['Principal Investigator'] || 0,
          (kolDetails['Key topic Trials Count'] || 0) - (kolDetails['Principal Investigator'] || 0),
        ],
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const associationChartData = {
    labels: ['Board Member', 'Chair Person', 'Committee Member', 'President', 'Secretary'],
    datasets: [
      {
        label: 'Count',
        data: [
          associationData?.['Board Member'] || 0,
          associationData?.['Chair Person'] || 0,
          associationData?.['Committee Member'] || 0,
          associationData?.['President'] || 0,
          associationData?.['Secretary'] || 0,
        ],
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="pie-charts-row">
      {[
        { title: 'Publications', data: publicationsData },
        { title: 'Clinical Trials', data: clinicalTrialsData },
        { title: 'Conferences', data: conferencesData },
        { title: 'Investigation Roles', data: principalInvestigatorData },
        { title: 'Publication Roles', data: combinedPublicationsData },
        { title: 'Association Roles ', data: associationChartData }, // New Pie Chart for Associations Graph
      ].map(({ title, data }, index) => (
        !isDataEmpty(data) && (
          <Card key={index} className="pie-chart-container" sx={{ margin: '5px', width: '350px', height: "300px", mx: 0, border: 'solid 2px #3D52A0' }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom sx={{ display: "flex", justifyContent: "center", fontWeight: 'bold' }}>
                {title}
              </Typography>
              <div style={{ height: '200px', position: 'relative' }}>
                <Pie data={data} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
};

export default PieChartsComponent;
