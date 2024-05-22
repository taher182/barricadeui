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
  const [entryStreamActive, setEntryStreamActive] = useState(false);
  const [exitStreamActive, setExitStreamActive] = useState(false);
  const [entryDisabled, setEntryDisabled] = useState(false);
  const [exitDisabled, setExitDisabled] = useState(false);

  const [movementDetected, setMovementDetected] = useState(false);

  useEffect(() => {
    const startEntryStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: entryCamera } });
        if (entryVideoRef.current) {
          entryVideoRef.current.srcObject = stream;
          entryVideoRef.current.play();
        }
      } catch (error) {
        console.error('Error accessing entry camera:', error);
        toast.error('Error accessing entry camera');
      }
    };

    if (entryStreamActive) {
      startEntryStream();
    }

    return () => {
      if (entryVideoRef.current && entryVideoRef.current.srcObject) {
        const stream = entryVideoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
  }, [entryCamera, entryStreamActive]);

  useEffect(() => {
    const startExitStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: exitCamera } });
        if (exitVideoRef.current) {
          exitVideoRef.current.srcObject = stream;
          exitVideoRef.current.play();
        }
      } catch (error) {
        console.error('Error accessing exit camera:', error);
        toast.error('Error accessing exit camera');
      }
    };

    if (exitStreamActive) {
      startExitStream();
    }

    return () => {
      if (exitVideoRef.current && exitVideoRef.current.srcObject) {
        const stream = exitVideoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
  }, [exitCamera, exitStreamActive]);

  const handleEntryCameraChange = (event) => {
    setEntryCamera(event.target.value);
  };

  const handleExitCameraChange = (event) => {
    setExitCamera(event.target.value);
  };

  const toggleEntryStream = () => {
    setEntryStreamActive(!entryStreamActive);
  };

  const toggleExitStream = () => {
    setExitStreamActive(!exitStreamActive);
  };

  const recognizePlate = async (imageData, cameraType) => {
    try {
      const formData = new FormData();
      formData.append('upload', imageData);

      const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
        method: 'POST',
        headers: {
          Authorization: 'Token 465ceb1e87d760bfd0112914577fb8671a54a45b',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const plate = data.results[0].plate.toUpperCase();
        toast.success(`Detected License Plate: ${plate}`);
        checkNumberPlate(plate, cameraType);
      } else {
        throw new Error('Failed to recognize license plate');
      }
    } catch (error) {
      console.error('Error recognizing plate:', error);
      toast.error('Error recognizing plate');
    }
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

  const checkNumberPlate = (plate, cameraType) => {
    let formData = new FormData();
    formData.append('number_plate', plate);

    let url = `${BASE_URL}/checknumberplate`;
    axios
      .post(url, formData)
      .then((response) => {
        toast.success('License Plate exists in database');
        if (cameraType === 'entry') {
          setExitDisabled(true);
          setTimeout(() => setExitDisabled(false), 16000);
        } else {
          setEntryDisabled(true);
          setTimeout(() => setEntryDisabled(false), 16000);
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
    let url = 'http://192.168.170.89/signal';

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

  const handleMovementDetection = () => {
    if (!movementDetected) {
      setMovementDetected(true);
      captureFrameAndRecognizePlate('entry', entryVideoRef);
      captureFrameAndRecognizePlate('exit', exitVideoRef);
      setTimeout(() => setMovementDetected(false), 8000);
    }
  };

  useEffect(() => {
    const entryIntervalId = setInterval(() => {
      if (entryStreamActive) {
        captureFrameAndRecognizePlate('entry', entryVideoRef);
      }
    }, 8000);

    const exitIntervalId = setInterval(() => {
      if (exitStreamActive) {
        captureFrameAndRecognizePlate('exit', exitVideoRef);
      }
    }, 8000);

    return () => {
      clearInterval(entryIntervalId);
      clearInterval(exitIntervalId);
    };
  }, [entryStreamActive, exitStreamActive]);

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="position-relative" style={{ paddingTop: '56.25%', overflow: 'hidden' }}>
            <video ref={entryVideoRef} className="position-absolute top-0 start-0 w-100 h-100" autoPlay />
          </div>
          <button onClick={toggleEntryStream}>{entryStreamActive ? 'Stop Entry Camera' : 'Start Entry Camera'}</button>
        </div>
        <div className="col-md-6">
          <div className="position-relative" style={{ paddingTop: '56.25%', overflow: 'hidden' }}>
            <video ref={exitVideoRef} className="position-absolute top-0 start-0 w-100 h-100" autoPlay />
          </div>
          <button onClick={toggleExitStream}>{exitStreamActive ? 'Stop Exit Camera' : 'Start Exit Camera'}</button>
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-md-4">
          <label htmlFor="entryCameraSelect" className="form-label">Select Entry Camera:</label>
          <select id="entryCameraSelect" className="form-select" value={entryCamera} onChange={handleEntryCameraChange}>
            {/* Populate options with available camera devices */}
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="exitCameraSelect" className="form-label">Select Exit Camera:</label>
          <select id="exitCameraSelect" className="form-select" value={exitCamera} onChange={handleExitCameraChange}>
            {/* Populate options with available camera devices */}
          </select>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PlateRecognizerStream;
