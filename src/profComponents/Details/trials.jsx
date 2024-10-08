import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, TablePagination, IconButton, TextField
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import apiClient from '../../utils/apiClient';

const handleNullValue = (value) => (value === "NULL" || value === "null" ? '' : value);

// Helper function to format trial data
const createTrialData = (id, trialName, trialSponsor, phase, trialEndDate, trialStatus, conditions, interventionNames, trialCollaborator, trialStartDate, trialId, url) => ({
  id: handleNullValue(id),
  trialName: handleNullValue(trialName),
  trialSponsor: handleNullValue(trialSponsor),
  phase: handleNullValue(phase),
  trialEndDate: handleNullValue(trialEndDate),
  trialStatus: handleNullValue(trialStatus),
  conditions: handleNullValue(conditions),
  interventionNames: handleNullValue(interventionNames),
  trialCollaborator: handleNullValue(trialCollaborator),
  trialStartDate: handleNullValue(trialStartDate),
  trialId: handleNullValue(trialId),
  url: handleNullValue(url)
});

const TrialRow = ({ row }) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow
        sx={{ '&:hover': { backgroundColor: '#F0F0F0' } }} // Change background color on hover
      >
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <a href={`${row.url}`} target="_blank" rel="noopener noreferrer">
            {row.trialId}
          </a>
        </TableCell>
        <TableCell>{row.trialName}</TableCell>
        <TableCell>{row.trialSponsor}</TableCell>
        <TableCell>{row.phase}</TableCell>
        <TableCell>{row.trialEndDate}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Trial Details
              </Typography>
              <Typography variant="body2"><strong>Trial Status:</strong> {row.trialStatus}</Typography>
              <Typography variant="body2"><strong>Conditions:</strong> {row.conditions}</Typography>
              <Typography variant="body2"><strong>Intervention Name(s):</strong> {row.interventionNames}</Typography>
              <Typography variant="body2"><strong>Trial Collaborator:</strong> {row.trialCollaborator}</Typography>
              <Typography variant="body2"><strong>Trial Start Date:</strong> {row.trialStartDate}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const Trials = ({ kolId }) => {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        const response = await apiClient.get(`/trials`, {
          params: { kolId }
        });
        const trials = response.data;
        setTrials(trials);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trials:', error);
        setLoading(false);
      }
    };

    fetchTrials();
  }, [kolId]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredTrials = trials.filter(trial =>
    trial['Trial Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
    trial['Trial Sponsor'].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rows = filteredTrials.map((trial, index) => createTrialData(
    `${trial['Trial ID']}-${index}`, // Ensure the key is unique by adding the index
    trial['Trial Name'],
    trial['Trial Sponsor'],
    trial['Phase'],
    trial['Trial End Date'],
    trial['Trial Status'],
    trial['Conditions'],
    trial['Intervention Name(s)'],
    trial['Trial Collaborator'],
    trial['Trial Start Date'],
    trial['Trial ID'],
    trial['URL']
  ));

  return (
    <Box sx={{ flexGrow: 1, width: '100%', px: 2, py: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '8%' }}>
        <Typography variant="h6" gutterBottom color="#3D52A0" sx={{ flexGrow: 1 }}>
          List of Trials
        </Typography>
        <TextField
          label="Search Trials"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ marginRight: '16px', width: '300px' }}
        />
        <TablePagination
          component="div"
          count={filteredTrials.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : filteredTrials.length === 0 ? (
        <Typography variant="body1">No trials found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '90%', overflow: 'auto' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
              <TableRow>
                <TableCell />
                <TableCell><strong>Trial ID</strong></TableCell>
                <TableCell><strong>Trial Name</strong></TableCell>
                <TableCell><strong>Trial Sponsor</strong></TableCell>
                <TableCell><strong>Phase</strong></TableCell>
                <TableCell><strong>Trial End Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TrialRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Trials;
