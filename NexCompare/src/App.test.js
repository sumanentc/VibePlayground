import React from 'react';
import ReactDOM from 'react-dom';

function TestApp() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
      color: 'white',
      textAlign: 'center'
    }}>
      <div>
        <h1>NexCompare Test Page</h1>
        <p>If you can see this, React is working correctly!</p>
        <button 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'white',
            color: '#1a2a6c',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => alert('Button clicked!')}
        >
          Click me
        </button>
      </div>
    </div>
  );
}

export default TestApp;
