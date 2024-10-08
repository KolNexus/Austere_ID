import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField
} from '@mui/material';
import apiClient from '../../utils/apiClient';

// Helper function to format honors and awards data
const handleNullValue = (value) => (value === "NULL" || value === "null" ? '' : value);

const createAwardData = (id, awardName, awardingBody, year) => ({
  id: handleNullValue(id),
  awardName: handleNullValue(awardName),
  awardingBody: handleNullValue(awardingBody),
  year: handleNullValue(year)
});


const AwardRow = ({ row }) => {
  return (
    <React.Fragment>
      <TableRow
        sx={{ '&:hover': { backgroundColor: '#F0F0F0' } }} // Change background color on hover
      >
        <TableCell>{parseInt(row.id) + 1}</TableCell>
        <TableCell>{row.awardName}</TableCell>
        <TableCell>{row.awardingBody}</TableCell>
        <TableCell>{row.year}</TableCell>
      </TableRow>
      <TableRow>
      </TableRow>
    </React.Fragment>
  );
};

const HonorsAndAwards = ({ kolId }) => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await apiClient.get(`/honors-awards`, {
          params: { kolId }
        });
        const awards = response.data;
        setAwards(awards);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching honors and awards:', error);
        setLoading(false);
      }
    };

    fetchAwards();
  }, [kolId]);
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredAwards = awards.filter(award =>
    award['Honour/Award Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
    award['Awarding Body Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
    award['Year'].includes(searchQuery)
  );

  const rows = filteredAwards.map((award, index) => createAwardData(
    `${index}`, // Ensure the key is unique by adding the index
    award['Honour/Award Name'] === 'NULL' ? '' : award['Honour/Award Name'],   // Replace string "NULL" with empty string
    award['Awarding Body Name'] === 'NULL' ? '' : award['Awarding Body Name'], // Replace string "NULL" with empty string
    award['Year'] === 'NULL' ? '' : parseInt(award['Year'])                           // Replace string "NULL" with empty string
  ));
  

  return (
    <Box sx={{ flexGrow: 1, width: '100%', px: 2, py: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '8%' }}>
      <Typography variant="h6" gutterBottom color="#3D52A0" sx={{ flexGrow: 1 }}>
      List of Honors and Awards
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
          count={awards.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : filteredAwards.length === 0 ? (
        <Typography variant="body1">No awards found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '90%', overflow: 'auto' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
              <TableRow>
                <TableCell><strong>Sl No.</strong></TableCell>
                <TableCell><strong>Honor/Award Name</strong></TableCell>
                <TableCell><strong>Awarding Body</strong></TableCell>
                <TableCell><strong>Year</strong></TableCell>
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

export default HonorsAndAwards;
