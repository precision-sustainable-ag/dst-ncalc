import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress, Stack, Typography,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

const ActionModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Close',
  type = 'info', // 'info', 'loading', 'success', 'error', 'confirm'
  icon,
  customContent,
  showActions = true,
  actionsCenter = false,
}) => {
  const isLoading = type === 'loading';

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
      {title && (
        <DialogTitle>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {type === 'error' && <ErrorOutlineIcon color="error" />}
            {type === 'success' && <CheckCircleOutlineIcon color="success" />}
            <Typography variant="inherit" component="span">
              {title}
            </Typography>
          </Stack>
        </DialogTitle>
      )}

      <DialogContent>
        {isLoading ? (
          <Stack direction="row" spacing={2} sx={{ py: 2, alignItems: 'center' }}>
            <CircularProgress size={24} />
            <Typography>{message || 'Processing...'}</Typography>
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ py: icon ? 2 : 0, mt: title ? 0 : 2, alignItems: icon ? 'center' : 'stretch' }}>
            {icon}
            {customContent || <DialogContentText textAlign={icon ? 'center' : 'left'}>{message}</DialogContentText>}
          </Stack>
        )}
      </DialogContent>

      {showActions && !isLoading && (
        <DialogActions sx={{ justifyContent: actionsCenter ? 'center' : 'flex-end', pb: 2, px: 3 }}>
          <Button onClick={onClose} color="inherit">
            {cancelText}
          </Button>
          {type === 'confirm' && onConfirm && (
            <Button onClick={onConfirm} variant="contained" color="primary">
              {confirmText}
            </Button>
          )}
          {type === 'success' && onConfirm && (
            <Button onClick={onConfirm} variant="contained" color="success">
              {confirmText}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ActionModal;
