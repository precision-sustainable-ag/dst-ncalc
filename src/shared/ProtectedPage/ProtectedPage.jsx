import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box, CircularProgress, Grid, Stack, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { set } from '../../store/redux-autosetters';
import NavButton from '../Navigate/NavButton';

const ROLES = ['NIFA-Soy', 'Willard', 'Growmark'];

const ProtectedPage = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const roles = user?.['https://dst-ncalc.org/claims'] || [];
  const isAllowed = isAuthenticated && (
    roles.includes('ncalc-super-admin') || roles.includes('ncalc-admin') || roles.some((r) => ROLES.includes(r))
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Grid container justifyContent="center" sx={{ mt: '2rem' }}>
        <Grid item xs={10} sx={{ p: '2rem', backgroundColor: 'white', borderRadius: 5 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6" align="center">Please log in to view this page</Typography>

            <NavButton onClick={() => { navigate('/home'); dispatch(set.activeStep(0)); }}>Home</NavButton>
          </Stack>
        </Grid>
      </Grid>
    );
  }

  if (!isAllowed) {
    return (
      <Grid container justifyContent="center" sx={{ mt: '2rem' }}>
        <Grid item xs={10} sx={{ p: '2rem', backgroundColor: 'white', borderRadius: 5 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6" align="center">Access denied: You do not have the required permissions.</Typography>

            <NavButton onClick={() => { navigate('/home'); dispatch(set.activeStep(0)); }}>Home</NavButton>
          </Stack>
        </Grid>
      </Grid>
    );
  }

  return children;
};

export default ProtectedPage;
