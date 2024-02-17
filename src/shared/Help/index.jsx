import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

import './styles.scss';

const Help = (props) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const { children } = props;
  return (
    <>
      <Icon
        ref={ref}
        onClick={() => {
          setOpen(!open);
        }}
      >
        help
      </Icon>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
      >
        <Box className="modal">
          <Typography {...props}>
            {children}
          </Typography>
        </Box>
      </Modal>
    </>
  );
}; // Help
export default Help;
