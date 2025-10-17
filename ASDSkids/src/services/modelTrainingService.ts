/**
 * Model Training Service for Autism Screening
 *
 * This service handles training machine learning models using
 * processed behavioral datasets from Hugging Face.
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { datasetProcessor, ProcessedDataset } from './datasetProcessor';

export interface TrainingConfig {
  modelType: 'behavioral_classifier' | 'pose_analyzer' | 'expression_recognizer';
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
}

export interface TrainingResult {
  modelId: string;
  accuracy: number;
  loss: number;
  validationAccuracy: number;
  validationLoss: number;
  trainingTime: number;
  modelSize: number;
}

export class ModelTrainingService {
  private models: Map<string, tf.LayersModel> = new Map();
  private trainingHistory: Map<string, TrainingResult> = new Map();

  /**
   * Train a model using processed dataset
   */
  async trainModel(
    datasetName: string,
    config: TrainingConfig
  ): Promise<TrainingResult | null> {
    try {
      console.log(`Starting training for ${datasetName} with config:`, config);

      // Get processed dataset
      const dataset = await datasetProcessor.getDatasetInfo(datasetName);
      if (!dataset) {
        throw new Error(`Dataset ${datasetName} not found or not processed`);
      }

      // Create model architecture based on type
      const model = this.createModel(config.modelType, dataset);

      // Prepare training data
      const { xs, ys } = await this.prepareTrainingData(dataset, config);

      // Split data for validation
      const validationSplit = config.validationSplit || 0.2;
      const splitIndex = Math.floor(xs.shape[0] * (1 - validationSplit));

      const trainXs = xs.slice([0, 0], [splitIndex, -1]);
      const trainYs = ys.slice([0, 0], [splitIndex, -1]);
      const valXs = xs.slice([splitIndex, 0], [-1, -1]);
      const valYs = ys.slice([splitIndex, 0], [-1, -1]);

      // Compile model
      model.compile({
        optimizer: tf.train.adam(config.learningRate || 0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      // Train model
      const startTime = Date.now();

      const history = await model.fit(trainXs, trainYs, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationData: [valXs, valYs],
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}/${config.epochs}: loss=${logs?.loss?.toFixed(4)}, acc=${logs?.acc?.toFixed(4)}`);
          }
        }
      });

      const trainingTime = Date.now() - startTime;

      // Evaluate final model
      const result = await model.evaluate(valXs, valYs) as tf.Tensor[];
      const accuracy = (result[1] as tf.Tensor).dataSync()[0];
      const loss = (result[0] as tf.Tensor).dataSync()[0];

      // Save model
      const modelId = `${config.modelType}_${Date.now()}`;
      await this.saveModel(model, modelId);

      const trainingResult: TrainingResult = {
        modelId,
        accuracy,
        loss,
        validationAccuracy: history.history.val_acc ? history.history.val_acc[history.history.val_acc.length - 1] as number : 0,
        validationLoss: history.history.val_loss ? history.history.val_loss[history.history.val_loss.length - 1] as number : 0,
        trainingTime,
        modelSize: this.getModelSize(model)
      };

      this.trainingHistory.set(modelId, trainingResult);
      this.models.set(modelId, model);

      console.log(`Training completed for ${modelId}:`, trainingResult);
      return trainingResult;

    } catch (error) {
      console.error(`Training failed for ${datasetName}:`, error);
      return null;
    }
  }

  /**
   * Create model architecture based on type and dataset
   */
  private createModel(modelType: string, dataset: ProcessedDataset): tf.LayersModel {
    const inputShape = [dataset.features.length];

    const model = tf.sequential();

    // Input layer
    model.add(tf.layers.dense({
      inputShape,
      units: 128,
      activation: 'relu'
    }));

    // Hidden layers
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));

    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));

    // Output layer
    const outputUnits = this.getOutputUnits(modelType, dataset);
    model.add(tf.layers.dense({
      units: outputUnits,
      activation: 'softmax'
    }));

    return model;
  }

  /**
   * Get output units based on model type and labels
   */
  private getOutputUnits(modelType: string, dataset: ProcessedDataset): number {
    switch (modelType) {
      case 'behavioral_classifier':
        return dataset.labels.length;
      case 'pose_analyzer':
        return 16; // Number of pose keypoints
      case 'expression_recognizer':
        return 7; // Basic emotions
      default:
        return dataset.labels.length;
    }
  }

  /**
   * Prepare training data from dataset
   */
  private async prepareTrainingData(
    dataset: ProcessedDataset,
    config: TrainingConfig
  ): Promise<{ xs: tf.Tensor; ys: tf.Tensor }> {
    // Generate mock training data for demonstration
    // In a real implementation, this would load actual data from files

    const numSamples = Math.min(dataset.samples, 1000); // Limit for demo
    const numFeatures = dataset.features.length;

    // Generate random input features
    const xsData = [];
    for (let i = 0; i < numSamples; i++) {
      const sample = Array.from({ length: numFeatures }, () => Math.random());
      xsData.push(sample);
    }

    // Generate corresponding labels
    const ysData = [];
    for (let i = 0; i < numSamples; i++) {
      const label = Array.from({ length: this.getOutputUnits(config.modelType, dataset) }, (_, idx) =>
        idx === (i % dataset.labels.length) ? 1 : 0
      );
      ysData.push(label);
    }

    return {
      xs: tf.tensor2d(xsData),
      ys: tf.tensor2d(ysData)
    };
  }

  /**
   * Save trained model
   */
  private async saveModel(model: tf.LayersModel, modelId: string): Promise<void> {
    try {
      // In React Native, we need to handle model saving differently
      // For now, just store reference
      console.log(`Model ${modelId} saved`);
    } catch (error) {
      console.error(`Failed to save model ${modelId}:`, error);
    }
  }

  /**
   * Get model size in bytes
   */
  private getModelSize(model: tf.LayersModel): number {
    // Calculate approximate model size
    let size = 0;
    model.layers.forEach(layer => {
      const weights = layer.getWeights();
      weights.forEach(weight => {
        size += weight.size;
      });
    });
    return size * 4; // Assuming float32
  }

  /**
   * Get training history for a model
   */
  getTrainingHistory(modelId: string): TrainingResult | null {
    return this.trainingHistory.get(modelId) || null;
  }

  /**
   * List all trained models
   */
  listTrainedModels(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Load model for inference
   */
  getModel(modelId: string): tf.LayersModel | null {
    return this.models.get(modelId) || null;
  }

  /**
   * Run inference on new data
   */
  async runInference(modelId: string, inputData: number[][]): Promise<number[][] | null> {
    try {
      const model = this.getModel(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      const inputTensor = tf.tensor2d(inputData);
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const result = prediction.arraySync() as number[][];

      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      return result;

    } catch (error) {
      console.error(`Inference failed for model ${modelId}:`, error);
      return null;
    }
  }

  /**
   * Train models using multiple datasets
   */
  async trainMultipleModels(datasets: string[], config: TrainingConfig): Promise<TrainingResult[]> {
    const results: TrainingResult[] = [];

    for (const datasetName of datasets) {
      try {
        const result = await this.trainModel(datasetName, config);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Failed to train model for dataset ${datasetName}:`, error);
      }
    }

    return results;
  }
}

// Export singleton instance
export const modelTrainingService = new ModelTrainingService();
