import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField
} from '@mui/material';
import apiClient from '../../utils/apiClient';

// Helper function to format honors and socialMediaAccounts data
const handleNullValue = (value) => (value === "NULL" || value === "null" ? '' : value);

const createSocialMediaAccountsData = (
  id, socialMedia, socialMediaType, userName, socialMediaUrl, radius_reach, extent
) => ({
  id: handleNullValue(id),
  socialMedia: handleNullValue(socialMedia),
  socialMediaType: handleNullValue(socialMediaType),
  userName: handleNullValue(userName),
  socialMediaUrl: handleNullValue(socialMediaUrl),
  radius_reach: handleNullValue(radius_reach),
  extent: handleNullValue(extent),
});


const AwardRow = ({ row }) => {
  return (
    <React.Fragment>
      <TableRow
        sx={{ '&:hover': { backgroundColor: '#F0F0F0' } }} // Change background color on hover
      >
        <TableCell>{parseInt(row.id) + 1}</TableCell>
        <TableCell>{row.socialMedia}</TableCell>
        <TableCell>{row.socialMediaType}</TableCell>
        <TableCell>{row.userName}</TableCell>
        <TableCell>
          <a href={`${row.socialMediaUrl}`} target="_blank" rel="noopener noreferrer">
            {row.socialMediaUrl}
          </a>
        </TableCell>
        <TableCell>{row.radius_reach}</TableCell>
        <TableCell>{row.extent}</TableCell>
      </TableRow>
      <TableRow>
      </TableRow>
    </React.Fragment>
  );
};

const SocialMediaAccounts = ({ kolId }) => {
  const [socialMediaAccounts, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await apiClient.get(`/social-media-accounts`, {
          params: { kolId }
        });
        const socialMediaAccounts = response.data;
        setAwards(socialMediaAccounts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching honors and socialMediaAccounts:', error);
        setLoading(false);
      }
    };

    fetchAwards();
  }, [kolId]);
  //console.log(socialMediaAccounts)
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredAwards = socialMediaAccounts.filter(socialMediaAccounts =>
    socialMediaAccounts['Social Media'].toLowerCase().includes(searchQuery.toLowerCase()) ||
    socialMediaAccounts['Social Media Type'].toLowerCase().includes(searchQuery.toLowerCase()) ||
    socialMediaAccounts['User name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
    socialMediaAccounts['Social Media Url'].toLowerCase().includes(searchQuery.toLowerCase()) ||
    socialMediaAccounts['Radius/Reach'].includes(searchQuery) ||
    socialMediaAccounts['Extent'].includes(searchQuery)
  );

  const rows = filteredAwards.map((socialMediaAccounts, index) => createSocialMediaAccountsData(
    `${index}`, // Ensure the key is unique by adding the index
    socialMediaAccounts['Social Media'] === 'NULL' ? '' : socialMediaAccounts['Social Media'],   // Replace string "NULL" with empty string
    socialMediaAccounts['Social Media Type'] === 'NULL' ? '' : socialMediaAccounts['Social Media Type'], // Replace string "NULL" with empty string
    socialMediaAccounts['User name'] === 'NULL' ? '' : socialMediaAccounts['User name'], // Replace string "NULL" with empty string
    socialMediaAccounts['Social Media Url'] === 'NULL' ? '' : socialMediaAccounts['Social Media Url'], // Replace string "NULL" with empty string
    socialMediaAccounts['Radius/Reach'] === 'NULL' ? '' : parseInt(socialMediaAccounts['Radius/Reach']),  // Replace string "NULL" with empty string
    socialMediaAccounts['Extent'] === 'NULL' ? '' : parseInt(socialMediaAccounts['Extent'])  // Replace string "NULL" with empty string
  ));
  

  return (
    <Box sx={{ flexGrow: 1, width: '100%', px: 2, py: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '8%' }}>
        <Typography variant="h6" gutterBottom color="#3D52A0" sx={{ flexGrow: 1 }}>
          List of Social Media Accounts
        </Typography>
        <TextField
          label="Search Awards"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ marginRight: '16px', width: '300px' }}
        />
        <TablePagination
          component="div"
          count={socialMediaAccounts.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : filteredAwards.length === 0 ? (
        <Typography variant="body1">No Social Media Accounts found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '90%', overflow: 'auto' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
              <TableRow>
                <TableCell><strong>Sl No.</strong></TableCell>
                <TableCell><strong>Social Media</strong></TableCell>
                <TableCell><strong>Social Media Type</strong></TableCell>
                <TableCell><strong>User Name</strong></TableCell>
                <TableCell><strong>Social Media URL</strong></TableCell>
                <TableCell><strong>Radius/Reach</strong></TableCell>
                <TableCell><strong>Extent</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <AwardRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SocialMediaAccounts;
