/* eslint-disable no-console */
import {
  Avatar,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';

const wrapperStyles = {
  display: { xs: 'none', sm: 'block' },
  backgroundColor: 'lightBlue',
  width: '240px',
};

const ListStyles = {
  position: 'fixed',
  direction: 'column',
  left: '120px',
  transform: 'translate(-50%, 0%)',
  margin: 2,
};

const LeftSideBar = () => {
  console.log('LeftSideBar');
  return (
    <Box sx={wrapperStyles}>
      <Stack
        sx={ListStyles}
        gap={4}
        alignItems="center"
      >
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
        />
        <Typography variant="h5" fontWeight={900}>
          LeftSideBar
        </Typography>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
        />
        <Typography variant="h5" fontWeight={900}>
          LeftSideBar
        </Typography>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
        />
        <Typography variant="h5" fontWeight={900}>
          LeftSideBar
        </Typography>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
        />
        <Typography variant="h5" fontWeight={900}>
          LeftSideBar
        </Typography>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
        />
        <Typography variant="h5" fontWeight={900}>
          LeftSideBar
        </Typography>
      </Stack>
    </Box>
  );
};
export default LeftSideBar;
