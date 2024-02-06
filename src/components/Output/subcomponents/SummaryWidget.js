/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
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
import React from 'react';

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
const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 300,
  },
});

const CustomTypography = styled(Typography)(() => ({
  borderRadius: 0,
  padding: '0 5px 0 2px',
  fontWeight: 300,
  fontSize: 14,
  '&:hover': {
    cursor: 'help',
  },
  background:
    'linear-gradient(90deg, rgba(35, 148, 223, 0.2), rgba(35, 148, 223, 0.0))',
  borderBottom: '1px dotted rgb(35, 148, 223)',
}));

const SummaryItem = ({ name, value, desc }) => {
  return (
    <Box
      sx={{
        padding: 1,
      }}
    >
      <Stack direction="row">
        <CustomWidthTooltip arrow title={desc} placement="top">
          <CustomTypography>
            {name}
            :&nbsp;
          </CustomTypography>
        </CustomWidthTooltip>
        {name === 'Species'
          ? (
            <Stack direction="column">
              {
                value.map((k, ix) => (
                  <Typography key={'summItem'.concat(String(ix))} sx={{ fontWeight: 600, fontSize: 11 }}>
                    {k}
                  </Typography>
                ))
              }
            </Stack>
          )
          : (
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
              {value}
            </Typography>
          )}
      </Stack>
    </Box >
  );
};

/// /// /// RETURN JSX /// /// ///
const SummaryCard = ({ data, refVal }) => (
  <Card sx={CardStyles} elevation={8} ref={refVal}>
    <CardContent sx={cardContentStyles}>
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        Summary
      </Typography>
    </CardContent>
    <CardActions>
      <Grid container spacing={2}>
        {Object.entries(data).map(([k, v], ix) => (
          <Grid item xs={12} sm={6} md={4} lg={3} width="100%" key={'summItem'.concat(String(ix))}>
            <SummaryItem name={k} value={v.value} desc={v.desc} />
          </Grid>
        ))}
      </Grid>
    </CardActions>
  </Card>
);

const OtherCard = ({ refVal }) => (
  <Card sx={CardStyles} elevation={8} ref={refVal}>
    <CardContent>
      <Typography
        sx={{ fontSize: 22 }}
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        pages
      </Typography>
      <Typography variant="body2">lorem ipsum</Typography>
    </CardContent>
    <CardActions>
      <Button size="small">Learn More</Button>
    </CardActions>
  </Card>
);

export {
  SummaryCard,
  OtherCard,
};
