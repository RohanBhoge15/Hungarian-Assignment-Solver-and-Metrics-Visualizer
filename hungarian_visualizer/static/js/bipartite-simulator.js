// Bipartite Graph Simulator for Hungarian Algorithm
class BipartiteSimulator {
    constructor(app) {
        this.app = app;
        this.currentSimulatorStep = 0;
        this.simulatorSteps = [];
        this.isSimulatorPlaying = false;
        this.simulatorPlayInterval = null;
        this.simulatorAnimationSpeed = 5;
        this.canvas = null;
        this.ctx = null;
        this.highlightedEdges = [];
        this.highlightedNodes = [];
        this.edgeWeights = {};
        this.matchingEdges = [];
        this.coveredLines = { rows: [], cols: [] };
        this.uncoveredMinValue = null;
        
        this.initializeSimulator();
    }
    
    initializeSimulator() {
        console.log('Initializing Bipartite Simulator...');
        this.setupSimulatorPanel();
        this.setupSimulatorEventListeners();
    }
    
    setupSimulatorPanel() {
        // Check if panel already exists
        if (document.getElementById('bipartite-simulator-panel')) {
            return;
        }
        
        const analyticsPanel = document.getElementById('analytics-panel');
        if (!analyticsPanel) {
            console.error('Analytics panel not found');
            return;
        }
        
        // Create simulator panel after analytics panel
        const simulatorPanel = document.createElement('section');
        simulatorPanel.className = 'panel';
        simulatorPanel.id = 'bipartite-simulator-panel';
        simulatorPanel.style.display = 'none';
        simulatorPanel.innerHTML = `
            <div class="panel-header">
                <h2><i class="fas fa-project-diagram"></i> Bipartite Graph Simulator</h2>
                <div class="panel-controls">
                    <button id="simulator-refresh" class="btn btn-sm btn-outline">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <div class="simulator-container">
                    <div class="simulator-canvas-wrapper">
                        <canvas id="bipartite-canvas" width="900" height="600"></canvas>
                    </div>
                    
                    <div class="simulator-controls">
                        <div class="simulator-step-controls">
                            <button id="sim-first-step" class="btn btn-icon" title="First Step">
                                <i class="fas fa-step-backward"></i>
                            </button>
                            <button id="sim-prev-step" class="btn btn-icon" title="Previous Step">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button id="sim-play-pause" class="btn btn-icon" title="Play/Pause">
                                <i class="fas fa-play"></i>
                            </button>
                            <button id="sim-next-step" class="btn btn-icon" title="Next Step">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <button id="sim-last-step" class="btn btn-icon" title="Last Step">
                                <i class="fas fa-step-forward"></i>
                            </button>
                        </div>
                        
                        <div class="simulator-step-info">
                            <div class="progress-bar">
                                <div id="sim-progress-fill" class="progress-fill"></div>
                            </div>
                            <div class="step-counter">
                                <span id="sim-current-step">0</span> / <span id="sim-total-steps">0</span>
                            </div>
                        </div>

                        <div class="simulator-speed-control">
                            <label>Animation Speed:</label>
                            <input type="range" id="sim-speed-slider" min="1" max="10" value="5" class="slider">
                            <span id="sim-speed-value">5</span>
                        </div>
                    </div>
                    
                    <div class="simulator-explanation">
                        <h4 id="sim-step-title">Step 1: Construct the Bipartite Graph</h4>
                        <div id="sim-step-description"></div>
                        <div id="sim-step-details"></div>
                    </div>
                </div>
            </div>
        `;
        
        analyticsPanel.parentNode.insertBefore(simulatorPanel, analyticsPanel.nextSibling);
    }
    
