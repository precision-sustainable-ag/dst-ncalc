import React from 'react';
import { Box, Step, StepButton, Stepper, styled, Typography } from '@mui/material';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { get, set } from '../../store/Store';

const tabs = ['home', 'location', 'soil', 'covercrop', 'cashcrop', 'output'];
const titles = ['Home', 'Location', 'Soil', 'Cover Crop', 'Cash Crop', 'Output'];

const StepLight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="43" height="43" viewBox="0 0 43 43" fill="none">
    <circle cx="21.4318" cy="21.4318" r="17.9318" fill="#AAAAAA" stroke="#F5F5F5" strokeWidth="7" />
  </svg>
);

const StepDark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="43" height="43" viewBox="0 0 43 43" fill="none">
    <circle cx="21.5001" cy="21.4318" r="17.9318" fill="#363636" stroke="#F5F5F5" strokeWidth="7" />
  </svg>
);

const StepActive = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="none">
    <circle cx="21" cy="21" r="20" fill="#334A03" stroke="#F5F5F5" strokeWidth="17" />
    <circle cx="21" cy="21" r="19" stroke="#334A03" strokeWidth="3" />
  </svg>
);

const CustomStepConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 20,
    left: 'calc(-50% + 24px)',
    right: 'calc(50% + 24px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#363636',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: '#363636',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#AAA',
  },
}));

const NcalcStepper = () => {
  const step = useSelector(get.activeStep);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClickStep = (stepName, index) => {
    dispatch(set.activeStep(index));
    navigate(`/${stepName}`);
  };

  const getStepIcon = (currStep, activeStep) => {
    if (activeStep < currStep) return <StepLight />;
    if (activeStep > currStep) return <StepDark />;
    return <StepActive />;
  };

  return (
    <Box p="1rem" sx={{ backgroundColor: '#F5F5F5', opacity: 0.9 }}>
      <Stepper activeStep={step} alternativeLabel nonLinear connector={<CustomStepConnector />}>
        {tabs.map((tab, i) => (
          <Step key={i} completed={i < step}>
            <StepButton onClick={() => handleClickStep(tab, i)} icon={getStepIcon(i, step)} sx={{ '.MuiStepLabel-label': { marginTop: 0 } }}>
              <Typography
                fontFamily="IBM Plex Sans"
                color="additional.greydark"
                sx={
                  step === i && {
                    color: 'main.text',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    textDecorationThickness: '1.5px',
                    textUnderlinePosition: 'from-font',
                  }
                }
              >
                {titles[i]}
              </Typography>
            </StepButton>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default NcalcStepper;
