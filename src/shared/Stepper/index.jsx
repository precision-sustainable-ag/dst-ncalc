import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PSAStepper } from 'shared-react-components/src';
import { get, set } from '../../store/Store';

const tabs = ['home', 'location', 'soil', 'covercrop', 'cashcrop', 'output'];
const titles = ['Home', 'Location', 'Soil', 'Cover Crop', 'Cash Crop', 'Output'];

const NcalcStepper = () => {

  const step = useSelector(get.activeStep);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleClickStep = (stepName, index) => {
    dispatch(set.activeStep(index));
    navigate(`/${tabs[index]}`);
  };

  return (

    <PSAStepper 
      steps = { titles }
      onStepClick = { handleClickStep }
      strokeColor = "white"
      stepperProps={{ activeStep: step }}
    />

  );
};

export default NcalcStepper;
