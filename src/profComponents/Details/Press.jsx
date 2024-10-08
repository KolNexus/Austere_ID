import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, TablePagination, IconButton, TextField
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import apiClient from '../../utils/apiClient';

// Helper function to format honors and press data
const handleNullValue = (value) => (value === "NULL" || value === "null" ? '' : value);

const createPressData = (id, Topic, Press_Content, Scientific_Platform, Date) => ({
  id: handleNullValue(id),
  Topic: handleNullValue(Topic),
  Press_Content: handleNullValue(Press_Content),
  Scientific_Platform: handleNullValue(Scientific_Platform),
  Date: handleNullValue(Date)
});


const PressRow = ({ row }) => {
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
        <TableCell>{row.Topic}</TableCell>
        <TableCell>{row.Scientific_Platform}</TableCell>
        <TableCell>{row.Date}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Press Details
              </Typography>
              <Typography variant="body2"><strong>Press Content:</strong> {row.Press_Content}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const Press = ({ kolId }) => {
  const [press, setPress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  useEffect(() => {
    const fetchpress = async () => {
      try {
        const response = await apiClient.get(`/press`, {
          params: { kolId }
        });
        const press = response.data;
        setPress(press);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching honors and press:', error);
        setLoading(false);
      }
    };

    fetchpress();
  }, [kolId]);
  //console.log(press)
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredpress = useMemo(() => {
    return press.filter(press_ =>
      press_['Topic'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      press_['Press_Content'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      press_['Scientific Platform'].includes(searchQuery) ||
      press_['Date'].includes(searchQuery)
    );
  }, [press, searchQuery]);

  const rows = filteredpress.map((press_, index) => createPressData(
    `${press_['Topic']}-${index}`, // Ensure the key is unique by adding the index
    press_['Topic'] === 'NULL' ? '' : press_['Topic'],   // Replace string "NULL" with empty string
    press_['Press_Content'] === 'NULL' ? '' : press_['Press_Content'], // Replace string "NULL" with empty string
    press_['Scientific Platform'] === 'NULL' ? '' : press_['Scientific Platform'], // Replace string "NULL" with empty string
    press_['Date'] === 'NULL' ? '' : press_['Date']
  ));


  return (
    <Box sx={{ flexGrow: 1, width: '100%', px: 2, py: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '8%' }}>
      <Typography variant="h6" gutterBottom color="#3D52A0" sx={{ flexGrow: 1 }}>
      List of Press
        </Typography>
        <TextField
          label="Search Press"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ marginRight: '16px', width: '300px' }}
        />
        <TablePagination
          component="div"
          count={press.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : filteredpress.length === 0 ? (
        <Typography variant="body1">No press found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '90%', overflow: 'auto' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
              <TableRow>
                <TableCell />
                <TableCell><strong>Topic</strong></TableCell>
                <TableCell><strong>Scientific Platform</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <PressRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Press;
