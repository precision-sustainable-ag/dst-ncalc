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
  width: '150px',
};

const ListWrapperStyles = {
  position: 'fixed',
  left: '0px',
};

const ListStyles = {
  direction: 'column',
  marginLeft: 2,
  padding: 2,
  borderRadius: 2,
  backgroundColor: '#f5f5f5',
};

const LeftSideBar = () => {
  console.log('LeftSideBar');
  return (
    <Box sx={wrapperStyles}>
      <Box sx={ListWrapperStyles}>
        <Stack sx={ListStyles} gap={4} alignItems="center">
          <Avatar alt="Remy Sharp" src="/avatar/1.jpg" />
          <Typography variant="span" fontWeight={900}>
            LeftSideBar
          </Typography>
          <Avatar alt="Remy Sharp" src="/avatar/1.jpg" />
          <Typography variant="span" fontWeight={900}>
            LeftSideBar
          </Typography>
          <Avatar alt="Remy Sharp" src="/avatar/1.jpg" />
          <Typography variant="span" fontWeight={900}>
            LeftSideBar
          </Typography>
          <Avatar alt="Remy Sharp" src="/avatar/1.jpg" />
        </Stack>
      </Box>
    </Box>
  );
};
export default LeftSideBar;
