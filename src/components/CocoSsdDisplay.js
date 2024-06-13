// CocoSsdDisplay.js
import React, { useEffect, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const CocoSsdDisplay = ({ stream, canvasRef, isLoading, setIsLoading }) => { // Agregar isLoading y setIsLoading como props
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [colorMap, setColorMap] = useState({});
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];

  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true); // Activar loading cuando comienza la carga del modelo
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
      }
      await tf.ready();
      const model = await cocoSsd.load();
      setTimeout('', 5000);
      setModel(model);
      setIsLoading(false); // Desactivar loading cuando termina la carga del modelo
    };
    loadModel();
  }, [setIsLoading]); // Agregar setIsLoading a la lista de dependencias

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
  }, [model, stream, canvasRef]);

  const detectFrame = (canvas, model) => {
    model.detect(canvas).then(predictions => {
      renderPredictions(predictions, canvas);
      setPredictions(predictions);
    });
  };

  const renderPredictions = (predictions, canvas) => {
    const ctx = canvas.getContext('2d');
  
    let newColorMap = { ...colorMap };
    predictions.forEach((prediction, i) => {
      let color = newColorMap[prediction.class];
      if (!color) {
        color = colors[Object.keys(newColorMap).length % colors.length];
        newColorMap[prediction.class] = color;
      }
      ctx.beginPath();
      ctx.rect(...prediction.bbox);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.stroke();
      ctx.fillText(
        prediction.class + ' ' + Math.round(prediction.score * 100) / 100,
        prediction.bbox[0],
        prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
      );
    });
    setColorMap(newColorMap);
  };

  return (
    <div>
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

export default CocoSsdDisplay;