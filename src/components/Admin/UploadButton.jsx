import React, { useRef } from 'react';
import { Button } from '@mui/material';
import apiClient from '../../utils/apiClient';

const UploadButton = ({ onFileUploaded }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send the file to the server endpoint
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check if the response status is OK and handle it
      if (response.status === 200) {
        onFileUploaded(); // Trigger any updates needed after file processing
        alert('File processed and data imported successfully.');
      } else {
        // Show an alert if the status is not OK
        alert('Failed to process the file. Server responded with: ' + response.data);
      }
    } catch (error) {
      // Extract and display the error message from the response
      const errorMessage = error.response ? error.response.data : error.message;
      console.error('Error uploading file:', error);
      alert('Failed to process the file. Error: ' + errorMessage);
    }

    event.target.value = null; // Clear file input after upload
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".xlsx"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        sx={{ 
          backgroundColor: '#3D52A0',
          '&:hover': { backgroundColor: '#2A3C6C' } // Optional: darker color on hover
        }}
      >
        Upload
      </Button>
    </div>
  );
};

export default UploadButton;
