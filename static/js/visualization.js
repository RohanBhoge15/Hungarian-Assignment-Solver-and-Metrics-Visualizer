// Matrix Visualization Component
class MatrixVisualization {
    constructor(app) {
        this.app = app;
        this.showAnnotations = true;
        this.animationDuration = 300;
        this.currentMatrix = null;
        this.currentStep = null;
    }
    
    displayMatrix(matrix, step) {
        this.currentMatrix = matrix;
        this.currentStep = step;
        
        const container = document.getElementById('matrix-display');
        container.innerHTML = '';
        
        const matrixGrid = document.createElement('div');
        matrixGrid.className = 'matrix-display-grid';
        matrixGrid.style.gridTemplateColumns = `repeat(${matrix.length}, 1fr)`;
        
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-display-cell';
                cell.textContent = matrix[i][j];
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // Apply styling based on step data
                this.applyCellStyling(cell, i, j, step);
                
                matrixGrid.appendChild(cell);
            }
        }
        
        container.appendChild(matrixGrid);
        
        // Update annotations if enabled
        if (this.showAnnotations) {
            this.updateAnnotations(step);
        }
        
        // Add animation effect
        this.animateMatrixUpdate(matrixGrid);
    }
    
    applyCellStyling(cell, row, col, step) {
        // Remove all existing classes
        cell.className = 'matrix-display-cell';
        
        const value = this.currentMatrix[row][col];
        
        // Highlight zeros
        if (value === 0) {
            cell.classList.add('zero');
        }
        
        // Apply step-specific styling
        if (step) {
            this.applyStepStyling(cell, row, col, step);
        }
    }
    
    applyStepStyling(cell, row, col, step) {
        const stepType = step.type;
        
        switch (stepType) {
            case 'row_reduction':
                if (step.row_minimums && step.row_minimums[row] > 0) {
                    cell.classList.add('reduced');
                }
                break;
                
            case 'column_reduction':
                if (step.column_minimums && step.column_minimums[col] > 0) {
                    cell.classList.add('reduced');
                }
                break;
                
            case 'line_covering':
                if (step.covered_rows && step.covered_rows.includes(row)) {
                    cell.classList.add('covered-row');
                }
                if (step.covered_columns && step.covered_columns.includes(col)) {
                    cell.classList.add('covered-col');
                }
                break;
                
            case 'matrix_adjustment':
                const isCoveredRow = step.covered_rows && step.covered_rows.includes(row);
                const isCoveredCol = step.covered_columns && step.covered_columns.includes(col);
                
                if (!isCoveredRow && !isCoveredCol) {
                    // Uncovered cell
                    cell.classList.add('reduced');
                } else if (isCoveredRow && isCoveredCol) {
                    // Doubly covered cell
                    cell.classList.add('covered-row', 'covered-col');
                }
                break;
                
            case 'assignment_extraction':
                if (step.assigned_positions) {
                    const isAssigned = step.assigned_positions.some(([r, c]) => r === row && c === col);
                    if (isAssigned) {
                        cell.classList.add('assigned');
                    }
                }
                break;
        }
    }
    
    updateAnnotations(step) {
        const container = document.getElementById('matrix-annotations');
        container.innerHTML = '';
        
        if (!step) return;
        
        const annotationsDiv = document.createElement('div');
        annotationsDiv.className = 'annotations-container';
        
        // Create annotations based on step type
        switch (step.type) {
            case 'row_reduction':
                this.createRowReductionAnnotations(annotationsDiv, step);
                break;
            case 'column_reduction':
                this.createColumnReductionAnnotations(annotationsDiv, step);
                break;
            case 'line_covering':
                this.createLineCoveringAnnotations(annotationsDiv, step);
                break;
            case 'matrix_adjustment':
                this.createMatrixAdjustmentAnnotations(annotationsDiv, step);
                break;
            case 'assignment_extraction':
                this.createAssignmentAnnotations(annotationsDiv, step);
                break;
        }
        
        container.appendChild(annotationsDiv);
    }
    
    createRowReductionAnnotations(container, step) {
        if (!step.row_minimums) return;
        
        const title = document.createElement('h4');
        title.textContent = 'Row Minimums';
        container.appendChild(title);
        
        const list = document.createElement('ul');
        step.row_minimums.forEach((min, index) => {
            const item = document.createElement('li');
            item.textContent = `Row ${index + 1}: ${min}`;
            if (min > 0) {
                item.style.fontWeight = 'bold';
                item.style.color = 'var(--warning-color)';
            }
            list.appendChild(item);
        });
        container.appendChild(list);
        
        if (step.total_reduction) {
            const total = document.createElement('p');
            total.innerHTML = `<strong>Total Reduction: ${step.total_reduction}</strong>`;
            container.appendChild(total);
        }
    }
    
    createColumnReductionAnnotations(container, step) {
        if (!step.column_minimums) return;
        
        const title = document.createElement('h4');
        title.textContent = 'Column Minimums';
        container.appendChild(title);
        
        const list = document.createElement('ul');
        step.column_minimums.forEach((min, index) => {
            const item = document.createElement('li');
            item.textContent = `Column ${index + 1}: ${min}`;
            if (min > 0) {
                item.style.fontWeight = 'bold';
                item.style.color = 'var(--warning-color)';
            }
            list.appendChild(item);
        });
        container.appendChild(list);
        
        if (step.total_reduction) {
            const total = document.createElement('p');
            total.innerHTML = `<strong>Total Reduction: ${step.total_reduction}</strong>`;
            container.appendChild(total);
        }
    }
    
    createLineCoveringAnnotations(container, step) {
        const title = document.createElement('h4');
        title.textContent = 'Line Coverage';
        container.appendChild(title);
        
        if (step.covered_rows && step.covered_rows.length > 0) {
            const rowsP = document.createElement('p');
            rowsP.innerHTML = `<strong>Covered Rows:</strong> ${step.covered_rows.map(r => r + 1).join(', ')}`;
            container.appendChild(rowsP);
        }
        
        if (step.covered_columns && step.covered_columns.length > 0) {
            const colsP = document.createElement('p');
            colsP.innerHTML = `<strong>Covered Columns:</strong> ${step.covered_columns.map(c => c + 1).join(', ')}`;
            container.appendChild(colsP);
        }
        
        if (step.total_lines !== undefined) {
            const totalP = document.createElement('p');
            totalP.innerHTML = `<strong>Total Lines:</strong> ${step.total_lines}`;
            if (step.total_lines === this.currentMatrix.length) {
                totalP.style.color = 'var(--success-color)';
                totalP.innerHTML += ' ✓ (Optimal solution found!)';
            }
            container.appendChild(totalP);
        }
        
        if (step.matching && step.matching.length > 0) {
            const matchingP = document.createElement('p');
            matchingP.innerHTML = `<strong>Current Matching:</strong> ${step.matching.length} assignments`;
            container.appendChild(matchingP);
        }
    }
    
    createMatrixAdjustmentAnnotations(container, step) {
        const title = document.createElement('h4');
        title.textContent = 'Matrix Adjustment';
        container.appendChild(title);
        
        if (step.min_uncovered_value !== undefined) {
            const minP = document.createElement('p');
            minP.innerHTML = `<strong>Minimum Uncovered Value (θ):</strong> ${step.min_uncovered_value}`;
            minP.style.color = 'var(--secondary-color)';
            container.appendChild(minP);
        }
        
        const operationsDiv = document.createElement('div');
        operationsDiv.innerHTML = `
            <p><strong>Operations:</strong></p>
            <ul>
                <li>Subtract θ from uncovered elements</li>
                <li>Add θ to doubly covered elements</li>
                <li>Leave singly covered elements unchanged</li>
            </ul>
        `;
        container.appendChild(operationsDiv);
    }
    
    createAssignmentAnnotations(container, step) {
        const title = document.createElement('h4');
        title.textContent = 'Final Assignment';
        container.appendChild(title);
        
        if (step.assigned_positions && step.assigned_positions.length > 0) {
            const list = document.createElement('ul');
            step.assigned_positions.forEach(([row, col], index) => {
                const item = document.createElement('li');
                const originalCost = this.app.getCurrentMatrix()[row][col];
                item.innerHTML = `Agent ${row + 1} → Task ${col + 1} (Cost: ${originalCost})`;
                item.style.fontWeight = 'bold';
                item.style.color = 'var(--success-color)';
                list.appendChild(item);
            });
            container.appendChild(list);
            
            // Calculate total cost
            const totalCost = step.assigned_positions.reduce((sum, [row, col]) => {
                return sum + this.app.getCurrentMatrix()[row][col];
            }, 0);
            
            const totalP = document.createElement('p');
            totalP.innerHTML = `<strong>Total Cost: ${totalCost}</strong>`;
            totalP.style.fontSize = '1.2em';
            totalP.style.color = 'var(--success-color)';
            container.appendChild(totalP);
        }
    }
    
    animateMatrixUpdate(matrixGrid) {
        // Add entrance animation
        matrixGrid.style.opacity = '0';
        matrixGrid.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            matrixGrid.style.transition = `opacity ${this.animationDuration}ms ease, transform ${this.animationDuration}ms ease`;
            matrixGrid.style.opacity = '1';
            matrixGrid.style.transform = 'scale(1)';
        }, 50);
        
        // Animate individual cells
        const cells = matrixGrid.querySelectorAll('.matrix-display-cell');
        cells.forEach((cell, index) => {
            cell.style.animationDelay = `${index * 20}ms`;
            cell.classList.add('cell-animate');
        });
    }
    
    highlightZeros() {
        const cells = document.querySelectorAll('.matrix-display-cell');
        cells.forEach(cell => {
            if (cell.textContent === '0') {
                cell.classList.add('zero-highlight');
                setTimeout(() => {
                    cell.classList.remove('zero-highlight');
                }, 1000);
            }
        });
    }
    
    highlightAssignment(assignment) {
        assignment.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('assignment-highlight');
                setTimeout(() => {
                    cell.classList.remove('assignment-highlight');
                }, 2000);
            }
        });
    }
    
    toggleAnnotations(show) {
        this.showAnnotations = show;
        const container = document.getElementById('matrix-annotations');
        container.style.display = show ? 'block' : 'none';
        
        if (show && this.currentStep) {
            this.updateAnnotations(this.currentStep);
        }
    }
    
    exportVisualization() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const matrixGrid = document.querySelector('.matrix-display-grid');
        
        if (!matrixGrid) return null;
        
        // Set canvas size
        const rect = matrixGrid.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Draw matrix
        const cells = matrixGrid.querySelectorAll('.matrix-display-cell');
        cells.forEach(cell => {
            const cellRect = cell.getBoundingClientRect();
            const x = cellRect.left - rect.left;
            const y = cellRect.top - rect.top;
            
            // Draw cell background
            ctx.fillStyle = window.getComputedStyle(cell).backgroundColor;
            ctx.fillRect(x, y, cellRect.width, cellRect.height);
            
            // Draw cell border
            ctx.strokeStyle = window.getComputedStyle(cell).borderColor;
            ctx.strokeRect(x, y, cellRect.width, cellRect.height);
            
            // Draw cell text
            ctx.fillStyle = window.getComputedStyle(cell).color;
            ctx.font = window.getComputedStyle(cell).font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                cell.textContent,
                x + cellRect.width / 2,
                y + cellRect.height / 2
            );
        });
        
        return canvas.toDataURL('image/png');
    }
    
    createMatrixHeatmap(matrix) {
        const container = document.getElementById('heatmap-chart');
        if (!container) return;
        
        const max = Math.max(...matrix.flat());
        const min = Math.min(...matrix.flat());
        const range = max - min;
        
        const heatmapGrid = document.createElement('div');
        heatmapGrid.className = 'heatmap-grid';
        heatmapGrid.style.display = 'grid';
        heatmapGrid.style.gridTemplateColumns = `repeat(${matrix.length}, 1fr)`;
        heatmapGrid.style.gap = '1px';
        
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                cell.textContent = matrix[i][j];
                
                // Calculate color intensity
                const intensity = range > 0 ? (matrix[i][j] - min) / range : 0;
                const hue = 240 - (intensity * 240); // Blue to red
                cell.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
                cell.style.color = intensity > 0.5 ? 'white' : 'black';
                cell.style.padding = '8px';
                cell.style.textAlign = 'center';
                cell.style.fontSize = '12px';
                cell.style.fontWeight = 'bold';
                
                heatmapGrid.appendChild(cell);
            }
        }
        
        container.innerHTML = '';
        container.appendChild(heatmapGrid);
    }
    
    // Utility methods
    getMatrixDimensions() {
        return this.currentMatrix ? this.currentMatrix.length : 0;
    }
    
    getCellValue(row, col) {
        return this.currentMatrix && this.currentMatrix[row] ? this.currentMatrix[row][col] : null;
    }
    
    isZero(row, col) {
        return this.getCellValue(row, col) === 0;
    }
}