import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { Tooltip, Card, CardContent, CardHeader, Dialog, DialogContent, DialogTitle } from '@mui/material';
import './HeatMap.css';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3.0.0/states-10m.json";

const HeatMap = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/state-kol-counts`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const colorScale = scaleQuantize()
    .domain([0, Math.max(...data.map(d => d.KOL_Count))])
    .range([
      "#ffedea",
      "#ffcec5",
      "#ffad9f",
      "#ff8a75",
      "#ff5533",
      "#e2492d",
      "#be3d26",
      "#9a311f",
      "#782618"
    ]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Card
        sx={{
          height: '420px',
          cursor: 'pointer',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 6,
          }
        }}
        onClick={handleClickOpen}
      >
        <CardHeader title="ADHD KOLS DEMOGRAPHICS"
          sx={{
            '& .MuiCardHeader-title': {
              //fontSize:'1rem',
              fontFamily: "Roboto, Helvetica, Arial, sans-serif",
              fontWeight: 400
            },
          }} />
        <CardContent>
          <div className="heatmap-container">
            <ComposableMap projection="geoAlbersUsa" style={{ height: "60vh" }} >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const cur = data.find(s => s.State === geo.properties.name);
                    return (
                      <Tooltip key={geo.rsmKey} title={`${geo.properties.name}: ${cur ? cur.KOL_Count : 0} KOLs`}>
                        <Geography
                          geography={geo}
                          fill={cur ? colorScale(cur.KOL_Count) : "#EEE"}
                          stroke="#FFF"
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none" },
                            pressed: { outline: "none" }
                          }}
                        />
                      </Tooltip>
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>ADHD KOLS DEMOGRAPHICS</DialogTitle>
        <DialogContent>
            <div className="heatmap-container">
              <ComposableMap projection="geoAlbersUsa" style={{ height: "300px" }}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map(geo => {
                      const cur = data.find(s => s.State === geo.properties.name);
                      return (
                        <Tooltip key={geo.rsmKey} title={`${geo.properties.name}: ${cur ? cur.KOL_Count : 0} KOLs`}>
                          <Geography
                            geography={geo}
                            fill={cur ? colorScale(cur.KOL_Count) : "#EEE"}
                            stroke="#FFF"
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none" },
                              pressed: { outline: "none" }
                            }}
                          />
                        </Tooltip>
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeatMap;
