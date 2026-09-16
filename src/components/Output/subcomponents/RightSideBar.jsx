/* eslint-disable no-console */
import React from 'react';
import { Box, Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NitrogenCard from './NitrogenWidget';
import ResidueCard from './ResidueWidget';
// import BiomassMapWidget from './BiomassMapWidget';
import { SummaryCard } from './SummaryWidget';
import NitrogenMapWidget from './NitrogenMapWidget';
import { get, set } from '../../../store/redux-autosetters';
import NavigateBar from '../../../shared/Navigate';

/// /// /// STYLES /// /// ///
const wrapperStyles = {
  maxWidth: {
    sm: '75%', md: '75%', lg: '80%', xl: '90%',
  },
  padding: '0 1rem',
};

/// /// /// ROOT COMPONENT /// /// ///
const RightSideBar = ({ summaryData, refs }) => {
  /// /// /// VARIABLES /// /// ///
  // if (!model) return <Loading />;
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const isPM3DMode = useSelector(get.biomassCalcMode) === 'pm3d';
  const model = useSelector(get.model);
  const isRCPPReportOnly = useSelector(get.isRCPPReportOnly);
  useSelector(get.screen); // force render
  useSelector(get.biomassTaskResults); // force render
  useSelector(get.nitrogenTaskResults); // force render

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /// /// RETURN JSX /// ///
  return (
    <Box sx={wrapperStyles} flex={4} justifyContent="center">
      <Grid container spacing={3}>
        <Grid item sm={12} width="100%" mt="1rem">
          <SummaryCard refVal={refs[0]} data={summaryData} />
        </Grid>
        {!isPM3DMode && (
        <Grid item sm={12} lg={6} width="100%">
          <NitrogenCard refVal={refs[1]} />
        </Grid>
        )}
        {!isPM3DMode && (
        <Grid item sm={12} lg={6} width="100%">
          <ResidueCard refVal={refs[2]} />
        </Grid>
        )}
        {/* {(isSatelliteMode || isPM3DMode) && (
          <Grid item sm={12} lg={12} width="100%">
            <BiomassMapWidget refVal={refs[3]} />
          </Grid>
        )} */}
        {(isSatelliteMode || isPM3DMode) && (
          <Grid item sm={12} lg={12} width="100%">
            <NitrogenMapWidget refVal={refs[4]} />
          </Grid>
        )}
        <Grid item sm={12} lg={12} width="100%">
          <NavigateBar
            next="ADVANCED"
            nextOnClick={() => { navigate('/advanced'); }}
            nextDisabled={!model || !model.s}
            back="back"
            backOnClick={() => {
              if (isPM3DMode || isSatelliteMode) {
                if (isPM3DMode && isRCPPReportOnly) {
                  dispatch(set.activeStep(4));
                  navigate('/covercrop');
                } else {
                  dispatch(set.activeStep(6));
                  navigate('/targetrate');
                }
              } else {
                dispatch(set.activeStep(5));
                navigate('/cashcrop');
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RightSideBar;
