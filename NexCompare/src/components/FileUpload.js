import React from 'react';
import './FileUpload.css';

function FileUpload({ onFileUpload, onCompare, file1, file2 }) {
  const handleFileChange = (e, isFile1) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file, isFile1);
    }
  };

  return (
    <div className="file-upload-container">
      <h2>File Comparison</h2>
      <div className="file-input-group">
        <label>File 1:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, true)}
          accept=".yaml,.json,.txt"
          disabled={file1}
        />
        {file1 && (
          <div className="file-info">
            <span className="file-name">{file1.name}</span>
            <span className="file-size">{Math.round(file1.size / 1024)} KB</span>
          </div>
        )}
      </div>

      <div className="file-input-group">
        <label>File 2:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, false)}
          accept=".yaml,.json,.txt"
          disabled={file2}
        />
        {file2 && (
          <div className="file-info">
            <span className="file-name">{file2.name}</span>
            <span className="file-size">{Math.round(file2.size / 1024)} KB</span>
          </div>
        )}
      </div>

      <button
        onClick={onCompare}
        disabled={!file1 || !file2}
        className="compare-button"
      >
        Compare Files
      </button>
    </div>
  );
}

export default FileUpload;
