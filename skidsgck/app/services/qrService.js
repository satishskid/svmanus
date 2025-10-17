import { launchCamera } from 'react-native-image-picker';
import { Buffer } from 'buffer';
import { readChildProfile } from './offlineDB';

// Polyfill Buffer for jsqr
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

/**
 * Scan QR code and return child profile
 * QR format: { skids: "1.0", childId, name, dob }
 */
export const scanChildQR = async () => {
  const options = {
    mediaType: 'photo',
    includeBase64: true,
    maxHeight: 800,
    maxWidth: 800,
  };

  const result = await launchCamera(options);
  if (result?.didCancel) return null;

  try {
    // In production: use react-native-vision-camera + jsqr for real-time decoding
    // This mock returns a sample profile for demo
    const mockQR = {
      skids: "1.0",
      childId: "S1001",
      name: "Amina Ali",
      dob: "2019-05-12"
    };
    
    const profile = await readChildProfile(mockQR.childId);
    return profile || mockQR;
  } catch (e) {
    console.warn("QR scan failed:", e);
    return null;
  }
};

/**
 * Generate QR string for display/print
 */
export const generateQRString = (childId, name, dob) => {
  return JSON.stringify({
    skids: "1.0",
    childId,
    name,
    dob
  });
};