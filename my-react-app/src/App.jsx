import React, { useState } from 'react';
import './App.css';
import logo from "/logo.png"; 


function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const [chatQuery, setChatQuery] = useState(""); // New state to store user chat input
  const [chatResponse, setChatResponse] = useState(""); // State to store the Gemini response

  
  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    setPrediction(null); // Clear previous prediction
    setError(null); // Clear previous error
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError('Please select an image.');
      return;
    }

    setError(null); // Clear any previous errors
    setPrediction(null); // Clear any previous predictions
    setIsLoading(true); // Start loading

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again."); // Friendly error message
      }

      const data = await response.json();
      setPrediction(data.predicted_class); 
    } catch (err) {
      if (err.message.includes("Unexpected end of JSON input")) {
        setError("The server response was unexpected. Please try again later.");
      } else {
        setError(err.message); // Set a user-friendly error message
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Handle user input and call the chat endpoint
  const handleChatQuery = async () => {
    if (!chatQuery) return; // Don't call the API if there's no query

    const response = await fetch('http://localhost:5173/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: chatQuery })
    });

    const data = await response.json();
    if (data.error) {
      console.error("Error:", data.error);
      setChatResponse("Sorry, something went wrong.");
    } else {
      setChatResponse(data.response); // Set Gemini's response in state
    }
  };

  return (
    <div className="App">
  <header className="App-header">
    <img src={logo} alt="Indian Food Decoder Logo" className="App-logo" />
    <h1>Indian Food Decoder</h1>
    <p>Upload an image of your food, and we will tell you what it is and how to make it!</p>
  </header>

  <section className="upload-section">
    <div className="upload-container">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageChange} 
        className="image-upload-input"
      />
      <button onClick={handleSubmit} className="predict-button">
        <i className="fas fa-search"></i> Predict
      </button>
    </div>

    {isLoading && (
      <p className="loading-message">Analyzing your food... Please wait a few seconds!</p>
    )}

    {error && <p className="error-message">{error}</p>} 

    {prediction !== null && (
      <div className="prediction-result">
        <div className="prediction-card">
          <h3>Predicted Food:</h3>
          <p className='Predicted-food'>{prediction}</p>
        </div>
      </div>
    )}

    {selectedImage && (
      <div className="image-preview">
        <img 
          alt="Uploaded preview" 
          src={URL.createObjectURL(selectedImage)} 
          className="preview-image"
        />
      </div>
    )}
  </section>

  {/* Chat Section */}
  <section className="chat-section">
    <div className="chat-container">
      <input
        type="text"
        value={chatQuery}
        onChange={(e) => setChatQuery(e.target.value)}
        placeholder="Ask me anything about food..."
        className="chat-input"
      />
      <button onClick={handleChatQuery} className="chat-submit-button">
        <i className="fas fa-comment-dots"></i> Ask
      </button>
    </div>

    {chatResponse && (
      <div className="chat-response">
        <h4>Gemini's Response:</h4>
        <p>{chatResponse}</p>
      </div>
    )}
  </section>

  <footer className="App-footer">
    <p>Created with ❤️ for food enthusiasts. Enjoy discovering new dishes!</p>
  </footer>
</div>

  );
}

export default App;
