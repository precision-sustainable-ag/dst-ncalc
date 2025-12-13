/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { BlobServiceClient } from '@azure/storage-blob';
import {
  Autocomplete,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  MenuItem,
  TextField,
  Box,
  useMediaQuery,
} from '@mui/material';
import { PSATextField } from 'shared-react-components/src';
import axios from 'axios';
import shpjs from 'shpjs';
import { azureSASToken, containerName, storageAccountName } from '../../utils/keys';
import { isValidGeoJSON } from '../../utils/geojsonUtils';

const API_BASE_URL = 'http://localhost:80/api/v1';
const MAP_TYPES = ['Spray Map', 'Yield Map'];
const ROLES = ['NIFA-Soy', 'Willard', 'GROW'];

const UploadMap = () => {
  const {
    user, isAuthenticated, isLoading, getAccessTokenSilently,
  } = useAuth0();

  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [fieldOptions, setFieldOptions] = useState([]);
  const [isFetching, setIsFetching] = useState(null);

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
  const handleUpload = async () => {
    if (!selectedFile || !selectedField) {
      alert('Please select a field and a valid file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create Azure Blob Service Client
      const blobServiceClient = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net?${azureSASToken}`,
      );

      // Get Container Client
      const containerClient = blobServiceClient.getContainerClient(containerName);

      const {
        programName, growerName, farmName, fieldName,
      } = selectedField.properties;

      /**
       * Construct Folder/File Path
       * Folder format: programName_growerName_farmName_fieldName
       * File format: mapType_filename
       * Example: NIFA_Midwest_Ohio_FieldA/Yield_Map_data.zip
       */
      const folderName = `${programName}_${growerName}_${farmName}_${fieldName}`;
      const cleanFileName = selectedFile.name.replace(/\s+/g, '_');
      const blobName = `${folderName}/${mapType.replace(/\s+/g, '_')}_${cleanFileName}`;

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(selectedFile, {
        onProgress: (progress) => {
          const percent = Math.round((progress.loadedBytes / selectedFile.size) * 100);
          setUploadProgress(percent);
        },
        blobHTTPHeaders: { blobContentType: selectedFile.type },
      });

      alert(`File uploaded successfully to folder: ${folderName}`);

      // Reset file input
      setSelectedFile(null);
      setUploadProgress(0);
      setSelectedField(null);
      setMapType(MAP_TYPES[0]);
    } catch (error) {
      alert(`Upload failed: ${error.message || 'Unknown error occurred'}`);
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
        {isAllowed ? (
          <Stack spacing="1.5em">
            <Typography variant="h4" align="center" gutterBottom>
              Upload Field Maps
            </Typography>

            <Typography variant="body1" color="textSecondary">
              Select the field details below to ensure the file is saved in the correct folder.
            </Typography>

            <Autocomplete
              loading={isFetching}
              loadingText="Loading fields..."
              options={fieldOptions}
              value={selectedField}
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
                    </Typography>
                  </Stack>
                </Box>
              )}
              renderInput={(params) => (
                <PSATextField
                  {...params}
                  label="Select Field (Program / Grower / Farm / Field)"
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
              <Button variant="contained" component="label">
                Choose File
                <input type="file" hidden accept=".geojson,.json,.shp,.zip" onChange={handleFileChange} />
              </Button>
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

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || !mapType || !selectedField}
            >
              {isUploading ? 'Uploading...' : 'Upload to Azure'}
            </Button>

          </Stack>
        )
          : 'Access denied'}
      </Grid>
    </Grid>
  );
};

export default UploadMap;
