from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import time
import base64
import io
import matplotlib
import time
from time import perf_counter
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from hungarian_algorithm import HungarianAlgorithm
from analytics import AnalyticsTracker
from matrix_generator import MatrixGenerator

app = Flask(__name__)
CORS(app)

# Configure matplotlib for better plots
try:
    plt.style.use('seaborn-v0_8')
except:
    try:
        plt.style.use('seaborn')
    except:
        pass  # Use default style if seaborn styles not available

try:
    sns.set_palette("husl")
except:
    pass  # Use default palette if not available

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate_matrix', methods=['POST'])
def generate_matrix():
    """Generate a new random matrix"""
    try:
        data = request.get_json()
        size = data.get('size', 4)
        min_val = data.get('min_val', 1)
        max_val = data.get('max_val', 20)
        
        generator = MatrixGenerator()
        matrix = generator.generate_random_matrix(size, min_val, max_val)
        
        return jsonify({
            'success': True,
            'matrix': matrix.tolist(),
            'size': size
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/get_example', methods=['POST'])
def get_example():
    """Get predefined example matrices"""
    try:
        data = request.get_json()
        size = data.get('size', 3)
        
        generator = MatrixGenerator()
        matrix = generator.get_example_matrix(size)
        
        return jsonify({
            'success': True,
            'matrix': matrix.tolist(),
            'size': size
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/solve', methods=['POST'])
def solve_hungarian():
    """Solve Hungarian algorithm with full step tracking"""
    try:
        print("Starting Hungarian algorithm solve...")
        data = request.get_json()
        matrix = np.array(data['matrix'])
        print(f"Matrix shape: {matrix.shape}")
        print(f"Matrix:\n{matrix}")
        
        # Validate matrix
        if not _validate_matrix(matrix):
            return jsonify({'success': False, 'error': 'Invalid matrix format'}), 400
        
        # Initialize algorithm and analytics
        print("Initializing Hungarian algorithm...")
        hungarian = HungarianAlgorithm(matrix)
        analytics = AnalyticsTracker()
        
        # Solve with step tracking using high-precision timer
        print("Starting algorithm execution...")
        start_time = perf_counter()
        steps, assignment, total_cost = hungarian.solve_with_steps()
        end_time = perf_counter()
        execution_time = end_time - start_time
        print(f"Algorithm completed in {execution_time:.6f} seconds")
        print(f"Steps: {len(steps)}, Assignment: {assignment}, Total cost: {total_cost}")
        
        # Calculate analytics
        print("Calculating analytics...")
        analytics.calculate_metrics(steps, end_time - start_time, matrix)
        
        # Generate visualizations
        print("Generating charts...")
        charts = _generate_charts(steps, analytics)
        
        print("Returning results...")
        return jsonify({
            'success': True,
            'steps': steps,
            'assignment': assignment,
            'total_cost': int(total_cost),
            'analytics': analytics.get_metrics(),
            'charts': charts,
            'execution_time': end_time - start_time
        })
        
    except Exception as e:
        print(f"Error in solve_hungarian: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/validate_matrix', methods=['POST'])
def validate_matrix():
    """Validate user input matrix"""
    try:
        data = request.get_json()
        matrix = np.array(data['matrix'])
        
        validation_result = _validate_matrix(matrix, detailed=True)
        
        return jsonify({
            'success': True,
            'valid': validation_result['valid'],
            'warnings': validation_result.get('warnings', []),
            'errors': validation_result.get('errors', [])
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

def _validate_matrix(matrix, detailed=False):
    """Validate matrix format and constraints"""
    errors = []
    warnings = []
    
    # Check if matrix is square
    if matrix.shape[0] != matrix.shape[1]:
        errors.append("Matrix must be square")
    
    # Check size constraints
    if matrix.shape[0] > 10:
        errors.append("Matrix size must be ≤ 10 for clarity")
    
    # Check for non-negative values
    if np.any(matrix < 0):
        errors.append("Matrix values must be non-negative")
    
    # Check for non-integer values
    if not np.all(matrix == matrix.astype(int)):
        warnings.append("Non-integer values detected")
    
    # Check for duplicate rows/columns (warning only)
    for i in range(matrix.shape[0]):
        for j in range(i+1, matrix.shape[0]):
            if np.array_equal(matrix[i], matrix[j]):
                warnings.append(f"Duplicate rows detected: {i+1} and {j+1}")
            if np.array_equal(matrix[:, i], matrix[:, j]):
                warnings.append(f"Duplicate columns detected: {i+1} and {j+1}")
    
    if detailed:
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    return len(errors) == 0

def _generate_charts(steps, analytics):
    """Generate base64 encoded charts"""
    charts = {}
    
    try:
        # Cost reduction chart
        costs = [step.get('total_cost', 0) for step in steps]
        if costs:
            fig, ax = plt.subplots(figsize=(10, 6))
            ax.plot(range(len(costs)), costs, marker='o', linewidth=2, markersize=6)
            ax.set_xlabel('Algorithm Step')
            ax.set_ylabel('Matrix Sum / Assignment Cost')
            ax.set_title('Cost Progression Through Algorithm Steps')
            ax.grid(True, alpha=0.3)
            
            # Add annotations for key steps
            step_types = [step.get('type', '') for step in steps]
            for i, step_type in enumerate(step_types):
                if step_type in ['initial', 'row_reduction', 'column_reduction', 'assignment_extraction']:
                    ax.annotate(step_type.replace('_', ' ').title(), 
                               (i, costs[i]), 
                               textcoords="offset points", 
                               xytext=(0,10), 
                               ha='center', 
                               fontsize=8, 
                               alpha=0.7)
            
            charts['cost_reduction'] = _fig_to_base64(fig)
            plt.close(fig)
        
        # Zero density evolution
        zero_densities = [step.get('zero_density', 0) for step in steps]
        if zero_densities:
            fig, ax = plt.subplots(figsize=(10, 6))
            ax.plot(range(len(zero_densities)), zero_densities, marker='s', 
                   linewidth=2, markersize=6, color='green')
            ax.set_xlabel('Step')
            ax.set_ylabel('Zero Density')
            ax.set_title('Zero Density Evolution')
            ax.grid(True, alpha=0.3)
            charts['zero_density'] = _fig_to_base64(fig)
            plt.close(fig)
        
        # Matrix heatmap for final step
        if steps:
            final_matrix = np.array(steps[-1]['matrix'])
            fig, ax = plt.subplots(figsize=(8, 8))
            # Convert to integers for display, handle floats properly
            display_matrix = np.round(final_matrix).astype(int)
            sns.heatmap(display_matrix, annot=True, fmt='d', cmap='viridis', 
                       square=True, ax=ax)
            ax.set_title('Final Matrix State')
            charts['final_heatmap'] = _fig_to_base64(fig)
            plt.close(fig)
        
    except Exception as e:
        print(f"Error generating charts: {e}")
    
    return charts

def _fig_to_base64(fig):
    """Convert matplotlib figure to base64 string"""
    img_buffer = io.BytesIO()
    fig.savefig(img_buffer, format='png', bbox_inches='tight', dpi=150)
    img_buffer.seek(0)
    img_str = base64.b64encode(img_buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)