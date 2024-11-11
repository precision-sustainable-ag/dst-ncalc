import React, { useState } from 'react';
import { Box, Step, StepButton, Stepper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { get, set } from '../../store/Store';

const tabs = ['home', 'location', 'soil', 'covercrop', 'cashcrop', 'output'];

const NcalcStepper = () => {
  // const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  const step = useSelector(get.activeStep);
  console.log('step1', step);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClickStep = (stepName, index) => {
    // setStep(index);
    dispatch(set.activeStep(index));
    navigate(`/${stepName}`);
  };

  return (
    <Box p={'1rem'}>
      <Stepper activeStep={step} alternativeLabel nonLinear>
        {tabs.map((tab, i) => (
          <Step key={i}>
            <StepButton onClick={() => handleClickStep(tab, i)}>{tab}</StepButton>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default NcalcStepper;
