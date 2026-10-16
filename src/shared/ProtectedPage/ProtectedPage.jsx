import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box, CircularProgress, Grid, Stack, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get, set } from '../../store/redux-autosetters';
import NavButton from '../Navigate/NavButton';
import { getRoles, isUserAdmin, isUserSuperAdmin } from '../../utils/roles';

/**
 * Page is restricted to `allowedRoles`.
 * ncalc-super-admin has access by default.
 * If `allowedRoles` is null:
 *  - admins (ncalc-admin / ncalc-super-admin) have access, and
 *  - access is granted to the program group roles fetched from the API.
 */
const ProtectedPage = ({ children, allowedRoles = null }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const programGroups = useSelector(get.programGroups);

  const roles = getRoles(user);
  const programGroupRoles = [
    ...new Set((programGroups || []).map((pg) => pg.groupName).filter(Boolean)),
  ];
  const grantingRoles = allowedRoles || programGroupRoles;
  const isAllowed = isAuthenticated && (
    isUserSuperAdmin(roles)
    // Admins can access any page that isn't explicitly role-restricted.
    || (!allowedRoles && isUserAdmin(roles))
    || roles.some((r) => grantingRoles.includes(r))
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" sx={{ alignItems: 'center' }} minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Grid container sx={{ justifyContent: 'center', mt: '2rem' }}>
        <Grid sx={{ p: '2rem', backgroundColor: 'white', borderRadius: 5 }} size={{ xs: 10 }}>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" align="center">Please log in to view this page</Typography>

            <NavButton onClick={() => { navigate('/home'); dispatch(set.activeStep(0)); }}>Home</NavButton>
          </Stack>
        </Grid>
      </Grid>
    );
  }

  if (!isAllowed) {
    return (
      <Grid container sx={{ justifyContent: 'center', mt: '2rem' }}>
        <Grid sx={{ p: '2rem', backgroundColor: 'white', borderRadius: 5 }} size={{ xs: 10 }}>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
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
