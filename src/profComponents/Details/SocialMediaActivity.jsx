import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, TablePagination, IconButton, TextField
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import apiClient from '../../utils/apiClient';

const handleNullValue = (value) => (value === "NULL" || value === "null" ? '' : value);

const createSocialMediaActivityData = (
  id, Social_Media_Article, Social_Media_Article_Content, Publish_Date, Other_Topics
) => ({
  id: handleNullValue(id),
  Social_Media_Article: handleNullValue(Social_Media_Article),
  Social_Media_Article_Content: handleNullValue(Social_Media_Article_Content),
  Publish_Date: handleNullValue(Publish_Date),
  Other_Topics: handleNullValue(Other_Topics)
});


const SocialMediaRow = ({ row }) => {
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
        <TableCell>{parseInt(row.id) + 1}</TableCell>
        <TableCell>{row.Social_Media_Article}</TableCell>
        <TableCell>{row.Publish_Date}</TableCell>
        <TableCell>{row.Other_Topics}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Social Media Activity Details
              </Typography>
              <Typography variant="body2"><strong>Social Media Article Content:</strong> {row.Social_Media_Article_Content}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const SocialMediaActivity = ({ kolId }) => {
  const [socialMediaActivity, setsocialMediaActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  useEffect(() => {
    const fetchsocialMediaActivity = async () => {
      try {
        const response = await apiClient.get(`/social-media-activity`, {
          params: { kolId }
        });
        const socialMediaActivity = response.data;
        setsocialMediaActivity(socialMediaActivity);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Social Media Activity:', error);
        setLoading(false);
      }
    };

    fetchsocialMediaActivity();
  }, [kolId]);
  //console.log(socialMediaActivity)
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredsocialMediaActivity = useMemo(() => {
    return socialMediaActivity.filter(socialMediaActivity =>
      socialMediaActivity['Social_Media_Article'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      socialMediaActivity['Social_Media_Article_Content'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      socialMediaActivity['Publish Date'].includes(searchQuery) ||
      socialMediaActivity['Topics'].toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [socialMediaActivity, searchQuery]);

  const rows = filteredsocialMediaActivity.map((socialMediaActivity, index) => createSocialMediaActivityData(
    `${index}`, // Ensure the key is unique by adding the index
    socialMediaActivity['Social_Media_Article'] === 'NULL' ? '' : socialMediaActivity['Social_Media_Article'],   // Replace string "NULL" with empty string
    socialMediaActivity['Social_Media_Article_Content'] === 'NULL' ? '' : socialMediaActivity['Social_Media_Article_Content'], // Replace string "NULL" with empty string
    socialMediaActivity['Publish Date'] === 'NULL' ? '' : socialMediaActivity['Publish Date'],
    socialMediaActivity['Topics'] === 'NULL' ? '' : socialMediaActivity['Topics']                         // Replace string "NULL" with empty string
  ));


  return (
    <Box sx={{ flexGrow: 1, width: '100%', px: 2, py: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '8%' }}>
        <Typography variant="h6" gutterBottom color="#3D52A0" sx={{ flexGrow: 1 }}>
          List of Social Media Activities
        </Typography>
        <TextField
          label="Search Social Media Activity"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ marginRight: '16px', width: '300px' }}
        />
        <TablePagination
          component="div"
          count={socialMediaActivity.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : filteredsocialMediaActivity.length === 0 ? (
        <Typography variant="body1">No Social Media Activity found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '90%', overflow: 'auto' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
              <TableRow>
                <TableCell />
                <TableCell><strong>Sl No.</strong></TableCell>
                <TableCell><strong>Social_Media_Article</strong></TableCell>
                <TableCell><strong>Publish Date</strong></TableCell>
                <TableCell><strong>Topics</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <SocialMediaRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SocialMediaActivity;
