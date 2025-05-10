import React from 'react';
import './Welcome.css';

function Welcome({ onGetStarted }) {
  const appVersion = "1.0.0";
  const lastUpdate = "May 10, 2025";

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>Welcome to NexCompare</h1>
        <p className="description">
          A powerful file comparison and formatting tool with intuitive visualization
        </p>
        <div className="features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Compare Files</h3>
            <p>Compare YAML, JSON, and text files quickly and easily</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🔄</span>
            <h3>Format Files</h3>
            <p>Format and beautify your files with customizable options</p>
          </div>
        </div>
        <button className="get-started-button" onClick={onGetStarted}>
          Get Started
        </button>
        <div className="app-info">
          <p>Version {appVersion} | Last Updated: {lastUpdate}</p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
