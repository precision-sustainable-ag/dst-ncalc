/* eslint-disable operator-linebreak */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
// import MenuIcon from '@mui/icons-material/Menu';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material';
import Init from '../Init';
import { set } from '../../store/Store';

const NavBarButtonText1 = styled(Button)(({ theme, isactive }) => ({
  color: 'white',
  border: isactive === 'true' ? '2px solid white' : 'none',
  fontWeight: 'bold',
  display: 'block',
  '&.MuiButton-root': {
    '&:hover': {
      backgroundColor: '#fff',
      color: '#3c52b2',
      textDecoration: 'none',
    },
  },
  margin: '0 1rem',
  [theme.breakpoints.up('lg')]: {
    margin: '0 2rem',
  },
}));

const NavBarButtonText2 = styled(Button)(({ theme, isactive }) => ({
  color: isactive === 'true' ? '#3c52b2' : 'black',
  border: isactive === 'true' ? '1px solid black' : 'none',
  fontWeight: isactive === 'true' ? 'bolder' : 'bold',
  display: 'flex',
  '&.MuiButton-root': {
    '&:hover': {
      backgroundColor: '#fff',
      color: '#3c52b2',
      textDecoration: 'none',
    },
  },
  justifyContent: 'flex-start',
  margin: '0 1rem',
  [theme.breakpoints.up('lg')]: {
    margin: '0 2rem',
  },
}));

const navBarBackDropStyles = {
  position: 'fixed',
  left: 0,
  top: 0,
  width: '100vw',
  height: { xs: '5rem', lg: '6rem' },
  background: 'linear-gradient(#111, #333)',
};

const ResponsiveNavBar = ({ screens }) => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('home');
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [userIsOpen, setUserIsOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [navModalOpen, setNavModalOpen] = useState(false);

  const location = useLocation();
  const dispatch = useDispatch();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
    setMenuIsOpen(!menuIsOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
    setUserIsOpen(!userIsOpen);
  };

  const handleClickNavMenu = (scr) => {
    dispatch(set.screen(scr));
    setActiveMenu(scr);
    setAnchorElNav(null);
    setMenuIsOpen(!menuIsOpen);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
    setUserIsOpen(false);
  };

  // // useSelector(get.screen); // force render
  useEffect(() => {
    setActiveMenu(
      location.pathname.replace('/', '').replace('2', ''),
    );
  }, [location]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        marginBottom: {
          xs: '1rem',
          sm: '2rem',
        },
        paddingTop: {
          xs: '0.5rem',
          lg: '1rem',
        },
      }}
    >
      <Box sx={navBarBackDropStyles} />
      <Stack
        direction="row"
        justifyContent="space-around"
        flexGrow={2}
      >
        <Toolbar disableGutters>
          {/* Menu Button Box */}
          <Box
            sx={{
              height: '4rem',
              display: { xs: 'none', md: 'flex' },
            }}
          >
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
        {/* Menu vertical list */}
        <Toolbar
          disableGutters
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '0.2rem',
              // borderRadius: menuIsOpen ? '0.2rem' : '1rem',
              // paddingBottom: menuIsOpen ? '0.2rem' : '0',
              width: '3rem',
              height: '3rem',
              justifyContent: 'center',
            }}
          >

            <IconButton
              size="large"
              aria-label="icon of vertical menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{ padding: '0px' }}
            >
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 900,
                    padding: 0,
                    fontFamily: 'sans-serif',
                  }}
                >
                  Menu
                </Typography>
                {menuIsOpen
                  ? (<KeyboardDoubleArrowUpIcon fontSize="small" />)
                  : (<KeyboardDoubleArrowDownIcon fontSize="small" />)}
              </Box>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleClickNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {Object.keys(screens)
                .filter((scr) => screens[scr].showInMenu !== false)
                .map((scr) => (
                  <NavLink
                    key={`${scr}-navlink`}
                    to={`/${scr.toLowerCase()}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <NavBarButtonText2
                      key={`${scr}-navlink-text-str`}
                      onClick={() => handleClickNavMenu(scr)}
                      isactive={activeMenu === scr ? 'true' : 'false'}
                    >
                      {/* {screens[scr].desc.replace(/\s/g, '') ||
                        scr.replace(/\s/g, '')} */}
                      {''.concat(scr)}
                    </NavBarButtonText2>
                  </NavLink>
                ))}
            </Menu>
          </Box>
        </Toolbar>
        <Toolbar
          disableGutters
          sx={{
            display: { xs: 'flex', md: 'none' },
            minWidth: '70%',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              height: '4rem',
              display: { xs: 'flex', md: 'none' },
            }}
          >
            <img
              src="psalogo-text.svg"
              alt="PSA Logo"
              style={{
                backgroundColor: 'white',
                mr: 2,
                borderRadius: '0.5rem',
                padding: '0.1rem 0.4rem',
                height: '100%',
              }}
            />
          </Box>
        </Toolbar>
        <Toolbar
          disableGutters
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {/* Menu horizontal list */}
          <Box
            alignItems="center"
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              color: 'white',
            }}
          >
            {Object.keys(screens)
              .filter((scr) => screens[scr].showInMenu !== false)
              .map((scr) => (
                <NavLink
                  key={`${scr}-navlink`}
                  to={`/${scr.toLowerCase()}`}
                  style={{ textDecoration: 'none' }}
                >
                  <NavBarButtonText1
                    key={`${scr}-navlink-text-str`}
                    onClick={() => handleClickNavMenu(scr)}
                    isactive={activeMenu === scr ? 'true' : 'false'}
                  >
                    {screens[scr].desc || scr}
                  </NavBarButtonText1>
                </NavLink>
              ))}
          </Box>
        </Toolbar>
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  color: 'black',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
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
              open={userIsOpen}
              onClose={handleCloseUserMenu}
            >
              <MenuItem
                key="about"
                onClick={() => {
                  dispatch(set.openAboutModal(true));
                  handleCloseUserMenu();
                }}
              >
                <Typography textAlign="center">About</Typography>
              </MenuItem>
              <MenuItem
                key="feedback"
                onClick={() => {
                  dispatch(set.openFeedbackModal(true));
                  handleCloseUserMenu();
                }}
              >
                <Typography textAlign="center">Feedback</Typography>
              </MenuItem>
              <MenuItem key="examples">
                <Init handleCloseUserMenu={handleCloseUserMenu} />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Stack>
      {/* </Box> */}
    </AppBar>
  );
};
export default ResponsiveNavBar;