import React from 'react';
import './FileTypeSelection.css';

function FileTypeSelection({ operation, onFileTypeSelect }) {
  return (
    <div className="file-type-selection-container">
      <h2>{operation === 'compare' ? 'Compare' : 'Format'} Files</h2>
      <p className="description">Select the type of file you want to {operation === 'compare' ? 'compare' : 'format'}</p>
      
      <div className="file-types">
        <div 
          className="file-type-card"
          onClick={() => onFileTypeSelect('yaml')}
        >
          <div className="file-type-icon">
            <span>YAML</span>
          </div>
          <h3>YAML File</h3>
          <p>YAML Ain't Markup Language - A human-readable data serialization format</p>
          <div className="file-type-info">
            <h4>Example:</h4>
            <pre className="code-example">
{`name: John Doe
age: 30
address:
  street: 123 Main St
  city: Anytown
  country: USA
hobbies:
  - reading
  - hiking`}
            </pre>
          </div>
          <button className="select-button">Select</button>
        </div>
        
        <div 
          className="file-type-card"
          onClick={() => onFileTypeSelect('json')}
        >
          <div className="file-type-icon">
            <span>JSON</span>
          </div>
          <h3>JSON File</h3>
          <p>JavaScript Object Notation - A lightweight data interchange format</p>
          <div className="file-type-info">
            <h4>Example:</h4>
            <pre className="code-example">
{`{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "country": "USA"
  },
  "hobbies": [
    "reading",
    "hiking"
  ]
}`}
            </pre>
          </div>
          <button className="select-button">Select</button>
        </div>
        
        <div 
          className="file-type-card"
          onClick={() => onFileTypeSelect('text')}
        >
          <div className="file-type-icon">
            <span>TXT</span>
          </div>
          <h3>Text File</h3>
          <p>Plain text files with line-by-line comparison capabilities</p>
          <div className="file-type-info">
            <h4>Example:</h4>
            <pre className="code-example">
{`This is a sample text file.
It contains multiple lines of text.
These lines can be compared with another text file.
Line-by-line differences will be highlighted.
`}
            </pre>
          </div>
          <button className="select-button">Select</button>
        </div>
      </div>
    </div>
  );
}

export default FileTypeSelection;
