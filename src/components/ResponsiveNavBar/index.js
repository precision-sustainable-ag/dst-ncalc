import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material';
import Init from '../Init';

const NavBarButtonText = styled(Button)(({ theme }) => ({
  color: 'white',
  fontWeight: 'bold',
  display: 'block',
  '&.MuiButton-root': {
    '&:hover': {
      backgroundColor: '#fff',
      color: '#3c52b2',
    },
  },
  margin: '0 1rem',
  [theme.breakpoints.up('lg')]: {
    margin: '0 2rem',
  },
}));

const ResponsiveNavBar = ({ screens }) => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [navModalOpen, setNavModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'transparent' }}>
      <Stack direction="row" justifyContent="space-around" flexGrow={2}>
        <Toolbar disableGutters>
          {/* Menu Button Box */}
          <Box sx={{ height: '4rem', display: { xs: 'none', md: 'flex' } }}>
            <img
              src="psalogo-text.svg"
              alt="PSA Logo"
              style={{
                backgroundColor: 'white',
                mr: 2,
                borderRadius: '0.5rem',
                padding: '0.1rem 0.4rem',
                height: '100%',
                // filter: 'invert(1)',
              }}
            />
          </Box>
        </Toolbar>
        <Toolbar disableGutters sx={{ display: { xs: 'flex', md: 'none' } }}>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' }
              }}
            >
              {Object.keys(screens)
                .filter((scr) => screens[scr].showInMenu !== false)
                .map((scr) => (
                  <MenuItem
                    key={scr}
                    onClick={handleCloseNavMenu}
                  >
                    <Button sx={{ color: 'black', fontWeight: 'bolder' }}>
                      {scr}
                    </Button>
                  </MenuItem>
                ))}
            </Menu>
          </Box>
        </Toolbar>
        <Toolbar disableGutters sx={{ display: { xs: 'flex', md: 'none' }, minWidth: '70%', justifyContent: 'center' }}>
          <Box sx={{ height: '4rem', display: { xs: 'flex', md: 'none' } }}>
            <img
              src="psalogo-text.svg"
              alt="PSA Logo"
              style={{
                backgroundColor: 'white',
                mr: 2,
                borderRadius: '0.5rem',
                padding: '0.1rem 0.4rem',
                height: '100%',
                // filter: 'invert(1)',
              }}
            />
          </Box>
        </Toolbar>
        <Toolbar disableGutters sx={{ display: { xs: 'none', md: 'flex' } }}>
          {/* Menu horizontal list */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {Object.keys(screens)
              .filter((scr) => screens[scr].showInMenu !== false)
              .map((scr) => (
                <NavBarButtonText
                  key={scr}
                  onClick={handleCloseNavMenu}
                >
                  {scr}
                </NavBarButtonText>
              ))}
          </Box>
        </Toolbar>
        <Toolbar disableGutters>
          {/* Examples Avatar */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: '0.3rem', backgroundColor: 'white' }}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem
                key="about"
                onClick={() => {
                  setNavModalOpen(false);
                  navigate('about');
                }}
              >
                <Typography textAlign="center">About</Typography>
              </MenuItem>
              <MenuItem
                key="feedback"
                onClick={() => {
                  setNavModalOpen(false);
                  navigate('feedback');
                }}
              >
                <Typography textAlign="center">Feedback</Typography>
              </MenuItem>
              <MenuItem
                key="examples"
              >
                <Init desktop setNavModalOpen={setNavModalOpen} />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Stack>
    </AppBar>
  );
};
export default ResponsiveNavBar;
