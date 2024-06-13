// YoloDisplay.js
import React, { useEffect, useState } from 'react';
import yolo from 'tfjs-yolo';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const YoloDisplay = ({ stream, canvasRef, isLoading, setIsLoading }) => { // Cambiar loading y setLoading a isLoading y setIsLoading
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [colorMap, setColorMap] = useState({});
  const [selectedModel, setSelectedModel] = useState('v1tiny');
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];

  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true); // Cambiar setLoading a setIsLoading
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
      }
      await tf.ready();
      let model;
      switch (selectedModel) {
        case 'v1tiny':
          model = await yolo.v1tiny();
          break;
        case 'v2tiny':
          model = await yolo.v2tiny();
          break;
        case 'v3tiny':
          model = await yolo.v3tiny();
          break;
        case 'v3':
          model = await yolo.v3();
          break;
        // Agrega aquí más casos para otros modelos
      }
      setModel(model);
      setIsLoading(false); // Cambiar setLoading a setIsLoading
    };
    loadModel();
  }, [selectedModel, setIsLoading]); // Agregar setIsLoading a la lista de dependencias

  useEffect(() => {
    let animationId;
  
    if (model && stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const processFrame = () => {
        imageCapture.grabFrame().then(imageBitmap => {
          canvas.width = imageBitmap.width;
          canvas.height = imageBitmap.height;
          ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height);
          detectFrame(canvas, model);
        }).catch(error => {
           console.error('grabFrame() error:', error);
        });
        animationId = requestAnimationFrame(processFrame);
      };
      processFrame();
    }
  
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [model, stream, canvasRef, isLoading]);

  const detectFrame = (canvas, model) => {
    model.predict(canvas).then(predictions => {
      if (!isLoading) { // Solo llama a renderPredictions si isLoading es false
        renderPredictions(predictions, canvas);
        setPredictions(predictions);
      }
    });
  };

  const renderPredictions = (predictions, canvas) => {
    const ctx = canvas.getContext('2d');
  
    let newColorMap = { ...colorMap };
    predictions.forEach((prediction, i) => {
      if (prediction) {
        let color = newColorMap[prediction.class];
        if (!color) {
          color = colors[Object.keys(newColorMap).length % colors.length];
          newColorMap[prediction.class] = color;
        }
        ctx.beginPath();
        // Use prediction's top, left, width, and height to draw the bounding box
        ctx.rect(prediction.left, prediction.top, prediction.width, prediction.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.stroke();
        ctx.fillText(
          prediction.class + ' ' + Math.round(prediction.score * 100) / 100,
          prediction.left,
          prediction.top > 10 ? prediction.top - 5 : 10
        );
      }
    });
    setColorMap(newColorMap);
  };

  return (
    <div>
      <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
        <option value="v1tiny">YOLO v1 Tiny</option>
        <option value="v2tiny">YOLO v2 Tiny</option>
        <option value="v3tiny">YOLO v3 Tiny</option>
        <option value="v3">YOLO v3</option>
        {/* Agrega aquí más opciones para otros modelos */}
      </select>
     
      {predictions.map((prediction, i) => (
        <div key={i}>
          <p>{prediction.class}: {(prediction.score * 100).toFixed(2)}%</p>
          <div style={{width: '100%', backgroundColor: '#ddd'}}>
            <div style={{height: '24px', width: `${prediction.score * 100}%`, backgroundColor: colorMap[prediction.class]}}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default YoloDisplay;