import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, TablePagination, IconButton, TextField
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';

// Helper function to format publication data
const createPubData = (id, date, journalName, article, meshTerms, abstract, role, publicationType, pid, link) => ({
  id,
  date,
  journalName,
  article,
  meshTerms,
  abstract,
  role,
  publicationType,
  pid,
  link
});

const PubRow = ({ row }) => {
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
            {row.pid}
          </a>
        </TableCell>
        <TableCell>{row.date}</TableCell>
        <TableCell>{row.journalName}</TableCell>
        <TableCell>{row.article}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Publication Details
              </Typography>
              <Typography variant="body2"><strong>Abstract:</strong> {row.abstract}</Typography>
              <Typography variant="body2"><strong>Role:</strong> {row.role}</Typography>
              <Typography variant="body2"><strong>Publication Type:</strong> {row.publicationType}</Typography>
              <Typography variant="body2"><strong>Mesh Terms:</strong> {row.meshTerms}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const Pubs = ({ kolId }) => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/publications`, {
          params: { kolId }
        });
        const publications = response.data;
        setPublications(publications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching publications:', error);
        setLoading(false);
      }
    };

    fetchPublications();
  }, [kolId]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredPubs = publications.filter(publication =>
    publication['Journal Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
    publication['Article'].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rows = filteredPubs.map((publication, index) => createPubData(
    `${publication['Publication ID']}-${index}`, // Ensure the key is unique by adding the index
    publication['Formatted Date (DD/MM/YYYY)'],
    publication['Journal Name'],
    publication['Article'],
    publication['Mesh Terms - Pubmed'],
    publication['Abstract'],
    publication['Role'],
    publication['Publication Type'],
    publication['PubmedID'],
    publication['Reference Link']

  ));

  return (
    <Box sx={{ flexGrow: 1, width: '100%', p: 2, overflow: 'hidden', height: '100vh' }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" gutterBottom color="#3D52A0">
          List of Publications
        </Typography>
        <TextField
          label="Search Publications"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ marginRight: '16px', width: '300px' }}
        />
        <TablePagination
          component="div"
          count={publications.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : filteredPubs.length === 0 ? (
        <Typography variant="body1">No publications found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
              <TableRow>
                <TableCell />
                <TableCell><strong>PubMed ID</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Journal Name</strong></TableCell>
                <TableCell><strong>Article</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <PubRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Pubs;
