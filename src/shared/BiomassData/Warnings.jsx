import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { get, set } from '../../store/Store';

const AreaErrorModal = () => {
  const polyDrawTooBig = useSelector(get.polyDrawTooBig);
  const dispatch = useDispatch();

  return (
    <Dialog
      open={polyDrawTooBig}
      onClose={() => {
        dispatch(set.polyDrawTooBig(false));
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
            dispatch(set.polyDrawTooBig(false));
          }}
          autoFocus
        >
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TaskFailModal = ({ task }) => {
  const biomassFetchIsFailed = useSelector(get.biomassFetchIsFailed);
  const dispatch = useDispatch();

  return (
    <Dialog
      open={task === 'biomass' ? biomassFetchIsFailed : false}
      onClose={() => {
        if (task === 'biomass') {
          dispatch(set.biomassFetchIsFailed(false));
        }
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
            if (task === 'biomass') {
              dispatch(set.biomassFetchIsFailed(false));
            }
          }}
          autoFocus
        >
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { AreaErrorModal, TaskFailModal };
