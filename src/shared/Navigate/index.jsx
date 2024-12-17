import { Box, Paper } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavButton from './NavButton';
import { useDispatch } from 'react-redux';
import { set } from '../../store/redux-autosetters';

const NavigateBar = ({ backRoute, nextRoute, backText = 'BACK', nextText = 'NEXT' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <Paper
      sx={{
        justifyContent: 'space-around',
        alignItems: 'space-between',
        width: '100%',
        padding: '1rem',
      }}
    >
      <Box
        sx={{
          justifyContent: 'space-around',
          alignItems: 'space-between',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <NavButton
          onClick={() => {
            // FIXME: this is a temporary onClick
            // this component should be investigated about its usage, currently it's only used in the output page
            dispatch(set.activeStep(4));
            navigate(backRoute);
          }}
        >
          {backText}
        </NavButton>
        <NavButton onClick={() => navigate(nextRoute)}>{nextText}</NavButton>
      </Box>
    </Paper>
  );
};
export default NavigateBar;
