# NexCompare - Technical Design Document

## Overview
This document outlines the technical design for NexCompare, a streamlined file comparison application that provides intuitive visualization and comparison of various file formats including YAML, JSON, and text files. The application focuses on providing clear, color-highlighted differences in both side-by-side and unified views.

## System Architecture

### Frontend Components
1. **UI Components**
   - File Upload Interface
   - File Type Selection
   - Action Selection (Compare, Format)
   - Comparison Results Tabs (Side-by-Side and Unified Views)
   - Color-Highlighted Difference Display

2. **Visualization System**
   - Side-by-Side View with Synchronized Scrolling
   - Unified View with Inline Changes
   - Color-Coded Highlighting (Red for Deletions, Green for Additions)
   - Responsive Layout for Different Screen Sizes

### Backend Components
1. **File Processing Module**
   - File Type Detection
   - File Parsing Engine
   - Comparison Algorithm
   - Formatting Engine

2. **Data Processing Pipeline**
   - Input Validation
   - File Conversion
   - Comparison Logic
   - Result Generation

## Technical Implementation

### File Type Support
1. **YAML Support**
   - Using `js-yaml` library for parsing
   - Hierarchical visualization
   - Key-value pair comparison

2. **JSON Support**
   - Native JavaScript parsing
   - Smart JSON repair functionality
      - Auto-fixing unquoted property names
      - Converting single quotes to double quotes
      - Removing trailing commas
   - Enhanced error handling with specific error messages
   - Object property comparison

3. **Text Support**
   - Line-based comparison
   - Word-level differences
   - Syntax highlighting

### Visualization Features
1. **File Structure Visualization**
   - Color-coded elements for quick identification
   - Line-by-line comparison
   - Syntax-aware formatting

2. **Comparison Visualization**
   - Highlight differences with color coding
   - Side-by-side synchronized scrolling
   - Unified view with inline changes

3. **User Interaction**
   - Tab switching between view modes
   - Reset functionality to start new comparisons
   - Responsive controls for different screen sizes

### User Workflow

#### User Journey
1. **Welcome Screen**
   - Engaging welcome message
   - Brief application description
   - Getting started guidance
   - Application version and last update information

2. **Operation Selection**
   - Clear options for comparison or formatting
   - Visual icons and descriptions for each option
   - Quick-start templates for common operations

3. **File Type Selection**
   - Supported file type options (YAML, JSON, Text)
   - File type descriptions and examples
   - Format-specific capabilities and limitations

4. **Content Input**
   - Multiple input methods:
     - File upload interface with drag-and-drop support
     - Direct content paste area with syntax highlighting
     - URL input for remote file fetching (future enhancement)
   - File size validation and format detection
   - Submit button to process files automatically

5. **Results Display**
    - **For Comparison:**
      - Tab-based navigation between view modes
      - Side-by-side view with color-highlighted differences
      - Unified view with color-highlighted differences
      - Detailed error messages for parsing or comparison failures
      - "Start New Comparison" button for quick reset
    
    - **For Formatting:**
      - Formatted content display with proper indentation
      - Smart error handling with specific error messages
      - Copy to clipboard option
      - Download formatted file option

## Technical Requirements

### Frontend
- React.js for UI components and state management
- CSS for styling and responsive design
- File system access API for file uploads
- diff library for text comparison
- Modern browser support

### Backend
- Node.js runtime
- File processing libraries
- Comparison algorithms
- Memory optimization

## JSON Repair Functionality

### Smart JSON Parsing
1. **Auto-Fix Common Issues**
   - Unquoted property names detection and repair
   - Single-quote to double-quote conversion
   - Trailing comma removal
   - Pre-parsing validation

2. **Error Handling**
   - Specific error messages indicating the exact issue
   - File-specific error identification (first file vs. second file)
   - User-friendly error messages with suggestions
   - Progressive repair attempts before giving up

## Performance Considerations
1. **Memory Management**
   - Lazy loading of file content
   - Chunked file processing
   - Efficient DOM manipulation

2. **Optimization**
   - React component rendering optimization
   - Efficient diff algorithm implementation
   - Responsive UI for different screen sizes

## Intuitive Code Diff Visualization

### Modern Visualization Techniques
1. **Color-Coded Diff Representation**
   - Color-coded changes (red for deletions, green for additions)
   - Line-by-line comparison highlighting
   - Clear visual distinction between different types of changes

2. **Visual Organization**
   - Tab-based navigation between different view modes
   - Structured display with consistent formatting
   - Clean, readable presentation of differences

3. **Interactive Features**
   - Toggle between side-by-side and unified views
   - Start new comparison button for quick workflow
   - Responsive design that works on different screen sizes

4. **Comparison Modes**
   - Side-by-side view with synchronized scrolling
   - Unified view showing changes inline
   - Automatic switching between modes via tabs

5. **Visual Indicators**
   - Highlighted line backgrounds for quick identification
   - Line numbers for precise reference
   - Clear color distinction for added and removed content

6. **User Experience Improvements**
   - Intuitive user journey with clear steps
   - Helpful error messages with specific details
   - Smart JSON repair to handle common syntax issues

7. **Performance Optimizations**
   - Efficient DOM updates for smooth rendering
   - Optimized diff algorithm implementation
   - Smart error handling to prevent application crashes
   - React component optimization

## Security Considerations
1. **File Handling**
   - Input validation
   - File size limits
   - Type checking

2. **Data Protection**
   - Secure file upload
   - Temporary file management
   - Privacy protection

## Future Enhancements
1. **Additional File Formats**
   - XML support
   - CSV support
   - Binary file comparison

2. **Advanced Features**
   - Version control integration
   - Batch comparison
   - Custom comparison rules

3. **UI Improvements**
   - Dark mode support
   - Custom themes
   - Enhanced visualization options

## Development Timeline
1. Phase 1 (2-3 weeks)
   - Basic file upload and processing
   - Simple comparison logic
   - Basic Three.js visualization

2. Phase 2 (2-3 weeks)
   - Advanced comparison features
   - File formatting capabilities
   - Improved visualization

3. Phase 3 (1-2 weeks)
   - UI enhancements
   - Performance optimization
   - Security implementation

## Dependencies
- Three.js (Visualization)
- React.js (UI Framework)
- js-yaml (YAML parsing)
- json-diff (JSON comparison)
- diff (Text comparison)
- Node.js (Backend)

## Conclusion
This technical design document provides a comprehensive overview of the file comparison application using Three.js. The modular architecture allows for easy extension and maintenance while providing a powerful visualization tool for comparing various file formats.
