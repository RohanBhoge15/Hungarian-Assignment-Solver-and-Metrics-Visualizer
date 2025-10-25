import numpy as np
import random
from typing import Dict, List

class MatrixGenerator:
    def __init__(self):
        self.example_matrices = {
            3: [
                np.array([[4, 2, 8], [4, 3, 7], [3, 1, 6]]),
                np.array([[10, 19, 8], [15, 9, 7], [13, 5, 15]]),
                np.array([[7, 4, 3], [8, 6, 5], [4, 2, 1]])
            ],
            4: [
                np.array([[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]]),
                np.array([[82, 83, 69, 92], [77, 37, 49, 92], [11, 69, 5, 86], [8, 9, 98, 23]]),
                np.array([[4, 1, 3, 2], [2, 0, 5, 3], [3, 2, 2, 1], [1, 4, 0, 5]])
            ],
            5: [
                np.array([
                    [12, 7, 9, 7, 9],
                    [8, 9, 6, 6, 6],
                    [7, 17, 12, 14, 6],
                    [15, 14, 6, 6, 10],
                    [4, 10, 7, 10, 9]
                ]),
                np.array([
                    [90, 75, 75, 80, 85],
                    [35, 85, 55, 65, 25],
                    [125, 95, 90, 105, 45],
                    [45, 110, 95, 115, 130],
                    [60, 105, 80, 75, 45]
                ]),
                np.array([
                    [3, 1, 4, 1, 5],
                    [9, 2, 6, 5, 3],
                    [5, 8, 9, 7, 9],
                    [3, 2, 3, 8, 4],
                    [6, 2, 6, 4, 3]
                ])
            ]
        }
    
    def generate_random_matrix(self, size: int, min_val: int = 1, max_val: int = 20) -> np.ndarray:
        """Generate a new random matrix every time"""
        # Ensure we get a different matrix each time
        np.random.seed(None)  # Use system time as seed
        random.seed(None)
        
        # Generate random matrix
        matrix = np.random.randint(min_val, max_val + 1, size=(size, size))
        
        # Add some structure to make it more interesting
        if random.random() < 0.3:  # 30% chance to add some structure
            self._add_structure(matrix, size)
        
        return matrix
    
    def _add_structure(self, matrix: np.ndarray, size: int):
        """Add some interesting structure to the matrix"""
        structure_type = random.choice(['diagonal_bias', 'corner_bias', 'symmetric_bias'])
        
        if structure_type == 'diagonal_bias':
            # Make diagonal elements smaller (better assignment likely on diagonal)
            for i in range(size):
                matrix[i, i] = max(1, matrix[i, i] - random.randint(1, 5))
        
        elif structure_type == 'corner_bias':
            # Make corner elements smaller
            corners = [(0, 0), (0, size-1), (size-1, 0), (size-1, size-1)]
            for i, j in corners:
                matrix[i, j] = max(1, matrix[i, j] - random.randint(2, 7))
        
        elif structure_type == 'symmetric_bias':
            # Add some symmetry
            for i in range(size):
                for j in range(i+1, size):
                    if random.random() < 0.2:  # 20% chance to make symmetric
                        avg = (matrix[i, j] + matrix[j, i]) // 2
                        matrix[i, j] = avg
                        matrix[j, i] = avg
    
    def get_example_matrix(self, size: int, index: int = 0) -> np.ndarray:
        """Get a predefined example matrix"""
        if size not in self.example_matrices:
            # Generate a structured example if size not predefined
            return self._generate_structured_example(size)
        
        examples = self.example_matrices[size]
        if index >= len(examples):
            index = 0
        
        return examples[index].copy()
    
    def _generate_structured_example(self, size: int) -> np.ndarray:
        """Generate a structured example for sizes not predefined"""
        # Create a matrix with known optimal structure
        matrix = np.zeros((size, size), dtype=int)
        
        # Fill with base values
        base_value = 10
        for i in range(size):
            for j in range(size):
                matrix[i, j] = base_value + abs(i - j) * 2
        
        # Add some randomness
        noise = np.random.randint(-3, 4, size=(size, size))
        matrix = np.maximum(matrix + noise, 1)  # Ensure positive values
        
        return matrix
    
    def get_all_examples(self) -> Dict[int, List[np.ndarray]]:
        """Get all predefined example matrices"""
        return {size: [matrix.copy() for matrix in matrices] 
                for size, matrices in self.example_matrices.items()}
    
    def generate_test_cases(self) -> List[Dict]:
        """Generate various test cases for algorithm validation"""
        test_cases = []
        
        # Small matrices
        for size in [3, 4, 5]:
            test_cases.append({
                'name': f'Random {size}x{size}',
                'matrix': self.generate_random_matrix(size),
                'size': size,
                'type': 'random'
            })
            
            test_cases.append({
                'name': f'Example {size}x{size}',
                'matrix': self.get_example_matrix(size),
                'size': size,
                'type': 'example'
            })
        
        # Special cases
        test_cases.extend([
            {
                'name': 'Identity-like 4x4',
                'matrix': self._generate_identity_like(4),
                'size': 4,
                'type': 'special'
            },
            {
                'name': 'High-cost 3x3',
                'matrix': self._generate_high_cost(3),
                'size': 3,
                'type': 'special'
            },
            {
                'name': 'Uniform 5x5',
                'matrix': self._generate_uniform(5),
                'size': 5,
                'type': 'special'
            }
        ])
        
        return test_cases
    
    def _generate_identity_like(self, size: int) -> np.ndarray:
        """Generate matrix where diagonal assignment is optimal"""
        matrix = np.random.randint(10, 20, size=(size, size))
        
        # Make diagonal elements much smaller
        for i in range(size):
            matrix[i, i] = random.randint(1, 3)
        
        return matrix
    
    def _generate_high_cost(self, size: int) -> np.ndarray:
        """Generate matrix with high costs to test algorithm robustness"""
        return np.random.randint(50, 100, size=(size, size))
    
    def _generate_uniform(self, size: int) -> np.ndarray:
        """Generate matrix with uniform values (challenging case)"""
        base_value = 10
        matrix = np.full((size, size), base_value)
        
        # Add small random variations
        noise = np.random.randint(-2, 3, size=(size, size))
        matrix = np.maximum(matrix + noise, 1)
        
        return matrix
    
    def validate_matrix(self, matrix: np.ndarray) -> Dict:
        """Validate matrix properties"""
        validation = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'properties': {}
        }
        
        # Check if square
        if matrix.shape[0] != matrix.shape[1]:
            validation['valid'] = False
            validation['errors'].append('Matrix must be square')
        
        # Check size limits
        if matrix.shape[0] > 10:
            validation['valid'] = False
            validation['errors'].append('Matrix size must be ≤ 10')
        
        # Check for negative values
        if np.any(matrix < 0):
            validation['valid'] = False
            validation['errors'].append('Matrix values must be non-negative')
        
        # Check for very large values
        if np.any(matrix > 1000):
            validation['warnings'].append('Very large values detected (>1000)')
        
        # Calculate properties
        validation['properties'] = {
            'size': matrix.shape[0],
            'min_value': int(np.min(matrix)),
            'max_value': int(np.max(matrix)),
            'mean_value': float(np.mean(matrix)),
            'has_zeros': bool(np.any(matrix == 0)),
            'condition_number': float(np.linalg.cond(matrix)) if matrix.shape[0] > 0 else 0
        }
        
        return validation