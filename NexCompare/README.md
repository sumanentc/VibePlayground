# NexCompare

NexCompare is a modern web application that allows users to compare and format different types of files. With intuitive visualization and color-coded differences, NexCompare makes it easy to understand changes between files.

## Features

- **File Comparison**: Compare two files side-by-side or in a unified view with color highlighting
- **File Formatting**: Format and pretty-print your files for improved readability
- **Multiple File Formats**: Support for YAML, JSON, and plain text files
- **Color Coding**: Red highlighting for removed content, green for added content
- **Multiple Views**: Toggle between side-by-side and unified views

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/NexCompare.git
   cd NexCompare
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:4040
   ```

**Note:** NexCompare is a pure JavaScript/React application with no Python dependencies. All file parsing, comparison, and formatting is handled client-side in the browser.

## How to Use

### Comparing Files

1. **Start**: Click the "Get Started" button on the welcome screen
2. **Select Operation**: Choose "Compare Files"
3. **Select File Type**: Choose the format of your files (YAML, JSON, or Text)
4. **Input Content**: Upload your files or paste the content directly
   - You can upload files using the "Choose File" buttons
   - Or you can paste content directly into the text areas
5. **Compare**: Click "Compare" to see the differences
6. **View Results**: 
   - The differences will be highlighted (red for removed, green for added)
   - Toggle between "Side by Side" and "Unified" views using the tabs

### Formatting Files

1. **Start**: Click the "Get Started" button on the welcome screen
2. **Select Operation**: Choose "Format Files"
3. **Select File Type**: Choose the format of your file (YAML, JSON, or Text)
4. **Input Content**: Upload your file or paste the content directly
5. **Format**: Click "Format" to prettify your file
6. **View Results**: The formatted file will be displayed
7. **Export**: You can export the formatted content for use elsewhere

## Smart JSON Handling

NexCompare includes intelligent JSON repair capabilities that automatically fix common syntax issues:

- **Unquoted Property Names**: Automatically adds double quotes around property names (`{property: value}` → `{"property": value}`) 
- **Single Quote Conversion**: Converts single quotes to proper double quotes for string values (`{'key': 'value'}` → `{"key": "value"}`) 
- **Trailing Comma Removal**: Removes invalid trailing commas in objects and arrays (`{"key": value,}` → `{"key": value}`) 
- **Detailed Error Messages**: When repair isn't possible, provides specific error messages that identify which file has issues

This smart repair system makes NexCompare much more forgiving when dealing with slightly malformed JSON files, especially those written in JavaScript style without strict JSON syntax.

## Troubleshooting

- **White Screen**: If you encounter a white screen, try clearing your browser cache or using a different browser
- **JSON Parse Errors**: If you get JSON parsing errors, check if your JSON is valid or use properly formatted JSON. The application will attempt to repair common issues automatically.
- **Port Issues**: If port 4040 is already in use, you can change the port in the `webpack.config.js` file
- **Comparison Not Working**: Ensure both files are of the same format type (both JSON, both YAML, etc.)
- **Server Starting Issues**: If the webpack dev server fails to start, check that no other process is using the specified port
- **Development Environment**: This application requires Node.js and npm to run locally. No backend server or additional services are required.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React
- Uses js-yaml for YAML processing
- Uses diff for generating text differences

## Project Structure

```
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── Welcome.js      # Welcome screen
│   │   ├── OperationSelection.js # Operation selection
│   │   ├── FileTypeSelection.js # File type selection
│   │   ├── ContentInput.js # Content input component
│   │   └── Controls.css    # Shared component styles
│   ├── App.js              # Main application logic
│   ├── App.css             # Application styles
│   └── index.js            # Entry point
├── webpack.config.js       # Webpack configuration
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Updates and Changes

### Latest Updates (May 2025)
- Improved JSON handling with smart repair for common syntax errors
- Enhanced error messages with specific details
- Simplified UI with focus on side-by-side and unified comparison views
- Removed export functionality from comparison results
- Added comprehensive documentation
