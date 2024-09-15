import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import {
  Box,
  Button,
  Paper,
  Typography,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material';
import Creatable from 'react-select/creatable';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadButton from './UploadButton';

const themeColors = {
  header: '#ADBBDA',
  hover: '#EDE8F5',
  button: '#3D52A0',
};

const MappingTable = () => {
  const [data, setData] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [availableDatabases, setAvailableDatabases] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedDatabaseName, setSelectedDatabaseName] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('DatabaseName');
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchData();
    fetchAvailableDatabases();
  }, []);

  const fetchData = () => {
    apiClient
      .get('/mapping')
      .then((response) => {
        const responseData = response.data.map((item, index) => ({
          ...item,
          uniqueId: index,
        }));
        setData(responseData);

        const uniqueUserIds = [...new Set(responseData.map((item) => item.UserID))];
        setUserIds(uniqueUserIds);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const fetchAvailableDatabases = () => {
    apiClient
      .get('/databasesavail')
      .then((response) => {
        setAvailableDatabases(response.data);
      })
      .catch((error) => {
        console.error('Error fetching available databases:', error);
      });
  };

  const handleRequestSort = (property) => {
    const isAscending = orderBy === property && order === 'asc';
    setOrder(isAscending ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedRows(data.map((row) => row.uniqueId));
    } else {
      setSelectedRows([]);
    }
  };

  const handleClick = (uniqueId) => {
    const selectedIndex = selectedRows.indexOf(uniqueId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, uniqueId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);
  };

  const handleDelete = () => {
    const mappingsToDelete = data
      .filter((row) => selectedRows.includes(row.uniqueId))
      .map((row) => ({
        UserID: row.UserID,
        DatabaseName: row.DatabaseName,
      }))
      .filter(
        (mapping) =>
          mapping.UserID !== undefined &&
          mapping.UserID !== null &&
          mapping.UserID !== '' &&
          mapping.DatabaseName !== undefined &&
          mapping.DatabaseName !== null &&
          mapping.DatabaseName !== ''
      );

    if (mappingsToDelete.length === 0) {
      alert('No rows selected for deletion');
      return;
    }

    apiClient
      .delete('/mapping', { data: { mappings: mappingsToDelete } })
      .then(() => {
        fetchData();
        setSelectedRows([]);
      })
      .catch((error) => {
        console.error('Error deleting data:', error);
        alert('Failed to delete mapping');
      });
  };

  const handleAdd = () => {
    if (selectedUserId && selectedDatabaseName) {
      const alreadyExists = data.some(
        item => item.UserID === selectedUserId && item.DatabaseName === selectedDatabaseName
      );

      if (alreadyExists) {
        alert('The selected values already exist in the table.');
        return;
      }

      apiClient
        .post('/mapping', {
          UserID: selectedUserId,
          DatabaseName: selectedDatabaseName
        })
        .then(() => {
          fetchData();
          setSelectedUserId('');
          setSelectedDatabaseName('');
        })
        .catch((error) => {
          console.error('Error adding data:', error);
        });
    } else {
      alert('Please select both UserID and DatabaseName.');
    }
  };

  const handleCreateUser = (newUserId) => {
    const newUserList = [...userIds, newUserId];
    setUserIds(newUserList);
    setSelectedUserId(newUserId);
  };

  const handleCreateDatabase = (newDatabaseName) => {
    const newDatabaseList = [...availableDatabases, newDatabaseName];
    setAvailableDatabases(newDatabaseList);
    setSelectedDatabaseName(newDatabaseName);
  };

  const filteredData = data
    .filter((item) => (selectedUserId ? item.UserID === selectedUserId : true))
    .filter((item) => (selectedDatabaseName ? item.DatabaseName === selectedDatabaseName : true))
    .sort((a, b) => {
      const isAsc = order === 'asc';
      if (orderBy === 'UserID') {
        return (a.UserID > b.UserID ? 1 : -1) * (isAsc ? 1 : -1);
      } else if (orderBy === 'DatabaseName') {
        return (a.DatabaseName > b.DatabaseName ? 1 : -1) * (isAsc ? 1 : -1);
      }
      return 0;
    });

  const userIdOptions = userIds.map(userId => ({ value: userId, label: userId }));
  const databaseNameOptions = availableDatabases.map(dbName => ({ value: dbName, label: dbName }));

  // Define fixed width for dropdowns
  const dropdownStyles = {
    control: (base) => ({
      ...base,
      width: 300, // Fixed width for dropdowns
    }),
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Database Mapping
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, justifyContent: 'flex-start' }}>
        <Creatable
          options={userIdOptions}
          value={userIdOptions.find(option => option.value === selectedUserId) || null}
          onChange={(option) => setSelectedUserId(option ? option.value : '')}
          onCreateOption={handleCreateUser}
          placeholder="Select or type UserID"
          isClearable
          styles={dropdownStyles} // Apply fixed width
        />

        <Creatable
          options={databaseNameOptions}
          value={databaseNameOptions.find(option => option.value === selectedDatabaseName) || null}
          onChange={(option) => setSelectedDatabaseName(option ? option.value : '')}
          onCreateOption={handleCreateDatabase}
          placeholder="Select or type DatabaseName"
          isClearable
          styles={dropdownStyles} // Apply fixed width
        />

        <Button
          variant="contained"
          sx={{ backgroundColor: themeColors.button }}
          onClick={handleAdd}
        >
          Add
        </Button>

        <UploadButton onFileUploaded={fetchData} />

        <Button
          variant="contained"
          sx={{ backgroundColor: themeColors.button }}
          onClick={handleDelete}
        >
          <DeleteIcon />
          Delete
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                  checked={data.length > 0 && selectedRows.length === data.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'UserID'}
                  direction={orderBy === 'UserID' ? order : 'asc'}
                  onClick={() => handleRequestSort('UserID')}
                >
                  UserID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'DatabaseName'}
                  direction={orderBy === 'DatabaseName' ? order : 'asc'}
                  onClick={() => handleRequestSort('DatabaseName')}
                >
                  DatabaseName
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow
                key={row.uniqueId}
                selected={selectedRows.indexOf(row.uniqueId) !== -1}
                hover
                onClick={() => handleClick(row.uniqueId)}
              >
                <TableCell padding="checkbox">
                  <Checkbox checked={selectedRows.indexOf(row.uniqueId) !== -1} />
                </TableCell>
                <TableCell>{row.UserID}</TableCell>
                <TableCell>{row.DatabaseName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MappingTable;
