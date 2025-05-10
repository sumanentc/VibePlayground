import React from 'react';
import './OperationSelection.css';

function OperationSelection({ onOperationSelect }) {
  return (
    <div className="operation-selection-container">
      <h2>Select Operation</h2>
      <p className="description">Choose what you'd like to do with your files</p>
      
      <div className="operations">
        <div 
          className="operation-card"
          onClick={() => onOperationSelect('compare')}
        >
          <div className="operation-icon">🔄</div>
          <h3>Compare Files</h3>
          <p>Compare two files and see differences in structured format</p>
          <div className="operation-examples">
            <span>Example uses:</span>
            <ul>
              <li>Compare configuration files</li>
              <li>Track code changes</li>
              <li>Review document versions</li>
            </ul>
          </div>
          <button className="select-button">Select</button>
        </div>
        
        <div 
          className="operation-card"
          onClick={() => onOperationSelect('format')}
        >
          <div className="operation-icon">✨</div>
          <h3>Format Files</h3>
          <p>Format and beautify your files with customizable formatting options</p>
          <div className="operation-examples">
            <span>Example uses:</span>
            <ul>
              <li>Format poorly structured files</li>
              <li>Make JSON/YAML readable</li>
              <li>Standardize code formatting</li>
            </ul>
          </div>
          <button className="select-button">Select</button>
        </div>
      </div>
      
      <div className="quick-start">
        <h3>Quick Start Templates</h3>
        <div className="template-buttons">
          <button onClick={() => onOperationSelect('quick-compare-yaml')}>
            Compare YAML Files
          </button>
          <button onClick={() => onOperationSelect('quick-compare-json')}>
            Compare JSON Files
          </button>
          <button onClick={() => onOperationSelect('quick-format-json')}>
            Format JSON
          </button>
        </div>
      </div>
    </div>
  );
}

export default OperationSelection;
