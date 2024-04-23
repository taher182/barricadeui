import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import Tesseract from 'tesseract.js';

const PlateRecognizerStream = () => {
  const videoRef = useRef(null);
  const [recognizedPlates, setRecognizedPlates] = useState([]);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  useEffect(() => {
    const getCameraDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(cameras);
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].deviceId);
        }
      } catch (error) {
        console.error('Error enumerating camera devices:', error);
        toast.error('Error enumerating camera devices');
      }
    };

    getCameraDevices();
  }, []);

  useEffect(() => {
    const startVideoStream = async () => {
      if (!selectedCamera) return;
      
      try {
        const constraints = {
          video: { deviceId: selectedCamera }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        } else {
          console.error('Video element not available');
          toast.error('Video element not available');
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast.error('Error accessing camera');
      }
    };

    startVideoStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
  }, [selectedCamera]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const model = await cocoSsd.load();
        console.log('Model loaded successfully:', model);
        detectObjects(model);
      } catch (error) {
        console.error('Error loading model:', error);
        toast.error('Error loading model');
      }
    };

    const detectObjects = async (model) => {
      const video = videoRef.current;
      if (!video || !video.srcObject) {
        console.error('Video stream not available');
        toast.error('Video stream not available');
        return;
      }

      const stream = video.srcObject;
      const detectFrame = async () => {
        const predictions = await model.detect(video);
        const plates = predictions
          .filter(prediction => ['car', 'truck', 'bicycle'].includes(prediction.class))
          .map(prediction => prediction.bbox);

        if (plates.length > 0) {
          recognizePlates(plates);
        }
        requestAnimationFrame(detectFrame);
      };

      detectFrame();
    };

    const recognizePlates = async (plates) => {
      for (const plate of plates) {
        const canvas = document.createElement('canvas');
        if (plate[2] === 0 || plate[3] === 0) {
          console.error('Invalid plate dimensions:', plate);
          toast.error('Invalid plate dimensions');
          continue;
        }
        canvas.width = plate[2];
        canvas.height = plate[3];

        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, plate[0], plate[1], plate[2], plate[3], 0, 0, plate[2], plate[3]);

        const imageData = canvas.toDataURL('image/jpeg');
        const { data: { text } } = await Tesseract.recognize(imageData);
        console.log('License Plate:', text);
        toast.success(`Detected License Plate: ${text}`);
        setRecognizedPlates(prevPlates => [...prevPlates, text]);
      }
    };

    loadModel();
  }, []);

  const handleCameraChange = (event) => {
    setSelectedCamera(event.target.value);
  };

  return (
    <div>
      <div>
        <label htmlFor="cameraSelect">Select Camera:</label>
        <select id="cameraSelect" value={selectedCamera} onChange={handleCameraChange}>
          {cameraDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
          ))}
        </select>
      </div>
      <video ref={videoRef} width="640" height="480" autoPlay />
      <ToastContainer />
    </div>
  );
};

export default PlateRecognizerStream;
