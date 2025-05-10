import React, { useState, useRef } from 'react';
import './ContentInput.css';

function ContentInput({ operation, fileType, onContentSubmit }) {
  const [inputMethod, setInputMethod] = useState('upload');
  const [files, setFiles] = useState({ file1: null, file2: null });
  const [contents, setContents] = useState({ content1: '', content2: '' });
  const [dragActive, setDragActive] = useState({ file1: false, file2: false });
  
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const handleFileChange = (e, fileNumber) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [`file${fileNumber}`]: file }));
      // Read file content for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setContents(prev => ({ ...prev, [`content${fileNumber}`]: event.target.result }));
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e, fileNumber, isDragActive) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [`file${fileNumber}`]: isDragActive }));
  };

  const handleDrop = (e, fileNumber) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [`file${fileNumber}`]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFiles(prev => ({ ...prev, [`file${fileNumber}`]: file }));
      
      // Read file content for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setContents(prev => ({ ...prev, [`content${fileNumber}`]: event.target.result }));
      };
      reader.readAsText(file);
    }
  };

  const handleContentChange = (e, contentNumber) => {
    setContents(prev => ({ ...prev, [`content${contentNumber}`]: e.target.value }));
  };

  const handleSubmit = () => {
    if (operation === 'compare') {
      const data = {
        fileType,
        operation,
        inputMethod,
        file1: files.file1,
        file2: files.file2,
        content1: contents.content1,
        content2: contents.content2
      };
      onContentSubmit(data);
    } else {
      // Format operation only needs one file/content
      const data = {
        fileType,
        operation,
        inputMethod,
        file1: files.file1,
        content1: contents.content1
      };
      onContentSubmit(data);
    }
  };

  const isSubmitDisabled = () => {
    if (inputMethod === 'upload') {
      return operation === 'compare' 
        ? !files.file1 || !files.file2 
        : !files.file1;
    } else {
      return operation === 'compare' 
        ? !contents.content1.trim() || !contents.content2.trim() 
        : !contents.content1.trim();
    }
  };

  const getFileInputSection = (fileNumber) => (
    <div 
      className={`file-drop-area ${dragActive[`file${fileNumber}`] ? 'drag-active' : ''}`}
      onDragEnter={(e) => handleDrag(e, fileNumber, true)}
      onDragOver={(e) => handleDrag(e, fileNumber, true)}
      onDragLeave={(e) => handleDrag(e, fileNumber, false)}
      onDrop={(e) => handleDrop(e, fileNumber)}
    >
      <input
        type="file"
        className="file-input"
        accept={fileType === 'yaml' ? '.yaml,.yml' : fileType === 'json' ? '.json' : '.txt'}
        onChange={(e) => handleFileChange(e, fileNumber)}
        ref={fileNumber === 1 ? fileInputRef1 : fileInputRef2}
      />
      
      {files[`file${fileNumber}`] ? (
        <div className="file-preview">
          <div className="file-info">
            <div className="file-name">{files[`file${fileNumber}`].name}</div>
            <div className="file-size">{Math.round(files[`file${fileNumber}`].size / 1024)} KB</div>
          </div>
          <div className="file-content-preview">
            <pre>{contents[`content${fileNumber}`].substring(0, 200)}...</pre>
          </div>
          <button 
            className="change-file-btn"
            onClick={() => fileNumber === 1 ? fileInputRef1.current.click() : fileInputRef2.current.click()}
          >
            Change File
          </button>
        </div>
      ) : (
        <div className="drop-message" onClick={() => fileNumber === 1 ? fileInputRef1.current.click() : fileInputRef2.current.click()}>
          <span className="upload-icon">📂</span>
          <p>Drag & drop your {fileType.toUpperCase()} file here, or click to browse</p>
        </div>
      )}
    </div>
  );

  const getContentInputSection = (contentNumber) => (
    <div className="content-input-area">
      <label>{contentNumber === 1 ? "Content" : "Compare with"}</label>
      <textarea
        placeholder={`Paste your ${fileType.toUpperCase()} content here...`}
        value={contents[`content${contentNumber}`]}
        onChange={(e) => handleContentChange(e, contentNumber)}
      />
    </div>
  );

  return (
    <div className="content-input-container">
      <h2>{operation === 'compare' ? 'Compare' : 'Format'} {fileType.toUpperCase()} {operation === 'compare' ? 'Files' : 'File'}</h2>
      
      <div className="input-method-selector">
        <button 
          className={`method-button ${inputMethod === 'upload' ? 'active' : ''}`}
          onClick={() => setInputMethod('upload')}
        >
          Upload Files
        </button>
        <button 
          className={`method-button ${inputMethod === 'paste' ? 'active' : ''}`}
          onClick={() => setInputMethod('paste')}
        >
          Paste Content
        </button>
      </div>
      
      <div className="input-content">
        {inputMethod === 'upload' ? (
          <div className="upload-section">
            {getFileInputSection(1)}
            {operation === 'compare' && getFileInputSection(2)}
          </div>
        ) : (
          <div className="paste-section">
            {getContentInputSection(1)}
            {operation === 'compare' && getContentInputSection(2)}
          </div>
        )}
      </div>
      
      <div className="submit-section">
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled()}
        >
          {operation === 'compare' ? 'Compare Now' : 'Format Now'}
        </button>
      </div>
    </div>
  );
}

export default ContentInput;
