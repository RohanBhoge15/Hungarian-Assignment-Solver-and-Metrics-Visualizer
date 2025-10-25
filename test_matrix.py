import numpy as np
import sys
sys.path.insert(0, r'c:\Users\rohan\OneDrive\Desktop\OR Mini Project\hungarian_visualizer')

from hungarian_algorithm import HungarianAlgorithm

# Your test matrix
matrix = np.array([
    [13, 8, 16, 18, 19],
    [9, 15, 24, 9, 12],
    [12, 9, 4, 4, 4],
    [6, 12, 10, 8, 13],
    [15, 17, 18, 12, 20]
])

print('Input Matrix:')
print(matrix)
print()

hungarian = HungarianAlgorithm(matrix)
steps, assignment, total_cost = hungarian.solve_with_steps()

print('Assignment found:', assignment)
print('Total Cost:', total_cost)
print()
print('Expected: 42')
print('Got:', total_cost)
print()

# Verify the assignment
print('Assignment breakdown:')
for i, j in assignment:
    print(f'  Row {i} -> Col {j}: Cost = {matrix[i, j]}')
