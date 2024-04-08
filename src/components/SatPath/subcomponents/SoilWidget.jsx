/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import React from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Stack,
  Typography,
  Tooltip,
  styled,
  Box,
} from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import Soil from '../../Soil';
// import { useSelector } from 'react-redux';
// import { get } from '../../../store/redux-autosetters';

/// /// /// STYLES /// /// ///
const CardStyles = {
  borderRadius: 5,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
};

const cardContentStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

/// /// /// COMPONENTS /// /// ///
/// /// /// RETURN JSX /// /// ///
const SoilCard = ({ refVal }) => {
  return (
    <Card sx={CardStyles} elevation={8} ref={refVal}>
      <CardContent sx={cardContentStyles}>
        <Typography
          sx={{ fontSize: 22 }}
          color="text.secondary"
          gutterBottom
          textAlign="center"
        >
          Soil Data
        </Typography>
      </CardContent>
      <CardActions>
        <Grid container spacing={2}>
          <Soil barebone />
        </Grid>
      </CardActions>
    </Card>
  );
};

export default SoilCard;
