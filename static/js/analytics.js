// Analytics Display Component
class AnalyticsDisplay {
    constructor(app) {
        this.app = app;
        this.charts = {};
        this.currentAnalytics = null;
    }
    
    displayAnalytics(analytics, charts) {
        this.currentAnalytics = analytics;
        this.charts = charts;
        
        this.updateMetricCards(analytics);
        this.displayCharts(charts);
        this.createInteractiveCharts(analytics);
    }
    
    updateMetricCards(analytics) {
        // Execution Time with better precision
        const execTime = document.getElementById('exec-time');
        if (execTime) {
            const timeMs = analytics.execution_time * 1000;
            if (timeMs < 1) {
                // Show microseconds for very fast execution
                execTime.textContent = (analytics.execution_time * 1000000).toFixed(0);
                execTime.parentElement.querySelector('.metric-unit').textContent = 'μs';
            } else if (timeMs < 100) {
                // Show milliseconds with 2 decimal places for fast execution
                execTime.textContent = timeMs.toFixed(2);
                execTime.parentElement.querySelector('.metric-unit').textContent = 'ms';
            } else {
                // Show milliseconds with 1 decimal place for normal execution
                execTime.textContent = timeMs.toFixed(1);
                execTime.parentElement.querySelector('.metric-unit').textContent = 'ms';
            }
        }
        
        // Total Steps
        const totalSteps = document.getElementById('total-steps-metric');
        if (totalSteps) {
            totalSteps.textContent = analytics.num_steps || 0;
        }
        
        // Final Cost
        const finalCost = document.getElementById('final-cost');
        if (finalCost && this.app.getAlgorithmSteps().length > 0) {
            const steps = this.app.getAlgorithmSteps();
            const lastStep = steps[steps.length - 1];
            if (lastStep.assigned_positions) {
                const totalCost = lastStep.assigned_positions.reduce((sum, [row, col]) => {
                    return sum + this.app.getCurrentMatrix()[row][col];
                }, 0);
                finalCost.textContent = totalCost;
            }
        }
        
        // Efficiency
        const efficiency = document.getElementById('efficiency');
        if (efficiency) {
            const efficiencyValue = (analytics.efficiency_ratio * 100).toFixed(1);
            efficiency.textContent = efficiencyValue;
        }
        
        // Iterations
        const iterations = document.getElementById('iterations');
        if (iterations) {
            iterations.textContent = analytics.iterations_count || 0;
        }
    }
    
    displayCharts(charts) {
        // Display base64 encoded charts from backend
        console.log('Displaying charts:', Object.keys(charts));
        
        if (charts.cost_reduction) {
            this.displayImageChart('cost-chart', charts.cost_reduction);
        }
        
        if (charts.zero_density) {
            this.displayImageChart('density-chart', charts.zero_density);
        }
        
        if (charts.final_heatmap) {
            this.displayImageChart('heatmap-chart', charts.final_heatmap);
        }
    }
    
