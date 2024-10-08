import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, Typography } from '@mui/material';
import './summary.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartCard = ({ title, data }) => (
  <Card className="pie-chart-container" sx={{ margin: '5px', width: '350px', height: "300px", mx: 0, border: 'solid 2px #3D52A0' }}>
    <CardContent>
      <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}>
        {title}
      </Typography>
      <div style={{ height: '200px', position: 'relative' }}>
        <Pie data={data} options={{
          plugins: {
            legend: { display: true, position: 'right' },
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
        }} />
      </div>
    </CardContent>
  </Card>
);

const Summary = ({ kolId }) => {
  const [summaryData, setSummaryData] = useState({
    publications: [],
    trials: [],
    conferences: [],
    associations: [],
    industry: [],
    journal: [],
    rankingSheet: null,
    Press: [],
    drugs: [],
    companyPayments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = [
    '#4ce1f9', '#7a7a7a', '#567fb3', '#eb716c', '#fbcc3e',
    '#84cfae', '#e9a246', '#c2c6c9', '#278a5e', '#0185cd'
  ];

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const res = await apiClient.get(`/summarydoc?kolId=${kolId}`);
        setSummaryData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching summary data:', err);
        setError('Error fetching summary data');
        setLoading(false);
      }
    };
    
    if (kolId) {
      fetchSummaryData();
    }
  }, [kolId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const prepareChartData = (data = [], valueKey, labelKey, chartLabel) => ({
    labels: data.map(item => item[labelKey]),
    datasets: [{
      label: chartLabel,
      data: data.map(item => item[valueKey]),
      backgroundColor: colors,
      borderColor: '#fff',
      borderWidth: 1,
    }],
  });

  const prepareRankingSheetData = (data, valueKey1, valueKey2, chartLabel) => ({
    labels: [valueKey1, valueKey2],
    datasets: [{
      label: chartLabel,
      data: [data ? data[valueKey1] : 0, data ? data[valueKey2] : 0],
      backgroundColor: colors.slice(0, 2),
      borderColor: '#fff',
      borderWidth: 1,
    }],
  });

  const isDataEmpty = (data) => {
    return !data || data.datasets[0].data.every(value => value === 0);
  };

  const chartConfigs = [
    { title: 'Publications', data: prepareChartData(summaryData.publications, 'publicationCount', 'keyword', 'Publications') },
    { title: 'Trials', data: prepareChartData(summaryData.trials, 'trialCount', 'keyword', 'Trials') },
    { title: 'Conferences', data: prepareChartData(summaryData.conferences, 'conferenceCount', 'keyword', 'Conferences') },
    { title: 'Associations', data: prepareChartData(summaryData.associations, 'roleCount', 'role', 'Associations') },
    { title: 'Industry', data: prepareChartData(summaryData.industry, 'roleCount', 'role', 'Industry') },
    { title: 'Journals', data: prepareChartData(summaryData.journal, 'roleCount', 'role', 'Journal') },
    { title: 'Press', data: prepareChartData(summaryData.Press, 'keywordCount', 'keyword', 'Press Keywords') },
    { title: 'Top 10 Drugs', data: prepareChartData(summaryData.drugs, 'drugCount', 'drugName', 'Top 10 Drugs') },
    { title: 'Company Affinity', data: prepareChartData(summaryData.companyPayments, 'totalPayments', 'companyName', 'Company Affinity') },
    { title: 'Principal Investigator vs Investigator', data: prepareRankingSheetData(summaryData.rankingSheet, 'Principal Investigator', 'Investigator', 'Principal Investigator vs Investigator') },
    { title: 'First Author vs Co Author', data: prepareRankingSheetData(summaryData.rankingSheet, 'First Author Pubs Count', 'Co Author', 'First Author vs Co Author') },
  ];

  return (
    <div className="pie-charts-row" sx={{flexGrow: 1, width: '100%', px: 2,py:1, overflow: 'hidden', height: '100%'}}>
      {chartConfigs.map((config, index) => (
        !isDataEmpty(config.data) && (
          <PieChartCard key={index} title={config.title} data={config.data} />
        )
      ))}
    </div>
  );
};

export default Summary;