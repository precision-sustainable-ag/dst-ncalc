import { Button } from '@mui/material';
import React from 'react';

const NavButton = ({ children, onClick, fontSize = '1rem' }) => (
  <Button
    sx={{
      padding: '0.8rem 1.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      borderRadius: '2rem',
      fontSize: { fontSize },
      backgroundColor: '#6b9333',
      boxShadow: '0px 2px 2px rgba(160, 160, 160, 0.3)',
    }}
    variant="contained"
    onClick={onClick}
  >
    {children}
  </Button>
);
export default NavButton;