    setupSimulatorEventListeners() {
        // Step controls
        const firstStepBtn = document.getElementById('sim-first-step');
        const prevStepBtn = document.getElementById('sim-prev-step');
        const playPauseBtn = document.getElementById('sim-play-pause');
        const nextStepBtn = document.getElementById('sim-next-step');
        const lastStepBtn = document.getElementById('sim-last-step');
        const speedSlider = document.getElementById('sim-speed-slider');
        const refreshBtn = document.getElementById('simulator-refresh');
        
        if (firstStepBtn) firstStepBtn.addEventListener('click', () => this.goToSimulatorStep(0));
        if (prevStepBtn) prevStepBtn.addEventListener('click', () => this.previousSimulatorStep());
        if (playPauseBtn) playPauseBtn.addEventListener('click', () => this.toggleSimulatorPlayPause());
        if (nextStepBtn) nextStepBtn.addEventListener('click', () => this.nextSimulatorStep());
        if (lastStepBtn) lastStepBtn.addEventListener('click', () => this.goToSimulatorStep(this.simulatorSteps.length - 1));
        
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.simulatorAnimationSpeed = parseInt(e.target.value);
                document.getElementById('sim-speed-value').textContent = this.simulatorAnimationSpeed;
                
                if (this.isSimulatorPlaying) {
                    this.stopSimulatorAnimation();
                    this.startSimulatorAnimation();
                }
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshSimulator());
        }
    }
    
    generateSimulatorSteps(matrix, algorithmSteps) {
        console.log('Generating simulator steps from algorithm steps...');
        this.simulatorSteps = [];
        this.currentSimulatorStep = 0;
        
        const n = matrix.length;
        
        // Step 1: Construct Bipartite Graph
        this.simulatorSteps.push({
            stepNumber: 1,
            title: 'Step 1: Construct the Bipartite Graph',
            description: 'Create two disjoint sets of nodes (workers and tasks) and connect them with weighted edges.',
            type: 'construct_graph',
            matrix: JSON.parse(JSON.stringify(matrix)),
            highlightedEdges: [],
            highlightedNodes: { left: [], right: [] },
            matchingEdges: [],
            coveredLines: { rows: [], cols: [] },
            details: `
                <p><strong>Left Set (U):</strong> ${n} agents/workers</p>
                <p><strong>Right Set (V):</strong> ${n} tasks/jobs</p>
                <p><strong>Edges:</strong> ${n * n} complete weighted edges</p>
                <p><strong>Graph Type:</strong> Complete weighted bipartite graph K_{${n},${n}}</p>
            `
        });
        
        // Step 2: Row and Column Reduction
        let reducedMatrix = JSON.parse(JSON.stringify(matrix));
        
        // Row reduction
        for (let i = 0; i < n; i++) {
            const minVal = Math.min(...reducedMatrix[i]);
            for (let j = 0; j < n; j++) {
                reducedMatrix[i][j] -= minVal;
            }
        }
        
        this.simulatorSteps.push({
            stepNumber: 2,
            title: 'Step 2a: Row Reduction',
            description: 'Subtract the minimum edge weight in each row (for each worker).',
            type: 'row_reduction',
            matrix: JSON.parse(JSON.stringify(reducedMatrix)),
            highlightedEdges: this.findZeroEdges(reducedMatrix),
            highlightedNodes: { left: [], right: [] },
            matchingEdges: [],
            coveredLines: { rows: [], cols: [] },
            details: `
                <p><strong>Operation:</strong> For each row i, subtract min(row_i) from all elements</p>
                <p><strong>Result:</strong> At least one zero in each row</p>
                <p><strong>Zero Edges Created:</strong> ${this.findZeroEdges(reducedMatrix).length}</p>
            `
        });
        
        // Column reduction
        for (let j = 0; j < n; j++) {
            const minVal = Math.min(...reducedMatrix.map(row => row[j]));
            for (let i = 0; i < n; i++) {
                reducedMatrix[i][j] -= minVal;
            }
        }
        
        this.simulatorSteps.push({
            stepNumber: 2,
            title: 'Step 2b: Column Reduction',
            description: 'Subtract the minimum edge weight in each column (for each job).',
            type: 'column_reduction',
            matrix: JSON.parse(JSON.stringify(reducedMatrix)),
            highlightedEdges: this.findZeroEdges(reducedMatrix),
            highlightedNodes: { left: [], right: [] },
            matchingEdges: [],
            coveredLines: { rows: [], cols: [] },
            details: `
                <p><strong>Operation:</strong> For each column j, subtract min(col_j) from all elements</p>
                <p><strong>Result:</strong> At least one zero in each row and column</p>
                <p><strong>Total Zero Edges:</strong> ${this.findZeroEdges(reducedMatrix).length}</p>
            `
        });
        
        // Step 3: Find Initial Matching
        const initialMatching = this.findMaximalMatching(reducedMatrix);
        
        this.simulatorSteps.push({
            stepNumber: 3,
            title: 'Step 3: Find Initial Matching Using Zero-Weight Edges',
            description: 'Identify edges with zero weight and find maximum matching among them.',
            type: 'initial_matching',
            matrix: JSON.parse(JSON.stringify(reducedMatrix)),
            highlightedEdges: this.findZeroEdges(reducedMatrix),
            highlightedNodes: { left: [], right: [] },
            matchingEdges: initialMatching,
            coveredLines: { rows: [], cols: [] },
            details: `
                <p><strong>Zero-Weight Edges:</strong> ${this.findZeroEdges(reducedMatrix).length}</p>
                <p><strong>Maximum Matching Found:</strong> ${initialMatching.length}</p>
                <p><strong>Nodes Matched:</strong> ${initialMatching.length} / ${n}</p>
                <p><strong>Perfect Matching:</strong> ${initialMatching.length === n ? '✅ YES' : '❌ NO'}</p>
            `
        });
        
        // Step 4: Check for Perfect Matching
        const isPerfectMatching = initialMatching.length === n;
        
        this.simulatorSteps.push({
            stepNumber: 4,
            title: 'Step 4: Check for Perfect Matching',
            description: isPerfectMatching ? 'Perfect matching found! Optimal solution achieved.' : 'Perfect matching not found. Continue to adjustment step.',
            type: 'check_matching',
            matrix: JSON.parse(JSON.stringify(reducedMatrix)),
            highlightedEdges: this.findZeroEdges(reducedMatrix),
            highlightedNodes: { left: [], right: [] },
            matchingEdges: initialMatching,
            coveredLines: { rows: [], cols: [] },
            details: `
                <p><strong>Matching Size:</strong> ${initialMatching.length}</p>
                <p><strong>Required for Perfect Matching:</strong> ${n}</p>
                <p><strong>Status:</strong> ${isPerfectMatching ? '✅ OPTIMAL SOLUTION FOUND' : '⏳ Need to adjust weights'}</p>
            `
        });
        
        // If not perfect matching, show adjustment steps
        if (!isPerfectMatching) {
            // Step 5: Find Vertex Cover and Adjust Weights
            const vertexCover = this.findVertexCover(reducedMatrix, initialMatching);
            const uncoveredMin = this.findUncoveredMinimum(reducedMatrix, vertexCover);
            
            this.simulatorSteps.push({
                stepNumber: 5,
                title: 'Step 5: Adjust Edge Weights (Relabeling)',
                description: 'Draw minimum vertex-covering lines and adjust weights to create new zero-weight edges.',
                type: 'adjust_weights',
                matrix: JSON.parse(JSON.stringify(reducedMatrix)),
                highlightedEdges: this.findZeroEdges(reducedMatrix),
                highlightedNodes: { left: [], right: [] },
                matchingEdges: initialMatching,
                coveredLines: vertexCover,
                uncoveredMin: uncoveredMin,
                details: `
                    <p><strong>Covered Rows:</strong> ${vertexCover.rows.length}</p>
                    <p><strong>Covered Columns:</strong> ${vertexCover.cols.length}</p>
                    <p><strong>Total Lines:</strong> ${vertexCover.rows.length + vertexCover.cols.length}</p>
                    <p><strong>Minimum Uncovered Value (δ):</strong> ${uncoveredMin}</p>
                    <p><strong>Weight Adjustment:</strong> Subtract δ from uncovered, add δ to doubly covered</p>
                `
            });
            
            // Apply weight adjustment
            let adjustedMatrix = JSON.parse(JSON.stringify(reducedMatrix));
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const rowCovered = vertexCover.rows.includes(i);
                    const colCovered = vertexCover.cols.includes(j);
                    
                    if (!rowCovered && !colCovered) {
                        adjustedMatrix[i][j] -= uncoveredMin;
                    } else if (rowCovered && colCovered) {
                        adjustedMatrix[i][j] += uncoveredMin;
                    }
                }
            }
            
            this.simulatorSteps.push({
                stepNumber: 6,
                title: 'Step 6: Repeat Matching Search',
                description: 'Search for maximum matching with updated weights.',
                type: 'repeat_matching',
                matrix: JSON.parse(JSON.stringify(adjustedMatrix)),
                highlightedEdges: this.findZeroEdges(adjustedMatrix),
                highlightedNodes: { left: [], right: [] },
                matchingEdges: this.findMaximalMatching(adjustedMatrix),
                coveredLines: { rows: [], cols: [] },
                details: `
                    <p><strong>New Zero-Weight Edges:</strong> ${this.findZeroEdges(adjustedMatrix).length}</p>
                    <p><strong>New Matching Size:</strong> ${this.findMaximalMatching(adjustedMatrix).length}</p>
                    <p><strong>Progress:</strong> Improved matching found</p>
                `
            });
        }
        
        // Step 7: Extract Optimal Assignment
        const finalMatching = isPerfectMatching ? initialMatching : this.findMaximalMatching(reducedMatrix);
        const totalCost = this.calculateMatchingCost(finalMatching, matrix);
        
        this.simulatorSteps.push({
            stepNumber: 7,
            title: 'Step 7: Extract Minimum-Cost Perfect Matching',
            description: 'The chosen zero-weight edges form the optimal assignment.',
            type: 'final_assignment',
            matrix: JSON.parse(JSON.stringify(reducedMatrix)),
            highlightedEdges: this.findZeroEdges(reducedMatrix),
            highlightedNodes: { left: [], right: [] },
            matchingEdges: finalMatching,
            coveredLines: { rows: [], cols: [] },
            details: `
                <p><strong>Optimal Assignment:</strong></p>
                <ul>
                    ${finalMatching.map((edge, idx) => `<li>Worker ${edge[0]} → Task ${edge[1]} (Cost: ${matrix[edge[0]][edge[1]]})</li>`).join('')}
                </ul>
                <p><strong>Total Minimum Cost:</strong> ${totalCost}</p>
            `
        });
        
        console.log(`Generated ${this.simulatorSteps.length} simulator steps`);
        this.setupSimulatorStepNavigation();
        this.displaySimulatorStep(0);
    }
    
    findZeroEdges(matrix) {
        const edges = [];
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === 0) {
                    edges.push([i, j]);
                }
            }
        }
        return edges;
    }
    
    findMaximalMatching(matrix) {
        const n = matrix.length;
        const matching = [];
        const usedRows = new Set();
        const usedCols = new Set();
        
        // Find all zero edges
        const zeroEdges = this.findZeroEdges(matrix);
        
        // Greedy matching
        for (const [i, j] of zeroEdges) {
            if (!usedRows.has(i) && !usedCols.has(j)) {
                matching.push([i, j]);
                usedRows.add(i);
                usedCols.add(j);
            }
        }
        
        return matching;
    }
    
    findVertexCover(matrix, matching) {
        const n = matrix.length;
        const matchedRows = new Set(matching.map(e => e[0]));
        const matchedCols = new Set(matching.map(e => e[1]));
        
        const unmatchedRows = [];
        for (let i = 0; i < n; i++) {
            if (!matchedRows.has(i)) {
                unmatchedRows.push(i);
            }
        }
        
        // Find reachable rows and columns
        const reachableRows = new Set(unmatchedRows);
        const reachableColumns = new Set();
        
        let changed = true;
        while (changed) {
            changed = false;
            
            // From reachable rows, find reachable columns via zeros
            for (const i of reachableRows) {
                for (let j = 0; j < n; j++) {
                    if (matrix[i][j] === 0 && !reachableColumns.has(j)) {
                        reachableColumns.add(j);
                        changed = true;
                    }
                }
            }
            
            // From reachable columns, find reachable rows via matching
            for (const [i, j] of matching) {
                if (reachableColumns.has(j) && !reachableRows.has(i)) {
                    reachableRows.add(i);
                    changed = true;
                }
            }
        }
        
        // Vertex cover: non-reachable rows + reachable columns
        const coveredRows = [];
        for (let i = 0; i < n; i++) {
            if (!reachableRows.has(i)) {
                coveredRows.push(i);
            }
        }
        
        return {
            rows: coveredRows,
            cols: Array.from(reachableColumns)
        };
    }
    
    findUncoveredMinimum(matrix, vertexCover) {
        let minVal = Infinity;
        const n = matrix.length;
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const rowCovered = vertexCover.rows.includes(i);
                const colCovered = vertexCover.cols.includes(j);
                
                if (!rowCovered && !colCovered) {
                    minVal = Math.min(minVal, matrix[i][j]);
                }
            }
        }
        
        return minVal === Infinity ? 0 : minVal;
    }
    
    calculateMatchingCost(matching, originalMatrix) {
        let cost = 0;
        for (const [i, j] of matching) {
            cost += originalMatrix[i][j];
        }
        return cost;
    }
    
    setupSimulatorStepNavigation() {
        document.getElementById('sim-total-steps').textContent = this.simulatorSteps.length;
        this.updateSimulatorStepControls();
    }
    
    displaySimulatorStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.simulatorSteps.length) return;
        
        this.currentSimulatorStep = stepIndex;
        const step = this.simulatorSteps[stepIndex];
        
        // Update canvas
        this.drawBipartiteGraph(step);
        
        // Update explanation
        this.displaySimulatorStepExplanation(step);
        
        // Update progress
        this.updateSimulatorStepControls();
    }
    
    displaySimulatorStepExplanation(step) {
        document.getElementById('sim-step-title').textContent = step.title;
        document.getElementById('sim-step-description').innerHTML = `<p>${step.description}</p>`;
        document.getElementById('sim-step-details').innerHTML = step.details;
    }
    
    drawBipartiteGraph(step) {
        const canvas = document.getElementById('bipartite-canvas');
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const n = step.matrix.length;
        
        // Clear canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);
        
        // Calculate positions
        const leftX = 100;
        const rightX = width - 100;
        const topY = 50;
        const bottomY = height - 50;
        const nodeRadius = 25;
        
        const leftNodes = [];
        const rightNodes = [];
        
        // Position left nodes (workers)
        for (let i = 0; i < n; i++) {
            const y = topY + (i / (n - 1)) * (bottomY - topY);
            leftNodes.push({ x: leftX, y: y, id: i });
        }
        
        // Position right nodes (tasks)
        for (let j = 0; j < n; j++) {
            const y = topY + (j / (n - 1)) * (bottomY - topY);
            rightNodes.push({ x: rightX, y: y, id: j });
        }
        
        // Draw edges
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const isZeroEdge = step.matrix[i][j] === 0;
                const isMatchingEdge = step.matchingEdges.some(e => e[0] === i && e[1] === j);
                const isHighlighted = step.highlightedEdges.some(e => e[0] === i && e[1] === j);
                
                ctx.beginPath();
                ctx.moveTo(leftNodes[i].x, leftNodes[i].y);
                ctx.lineTo(rightNodes[j].x, rightNodes[j].y);
                
                if (isMatchingEdge) {
                    ctx.strokeStyle = '#27ae60';
                    ctx.lineWidth = 4;
                } else if (isZeroEdge) {
                    ctx.strokeStyle = '#f39c12';
                    ctx.lineWidth = 2;
                } else {
                    ctx.strokeStyle = '#bdc3c7';
                    ctx.lineWidth = 1;
                }
                
                ctx.stroke();
                
                // Draw edge weight
                const midX = (leftNodes[i].x + rightNodes[j].x) / 2;
                const midY = (leftNodes[i].y + rightNodes[j].y) / 2;
                
                ctx.fillStyle = isZeroEdge ? '#e74c3c' : '#2c3e50';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const weight = step.matrix[i][j];
                ctx.fillText(weight, midX, midY);
            }
        }
        
        // Draw covered lines if applicable
        if (step.coveredLines && (step.coveredLines.rows.length > 0 || step.coveredLines.cols.length > 0)) {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            
            // Draw horizontal lines for covered rows
            for (const rowIdx of step.coveredLines.rows) {
                const y = leftNodes[rowIdx].y;
                ctx.beginPath();
                ctx.moveTo(leftX - 50, y);
                ctx.lineTo(rightX + 50, y);
                ctx.stroke();
            }
            
            // Draw vertical lines for covered columns
            for (const colIdx of step.coveredLines.cols) {
                const x = rightNodes[colIdx].x;
                ctx.beginPath();
                ctx.moveTo(x, topY - 50);
                ctx.lineTo(x, bottomY + 50);
                ctx.stroke();
            }
            
            ctx.setLineDash([]);
        }
        
        // Draw left nodes (workers)
        for (const node of leftNodes) {
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`W${node.id}`, node.x, node.y);
        }
        
        // Draw right nodes (tasks)
        for (const node of rightNodes) {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`T${node.id}`, node.x, node.y);
        }
        
        // Draw labels
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Workers (U)', leftX, 20);
        ctx.fillText('Tasks (V)', rightX, 20);
        
        // Draw legend
        const legendY = height - 30;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        // Zero edges
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, legendY);
        ctx.lineTo(50, legendY);
        ctx.stroke();
        ctx.fillStyle = '#2c3e50';
        ctx.fillText('Zero-weight edges', 60, legendY + 3);
        
        // Matching edges
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(250, legendY);
        ctx.lineTo(280, legendY);
        ctx.stroke();
        ctx.fillStyle = '#2c3e50';
        ctx.fillText('Matching edges', 290, legendY + 3);
    }
    
    updateSimulatorStepControls() {
        document.getElementById('sim-current-step').textContent = this.currentSimulatorStep + 1;
        
        const progress = ((this.currentSimulatorStep + 1) / this.simulatorSteps.length) * 100;
        document.getElementById('sim-progress-fill').style.width = `${progress}%`;
        
        // Update button states
        document.getElementById('sim-first-step').disabled = this.currentSimulatorStep === 0;
        document.getElementById('sim-prev-step').disabled = this.currentSimulatorStep === 0;
        document.getElementById('sim-next-step').disabled = this.currentSimulatorStep === this.simulatorSteps.length - 1;
        document.getElementById('sim-last-step').disabled = this.currentSimulatorStep === this.simulatorSteps.length - 1;
    }
    
    previousSimulatorStep() {
        if (this.currentSimulatorStep > 0) {
            this.displaySimulatorStep(this.currentSimulatorStep - 1);
        }
    }
    
    nextSimulatorStep() {
        if (this.currentSimulatorStep < this.simulatorSteps.length - 1) {
            this.displaySimulatorStep(this.currentSimulatorStep + 1);
        }
    }
    
    goToSimulatorStep(stepIndex) {
        this.displaySimulatorStep(stepIndex);
    }
    
    toggleSimulatorPlayPause() {
        if (this.isSimulatorPlaying) {
            this.stopSimulatorAnimation();
        } else {
            this.startSimulatorAnimation();
        }
    }
    
    startSimulatorAnimation() {
        if (this.currentSimulatorStep >= this.simulatorSteps.length - 1) {
            this.goToSimulatorStep(0);
        }
        
        this.isSimulatorPlaying = true;
        document.querySelector('#sim-play-pause i').className = 'fas fa-pause';
        
        const interval = 1100 - (this.simulatorAnimationSpeed * 100);
        this.simulatorPlayInterval = setInterval(() => {
            if (this.currentSimulatorStep < this.simulatorSteps.length - 1) {
                this.nextSimulatorStep();
            } else {
                this.stopSimulatorAnimation();
            }
        }, interval);
    }
    
    stopSimulatorAnimation() {
        this.isSimulatorPlaying = false;
        document.querySelector('#sim-play-pause i').className = 'fas fa-play';
        
        if (this.simulatorPlayInterval) {
            clearInterval(this.simulatorPlayInterval);
            this.simulatorPlayInterval = null;
        }
    }
    
    refreshSimulator() {
        if (this.app.algorithmSteps.length > 0) {
            this.generateSimulatorSteps(this.app.currentMatrix, this.app.algorithmSteps);
            this.displaySimulatorStep(0);
        }
    }
    
    show() {
        const panel = document.getElementById('bipartite-simulator-panel');
        if (panel) {
            panel.style.display = 'block';
        }
    }
    
    hide() {
        const panel = document.getElementById('bipartite-simulator-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
}
