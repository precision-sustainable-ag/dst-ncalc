/* eslint-disable arrow-body-style */
import React from 'react';

const Error = ({ errors }) => {
  return (
    <>
      <p>
        Errors:
      </p>
      <ul>
        {errors.map((k) => <li>{k}</li>)}
      </ul>
      <p>
        Please review your inputs and try again.
      </p>
    </>
  );
};

export default Error;
