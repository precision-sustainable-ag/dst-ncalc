import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Route, NavLink, Routes, useNavigate,
} from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Modal, styled } from '@mui/material';
import Init from '../Init';
import { get, set } from '../../store/Store';

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

const ResponsiveNavBar = ({ screens }) => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('home');
  const [navModalOpen, setNavModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleClickNavMenu = (scr) => {
    dispatch(set.screen(scr));
    setActiveMenu(scr);
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // useSelector(get.screen); // force render
  useEffect(() => {
    navigate(`/${activeMenu}`);
  }, [activeMenu]);

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'transparent', marginBottom: '3rem' }}>
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
        {/* Menu vertical list */}
        <Toolbar disableGutters sx={{ display: { xs: 'flex', md: 'none' } }}>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '2rem',
            }}
          >
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
                      {screens[scr].desc.replace(/\s/g, '') || scr.replace(/\s/g, '')}
                    </NavBarButtonText2>
                  </NavLink>
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
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, color: 'white' }}>
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
          {/* Examples Avatar */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{
                  p: '0.7rem',
                  color: 'black',
                  backgroundColor: 'white',
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
                  setActiveMenu('feedback');
                }}
              >
                {/* <NavLink
                  key="feedback-navlink"
                  to="/feedback"
                  style={{ textDecoration: 'none' }}
                > */}
                <Typography textAlign="center">Feedback</Typography>
                {/* </NavLink> */}
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
      {/* {activeMenu === 'feedback' && (
        <Modal
          open={navModalOpen}
          onClose={() => { setNavModalOpen(false); }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Text in a modal
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
            </Typography>
          </Box>
        </Modal>
      )} */}
    </AppBar>
  );
};
export default ResponsiveNavBar;
