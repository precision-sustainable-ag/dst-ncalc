import React, { useState } from 'react';
import {
  Stack, Typography, Grid, Tabs, Tab, Box,
} from '@mui/material';
import AdminPortal from 'shared-react-components/src/AdminPortal';
import { useAuth0 } from '@auth0/auth0-react';
import { auth0ApiUrl } from '../../utils/keys';
import CreateRole from './CreateRole';

const ManageUsers = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [activeTab, setActiveTab] = useState(0);
  // Used for remounting the AdminPortal component.
  // Only remounted when a new role is created to prevent repeated calls to the auth0 api
  const [adminPortalKey, setAdminPortalKey] = useState(0);

  return (
    <Grid container sx={{ justifyContent: 'center' }}>
      <Grid
        sx={{
          marginTop: '1rem',
          padding: '2rem 1rem',
          boxShadow: 5,
          borderRadius: 5,
          opacity: 0.9,
          backgroundColor: 'white',
        }}
        size={{
          xs: 12,
          md: 10,
        }}
      >
        <Stack spacing="1rem" sx={{ alignItems: 'center' }}>
          <Typography variant="h4" align="center" color="primary">Manage Users</Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              centered
            >
              <Tab label="Assign Role" />
              <Tab label="Create Role" />
            </Tabs>
          </Box>

          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
              display: activeTab === 0 ? 'block' : 'none',
            }}
          >
            <AdminPortal
              key={adminPortalKey}
              apiBaseUrl={auth0ApiUrl}
              getAccessToken={getAccessTokenSilently}
              appName="NCALC"
              showRequests={false}
              title=""
            />
          </Box>

          {activeTab === 1 && (
            <CreateRole onRoleCreated={() => setAdminPortalKey((k) => k + 1)} />
          )}

        </Stack>
      </Grid>
    </Grid>
  );
};

export default ManageUsers;
