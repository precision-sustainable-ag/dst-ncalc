/* eslint-disable no-alert */
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { BlobServiceClient } from '@azure/storage-blob';
import {
  Autocomplete,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  MenuItem,
  TextField,
  Box,
  useMediaQuery,
} from '@mui/material';
import { PSAButton, PSATextField } from 'shared-react-components/src';
import axios from 'axios';
import shpjs from 'shpjs';
import { azureSASToken, containerName, storageAccountName } from '../../utils/keys';
import { isValidGeoJSON } from '../../utils/geojsonUtils';

const API_BASE_URL = 'https://developpm3dapi.covercrop-ncalc.org/api/v1';
const MAP_TYPES = ['Spray Map', 'Yield Map'];
const ROLES = ['NIFA-Soy', 'Willard', 'Growmark'];

const UploadMap = () => {
  const {
    user, isAuthenticated, isLoading, getAccessTokenSilently,
  } = useAuth0();

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [fieldOptions, setFieldOptions] = useState([]);
  const [isFetching, setIsFetching] = useState(null);

  const [filterProgram, setFilterProgram] = useState(null);
  const [filterGrower, setFilterGrower] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [mapType, setMapType] = useState(MAP_TYPES[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const roles = user?.['https://dst-ncalc.org/claims'] || [];
  const isAllowed = isAuthenticated && (roles.includes('admin') || roles.some((r) => ROLES.includes(r)));

  // Fetch All Fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setIsFetching(true);
        const token = await getAccessTokenSilently();
        const response = await axios.get(`${API_BASE_URL}/fields-identifiers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFieldOptions(response.data);
      } catch (error) {
        console.error('Failed to load options', error);
      } finally {
        setIsFetching(false);
      }
    };

    if (isAuthenticated) {
      fetchFields();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Azure Upload
  // const handleUpload = async () => {
  //   if (!selectedFile || !selectedField) {
  //     alert('Please select a field and a valid file.');
  //     return;
  //   }

  //   setIsUploading(true);
  //   setUploadProgress(0);

  //   try {
  //     // Create Azure Blob Service Client
  //     const blobServiceClient = new BlobServiceClient(
  //       `https://${storageAccountName}.blob.core.windows.net?${azureSASToken}`,
  //     );

  //     // Get Container Client
  //     const containerClient = blobServiceClient.getContainerClient(containerName);

  //     const {
  //       programName, growerName, farmName, fieldName, season,
  //     } = selectedField.properties;

  //     /**
  //      * Construct Folder/File Path
  //      * Folder format: programName_growerName_farmName_fieldName_seaspn
  //      * File format: mapType_filename
  //      * Example: NIFA_Midwest_Ohio_Field_A_Spring_2025/Yield_Map_data.zip
  //      */
  //     const folderName = `${programName}_${growerName}_${farmName}_${fieldName}_${season}`;
  //     const cleanFileName = selectedFile.name.replace(/\s+/g, '_');
  //     const blobName = `${folderName.replace(/\s+/g, '_')}/${mapType.replace(/\s+/g, '_')}_${cleanFileName}`;

  //     const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  //     await blockBlobClient.uploadData(selectedFile, {
  //       onProgress: (progress) => {
  //         const percent = Math.round((progress.loadedBytes / selectedFile.size) * 100);
  //         setUploadProgress(percent);
  //       },
  //       blobHTTPHeaders: { blobContentType: selectedFile.type },
  //     });

  //     alert(`File uploaded successfully to folder: ${folderName}`);

  //     // Reset file input
  //     setSelectedFile(null);
  //     setUploadProgress(0);
  //     setSelectedField(null);
  //     setMapType(MAP_TYPES[0]);
  //   } catch (error) {
  //     alert(`Upload failed: ${error.message || 'Unknown error occurred'}`);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  // Returns list of case insensitive unique strings
  const getUniqueCaseInsensitive = (list) => {
    const seen = new Set();
    return list.filter((item) => {
      if (!item) return false;
      const lower = item.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    }).sort();
  };

  const uniquePrograms = useMemo(() => {
    const programs = fieldOptions.map((f) => f.properties.programName);
    return getUniqueCaseInsensitive(programs);
  }, [fieldOptions]);

  const uniqueGrowers = useMemo(() => {
    let filtered = fieldOptions;
    if (filterProgram) {
      filtered = filtered.filter((f) => f.properties.programName?.toLowerCase() === filterProgram.toLowerCase());
    }
    const growers = filtered.map((f) => f.properties.growerName);
    return getUniqueCaseInsensitive(growers);
  }, [fieldOptions, filterProgram]);

  const filteredFieldList = useMemo(() => fieldOptions.filter((f) => {
    const pName = f.properties.programName;
    const gName = f.properties.growerName;

    const matchProgram = !filterProgram || (pName && pName.toLowerCase() === filterProgram.toLowerCase());
    const matchGrower = !filterGrower || (gName && gName.toLowerCase() === filterGrower.toLowerCase());

    return matchProgram && matchGrower;
  }), [fieldOptions, filterProgram, filterGrower]);

  const handleProgramFilterChange = (newVal) => {
    setFilterProgram(newVal);
    setFilterGrower(null);
    setSelectedField(null);
  };

  const handleGrowerFilterChange = (newVal) => {
    setFilterGrower(newVal);
    setSelectedField(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedField) {
      alert('Please select a field and a valid file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = await getAccessTokenSilently();

      // Create FormData object
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Append metadata
      const {
        programName, growerName, farmName, fieldName, season,
      } = selectedField.properties;

      formData.append('programName', programName);
      formData.append('growerName', growerName);
      formData.append('farmName', farmName);
      formData.append('fieldName', fieldName);
      formData.append('season', season);
      formData.append('mapType', mapType);

      await axios.post('http://localhost:80/api/v1/upload-map', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      alert('File uploaded successfully!');

      // Reset UI
      setSelectedFile(null);
      setUploadProgress(0);
      setSelectedField(null);
      setMapType(MAP_TYPES[0]);
      setFilterProgram(null);
      setFilterGrower(null);
    } catch (error) {
      const msg = error.response?.data?.error || 'Upload failed';
      alert(`Error: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();

    // Parse and validate geojson
    if (['geojson', 'json'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const geojson = JSON.parse(reader.result);
          if (isValidGeoJSON(geojson)) {
            setSelectedFile(file);
          } else {
            alert('Invalid GeoJSON. Please try again with a different file.');
          }
        } catch (err) {
          alert('Error parsing GeoJSON file');
        }
      };
      reader.readAsText(file);
    } else if (['shp', 'zip'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result;
          const geojson = await shpjs(arrayBuffer);

          if (isValidGeoJSON(geojson)) {
            setSelectedFile(file);
          } else {
            alert('Invalid GeoJSON. Please try again with a different file.');
          }
        } catch (err) {
          alert('Error parsing Shapefile. Please ensure it is a valid .zip containing .shp, .shx, and .dbf files.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Unsupported file type. Please upload .geojson or .shp');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Grid container justifyContent="center">
        <Grid
          item
          xs={12}
          md={10}
          sx={{
            marginTop: '1rem', padding: '2rem', backgroundColor: 'white', borderRadius: 5,
          }}
        >
          <Typography variant="h6" align="center">Please log in to upload a file</Typography>
        </Grid>
      </Grid>
    );
  }

  if (!isAllowed) {
    return (
      <Grid container justifyContent="center">
        <Grid
          item
          xs={12}
          md={10}
          sx={{
            marginTop: '1rem', padding: '2rem', backgroundColor: 'white', borderRadius: 5,
          }}
        >
          <Typography variant="h6" align="center">Access denied</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container justifyContent="center">
      <Grid
        item
        xs={12}
        md={10}
        sx={{
          marginTop: '1rem',
          padding: `2rem ${matchesMd ? '1rem' : '4rem'}`,
          boxShadow: 5,
          borderRadius: 5,
          opacity: 0.9,
          backgroundColor: 'white',
        }}
      >
        <Stack spacing="1.5em">
          <Typography variant="h4" align="center" gutterBottom>
            Upload Field Maps
          </Typography>

          <Typography variant="body1" color="textSecondary">
            Use the filters below to find your field.
          </Typography>

          <Grid container>
            <Grid item xs={12} md={6} sx={{ pr: { md: 1 }, pb: { xs: 2 } }}>
              <Autocomplete
                options={uniquePrograms}
                value={filterProgram}
                onChange={(e, val) => handleProgramFilterChange(val)}
                renderInput={(params) => <PSATextField {...params} label="Filter by Program" />}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ pl: { md: 1 } }}>
              <Autocomplete
                options={uniqueGrowers}
                value={filterGrower}
                onChange={(e, val) => handleGrowerFilterChange(val)}
                disabled={!filterProgram && uniqueGrowers.length > 50}
                renderInput={(params) => <PSATextField {...params} label="Filter by Grower" />}
              />
            </Grid>
          </Grid>

          <Typography variant="body1" color="textSecondary">
            Select the field details below to ensure the file is saved in the correct folder.
          </Typography>

          <Autocomplete
            loading={isFetching}
            loadingText="Loading fields..."
            options={filteredFieldList}
            value={selectedField}
            key={`${filterProgram}-${filterGrower}`}
            onChange={(event, newValue) => setSelectedField(newValue)}
            getOptionLabel={(option) => {
              const p = option.properties;
              return `${p.programName} / ${p.growerName} / ${p.farmName} / ${p.fieldName}`;
            }}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {option.properties.fieldName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {option.properties.programName}
                    {' - '}
                    {option.properties.growerName}
                    {' - '}
                    {option.properties.farmName}
                    {' - '}
                    {option.properties.season}
                  </Typography>
                </Stack>
              </Box>
            )}
            renderInput={(params) => (
              <PSATextField
                {...params}
                label="Select Field (Program / Grower / Farm / Field / Season)"
                placeholder="Type to search..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isFetching ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            select
            label="Select Map Type"
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
            fullWidth
          >
            {MAP_TYPES.map((type) => (<MenuItem value={type}>{type}</MenuItem>))}
          </TextField>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ border: '1px dashed grey', p: 3, borderRadius: 2 }}>
            <input id="file-input" type="file" hidden accept=".geojson,.json,.shp,.zip" onChange={handleFileChange} />
            <PSAButton buttonType="Back" title="Choose File" variant="contained" onClick={() => document.getElementById('file-input').click()} />
            <Typography variant="body1">
              {selectedFile ? selectedFile.name : 'No file selected'}
            </Typography>
          </Stack>

          {isUploading && (
          <Stack direction="row" alignItems="center" spacing={2}>
            <CircularProgress variant="determinate" value={uploadProgress} />
            <Typography>
              {uploadProgress}
              % Uploaded
            </Typography>
          </Stack>
          )}

          <PSAButton
            variant="contained"
            title={isUploading ? 'Uploading...' : 'Upload File'}
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !mapType || !selectedField}
            sx={{
              backgroundColor: '#60802D',
              '&:hover': {
                backgroundColor: '#60802D',
                textDecoration: 'underline',
              },
            }}
          />

        </Stack>
      </Grid>
    </Grid>
  );
};

export default UploadMap;
