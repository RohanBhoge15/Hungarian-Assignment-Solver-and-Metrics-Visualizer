# Hungarian Method Visualizer

A comprehensive web-based visualizer for the Hungarian Algorithm (Assignment Problem) with full step-by-step walkthrough, analytics, and interactive features.

## Features

### 🎯 Core Functionality
- **Interactive Matrix Input**: Manual entry, examples, and random generation
- **Step-by-Step Visualization**: Complete algorithm walkthrough with animations
- **Real-time Analytics**: Performance metrics, complexity analysis, and convergence tracking
- **Mathematical Explanations**: Detailed reasoning for each algorithm step
- **Export Options**: JSON, CSV, and PDF report generation

### 🔧 Algorithm Implementation
- Full Hungarian algorithm with step tracking
- Row and column reduction phases
- Line coverage using König's theorem
- Matrix adjustment with dual variable tracking
- Optimal assignment extraction

### 📊 Analytics & Metrics
- **High-precision execution time** measurement (microsecond accuracy)
- **Iteration count tracking** (matrix adjustment cycles)
- **Dynamic cost progression** visualization through algorithm steps
- Zero density evolution tracking
- Frobenius norm progression
- **Enhanced operation count breakdown** with balanced pie charts
- Performance scoring and efficiency ratios
- Memory usage estimation
- **Real-time step-by-step cost analysis**

### 🎨 User Interface
- Responsive design (mobile + desktop)
- Dark/light theme support
- Accessibility features (ARIA, keyboard navigation)
- Interactive charts and visualizations
- Real-time matrix highlighting

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup Instructions

1. **Clone or download the project**
   ```bash
   cd hungarian_visualizer
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   # Option 1: Direct execution
   python app.py
   
   # Option 2: Using run script
   python run.py
   
   # Option 3: On Windows, use batch file
   start.bat
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## Usage Guide

### Getting Started

1. **Select Matrix Size**: Choose from 3×3 to 8×8 matrices
2. **Load Matrix**: 
   - Use "Example" for predefined test cases
   - Use "Random" to generate new matrices
   - Manually edit values in the grid
3. **Solve Algorithm**: Click "Solve Algorithm" to start the visualization
4. **Navigate Steps**: Use controls to move through algorithm steps

### Interface Components

#### Matrix Input Panel
- Interactive grid for manual matrix entry
- Validation with error/warning messages
- Keyboard navigation support

#### Step Navigation
- Play/pause animation with speed control
- Step-by-step navigation buttons
- Progress bar and step counter
- Keyboard shortcuts (←/→ arrows, spacebar)

#### Visualization Panel
- Animated matrix updates
- Color-coded cell highlighting
- Annotations toggle
- Mathematical explanations

#### Analytics Dashboard
- **Real-time performance metrics** with 5 key indicators:
  - **Execution Time**: Microsecond precision (μs/ms auto-scaling)
  - **Total Steps**: Complete algorithm phase count
  - **Final Cost**: Optimal assignment cost
  - **Efficiency**: Zero density percentage
  - **Iterations**: Matrix adjustment cycle count
- **Interactive charts and graphs**:
  - Cost progression through algorithm steps
  - Zero density evolution
  - Operation distribution pie chart
  - Algorithm progress visualization
- **Step-wise analysis** with detailed breakdowns
- **Enhanced complexity breakdown** with balanced operation counting

### Keyboard Shortcuts

- `←` Previous step
- `→` Next step
- `Space` Play/Pause animation
- `Home` First step
- `End` Last step

### Export Options

- **JSON**: Complete algorithm data and analytics
- **CSV**: Assignment results and step summary
- **PDF**: Full report with visualizations

## Algorithm Details

### Hungarian Method Steps

1. **Row Reduction**: Subtract minimum value from each row
2. **Column Reduction**: Subtract minimum value from each column
3. **Line Coverage**: Find minimum lines to cover all zeros
4. **Matrix Adjustment**: Create new zeros using uncovered minimum
5. **Assignment Extraction**: Find optimal assignment

### Mathematical Foundation

The Hungarian algorithm is based on:
- **König's Theorem**: Maximum matching equals minimum vertex cover
- **LP Duality**: Primal-dual relationship in linear programming
- **Optimality Conditions**: Complementary slackness

### Complexity Analysis

- **Time Complexity**: O(n³)
- **Space Complexity**: O(n²)
- **Guaranteed Optimal**: Yes, always finds minimum cost assignment

## Technical Architecture

### Backend (Python/Flask)
- `app.py`: Main Flask application and API endpoints
- `hungarian_algorithm.py`: Core algorithm implementation
- `analytics.py`: Performance metrics and analysis
- `matrix_generator.py`: Matrix generation and examples

### Frontend (HTML/CSS/JavaScript)
- `templates/index.html`: Main application template
- `static/css/style.css`: Comprehensive styling with theme support
- `static/js/app.js`: Main application controller
- `static/js/matrix-input.js`: Matrix input component
- `static/js/visualization.js`: Matrix visualization component
- `static/js/analytics.js`: Analytics display component
- `static/js/export.js`: Export functionality

### Key Features

#### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly controls

#### Accessibility
- ARIA labels and roles
- Keyboard navigation
- High contrast support
- Screen reader compatibility

#### Performance
- Efficient matrix operations
- Lazy loading of visualizations
- Optimized animations
- Memory usage tracking

## API Endpoints

### Matrix Operations
- `POST /api/generate_matrix`: Generate random matrix
- `POST /api/get_example`: Get example matrix
- `POST /api/validate_matrix`: Validate matrix input

### Algorithm Execution
- `POST /api/solve`: Solve Hungarian algorithm with full tracking

## Configuration

### Matrix Generation
- Size range: 3×3 to 8×8 (configurable)
- Value range: 0-999 (configurable)
- Random seed: System time (ensures uniqueness)

### Animation Settings
- Speed control: 1-10 scale
- Transition duration: 300ms default
- Step delay: 100-1000ms range

### Theme Support
- Light/dark mode toggle
- CSS custom properties
- Persistent user preference

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port in app.py or kill existing process
   python app.py  # Will show error with PID to kill
   ```

