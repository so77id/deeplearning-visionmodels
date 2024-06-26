import React, { useEffect, useState, useRef } from 'react';
import { createDetector, SupportedModels } from '@tensorflow-models/face-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const MediaPipeFaceDetectorDisplay = ({ stream, canvasRef, isLoading, setIsLoading }) => {
  const [model, setModel] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
      }
      await tf.ready();
      const model = await createDetector(SupportedModels.MediaPipeFaceDetector, { runtime: 'tfjs' });
      setModel(model);
      setIsLoading(false);
    };
    loadModel();
  }, [setIsLoading]);

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
    const predictions = await model.estimateFaces(canvas);
    if (!isLoading) {
      drawBoundingBoxes(predictions, canvas);
    }
  };

  const drawBoundingBoxes = (predictions, canvas) => {
    const ctx = canvas.getContext('2d');
    predictions.forEach(prediction => {
     const { xMin, xMax, yMin, yMax, width, height } = prediction.box;
      ctx.rect(xMin, yMin, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      ctx.stroke();
  
      prediction.keypoints.forEach(keypoint => {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI); // 5 is the radius of the circle
        ctx.fillStyle = 'green';
        ctx.fill();
      });
    });
  };

  return (
    <div>
    </div>
  );
};

export default MediaPipeFaceDetectorDisplay;