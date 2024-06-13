// ModelDisplay.js
import React, { useRef, useState } from 'react';
import CocoSsdDisplay from './CocoSsdDisplay';
import YoloDisplay from './YoloDisplay';
import './ModelDisplay.css';

const modelConfig = {
  'COCO-SSD': CocoSsdDisplay,
  'YOLO': YoloDisplay,
  // Agrega más modelos aquí
};

const ModelDisplay = ({ stream }) => {
  const [selectedModel, setSelectedModel] = useState('COCO-SSD');
  const [key, setKey] = useState(0);
  const canvasRef = useRef(null);
  const ModelComponent = modelConfig[selectedModel];

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setKey(prevKey => prevKey + 1); // increment key to force remount
  };

  return (
    <div>
      <select onChange={handleModelChange} value={selectedModel}>
        {Object.keys(modelConfig).map(model => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>
      <div className="video-container">
        <canvas ref={canvasRef} className="canvas" />
      </div>
      <ModelComponent key={key} stream={stream} canvasRef={canvasRef} />
    </div>
  );
};

export default ModelDisplay;