/* eslint-disable no-nested-ternary */
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';

import { get } from '../../store/Store';
import Myslider from '../../shared/Slider';
import Help from '../../shared/Help';

// const ssurgo = [
//   {
//     "lat": "39.0208",
//     "lon": "-76.9144",
//     "lkey": "10960",
//     "mukey": "2455277",
//     "cokey": "23404117",
//     "chkey": "69371313",
//     "chtgkey": "140113416",
//     "areaacres": 319600,
//     "projectscale": 12000,
//     "musym": "CdD",
//     "muname": "Christiana-Downer-Urban land complex, 5 to 15 percent slopes",
//     "mukind": "Complex",
//     "muacres": 6980,
//     "farmlndcl": "Not prime farmland",
//     "iacornsr": null,
//     "comppct_l": null,
//     "comppct_r": 25,
//     "comppct_h": null,
//     "compname": "Downer",
//     "compkind": "Series",
//     "majcompflag": "Yes",
//     "slope_l": 5,
//     "slope_r": 10,
//     "slope_h": 15,
//     "slopelenusle_l": null,
//     "slopelenusle_r": null,
//     "slopelenusle_h": null,
//     "runoff": "Low",
//     "erocl": null,
//     "hydricrating": "No",
//     "hydricon": null,
//     "drainagecl": "Well drained",
//     "elev_l": 3,
//     "elev_r": 17,
//     "elev_h": 30,
//     "geomdesc": "interfluves, knolls, uplands",
//     "map_l": 1016,
//     "map_r": 1067,
//     "map_h": 1270,
//     "ffd_l": 180,
//     "ffd_r": 185,
//     "ffd_h": 210,
//     "frostact": "Low",
//     "hydgrp": "A",
//     "taxclname": "Coarse-loamy, siliceous, semiactive, mesic Typic Hapludults",
//     "taxorder": "Ultisols",
//     "taxsuborder": "Udults",
//     "taxgrtgroup": "Hapludults",
//     "taxsubgrp": "Typic Hapludults",
//     "taxpartsize": "coarse-loamy",
//     "taxpartsizemod": null,
//     "taxceactcl": "semiactive",
//     "taxreaction": "not used",
//     "taxtempcl": "mesic",
//     "taxmoistscl": null,
//     "taxtempregime": "mesic",
//     "soiltaxedition": "ninth edition",
//     "hzname": "Ap",
//     "desgndisc": null,
//     "desgnmaster": "A",
//     "desgnmasterprime": null,
//     "desgnvert": null,
//     "hzdept_l": null,
//     "hzdept_r": 0,
//     "hzdept_h": null,
//     "hzdepb_l": null,
//     "hzdepb_r": 30,
//     "hzdepb_h": null,
//     "hzthk_l": null,
//     "hzthk_r": 30,
//     "hzthk_h": null,
//     "fraggt10_l": 0,
//     "fraggt10_r": 0,
//     "fraggt10_h": 0,
//     "frag3to10_l": 0,
//     "frag3to10_r": 0,
//     "frag3to10_h": 7,
//     "sieveno4_l": 64,
//     "sieveno4_r": 100,
//     "sieveno4_h": 100,
//     "sieveno10_l": 61,
//     "sieveno10_r": 100,
//     "sieveno10_h": 100,
//     "sieveno40_l": 42,
//     "sieveno40_r": 82,
//     "sieveno40_h": 100,
//     "sieveno200_l": 9,
//     "sieveno200_r": 23,
//     "sieveno200_h": 41,
//     "sandtotal_l": 70,
//     "sandtotal_r": 84,
//     "sandtotal_h": 90,
//     "sandvc_l": 0.1,
//     "sandvc_r": 1,
//     "sandvc_h": 2,
//     "sandco_l": 0.5,
//     "sandco_r": 9,
//     "sandco_h": 15,
//     "sandmed_l": 10,
//     "sandmed_r": 32,
//     "sandmed_h": 60,
//     "sandfine_l": 10,
//     "sandfine_r": 30,
//     "sandfine_h": 45,
//     "sandvf_l": 0.5,
//     "sandvf_r": 12,
//     "sandvf_h": 40,
//     "silttotal_l": 0.5,
//     "silttotal_r": 10,
//     "silttotal_h": 29,
//     "siltco_l": 1,
//     "siltco_r": 5,
//     "siltco_h": 20,
//     "siltfine_l": 0.5,
//     "siltfine_r": 5,
//     "siltfine_h": 20,
//     "claytotal_l": 1,
//     "claytotal_r": 6,
//     "claytotal_h": 14,
//     "claysizedcarb_l": null,
//     "claysizedcarb_r": null,
//     "claysizedcarb_h": null,
//     "om_l": 1,
//     "om_r": 2,
//     "om_h": 3,
//     "dbtenthbar_r": null,
//     "dbtenthbar_h": null,
//     "dbthirdbar_l": 1.4,
//     "dbthirdbar_r": 1.55,
//     "dbthirdbar_h": 1.6,
//     "dbfifteenbar_l": null,
//     "dbfifteenbar_r": null,
//     "dbfifteenbar_h": null,
//     "dbovendry_l": 1.4,
//     "dbovendry_r": 1.62,
//     "dbovendry_h": 1.65,
//     "partdensity": null,
//     "ksat_l": 14,
//     "ksat_r": 28,
//     "ksat_h": 42,
//     "awc_l": 0.1,
//     "awc_r": 0.12,
//     "awc_h": 0.14,
//     "wtenthbar_l": null,
//     "wtenthbar_r": 22.1,
//     "wtenthbar_h": null,
//     "wthirdbar_l": null,
//     "wthirdbar_r": 16.9,
//     "wthirdbar_h": null,
//     "wfifteenbar_l": null,
//     "wfifteenbar_r": 7.2,
//     "wfifteenbar_h": null,
//     "wsatiated_l": null,
//     "wsatiated_r": 38,
//     "wsatiated_h": null,
//     "ll_l": 10,
//     "ll_r": 10,
//     "ll_h": 20,
//     "pi_l": 0,
//     "pi_r": 0,
//     "pi_h": 5,
//     "kwfact": ".10",
//     "kffact": ".10",
//     "caco3_l": 0,
//     "caco3_r": 0,
//     "caco3_h": 0,
//     "gypsum_l": 0,
//     "gypsum_r": 0,
//     "gypsum_h": 0,
//     "sar_l": 0,
//     "sar_r": 0,
//     "sar_h": 0,
//     "ec_l": 0,
//     "ec_r": 0,
//     "ec_h": 0,
//     "cec7_l": 2,
//     "cec7_r": 4.8,
//     "cec7_h": 7,
//     "ecec_l": 1,
//     "ecec_r": 2.4,
//     "ecec_h": 10,
//     "sumbases_l": 0.2,
//     "sumbases_r": 1,
//     "sumbases_h": 2.1,
//     "ph1to1h2o_l": 3.5,
//     "ph1to1h2o_r": 4.5,
//     "ph1to1h2o_h": 6.5,
//     "ph01mcacl2_l": 3,
//     "ph01mcacl2_r": 4.6,
//     "ph01mcacl2_h": 6,
//     "pbray1_l": null,
//     "pbray1_r": null,
//     "pbray1_h": null,
//     "poxalate_l": null,
//     "poxalate_r": null,
//     "poxalate_h": null,
//     "ph2osoluble_l": null,
//     "ph2osoluble_r": null,
//     "ph2osoluble_h": null,
//     "ptotal_l": null,
//     "ptotal_r": null,
//     "ptotal_h": null,
//     "texture": "LS",
//     "stratextsflag": "No ",
//     "rvindicator": "Yes",
//     "texdesc": "Loamy sand",
//     "texcl": "Loamy sand",
//     "pmgroupname": "loamy fluviomarine deposits",
//     "reskind": null,
//     "resdept_l": null,
//     "resdept_r": null,
//     "resdept_h": null,
//     "resdepb_l": null,
//     "resdepb_r": null,
//     "resdepb_h": null,
//     "resthk_l": null,
//     "resthk_r": null,
//     "resthk_h": null
//   },
//   {
//     "lat": "39.0208",
//     "lon": "-76.9144",
//     "lkey": "10960",
//     "mukey": "2455277",
//     "cokey": "23404121",
//     "chkey": "69371317",
//     "chtgkey": "140113422",
//     "areaacres": 319600,
//     "projectscale": 12000,
//     "musym": "CdD",
//     "muname": "Christiana-Downer-Urban land complex, 5 to 15 percent slopes",
//     "mukind": "Complex",
//     "muacres": 6980,
//     "farmlndcl": "Not prime farmland",
//     "iacornsr": null,
//     "comppct_l": null,
//     "comppct_r": 30,
//     "comppct_h": null,
//     "compname": "Christiana",
//     "compkind": "Series",
//     "majcompflag": "Yes",
//     "slope_l": 5,
//     "slope_r": 10,
//     "slope_h": 15,
//     "slopelenusle_l": null,
//     "slopelenusle_r": null,
//     "slopelenusle_h": null,
//     "runoff": "High",
//     "erocl": "Class 2",
//     "hydricrating": "No",
//     "hydricon": null,
//     "drainagecl": "Moderately well drained",
//     "elev_l": 3,
//     "elev_r": 40,
//     "elev_h": 120,
//     "geomdesc": "drainhead complexes, hillslopes, interfluves, swales, uplands",
//     "map_l": 1016,
//     "map_r": 1067,
//     "map_h": 1270,
//     "ffd_l": 180,
//     "ffd_r": 185,
//     "ffd_h": 210,
//     "frostact": "Moderate",
//     "hydgrp": "D",
//     "taxclname": "Fine, kaolinitic, mesic Aquic Hapludults",
//     "taxorder": "Ultisols",
//     "taxsuborder": "Udults",
//     "taxgrtgroup": "Hapludults",
//     "taxsubgrp": "Aquic Hapludults",
//     "taxpartsize": "fine",
//     "taxpartsizemod": null,
//     "taxceactcl": "not used",
//     "taxreaction": "not used",
//     "taxtempcl": "mesic",
//     "taxmoistscl": "Aquic",
//     "taxtempregime": "mesic",
//     "soiltaxedition": "tenth edition",
//     "hzname": "A",
//     "desgndisc": null,
//     "desgnmaster": "A",
//     "desgnmasterprime": null,
//     "desgnvert": null,
//     "hzdept_l": null,
//     "hzdept_r": 0,
//     "hzdept_h": null,
//     "hzdepb_l": null,
//     "hzdepb_r": 15,
//     "hzdepb_h": null,
//     "hzthk_l": null,
//     "hzthk_r": 15,
//     "hzthk_h": null,
//     "fraggt10_l": 0,
//     "fraggt10_r": 0,
//     "fraggt10_h": 0,
//     "frag3to10_l": 0,
//     "frag3to10_r": 0,
//     "frag3to10_h": 0,
//     "sieveno4_l": 79,
//     "sieveno4_r": 100,
//     "sieveno4_h": 100,
//     "sieveno10_l": 73,
//     "sieveno10_r": 100,
//     "sieveno10_h": 100,
//     "sieveno40_l": 65,
//     "sieveno40_r": 97,
//     "sieveno40_h": 100,
//     "sieveno200_l": 54,
//     "sieveno200_r": 82,
//     "sieveno200_h": 91,
//     "sandtotal_l": 10,
//     "sandtotal_r": 22,
//     "sandtotal_h": 45,
//     "sandvc_l": 0,
//     "sandvc_r": 0.3,
//     "sandvc_h": 2,
//     "sandco_l": 0,
//     "sandco_r": 1.3,
//     "sandco_h": 6,
//     "sandmed_l": 0.3,
//     "sandmed_r": 5.8,
//     "sandmed_h": 15.5,
//     "sandfine_l": 1.9,
//     "sandfine_r": 7.3,
//     "sandfine_h": 20,
//     "sandvf_l": 4,
//     "sandvf_r": 7.3,
//     "sandvf_h": 16.5,
//     "silttotal_l": 50,
//     "silttotal_r": 66,
//     "silttotal_h": 75,
//     "siltco_l": 2,
//     "siltco_r": 20.9,
//     "siltco_h": 30,
//     "siltfine_l": 10,
//     "siltfine_r": 45.1,
//     "siltfine_h": 60,
//     "claytotal_l": 5,
//     "claytotal_r": 12,
//     "claytotal_h": 20,
//     "claysizedcarb_l": null,
//     "claysizedcarb_r": null,
//     "claysizedcarb_h": null,
//     "om_l": 0.5,
//     "om_r": 2,
//     "om_h": 6,
//     "dbtenthbar_r": null,
//     "dbtenthbar_h": null,
//     "dbthirdbar_l": 0.85,
//     "dbthirdbar_r": 1.3,
//     "dbthirdbar_h": 1.55,
//     "dbfifteenbar_l": null,
//     "dbfifteenbar_r": null,
//     "dbfifteenbar_h": null,
//     "dbovendry_l": 1,
//     "dbovendry_r": 1.4,
//     "dbovendry_h": 1.65,
//     "partdensity": 2.65,
//     "ksat_l": 1.41,
//     "ksat_r": 7.76,
//     "ksat_h": 14.11,
//     "awc_l": 0.09,
//     "awc_r": 0.22,
//     "awc_h": 0.23,
//     "wtenthbar_l": null,
//     "wtenthbar_r": null,
//     "wtenthbar_h": null,
//     "wthirdbar_l": 19,
//     "wthirdbar_r": 26.3,
//     "wthirdbar_h": 40,
//     "wfifteenbar_l": 4,
//     "wfifteenbar_r": 12,
//     "wfifteenbar_h": 20,
//     "wsatiated_l": 32,
//     "wsatiated_r": 47,
//     "wsatiated_h": 64,
//     "ll_l": 10,
//     "ll_r": 20,
//     "ll_h": 25,
//     "pi_l": 0,
//     "pi_r": 5,
//     "pi_h": 10,
//     "kwfact": ".49",
//     "kffact": ".49",
//     "caco3_l": 0,
//     "caco3_r": 0,
//     "caco3_h": 0,
//     "gypsum_l": 0,
//     "gypsum_r": 0,
//     "gypsum_h": 0,
//     "sar_l": 0,
//     "sar_r": 0,
//     "sar_h": 0,
//     "ec_l": 0,
//     "ec_r": 0,
//     "ec_h": 2,
//     "cec7_l": 4,
//     "cec7_r": 27.9,
//     "cec7_h": 30,
//     "ecec_l": 2,
//     "ecec_r": 8.6,
//     "ecec_h": 13.5,
//     "sumbases_l": 8,
//     "sumbases_r": 10,
//     "sumbases_h": 40,
//     "ph1to1h2o_l": 3.8,
//     "ph1to1h2o_r": 4.3,
//     "ph1to1h2o_h": 5,
//     "ph01mcacl2_l": null,
//     "ph01mcacl2_r": 3.6,
//     "ph01mcacl2_h": null,
//     "pbray1_l": null,
//     "pbray1_r": null,
//     "pbray1_h": null,
//     "poxalate_l": null,
//     "poxalate_r": null,
//     "poxalate_h": null,
//     "ph2osoluble_l": null,
//     "ph2osoluble_r": null,
//     "ph2osoluble_h": null,
//     "ptotal_l": null,
//     "ptotal_r": null,
//     "ptotal_h": null,
//     "texture": "SIL",
//     "stratextsflag": "No ",
//     "rvindicator": "Yes",
//     "texdesc": "Silt loam",
//     "texcl": "Silt loam",
//     "pmgroupname": "clayey fluviomarine deposits",
//     "reskind": null,
//     "resdept_l": null,
//     "resdept_r": null,
//     "resdept_h": null,
//     "resdepb_l": null,
//     "resdepb_r": null,
//     "resdepb_h": null,
//     "resthk_l": null,
//     "resthk_r": null,
//     "resthk_h": null
//   }
// ]

