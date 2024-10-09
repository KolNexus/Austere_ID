import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent} from '@mui/material';
import { Box } from '@mui/system';
import apiClient from '../../utils/apiClient';


const SectionTitle = ({ children, onClick }) => (
  <Typography 
    variant="h6" 
    sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      cursor: 'pointer',
      borderBottom: '1px solid #ccc',
      paddingBottom: 1,
      marginBottom: 2,
      marginTop: 3
    }}
    onClick={onClick}
  >
    {children}
  </Typography>
);

const InfoItem = ({ label, value }) => (
  <Typography variant="body2" sx={{ marginBottom: 1 }}>
    <strong>{label}:</strong> {value}
  </Typography>
);

const Bio = ({ kolId }) => {
  const [bioData, setBioData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBioData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/biography', { params: { kolId } });
        setBioData(response.data[0]);
      } catch (error) {
        console.error('Failed to fetch bio data:', error);
      }
      setLoading(false);
    };

    if (kolId) fetchBioData();
  }, [kolId]);

  if (loading) return <Typography variant="h6">Loading...</Typography>;
  if (!bioData) return <Typography variant="h6">No biography data available.</Typography>;

  const renderField = (value) => (value === 'NULL' ? '' : value);

  return (
    <Container sx={{ paddingLeft:'0px',paddingRight:'0px',flexGrow: 1, width: '100%',py:1, overflowY: 'scroll', height: '100%' }}>
      <Card elevation={3} sx={{paddingLeft:'0px',paddingRight:'0px'}}>
        <CardContent>
          <SectionTitle>Biography Summary</SectionTitle>
          <Typography variant="body2" paragraph style={{ textAlign: 'justify' }}>
            {renderField(bioData['Bio_Summary'])}
          </Typography>

          <SectionTitle>Professional Information</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Box sx={{ flexBasis: '48%', flexGrow: 1, marginRight: 2 }}>
              <InfoItem label="Career Status" value={renderField(bioData['Career Status'])} />
              <InfoItem label="Primary Affiliation" value={renderField(bioData['Primary Affiliation'])} />
              <InfoItem label="Department" value={renderField(bioData.Department)} />
              <InfoItem label="Areas of Interests" value={renderField(bioData['Areas of Interests'])} />
            </Box>
            <Box sx={{ flexBasis: '48%', flexGrow: 1 }}>
              <InfoItem label="Title" value={renderField(bioData.Title)} />
              <InfoItem label="Specialty" value={renderField(bioData.Specialty)} />
              <InfoItem label="Languages" value={renderField(bioData.Languages)} />
            </Box>
          </Box>

          <SectionTitle>Additional Information</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Box sx={{ flexBasis: '100%', marginBottom: 2 }}>
              <InfoItem label="Highlights" value={renderField(bioData.Highlights)} />
              <InfoItem label="Touchpoints" value={renderField(bioData.Touchpoints)} />
              <InfoItem label="Justification" value={renderField(bioData.Justification)} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Bio;