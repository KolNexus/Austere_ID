import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, TablePagination, IconButton, TextField
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import apiClient from '../../utils/apiClient';

const handleNullValue = (value) => (value === "NULL" || value === "null" ? '' : value);

const createcompanyAffinityData = (id, companyName, drugName, parentOrganization, originalCompanyNames, affinityStrength, affinityReason, noOfPayments, payments, yearOfPayment, trend, sunshineID) => ({
  id: handleNullValue(id),
  companyName: handleNullValue(companyName),
  drugName: handleNullValue(drugName),
  parentOrganization: handleNullValue(parentOrganization),
  originalCompanyNames: handleNullValue(originalCompanyNames),
  affinityStrength: handleNullValue(affinityStrength),
  affinityReason: handleNullValue(affinityReason),
  noOfPayments: handleNullValue(noOfPayments),
  payments: handleNullValue(payments),
  yearOfPayment: handleNullValue(yearOfPayment),
  trend: handleNullValue(trend),
  sunshineID: handleNullValue(sunshineID)
});


const ComapnyAffinityRow = ({ row }) => {
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
        <TableCell>{row.companyName}</TableCell>
        <TableCell>{row.drugName}</TableCell>
        <TableCell>{row.affinityStrength}</TableCell>
        <TableCell>{row.affinityReason}</TableCell>
        <TableCell>{row.noOfPayments}</TableCell>
        <TableCell>{row.payments}</TableCell>
        <TableCell>{row.yearOfPayment}</TableCell>
        <TableCell>{row.trend}</TableCell>
        <TableCell>{row.sunshineID}</TableCell> 
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Company Affinity Details
              </Typography>
              <Typography variant="body2"><strong>Parent Organization:</strong> {row.parentOrganization}</Typography>
              <Typography variant="body2"><strong>Original Company Names:</strong> {row.originalCompanyNames}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const CompanyAffinity = ({ kolId }) => {
  const [companyAffinities, setcompanyAffinities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchcompanyAffinities = async () => {
      try {
        const response = await apiClient.get(`/company-affinity`, {
          params: { kolId }
        });
        const companyAffinities = response.data;
        setcompanyAffinities(companyAffinities);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching companyAffinities:', error);
        setLoading(false);
      }
    };

    fetchcompanyAffinities();
  }, [kolId]);

  const filteredcompanyAffinities = useMemo(() => {
    return companyAffinities.filter(companyAffinity =>
      companyAffinity['Company Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyAffinity['Drug Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyAffinity['Parent Organization'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyAffinity['Original Company Names'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyAffinity['Affinity Strength'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyAffinity['Affinity Reason'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyAffinity['Year of Payment'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyAffinity['Trend'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyAffinity['Sunshine ID'].toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companyAffinities, searchQuery]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const rows = filteredcompanyAffinities.map((companyAffinity, index) => createcompanyAffinityData(
    `${companyAffinity['Company Name']}-${index}`, // Ensure the key is unique by adding the index
    companyAffinity['Company Name'] === 'NULL' ? '' : companyAffinity['Company Name'],   // Replace string "NULL" with empty string,
    companyAffinity['Drug Name'] === 'NULL' ? '' : companyAffinity['Drug Name'],   // Replace string "NULL" with empty string,
    companyAffinity['Parent Organization'] === 'NULL' ? '' : companyAffinity['Parent Organization'],   // Replace string "NULL" with empty string,
    companyAffinity['Original Company Names'] === 'NULL' ? '' : companyAffinity['Original Company Names'],   // Replace string "NULL" with empty string,
    companyAffinity['Affinity Strength'] === 'NULL' ? '' : companyAffinity['Affinity Strength'],   // Replace string "NULL" with empty string,
    companyAffinity['Affinity Reason'] === 'NULL' ? '' : companyAffinity['Affinity Reason'],   // Replace string "NULL" with empty string,
    companyAffinity['No of Payments'] === 'NULL' ? '' : companyAffinity['No of Payments'],   // Replace string "NULL" with empty string,
    companyAffinity['Payments'] === 'NULL' ? '' : companyAffinity['Payments'],   // Replace string "NULL" with empty string,
    companyAffinity['Year of Payment'] === 'NULL' ? '' : companyAffinity['Year of Payment'],   // Replace string "NULL" with empty string,
    companyAffinity['Trend'] === 'NULL' ? '' : companyAffinity['Trend'],   // Replace string "NULL" with empty string,
    companyAffinity['Sunshine ID'] === 'NULL' ? '' : companyAffinity['Sunshine ID'],   // Replace string "NULL" with empty string
    
  ));

  return (
    <Box sx={{ flexGrow: 1, width: '100%', px: 2, py: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '8%' }}>
      <Typography variant="h6" gutterBottom color="#3D52A0" sx={{ flexGrow: 1 }}>
      List of Company Affinities
        </Typography>
          <TextField
            label="Search Company Affinity"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ marginRight: '16px', width: '300px' }}
          />
          <TablePagination
            component="div"
            count={filteredcompanyAffinities.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50]}
          />
      </div>
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : filteredcompanyAffinities.length === 0 ? (
        <Typography variant="body1">No company affinity found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: '90%', overflow: 'auto' }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
              <TableRow>
                <TableCell />
                <TableCell><strong>Company Name</strong></TableCell>
                <TableCell><strong>Drug Name</strong></TableCell>
                <TableCell><strong>Affinity Strength</strong></TableCell>
                <TableCell><strong>Affinity Reason</strong></TableCell>
                <TableCell><strong>No of Payments</strong></TableCell>
                <TableCell><strong>Payments</strong></TableCell>
                <TableCell><strong>Year of Payment</strong></TableCell>
                <TableCell><strong>Trend</strong></TableCell>
                <TableCell><strong>Sunshine ID</strong></TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <ComapnyAffinityRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CompanyAffinity;
