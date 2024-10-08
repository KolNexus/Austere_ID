import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { Tooltip, Card, CardContent, CardHeader, Dialog, DialogContent, DialogTitle } from '@mui/material';
import './HeatMap.css';

const HeatMap = () => {
  const [data, setData] = useState([]);
  const [country, setCountry] = useState('');
  const [geoUrl, setGeoUrl] = useState('');
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await apiClient.get('/fetch-country');
        setCountry(response.data[0].country);
        setGeoUrl(getGeoUrl(response.data[0].country));
      } catch (error) {
        console.error('Error fetching country:', error);
      }
    };

    const fetchStateKOLCounts = async () => {
      try {
        const response = await apiClient.get('/state-kol-counts');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching state KOL counts:', error);
      }
    };

    fetchCountry();
    fetchStateKOLCounts();
  }, []);

  const getGeoUrl = (country) => {
    switch (country.toLowerCase()) {
      case 'united states of america':
        return "https://cdn.jsdelivr.net/npm/us-atlas@3.0.0/states-10m.json";
      case 'europe':
        return "https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson";
      default:
        return "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
    }
  };

  const colorScale = scaleQuantize()
    .domain([0, Math.max(...data.map(d => d.KOL_Count))])
    .range([
      "#ffedea", "#ffcec5", "#ffad9f", "#ff8a75", "#ff5533",
      "#e2492d", "#be3d26", "#9a311f", "#782618"
    ]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getProjection = (country) => {
    switch (country.toLowerCase()) {
      case 'united states of america':
        return "geoAlbersUsa";
      case 'europe':
        return "geoMercator";
      default:
        return "geoMercator";
    }
  };

  const getRegionName = (geo) => {
    switch (country.toLowerCase()) {
      case 'united states of america':
        return geo.properties.name;
      case 'europe':
        return geo.properties.NAME;
      default:
        return geo.properties.name || geo.properties.admin;
    }
  };

  const getMapConfig = (country) => {
    switch (country.toLowerCase()) {
      case 'united states of america':
        return { scale: 900, center: [-96, 38] };
      case 'europe':
        return { scale: 400, center: [15, 55] };
      default:
        return { scale: 100, center: [0, 0] };
    }
  };

  const mapConfig = getMapConfig(country);

  return (
    <>
      <Card onClick={handleClickOpen} sx={{
        cursor: 'pointer',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        }
      }}>
        <CardHeader
          title="KOLs Demographics"
          sx={{
            paddingBottom: "0px",
            '& .MuiCardHeader-title': {
              fontSize: '20px',
              fontFamily: "Aptos",
              fontWeight: 50,
              display: "flex",
              justifyContent: "center"
            },
          }}
        />
        <CardContent sx={{ px: 1, py: 0, paddingBottom: "0px", '&:last-child ': { paddingBottom: "0px" } }}>
          <div className="heatmap-container">
            <ComposableMap projection={getProjection(country)}>
              <ZoomableGroup center={mapConfig.center} zoom={country.toLowerCase() === 'europe' ? 3 : 1}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map(geo => {
                      const regionName = getRegionName(geo);
                      const cur = data.find(s => s.State === regionName);
                      return (
                        <Tooltip key={geo.rsmKey} title={`${regionName}: ${cur ? cur.KOL_Count : 0} KOLs`}>
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
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>KOLs Demographics</DialogTitle>
        <DialogContent>
          <div>
            <ComposableMap projection={getProjection(country)} style={{ width: "100%", height: "500px" }}>
              <ZoomableGroup center={mapConfig.center} zoom={country.toLowerCase() === 'europe' ? 3 : 1}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map(geo => {
                      const regionName = getRegionName(geo);
                      const cur = data.find(s => s.State === regionName);
                      return (
                        <Tooltip key={geo.rsmKey} title={`${regionName}: ${cur ? cur.KOL_Count : 0} KOLs`}>
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
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeatMap;