import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';
import { PSAModal } from 'shared-react-components/src';

import './styles.scss';

const Help = ({ ariaLabel, children }) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Icon
        ref={ref}
        onClick={() => {
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-hidden={false}
      >
        help
      </Icon>
      <PSAModal
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        modalContent={(
          <Box className="modal">
            {children}
          </Box>
      )}
      />
    </>
  );
}; // Help
export default Help;