const Soil = () => {
  const gotSSURGO = useSelector(get.gotSSURGO);
  const ssurgo = useSelector(get.SSURGO);
  const navigate = useNavigate();
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';

  console.log('gotSSURGO', gotSSURGO);
  console.log('ssurgo', ssurgo);

  return (
    <Box
      sx={{
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '1rem',
        flexDirection: 'column',
        width: {
          xs: '100%',
          sm: '90%',
          md: '80%',
          lg: '70%',
          xl: '60%',
        },
      }}
    >
      <Box p={3} pb={0}>
        <Typography variant="h4">Tell us about your Soil</Typography>
        {gotSSURGO
          ? (
            isSatelliteMode ? (
              <Box>
                <Typography variant="h6" my={2}>
                  This model will use the NRCS&apos;s Soil Survey
                  Geographic database (SSURGO) soil data from your field to estimate cover crop decompostition
                </Typography>
                <Stack direction="row" spacing={6}>
                  <Stack direction="column" spacing={3}>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        Organic Matter (%):
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        Bulk Density (g/cm
                        <sup>3</sup>
                        ):
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        Soil Inorganic N (ppm or mg/kg):
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="column" spacing={3}>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        {gotSSURGO && Object.keys(ssurgo).length > 0 && ssurgo[0].om_r}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        {gotSSURGO && Object.keys(ssurgo).length > 0 && ssurgo[0].dbthirdbar_r}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography variant="h6" my={2}>
                        {gotSSURGO && Object.keys(ssurgo).length > 0 && 10}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>

              </Box>
            ) : (
              <Box>
                <Typography variant="h6" my={2}>
                  The data below was pulled from NRCS&apos;s Soil Survey
                  Geographic database (SSURGO) based on your field&apos;s latitude/longitude coordinates.
                </Typography>
                <Typography variant="h6" my={2}>
                  You can adjust them if you have lab results.
                </Typography>
              </Box>
            )
          )
          : (
            <Typography variant="h6" my={6}>
              LOADING FROM SSURGO SERVER ...
            </Typography>
          )}

        {!isSatelliteMode && (
          <Box sx={{ color: '#4f6b14' }}>
            <Box my={5}>
              Organic Matter (%):
              <Help>
                Soil organic matter in the surface (0-10cm) soil
              </Help>
              <Myslider
                id="OM"
                min={0.1}
                max={5}
                step={0.1}
              />
            </Box>
            <Box my={5}>
              Bulk Density (g/cm
              <sup>3</sup>
              ):
              <Help>
                Soil bulk density in the surface (0-10cm) soil
              </Help>
              <Myslider
                id="BD"
                min={0.8}
                max={1.8}
                step={0.1}
              />
            </Box>
            <Box my={5}>
              Soil Inorganic N (ppm or mg/kg):
              <Help>
                Soil inorganic nitrogen in the surface (0-10cm) soil
              </Help>
              <Myslider
                id="InorganicN"
                min={0}
                max={25}
              />
            </Box>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          justifyContent: 'space-around',
          alignItems: 'space-between',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
        mt={6}
      >
        <Button
          sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
          onClick={() => navigate('/location')}
          variant="contained"
          color="success"
        >
          BACK
        </Button>
        <Button
          sx={{ borderRadius: '1rem', fontSize: '22px', fontWeight: 900 }}
          onClick={() => navigate('/covercrop')}
          variant="contained"
          color="success"
        >
          NEXT
        </Button>
      </Box>
    </Box>
  );
}; // Soil

export default Soil;
