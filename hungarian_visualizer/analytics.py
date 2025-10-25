import numpy as np
import time
from typing import List, Dict, Any
import psutil
import os

class AnalyticsTracker:
    def __init__(self):
        self.metrics = {}
        self.process = psutil.Process(os.getpid())
        
    def calculate_metrics(self, steps: List[Dict], execution_time: float, original_matrix: np.ndarray):
        """Calculate comprehensive analytics for the algorithm execution"""
        try:
            n = len(original_matrix)
            
            # Basic metrics
            self.metrics['execution_time'] = execution_time
            self.metrics['num_steps'] = len(steps)
            self.metrics['matrix_size'] = n
            
            # Extract iteration count from final step
            if steps and 'iterations_count' in steps[-1]:
                self.metrics['iterations_count'] = steps[-1]['iterations_count']
            else:
                self.metrics['iterations_count'] = 0
            
            # Step-wise analysis
            self._analyze_steps(steps)
            
            # Complexity analysis
            self._analyze_complexity(steps, n)
            
            # Matrix properties
            self._analyze_matrix_properties(original_matrix, steps)
            
            # Performance metrics
            self._calculate_performance_metrics(steps, execution_time, n)
            
            # Memory analysis
            self._analyze_memory_usage()
            
            # Convergence analysis
            self._analyze_convergence(steps)
            
        except Exception as e:
            print(f"Error in calculate_metrics: {e}")
            # Set basic metrics even if detailed analysis fails
            self.metrics = {
                'execution_time': execution_time,
                'num_steps': len(steps),
                'matrix_size': len(original_matrix),
                'error': str(e)
            }
    
    def _analyze_steps(self, steps: List[Dict]):
        """Analyze step-by-step progression"""
        step_types = {}
        frobenius_norms = []
        zero_densities = []
        
        for step in steps:
            step_type = step.get('type', 'unknown')
            step_types[step_type] = step_types.get(step_type, 0) + 1
            
            frobenius_norms.append(step.get('frobenius_norm', 0))
            zero_densities.append(step.get('zero_density', 0))
        
        self.metrics['step_breakdown'] = step_types
        self.metrics['frobenius_evolution'] = frobenius_norms
        self.metrics['zero_density_evolution'] = zero_densities
        
        # Calculate rates
        if len(frobenius_norms) > 1:
            self.metrics['norm_reduction_rate'] = (frobenius_norms[0] - frobenius_norms[-1]) / len(frobenius_norms)
        else:
            self.metrics['norm_reduction_rate'] = 0
            
        if len(zero_densities) > 1:
            self.metrics['zero_creation_rate'] = (zero_densities[-1] - zero_densities[0]) / len(zero_densities)
        else:
            self.metrics['zero_creation_rate'] = 0
    
    def _analyze_complexity(self, steps: List[Dict], n: int):
        """Analyze algorithmic complexity"""
        # Theoretical complexity: O(n³)
        theoretical_ops = n ** 3
        
        # Estimate actual operations
        actual_ops = 0
        for step in steps:
            if step.get('type') in ['row_reduction', 'column_reduction']:
                actual_ops += n * n  # Matrix operations
            elif step.get('type') == 'line_covering':
                actual_ops += n * n * n  # Matching algorithm
            elif step.get('type') == 'matrix_adjustment':
                actual_ops += n * n  # Matrix scan and update
        
        self.metrics['theoretical_complexity'] = theoretical_ops
        self.metrics['actual_operations'] = actual_ops
        self.metrics['complexity_ratio'] = actual_ops / theoretical_ops if theoretical_ops > 0 else 0
        
        # Operations breakdown
        self.metrics['operations'] = {
            'additions': self._count_operations(steps, 'add'),
            'subtractions': self._count_operations(steps, 'subtract'),
            'comparisons': self._count_operations(steps, 'compare'),
            'assignments': self._count_operations(steps, 'assign')
        }
    
    def _count_operations(self, steps: List[Dict], op_type: str) -> int:
        """Estimate operation counts by step type"""
        count = 0
        n = self.metrics['matrix_size']
        
        for step in steps:
            step_type = step.get('type')
            if step_type in ['row_reduction', 'column_reduction']:
                if op_type in ['subtract', 'add']:
                    count += n * n  # Matrix operations
                elif op_type == 'compare':
                    count += n  # Finding minimums
                elif op_type == 'assign':
                    count += n  # Assigning new values
            elif step_type == 'matrix_adjustment':
                if op_type in ['subtract', 'add']:
                    count += n * n  # Matrix scan and update
                elif op_type == 'compare':
                    count += n * n  # Finding minimum uncovered
                elif op_type == 'assign':
                    count += n * n  # Updating matrix values
            elif step_type == 'line_covering':
                if op_type == 'compare':
                    count += n * n  # Reduced from n³ to n² for more realistic estimates
                elif op_type == 'assign':
                    count += n  # Assignment of line coverage
            elif step_type == 'assignment_extraction':
                if op_type == 'compare':
                    count += n * n  # Finding valid assignments
                elif op_type == 'assign':
                    count += n  # Final assignment creation
        
        return count
    
    def _analyze_matrix_properties(self, original_matrix: np.ndarray, steps: List[Dict]):
        """Analyze matrix properties and transformations"""
        n = len(original_matrix)
        
        # Original matrix properties
        self.metrics['original_properties'] = {
            'mean': float(np.mean(original_matrix)),
            'std': float(np.std(original_matrix)),
            'min': float(np.min(original_matrix)),
            'max': float(np.max(original_matrix)),
            'condition_number': float(np.linalg.cond(original_matrix)),
            'determinant': float(np.linalg.det(original_matrix)),
            'trace': float(np.trace(original_matrix)),
            'frobenius_norm': float(np.linalg.norm(original_matrix, 'fro'))
        }
        
        # Matrix evolution
        if steps:
            final_matrix = np.array(steps[-1]['matrix'])
            self.metrics['final_properties'] = {
                'zeros_count': int(np.sum(final_matrix == 0)),
                'zero_density': float(np.sum(final_matrix == 0) / (n * n)),
                'frobenius_norm': float(np.linalg.norm(final_matrix, 'fro'))
            }
    
    def _calculate_performance_metrics(self, steps: List[Dict], execution_time: float, n: int):
        """Calculate performance and efficiency metrics"""
        # Time per step
        self.metrics['time_per_step'] = execution_time / len(steps) if steps else 0
        
        # Efficiency ratio: zeros created per n²
        final_zeros = 0
        if steps:
            final_matrix = np.array(steps[-1]['matrix'])
            final_zeros = np.sum(final_matrix == 0)
        
        self.metrics['efficiency_ratio'] = final_zeros / (n * n) if n > 0 else 0
        
        # Convergence rate
        if len(steps) > 1:
            self.metrics['convergence_rate'] = 1.0 / len(steps)
        else:
            self.metrics['convergence_rate'] = 1.0
        
        # Steps per matrix dimension
        self.metrics['steps_per_dimension'] = len(steps) / n if n > 0 else 0
        
        # Performance score (higher is better)
        base_score = 100
        time_penalty = min(execution_time * 10, 50)  # Max 50 point penalty
        step_penalty = min((len(steps) - n) * 2, 30)  # Max 30 point penalty
        
        self.metrics['performance_score'] = max(base_score - time_penalty - step_penalty, 0)
    
    def _analyze_memory_usage(self):
        """Analyze memory usage during execution"""
        try:
            memory_info = self.process.memory_info()
            self.metrics['memory_usage'] = {
                'rss': memory_info.rss,  # Resident Set Size
                'vms': memory_info.vms,  # Virtual Memory Size
                'percent': self.process.memory_percent()
            }
        except:
            self.metrics['memory_usage'] = {
                'rss': 0,
                'vms': 0,
                'percent': 0
            }
    
    def _analyze_convergence(self, steps: List[Dict]):
        """Analyze convergence properties"""
        if not steps:
            return
        
        # Track line coverage progression
        line_counts = []
        for step in steps:
            if step.get('type') == 'line_covering':
                line_counts.append(step.get('total_lines', 0))
        
        self.metrics['line_coverage_progression'] = line_counts
        
        # Convergence indicators
        if line_counts:
            self.metrics['convergence_indicators'] = {
                'initial_lines': line_counts[0] if line_counts else 0,
                'final_lines': line_counts[-1] if line_counts else 0,
                'convergence_achieved': line_counts[-1] == self.metrics['matrix_size'] if line_counts else False,
                'iterations_to_converge': len(line_counts)
            }
        
        # Dual variables tracking (simplified)
        self._track_dual_variables(steps)
    
    def _track_dual_variables(self, steps: List[Dict]):
        """Track dual variables for LP insight"""
        # Simplified dual variable tracking
        # In the Hungarian algorithm, dual variables correspond to row and column potentials
        
        dual_evolution = []
        for step in steps:
            if step.get('type') in ['row_reduction', 'column_reduction']:
                matrix = np.array(step['matrix'])
                n = len(matrix)
                
                # Row potentials (simplified)
                row_potentials = [np.min(matrix[i, :]) for i in range(n)]
                col_potentials = [np.min(matrix[:, j]) for j in range(n)]
                
                dual_evolution.append({
                    'row_potentials': row_potentials,
                    'column_potentials': col_potentials,
                    'dual_objective': sum(row_potentials) + sum(col_potentials)
                })
        
        self.metrics['dual_variables'] = dual_evolution
    
    def get_metrics(self) -> Dict[str, Any]:
        """Return all calculated metrics"""
        return self.metrics
    
    def get_summary(self) -> Dict[str, Any]:
        """Return a summary of key metrics"""
        return {
            'execution_time': self.metrics.get('execution_time', 0),
            'num_steps': self.metrics.get('num_steps', 0),
            'performance_score': self.metrics.get('performance_score', 0),
            'efficiency_ratio': self.metrics.get('efficiency_ratio', 0),
            'convergence_rate': self.metrics.get('convergence_rate', 0),
            'final_zero_density': self.metrics.get('final_properties', {}).get('zero_density', 0)
        }