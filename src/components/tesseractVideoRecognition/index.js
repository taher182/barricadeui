import React, { Component } from 'react';
import Tesseract from 'tesseract.js';

class TesseractVideoRecognition extends Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.stream = null; // Track the stream object
    this.state = {
      error: null // Add error state
    };
  }

  componentDidMount() {
    this.startVideoStream();
    this.intervalId = setInterval(this.captureAndProcessImage, 5000); // Capture image every 5 seconds
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    this.stopVideoStream(); // Stop the video stream when the component unmounts
  }

  startVideoStream = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        this.stream = stream; // Store the stream object
        this.videoRef.current.srcObject = stream;
        this.videoRef.current.play();
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
        this.setState({ error: 'Error accessing camera' }); // Set error state
      });
  };

  stopVideoStream = () => {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop()); // Stop all tracks in the stream
    }
  };

  captureAndProcessImage = () => {
    try {
      const video = this.videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg'); // Convert image to base64 data URL
      
      // Log the captured image data to the console
    //   console.log('Captured Image Data:', imageDataUrl);
      
      this.processImage(imageDataUrl); // Process the captured image
    } catch (error) {
      console.error('Error capturing image:', error);
      this.setState({ error: 'Error capturing image' }); // Set error state
    }
  };
  
  processImage = async (imageDataUrl) => {
    try {
      const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng', {
        // Tesseract.js configuration options
        lang: 'eng', // Language: English
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', // Whitelist characters to improve accuracy
        psm: 6, // Page segmentation mode: Assume a single uniform block of text
        enhance: true, // Enable text enhancement for better recognition
        preserve_interword_spaces: true, // Preserve interword spaces for better text layout
      });
  
      // Log the extracted text to the console
      console.log('Extracted Text:', text);
  
      this.formatCheckAndSendToApi(text, imageDataUrl); // Pass the recognized text and image data to check and send to API
    } catch (error) {
      console.error('Error performing OCR:', error);
      this.setState({ error: 'Error performing OCR' }); // Set error state
    }
  };
  

  formatCheckAndSendToApi = (text, imageDataUrl) => {
    // Example regex pattern for number plate format: xx88 xx8888
    const regexPattern = /^[A-Z]{2}\d{2}\s[A-Z]{2}\d{4}$/;
    if (regexPattern.test(text)) {
      // Send text and image data to API
      console.log('Sending text and image data to API:', text, imageDataUrl);
    }
  };

  render() {
    const { error } = this.state;

    return (
      <div>
        {error && <div>Error: {error}</div>} {/* Display error message */}
        <video ref={this.videoRef} width="640" height="480" />
      </div>
    );
  }
}

export default TesseractVideoRecognition;
