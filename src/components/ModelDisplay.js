import React, { useEffect, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import './ModelDisplay.css';

const models = {
  'COCO-SSD': cocoSsd
};

const ModelDisplay = ({ stream }) => {
  const [selectedModel, setSelectedModel] = useState('COCO-SSD');
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [colorMap, setColorMap] = useState({});

  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];

  useEffect(() => {
    const loadModel = async () => {
      const model = await models[selectedModel].load();
      setModel(model);
    };
    loadModel();
  }, [selectedModel]);

  useEffect(() => {
    if (model && stream) {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        detectFrame(video, model);
      };
    }
  }, [model, stream]);

  const detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      renderPredictions(predictions, video);
      setPredictions(predictions);
      requestAnimationFrame(() => detectFrame(video, model));
    });
  };

  const renderPredictions = (predictions, video) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

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
      <select onChange={e => setSelectedModel(e.target.value)} value={selectedModel}>
        {Object.keys(models).map(modelName => (
          <option key={modelName} value={modelName}>
            {modelName}
          </option>
        ))}
      </select>
      <div className="video-container">
        <canvas id="canvas" className="canvas" />
      </div>
      <div>
        {predictions.map((prediction, i) => (
          <div key={i} className="progress-container">
            <span>{prediction.class} - Instance #{i + 1}</span>
            <div className="progress-bar" style={{ width: `${prediction.score * 100}%`, backgroundColor: colorMap[prediction.class] || 'gray' }}></div>
            <span>{Math.round(prediction.score * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelDisplay;