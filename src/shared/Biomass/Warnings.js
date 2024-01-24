import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const AreaErrorModal = ({ errorArea, setErrorArea }) => (
  <Dialog
    open={errorArea}
    onClose={() => {
      setErrorArea(false);
    }}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">Large Area Warning!</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        The area selected is too large to calculate. Please select a smaller region under
        10000 Acres. Please delete the current polygon and draw a new one.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          setErrorArea(false);
        }}
        autoFocus
      >
        close
      </Button>
    </DialogActions>
  </Dialog>
);

const TaskFailModal = ({ taskIsFailed, setTaskIsFailed }) => (
  <Dialog
    open={taskIsFailed}
    onClose={() => {
      setTaskIsFailed(false);
    }}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">Server Failed</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Task failed to complete. Please try again.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          setTaskIsFailed(false);
        }}
        autoFocus
      >
        close
      </Button>
    </DialogActions>
  </Dialog>
);

export { AreaErrorModal, TaskFailModal };
