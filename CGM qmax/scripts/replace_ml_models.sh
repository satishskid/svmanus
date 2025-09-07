#!/bin/bash

# ML Model Replacement Script
# This script helps replace placeholder models with production models

set -e

echo "🔄 Child Growth Monitoring - ML Model Replacement Tool"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directories
PROJECT_DIR="/Users/spr/CGM qmax"
MODELS_DIR="$PROJECT_DIR/assets/ml_models"
BACKUP_DIR="$PROJECT_DIR/model_backups"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if running from correct directory
if [[ ! -d "$MODELS_DIR" ]]; then
    print_error "Models directory not found: $MODELS_DIR"
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Current ML Models Directory: $MODELS_DIR"

# List current models
echo "📋 Current placeholder models:"
ls -la "$MODELS_DIR"/*.tflite 2>/dev/null || print_warning "No .tflite files found"

# Backup existing models
print_status "Creating backup of existing models..."
cp -v "$MODELS_DIR"/*.tflite "$BACKUP_DIR/" 2>/dev/null || print_warning "No models to backup"

# Function to validate TFLite model
validate_model() {
    local model_path=$1
    local expected_input=$2
    local expected_output=$3
    
    if [[ ! -f "$model_path" ]]; then
        print_error "Model file not found: $model_path"
        return 1
    fi
    
    # Basic file size check (should be > 1KB)
    local file_size=$(stat -f%z "$model_path" 2>/dev/null || stat -c%s "$model_path" 2>/dev/null || echo "0")
    if [[ $file_size -lt 1024 ]]; then
        print_error "Model file too small: $model_path ($file_size bytes)"
        return 1
    fi
    
    print_status "Model validation passed: $model_path ($(($file_size/1024))KB)"
    return 0
}

# Interactive model replacement
echo ""
echo "🎯 Model Replacement Options:"
echo "1. Replace MUAC Detection Model (muac_detection.tflite)"
echo "2. Replace Arm-to-MUAC Conversion Model (arm_to_muac.tflite)"
echo "3. Replace both models"
echo "4. Restore from backup"
echo "5. Validate current models"
echo "6. Exit"
echo ""

read -p "Select option [1-6]: " choice

case $choice in
    1)
        echo ""
        print_status "Replacing MUAC Detection Model..."
        read -p "Enter path to new muac_detection.tflite: " new_model
        
        if validate_model "$new_model" "224x224x3" "4"; then
            cp -v "$new_model" "$MODELS_DIR/muac_detection.tflite"
            print_status "MUAC Detection model updated successfully!"
        fi
        ;;
    2)
        echo ""
        print_status "Replacing Arm-to-MUAC Conversion Model..."
        read -p "Enter path to new arm_to_muac.tflite: " new_model
        
        if validate_model "$new_model" "1" "1"; then
            cp -v "$new_model" "$MODELS_DIR/arm_to_muac.tflite"
            print_status "Arm-to-MUAC model updated successfully!"
        fi
        ;;
    3)
        echo ""
        print_status "Replacing both models..."
        
        read -p "Enter path to new muac_detection.tflite: " detection_model
        read -p "Enter path to new arm_to_muac.tflite: " conversion_model
        
        if validate_model "$detection_model" "224x224x3" "4" && \
           validate_model "$conversion_model" "1" "1"; then
            
            cp -v "$detection_model" "$MODELS_DIR/muac_detection.tflite"
            cp -v "$conversion_model" "$MODELS_DIR/arm_to_muac.tflite"
            
            print_status "Both models updated successfully!"
        fi
        ;;
    4)
        echo ""
        print_status "Restoring from backup..."
        if [[ -f "$BACKUP_DIR/muac_detection.tflite" ]]; then
            cp -v "$BACKUP_DIR/muac_detection.tflite" "$MODELS_DIR/"
        fi
        if [[ -f "$BACKUP_DIR/arm_to_muac.tflite" ]]; then
            cp -v "$BACKUP_DIR/arm_to_muac.tflite" "$MODELS_DIR/"
        fi
        print_status "Models restored from backup!"
        ;;
    5)
        echo ""
        print_status "Validating current models..."
        
        for model in "$MODELS_DIR"/*.tflite; do
            if [[ -f "$model" ]]; then
                file_size=$(stat -f%z "$model" 2>/dev/null || stat -c%s "$model" 2>/dev/null || echo "0")
                echo "$(basename "$model"): $(($file_size/1024))KB"
                
                # Check if it's a placeholder
                if grep -q "placeholder" "$model" 2>/dev/null; then
                    print_warning "$(basename "$model") appears to be a placeholder file"
                fi
            fi
        done
        ;;
    6)
        print_status "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid option selected"
        exit 1
        ;;
esac

# Post-replacement steps
echo ""
print_status "Post-replacement verification steps:"
echo "1. Run: flutter clean"
echo "2. Run: flutter pub get"
echo "3. Run: flutter build apk" # or flutter build ios
echo "4. Test model integration with: ./test_execution_script.sh"
echo ""

print_status "For detailed integration instructions, see: ML_MODEL_INTEGRATION_GUIDE.md"
print_status "For model training resources, see: assets/ml_models/placeholder_models.txt"