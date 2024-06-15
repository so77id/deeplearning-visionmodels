import React, { useEffect, useState, useRef } from 'react';
import { createDetector, SupportedModels } from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const MoveNetDisplay = ({ stream, canvasRef, isLoading, setIsLoading }) => {
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
      }
      await tf.ready();
      const model = await createDetector(SupportedModels.MoveNet);
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
      drawSkeleton(keypoints, ctx);
    });
  };

  const drawSkeleton = (keypoints, ctx) => {
    const pairs = [
      [0, 1], [1, 3], [0, 2], [2, 4], [0, 5], [5, 7], [7, 9], [5, 11], [11, 13], [13, 15],
      [0, 6], [6, 8], [8, 10], [6, 12], [12, 14], [14, 16]
    ];
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
    </div>
  );
};

export default MoveNetDisplay;