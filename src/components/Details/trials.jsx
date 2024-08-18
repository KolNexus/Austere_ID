import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, TablePagination, IconButton, TextField
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';

// Helper function to format trial data
const createTrialData = (id, title, sponsor, phases, completionDate, recruitment, conditions, interventions, age, fundedBys, startDate, tid, link) => ({
  id,
  title,
  sponsor,
  phases,
  completionDate,
  recruitment,
  conditions,
  interventions,
  age,
  fundedBys,
  startDate,
  tid,
  link
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
          <a href={`${row.link}`} target="_blank" rel="noopener noreferrer">
            {row.tid}
          </a>
        </TableCell>
        <TableCell>{row.title}</TableCell>
        <TableCell>{row.sponsor}</TableCell>
        <TableCell>{row.phases}</TableCell>
        <TableCell>{row.completionDate}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Trial Details
              </Typography>
              <Typography variant="body2"><strong>Recruitment:</strong> {row.recruitment}</Typography>
              <Typography variant="body2"><strong>Conditions:</strong> {row.conditions}</Typography>
              <Typography variant="body2"><strong>Interventions:</strong> {row.interventions}</Typography>
              <Typography variant="body2"><strong>Age:</strong> {row.age}</Typography>
              <Typography variant="body2"><strong>Funded By:</strong> {row.fundedBys}</Typography>
              <Typography variant="body2"><strong>Start Date:</strong> {row.startDate}</Typography>
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
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/trials`, {
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
    trial['Title of Trial'].toLowerCase().includes(searchQuery.toLowerCase()) ||
    trial['Sponsor/Collaborators'].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rows = filteredTrials.map((trial, index) => createTrialData(
    `${trial['Trial ID']}-${index}`, // Ensure the key is unique by adding the index
    trial['Title of Trial'],
    trial['Sponsor/Collaborators'],
    trial['Phases'],
    trial['Formatted Completion Date'],
    trial['Recruitment'],
    trial['Conditions'],
    trial['Interventions'],
    trial['Age'],
    trial['Funded Bys'],
    trial['Start Date'],
    trial['Trial Registry Number'],
    trial['URL']
  ));

  return (
    <Box sx={{ flexGrow: 1, width: '100%', p: 2, overflow: 'hidden', height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
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
        <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
              <TableRow>
                <TableCell />
                <TableCell><strong>Trial ID</strong></TableCell>
                <TableCell><strong>Title of Trial</strong></TableCell>
                <TableCell><strong>Sponsor/Collaborators</strong></TableCell>
                <TableCell><strong>Phases</strong></TableCell>
                <TableCell><strong>Completion Date</strong></TableCell>
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
