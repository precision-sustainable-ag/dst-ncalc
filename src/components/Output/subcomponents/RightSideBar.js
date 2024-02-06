/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import NitrogenCard from './NitrogenWidget';
import ResidueCard from './ResidueWidget';
import MapVisCard from './MapVisWidget';
import { SummaryCard } from './SummaryWidget';
import { get } from '../../../store/redux-autosetters';
import NavigateButtons from '../../../shared/Navigate';

/// /// /// STYLES /// /// ///
const wrapperStyles = {
  width: '80%',
  padding: 5,
};

/// /// /// ROOT COMPONENT /// /// ///
const RightSideBar = ({ summaryData, refs }) => {
  /// /// /// VARIABLES /// /// ///
  // if (!model) return <Loading />;
  const [updated, setUpdated] = useState(false);
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';
  const biomass = useSelector(get.biomassTotalValue);

  /// /// Effects /// ///
  useEffect(() => {
    setUpdated(!updated);
  }, [biomass]);

  /// /// RETURN JSX /// ///
  return (
    <Box sx={wrapperStyles} flex={4} justifyContent="center">
      <Grid container spacing={5}>
        <Grid item sm={12} width="100%">
          <SummaryCard refVal={refs[0]} data={summaryData} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <NitrogenCard refVal={refs[1]} />
        </Grid>
        <Grid item sm={12} lg={6} width="100%">
          <ResidueCard refVal={refs[2]} />
        </Grid>
        {isSatelliteMode && (
          <Grid item sm={12} lg={12} width="100%">
            <MapVisCard refVal={refs[3]} />
          </Grid>
        )}
        <Grid item sm={12} lg={12} width="100%">
          <NavigateButtons
            backRoute="/cashcrop"
            nextRoute="/advanced"
            backText="BACK"
            nextText="ADVANCED"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RightSideBar;
