import numpy as np
import copy
from typing import List, Tuple, Dict, Any

class HungarianAlgorithm:
    def __init__(self, cost_matrix: np.ndarray):
        self.original_matrix = cost_matrix.copy()
        self.matrix = cost_matrix.astype(float)
        self.n = len(cost_matrix)
        self.steps = []
        self.step_count = 0
        
    def solve_with_steps(self) -> Tuple[List[Dict], List[Tuple], float]:
        """Solve Hungarian algorithm with detailed step tracking"""
        self.steps = []
        self.step_count = 0
        
        # Step 1: Row reduction
        self._row_reduction()
        
        # Step 2: Column reduction
        self._column_reduction()
        
        # Step 3: Iterative optimization
        max_iterations = self.n * 3  # Prevent infinite loops
        iteration = 0
        
        while iteration < max_iterations:
            # Find minimum lines to cover all zeros
            lines = self._find_minimum_lines()
            
            if lines['total_lines'] == self.n:
                # Optimal solution found
                break
            
            # Adjust matrix
            self._adjust_matrix(lines)
            iteration += 1
        
        if iteration >= max_iterations:
            print(f"Warning: Algorithm reached maximum iterations ({max_iterations})")
        
        # Extract assignment
        assignment = self._extract_assignment()
        total_cost = self._calculate_total_cost(assignment)
        
        # Add iteration count to the final step for UI display
        if self.steps:
            self.steps[-1]['iterations_count'] = iteration
        
        return self.steps, assignment, total_cost
    
    def _add_step(self, step_type: str, description: str, matrix: np.ndarray, 
                  additional_data: Dict = None):
        """Add a step to the tracking list"""
        step_data = {
            'step_number': self.step_count,
            'type': step_type,
            'description': description,
            'matrix': matrix.copy().tolist(),
            'zeros': self._find_zeros(matrix),
            'zero_density': np.sum(matrix == 0) / (self.n * self.n),
            'frobenius_norm': np.linalg.norm(matrix, 'fro'),
            'explanation': self._get_step_explanation(step_type, additional_data),
            'total_cost': self._calculate_step_cost(matrix, step_type)
        }
        
        if additional_data:
            step_data.update(additional_data)
        
        self.steps.append(step_data)
        self.step_count += 1
    
    def _row_reduction(self):
        """Step 1: Subtract minimum value from each row"""
        row_mins = np.min(self.matrix, axis=1)
        
        self._add_step('initial', 'Initial cost matrix', self.matrix, {
            'row_minimums': row_mins.tolist()
        })
        
        for i in range(self.n):
            if row_mins[i] > 0:
                self.matrix[i] -= row_mins[i]
        
        self._add_step('row_reduction', 'Row reduction completed', self.matrix, {
            'row_minimums': row_mins.tolist(),
            'total_reduction': np.sum(row_mins)
        })
    
    def _column_reduction(self):
        """Step 2: Subtract minimum value from each column"""
        col_mins = np.min(self.matrix, axis=0)
        
        for j in range(self.n):
            if col_mins[j] > 0:
                self.matrix[:, j] -= col_mins[j]
        
        self._add_step('column_reduction', 'Column reduction completed', self.matrix, {
            'column_minimums': col_mins.tolist(),
            'total_reduction': np.sum(col_mins)
        })
    
    def _find_zeros(self, matrix: np.ndarray) -> List[Tuple]:
        """Find all zero positions in matrix"""
        zeros = []
        for i in range(self.n):
            for j in range(self.n):
                if matrix[i, j] == 0:
                    zeros.append((i, j))
        return zeros
    
    def _find_minimum_lines(self) -> Dict:
        """Find minimum number of lines to cover all zeros"""
        zeros = self._find_zeros(self.matrix)
        
        # Use König's theorem - find maximum matching first
        matching = self._find_maximum_matching()
        
        # Find vertex cover using matching
        covered_rows, covered_cols = self._find_vertex_cover(matching)
        
        lines_data = {
            'covered_rows': covered_rows,
            'covered_columns': covered_cols,
            'total_lines': len(covered_rows) + len(covered_cols),
            'matching': matching
        }
        
        self._add_step('line_covering', 'Finding minimum lines to cover zeros', 
                      self.matrix, lines_data)
        
        return lines_data
    
    def _find_maximum_matching(self) -> List[Tuple]:
        """Find maximum matching in bipartite graph of zeros using Hungarian matching"""
        zeros = self._find_zeros(self.matrix)
        
        # Build adjacency list for rows to columns
        adj = {i: [] for i in range(self.n)}
        for i, j in zeros:
            adj[i].append(j)
        
        # Find matching using augmenting paths with proper DFS
        match_row = [-1] * self.n  # match_row[i] = j means row i is matched to col j
        match_col = [-1] * self.n  # match_col[j] = i means col j is matched to row i
        
        for i in range(self.n):
            visited = [False] * self.n
            self._dfs_augment(i, adj, match_row, match_col, visited)
        
        # Convert to list of tuples
        assignment = []
        for i in range(self.n):
            if match_row[i] != -1:
                assignment.append((i, match_row[i]))
        
        return assignment
    
    def _dfs_augment(self, u: int, adj: Dict, match_row: List, match_col: List, visited: List[bool]) -> bool:
        """DFS for finding augmenting paths in bipartite matching"""
        for v in adj[u]:
            if visited[v]:
                continue
            visited[v] = True
            
            # If v is unmatched or we can find an augmenting path from match_col[v]
            if match_col[v] == -1 or self._dfs_augment(match_col[v], adj, match_row, match_col, visited):
                match_row[u] = v
                match_col[v] = u
                return True
        
        return False
    
    def _find_vertex_cover(self, matching: List[Tuple]) -> Tuple[List, List]:
        """Find minimum vertex cover from maximum matching"""
        matched_rows = set()
        matched_cols = set()
        
        for row, col in matching:
            matched_rows.add(row)
            matched_cols.add(col)
        
        # Find unmatched rows
        unmatched_rows = set(range(self.n)) - matched_rows
        
        # Find alternating paths from unmatched rows
        reachable_rows = set(unmatched_rows)
        reachable_cols = set()
        
        changed = True
        while changed:
            changed = False
            # From reachable rows, find reachable columns via zeros
            for i in reachable_rows:
                for j in range(self.n):
                    if self.matrix[i, j] == 0 and j not in reachable_cols:
                        reachable_cols.add(j)
                        changed = True
            
            # From reachable columns, find reachable rows via matching
            for j in reachable_cols:
                for row, col in matching:
                    if col == j and row not in reachable_rows:
                        reachable_rows.add(row)
                        changed = True
        
        # Vertex cover: non-reachable rows + reachable columns
        covered_rows = [i for i in range(self.n) if i not in reachable_rows]
        covered_cols = list(reachable_cols)
        
        return covered_rows, covered_cols
    
    def _adjust_matrix(self, lines_data: Dict):
        """Adjust matrix by subtracting minimum uncovered value"""
        covered_rows = set(lines_data['covered_rows'])
        covered_cols = set(lines_data['covered_columns'])
        
        # Find minimum uncovered value
        min_uncovered = float('inf')
        for i in range(self.n):
            for j in range(self.n):
                if i not in covered_rows and j not in covered_cols:
                    min_uncovered = min(min_uncovered, self.matrix[i, j])
        
        if min_uncovered == float('inf') or min_uncovered == 0:
            return
        
        # Subtract from uncovered, add to doubly covered
        for i in range(self.n):
            for j in range(self.n):
                if i not in covered_rows and j not in covered_cols:
                    # Uncovered - subtract
                    self.matrix[i, j] -= min_uncovered
                elif i in covered_rows and j in covered_cols:
                    # Doubly covered - add
                    self.matrix[i, j] += min_uncovered
        
        self._add_step('matrix_adjustment', 'Matrix adjustment completed', 
                      self.matrix, {
                          'min_uncovered_value': min_uncovered,
                          'covered_rows': lines_data['covered_rows'],
                          'covered_columns': lines_data['covered_columns']
                      })
    
    def _extract_assignment(self) -> List[Tuple]:
        """Extract final assignment from matrix using maximum cardinality matching"""
        # Use maximum matching to find optimal assignment from zeros
        assignment = self._find_maximum_matching()
        
        self._add_step('assignment_extraction', 'Final assignment extracted', 
                      self.matrix, {
                          'assignment': assignment,
                          'assigned_positions': assignment
                      })
        
        return assignment
    
    def _calculate_total_cost(self, assignment: List[Tuple]) -> float:
        """Calculate total cost of assignment"""
        total_cost = 0
        for i, j in assignment:
            total_cost += self.original_matrix[i, j]
        return total_cost
    
    def _calculate_step_cost(self, matrix: np.ndarray, step_type: str) -> float:
        """Calculate meaningful cost metric for each step"""
        # For initial step, use original matrix sum as baseline
        if step_type == 'initial':
            return float(np.sum(self.original_matrix))
        
        # For other steps, calculate matrix sum (represents remaining cost potential)
        # This will show reduction as algorithm progresses
        matrix_sum = float(np.sum(matrix))
        
        # For assignment extraction, try to calculate actual assignment cost if possible
        if step_type == 'assignment_extraction':
            try:
                # Try to find a valid assignment from current zeros
                zeros = self._find_zeros(matrix)
                temp_assignment = []
                used_rows = set()
                used_cols = set()
                
                # Greedy assignment for cost calculation
                for i, j in zeros:
                    if i not in used_rows and j not in used_cols:
                        temp_assignment.append((i, j))
                        used_rows.add(i)
                        used_cols.add(j)
                
                # If we have a complete assignment, calculate its cost
                if len(temp_assignment) == self.n:
                    assignment_cost = 0
                    for i, j in temp_assignment:
                        assignment_cost += self.original_matrix[i, j]
                    return float(assignment_cost)
            except:
                pass
        
        # Default: return matrix sum (shows algorithmic progress)
        return matrix_sum
    
    def _get_step_explanation(self, step_type: str, data: Dict = None) -> str:
        """Generate mathematical explanation for each step"""
        explanations = {
            'initial': "Starting with the original cost matrix C. The Hungarian algorithm finds the minimum cost assignment.",
            
            'row_reduction': "Row Reduction: For each row i, subtract min(C[i,:]) from all elements in that row. This creates at least one zero in each row without changing the optimal assignment.",
            
            'column_reduction': "Column Reduction: For each column j, subtract min(C[:,j]) from all elements in that column. This ensures at least one zero in each row and column.",
            
            'line_covering': "Line Covering: Find the minimum number of horizontal and vertical lines needed to cover all zeros. If the number of lines equals n, we have an optimal solution.",
            
            'matrix_adjustment': "Matrix Adjustment: Find the minimum uncovered value θ. Subtract θ from all uncovered elements and add θ to all doubly covered elements. This creates new zeros while maintaining optimality.",
            
            'assignment_extraction': "Assignment Extraction: Select n zeros such that no two are in the same row or column. This gives us the optimal assignment with minimum total cost."
        }
        
        base_explanation = explanations.get(step_type, "Algorithm step completed.")
        
        if data and step_type == 'matrix_adjustment':
            base_explanation += f" Minimum uncovered value θ = {data.get('min_uncovered_value', 0)}"
        
        return base_explanation