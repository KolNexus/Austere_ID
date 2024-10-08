import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, TablePagination, IconButton, TextField
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import apiClient from '../../utils/apiClient';

const handleNullValue = (value) => (value === "NULL" || value === "null" ? '' : value);

const createQualificationData = (
  id, Institution_Name, parentOrganization, educationType, degree, honors, startDate, endDate
) => ({
  id: handleNullValue(id),
  Institution_Name: handleNullValue(Institution_Name),
  parentOrganization: handleNullValue(parentOrganization),
  educationType: handleNullValue(educationType),
  degree: handleNullValue(degree),
  honors: handleNullValue(honors),
  startDate: handleNullValue(startDate),
  endDate: handleNullValue(endDate)
});


const QualificationRow = ({ row }) => {
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
                <TableCell>{row.Institution_Name}</TableCell>
                <TableCell>{row.educationType}</TableCell>
                <TableCell>{row.degree}</TableCell>
                <TableCell>{row.honors}</TableCell>
                <TableCell>{row.startDate}</TableCell>
                <TableCell>{row.endDate}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Qualification Details
                            </Typography>
                            <Typography variant="body2"><strong>Parent Organization:</strong> {row.parentOrganization}</Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const Qualification
    = ({ kolId }) => {
        const [qualification, setqualification] = useState([]);
        const [loading, setLoading] = useState(true);
        const [rowsPerPage, setRowsPerPage] = useState(10);
        const [page, setPage] = useState(0);
        const [searchQuery, setSearchQuery] = useState('');

        useEffect(() => {
            const fetchqualification
                = async () => {
                    try {
                        const response = await apiClient.get(`/qualifications`, {
                            params: { kolId }
                        });
                        const qualification = response.data;
                        setqualification(qualification);
                        setLoading(false);
                    } catch (error) {
                        console.error('Error fetching qualifications:', error);
                        setLoading(false);
                    }
                };

            fetchqualification();
        }, [kolId]);

        const filteredqualification = useMemo(() => {
            return qualification.filter(qualification_ =>
                qualification_['Institution_Name'].toLowerCase().includes(searchQuery.toLowerCase()) ||
                qualification_['Parent Organization'].toLowerCase().includes(searchQuery.toLowerCase()) ||
                qualification_['Education_Type'].toLowerCase().includes(searchQuery.toLowerCase()) ||
                qualification_['Degree'].toLowerCase().includes(searchQuery.toLowerCase()) ||
                qualification_['Honors'].toLowerCase().includes(searchQuery.toLowerCase()) ||
                qualification_['Start_Date'].toLowerCase().includes(searchQuery.toLowerCase()) ||
                qualification_['End_Date'].toLowerCase().includes(searchQuery.toLowerCase())
            );
        }, [qualification, searchQuery]);

        const handlePageChange = (event, newPage) => {
            setPage(newPage);
        };

        const handleRowsPerPageChange = (event) => {
            setRowsPerPage(+event.target.value);
            setPage(0);
        };

        const rows = filteredqualification
            .map((qualification_, index) => createQualificationData(
                `${qualification_['Institution_Name']}-${index}`, // Ensure the key is unique by adding the index
                qualification_['Institution_Name'] === 'NULL' ? '' : qualification_['Institution_Name'],   // Replace string "NULL" with empty string,
                qualification_['Parent Organization'] === 'NULL' ? '' : qualification_['Parent Organization'],   // Replace string "NULL" with empty string,
                qualification_['Education_Type'] === 'NULL' ? '' : qualification_['Education_Type'],   // Replace string "NULL" with empty string,
                qualification_['Degree'] === 'NULL' ? '' : qualification_['Degree'],   // Replace string "NULL" with empty string,
                qualification_['Honors'] === 'NULL' ? '' : qualification_['Honors'],   // Replace string "NULL" with empty string,
                qualification_['Start_Date'] === 'NULL' ? '' : parseInt(qualification_['Start_Date']),   // Replace string "NULL" with empty string,
                qualification_['End_Date'] === 'NULL' ? '' : parseInt(qualification_['End_Date']),   // Replace string "NULL" with empty string,
            ));

        return (
            <Box sx={{ flexGrow: 1, width: '100%', px: 2, py: 1, overflow: 'hidden', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', height: '8%' }}>
                    <Typography variant="h6" gutterBottom color="#3D52A0" sx={{ flexGrow: 1 }}>
                        List of Qualifications
                    </Typography>
                    <TextField
                        label="Search Qualification"
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ marginRight: '16px', width: '300px' }}
                    />
                    <TablePagination
                        component="div"
                        count={filteredqualification.length}
                        page={page}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={[10, 25, 50]}
                    />
                </div>
                {loading ? (
                    <Typography variant="body1">Loading...</Typography>
                ) : filteredqualification
                    .length === 0 ? (
                    <Typography variant="body1">No qualifications found.</Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ maxHeight: '90%', overflow: 'auto' }}>
                        <Table stickyHeader aria-label="collapsible table">
                            <TableHead sx={{ backgroundColor: '#54C1DF' }}>
                                <TableRow>
                                    <TableCell />
                                    <TableCell><strong>Institution Name</strong></TableCell>
                                    <TableCell><strong>Education Type</strong></TableCell>
                                    <TableCell><strong>Degree</strong></TableCell>
                                    <TableCell><strong>Honors</strong></TableCell>
                                    <TableCell><strong>Start Date</strong></TableCell>
                                    <TableCell><strong>End Date</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <QualificationRow key={row.id} row={row} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        );
    };

export default Qualification
    ;
