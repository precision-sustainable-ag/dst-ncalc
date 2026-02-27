/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect, useMemo, useState,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Autocomplete,
  Box, CircularProgress, Grid, Stack, Typography,
} from '@mui/material';
import axios from 'axios';
import { PSATextField } from 'shared-react-components/src';
import { get, set } from '../../store/Store';
import { ncalcApiUrl } from '../../utils/keys';

const API_BASE_URL = ncalcApiUrl;

const FieldDropdown = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const dispatch = useDispatch();
  const [fieldOptions, setFieldOptions] = useState([]);
  const [isFetching, setIsFetching] = useState(null);
  const [filterProgram, setFilterProgram] = useState(null);
  const [filterGrower, setFilterGrower] = useState(null);
  const selectedField = useSelector(get.selectedField);

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
    dispatch(set.selectedField(null));
  };

  const handleGrowerFilterChange = (newVal) => {
    setFilterGrower(newVal);
    dispatch(set.selectedField(null));
  };

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
      } catch (e) {
        // console.error('Failed to load options', e);
      } finally {
        setIsFetching(false);
      }
    };

    if (isAuthenticated) {
      fetchFields();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <>
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

      <Autocomplete
        loading={isFetching}
        loadingText="Loading fields..."
        options={filteredFieldList}
        value={selectedField}
        key={`${filterProgram}-${filterGrower}`}
        onChange={(event, newValue) => {
          dispatch(set.selectedField(newValue));
        }}
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
    </>
  );
};

export default FieldDropdown;
