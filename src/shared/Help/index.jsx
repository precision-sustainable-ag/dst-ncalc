import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

import './styles.scss';
import { List, ListItem, Stack } from '@mui/material';

const Help = () => {
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
          <Stack>
            <Typography>
              This input is optional. If you enter a field name, you will be able to rerun the
              model on this computer without re-entering your data.
            </Typography>
            <Typography fontWeight="bold" mt={2}>
              Notes:
            </Typography>
            <List
              sx={{
                listStyleType: 'disc',
                pl: 2,
                '& .MuiListItem-root': {
                  display: 'list-item',
                },
              }}
            >
              <ListItem>
                <Typography>
                  If you have multiple fields, you will be able to select them from a drop-down
                  menu in the upper-right.
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Your information is stored on your computer only. It will not be uploaded to a
                  server.
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  If you clear your browser&apos;s cache, you will need to re-enter your data the
                  next time you run the program.
                </Typography>
              </ListItem>
            </List>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}; // Help
export default Help;
