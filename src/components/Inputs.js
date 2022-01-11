import LocalizationProvider from '@mui/lab/LocalizationProvider';

import DateAdapter from '@mui/lab/AdapterMoment';

import DesktopDatePicker from '@mui/lab/DesktopDatePicker';

import {
  Input as MUIInput,
  Autocomplete as MUIAutocomplete,
  TextField
} from '@mui/material';

import NumberFormat from 'react-number-format';

const focus = (obj) => {
  if (obj) {
    document.querySelector('#' + obj).focus();
  } else {
    let found = false;

    document.querySelectorAll('input:not([tabIndex="-1"]), select:not([tabIndex="-1"]), button:not([tabIndex="-1"])').forEach(function(obj) {
      if (found) {
        obj.focus();
        found = false;
      } else if (obj === document.activeElement) {
        found = true;
      }
    });
  }
} // focus

const keyPress = (e, props) => {
  if (e.key === 'Enter') {
    focus(props.next);
  }
} // keyPress

const Input = (props) => {
  let value = props.value;

  if (Array.isArray(props.value)) {
    value = props.value[props.index];
  }

  return (
    props.type === 'date' ?
      <LocalizationProvider dateAdapter={DateAdapter}>
        <DesktopDatePicker
          inputFormat="MM/DD/yyyy"
          
          value={value}

          onChange={(value) => {
            props.onChange({}, value, props.index);
          }}
  
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>

      :
    props.type === 'number' ?
      <NumberFormat
        autoComplete="off"
        
        onKeyPress={(e) => {
          return keyPress(e, props)
        }}
        
        variant="standard"        

        {...props}
        value={value}
        
        onChange={(event) => {
          const value = event.target.value;
          props.onChange(event, value, props.index);
        }}

        customInput={TextField}

        type="text"
      />
      :
    props.type === 'dollar' ?
      <NumberFormat
        autoComplete="off"
        
        onKeyPress={(e) => {
          return keyPress(e, props)
        }}
        
        {...props}
        value={value}
        
        onChange={(event) => {
          const value = event.target.value;
          props.onChange(event, value.replace('$', ''), props.index);
        }}

        decimalScale={2}
        fixedDecimalScale={true}
        prefix={'$'}
    
        type="text"
      />
      :
      <MUIInput
        autoComplete="off"

        onKeyPress={(e) => {
          return keyPress(e, props)
        }}
        
        {...props}
        value={value}

        onChange={(event, value) => {
          props.onChange(event, value, props.index);
        }}

        type="text"
      />
  )
} // Input

const Autocomplete = (props) => {
  let value = props.value;

  if (Array.isArray(props.value) && isFinite(props.index)) {
    value = props.value[props.index];
  }

  if (!props.multiple) {
    value = props.options.find(option => option === value || (option.value && option.value === value) || (option.label && option.label === value));
    value = value ? value.label || value : null;
  }

  const max = Math.max.apply(Math, props.options.map(option => option.length));

  return (
    <MUIAutocomplete
      onKeyPress={(e) => keyPress(e, props)}

      sx={{width: (max * 0.8) + 'rem'}}
  
      isOptionEqualToValue={(option, value) => {
        return option === value || (option.value && option.value === value) || (option.label && option.label === value);
      }}

      renderInput={(params) => (
        <TextField
          variant="standard"

          placeholder={!value || !value.length ? props.placeholder : ''}

          {...params}
        />
      )}
      
      {...props}

      value={value}

      onChange={(event, value) => {
        props.onChange(event, value, props.index);
      }}
    />
  )
} // Autocomplete

export {
  Autocomplete,
  Input,
}