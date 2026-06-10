import React, {
  useEffect, useMemo, useState,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Autocomplete,
  Box, CircularProgress, Grid, Stack, Typography,
} from '@mui/material';
import { PSATextField } from 'shared-react-components/src';
import { get, set } from '../../store/Store';
import { privateApi } from '../../utils/apiClient';
import { handleError } from '../../utils/apiError';

const FieldDropdown = () => {
  const { isAuthenticated } = useAuth0();

  const dispatch = useDispatch();
  const [fieldOptions, setFieldOptions] = useState([]);
  const [isFetching, setIsFetching] = useState(null);
  const [filterGroup, setFilterGroup] = useState(null);
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

  const uniqueGroups = useMemo(() => {
    const groups = fieldOptions.map((f) => f.properties.groupName);
    return getUniqueCaseInsensitive(groups);
  }, [fieldOptions]);

  const uniqueGrowers = useMemo(() => {
    let filtered = fieldOptions;
    if (filterGroup) {
      filtered = filtered.filter((f) => f.properties.groupName?.toLowerCase() === filterGroup.toLowerCase());
    }
    const growers = filtered.map((f) => f.properties.growerName);
    return getUniqueCaseInsensitive(growers);
  }, [fieldOptions, filterGroup]);

  const filteredFieldList = useMemo(() => fieldOptions.filter((f) => {
    const grpName = f.properties.groupName;
    const grwName = f.properties.growerName;

    const matchGroup = !filterGroup || (grpName && grpName.toLowerCase() === filterGroup.toLowerCase());
    const matchGrower = !filterGrower || (grwName && grwName.toLowerCase() === filterGrower.toLowerCase());

    return matchGroup && matchGrower;
  }), [fieldOptions, filterGroup, filterGrower]);

  const handleGroupFilterChange = (newVal) => {
    setFilterGroup(newVal);
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
        const response = await privateApi.get('/fields-identifiers');
        setFieldOptions(response.data);
      } catch (e) {
        handleError(e, dispatch);
      } finally {
        setIsFetching(false);
      }
    };

    if (isAuthenticated) {
      fetchFields();
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Grid container>
        <Grid item xs={12} md={6} sx={{ pr: { md: 1 }, pb: { xs: 2 } }}>
          <Autocomplete
            options={uniqueGroups}
            value={filterGroup}
            getOptionLabel={(option) => {
              const p = option;
              return p !== option ? `${p} - ${option}` : `${p}`;
            }}
            onChange={(e, val) => handleGroupFilterChange(val)}
            renderInput={(params) => <PSATextField {...params} label="Filter by Program" />}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ pl: { md: 1 } }}>
          <Autocomplete
            options={uniqueGrowers}
            value={filterGrower}
            onChange={(e, val) => handleGrowerFilterChange(val)}
            disabled={!filterGroup && uniqueGrowers.length > 50}
            renderInput={(params) => <PSATextField {...params} label="Filter by Grower" />}
          />
        </Grid>
      </Grid>

      <Autocomplete
        loading={isFetching}
        loadingText="Loading fields..."
        options={filteredFieldList}
        value={selectedField}
        key={`${filterGroup}-${filterGrower}`}
        onChange={(event, newValue) => {
          dispatch(set.selectedField(newValue));
        }}
        getOptionLabel={(option) => {
          const p = option.properties;
          return `${p.programName} / ${p.groupName} / ${p.growerName} / ${p.farmName} / ${p.fieldName}`;
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
                {option.properties.groupName}
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
            label="Select Field (Program / Group / Grower / Farm / Field)"
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