    displayImageChart(containerId, base64Image) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        const img = document.createElement('img');
        img.src = base64Image;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '4px';
        container.appendChild(img);
    }
    
    createInteractiveCharts(analytics) {
        // Create interactive charts using Plotly
        try {
            this.createStepProgressChart(analytics);
            this.createComplexityChart(analytics);
            this.createPerformanceRadar(analytics);
        } catch (error) {
            console.error('Error creating interactive charts:', error);
            // Continue execution even if charts fail
        }
    }
    
    createStepProgressChart(analytics) {
        console.log('Creating step progress chart with analytics:', analytics);
        
        if (!analytics.frobenius_evolution || !analytics.zero_density_evolution) {
            console.log('Missing data for progress chart');
            return;
        }
        
        console.log('Frobenius evolution:', analytics.frobenius_evolution);
        console.log('Zero density evolution:', analytics.zero_density_evolution);
        
        const trace1 = {
            x: analytics.frobenius_evolution.map((_, i) => i + 1),
            y: analytics.frobenius_evolution,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Frobenius Norm',
            line: { color: '#3498db', width: 3 },
            marker: { size: 6 }
        };
        
        const trace2 = {
            x: analytics.zero_density_evolution.map((_, i) => i + 1),
            y: analytics.zero_density_evolution.map(d => d * 100),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Zero Density (%)',
            yaxis: 'y2',
            line: { color: '#2ecc71', width: 3 },
            marker: { size: 6 }
        };
        
        const layout = {
            title: 'Algorithm Progress',
            xaxis: { title: 'Step' },
            yaxis: { title: 'Frobenius Norm', side: 'left' },
            yaxis2: {
                title: 'Zero Density (%)',
                side: 'right',
                overlaying: 'y'
            },
            showlegend: true,
            height: 300,
            margin: { t: 40, r: 60, b: 40, l: 60 }
        };
        
        const config = { responsive: true, displayModeBar: false };
        
        // Find existing progress chart container or create new one
        let progressContainer = document.getElementById('progress-chart');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'progress-chart';
            
            // Find a suitable parent container
            const chartsContainer = document.querySelector('.charts-container');
            if (chartsContainer) {
                const chartPanel = document.createElement('div');
                chartPanel.className = 'chart-panel';
                chartPanel.innerHTML = '<h4>Algorithm Progress</h4>';
                chartPanel.appendChild(progressContainer);
                chartsContainer.appendChild(chartPanel);
            }
        }
        
        if (window.Plotly) {
            console.log('Creating Plotly chart...');
            Plotly.newPlot('progress-chart', [trace1, trace2], layout, config);
        } else {
            console.error('Plotly not available');
        }
    }
    
    createComplexityChart(analytics) {
        console.log('Creating complexity chart with analytics:', analytics);
        
        if (!analytics.operations) {
            console.log('No operations data, creating fallback chart');
            // Create fallback data
            const operations = {
                'additions': analytics.actual_operations * 0.3,
                'subtractions': analytics.actual_operations * 0.4,
                'comparisons': analytics.actual_operations * 0.2,
                'assignments': analytics.actual_operations * 0.1
            };
        } else {
            var operations = analytics.operations;
        }
        
        const data = [{
            values: Object.values(operations),
            labels: Object.keys(operations).map(key => 
                key.charAt(0).toUpperCase() + key.slice(1)
            ),
            type: 'pie',
            hole: 0.4,
            marker: {
                colors: ['#3498db', '#e74c3c', '#f39c12', '#2ecc71']
            }
        }];
        
        const layout = {
            title: 'Operation Distribution',
            showlegend: true,
            height: 300,
            margin: { t: 40, r: 20, b: 20, l: 20 }
        };
        
        const config = { responsive: true, displayModeBar: false };
        
        // Find or create container
        let complexityContainer = document.getElementById('complexity-chart');
        if (!complexityContainer) {
            complexityContainer = document.createElement('div');
            complexityContainer.id = 'complexity-chart';
            
            const chartsContainer = document.querySelector('.charts-container');
            if (chartsContainer) {
                const chartPanel = document.createElement('div');
                chartPanel.className = 'chart-panel';
                chartPanel.innerHTML = '<h4>Operation Complexity</h4>';
                chartPanel.appendChild(complexityContainer);
                chartsContainer.appendChild(chartPanel);
            }
        }
        
        if (window.Plotly) {
            Plotly.newPlot('complexity-chart', data, layout, config);
        } else {
            complexityContainer.innerHTML = '<p>Chart library not loaded</p>';
        }
    }
    
    createPerformanceRadar(analytics) {
        const performanceMetrics = this.calculatePerformanceMetrics(analytics);
        
        const data = [{
            type: 'scatterpolar',
            r: Object.values(performanceMetrics),
            theta: Object.keys(performanceMetrics),
            fill: 'toself',
            name: 'Performance',
            line: { color: '#3498db' },
            fillcolor: 'rgba(52, 152, 219, 0.2)'
        }];
        
        const layout = {
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, 100]
                }
            },
            title: 'Performance Radar',
            height: 300,
            margin: { t: 40, r: 20, b: 20, l: 20 }
        };
        
        const config = { responsive: true, displayModeBar: false };
        
        // Create container
        const radarContainer = document.createElement('div');
        radarContainer.id = 'radar-chart';
        
        const chartsContainer = document.querySelector('.charts-container');
        if (chartsContainer) {
            const chartPanel = document.createElement('div');
            chartPanel.className = 'chart-panel';
            chartPanel.innerHTML = '<h4>Performance Overview</h4>';
            chartPanel.appendChild(radarContainer);
            chartsContainer.appendChild(chartPanel);
            
            Plotly.newPlot('radar-chart', data, layout, config);
        }
    }
    
    calculatePerformanceMetrics(analytics) {
        // Normalize metrics to 0-100 scale
        const metrics = {};
        
        // Speed (inverse of execution time)
        const maxTime = 5.0; // 5 seconds as max reasonable time
        metrics['Speed'] = Math.max(0, 100 - (analytics.execution_time / maxTime) * 100);
        
        // Efficiency (zero density)
        metrics['Efficiency'] = (analytics.efficiency_ratio || 0) * 100;
        
        // Convergence (inverse of steps)
        const maxSteps = analytics.matrix_size * 3; // Reasonable max steps
        metrics['Convergence'] = Math.max(0, 100 - ((analytics.num_steps || 0) / maxSteps) * 100);
        
        // Memory efficiency (simplified)
        metrics['Memory'] = 85; // Placeholder - would need actual memory data
        
        // Accuracy (always 100% for Hungarian algorithm)
        metrics['Accuracy'] = 100;
        
        return metrics;
    }
    
    generateDetailedReport() {
        if (!this.currentAnalytics) return null;
        
        const analytics = this.currentAnalytics;
        const steps = this.app.getAlgorithmSteps();
        
        const report = {
            summary: {
                algorithm: 'Hungarian Method',
                matrixSize: analytics.matrix_size,
                executionTime: analytics.execution_time,
                totalSteps: analytics.num_steps,
                finalCost: this.getFinalCost(),
                timestamp: new Date().toISOString()
            },
            performance: {
                timePerStep: analytics.time_per_step,
                convergenceRate: analytics.convergence_rate,
                efficiencyRatio: analytics.efficiency_ratio,
                performanceScore: analytics.performance_score
            },
            complexity: {
                theoreticalOps: analytics.theoretical_complexity,
                actualOps: analytics.actual_operations,
                complexityRatio: analytics.complexity_ratio,
                operations: analytics.operations
            },
            matrixProperties: {
                original: analytics.original_properties,
                final: analytics.final_properties
            },
            stepBreakdown: analytics.step_breakdown,
            convergenceIndicators: analytics.convergence_indicators,
            steps: steps.map(step => ({
                stepNumber: step.step_number,
                type: step.type,
                description: step.description,
                zeroDensity: step.zero_density,
                frobeniusNorm: step.frobenius_norm
            }))
        };
        
        return report;
    }
    
    getFinalCost() {
        const steps = this.app.getAlgorithmSteps();
        if (steps.length === 0) return 0;
        
        const lastStep = steps[steps.length - 1];
        if (!lastStep.assigned_positions) return 0;
        
        return lastStep.assigned_positions.reduce((sum, [row, col]) => {
            return sum + this.app.getCurrentMatrix()[row][col];
        }, 0);
    }
    
    exportAnalytics() {
        return {
            analytics: this.currentAnalytics,
            report: this.generateDetailedReport(),
            charts: this.charts,
            timestamp: new Date().toISOString()
        };
    }
    
    displayStepAnalytics(stepIndex) {
        const steps = this.app.getAlgorithmSteps();
        if (stepIndex < 0 || stepIndex >= steps.length) return;
        
        const step = steps[stepIndex];
        
        // Update step-specific metrics
        this.updateStepMetrics(step);
        
        // Highlight current step in charts
        this.highlightStepInCharts(stepIndex);
    }
    
    updateStepMetrics(step) {
        // Create or update step-specific metric display
        let stepMetricsContainer = document.getElementById('step-metrics');
        if (!stepMetricsContainer) {
            stepMetricsContainer = document.createElement('div');
            stepMetricsContainer.id = 'step-metrics';
            stepMetricsContainer.className = 'step-metrics-container';
            
            const analyticsPanel = document.querySelector('#analytics-panel .panel-content');
            if (analyticsPanel) {
                analyticsPanel.insertBefore(stepMetricsContainer, analyticsPanel.firstChild);
            }
        }
        
        stepMetricsContainer.innerHTML = `
            <h4>Current Step Metrics</h4>
            <div class="step-metrics-grid">
                <div class="step-metric">
                    <span class="metric-label">Zero Density:</span>
                    <span class="metric-value">${(step.zero_density * 100).toFixed(1)}%</span>
                </div>
                <div class="step-metric">
                    <span class="metric-label">Frobenius Norm:</span>
                    <span class="metric-value">${step.frobenius_norm.toFixed(2)}</span>
                </div>
                <div class="step-metric">
                    <span class="metric-label">Zeros Count:</span>
                    <span class="metric-value">${step.zeros ? step.zeros.length : 0}</span>
                </div>
            </div>
        `;
    }
    
    highlightStepInCharts(stepIndex) {
        // Add visual indicator to charts showing current step
        // This would require updating the Plotly charts with annotations
        if (window.Plotly && document.getElementById('progress-chart')) {
            const update = {
                'shapes[0]': {
                    type: 'line',
                    x0: stepIndex + 1,
                    x1: stepIndex + 1,
                    y0: 0,
                    y1: 1,
                    yref: 'paper',
                    line: {
                        color: '#e74c3c',
                        width: 2,
                        dash: 'dash'
                    }
                }
            };
            
            Plotly.relayout('progress-chart', update);
        }
    }
    
    createComparisonChart(currentAnalytics, previousAnalytics) {
        // Compare current run with previous runs
        // This would be useful for analyzing different matrix sizes or configurations
        
        const metrics = ['execution_time', 'num_steps', 'efficiency_ratio'];
        const currentValues = metrics.map(metric => currentAnalytics[metric] || 0);
        const previousValues = metrics.map(metric => previousAnalytics[metric] || 0);
        
        const data = [
            {
                x: metrics,
                y: currentValues,
                type: 'bar',
                name: 'Current Run',
                marker: { color: '#3498db' }
            },
            {
                x: metrics,
                y: previousValues,
                type: 'bar',
                name: 'Previous Run',
                marker: { color: '#95a5a6' }
            }
        ];
        
        const layout = {
            title: 'Performance Comparison',
            barmode: 'group',
            height: 300
        };
        
        // This would be implemented when comparison functionality is needed
        return { data, layout };
    }
}