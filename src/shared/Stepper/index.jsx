import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, useMediaQuery } from '@mui/material';
import { PSAStepper } from 'shared-react-components/src';
import { get, set } from '../../store/Store';

/**
 *  Master configuration for all steps, mapping the display titles to their immutable global index.
 *  The 'activeStep' redux variable should be set to the corresponding 'step' value in the below array
 *  irrespective of their relative position among the pages visible for the active mode.
 *  */
const ALL_STEPS = [
  { id: 'home', title: 'Home', step: 0 },
  { id: 'upload', title: 'Upload', step: 1 },
  { id: 'location', title: 'Location', step: 2 },
  { id: 'soil', title: 'Soil', step: 3 },
  { id: 'covercrop', title: 'Cover Crop', step: 4 },
  { id: 'sidedress', title: 'Side Dress Date', step: 5 },
  { id: 'output', title: 'Output', step: 6 },
];

const NcalcStepper = () => {
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const currentGlobalStep = useSelector(get.activeStep);
  const biomassCalcMode = useSelector(get.biomassCalcMode);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Filter out the steps that are not needed
  const visibleSteps = useMemo(() => {
    const updatedSteps = ALL_STEPS.map((s) => {
      if (s.id === 'sidedress' && biomassCalcMode === 'sampled') {
        return { ...s, title: 'Cash Crop' };
      }
      return s;
    });

    if (biomassCalcMode === 'pm3d') {
      return updatedSteps.filter((s) => s.id !== 'location' && s.id !== 'soil');
    } if (biomassCalcMode === 'satellite') {
      return updatedSteps.filter((s) => s.id !== 'upload' && s.id !== 'soil');
    } if (biomassCalcMode === 'sampled') {
      return updatedSteps.filter((s) => s.id !== 'upload');
    }
    return updatedSteps;
  }, [biomassCalcMode]);

  const titles = visibleSteps.map((s) => s.title);

  // Calculate index of current step in the visibleSteps array
  const visualStepIndex = useMemo(() => {
    const index = visibleSteps.findIndex((s) => s.step === currentGlobalStep);
    return index !== -1 ? index : 0;
  }, [currentGlobalStep, visibleSteps]);

  // Handler for when user clicks on a step directly on the stepper
  const handleClickStep = (visualIndex) => {
    const targetStep = visibleSteps[visualIndex];

    dispatch(set.activeStep(targetStep.step));
    navigate(`/${targetStep.id}`);
  };

  // Sync URL to current step. If mismatch, redirects to home page
  useEffect(() => {
    const currentStepConfig = ALL_STEPS.find((s) => s.step === currentGlobalStep);
    if (currentStepConfig) {
      const tabLocation = `/${currentStepConfig.id}`;
      if (!location.pathname.includes(tabLocation)) navigate('/home');
    }
  }, []);

  return (
    <Box sx={{ p: matchesMd ? 0 : '1rem' }}>
      <PSAStepper
        steps={titles}
        onStepClick={handleClickStep}
        strokeColor="white"
        stepperProps={{ activeStep: visualStepIndex }}
        mobile={matchesMd}
        // TODO: add disable next logic
        nextButtonDisabled={visualStepIndex === visibleSteps.length - 1}
      />
    </Box>
  );
};

export default NcalcStepper;