2. **Missing dependencies**
   ```bash
   pip install -r requirements.txt --upgrade
   ```

3. **Matrix validation errors**
   - Ensure matrix is square
   - Check for non-negative values
   - Verify size limits (≤8×8)

4. **Performance issues**
   - Use smaller matrices for testing
   - Disable animations for large matrices
   - Check browser console for errors

### Browser Compatibility

- **Recommended**: Chrome 90+, Firefox 88+, Safari 14+
- **Required**: ES6 support, CSS Grid, Flexbox
- **Features**: Local Storage, Canvas API, Web Workers (optional)

## Development

### Project Structure
```
hungarian_visualizer/
├── __pycache__/           # Python cache files
├── analytics.py           # Performance metrics and analysis engine
├── app.py                 # Main Flask application and API endpoints
├── hungarian_algorithm.py # Core Hungarian algorithm implementation
├── matrix_generator.py    # Matrix generation utilities and examples
├── README.md              # Project documentation
├── requirements.txt       # Python dependencies
├── run.py                 # Alternative run script
├── start.bat              # Windows batch file to start application
├── static/                # Static web assets
│   ├── css/
│   │   └── style.css      # Comprehensive styling with theme support
│   └── js/
│       ├── analytics.js   # Analytics display component
│       ├── app.js         # Main application controller
│       ├── export.js      # Export functionality (JSON, CSV, PDF)
│       ├── matrix-input.js # Matrix input handling component
│       └── visualization.js # Matrix visualization component
└── templates/
    └── index.html         # Main application template
```

### Adding Features

1. **New Matrix Types**: Extend `matrix_generator.py`
2. **Additional Analytics**: Modify `analytics.py`
3. **Export Formats**: Update `export.js`
4. **Visualization Options**: Enhance `visualization.js`

### Testing

The application includes comprehensive validation:
- Matrix input validation
- Algorithm correctness verification
- Performance benchmarking
- Cross-browser compatibility

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Support

For questions or issues:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all dependencies are installed
4. Verify Python version compatibility

---

**Hungarian Method Visualizer** - Making algorithm learning interactive and accessible!