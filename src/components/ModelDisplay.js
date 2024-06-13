// ModelDisplay.js
import React, { useRef, useState } from 'react';
import CocoSsdDisplay from './CocoSsdDisplay';
import YoloDisplay from './YoloDisplay';
import './ModelDisplay.css';

const ModelDisplay = ({ stream }) => {
  const [selectedModel, setSelectedModel] = useState('COCO-SSD');
  const canvasRef = useRef(null);

  return (
    <div>
      <select onChange={e => setSelectedModel(e.target.value)} value={selectedModel}>
        <option value="COCO-SSD">COCO-SSD</option>
        <option value="YOLO">YOLO</option>
      </select>
      <div className="video-container">
        <canvas ref={canvasRef} className="canvas" />
      </div>
      {selectedModel === 'COCO-SSD' && <CocoSsdDisplay stream={stream} canvasRef={canvasRef} />}
      {selectedModel === 'YOLO' && <YoloDisplay stream={stream} canvasRef={canvasRef} />}
    </div>
  );
};

export default ModelDisplay;