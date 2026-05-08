/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PSAButton, PSATextField } from 'shared-react-components/src';
import shpjs from 'shpjs';
import { useDispatch, useSelector } from 'react-redux';
import { isValidGeoJSON } from '../../utils/geojsonUtils';
import { azureSASToken, containerName, storageAccountName } from '../../utils/keys';
import FieldDropdown from '../../shared/FieldDropdown/FieldDropdown';
import { get, set } from '../../store/redux-autosetters';
import { handleError } from '../../utils/apiError';

const MAP_TYPES = ['Spray Map', 'Yield Map'];

const UploadMap = () => {
  const { isAuthenticated } = useAuth0();

  const dispatch = useDispatch();
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [existingMapTypes, setExistingMapTypes] = useState(new Set());
  const [checkingMapTypes, setCheckingMapTypes] = useState(false);

  const selectedField = useSelector(get.selectedField);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [mapType, setMapType] = useState(MAP_TYPES[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setSelectedSeason(null);
  }, [selectedField]);

  useEffect(() => {
    const checkExistingMaps = async () => {
      setExistingMapTypes(new Set());

      if (!selectedField || !selectedSeason || !isAuthenticated) return;

      try {
        setCheckingMapTypes(true);
        const blobServiceClient = new BlobServiceClient(
          `https://${storageAccountName}.blob.core.windows.net?${azureSASToken}`,
        );
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const {
          programName, groupName, growerName, farmName, fieldName,
        } = selectedField.properties;

        const folderName = `${programName}_${groupName}_${growerName}_${farmName}_${fieldName}_${selectedSeason}`;
        const safeFolderName = folderName.replace(/\s+/g, '_');

        const foundTypes = new Set();

        // We append '/' to ensure we look inside the directory
        const iterator = containerClient.listBlobsFlat({ prefix: `${safeFolderName}/` });

        // eslint-disable-next-line no-restricted-syntax
        for await (const blob of iterator) {
          const fileName = blob.name.split('/').pop();

          if (fileName.startsWith('Spray_Map')) {
            foundTypes.add('Spray Map');
          } else if (fileName.startsWith('Yield_Map')) {
            foundTypes.add('Yield Map');
          }
        }

        setExistingMapTypes(foundTypes);
      } catch (error) {
        handleError(error, dispatch, 'Error checking existing maps');
      } finally {
        setCheckingMapTypes(false);
      }
    };

    checkExistingMaps();
  }, [selectedField, selectedSeason, isAuthenticated, dispatch]);

  const handleUpload = async () => {
    if (!selectedFile || !selectedField || !selectedSeason) {
      handleError(null, dispatch, 'Please select a field and a valid file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Backend upload logic
    // try {
    //   const token = await getAccessTokenSilently();

    //   // Create FormData object
    //   const formData = new FormData();
    //   formData.append('file', selectedFile);

    //   // Append metadata
    //   const {
    //     programName, growerName, farmName, fieldName, season,
    //   } = selectedField.properties;

    //   formData.append('programName', programName);
    //   formData.append('growerName', growerName);
    //   formData.append('farmName', farmName);
    //   formData.append('fieldName', fieldName);
    //   formData.append('season', season);
    //   formData.append('mapType', mapType);

    //   await axios.post(`${API_BASE_URL}/upload-map`, formData, {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       'Content-Type': 'multipart/form-data',
    //     },
    //     onUploadProgress: (progressEvent) => {
    //       const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //       setUploadProgress(percentCompleted);
    //     },
    //   });

    //   alert('File uploaded successfully!');

    //   // Reset UI
    //   setSelectedFile(null);
    //   setUploadProgress(0);
    //   setSelectedField(null);
    //   setMapType(MAP_TYPES[0]);
    //   setFilterProgram(null);
    //   setFilterGrower(null);
    // } catch (error) {
    //   const msg = error.response?.data?.error || 'Upload failed';
    //   alert(`Error: ${msg}`);
    // } finally {
    //   setIsUploading(false);
    // }

    try {
      // Create Azure Blob Service Client
      const blobServiceClient = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net?${azureSASToken}`,
      );

      // Get Container Client
      const containerClient = blobServiceClient.getContainerClient(containerName);

      const {
        programName, groupName, growerName, farmName, fieldName,
      } = selectedField.properties;

      /**
       * Construct Folder/File Path
       * Folder format: groupName_growerName_farmName_fieldName_seaspn
       * File format: mapType_filename
       * Example: NIFA_Midwest_Ohio_Field_A_Spring_2025/Yield_Map_data.zip
       */
      const folderName = `${programName}_${groupName}_${growerName}_${farmName}_${fieldName}_${selectedSeason}`;
      const cleanFileName = selectedFile.name.replace(/\s+/g, '_');
      const blobName = `${folderName.replace(/\s+/g, '_')}/${mapType.replace(/\s+/g, '_')}_${cleanFileName}`;

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(selectedFile, {
        onProgress: (progress) => {
          const percent = Math.round((progress.loadedBytes / selectedFile.size) * 100);
          setUploadProgress(percent);
        },
        blobHTTPHeaders: { blobContentType: selectedFile.type },
      });

      handleError(null, dispatch, `File uploaded successfully to folder: ${folderName}`);

      // Reset file input
      setSelectedFile(null);
      setUploadProgress(0);
      dispatch(set.selectedField(null));
      setMapType(MAP_TYPES[0]);
    } catch (error) {
      handleError(error, dispatch, 'Unknown error occurred');
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
            handleError(null, dispatch, 'Invalid GeoJSON. Please try again with a different file.');
          }
        } catch (err) {
          handleError(err, dispatch, 'Error parsing GeoJSON file');
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
            handleError(null, dispatch, 'Invalid GeoJSON. Please try again with a different file.');
          }
        } catch (err) {
          handleError(err, dispatch, 'Error parsing Shapefile. Please ensure it is a valid .zip containing .shp, .shx, and .dbf files.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      handleError(null, dispatch, 'Unsupported file type. Please upload .geojson or .shp');
    }
  };

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

          <FieldDropdown />

          {selectedField && (
          <Autocomplete
            options={selectedField.properties.season || []}
            value={selectedSeason}
            onChange={(event, newValue) => setSelectedSeason(newValue)}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <PSATextField
                {...params}
                label="Select Season"
                placeholder="Choose a season..."
              />
            )}
          />
          )}

          <TextField
            select
            label="Select Map Type"
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
            fullWidth
            disabled={!selectedField || !selectedSeason || checkingMapTypes}
            helperText={checkingMapTypes ? 'Checking existing maps...' : ''}
          >
            {MAP_TYPES.map((type) => {
              const exists = existingMapTypes.has(type);

              return (
                <MenuItem key={type} value={type}>
                  <Stack direction="row" alignItems="center" width="100%">
                    <ListItemText primary={type} />
                    {exists && (
                    <ListItemIcon sx={{ minWidth: 'auto', ml: 2 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    )}
                  </Stack>
                </MenuItem>
              );
            })}
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
