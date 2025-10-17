import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import jsQR from 'jsqr';

const { width, height } = Dimensions.get('window');

/**
 * QRScannerScreen - Real-time QR code detection for child profile enrollment
 * QR Format: { skids: "1.0", childId: "S####", name: "...", dob: "YYYY-MM-DD" }
 */
export const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = React.useRef(null);

  // Request camera permissions on mount
  useEffect(() => {
    if (!hasPermission?.granted) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  /**
   * Parse QR code data and validate format
   * Expected: { skids, childId, name, dob }
   */
  const parseQRData = (rawData) => {
    try {
      const data = JSON.parse(rawData);
      
      // Validate required fields
      if (!data.skids || !data.childId || !data.name || !data.dob) {
        throw new Error('Invalid QR format - missing required fields');
      }
      
      // Validate SKIDS version
      if (data.skids !== '1.0') {
        throw new Error(`Unsupported SKIDS version: ${data.skids}`);
      }
      
      // Validate childId format (S followed by 4+ digits)
      if (!/^S\d{4,}$/.test(data.childId)) {
        throw new Error('Invalid child ID format');
      }
      
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dob)) {
        throw new Error('Invalid date format (expected YYYY-MM-DD)');
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to parse QR code: ${error.message}`);
    }
  };

  /**
   * Handle successful QR code scan
   */
  const handleBarCodeScanned = async (data) => {
    if (scanned) return; // Prevent multiple scans
    
    setScanned(true);
    setLoading(true);

    try {
      const childProfile = parseQRData(data);
      
      // Log successful scan
      console.log('✅ QR Scan successful:', childProfile);
      
      // Navigate to HomeScreen with scanned child
      setLoading(false);
      navigation.navigate('Home', {
        scannedChild: childProfile,
      });
    } catch (error) {
      console.error('❌ QR Scan error:', error.message);
      
      Alert.alert(
        'Invalid QR Code',
        error.message,
        [
          {
            text: 'Scan Again',
            onPress: () => setScanned(false),
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
      setLoading(false);
    }
  };

  /**
   * Process camera frame for QR detection
   */
  const onCameraFrame = async (frame) => {
    if (scanned || loading) return;

    try {
      const { data, width, height } = frame;
      
      // Detect QR code in frame
      const code = jsQR(data, width, height);
      
      if (code?.data) {
        // Found a QR code
        handleBarCodeScanned(code.data);
      }
    } catch (error) {
      // Silent fail for frame processing errors
      console.debug('Frame processing error:', error.message);
    }
  };

  // No permission
  if (!hasPermission?.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera Permission Required</Text>
          <Text style={styles.permissionSubtext}>
            We need camera access to scan QR codes for child enrollment.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onFrameProcessed={onCameraFrame}
        frameProcessingOptions={{
          maxInterval: 100, // Process every 100ms
        }}
      >
        {/* Overlay with scanning frame */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>Position QR code in frame</Text>
        </View>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a6fa5" />
            <Text style={styles.loadingText}>Processing QR Code...</Text>
          </View>
        )}
      </CameraView>

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        {scanned && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.retryButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>📱 QR Code Scanning</Text>
        <Text style={styles.instructionsText}>
          • Position the QR code in the frame{'\n'}
          • Keep it still for 2 seconds{'\n'}
          • Code will auto-scan when detected
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4a6fa5',
    borderRadius: 12,
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
  },
  scanText: {
    marginTop: 20,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#666',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#4a6fa5',
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  instructionsTitle: {
    color: '#4a6fa5',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  instructionsText: {
    color: '#AAA',
    fontSize: 12,
    lineHeight: 18,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#4a6fa5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QRScannerScreen;
