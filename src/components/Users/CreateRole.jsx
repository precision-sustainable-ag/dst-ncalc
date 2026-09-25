import React, { useCallback, useEffect, useState } from 'react';
import {
  Stack, Typography, Box, Button, CircularProgress, Autocomplete,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { PSARadioButton, PSATextField } from 'shared-react-components/src';
import { privateApi } from '../../utils/apiClient';
import { handleError } from '../../utils/apiError';
import { set } from '../../store/redux-autosetters';

const SEASON_OPTIONS = [
  { label: 'Winter', value: 'winter' },
  { label: 'Summer', value: 'summer' },
];

const CROP_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Cover', value: 'cover' },
  { label: 'Both', value: 'both' },
];

const SEASON_COUNT_OPTIONS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
];

const CreateRole = ({ onRoleCreated = () => {} }) => {
  const dispatch = useDispatch();

  const [programName, setProgramName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [seasonsPerEntry, setSeasonsPerEntry] = useState('');

  // Description in auth0 dashboard
  const [roleDescription, setRoleDescription] = useState('');

  // Single-season selections
  const [singleSeason, setSingleSeason] = useState('');
  const [singleCrops, setSingleCrops] = useState('');

  // Two-season selections
  const [winterCrops, setWinterCrops] = useState('');
  const [summerCrops, setSummerCrops] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Existing program configs, used to suggest program/group names.
  const [programGroups, setProgramGroups] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const fetchProgramGroups = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const response = await privateApi.get('program-config');
      setProgramGroups(response?.data?.data || []);
    } catch (err) {
      handleError(err, dispatch);
    } finally {
      setLoadingOptions(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProgramGroups();
  }, [fetchProgramGroups]);

  const programOptions = [...new Set(programGroups.map((pg) => pg.programName).filter(Boolean))];
  const groupOptions = [...new Set(
    programGroups
      .filter((pg) => !programName || pg.programName === programName)
      .map((pg) => pg.groupName)
      .filter(Boolean),
  )];

  // Convert a crop selection into the array format the API expects.
  // 'both' expands to both crop types.
  const cropsToArray = (value) => (value === 'both' ? ['cover', 'cash'] : [value]);

  const buildSeasons = () => {
    if (seasonsPerEntry === '1') {
      return { [singleSeason]: cropsToArray(singleCrops) };
    }
    if (seasonsPerEntry === '2') {
      return {
        winter: cropsToArray(winterCrops),
        summer: cropsToArray(summerCrops),
      };
    }
    return {};
  };

  const isValid = (() => {
    if (!programName.trim() || !groupName.trim() || !seasonsPerEntry) return false;
    if (seasonsPerEntry === '1') return Boolean(singleSeason && singleCrops);
    if (seasonsPerEntry === '2') return Boolean(winterCrops && summerCrops);
    return false;
  })();

  const resetForm = () => {
    setProgramName('');
    setGroupName('');
    setRoleDescription('');
    setSeasonsPerEntry('');
    setSingleSeason('');
    setSingleCrops('');
    setWinterCrops('');
    setSummerCrops('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const payload = {
      programName: programName.trim(),
      groupName: groupName.trim(),
      seasonsPerEntry: Number(seasonsPerEntry),
      seasons: buildSeasons(),
      roleDescription: roleDescription.trim(),
    };

    try {
      const response = await privateApi.post('program-config', payload);

      if (response.status === 201) {
        resetForm();
        fetchProgramGroups();
        onRoleCreated();

        dispatch(set.actionModal({
          open: true,
          type: 'success',
          title: 'Role Created',
          message: `Role with program name: "${payload.programName}" and group name: "${payload.groupName}" created successfully.`,
        }));
      }
    } catch (err) {
      handleError(err, dispatch, '', 'Failed to create role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing="1.5rem" sx={{ width: '100%', maxWidth: '600px', alignSelf: 'center' }}>
      <Typography variant="h5" align="center" color="primary" gutterBottom>
        Create a New Role
      </Typography>

      <Autocomplete
        freeSolo
        loading={loadingOptions}
        options={programOptions}
        value={programName}
        onChange={(e, val) => setProgramName(val || '')}
        onInputChange={(e, val) => setProgramName(val)}
        renderInput={(params) => (
          <PSATextField {...params} label="Program Name" required fullWidth />
        )}
      />

      <Autocomplete
        freeSolo
        loading={loadingOptions}
        options={groupOptions}
        value={groupName}
        onChange={(e, val) => setGroupName(val || '')}
        onInputChange={(e, val) => setGroupName(val)}
        renderInput={(params) => (
          <PSATextField {...params} label="Group Name" required fullWidth />
        )}
      />

      <PSATextField
        label="Role Description"
        value={roleDescription}
        onChange={(e) => setRoleDescription(e.target.value)}
        multiline
        minRows={1}
        fullWidth
      />

      <Stack spacing={1}>
        <Typography variant="inputLabel">Seasons per entry</Typography>
        <PSARadioButton
          options={SEASON_COUNT_OPTIONS}
          selectedValue={seasonsPerEntry}
          onChange={setSeasonsPerEntry}
          row
        />
      </Stack>

      {seasonsPerEntry === '1' && (
        <>
          <Stack spacing={1}>
            <Typography variant="inputLabel">Which season?</Typography>
            <PSARadioButton
              options={SEASON_OPTIONS}
              selectedValue={singleSeason}
              onChange={setSingleSeason}
              row
            />
          </Stack>
          {singleSeason && (
            <Stack spacing={1}>
              <Typography variant="inputLabel">
                Crop types for
                {' '}
                {singleSeason}
                {' '}
                season
              </Typography>
              <PSARadioButton
                options={CROP_OPTIONS}
                selectedValue={singleCrops}
                onChange={setSingleCrops}
                row
              />
            </Stack>
          )}
        </>
      )}

      {seasonsPerEntry === '2' && (
        <>
          <Stack spacing={1}>
            <Typography variant="inputLabel">Crop types for winter season</Typography>
            <PSARadioButton
              options={CROP_OPTIONS}
              selectedValue={winterCrops}
              onChange={setWinterCrops}
              row
            />
          </Stack>
          <Stack spacing={1}>
            <Typography variant="inputLabel">Crop types for summer season</Typography>
            <PSARadioButton
              options={CROP_OPTIONS}
              selectedValue={summerCrops}
              onChange={setSummerCrops}
              row
            />
          </Stack>
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {submitting ? 'Creating...' : 'Create Role'}
        </Button>
      </Box>
    </Stack>
  );
};

export default CreateRole;
