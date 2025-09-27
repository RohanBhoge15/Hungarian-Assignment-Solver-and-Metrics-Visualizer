// Main Application Controller
class HungarianVisualizerApp {
    constructor() {
        this.currentMatrix = null;
        this.algorithmSteps = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.playInterval = null;
        this.animationSpeed = 5;
        this.analytics = null;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupKeyboardShortcuts();
        this.generateInitialMatrix();
        
        // Initialize components
        this.matrixInput = new MatrixInput(this);
        this.visualization = new MatrixVisualization(this);
        this.analyticsDisplay = new AnalyticsDisplay(this);
        this.exportManager = new ExportManager(this);
        
        // Initially disable export buttons
        this.disableExportButtons();
        
        console.log('Hungarian Visualizer App initialized');
    }
    
    setupEventListeners() {
        // Matrix controls
        document.getElementById('matrix-size').addEventListener('change', (e) => {
            this.changeMatrixSize(parseInt(e.target.value));
        });
        
        document.getElementById('load-example').addEventListener('click', () => {
            this.loadExampleMatrix();
        });
        
        document.getElementById('generate-random').addEventListener('click', () => {
            this.generateRandomMatrix();
        });
        
        document.getElementById('solve-btn').addEventListener('click', () => {
            this.solveAlgorithm();
        });
        
        document.getElementById('validate-matrix').addEventListener('click', () => {
            this.validateMatrix();
        });
        
        // Step controls
        document.getElementById('first-step').addEventListener('click', () => {
            this.goToStep(0);
        });
        
        document.getElementById('prev-step').addEventListener('click', () => {
            this.previousStep();
        });
        
        document.getElementById('play-pause').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('next-step').addEventListener('click', () => {
            this.nextStep();
        });
        
        document.getElementById('last-step').addEventListener('click', () => {
            this.goToStep(this.algorithmSteps.length - 1);
        });
        
        // Speed control
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = this.animationSpeed;
            
            if (this.isPlaying) {
                this.stopAnimation();
                this.startAnimation();
            }
        });
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Help modal
        document.getElementById('help-btn').addEventListener('click', () => {
            this.showHelpModal();
        });
        
        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideHelpModal();
        });
        
        // Click outside modal to close
        document.getElementById('help-modal').addEventListener('click', (e) => {
            if (e.target.id === 'help-modal') {
                this.hideHelpModal();
            }
        });
        
        // Annotations toggle
        document.getElementById('toggle-annotations').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            this.visualization.toggleAnnotations(e.target.classList.contains('active'));
        });
        
        // Random settings toggle
        document.getElementById('generate-random').addEventListener('click', () => {
            const settings = document.getElementById('random-settings');
            settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return; // Don't interfere with input fields
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousStep();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextStep();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToStep(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToStep(this.algorithmSteps.length - 1);
                    break;
            }
        });
    }
    
    generateInitialMatrix() {
        const size = parseInt(document.getElementById('matrix-size').value);
        this.generateRandomMatrix(size);
    }
    
    changeMatrixSize(size) {
        this.matrixInput.createMatrixInput(size);
        this.generateRandomMatrix(size);
    }
    
    async loadExampleMatrix() {
        try {
            const size = parseInt(document.getElementById('matrix-size').value);
            
            const response = await fetch('/api/get_example', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ size: size })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentMatrix = data.matrix;
                this.matrixInput.populateMatrix(data.matrix);
                this.showMessage('Example matrix loaded successfully', 'success');
            } else {
                this.showMessage('Error loading example: ' + data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Network error: ' + error.message, 'error');
        }
    }
    
    async generateRandomMatrix() {
        try {
            const size = parseInt(document.getElementById('matrix-size').value);
            const minVal = parseInt(document.getElementById('min-val').value) || 1;
            const maxVal = parseInt(document.getElementById('max-val').value) || 20;
            
            const response = await fetch('/api/generate_matrix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    size: size,
                    min_val: minVal,
                    max_val: maxVal
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentMatrix = data.matrix;
                this.matrixInput.populateMatrix(data.matrix);
                this.showMessage('Random matrix generated successfully', 'success');
            } else {
                this.showMessage('Error generating matrix: ' + data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Network error: ' + error.message, 'error');
        }
    }
    
    async validateMatrix() {
        try {
            const matrix = this.matrixInput.getMatrixData();
            
            const response = await fetch('/api/validate_matrix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ matrix: matrix })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayValidationResults(data);
            } else {
                this.showMessage('Validation error: ' + data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Network error: ' + error.message, 'error');
        }
    }
    
    displayValidationResults(data) {
        const container = document.getElementById('validation-messages');
        container.innerHTML = '';
        
        if (data.valid) {
            this.showValidationMessage('Matrix is valid and ready for solving!', 'success');
        }
        
        data.errors.forEach(error => {
            this.showValidationMessage(error, 'error');
        });
        
        data.warnings.forEach(warning => {
            this.showValidationMessage(warning, 'warning');
        });
    }
    
    showValidationMessage(message, type) {
        const container = document.getElementById('validation-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `validation-message ${type}`;
        messageDiv.textContent = message;
        container.appendChild(messageDiv);
    }
    
    async solveAlgorithm() {
        try {
            console.log('Starting algorithm solve...');
            this.showLoading(true);
            
            const matrix = this.matrixInput.getMatrixData();
            this.currentMatrix = matrix;
            console.log('Matrix to solve:', matrix);
            
            console.log('Sending request to server...');
            const response = await fetch('/api/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ matrix: matrix })
            });
            
            console.log('Response received, parsing JSON...');
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                console.log('Algorithm solved successfully!');
                this.algorithmSteps = data.steps;
                this.analytics = data.analytics;
                this.currentStep = 0;
                
                this.setupStepNavigation();
                this.displayStep(0);
                
                // Display analytics with error handling
                try {
                    this.analyticsDisplay.displayAnalytics(data.analytics, data.charts);
                } catch (error) {
                    console.error('Analytics display error:', error);
                }
                
                // Get iteration count from analytics
                const iterationCount = data.analytics.iterations_count || 0;
                this.showMessage(`Algorithm solved! Total cost: ${data.total_cost} (${iterationCount} iterations)`, 'success');
                
                // ALWAYS enable export buttons regardless of other errors
                console.log('🔧 Enabling export buttons...');
                this.enableExportButtons();
                
                // Multiple backup attempts
                setTimeout(() => {
                    console.log('🔧 Backup enable attempt 1...');
                    this.enableExportButtons();
                    this.forceEnableExportButtons();
                }, 200);
                
                setTimeout(() => {
                    console.log('🔧 Backup enable attempt 2...');
                    this.forceEnableExportButtons();
                    window.testEnableExports && window.testEnableExports();
                }, 1000);
                
            } else {
                console.error('Algorithm solving failed:', data.error);
                this.showMessage('Solving error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error in solveAlgorithm:', error);
            this.showMessage('Network error: ' + error.message, 'error');
        } finally {
            console.log('Hiding loading overlay...');
            this.showLoading(false);
        }
    }
    
    setupStepNavigation() {
        document.getElementById('step-controls-panel').style.display = 'block';
        document.getElementById('analytics-panel').style.display = 'block';
        
        document.getElementById('total-steps').textContent = this.algorithmSteps.length;
        this.updateStepControls();
    }
    
    displayStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.algorithmSteps.length) return;
        
        this.currentStep = stepIndex;
        const step = this.algorithmSteps[stepIndex];
        
        // Update visualization
        this.visualization.displayMatrix(step.matrix, step);
        
        // Update explanation
        this.displayStepExplanation(step);
        
        // Update progress
        this.updateStepControls();
        
        // Update math explanation
        this.displayMathExplanation(step);
    }
    
    displayStepExplanation(step) {
        const explanationDiv = document.getElementById('step-explanation');
        explanationDiv.innerHTML = `
            <h4>Step ${step.step_number + 1}: ${step.type.replace('_', ' ').toUpperCase()}</h4>
            <p><strong>Description:</strong> ${step.description}</p>
            <p><strong>Explanation:</strong> ${step.explanation}</p>
            <div class="step-metrics">
                <span><strong>Zero Density:</strong> ${(step.zero_density * 100).toFixed(1)}%</span>
                <span><strong>Frobenius Norm:</strong> ${step.frobenius_norm.toFixed(2)}</span>
            </div>
        `;
    }
    
    displayMathExplanation(step) {
        const mathDiv = document.getElementById('math-explanation');
        let mathContent = '';
        
        switch(step.type) {
            case 'row_reduction':
                mathContent = `For each row i: C'[i,j] = C[i,j] - min(C[i,:])`;
                break;
            case 'column_reduction':
                mathContent = `For each column j: C'[i,j] = C[i,j] - min(C[:,j])`;
                break;
            case 'line_covering':
                mathContent = `Find minimum lines to cover all zeros using König's theorem`;
                break;
            case 'matrix_adjustment':
                mathContent = `θ = min(uncovered elements)
Uncovered: C'[i,j] = C[i,j] - θ
Doubly covered: C'[i,j] = C[i,j] + θ`;
                break;
            default:
                mathContent = step.explanation;
        }
        
        mathDiv.textContent = mathContent;
    }
    
    updateStepControls() {
        document.getElementById('current-step').textContent = this.currentStep + 1;
        
        const progress = ((this.currentStep + 1) / this.algorithmSteps.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        // Update button states
        document.getElementById('first-step').disabled = this.currentStep === 0;
        document.getElementById('prev-step').disabled = this.currentStep === 0;
        document.getElementById('next-step').disabled = this.currentStep === this.algorithmSteps.length - 1;
        document.getElementById('last-step').disabled = this.currentStep === this.algorithmSteps.length - 1;
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.displayStep(this.currentStep - 1);
        }
    }
    
    nextStep() {
        if (this.currentStep < this.algorithmSteps.length - 1) {
            this.displayStep(this.currentStep + 1);
        }
    }
    
    goToStep(stepIndex) {
        this.displayStep(stepIndex);
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }
    
    startAnimation() {
        if (this.currentStep >= this.algorithmSteps.length - 1) {
            this.goToStep(0);
        }
        
        this.isPlaying = true;
        document.querySelector('#play-pause i').className = 'fas fa-pause';
        
        const interval = 1100 - (this.animationSpeed * 100); // Speed 1-10 maps to 1000-100ms
        this.playInterval = setInterval(() => {
            if (this.currentStep < this.algorithmSteps.length - 1) {
                this.nextStep();
            } else {
                this.stopAnimation();
            }
        }, interval);
    }
    
    stopAnimation() {
        this.isPlaying = false;
        document.querySelector('#play-pause i').className = 'fas fa-play';
        
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showHelpModal() {
        document.getElementById('help-modal').style.display = 'flex';
    }
    
    hideHelpModal() {
        document.getElementById('help-modal').style.display = 'none';
    }
    
    showLoading(show) {
        document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
    }
    
    showMessage(message, type) {
        // Create a temporary message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `validation-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '1001';
        messageDiv.style.minWidth = '300px';
        
        document.body.appendChild(messageDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
    
    enableExportButtons() {
        console.log('Attempting to enable export buttons...');
        
        const exportButtons = [
            document.getElementById('export-json'),
            document.getElementById('export-csv'),
            document.getElementById('export-pdf')
        ];
        
        console.log('Found export buttons:', exportButtons.map(btn => btn ? btn.id : 'null'));
        
        let enabledCount = 0;
        exportButtons.forEach((button, index) => {
            if (button) {
                console.log(`Enabling button ${index}:`, button.id);
                
                // Force enable the button
                button.disabled = false;
                button.classList.remove('disabled');
                
                // Force override all styles
                button.style.setProperty('opacity', '1', 'important');
                button.style.setProperty('cursor', 'pointer', 'important');
                button.style.setProperty('background-color', '#3498db', 'important');
                button.style.setProperty('color', '#ffffff', 'important');
                button.style.setProperty('border-color', '#3498db', 'important');
                
                // Add visual feedback
                button.title = 'Click to export';
                enabledCount++;
                
                console.log(`Button ${button.id} styles applied:`, {
                    disabled: button.disabled,
                    opacity: button.style.opacity,
                    cursor: button.style.cursor,
                    backgroundColor: button.style.backgroundColor
                });
            } else {
                console.error(`Export button ${index} not found!`);
            }
        });
        
        console.log(`Successfully enabled ${enabledCount} export buttons`);
        
        if (enabledCount > 0) {
            this.showMessage('Export options are now available!', 'success');
        } else {
            console.error('No export buttons were enabled!');
        }
    }
    
    forceEnableExportButtons() {
        console.log('🔧 FORCE enabling export buttons...');
        
        // Try multiple selectors to find the buttons
        const selectors = [
            '#export-json', '#export-csv', '#export-pdf',
            'button[id*="export"]', '.btn[id*="export"]',
            'button:contains("JSON")', 'button:contains("CSV")', 'button:contains("PDF")'
        ];
        
        let foundButtons = [];
        
        selectors.forEach(selector => {
            try {
                const buttons = document.querySelectorAll(selector);
                buttons.forEach(btn => {
                    if (!foundButtons.includes(btn)) {
                        foundButtons.push(btn);
                    }
                });
            } catch (e) {
                // Ignore selector errors
            }
        });
        
        console.log(`Found ${foundButtons.length} potential export buttons`);
        
        foundButtons.forEach((button, index) => {
            console.log(`Force enabling button ${index}:`, button.id || button.className);
            
            // Nuclear option - remove all restrictions
            button.disabled = false;
            button.removeAttribute('disabled');
            button.classList.remove('disabled');
            
            // Force all styles with maximum priority
            const styles = {
                'opacity': '1',
                'cursor': 'pointer',
                'background-color': '#3498db',
                'color': '#ffffff',
                'border-color': '#3498db',
                'pointer-events': 'auto'
            };
            
            Object.entries(styles).forEach(([prop, value]) => {
                button.style.setProperty(prop, value, 'important');
            });
            
            button.title = 'Click to export - ENABLED';
        });
        
        // Also try to enable any button in the export section
        const exportSection = document.querySelector('[class*="export"], [id*="export"]');
        if (exportSection) {
            const allButtons = exportSection.querySelectorAll('button');
            allButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.setProperty('opacity', '1', 'important');
                btn.style.setProperty('background-color', '#3498db', 'important');
                btn.style.setProperty('color', '#ffffff', 'important');
            });
        }
        
        console.log('🚀 Force enable complete!');
    }
    
    disableExportButtons() {
        console.log('Disabling export buttons...');
        const exportButtons = [
            document.getElementById('export-json'),
            document.getElementById('export-csv'),
            document.getElementById('export-pdf')
        ];
        
        console.log('Export buttons found for disabling:', exportButtons.map(btn => btn ? btn.id : 'null'));
        
        exportButtons.forEach((button, index) => {
            if (button) {
                console.log(`Disabling button ${index}:`, button.id);
                button.disabled = true;
                button.classList.add('disabled');
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
                
                // Update tooltip
                button.title = 'Solve the algorithm first to enable export';
            } else {
                console.error(`Export button ${index} not found during disable!`);
            }
        });
    }
    
    // Getter methods for other components
    getCurrentMatrix() {
        return this.currentMatrix;
    }
    
    getAlgorithmSteps() {
        return this.algorithmSteps;
    }
    
    getCurrentStep() {
        return this.currentStep;
    }
    
    getAnalytics() {
        return this.analytics;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hungarianApp = new HungarianVisualizerApp();
});