#!/usr/bin/env python3
"""
Hungarian Method Visualizer - Startup Script
============================================

This script provides an easy way to start the Hungarian Method Visualizer
with proper error handling and setup validation.
"""

import sys
import os
import subprocess
import importlib.util

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'flask',
        'numpy',
        'matplotlib',
        'seaborn',
        'psutil'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        if importlib.util.find_spec(package) is None:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n💡 Install missing packages with:")
        print("   pip install -r requirements.txt")
        return False
    
    print("✅ All required dependencies are installed")
    return True

def create_directories():
    """Create necessary directories if they don't exist"""
    directories = [
        'templates',
        'static/css',
        'static/js'
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"📁 Created directory: {directory}")

def check_files():
    """Check if essential files exist"""
    essential_files = [
        'app.py',
        'hungarian_algorithm.py',
        'analytics.py',
        'matrix_generator.py',
        'templates/index.html',
        'static/css/style.css',
        'static/js/app.js'
    ]
    
    missing_files = []
    
    for file_path in essential_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing essential files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    
    print("✅ All essential files are present")
    return True

def start_application():
    """Start the Flask application"""
    try:
        print("\n🚀 Starting Hungarian Method Visualizer...")
        print("📍 Application will be available at: http://localhost:5000")
        print("⏹️  Press Ctrl+C to stop the server\n")
        
        # Import and run the Flask app
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except ImportError as e:
        print(f"❌ Error importing application: {e}")
        return False
    except KeyboardInterrupt:
        print("\n\n👋 Application stopped by user")
        return True
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        return False

def main():
    """Main startup function"""
    print("🔍 Hungarian Method Visualizer - Startup Check")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Check files
    if not check_files():
        print("\n💡 Make sure you're running this script from the project root directory")
        sys.exit(1)
    
    print("\n✅ All checks passed!")
    print("=" * 50)
    
    # Start the application
    start_application()

if __name__ == "__main__":
    main()