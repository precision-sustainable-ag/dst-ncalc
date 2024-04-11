/* eslint-disable arrow-body-style */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useRef } from 'react';
import {
  Card,
  // CardActions,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { get } from '../../../store/redux-autosetters';
import Location from '../../../shared/Location';

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
  width: '100%',
  // padding: '0',
};

// const dividerStyles = {
//   height: '2px',
//   backgroundColor: 'rgba(20,20,20,0.4)',
//   borderRadius: '5px',
//   width: '100%',
// };

/// /// /// RETURN JSX /// /// ///
const LocationCard = ({ refVal }) => {
  /// /// /// VARIABLES /// /// ///
  // const dispatch = useDispatch();
  // const doIncorporated = false;
  // const N = useSelector(get.N);
  // const cashCropPlantingDate = useSelector(get.cashCropPlantingDate);
  // const biomass = useSelector(get.biomass);
  // const unit = useSelector(get.unit);
  // const cashCrop = useSelector(get.cashCrop);
  // const outputN = useSelector(get.outputN);
  // const nweeks = useSelector(get.nweeks);
  // const targetN = useSelector(get.targetN);
  // const mockup = useSelector(get.mockup);
  // const chartRef1 = useRef(null);
  // const chartRef2 = useRef(null);

  // /// /// HOOKS /// ///
  return (
    <Card sx={CardStyles} elevation={8} ref={refVal}>
      <CardContent sx={cardContentStyles}>
        <Stack gap={2}>
          <Typography
            sx={{ fontSize: 22 }}
            color="text.secondary"
            textAlign="center"
            gutterBottom
          >
            Field Location
          </Typography>
        </Stack>
        <Location barebone />
      </CardContent>
    </Card>
  );
};
export default LocationCard;
