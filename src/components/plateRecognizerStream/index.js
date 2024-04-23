import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Tesseract from 'tesseract.js';


const PlateRecognizerStream = () => {
  const videoRef = useRef(null);
  const [recognizedPlates, setRecognizedPlates] = useState([]);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  useEffect(() => {
    const startVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedCamera } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
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

  const handleCameraChange = (event) => {
    setSelectedCamera(event.target.value);
  };

  const recognizePlate = async (imageData) => {
    try {
      const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      });
      console.log('Recognized Plate:', text);
      toast.success(`Detected License Plate: ${text}`);
      setRecognizedPlates(prevPlates => [...prevPlates, text]);
    } catch (error) {
      console.error('Error recognizing plate:', error);
      toast.error('Error recognizing plate');
    }
  };

  const processFrame = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
  
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
      const imageData = canvas.toDataURL('image/jpeg'); // Convert canvas to base64 image
      recognizePlate(imageData);
    } catch (error) {
      console.error('Error processing frame:', error);
      toast.error('Error processing frame');
    }
  };
  
  useEffect(() => {
    const intervalId = setInterval(processFrame, 8000); // Adjust interval as needed
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="position-relative" style={{ paddingTop: '56.25%', overflow: 'hidden' }}>
            <video ref={videoRef} className="position-absolute top-0 start-0 w-100 h-100 mb-0" autoPlay />
          </div>
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-md-4">
          {/* <label htmlFor="cameraSelect" className="form-label">Select Camera:</label> */}
          <select id="cameraSelect" className="form-select mb-5 mt-1" value={selectedCamera} onChange={handleCameraChange}>
            {cameraDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
            ))}import 'bootstrap/dist/css/bootstrap.min.css';
          </select>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PlateRecognizerStream;
