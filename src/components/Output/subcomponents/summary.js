import {
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';

const SummaryItem = ({ label, value }) => (
  <Container>
    <Paper elevation={4} alignItems="center" sx={{ padding: '0rem', borderRadius: '15px', justifyContent: 'center' }}>
      <Stack sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={900}>{label}</Typography>
        <Typography variant="h6" fontWeight={300}>{value}</Typography>
      </Stack>
    </Paper>
  </Container>
);

const SummaryList = () => (
  <Box>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={3}>
        <SummaryItem label="Field name" value="Example: Grass" />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <SummaryItem label="vdfvdf" value="kmkjk" />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <SummaryItem label="vdfvdf" value="kmkjk" />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <SummaryItem label="vdfvdf" value="kmkjk" />
      </Grid>
    </Grid>
  </Box>
);

export default SummaryList;
