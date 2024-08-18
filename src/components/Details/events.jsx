import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, Collapse, IconButton, TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';

const Body = ({ kolId, handleBackClick }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/allevents`, {
          params: { kolId }
        });
        setAllEvents(response.data);
      } catch (error) {
        console.error('Error fetching all events:', error);
      }
    };
    fetchAllEvents();
  }, [kolId]); // Include fetchAllEvents in the dependency array

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRowClick = (index) => {
    setOpenRow(openRow === index ? null : index);
  };

  const rows = allEvents.map((event, index) => ({
    id: `${event['Event ID']}-${index}`, // Ensure the key is unique by adding the index
    participationDate: event['Start Date'],
    eventCountry: event['Event Country'],
    conferenceName: event['Conference Name'],
    sessionName: event['Session Name; Topic Title'],
    sponsorName: event['Sponsor Name'],
    role: event['Role'],
    eventDetails: {
      startDate: event['Event Start Date'],
      endDate: event['Event End Date'],
      location: event['Event Location'],
      city: event['Event City'],
      state: event['Event State'],
      abstract: event['Abstract'],
      sessionType: event['Session Type'],
    }
  }));

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          All Events
        </Typography>
        <TablePagination
          component="div"
          count={allEvents.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50]}
        />
        <Button variant="contained" onClick={handleBackClick} sx={{backgroundColor:'#7091E6'}}>
          Back
        </Button>
      </Box>
      <TableContainer component={Paper} id="scrollable-table" sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead sx={{ backgroundColor: '#54C1DF' }}>
            <TableRow>
              <TableCell />
              <TableCell><strong>Participation Date</strong></TableCell>
              <TableCell><strong>Event Country</strong></TableCell>
              <TableCell><strong>Conference Name</strong></TableCell>
              <TableCell><strong>Session Name</strong></TableCell>
              <TableCell><strong>Sponsor Name</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <React.Fragment key={row.id}>
                <TableRow
                  sx={{ '&:hover': { backgroundColor: '#F0F0F0' } }}
                >
                  <TableCell>
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => handleRowClick(index)}
                    >
                      {openRow === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.participationDate}</TableCell>
                  <TableCell>{row.eventCountry}</TableCell>
                  <TableCell>{row.conferenceName}</TableCell>
                  <TableCell>{row.sessionName}</TableCell>
                  <TableCell>{row.sponsorName}</TableCell>
                  <TableCell>{row.role}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={openRow === index} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Event Details
                        </Typography>
                        <Typography variant="body2"><strong>Dates:</strong> {row.eventDetails.startDate} - {row.eventDetails.endDate}</Typography>
                        <Typography variant="body2"><strong>Location:</strong> {row.eventDetails.location}, {row.eventDetails.city}, {row.eventDetails.state}</Typography>
                        <Typography variant="body2"><strong>Session Type:</strong> {row.eventDetails.sessionType}</Typography>
                        <Typography variant="body2" style={{ marginTop: '0.5rem' }}><strong>Abstract:</strong> {row.eventDetails.abstract}</Typography>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
};

const Events = ({ kolId }) => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRow, setSelectedRow] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedDetailRow, setExpandedDetailRow] = useState(null); // For the second table
  const [view, setView] = useState('main'); // State to track the current view
  const [detailsPage, setDetailsPage] = useState(0); // Pagination state for the second table
  const [detailsRowsPerPage, setDetailsRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/events`, {
          params: { kolId }
        });
        const events = response.data;
        setEvents(events);
      } catch (error) {
        console.error('Error fetching Events:', error);
      }
    };
    fetchEvents();
  }, [kolId]);

  const filteredEvents = events.filter(event =>
    event.conferenceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleDetailsPageChange = (event, newPage) => {
    setDetailsPage(newPage);
  };

  const handleDetailsRowsPerPageChange = (event) => {
    setDetailsRowsPerPage(+event.target.value);
    setDetailsPage(0);
  };

  const handleRowClick = (row) => {
    if (expandedRow === row.id) {
      setExpandedRow(null);
    } else {
      setSelectedRow(row);
      setExpandedRow(row.id);
      setView('details');
    }
  };

  const handleDetailRowClick = (detailId) => {
    if (expandedDetailRow === detailId) {
      setExpandedDetailRow(null);
    } else {
      setExpandedDetailRow(detailId);
    }
  };

  const handleBackClick = () => {
    setView('main');
    setSelectedRow(null);
    setExpandedRow(null);
    setExpandedDetailRow(null);
  };

  const handleAllClick = () => {
    setView('all');
    setSelectedRow(null);
    setExpandedRow(null);
    setExpandedDetailRow(null);
  };

  return (
    <Box sx={{ flexGrow: 1, width: '100%', p: 2, overflow: 'hidden', height: '100vh' }}>
      {view === 'main' ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" gutterBottom color="#3D52A0">
              List of Events
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label="Search Conferences"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ marginRight: '16px', width: '300px' }}
              />
              <TablePagination
                component="div"
                count={filteredEvents.length}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </Box>
            <Button variant="contained" onClick={handleAllClick} sx={{backgroundColor:'#7091E6'}}>
              All
            </Button>
          </Box>
          {filteredEvents.length === 0 ? (
            <Typography variant="body1">No events found.</Typography>
          ) : (
            <TableContainer component={Paper} id="scrollable-table" sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              <Table stickyHeader aria-label="collapsible table">
                <TableHead sx={{ backgroundColor: '#54C1DF' }}>
                  <TableRow>
                    <TableCell><strong>Sl No</strong></TableCell>
                    <TableCell><strong>Conference Name</strong></TableCell>
                    <TableCell><strong>Session Count</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:hover': { backgroundColor: '#F0F0F0', cursor: 'pointer' } }}
                      onClick={() => handleRowClick(row)}
                    >
                      <TableCell>{row.slNo}</TableCell>
                      <TableCell>{row.conferenceName}</TableCell>
                      <TableCell>{row.sessionCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : view === 'all' ? (
        <>
          <Body kolId={kolId} handleBackClick={handleBackClick} />
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" gutterBottom color="#3D52A0">
              Detailed Information
            </Typography>
            <TablePagination
              component="div"
              count={selectedRow ? selectedRow.eventDetails.length : 0}
              page={detailsPage}
              onPageChange={handleDetailsPageChange}
              rowsPerPage={detailsRowsPerPage}
              onRowsPerPageChange={handleDetailsRowsPerPageChange}
              rowsPerPageOptions={[10, 25, 50]}
            />
            <Button variant="contained" onClick={handleBackClick} sx={{backgroundColor:'#7091E6'}}>
              Back
            </Button>
          </div>
          <Box sx={{ mt: 4 }}>
            <TableContainer component={Paper} id="scrollable-table" sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              <Table stickyHeader aria-label="detailed table">
                <TableHead sx={{ backgroundColor: '#54C1DF' }}>
                  <TableRow>
                    <TableCell><strong>Participation Date</strong></TableCell>
                    <TableCell><strong>Event Country</strong></TableCell>
                    <TableCell><strong>Conference Name</strong></TableCell>
                    <TableCell><strong>Session Name</strong></TableCell>
                    <TableCell><strong>Sponsor Name</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedRow.eventDetails.slice(detailsPage * detailsRowsPerPage, detailsPage * detailsRowsPerPage + detailsRowsPerPage).map((detail, index) => (
                    <React.Fragment key={index}>
                      <TableRow
                        sx={{ '&:hover': { backgroundColor: '#F0F0F0', cursor: 'pointer' } }}
                        onClick={() => handleDetailRowClick(index)}
                      >
                        <TableCell>{detail.participationDate}</TableCell>
                        <TableCell>{detail.eventCountry}</TableCell>
                        <TableCell>{selectedRow.conferenceName}</TableCell>
                        <TableCell>{detail.sessionName}</TableCell>
                        <TableCell>{detail.sponsorName}</TableCell>
                        <TableCell>{detail.role}</TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => handleDetailRowClick(index)}
                          >
                            {expandedDetailRow === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                          <Collapse in={expandedDetailRow === index} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                              <Typography variant="h6" gutterBottom component="div">
                                Event Details
                              </Typography>
                              <Typography variant="body2">
                                <strong>Start Date:</strong> {detail.eventDetails.startDate}<br />
                                <strong>End Date:</strong> {detail.eventDetails.endDate}<br />
                                <strong>Location:</strong> {detail.eventDetails.location}<br />
                                <strong>City:</strong> {detail.eventDetails.city}<br />
                                <strong>State:</strong> {detail.eventDetails.state}<br />
                                <strong>Abstract:</strong> {detail.eventDetails.abstract}<br />
                                <strong>Session Type:</strong> {detail.eventDetails.sessionType}
                              </Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Events;
