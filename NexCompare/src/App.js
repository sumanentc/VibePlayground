import React, { useState } from 'react';
import Welcome from './components/Welcome';
import OperationSelection from './components/OperationSelection';
import FileTypeSelection from './components/FileTypeSelection';
import ContentInput from './components/ContentInput';
import jsyaml from 'js-yaml';
import { diffLines } from 'diff';
import './components/Controls.css';
import './App.css';

function App() {
  // User journey state
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedOperation, setSelectedOperation] = useState(null); // 'compare' or 'format'
  const [selectedFileType, setSelectedFileType] = useState(null); // 'yaml', 'json', or 'text'

  // Files and content state
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [content1, setContent1] = useState('');
  const [content2, setContent2] = useState('');
  const [inputMethod, setInputMethod] = useState('upload');
  
  // Results state
  const [comparisonResult, setComparisonResult] = useState(null);
  const [formattedContent, setFormattedContent] = useState(null);
  
  // Helper function to attempt to repair common JSON issues
  const attemptJSONRepair = (jsonString) => {
    try {
      // First try parsing normally
      return JSON.parse(jsonString);
    } catch (e) {
      // Common JSON errors and their fixes:
      // 1. Unquoted property names
      let repaired = jsonString.replace(/([{,])\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
      // 2. Single quotes for strings instead of double quotes
      repaired = repaired.replace(/([{,:]\s*)'([^']*)'(\s*[},])/g, '$1"$2"$3');
      // 3. Trailing commas in objects/arrays
      repaired = repaired.replace(/,\s*([}\]])/g, '$1');
      
      try {
        // Try parsing the repaired JSON
        return JSON.parse(repaired);
      } catch (repairError) {
        // If repair failed, throw the original error for better diagnostics
        throw e;
      }
    }
  };

  // Visualization options
  const [comparisonMode, setComparisonMode] = useState('side-by-side'); // 'side-by-side' | 'unified'

  // Handle progression through user journey
  const handleGetStarted = () => {
    setCurrentStep('operation-selection');
  };

  const handleOperationSelect = (operation) => {
    setSelectedOperation(operation);
    
    if (operation.startsWith('quick-')) {
      // Handle quick start templates
      const [_, action, fileType] = operation.split('-');
      setSelectedOperation(action);
      setSelectedFileType(fileType);
      setCurrentStep('content-input');
    } else {
      setCurrentStep('file-type-selection');
    }
  };

  const handleFileTypeSelect = (fileType) => {
    setSelectedFileType(fileType);
    setCurrentStep('content-input');
  };

  const handleContentSubmit = async (data) => {
    if (data.operation === 'compare') {
      // Handle comparison operation
      setInputMethod(data.inputMethod);
      
      let content1, content2;
      
      if (data.inputMethod === 'upload') {
        setFile1(data.file1);
        setFile2(data.file2);
        content1 = await data.file1.text();
        content2 = await data.file2.text();
      } else {
        setContent1(data.content1);
        setContent2(data.content2);
        content1 = data.content1;
        content2 = data.content2;
      }
      
      processComparison(content1, content2, data.fileType);
    } else {
      // Handle formatting operation
      setInputMethod(data.inputMethod);
      
      let content;
      
      if (data.inputMethod === 'upload') {
        setFile1(data.file1);
        content = await data.file1.text();
      } else {
        setContent1(data.content1);
        content = data.content1;
      }
      
      processFormatting(content, data.fileType);
    }
  };

  const processComparison = (content1, content2, fileType) => {
    try {
      // Parse files based on type
      let parsed1, parsed2;
      switch (fileType) {
        case 'yaml':
          parsed1 = jsyaml.load(content1);
          parsed2 = jsyaml.load(content2);
          break;
        case 'json':
          try {
            // Validate and normalize JSON input before parsing
            const trimmedContent1 = content1.trim();
            if (!trimmedContent1.startsWith('{') && !trimmedContent1.startsWith('[')) {
              throw new Error('First file does not appear to be valid JSON. JSON must start with { or [');
            }
            
            // Use repair function to handle common JSON syntax issues
            try {
              parsed1 = attemptJSONRepair(trimmedContent1);
            } catch (error) {
              throw new Error(`Error in first file: ${error.message}`);
            }
            
            const trimmedContent2 = content2.trim();
            if (!trimmedContent2.startsWith('{') && !trimmedContent2.startsWith('[')) {
              throw new Error('Second file does not appear to be valid JSON. JSON must start with { or [');
            }
            
            // Use repair function to handle common JSON syntax issues
            try {
              parsed2 = attemptJSONRepair(trimmedContent2);
            } catch (error) {
              throw new Error(`Error in second file: ${error.message}`);
            }
          } catch (jsonError) {
            throw new Error(`JSON parsing error: ${jsonError.message}`);
          }
          break;
        default: // text
          parsed1 = content1;
          parsed2 = content2;
      }

      // Generate comparison result
      const comparison = generateComparison(parsed1, parsed2, fileType);
      const unifiedContent = generateUnifiedDiff(content1, content2);
      
      setComparisonResult({
        comparison,
        unifiedContent,
        leftContent: typeof parsed1 === 'string' ? parsed1 : JSON.stringify(parsed1, null, 2),
        rightContent: typeof parsed2 === 'string' ? parsed2 : JSON.stringify(parsed2, null, 2),
        fileType
      });
      
      setCurrentStep('comparison-result');
    } catch (error) {
      console.error('Error comparing files:', error);
      alert(`Error comparing files: ${error.message}`);
    }
  };

  const processFormatting = (content, fileType) => {
    try {
      let formatted;
      
      switch (fileType) {
        case 'yaml':
          const parsedYaml = jsyaml.load(content);
          formatted = jsyaml.dump(parsedYaml, { indent: 2 });
          break;
        case 'json':
          try {
            // Validate and normalize JSON input before parsing
            const trimmedContent = content.trim();
            if (!trimmedContent.startsWith('{') && !trimmedContent.startsWith('[')) {
              throw new Error('Input does not appear to be valid JSON. JSON must start with { or [');
            }
            
            // Use repair function to handle common JSON syntax issues
            const parsedJson = attemptJSONRepair(trimmedContent);
            formatted = JSON.stringify(parsedJson, null, 2);
          } catch (jsonError) {
            throw new Error(`JSON parsing error: ${jsonError.message}`);
          }
          break;
        default: // text
          // For text, just maintain the original with consistent line endings
          formatted = content.replace(/\r\n|\r/g, '\n');
      }
      
      setFormattedContent({
        original: content,
        formatted,
        fileType
      });
      
      setCurrentStep('format-result');
    } catch (error) {
      console.error('Error formatting file:', error);
      alert(`Error formatting file: ${error.message}`);
    }
  };

  const generateComparison = (file1, file2, fileType) => {
    let comparison = [];
    
    switch (fileType) {
      case 'yaml':
      case 'json':
        // Convert to JSON string for comparison
        const json1 = typeof file1 === 'string' ? file1 : JSON.stringify(file1, null, 2);
        const json2 = typeof file2 === 'string' ? file2 : JSON.stringify(file2, null, 2);
        comparison = generateDiff(json1, json2);
        break;
      default:
        // For text files, use direct comparison
        comparison = generateDiff(file1, file2);
    }

    return comparison;
  };

  const generateUnifiedDiff = (content1, content2) => {
    const diffResult = diffLines(content1, content2);
    return diffResult.map(part => 
      part.added ? `+ ${part.value}` : 
      part.removed ? `- ${part.value}` : 
      `  ${part.value}`
    ).join('');
  };

  const generateDiff = (content1, content2) => {
    const diffResult = diffLines(content1, content2);
    const changes = [];
    let currentChange = null;
    
    diffResult.forEach((part, index) => {
      if (part.added || part.removed) {
        if (!currentChange) {
          currentChange = {
            type: part.added ? 'added' : 'removed',
            x: index % 10,
            y: Math.floor(index / 10),
            z: 0,
            content: part.value,
            connections: []
          };
          changes.push(currentChange);
        } else {
          currentChange.content += part.value;
        }
      } else {
        currentChange = null;
      }
    });

    // Create connections between changes
    // Note: Connection creation code for 3D view removed
    // as it's no longer needed

    return changes;
  };

  const handleReset = () => {
    setCurrentStep('welcome');
    setSelectedOperation(null);
    setSelectedFileType(null);
    setFile1(null);
    setFile2(null);
    setContent1('');
    setContent2('');
    setComparisonResult(null);
    setFormattedContent(null);
  };

  // Render different components based on the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <Welcome onGetStarted={handleGetStarted} />;
      
      case 'operation-selection':
        return <OperationSelection onOperationSelect={handleOperationSelect} />;
      
      case 'file-type-selection':
        return <FileTypeSelection 
          operation={selectedOperation} 
          onFileTypeSelect={handleFileTypeSelect} 
        />;
      
      case 'content-input':
        return <ContentInput 
          operation={selectedOperation}
          fileType={selectedFileType}
          onContentSubmit={handleContentSubmit}
        />;
      
      case 'comparison-result':
        return (
          <div className="result-container">
            <div className="result-header">
              <h2>{selectedFileType.toUpperCase()} Comparison Results</h2>
            </div>
            
            <div className="result-content">
              <div className="result-views">
                <div className="result-tabs">
                  <button 
                    className={`tab-button ${comparisonMode === 'side-by-side' ? 'active' : ''}`}
                    onClick={() => setComparisonMode('side-by-side')}
                  >
                    Side by Side
                  </button>
                  <button 
                    className={`tab-button ${comparisonMode === 'unified' ? 'active' : ''}`}
                    onClick={() => setComparisonMode('unified')}
                  >
                    Unified View
                  </button>
                </div>
                
                {comparisonMode === 'side-by-side' && (
                  <div className="side-by-side-view">
                    <div className="file-view">
                      <h3>File 1</h3>
                      <div className="code-container">
                        {comparisonResult.leftContent.split('\n').map((line, index) => {
                          // Check if this line is in a diff section by looking for matching line in right content
                          const isDifferent = !comparisonResult.rightContent.split('\n').includes(line);
                          return (
                            <div 
                              key={`left-${index}`} 
                              className={`code-line ${isDifferent ? 'highlighted removed' : ''}`}
                            >
                              {line}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="file-view">
                      <h3>File 2</h3>
                      <div className="code-container">
                        {comparisonResult.rightContent.split('\n').map((line, index) => {
                          // Check if this line is in a diff section by looking for matching line in left content
                          const isDifferent = !comparisonResult.leftContent.split('\n').includes(line);
                          return (
                            <div 
                              key={`right-${index}`} 
                              className={`code-line ${isDifferent ? 'highlighted added' : ''}`}
                            >
                              {line}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {comparisonMode === 'unified' && (
                  <div className="unified-view">
                    <div className="code-container">
                      {comparisonResult.unifiedContent.split('\n').map((line, index) => {
                        let lineClass = '';
                        if (line.startsWith('+ ')) {
                          lineClass = 'highlighted added';
                        } else if (line.startsWith('- ')) {
                          lineClass = 'highlighted removed';
                        }
                        return (
                          <div 
                            key={`unified-${index}`} 
                            className={`code-line ${lineClass}`}
                          >
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="result-footer">
              <button className="reset-button" onClick={handleReset}>Start New Comparison</button>
            </div>
          </div>
        );
      
      case 'format-result':
        return (
          <div className="result-container">
            <div className="result-header">
              <h2>{selectedFileType.toUpperCase()} Formatting Results</h2>
            </div>
            
            <div className="result-content">
              <div className="format-result-view">
                <pre>{formattedContent.formatted}</pre>
              </div>
            </div>
            
            <div className="result-footer">
              <button className="copy-button" onClick={() => {
                navigator.clipboard.writeText(formattedContent.formatted);
                alert('Formatted content copied to clipboard!');
              }}>Copy to Clipboard</button>
              <button className="download-button" onClick={() => {
                const blob = new Blob([formattedContent.formatted], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `formatted.${selectedFileType}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}>Download</button>
              <button className="reset-button" onClick={handleReset}>Format Another File</button>
            </div>
          </div>
        );
      
      default:
        return <p>Something went wrong. Please refresh the page.</p>;
    }
  };

  return (
    <div className="app-container">
      {renderCurrentStep()}
    </div>
  );
}

export default App;
