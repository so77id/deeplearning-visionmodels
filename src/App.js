// src/App.js

import React, { useEffect, useState, useRef } from 'react';
import ModelDisplay from './components/ModelDisplay';

const App = () => {
  const videoRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error fetching devices or permissions denied: ', error);
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    if (selectedDeviceId) {
      const startStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: selectedDeviceId } }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setStream(stream);
        } catch (error) {
          console.error('Error starting video stream: ', error);
        }
      };
      startStream();
    }
  }, [selectedDeviceId]);

  return (
    <div>
      <select
        onChange={e => setSelectedDeviceId(e.target.value)}
        value={selectedDeviceId}
      >
        {devices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${device.deviceId}`}
          </option>
        ))}
      </select>
      <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
      <ModelDisplay stream={stream} />
    </div>
  );
};

export default App;