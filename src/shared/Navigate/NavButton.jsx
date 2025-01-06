import React from 'react';
import { PSAButton } from 'shared-react-components/src';

const NavButton = ({ children, onClick, disabled = false, fontSize = '1rem' }) => (
  <PSAButton
    title={children}
    sx={{
      color: 'white',
      padding: '0.8rem 1.5rem',
      // fontWeight: 'bold',
      textAlign: 'center',
      borderRadius: '2rem',
      fontSize: { fontSize },
      backgroundColor: '#6b9333',
      boxShadow: '0px 2px 2px rgba(160, 160, 160, 0.3)',
      '&:hover': {
        backgroundColor: '#6b9333',
        textDecoration: 'underline',
        boxShadow: '0px 2px 2px rgba(160, 160, 160, 0.3)',
      },
    }}
    variant="contained"
    onClick={onClick}
    disabled={disabled}
  />
);
export default NavButton;
