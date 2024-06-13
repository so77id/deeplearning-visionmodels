// src/App.js

import React, { useState } from 'react';
import CameraFeed from './components/CameraFeed';
import ModelDisplay from './components/ModelDisplay';

const App = () => {
  const [stream, setStream] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1 }}>
        <h2>Original</h2>
        <CameraFeed onStreamReady={setStream} />
      </div>
      <div style={{ flex: 1 }}>
        <h2>Model</h2>
        <ModelDisplay stream={stream} />
      </div>
    </div>
  );
};

export default App;
