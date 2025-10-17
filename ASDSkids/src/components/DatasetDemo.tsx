/**
 * Dataset Demo Component
 *
 * Demonstrates the 1,2,3 process with Hugging Face datasets:
 * 1. Explore available datasets
 * 2. Download and process datasets
 * 3. Train models using the datasets
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { datasetProcessor, ProcessedDataset } from '../services/datasetProcessor';
import { modelTrainingService, TrainingConfig, TrainingResult } from '../services/modelTrainingService';

interface DatasetDemoProps {
  style?: any;
}

export const DatasetDemo: React.FC<DatasetDemoProps> = ({ style }) => {
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);
  const [processedDatasets, setProcessedDatasets] = useState<string[]>([]);
  const [trainedModels, setTrainedModels] = useState<string[]>([]);
  const [currentDataset, setCurrentDataset] = useState<string | null>(null);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    loadAvailableDatasets();
    loadProcessedDatasets();
    loadTrainedModels();
  }, []);

  const loadAvailableDatasets = () => {
    const datasets = datasetProcessor.getAvailableDatasets();
    setAvailableDatasets(datasets);
  };

  const loadProcessedDatasets = async () => {
    const datasets = await datasetProcessor.listDownloadedDatasets();
    setProcessedDatasets(datasets);
  };

  const loadTrainedModels = () => {
    const models = modelTrainingService.listTrainedModels();
    setTrainedModels(models);
  };

  const handleProcessDataset = async (datasetName: string) => {
    setIsProcessing(true);
    setCurrentDataset(datasetName);

    try {
      // Step 1: Download dataset (placeholder for now)
      console.log(`Step 1: Downloading ${datasetName}...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate download

      // Step 2: Process dataset
      console.log(`Step 2: Processing ${datasetName}...`);
      const result = await datasetProcessor.processDataset(datasetName);

      if (result) {
        console.log(`Dataset processed successfully:`, result);
        await loadProcessedDatasets();
      } else {
        console.error(`Failed to process dataset ${datasetName}`);
      }

    } catch (error) {
      console.error(`Error processing dataset ${datasetName}:`, error);
    } finally {
      setIsProcessing(false);
      setCurrentDataset(null);
    }
  };

  const handleTrainModel = async (datasetName: string) => {
    setIsTraining(true);

    try {
      // Step 3: Train model
      const config: TrainingConfig = {
        modelType: 'behavioral_classifier',
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001,
        validationSplit: 0.2
      };

      console.log(`Step 3: Training model on ${datasetName}...`);
      const result = await modelTrainingService.trainModel(datasetName, config);

      if (result) {
        setTrainingResult(result);
        await loadTrainedModels();
        console.log(`Model trained successfully:`, result);
      } else {
        console.error(`Failed to train model on ${datasetName}`);
      }

    } catch (error) {
      console.error(`Error training model on ${datasetName}:`, error);
    } finally {
      setIsTraining(false);
    }
  };

  const renderDatasetCard = (dataset: any, index: number) => (
    <View key={index} style={styles.datasetCard}>
      <Text style={styles.datasetName}>{dataset.name}</Text>
      <Text style={styles.datasetDescription}>{dataset.description}</Text>
      <Text style={styles.datasetSize}>Size: {dataset.size}</Text>
      <Text style={styles.datasetTask}>Task: {dataset.task}</Text>

      <TouchableOpacity
        style={[styles.button, styles.processButton]}
        onPress={() => handleProcessDataset(dataset.name)}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>
          {isProcessing && currentDataset === dataset.name ? 'Processing...' : 'Process Dataset'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProcessedDatasetCard = (datasetName: string, index: number) => (
    <View key={index} style={styles.processedCard}>
      <Text style={styles.processedName}>{datasetName}</Text>
      <TouchableOpacity
        style={[styles.button, styles.trainButton]}
        onPress={() => handleTrainModel(datasetName)}
        disabled={isTraining}
      >
        <Text style={styles.buttonText}>
          {isTraining ? 'Training...' : 'Train Model'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTrainingResult = () => {
    if (!trainingResult) return null;

    return (
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>Training Results</Text>
        <Text style={styles.resultText}>Model ID: {trainingResult.modelId}</Text>
        <Text style={styles.resultText}>Accuracy: {(trainingResult.accuracy * 100).toFixed(2)}%</Text>
        <Text style={styles.resultText}>Validation Accuracy: {(trainingResult.validationAccuracy * 100).toFixed(2)}%</Text>
        <Text style={styles.resultText}>Training Time: {(trainingResult.trainingTime / 1000).toFixed(1)}s</Text>
        <Text style={styles.resultText}>Model Size: {(trainingResult.modelSize / 1024).toFixed(1)}KB</Text>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, style]}>
      <Text style={styles.title}>Hugging Face Dataset Integration Demo</Text>

      {/* Step 1: Available Datasets */}
      <Text style={styles.stepTitle}>Step 1: Available Datasets</Text>
      {availableDatasets.map((dataset, index) => renderDatasetCard(dataset, index))}

      {/* Step 2: Processed Datasets */}
      <Text style={styles.stepTitle}>Step 2: Processed Datasets</Text>
      {processedDatasets.length > 0 ? (
        processedDatasets.map((datasetName, index) => renderProcessedDatasetCard(datasetName, index))
      ) : (
        <Text style={styles.noDataText}>No processed datasets yet</Text>
      )}

      {/* Step 3: Training Results */}
      <Text style={styles.stepTitle}>Step 3: Training Results</Text>
      {renderTrainingResult()}

      {trainedModels.length > 0 && (
        <View style={styles.modelsCard}>
          <Text style={styles.modelsTitle}>Trained Models</Text>
          {trainedModels.map((modelId, index) => (
            <Text key={index} style={styles.modelId}>{modelId}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
  },
  datasetCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  datasetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  datasetDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  datasetSize: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  datasetTask: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  processedCard: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  processedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d2e',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  processButton: {
    backgroundColor: '#007AFF',
  },
  trainButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  modelsCard: {
    backgroundColor: '#d1ecf1',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  modelsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c5460',
    marginBottom: 8,
  },
  modelId: {
    fontSize: 12,
    color: '#0c5460',
    fontFamily: 'monospace',
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DatasetDemo;
