import axios from 'axios';
import { getCurrentUser } from 'aws-amplify/auth'; // Updated import statement

// Create an Axios instance
const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_SERVER_URL}`,
});

let selectedDatabase = '';
let userId = '';

// Function to get the current user's ID from Cognito
const getUserIdFromCognito = async () => {
  try {
    const user = await getCurrentUser(); // Use the imported function directly
    userId = user.signInDetails.loginId; // Get the Cognito username (or any other attribute you want)
  } catch (error) {
    console.error('Error fetching user from Cognito:', error);
  }
};

// Initialize the userId when the app starts
getUserIdFromCognito();

export const setDatabaseName = (databaseName) => {
  selectedDatabase = databaseName;
};
export const getUserId = () => userId; // Add a getter function to retrieve userId

// Add a request interceptor to include userId and databaseName in all requests
apiClient.interceptors.request.use(async (config) => {
  if (!userId) {
    await getUserIdFromCognito(); // Ensure userId is set before making the request
  }
  if (!config.url.startsWith('/id/upload') && !config.url.startsWith('/api/upload')) {
    if (selectedDatabase.startsWith('profile_')) {
      config.baseURL = `${process.env.REACT_APP_SERVER_URL}/api`; // Change baseURL to /api
    } else {
      config.baseURL = `${process.env.REACT_APP_SERVER_URL}/id`; // Default to /id
    }
  }

  // Only allow requests to /databases route or if a databaseName is selected
  if (!selectedDatabase && !config.url.startsWith('/databases') && !config.url.startsWith('/databasesavail') && !config.url.startsWith('/mapping')) {
    return Promise.reject();
  }
  // Add userId to query parameters
  config.params = config.params || {};
  config.params.userId = userId;
  // Add databaseName to query parameters if set
  if (selectedDatabase) {
    config.params.databaseName = selectedDatabase;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
