// ModelDisplay.js
import React, { useRef, useState } from 'react';
import modelConfig from './ModelConfig'
import './ModelDisplay.css'; // Importa el archivo CSS

const ModelDisplay = ({ stream }) => {
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(modelConfig)[0]); // Selecciona la primera categoría por defecto
  const [selectedModel, setSelectedModel] = useState(Object.keys(modelConfig[selectedCategory].models)[0]); // Selecciona el primer modelo de la categoría por defecto
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para la carga
  const [modelContent, setmodelContent] = useState(null); // Nuevo estado para el contenido de la segunda columna
  const canvasRef = useRef(null);
  const ModelComponent = modelConfig[selectedCategory].models[selectedModel];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedModel(Object.keys(modelConfig[e.target.value].models)[0]); // Selecciona el primer modelo de la nueva categoría
    setKey(prevKey => prevKey + 1); // increment key to force remount
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setKey(prevKey => prevKey + 1); // increment key to force remount
  };

  return (
    <div className="container">
      <div className="column">
        <div>
          <label>Categoría:</label>
          <select onChange={handleCategoryChange} value={selectedCategory}>
            {Object.keys(modelConfig).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Modelo:</label>
          <select onChange={handleModelChange} value={selectedModel}>
            {Object.keys(modelConfig[selectedCategory].models).map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        <div className="video-container">
          {isLoading && <div className="loading-overlay">Cargando modelo...</div>} {/* Overlay de carga */}
          <canvas ref={canvasRef} className="canvas" />
        </div>
        
      </div>
      <div className="column">
        <ModelComponent key={key} stream={stream} canvasRef={canvasRef} isLoading={isLoading} setIsLoading={setIsLoading} modelContent={modelContent} setmodelContent={setmodelContent} /> {/* Pasar modelContent y setmodelContent como props */}
        {/* {modelContent} Utiliza modelContent aquí */}
      </div>
    </div>
  );
};

export default ModelDisplay;