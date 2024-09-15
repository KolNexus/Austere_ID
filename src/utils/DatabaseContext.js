import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from './apiClient'; // Import your API client
import { setDatabaseName as updateDatabaseName } from './apiClient'; // Ensure correct import path

const DatabaseContext = createContext();

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }) => {
  const [databaseName, setDatabase] = useState('');
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await apiClient.get('/databases');
        const dbList = response.data.databases;
        setDatabases(dbList);

        // Retrieve the selected database from local storage
        const storedDatabase = localStorage.getItem('selectedDatabase');
        if (storedDatabase && dbList.includes(storedDatabase)) {
          setDatabase(storedDatabase);
          updateDatabaseName(storedDatabase); // Initialize apiClient with stored database
        } else if (dbList.length > 0) {
          const defaultDb = dbList[0];
          setDatabase(defaultDb);
          localStorage.setItem('selectedDatabase', defaultDb); // Save default database to local storage
          updateDatabaseName(defaultDb); // Initialize apiClient with default database
        }
      } catch (error) {
        setError('Error fetching databases.');
        console.error('Error fetching databases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  }, []);

  const selectDatabase = (name) => {
    setDatabase(name);
    localStorage.setItem('selectedDatabase', name); // Save to local storage
    updateDatabaseName(name); // Update apiClient with new database name
  };

  return (
    <DatabaseContext.Provider value={{ databaseName, databases, selectDatabase, loading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};
