import React from 'react';

function ZIndexExample() {
  const containerStyle = {
    position: 'relative',
    width: '300px',
    height: '300px',
    margin: '50px auto',
  };

  const box1Style = {
    position: 'absolute',
    width: '200px',
    height: '200px',
    backgroundColor: 'blue',
    top: '50px',
    left: '50px',
    zIndex: 1, // Lower z-index
  };

  const box2Style = {
    position: 'absolute',
    width: '150px',
    height: '150px',
    backgroundColor: 'transparent',
    top: '100px',
    left: '100px',
    zIndex: 2, // Higher z-index
    pointerEvents: 'none', // Ensure Box 2 doesn't interfere with events
  };

  const box2BeforeStyle = {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white', // Solid background color
    zIndex: -1, // Place it behind the transparent box
  };

  return (
    <div style={containerStyle}>
      <div style={box1Style}></div>
      <div style={box2Style}>
        <div style={box2BeforeStyle}></div>
      </div>
    </div>
  );
}

export default ZIndexExample;
