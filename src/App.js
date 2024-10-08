import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { signOut, fetchUserAttributes, getCurrentUser } from '@aws-amplify/auth';
import awsExports from './aws-exports';
import MappingTable from './components/Admin/MappingTable';
import { DatabaseProvider, useDatabase } from './utils/DatabaseContext';
import CustomSignIn from './components/Login/CustomSignIn';
import ForgotPassword from './components/Login/ForgotPassword';
import Header from './components/ID_Header';
import './App.css';
import './components/Login/CognitoCustomUI.css';

Amplify.configure(awsExports);

const MainContent = () => {
  const { databaseName } = useDatabase();
  const [Components, setComponents] = useState({
    Content: null,
    ChartsContainer: null,
    Visual: null,
  });

  // Dynamically import components based on databaseName
  useEffect(() => {
    const loadComponents = async () => {
      if (databaseName.startsWith('profile_')) {
        // Load components from `profComponents`
        const { default: Content } = await import('./profComponents/Home/ID_Content');
        const { default: ChartsContainer } = await import('./profComponents/Summary/ChartsContainer');
        const { default: Visual } = await import('./profComponents/Details/visual');
        setComponents({
          Content,
          ChartsContainer,
          Visual,
        });
      } else {
        // Load components from `components`
        const { default: Content } = await import('./components/Home/ID_Content');
        const { default: ChartsContainer } = await import('./components/Summary/ChartsContainer');
        const { default: Visual } = await import('./components/Details/visual');
        setComponents({
          Content,
          ChartsContainer,
          Visual,
        });
      }
    };

    loadComponents();
  }, [databaseName]);

  // If components are not yet loaded, show a loading message
  if (!Components.Content || !Components.ChartsContainer || !Components.Visual) {
    return <div>Loading content...</div>;
  }

  const { Content, ChartsContainer, Visual } = Components;

  return (
    <div className="main-content" key={databaseName}>
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/home" element={<ChartsContainer />} />
        <Route path="/profile/:kolId" element={<Visual />} />
      </Routes>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      const user = await getCurrentUser();
      if (user) {
        const attributes = await fetchUserAttributes();
        setIsAuthenticated(true);
        setIsAdmin(attributes['custom:admin'] === '1');
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsAuthenticating(false);
    }
  }

  const handleSignIn = async () => {
    try {
      await checkAuthState(); // Refresh authentication state
    } catch (error) {
      console.error('Error signing in', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      setIsAuthenticated(false);
      setIsAdmin(false);
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '/';
      await signOut();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (isAuthenticating) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Router>
        {!isAuthenticated ? (
          <Routes>
            <Route path="/" element={<CustomSignIn onSignIn={handleSignIn} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        ) : (
          <DatabaseProvider>
            <div className="app-container">
              <Header signOut={handleSignOut} isAdmin={isAdmin} />
              {isAdmin ? (
                <MappingTable />
              ) : (
                <MainContent />
              )}
            </div>
          </DatabaseProvider>
        )}
      </Router>
    </div>
  );
};

export default App;