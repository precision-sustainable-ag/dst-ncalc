import React from 'react';
import { PSAButton, PSATooltip } from 'shared-react-components/src';

const NavButton = ({
  children, onClick, disabled = false, fontSize = '1rem', tooltip = '',
}) => (
  <PSATooltip
    title={tooltip}
    tooltipContent={(
      <div>
        <PSAButton
          title={children}
          sx={{
            color: 'white',
            padding: '0.8rem 1.5rem',
            // fontWeight: 'bold',
            textAlign: 'center',
            borderRadius: '2rem',
            fontSize: { fontSize },
            backgroundColor: '#60802D',
            boxShadow: '0px 2px 2px rgba(160, 160, 160, 0.3)',
            opacity: 1,
            '&:hover': {
              backgroundColor: '#60802D',
              textDecoration: 'underline',
              boxShadow: '0px 2px 2px rgba(160, 160, 160, 0.3)',
            },
          }}
          variant="contained"
          onClick={onClick}
          disabled={disabled}
        />
      </div>
    )}
  />
);
export default NavButton;
