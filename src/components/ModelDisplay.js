// ModelDisplay.js
import React, { useRef, useState } from 'react';
import CocoSsdDisplay from './CocoSsdDisplay';
import YoloDisplay from './YoloDisplay';
import PoseDisplay from './PoseDisplay';
import './ModelDisplay.css';

const modelConfig = {
  'COCO-SSD': CocoSsdDisplay,
  'YOLO': YoloDisplay,
  'Pose': PoseDisplay,
  // Agrega más modelos aquí
};

const ModelDisplay = ({ stream }) => {
  const [selectedModel, setSelectedModel] = useState('COCO-SSD');
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para la carga
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
        {isLoading && <div className="loading-overlay">Cargando modelo...</div>} {/* Overlay de carga */}
        <canvas ref={canvasRef} className="canvas" />
      </div>
      <ModelComponent key={key} stream={stream} canvasRef={canvasRef} isLoading={isLoading} setIsLoading={setIsLoading} /> {/* Pasar isLoading y setIsLoading como props */}
    </div>
  );
};

export default ModelDisplay;