// Matrix Input Component
class MatrixInput {
    constructor(app) {
        this.app = app;
        this.currentSize = 4;
        this.matrixData = [];
        
        this.createMatrixInput(this.currentSize);
    }
    
    createMatrixInput(size) {
        this.currentSize = size;
        this.matrixData = this.initializeMatrix(size);
        
        const container = document.getElementById('matrix-input-container');
        container.innerHTML = '';
        
        const matrixGrid = document.createElement('div');
        matrixGrid.className = 'matrix-grid';
        matrixGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'matrix-cell';
                input.min = '0';
                input.max = '999';
                input.value = this.matrixData[i][j];
                input.dataset.row = i;
                input.dataset.col = j;
                
                // Add event listeners
                input.addEventListener('input', (e) => {
                    this.updateMatrixData(i, j, parseInt(e.target.value) || 0);
                });
                
                input.addEventListener('focus', (e) => {
                    e.target.select();
                });
                
                // Keyboard navigation
                input.addEventListener('keydown', (e) => {
                    this.handleKeyNavigation(e, i, j, size);
                });
                
                matrixGrid.appendChild(input);
            }
        }
        
        container.appendChild(matrixGrid);
    }
    
    initializeMatrix(size) {
        const matrix = [];
        for (let i = 0; i < size; i++) {
            matrix[i] = [];
            for (let j = 0; j < size; j++) {
                matrix[i][j] = Math.floor(Math.random() * 20) + 1;
            }
        }
        return matrix;
    }
    
    updateMatrixData(row, col, value) {
        if (value < 0) value = 0;
        if (value > 999) value = 999;
        
        this.matrixData[row][col] = value;
        
        // Update the input field to reflect any corrections
        const input = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (input && parseInt(input.value) !== value) {
            input.value = value;
        }
    }
    
    handleKeyNavigation(e, row, col, size) {
        let newRow = row;
        let newCol = col;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                newRow = Math.min(size - 1, row + 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                newCol = Math.min(size - 1, col + 1);
                break;
            case 'Enter':
                e.preventDefault();
                newRow = row + 1 < size ? row + 1 : 0;
                newCol = row + 1 < size ? col : (col + 1) % size;
                break;
            case 'Tab':
                // Let default tab behavior handle this
                return;
            default:
                return;
        }
        
        const nextInput = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    }
    
    populateMatrix(matrix) {
        this.matrixData = matrix.map(row => [...row]); // Deep copy
        
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                const input = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (input) {
                    input.value = matrix[i][j];
                }
            }
        }
    }
    
    getMatrixData() {
        // Get current values from input fields to ensure we have the latest data
        const inputs = document.querySelectorAll('.matrix-cell');
        const matrix = [];
        
        for (let i = 0; i < this.currentSize; i++) {
            matrix[i] = [];
            for (let j = 0; j < this.currentSize; j++) {
                const input = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                matrix[i][j] = parseInt(input.value) || 0;
            }
        }
        
        this.matrixData = matrix;
        return matrix;
    }
    
    validateInput(value) {
        const num = parseInt(value);
        if (isNaN(num)) return 0;
        if (num < 0) return 0;
        if (num > 999) return 999;
        return num;
    }
    
    clearMatrix() {
        for (let i = 0; i < this.currentSize; i++) {
            for (let j = 0; j < this.currentSize; j++) {
                const input = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (input) {
                    input.value = 0;
                }
                this.matrixData[i][j] = 0;
            }
        }
    }
    
    fillMatrix(value) {
        for (let i = 0; i < this.currentSize; i++) {
            for (let j = 0; j < this.currentSize; j++) {
                const input = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (input) {
                    input.value = value;
                }
                this.matrixData[i][j] = value;
            }
        }
    }
    
    randomizeMatrix(min = 1, max = 20) {
        for (let i = 0; i < this.currentSize; i++) {
            for (let j = 0; j < this.currentSize; j++) {
                const value = Math.floor(Math.random() * (max - min + 1)) + min;
                const input = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (input) {
                    input.value = value;
                }
                this.matrixData[i][j] = value;
            }
        }
    }
    
    highlightCell(row, col, className = 'highlight') {
        const input = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (input) {
            input.classList.add(className);
            setTimeout(() => {
                input.classList.remove(className);
            }, 1000);
        }
    }
    
    highlightRow(row, className = 'highlight-row') {
        for (let j = 0; j < this.currentSize; j++) {
            const input = document.querySelector(`[data-row="${row}"][data-col="${j}"]`);
            if (input) {
                input.classList.add(className);
            }
        }
        
        setTimeout(() => {
            for (let j = 0; j < this.currentSize; j++) {
                const input = document.querySelector(`[data-row="${row}"][data-col="${j}"]`);
                if (input) {
                    input.classList.remove(className);
                }
            }
        }, 1000);
    }
    
    highlightColumn(col, className = 'highlight-col') {
        for (let i = 0; i < this.currentSize; i++) {
            const input = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
            if (input) {
                input.classList.add(className);
            }
        }
        
        setTimeout(() => {
            for (let i = 0; i < this.currentSize; i++) {
                const input = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
                if (input) {
                    input.classList.remove(className);
                }
            }
        }, 1000);
    }
    
    setReadOnly(readonly = true) {
        const inputs = document.querySelectorAll('.matrix-cell');
        inputs.forEach(input => {
            input.readOnly = readonly;
            if (readonly) {
                input.classList.add('readonly');
            } else {
                input.classList.remove('readonly');
            }
        });
    }
    
    exportMatrix() {
        return {
            size: this.currentSize,
            data: this.getMatrixData(),
            timestamp: new Date().toISOString()
        };
    }
    
    importMatrix(matrixData) {
        if (matrixData.size !== this.currentSize) {
            this.createMatrixInput(matrixData.size);
        }
        this.populateMatrix(matrixData.data);
    }
    
    // Utility methods for matrix operations
    getRowSum(row) {
        return this.matrixData[row].reduce((sum, val) => sum + val, 0);
    }
    
    getColumnSum(col) {
        return this.matrixData.reduce((sum, row) => sum + row[col], 0);
    }
    
    getMatrixSum() {
        return this.matrixData.reduce((total, row) => 
            total + row.reduce((sum, val) => sum + val, 0), 0);
    }
    
    getMinValue() {
        return Math.min(...this.matrixData.flat());
    }
    
    getMaxValue() {
        return Math.max(...this.matrixData.flat());
    }
    
    getMatrixStats() {
        const values = this.matrixData.flat();
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        
        return {
            size: this.currentSize,
            min: this.getMinValue(),
            max: this.getMaxValue(),
            sum: sum,
            mean: mean,
            variance: variance,
            standardDeviation: Math.sqrt(variance)
        };
    }
}