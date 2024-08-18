import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, Button, Typography, Box, Grid
} from '@mui/material';

const WeightagePopup = ({ showPopup, closePopup }) => {
    const [editedWeightages, setEditedWeightages] = useState([]);
    const [defaultWeightages] = useState([
        { column_name: 'Congress Count', weightage: 2.5 },
        { column_name: 'Key topic Congress Count', weightage: 20 },
        { column_name: 'Key topic Trials Count', weightage: 20 },
        { column_name: 'Principal Investigator', weightage: 2.5 },
        { column_name: 'First Author Pubs Count', weightage: 5 },
        { column_name: 'Key topic Pubs Count', weightage: 20 },
        { column_name: 'ACADEMIC Count', weightage: 2.5 },
        { column_name: 'ASSOCIATION Count', weightage: 15 },
        { column_name: 'GUIDELINE Count', weightage: 5 },
        { column_name: 'HOSPITAL Count', weightage: 2.5 },
        { column_name: 'JOURNAL Count', weightage: 2.5 },
        { column_name: 'Advocacy Group Count', weightage: 2.5 },
        { column_name: 'Social Media', weightage: 0 }
    ]);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [totalWeightage, setTotalWeightage] = useState(0);

    const updateTotalWeightage = useCallback(() => {
        const total = editedWeightages.reduce((total, weightage) => total + parseFloat(weightage.weightage || 0), 0);
        setTotalWeightage(total);
    }, [editedWeightages]);

    useEffect(() => {
        if (showPopup) {
            setErrorDialogOpen(false);
            fetchDefaultWeightages();
        }
    }, [showPopup]);

    useEffect(() => {
        updateTotalWeightage();
    }, [editedWeightages, updateTotalWeightage]);

    const fetchDefaultWeightages = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/weightages`);
            setEditedWeightages(response.data);
        } catch (error) {
            console.error('Error fetching default weightages:', error);
        }
    };

    const handleWeightageChange = (columnName, value) => {
        setEditedWeightages(prevWeightages =>
            prevWeightages.map(weightage =>
                weightage.column_name === columnName ? { ...weightage, weightage: value } : weightage
            )
        );
    };

    const saveWeightages = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/update-weightages`, editedWeightages);
            fetchDefaultWeightages();
        } catch (error) {
            console.error('Error saving weightages:', error);
        }
    };

    const revertToDefault = () => {
        setEditedWeightages([...defaultWeightages]);
    };

    const handleSave = () => {
        if (totalWeightage > 100) {
            setErrorDialogOpen(true);
            return;
        }
        saveWeightages();
        closePopup();
    };

    const handleChange = (columnName, value) => {
        const parsedValue = parseFloat(value);
        handleWeightageChange(columnName, isNaN(parsedValue) ? '' : parsedValue);

        if (errorDialogOpen) {
            setErrorDialogOpen(false);
        }
        updateTotalWeightage();
    };

    const closeErrorDialog = () => {
        setErrorDialogOpen(false);
    };

    return (
        <>
            <Dialog open={showPopup} onClose={closePopup} maxWidth="md" fullWidth>
                <DialogTitle>
                    Edit Weightages (Total: {totalWeightage}%)
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            {editedWeightages.map((weightage, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <TextField
                                        label={weightage.column_name}
                                        type="number"
                                        value={weightage.weightage}
                                        onChange={(e) => handleChange(weightage.column_name, e.target.value)}
                                        fullWidth
                                        margin="normal"
                                        variant="outlined"
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={revertToDefault} variant="contained" color="primary">
                        Revert to Default
                    </Button>
                    <Button onClick={closePopup} variant="contained" color="warning">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="warning">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={errorDialogOpen} onClose={closeErrorDialog}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <Typography color="error" variant="body2">
                        Total weightage cannot exceed 100.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeErrorDialog} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default WeightagePopup;
