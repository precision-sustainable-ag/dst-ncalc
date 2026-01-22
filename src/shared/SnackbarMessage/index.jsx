import React, { useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import { useSelector } from 'react-redux';
import { get } from '../../store/Store';

const SlideTransition = (props) => (<Slide {...props} direction="up" />);

const TransitionsSnackbar = () => {
  const dataFetchStatus = useSelector(get.dataFetchStatus);
  const [state, setState] = React.useState({
    open: false,
    Transition: Slide,
  });

  const handleClose = () => {
    setState({
      ...state,
      open: false,
    });
  };

  useEffect(() => {
    setState({
      open: true,
      SlideTransition,
    });
  }, [dataFetchStatus]);

  return (
    dataFetchStatus !== 'idle'
    && (
      <div>
        <Snackbar
          open={state.open}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          onClose={handleClose}
          TransitionComponent={state.Transition}
          message={dataFetchStatus}
          key="up snackbar"
          autoHideDuration={5000}
        />
      </div>
    )
  );
};

export default TransitionsSnackbar;
