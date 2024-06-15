import React, { useEffect, useState, useRef } from 'react';
import { createDetector, SupportedModels } from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const PoseDisplay = ({ stream, canvasRef, isLoading, setIsLoading }) => {
  const [model, setModel] = useState(null);
  const [selectedModel, setSelectedModel] = useState('MoveNet');
  const videoRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
      }
      await tf.ready();
      let model;
      switch (selectedModel) {
        case 'MoveNet':
          model = await createDetector(SupportedModels.MoveNet);
          break;
        case 'BlazePose':
          const model_type = SupportedModels.BlazePose;
          const detectorConfig = {
            runtime: 'tfjs',
            enableSmoothing: true,
            modelType: 'full'
          };
          model = await createDetector(model_type, detectorConfig);
          break;
        case 'PoseNet':
          model = await createDetector(SupportedModels.PoseNet);
          break;
      }
      setModel(model);
      setIsLoading(false);
    };
    loadModel();
  }, [selectedModel, setIsLoading]);

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

  const detectFrame = async (canvas, model) => {
    const predictions = await model.estimatePoses(canvas);
    if (!isLoading) {
      drawKeypoints(predictions, canvas);
    }
  };

  const drawKeypoints = (predictions, canvas) => {
    const ctx = canvas.getContext('2d');
    predictions.forEach(prediction => {
      const keypoints = prediction.keypoints;
      keypoints.forEach(keypoint => {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'aqua';
        ctx.fill();
      });
      drawSkeleton(keypoints, ctx, selectedModel);
    });
  };

  const drawSkeleton = (keypoints, ctx, model) => {
    let pairs;
    switch (model) {
      case 'MoveNet':
      case 'PoseNet':
        pairs = [
          [0, 1], [1, 3], [0, 2], [2, 4], [0, 5], [5, 7], [7, 9], [5, 11], [11, 13], [13, 15],
          [0, 6], [6, 8], [8, 10], [6, 12], [12, 14], [14, 16]
        ];
        break;
      case 'BlazePose':
        pairs = [
          [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], [11, 12],
          [12, 24], [24, 23], [23, 11], [24, 26], [26, 28], [28, 32], [32, 30], [30, 28],
          [23, 25], [25, 27], [27, 31], [31, 29], [29, 27], [11, 13], [13, 15], [15, 17], [12, 14],
          [14, 16], [16, 18], [18, 20], [20, 22], [22, 16], [16, 19], [19, 21], [21, 17]
        ];
        break;
    }
    pairs.forEach(pair => {
      const [start, end] = pair;
      if (keypoints[start] && keypoints[end]) {
        ctx.beginPath();
        ctx.moveTo(keypoints[start].x, keypoints[start].y);
        ctx.lineTo(keypoints[end].x, keypoints[end].y);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  return (
    <div>
      <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
        <option value="MoveNet">MoveNet</option>
        <option value="BlazePose">BlazePose</option>
        <option value="PoseNet">PoseNet</option>
      </select>
    </div>
  );
};

export default PoseDisplay;