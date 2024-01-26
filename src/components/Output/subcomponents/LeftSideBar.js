/* eslint-disable consistent-return */
/* eslint-disable no-console */
import {
  Box,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { get } from '../../../store/Store';

const YOFFSET = -100;

const wrapperStyles = {
  display: { xs: 'none', sm: 'block' },
  width: '150px',
  zIndex: 1,
};

const ListWrapperStyles = {
  position: 'fixed',
  left: '0px',
};

const ListStyles = {
  direction: 'column',
  marginLeft: 2,
  paddingX: 2,
  paddingY: 2,
  borderRadius: 2,
  backgroundColor: '#f5f5f5',
};

const ListItem = ({
  activeItem, label, setActiveItem, refVal, setDisableScrollListener,
}) => {
  const rowStyles = {
    position: 'relative',
    background: activeItem === label ? '#ddd' : 'transparent',
    borderRadius: '4px',
    padding: '6px 12px',
    '&:hover': {
      background: '#ddd',
      cursor: 'pointer',
    },
  };
  const activeRowStyles = {
    position: 'absolute',
    width: '5px',
    height: '100%',
    top: 0,
    left: 0,
    transform: 'translate(-100%, 0)',
    backgroundColor: 'rgb(35, 148, 223)',
    borderRadius: '5px',
  };
  return (
    <Box
      sx={rowStyles}
      key={label}
      onClick={() => {
        setDisableScrollListener(true);
        setTimeout(() => {
          setDisableScrollListener(false);
        }, 500);
        setActiveItem(label);
        const element = refVal.current;
        const y = element.getBoundingClientRect().top + window.scrollY + YOFFSET;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }}
    >
      {activeItem === label && <Box sx={activeRowStyles} />}
      <Typography fontSize={14} fontWeight={900}>
        {label}
      </Typography>
    </Box>
  );
};

const LeftSideBar = ({ sidebarListData, refs }) => {
  const [activeItem, setActiveItem] = React.useState('Summary');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [disableScrollListener, setDisableScrollListener] = useState(false);
  const isSatelliteMode = useSelector(get.biomassCalcMode) === 'satellite';

  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!disableScrollListener) {
      sidebarListData.forEach((el, index) => {
        if (!isSatelliteMode && el.label === 'Map Visualization') return;
        const element = refs[index].current;
        if (element === null) return;
        const yTop = element.getBoundingClientRect().top + window.scrollY + YOFFSET;
        const yBot = element.getBoundingClientRect().bottom + window.scrollY + YOFFSET;
        if (scrollPosition < yBot && scrollPosition > yTop) {
          if (activeItem !== el.label) {
            setActiveItem(el.label);
          }
        }
      });
    }
  }, [scrollPosition, disableScrollListener]);

  return (
    <Box sx={wrapperStyles}>
      <Box sx={ListWrapperStyles}>
        <Stack sx={ListStyles} gap={2} alignItems="flex-start">
          {
            sidebarListData.map((el, index) => {
              if (!isSatelliteMode && el.label === 'Map Visualization') return;
              return (
                <ListItem
                  label={el.label}
                  key={el.key}
                  activeItem={activeItem}
                  setActiveItem={setActiveItem}
                  refVal={refs[index]}
                  setDisableScrollListener={setDisableScrollListener}
                />
              );
            })
          }
        </Stack>
      </Box>
    </Box>
  );
};
export default LeftSideBar;
