import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, TablePagination, IconButton, TextField
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';

// Helper function to format association data
const createAssociationData = (id, organizationName, organizationType, boardCommittee, positionRole, startDate, endDate, affiliationType, organizationCity, organizationState, organizationCountry) => ({
  id,
  organizationName,
  organizationType,
  boardCommittee,
  positionRole,
  startDate,
  endDate,
  affiliationType,
  organizationCity,
  organizationState,
  organizationCountry,
});

const AssociationRow = ({ row }) => {
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
        <TableCell>{row.organizationName}</TableCell>
        <TableCell>{row.organizationType}</TableCell>
        <TableCell>{row.boardCommittee}</TableCell>
        <TableCell>{row.positionRole}</TableCell>
        <TableCell>{row.startDate}</TableCell>
        <TableCell>{row.endDate}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Association Details
              </Typography>
              <Typography variant="body2"><strong>Affiliation Type:</strong> {row.affiliationType}</Typography>
              <Typography variant="body2"><strong>Organization City:</strong> {row.organizationCity}</Typography>
              <Typography variant="body2"><strong>Organization State:</strong> {row.organizationState}</Typography>
              <Typography variant="body2"><strong>Organization Country:</strong> {row.organizationCountry}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const Prof = ({ kolId }) => {
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/associations`, {
          params: { kolId }
        });
        const associations = response.data;
        setAssociations(associations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching associations:', error);
        setLoading(false);
      }
    };

    fetchAssociations();
  }, [kolId]);

  const filteredAssociations = useMemo(() => {
    return associations.filter(association =>
      association['Organization Name'].toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [associations, searchQuery]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const rows = filteredAssociations.map((association, index) => createAssociationData(
    `${association['Organization Name']}-${index}`, // Ensure the key is unique by adding the index
    association['Organization Name'],
    association['Organization_Type'],
    association['Board Committee'],
    association['Position Role'],
    association['Start Date'],
    association['End Date'],
    association['Affiliation Type'],
    association['Organization City'],
    association['Organization State'],
    association['Organization Country']
  ));

  return (
    <Box sx={{ flexGrow: 1, width: '100%', p: 2, overflow: 'hidden', height: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" gutterBottom color="#3D52A0">
          List of Associations
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search Organization"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ marginRight: '16px', width: '300px' }}
          />
          <TablePagination
            component="div"
            count={filteredAssociations.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Box>
      </Box>
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : filteredAssociations.length === 0 ? (
        <Typography variant="body1">No associations found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
              <TableRow>
                <TableCell />
                <TableCell><strong>Organization Name</strong></TableCell>
                <TableCell><strong>Organization Type</strong></TableCell>
                <TableCell><strong>Board Committee</strong></TableCell>
                <TableCell><strong>Position Role</strong></TableCell>
                <TableCell><strong>Start Date</strong></TableCell>
                <TableCell><strong>End Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <AssociationRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Prof;
