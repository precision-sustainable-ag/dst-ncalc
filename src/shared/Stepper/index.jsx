import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, useMediaQuery } from '@mui/material';
import { PSAStepper } from 'shared-react-components/src';
import { get, set } from '../../store/Store';

const tabs = ['home', 'location', 'soil', 'covercrop', 'cashcrop', 'output'];
const titles = ['Home', 'Location', 'Soil', 'Cover Crop', 'Cash Crop', 'Output'];

const NcalcStepper = () => {
  const matchesMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const step = useSelector(get.activeStep);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClickStep = (index) => {
    dispatch(set.activeStep(index));
    navigate(`/${tabs[index]}`);
  };

  // navigate to front page when refresh page
  useEffect(() => {
    const tabLocation = `/${tabs[step]}`;
    if (!location.pathname.includes(tabLocation)) navigate('/home');
  }, []);

  return (
    <Box sx={{ p: matchesMd ? 0 : '1rem' }}>
      <PSAStepper
        steps={titles}
        onStepClick={handleClickStep}
        strokeColor="white"
        stepperProps={{ activeStep: step }}
        mobile={matchesMd}
        // TODO: add disable next logic
        nextButtonDisabled={step === tabs.length - 1}
      />
    </Box>
  );
};

export default NcalcStepper;
