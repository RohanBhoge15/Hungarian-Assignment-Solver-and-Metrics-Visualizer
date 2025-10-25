// Export Manager Component
class ExportManager {
    constructor(app) {
        this.app = app;
        this.setupExportListeners();
    }
    
    setupExportListeners() {
        document.getElementById('export-json').addEventListener('click', () => {
            this.exportJSON();
        });
        
        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportCSV();
        });
        
        document.getElementById('export-pdf').addEventListener('click', () => {
            this.exportPDF();
        });
    }
    
    exportJSON() {
        try {
            const data = this.prepareExportData();
            const jsonString = JSON.stringify(data, null, 2);
            
            this.downloadFile(jsonString, 'hungarian-algorithm-results.json', 'application/json');
            this.app.showMessage('JSON export completed successfully', 'success');
        } catch (error) {
            this.app.showMessage('Error exporting JSON: ' + error.message, 'error');
        }
    }
    
    exportCSV() {
        try {
            const csvContent = this.generateCSV();
            this.downloadFile(csvContent, 'hungarian-algorithm-results.csv', 'text/csv');
            this.app.showMessage('CSV export completed successfully', 'success');
        } catch (error) {
            this.app.showMessage('Error exporting CSV: ' + error.message, 'error');
        }
    }
    
    exportPDF() {
        try {
            // For PDF export, we'll create an HTML report and let the browser handle PDF generation
            const htmlReport = this.generateComprehensiveHTMLReport();
            const printWindow = window.open('', '_blank');
            printWindow.document.write(htmlReport);
            printWindow.document.close();
            
            // Wait a bit for images to load before printing
            setTimeout(() => {
                printWindow.print();
            }, 1000);
            
            this.app.showMessage('PDF export initiated - use browser print dialog', 'success');
        } catch (error) {
            this.app.showMessage('Error exporting PDF: ' + error.message, 'error');
        }
    }
    
    prepareExportData() {
        const steps = this.app.getAlgorithmSteps();
        const analytics = this.app.getAnalytics();
        const matrix = this.app.getCurrentMatrix();
        
        return {
            metadata: {
                algorithm: 'Hungarian Method',
                exportDate: new Date().toISOString(),
                matrixSize: matrix ? matrix.length : 0,
                totalSteps: steps.length
            },
            originalMatrix: matrix,
            algorithmSteps: steps,
            analytics: analytics,
            finalAssignment: this.getFinalAssignment(),
            totalCost: this.calculateTotalCost(),
            summary: this.generateSummary()
        };
    }
    
    generateCSV() {
        const steps = this.app.getAlgorithmSteps();
        const matrix = this.app.getCurrentMatrix();
        
        let csv = 'Hungarian Algorithm Results\n\n';
        
        // Original Matrix
        csv += 'Original Cost Matrix\n';
        csv += 'Row,';
        for (let j = 0; j < matrix.length; j++) {
            csv += `Col${j + 1}${j < matrix.length - 1 ? ',' : ''}`;
        }
        csv += '\n';
        
        for (let i = 0; i < matrix.length; i++) {
            csv += `Row${i + 1},`;
            for (let j = 0; j < matrix[i].length; j++) {
                csv += `${matrix[i][j]}${j < matrix[i].length - 1 ? ',' : ''}`;
            }
            csv += '\n';
        }
        
        csv += '\n';
        
        // Final Assignment
        const assignment = this.getFinalAssignment();
        if (assignment.length > 0) {
            csv += 'Final Assignment\n';
            csv += 'Agent,Task,Cost\n';
            assignment.forEach(([row, col]) => {
                csv += `${row + 1},${col + 1},${matrix[row][col]}\n`;
            });
            csv += `Total Cost,${this.calculateTotalCost()}\n`;
        }
        
        csv += '\n';
        
        // Step Summary
        csv += 'Algorithm Steps Summary\n';
        csv += 'Step,Type,Description,Zero Density,Frobenius Norm\n';
        steps.forEach(step => {
            csv += `${step.step_number + 1},"${step.type}","${step.description}",${step.zero_density.toFixed(4)},${step.frobenius_norm.toFixed(4)}\n`;
        });
        
        csv += '\n';
        
        // Analytics Summary
        const analytics = this.app.getAnalytics();
        if (analytics) {
            csv += 'Performance Analytics\n';
            csv += 'Metric,Value\n';
            csv += `Execution Time (ms),${(analytics.execution_time * 1000).toFixed(2)}\n`;
            csv += `Total Steps,${analytics.num_steps}\n`;
            csv += `Efficiency Ratio,${(analytics.efficiency_ratio * 100).toFixed(2)}%\n`;
            csv += `Convergence Rate,${analytics.convergence_rate.toFixed(4)}\n`;
            csv += `Performance Score,${analytics.performance_score.toFixed(2)}\n`;
        }
        
        return csv;
    }
    
    generateComprehensiveHTMLReport() {
        const steps = this.app.getAlgorithmSteps();
        const matrix = this.app.getCurrentMatrix();
        const analytics = this.app.getAnalytics();
        const charts = this.app.analyticsDisplay.charts;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Hungarian Algorithm Comprehensive Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 20px; }
        .section { margin-bottom: 40px; page-break-inside: avoid; }
        .matrix-table { border-collapse: collapse; margin: 20px auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .matrix-table th, .matrix-table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: center; 
            min-width: 50px;
        }
        .matrix-table th { background-color: #3498db; color: white; font-weight: bold; }
        .assigned-cell { background-color: #2ecc71; color: white; font-weight: bold; }
        .zero-cell { background-color: #f39c12; color: white; font-weight: bold; }
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .metric-card { 
            border: 2px solid #3498db; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .metric-value { font-size: 28px; font-weight: bold; color: #2c3e50; margin: 10px 0; }
        .metric-label { font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px; }
        .step-summary { 
            margin: 15px 0; 
            padding: 15px; 
            background: #f8f9fa; 
            border-left: 4px solid #3498db;
            border-radius: 4px;
        }
        .chart-container { 
            text-align: center; 
            margin: 30px 0; 
            page-break-inside: avoid;
        }
        .chart-container img { 
            max-width: 100%; 
            height: auto; 
            border: 1px solid #ddd; 
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .chart-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            color: #2c3e50;
        }
        .summary-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .algorithm-steps { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        h1 { color: #2c3e50; font-size: 2.5em; margin-bottom: 10px; }
        h2 { color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h3 { color: #2c3e50; margin-top: 25px; }
        .page-break { page-break-before: always; }
        @media print {
            .no-print { display: none; }
            body { margin: 0; font-size: 12px; }
            .section { margin-bottom: 30px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Hungarian Algorithm Analysis Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Matrix Size:</strong> ${matrix.length}×${matrix.length} | <strong>Total Cost:</strong> ${this.calculateTotalCost()}</p>
    </div>
    
    <div class="section">
        <h2>📊 Performance Metrics Overview</h2>
        ${this.generateEnhancedMetricsHTML(analytics)}
    </div>
    
    <div class="section">
        <h2>📈 Algorithm Performance Charts</h2>
        ${this.generateChartsHTML(charts)}
    </div>
    
    <div class="section page-break">
        <h2>🎲 Original Cost Matrix</h2>
        ${this.generateMatrixHTML(matrix, 'Original Cost Matrix')}
    </div>
    
    <div class="section">
        <h2>✅ Optimal Assignment Solution</h2>
        ${this.generateEnhancedAssignmentHTML()}
    </div>
    
    <div class="section">
        <h2>🔄 Algorithm Steps Breakdown</h2>
        <div class="algorithm-steps">
            ${this.generateDetailedStepsHTML(steps)}
        </div>
    </div>
    
    <div class="section page-break">
        <h2>🎯 Final Matrix State</h2>
        ${steps.length > 0 ? this.generateMatrixHTML(steps[steps.length - 1].matrix, 'Final Matrix State') : 'No steps available'}
    </div>
    
    <div class="section">
        <h2>📋 Executive Summary</h2>
        <div class="summary-box">
            ${this.generateExecutiveSummaryHTML()}
        </div>
    </div>
    
    <div class="section">
        <h2>🔬 Technical Analysis</h2>
        ${this.generateTechnicalAnalysisHTML(analytics)}
    </div>
</body>
</html>`;
    }
    
    generateHTMLReport() {
        const steps = this.app.getAlgorithmSteps();
        const matrix = this.app.getCurrentMatrix();
        const analytics = this.app.getAnalytics();
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Hungarian Algorithm Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; page-break-inside: avoid; }
        .matrix-table { border-collapse: collapse; margin: 20px auto; }
        .matrix-table th, .matrix-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: center; 
            min-width: 40px;
        }
        .matrix-table th { background-color: #f2f2f2; }
        .assigned-cell { background-color: #3498db; color: white; font-weight: bold; }
        .zero-cell { background-color: #2ecc71; color: white; }
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .metric-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #3498db; }
        .step-summary { margin: 10px 0; padding: 10px; background: #f9f9f9; }
        @media print {
            .no-print { display: none; }
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Hungarian Algorithm Analysis Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Matrix Size: ${matrix.length}×${matrix.length}</p>
    </div>
    
    <div class="section">
        <h2>Original Cost Matrix</h2>
        ${this.generateMatrixHTML(matrix, 'Original Matrix')}
    </div>
    
    <div class="section">
        <h2>Final Assignment</h2>
        ${this.generateAssignmentHTML()}
    </div>
    
    <div class="section">
        <h2>Performance Metrics</h2>
        ${this.generateMetricsHTML(analytics)}
    </div>
    
    <div class="section">
        <h2>Algorithm Steps</h2>
        ${this.generateStepsHTML(steps)}
    </div>
    
    <div class="section">
        <h2>Final Matrix State</h2>
        ${steps.length > 0 ? this.generateMatrixHTML(steps[steps.length - 1].matrix, 'Final Matrix') : 'No steps available'}
    </div>
    
    <div class="section">
        <h2>Summary</h2>
        ${this.generateSummaryHTML()}
    </div>
</body>
</html>`;
    }
    
    generateMatrixHTML(matrix, title) {
        let html = `<h3>${title}</h3><table class="matrix-table">`;
        
        // Header row
        html += '<tr><th></th>';
        for (let j = 0; j < matrix.length; j++) {
            html += `<th>T${j + 1}</th>`;
        }
        html += '</tr>';
        
        // Data rows
        for (let i = 0; i < matrix.length; i++) {
            html += `<tr><th>A${i + 1}</th>`;
            for (let j = 0; j < matrix[i].length; j++) {
                let cellClass = '';
                const value = matrix[i][j];
                
                // Check if this cell is assigned
                const assignment = this.getFinalAssignment();
                const isAssigned = assignment.some(([r, c]) => r === i && c === j);
                
                if (isAssigned) {
                    cellClass = 'assigned-cell';
                } else if (value === 0) {
                    cellClass = 'zero-cell';
                }
                
                html += `<td class="${cellClass}">${value}</td>`;
            }
            html += '</tr>';
        }
        
        html += '</table>';
        return html;
    }
    
    generateAssignmentHTML() {
        const assignment = this.getFinalAssignment();
        const matrix = this.app.getCurrentMatrix();
        
        if (assignment.length === 0) {
            return '<p>No assignment available</p>';
        }
        
        let html = '<table class="matrix-table">';
        html += '<tr><th>Agent</th><th>Task</th><th>Cost</th></tr>';
        
        let totalCost = 0;
        assignment.forEach(([row, col]) => {
            const cost = matrix[row][col];
            totalCost += cost;
            html += `<tr><td>Agent ${row + 1}</td><td>Task ${col + 1}</td><td>${cost}</td></tr>`;
        });
        
        html += `<tr style="font-weight: bold; background-color: #f2f2f2;">
                    <td colspan="2">Total Cost</td><td>${totalCost}</td></tr>`;
        html += '</table>';
        
        return html;
    }
    
    generateMetricsHTML(analytics) {
        if (!analytics) return '<p>No analytics available</p>';
        
        return `
        <div class="metrics-grid">
            <div class="metric-card">
                <h4>Execution Time</h4>
                <div class="metric-value">${(analytics.execution_time * 1000).toFixed(1)}</div>
                <div>milliseconds</div>
            </div>
            <div class="metric-card">
                <h4>Total Steps</h4>
                <div class="metric-value">${analytics.num_steps}</div>
                <div>steps</div>
            </div>
            <div class="metric-card">
                <h4>Efficiency Ratio</h4>
                <div class="metric-value">${(analytics.efficiency_ratio * 100).toFixed(1)}%</div>
                <div>zero density</div>
            </div>
            <div class="metric-card">
                <h4>Performance Score</h4>
                <div class="metric-value">${analytics.performance_score.toFixed(1)}</div>
                <div>out of 100</div>
            </div>
            <div class="metric-card">
                <h4>Convergence Rate</h4>
                <div class="metric-value">${analytics.convergence_rate.toFixed(3)}</div>
                <div>rate</div>
            </div>
            <div class="metric-card">
                <h4>Operations</h4>
                <div class="metric-value">${analytics.actual_operations}</div>
                <div>total ops</div>
            </div>
        </div>`;
    }
    
    generateStepsHTML(steps) {
        if (steps.length === 0) return '<p>No steps available</p>';
        
        let html = '';
        steps.forEach(step => {
            html += `
            <div class="step-summary">
                <h4>Step ${step.step_number + 1}: ${step.type.replace('_', ' ').toUpperCase()}</h4>
                <p><strong>Description:</strong> ${step.description}</p>
                <p><strong>Explanation:</strong> ${step.explanation}</p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
                    <div><strong>Zero Density:</strong> ${(step.zero_density * 100).toFixed(1)}%</div>
                    <div><strong>Frobenius Norm:</strong> ${step.frobenius_norm.toFixed(2)}</div>
                    <div><strong>Zeros Count:</strong> ${step.zeros ? step.zeros.length : 0}</div>
                </div>
            </div>`;
        });
        
        return html;
    }
    
    generateSummaryHTML() {
        const matrix = this.app.getCurrentMatrix();
        const steps = this.app.getAlgorithmSteps();
        const analytics = this.app.getAnalytics();
        const assignment = this.getFinalAssignment();
        
        return `
        <div class="summary">
            <h3>Algorithm Summary</h3>
            <ul>
                <li><strong>Problem Size:</strong> ${matrix.length}×${matrix.length} assignment problem</li>
                <li><strong>Total Steps:</strong> ${steps.length} algorithm steps</li>
                <li><strong>Execution Time:</strong> ${analytics ? (analytics.execution_time * 1000).toFixed(1) : 'N/A'} milliseconds</li>
                <li><strong>Optimal Cost:</strong> ${this.calculateTotalCost()}</li>
                <li><strong>Assignment:</strong> ${assignment.length} agent-task pairs</li>
            </ul>
            
            <h3>Key Insights</h3>
            <ul>
                <li>The Hungarian algorithm guarantees optimal solution for assignment problems</li>
                <li>Time complexity: O(n³) where n is the matrix dimension</li>
                <li>The algorithm uses the principle of duality in linear programming</li>
                <li>Each step maintains optimality while creating structure for assignment</li>
            </ul>
        </div>`;
    }
    
    getFinalAssignment() {
        const steps = this.app.getAlgorithmSteps();
        if (steps.length === 0) return [];
        
        const lastStep = steps[steps.length - 1];
        return lastStep.assigned_positions || [];
    }
    
    calculateTotalCost() {
        const assignment = this.getFinalAssignment();
        const matrix = this.app.getCurrentMatrix();
        
        if (!assignment || !matrix) return 0;
        
        return assignment.reduce((sum, [row, col]) => {
            return sum + matrix[row][col];
        }, 0);
    }
    
    generateSummary() {
        const analytics = this.app.getAnalytics();
        const steps = this.app.getAlgorithmSteps();
        
        return {
            optimalCost: this.calculateTotalCost(),
            executionTime: analytics ? analytics.execution_time : 0,
            totalSteps: steps.length,
            efficiencyRatio: analytics ? analytics.efficiency_ratio : 0,
            performanceScore: analytics ? analytics.performance_score : 0,
            algorithmComplexity: 'O(n³)',
            guaranteedOptimal: true
        };
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    // Utility method to export current visualization as image
    exportVisualizationImage() {
        const visualization = this.app.visualization;
        if (visualization && typeof visualization.exportVisualization === 'function') {
            const imageData = visualization.exportVisualization();
            if (imageData) {
                const link = document.createElement('a');
                link.href = imageData;
                link.download = 'hungarian-algorithm-visualization.png';
                link.click();
            }
        }
    }
    
    // Method to export all charts as images
    exportAllCharts() {
        const charts = document.querySelectorAll('.chart-panel img');
        charts.forEach((chart, index) => {
            const link = document.createElement('a');
            link.href = chart.src;
            link.download = `hungarian-chart-${index + 1}.png`;
            link.click();
        });
    }
    
    // Additional methods for comprehensive PDF report
    generateChartsHTML(charts) {
        if (!charts || Object.keys(charts).length === 0) {
            return '<p>No charts available</p>';
        }
        
        let html = '';
        
        if (charts.cost_reduction) {
            html += `
            <div class="chart-container">
                <div class="chart-title">Cost Reduction Over Steps</div>
                <img src="${charts.cost_reduction}" alt="Cost Reduction Chart" />
            </div>`;
        }
        
        if (charts.zero_density) {
            html += `
            <div class="chart-container">
                <div class="chart-title">Zero Density Evolution</div>
                <img src="${charts.zero_density}" alt="Zero Density Chart" />
            </div>`;
        }
        
        if (charts.final_heatmap) {
            html += `
            <div class="chart-container">
                <div class="chart-title">Final Matrix Heatmap</div>
                <img src="${charts.final_heatmap}" alt="Matrix Heatmap" />
            </div>`;
        }
        
        return html;
    }
    
    generateEnhancedMetricsHTML(analytics) {
        if (!analytics) return '<p>No analytics available</p>';
        
        return `
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Execution Time</div>
                <div class="metric-value">${(analytics.execution_time * 1000).toFixed(1)}</div>
                <div>milliseconds</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Algorithm Steps</div>
                <div class="metric-value">${analytics.num_steps}</div>
                <div>total steps</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Efficiency Ratio</div>
                <div class="metric-value">${(analytics.efficiency_ratio * 100).toFixed(1)}%</div>
                <div>zero density</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Performance Score</div>
                <div class="metric-value">${analytics.performance_score.toFixed(1)}</div>
                <div>out of 100</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Convergence Rate</div>
                <div class="metric-value">${analytics.convergence_rate.toFixed(3)}</div>
                <div>convergence rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Operations</div>
                <div class="metric-value">${analytics.actual_operations}</div>
                <div>operations</div>
            </div>
        </div>`;
    }
    
    generateEnhancedAssignmentHTML() {
        const assignment = this.getFinalAssignment();
        const matrix = this.app.getCurrentMatrix();
        
        if (assignment.length === 0) {
            return '<p>No assignment available</p>';
        }
        
        let html = '<table class="matrix-table">';
        html += '<tr><th>Agent</th><th>Task</th><th>Cost</th><th>Efficiency</th></tr>';
        
        let totalCost = 0;
        const maxCost = Math.max(...matrix.flat());
        
        assignment.forEach(([row, col]) => {
            const cost = matrix[row][col];
            totalCost += cost;
            const efficiency = ((maxCost - cost) / maxCost * 100).toFixed(1);
            html += `<tr>
                <td>Agent ${row + 1}</td>
                <td>Task ${col + 1}</td>
                <td>${cost}</td>
                <td>${efficiency}%</td>
            </tr>`;
        });
        
        html += `<tr style="font-weight: bold; background-color: #3498db; color: white;">
                    <td colspan="2">OPTIMAL TOTAL</td>
                    <td>${totalCost}</td>
                    <td>100%</td>
                </tr>`;
        html += '</table>';
        
        return html;
    }
    
    generateDetailedStepsHTML(steps) {
        if (steps.length === 0) return '<p>No steps available</p>';
        
        let html = '';
        steps.forEach((step, index) => {
            html += `
            <div class="step-summary">
                <h4>Step ${step.step_number + 1}: ${step.type.replace('_', ' ').toUpperCase()}</h4>
                <p><strong>Description:</strong> ${step.description}</p>
                <p><strong>Mathematical Explanation:</strong> ${step.explanation}</p>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px; background: white; padding: 10px; border-radius: 5px;">
                    <div><strong>Zero Density:</strong><br>${(step.zero_density * 100).toFixed(1)}%</div>
                    <div><strong>Frobenius Norm:</strong><br>${step.frobenius_norm.toFixed(2)}</div>
                    <div><strong>Zeros Count:</strong><br>${step.zeros ? step.zeros.length : 0}</div>
                    <div><strong>Progress:</strong><br>${((index + 1) / steps.length * 100).toFixed(1)}%</div>
                </div>
            </div>`;
        });
        
        return html;
    }
    
    generateExecutiveSummaryHTML() {
        const matrix = this.app.getCurrentMatrix();
        const steps = this.app.getAlgorithmSteps();
        const analytics = this.app.getAnalytics();
        const assignment = this.getFinalAssignment();
        
        return `
        <h3>🎯 Executive Summary</h3>
        <p><strong>Problem:</strong> Solved a ${matrix.length}×${matrix.length} assignment problem using the Hungarian Algorithm, achieving optimal cost allocation.</p>
        
        <p><strong>Solution:</strong> Found optimal assignment with total cost of <strong>${this.calculateTotalCost()}</strong> in ${analytics ? (analytics.execution_time * 1000).toFixed(1) : 'N/A'} milliseconds using ${steps.length} algorithm steps.</p>
        
        <p><strong>Efficiency:</strong> Algorithm achieved ${analytics ? (analytics.efficiency_ratio * 100).toFixed(1) : 'N/A'}% efficiency with a performance score of ${analytics ? analytics.performance_score.toFixed(1) : 'N/A'}/100.</p>
        
        <p><strong>Guarantee:</strong> The Hungarian algorithm provides mathematically proven optimal solutions for assignment problems with O(n³) time complexity.</p>
        `;
    }
    
    generateTechnicalAnalysisHTML(analytics) {
        if (!analytics) return '<p>No technical analysis available</p>';
        
        return `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3>Algorithm Performance Analysis</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>Complexity Metrics</h4>
                    <ul>
                        <li><strong>Theoretical Operations:</strong> ${analytics.theoretical_complexity}</li>
                        <li><strong>Actual Operations:</strong> ${analytics.actual_operations}</li>
                        <li><strong>Complexity Ratio:</strong> ${analytics.complexity_ratio.toFixed(3)}</li>
                        <li><strong>Time per Step:</strong> ${(analytics.time_per_step * 1000).toFixed(2)}ms</li>
                    </ul>
                </div>
                <div>
                    <h4>Matrix Properties</h4>
                    <ul>
                        <li><strong>Original Mean:</strong> ${analytics.original_properties.mean.toFixed(2)}</li>
                        <li><strong>Original Std Dev:</strong> ${analytics.original_properties.std.toFixed(2)}</li>
                        <li><strong>Condition Number:</strong> ${analytics.original_properties.condition_number.toFixed(2)}</li>
                        <li><strong>Final Zero Density:</strong> ${(analytics.final_properties.zero_density * 100).toFixed(1)}%</li>
                    </ul>
                </div>
            </div>
        </div>`;
    }
}