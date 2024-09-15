import React from 'react';
import { useDatabase } from '../../utils/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const DatabaseSelector = () => {
  const { databases, selectDatabase, databaseName } = useDatabase();
  const navigate = useNavigate();

  const handleDatabaseChange = (event) => {
    const selectedDb = event.target.value;
    selectDatabase(selectedDb);
    navigate('/');
  };


  return (
    <FormControl variant="outlined" sx={{ minWidth: 200 /* Adjust the width as needed */ }}>
      <InputLabel id="database-select-label">Select Database</InputLabel>
      <Select
        labelId="database-select-label"
        id="database-select"
        value={databaseName || ''}
        onChange={handleDatabaseChange}
        label="Select Database"
        sx={{ width: 200 /* Set fixed width for dropdown */,overflowY:'auto' }}
      >
        {databases.map((db, index) => (
          <MenuItem key={index} value={db}>
            {db}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DatabaseSelector;
