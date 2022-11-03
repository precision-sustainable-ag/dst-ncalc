import {Icon, Modal, Typography} from '@mui/material';
import {Box} from '@mui/system';
import {useRef, useState} from 'react';

import './styles.scss';

export const Help = (props) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

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
            {props.children}
          </Typography>
        </Box>
      </Modal>
    </>
  )
} // Help
