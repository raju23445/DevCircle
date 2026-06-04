import React from 'react';
const Spinner = ({ center }) => (
  <div style={center ? { display:'flex', justifyContent:'center', padding:'2rem' } : {}}>
    <div className="spinner" />
  </div>
);
export default Spinner;
