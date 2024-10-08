import React, { useState, useEffect, useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import apiClient from '../../utils/apiClient';
import { Select, MenuItem, Box, Typography, CircularProgress } from '@mui/material';

const NetworkMap = ({ kolId }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedOption, setSelectedOption] = useState('all-connections');
  const [iconImage, setIconImage] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);  // Track loading state

  // Reference for ForceGraph2D component to manipulate zoom
  const graphRef = useRef(null);

  const fetchGraphData = useCallback(async (endpoint) => {
    setLoading(true);  // Show loading spinner
    try {
      const response = await apiClient.get(`/kol/${kolId}/${endpoint}`);
      const data = response.data;
      prepareGraphData(data);
    } catch (error) {
      console.error('Error fetching KOL connections:', error);
      setGraphData({ nodes: [], links: [] }); // Set to empty if there's an error
    }
    finally {
      setLoading(false);  // Hide loading spinner
    }
  }, [kolId]);

  useEffect(() => {
    // Load the icon image
    const img = new Image();
    img.src = '/network_logo.png';  // Replace with the path to your icon image
    img.onload = () => setIconImage(img);

    // Fetch initial data
    fetchGraphData(selectedOption);
  }, [fetchGraphData, selectedOption]);

  useEffect(() => {
    if (graphData.nodes.length && graphRef.current) {
      // Apply initial zoom level after graphData is loaded
      graphRef.current.zoom(3);  // Set zoom level (e.g., 3x zoom)
      //graphRef.current.centerAt(0, 0, 1000);   Optional: center the graph (over 1 second duration)
    }
  }, [graphData]);

  const prepareGraphData = (connections) => {
    const nodes = {};
    const linksMap = {};  // Use a map to group links by KOL1 and KOL2
  
    connections.forEach((connection) => {
      const {
        KOL1, KOL2, value, type,
        KOL1_FirstName, KOL1_LastName,
        KOL2_FirstName, KOL2_LastName
      } = connection;
  
      // Create or update nodes
      if (!nodes[KOL1]) {
        nodes[KOL1] = {
          id: KOL1,
          name: KOL1_FirstName && KOL1_LastName ? `${KOL1_FirstName} ${KOL1_LastName}` : KOL1,
        };
      }
  
      if (!nodes[KOL2]) {
        nodes[KOL2] = {
          id: KOL2,
          name: KOL2_FirstName && KOL2_LastName ? `${KOL2_FirstName} ${KOL2_LastName}` : KOL2,
        };
      }
  
      // Generate a unique key for the pair of nodes
      const linkKey = `${KOL1}-${KOL2}`;
      
      // Group links by KOL1 and KOL2, accumulating the different types
      if (!linksMap[linkKey]) {
        linksMap[linkKey] = {
          source: KOL1,
          target: KOL2,
          connections: []
        };
      }
  
      linksMap[linkKey].connections.push({ type, value });
    });
  
    // Convert the linksMap into an array
    const links = Object.values(linksMap);
  
    setGraphData({
      nodes: Object.values(nodes),
      links: links,
    });
  };  

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setSelectedNode(null);  // Clear selected node when switching options
  };

  const nodeCanvasObject = (node, ctx, globalScale) => {
    if (!iconImage) return;  // Don't render if image hasn't loaded
  
    const size = 30 / globalScale;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Aptos`;
  
    // Save the current context state
    ctx.save();
  
    // Draw orange border for primary KOL ID
    if (node.id === kolId) {
      ctx.strokeStyle = 'orange'; // Orange border color
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
      ctx.stroke();
    }
  
    // Highlight node if it's selected or connected
    const isConnected = selectedNode && (node.id === selectedNode.id || isNodeConnected(node));
    if (isConnected) {
      ctx.strokeStyle = '#8697C4'; // Highlight color: orange border
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
      ctx.stroke();
    }
  
    // Create a circular clipping region
    ctx.beginPath();
    ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
    ctx.clip();
  
    // Draw the icon image within the clipping region
    ctx.drawImage(iconImage, node.x - size / 2, node.y - size / 2, size, size);
  
    // Restore the context state (removes clipping region)
    ctx.restore();
  
    // Add label below the node
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText(node.name, node.x, node.y + size / 2 + fontSize);
  };

  const isNodeConnected = (node) => {
    return graphData.links.some(
      (link) =>
        (link.source.id === selectedNode?.id && link.target.id === node.id) ||
        (link.target.id === selectedNode?.id && link.source.id === node.id)
    );
  };

  const linkColor = (link) => {
    return selectedNode &&
      (link.source.id === selectedNode.id || link.target.id === selectedNode.id)
      ? 'red'  // Highlight color: orange
      : 'gray';  // Default color
  };

  const handleNodeClick = (node) => {
    // Toggle selection: if the clicked node is already selected, unselect it
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);  // Unselect node
    } else {
      setSelectedNode(node);  // Select new node
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const linkLabel = (link) => {
    return link.connections.map(conn => `${capitalizeFirstLetter(conn.type)}-${conn.value}`).join(', ');
  };
  
  return (
    <Box sx={{ flexGrow: 1, width: '100%', overflow: 'hidden', height: '100%', position: 'relative' }}>
      {/* Select component in top-right corner */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
        <Select
          value={selectedOption}
          onChange={handleOptionChange}
          variant="outlined"
          size="small"
          sx={{ backgroundColor: '#8697C4', color: 'white' }}
        >
          <MenuItem value="all-connections">All</MenuItem>
          <MenuItem value="events">Events</MenuItem>
          <MenuItem value="publications">Publications</MenuItem>
          <MenuItem value="trials">Trials</MenuItem>
          <MenuItem value="associations">Associations</MenuItem>
        </Select>
      </Box>

      {loading ? (
        // Show the loading spinner while data is being fetched
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress sx={{ color: '#8697C4' }} />
        </Box>
      ) : graphData.nodes.length === 0 && !loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#8697C4',
            fontSize: '24px',
          }}
        >
          <Typography sx={{ fontFamily: "Aptos" }}>No connections found</Typography>
        </Box>
      ) : (
        <Box sx={{ height: '100%',width:"100%" }}>
          <ForceGraph2D
            ref={graphRef}  // Attach ref to ForceGraph2D component
            graphData={graphData}
            nodeCanvasObject={nodeCanvasObject}
            linkColor={linkColor}
            onNodeClick={handleNodeClick}  // Capture node click event
            linkLabel={linkLabel}
            />
        </Box>
      )}
    </Box>
  );
};

export default NetworkMap;