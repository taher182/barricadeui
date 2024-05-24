import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from '../config';
import axios from 'axios';

const PlateRecognizerStream = () => {
  const entryVideoRef = useRef(null);
  const exitVideoRef = useRef(null);
  const [entryCamera, setEntryCamera] = useState(null);
  const [exitCamera, setExitCamera] = useState(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [disabledCamera, setDisabledCamera] = useState(null); // Track disabled camera
  const [disableTimer, setDisableTimer] = useState(null); // Timer to re-enable disabled camera

  useEffect(() => {
    const getCameraDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(cameras);
        if (cameras.length > 0) {
          setEntryCamera(cameras[0].deviceId);
          if (cameras.length > 1) {
            setExitCamera(cameras[1].deviceId);
          }
        }
      } catch (error) {
        console.error('Error enumerating camera devices:', error);
        toast.error('Error enumerating camera devices');
      }
    };

    getCameraDevices(); // Get available camera devices when component mounts
  }, []);

  useEffect(() => {
    if (streamActive) {
      const entryTimer = setInterval(() => {
        captureFrameAndRecognizePlate('entry', entryVideoRef);
      }, 8000); // Capture images from entry camera every 8 seconds

      const exitTimer = setInterval(() => {
        captureFrameAndRecognizePlate('exit', exitVideoRef);
      }, 10000); // Capture images from exit camera every 10 seconds

      return () => {
        clearInterval(entryTimer);
        clearInterval(exitTimer);
      };
    }
  }, [streamActive]);

  const toggleStream = async () => {
    if (streamActive) {
      entryVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      exitVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setStreamActive(false);
    } else {
      try {
        const entryStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: entryCamera } });
        entryVideoRef.current.srcObject = entryStream;
        entryVideoRef.current.play();

        const exitStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: exitCamera } });
        exitVideoRef.current.srcObject = exitStream;
        exitVideoRef.current.play();

        setStreamActive(true);
      } catch (error) {
        console.error('Error accessing cameras:', error);
        toast.error('Error accessing cameras');
      }
    }
  };

  const handleEntryCameraChange = (event) => {
    setEntryCamera(event.target.value);
  };

  const handleExitCameraChange = (event) => {
    setExitCamera(event.target.value);
  };

  const captureFrameAndRecognizePlate = async (cameraType, videoRef) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg');
      recognizePlate(imageData, cameraType);
    } catch (error) {
      console.error('Error capturing frame and recognizing plate:', error);
      toast.error('Error capturing frame and recognizing plate');
    }
  };

  const recognizePlate = async (imageData, cameraType) => {
    try {
      const formData = new FormData();
      formData.append('upload', imageData);

      const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
        method: 'POST',
        headers: {
          Authorization: 'Token 16fa0fc97d1ff21eaa808ad227ecb5d53a733719',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0 && data.results[0].plate) {
          const plate = data.results[0].plate.toUpperCase();
          toast.success(`Detected License Plate: ${plate}`);
          checkNumberPlate(plate, cameraType);
        } else {
          throw new Error('No license plate detected');
        }
      } else {
        throw new Error('Failed to recognize license plate');
      }
    } catch (error) {
      console.error('Error recognizing plate:', error);
      toast.error('Error recognizing plate');
    }
  };

  const checkNumberPlate = (plate, cameraType) => {
  let formData = new FormData();
  formData.append('number_plate', plate);

  let url = `${BASE_URL}/checknumberplate`;
  axios
    .post(url, formData)
    .then((response) => {
      toast.success('License Plate exists in database');
      if (cameraType === 'entry') {
        // Disable the exit camera for 12 seconds
        setDisabledCamera('exit');
        clearTimeout(disableTimer);
        const timer = setTimeout(() => {
          setDisabledCamera(null); // Re-enable the exit camera
        }, 12000);
        setDisableTimer(timer);
      } else if (cameraType === 'exit') {
        // Disable the entry camera for 12 seconds
        setDisabledCamera('entry');
        clearTimeout(disableTimer);
        const timer = setTimeout(() => {
          setDisabledCamera(null); // Re-enable the entry camera
        }, 12000);
        setDisableTimer(timer);
      }
      sendSignalToNodeMCU();
    })
    .catch((error) => {
      toast.warning('License Plate not found');
    });
};

  const sendSignalToNodeMCU = () => {
    let formData = new FormData();
    formData.append('message', 'this is demo');
    let url = 'http://192.168.71.74/signal';

    axios
      .post(url, formData)
      .then((response) => {
        console.log(response.data);
        toast.success('Signal sent');
      })
      .catch((error) => {
        console.error('Error sending signal:', error);
        toast.error('Failed to send signal');
      });
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="position-relative" style={{ paddingTop: '56.25%', overflow: 'hidden' }}>
            <video ref={entryVideoRef} className="position-absolute top-0 start-0 w-100 h-100" autoPlay />
          </div>
          <label htmlFor="entryCameraSelect" className="form-label text-light">Select Entry Camera:</label>
          <select id="entryCameraSelect" className="form-select " value={entryCamera} onChange={handleEntryCameraChange}>
            {cameraDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <div className="position-relative" style={{ paddingTop: '56.25%', overflow: 'hidden' }}>
            <video ref={exitVideoRef} className="position-absolute top-0 start-0 w-100 h-100" autoPlay />
          </div>
          <label htmlFor="exitCameraSelect" className="form-label text-light">Select Exit Camera:</label>
          <select id="exitCameraSelect" className="form-select " value={exitCamera} onChange={handleExitCameraChange}>
            {cameraDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="row justify-content-center mt-3 mb-5">
        <div className="col-md-12 mb-2">
          <center><button className='btn btn-info' onClick={toggleStream}>{streamActive ? 'Stop Cameras' : 'Start Cameras'}</button></center>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PlateRecognizerStream;
