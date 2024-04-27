import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from '../config';
import axios from 'axios';
const PlateRecognizerStream = () => {
  const videoRef = useRef(null);
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

  const checkNumberPlate = (number_plate) =>{
    // e.preventDefault();
    let formData = new FormData();
    formData.append('number_plate',number_plate);

    let url =  `${BASE_URL}/checknumberplate`
    axios.post(url,formData)
    .then(response =>{
        toast.success("Licence Plate exist in database");
        
    })
    .catch(error =>{
        toast.warning("Licence Plate not found");
    })
  }

  const recognizePlate = async (imageData) => {
    try {
      const formData = new FormData();
      formData.append('upload', imageData); // Add the image data to the form-data object
  
      const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
        method: 'POST',
        headers: {
          Authorization: 'Token 465ceb1e87d760bfd0112914577fb8671a54a45b', // Replace with your Plate Recognizer API token
        },
        body: formData, // Pass the form-data object as the request body
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('License Plate:', data.results[0].plate);
        toast.success(`Detected License Plate: ${data.results[0].plate.toUpperCase()}`);
        checkNumberPlate(data.results[0].plate.toUpperCase());
      } else {
        throw new Error('Failed to recognize license plate');
      }
    } catch (error) {
      console.error('Error recognizing plate:', error);
      toast.error('Error recognizing plate');
    }
  };
  const captureFrameAndRecognizePlate = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
  
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
      const imageData = canvas.toDataURL('image/jpeg'); // Convert canvas to base64 image
      recognizePlate(imageData);
    } catch (error) {
      console.error('Error capturing frame and recognizing plate:', error);
      toast.error('Error capturing frame and recognizing plate');
    }
  };
  
  useEffect(() => {
    const intervalId = setInterval(captureFrameAndRecognizePlate, 8000); // Adjust interval as needed
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="position-relative" style={{ paddingTop: '56.25%', overflow: 'hidden' }}>
            <video ref={videoRef} className="position-absolute top-0 start-0 w-100 h-100" autoPlay />
          </div>
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-md-4">
          <label htmlFor="cameraSelect" className="form-label">Select Camera:</label>
          <select id="cameraSelect" className="form-select" value={selectedCamera} onChange={handleCameraChange}>
            {cameraDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
            ))}
          </select>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PlateRecognizerStream;
