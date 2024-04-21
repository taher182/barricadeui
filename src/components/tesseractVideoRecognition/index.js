import React, { Component } from 'react';
import Tesseract from 'tesseract.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class TesseractVideoRecognition extends Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.stream = null;
    this.state = {
      error: null,
      cameras: [],
      selectedCamera: null
    };
  }

  componentDidMount() {
    this.loadCameras();
    this.startVideoStream();
    this.intervalId = setInterval(this.captureAndProcessImage, 5000); // Capture image every 5 seconds
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    this.stopVideoStream();
  }

  loadCameras = () => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const cameras = devices.filter(device => device.kind === 'videoinput');
        this.setState({ cameras });
        if (cameras.length > 0) {
          this.setState({ selectedCamera: cameras[0].deviceId });
        }
      })
      .catch(error => {
        console.error('Error enumerating devices:', error);
      });
  };

  startVideoStream = () => {
    const constraints = {
      video: {
        deviceId: this.state.selectedCamera ? { exact: this.state.selectedCamera } : undefined
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.videoRef.current.srcObject = stream;
        this.videoRef.current.play();
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
        this.setState({ error: 'Error accessing camera' });
      });
  };

  stopVideoStream = () => {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  };

  handleCameraChange = (event) => {
    const selectedCamera = event.target.value;
    this.setState({ selectedCamera }, () => {
      this.stopVideoStream();
      this.startVideoStream();
    });
  };

  captureAndProcessImage = () => {
    try {
      const video = this.videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');

      this.processImage(imageDataUrl);
    } catch (error) {
      console.error('Error capturing image:', error);
      this.setState({ error: 'Error capturing image' });
    }
  };

  processImage = async (imageDataUrl) => {
    try {
      const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', {
        lang: 'eng',
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        psm: 6, // Assume a single uniform block of text
        enhance: true, // Enable text enhancement
        preserve_interword_spaces: true // Preserve interword spaces
      });

      console.log('Extracted Text:', text);
      
      toast.info(`Identified Text: ${text}`, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000
      });

      this.formatCheckAndSendToApi(text, imageDataUrl);
    } catch (error) {
      console.error('Error performing OCR:', error);
      this.setState({ error: 'Error performing OCR' });
    }
  };

  formatCheckAndSendToApi = (text, imageDataUrl) => {
    const regexPattern = /^[A-Z]{2}\d{2}\s[A-Z]{2}\d{4}$/;
    if (regexPattern.test(text)) {
      console.log('Sending text and image data to API:', text, imageDataUrl);
    }
  };

  render() {
    const { error, cameras, selectedCamera } = this.state;

    return (
      <div style={{ textAlign: 'center' }}>
        <ToastContainer />
        {error && <div>Error: {error}</div>}
        <video ref={this.videoRef} width="480" height="360" style={{ maxWidth: '100%', borderRadius: '10px' }} />
        {cameras.length > 1 && (
          <select value={selectedCamera} onChange={this.handleCameraChange}>
            {cameras.map(camera => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  } 
}

export default TesseractVideoRecognition;
