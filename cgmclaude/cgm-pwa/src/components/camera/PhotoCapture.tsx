import React, { useRef, useEffect, useState, useCallback } from 'react';
import { db } from '../../core/database/database';
import type { MeasurementRecord } from '../../core/database/models/Measurement';
import { Box, Button, TextField, Typography, Slider, Paper } from '@mui/material';

// Define types
type Point = { x: number; y: number };
const CaptureStep = {
  Idle: 0,
  Calibrating: 1,
  Measuring: 2
} as const;
type CaptureStepType = typeof CaptureStep[keyof typeof CaptureStep];

interface PhotoCaptureProps {
    selectedChildId: string | null;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ selectedChildId }) => {
  // Refs and State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [step, setStep] = useState<CaptureStepType>(CaptureStep.Idle);

  // Calibration state
  const [calibLine, setCalibLine] = useState({ x: 150, y: 150, len: 100, angle: 0 });
  const [refObjectPixels, setRefObjectPixels] = useState<number>(100);
  const [refObjectMm, setRefObjectMm] = useState<number>(23); // Default to a common coin size

  // Measurement state
  const [measurePoints, setMeasurePoints] = useState<Point[]>([]);
  const [pixelHeight, setPixelHeight] = useState<number | null>(null);
  const calculatedHeightCm = pixelHeight ? (pixelHeight / refObjectPixels) * (refObjectMm / 10) : null;

  // --- Core Functions ---

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) { videoRef.current.srcObject = mediaStream; }
    } catch (err) { console.error("Error accessing camera: ", err); }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const context = tempCanvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = tempCanvas.toDataURL('image/webp');
        setCapturedImage(dataUrl);
        setStep(CaptureStep.Calibrating);
        setMeasurePoints([]);
        setPixelHeight(null);
      }
    }
  };

  const resetCapture = () => {
      setCapturedImage(null);
      setStep(CaptureStep.Idle);
      setMeasurePoints([]);
      setPixelHeight(null);
  };

  const setCalibration = () => {
      setRefObjectPixels(calibLine.len);
      setStep(CaptureStep.Measuring);
      alert(`Calibration set to ${calibLine.len.toFixed(2)} pixels.`);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (step !== CaptureStep.Measuring || measurePoints.length >= 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const newPoint = { x, y };
    const newPoints = [...measurePoints, newPoint];
    setMeasurePoints(newPoints);
    if (newPoints.length === 2) {
      const dist = Math.sqrt(Math.pow(newPoints[0].x - newPoints[1].x, 2) + Math.pow(newPoints[0].y - newPoints[1].y, 2));
      setPixelHeight(dist);
    }
  };

  const handleSaveMeasurement = async () => {
    if (!selectedChildId || !calculatedHeightCm || measurePoints.length !== 2) {
      alert('Please select a child and complete measurement.');
      return;
    }
    const measurementDate = new Date();
    // For demo, use image data URL as imageId (in real app, store image and use its ID)
    const imageId = capturedImage || '';
    // Reference object info
    const referenceObjects = [{ type: 'custom', knownSize: { width: refObjectMm, height: refObjectMm } }];
    // Measurement points
    const measurementPoints = {
      head: { x: measurePoints[0].x, y: measurePoints[0].y, confidence: 1 },
      feet: { x: measurePoints[1].x, y: measurePoints[1].y, confidence: 1 }
    };
    // Calibration data
    const calibrationData = {
      pixelsPerCm: refObjectPixels / 10, // px per cm
      perspectiveCorrection: 0,
      confidenceInterval: [refObjectPixels / 10 * 0.95, refObjectPixels / 10 * 1.05] as [number, number]
    };
    // Image quality (placeholder values)
    const imageQuality = {
      sharpness: 100,
      lighting: 100,
      framing: 100,
      overall: 100
    };
    // Build measurement record
    const newMeasurement: Omit<MeasurementRecord, 'id'> = {
      childId: selectedChildId,
      measurementDate,
      ageInDays: 0, // Should be calculated from child DOB
      anthropometry: {
        height: {
          value: calculatedHeightCm,
          method: 'photogrammetry',
          accuracy: 0.2,
          measurementAttempts: 1
        }
      },
      photogrammetryData: {
        imageId,
        referenceObjects,
        measurementPoints,
        imageQuality,
        calibrationData
      },
      calculatedIndicators: {
        haz: { value: 0, percentile: 0, status: 'unknown' },
        waz: { value: 0, percentile: 0, status: 'unknown' },
        whz: { value: 0, percentile: 0, status: 'unknown' }
      },
      context: {
        measuredBy: 'worker-id-placeholder',
        location: 'clinic',
        visitType: 'routine',
        healthStatus: 'healthy',
        feedingStatus: 'unknown'
      },
      qualityMetrics: {
        dataCompleteness: 100,
        measurementAccuracy: 100,
        validationsPassed: [],
        warningsGenerated: [],
        confidenceScore: 100
      }
    };
    try {
      await db.measurements.add(newMeasurement as MeasurementRecord);
      alert('Photogrammetry measurement saved!');
      resetCapture();
    } catch (err) {
      alert('Error saving measurement.');
      console.error(err);
    }
  };

  // --- Drawing Effect ---

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas || !capturedImage) return;

    const img = new Image();
    img.src = capturedImage;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      if (step === CaptureStep.Calibrating) {
        context.save();
        context.translate(calibLine.x, calibLine.y);
        context.rotate(calibLine.angle * Math.PI / 180);
        context.beginPath();
        context.moveTo(-calibLine.len / 2, 0);
        context.lineTo(calibLine.len / 2, 0);
        context.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        context.lineWidth = 5;
        context.stroke();
        context.restore();
      }

      if (step === CaptureStep.Measuring) {
        measurePoints.forEach(p => {
          context.beginPath();
          context.arc(p.x, p.y, 10, 0, 2 * Math.PI);
          context.fillStyle = 'rgba(0, 0, 255, 0.7)';
          context.fill();
        });
      }
    };
  }, [capturedImage, step, calibLine, measurePoints]);

  useEffect(() => { startCamera(); return () => stopCamera(); }, [stopCamera]);

  // --- Component Render ---

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Video View or Image Preview */}
      <Box sx={{ position: 'relative', width: '100%', maxWidth: '500px', margin: 'auto', background: '#eee' }}>
        {!capturedImage ? (
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
        ) : (
          <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ width: '100%', cursor: step === CaptureStep.Measuring ? 'crosshair' : 'default' }} />
        )}
      </Box>

      {/* Controls based on step */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {step === CaptureStep.Idle && <Button onClick={capturePhoto} disabled={!stream} variant="contained">Capture Photo</Button>}
        {capturedImage && <Button onClick={resetCapture} variant="contained" color="secondary">Reset</Button>}
      </Box>

      {step === CaptureStep.Calibrating && (
        <Paper sx={{p: 2}} elevation={3}>
          <Typography gutterBottom><b>Step 1:</b> Calibrate Reference Object</Typography>
          <Typography variant="body2" gutterBottom>Adjust the sliders to match the red line to your reference object in the image.</Typography>
          <Slider value={calibLine.len} onChange={(_, v) => setCalibLine(c => ({...c, len: v as number}))} min={1} max={canvasRef.current?.width || 500} aria-label="Length" />
          <Slider value={calibLine.x} onChange={(_, v) => setCalibLine(c => ({...c, x: v as number}))} min={0} max={canvasRef.current?.width || 500} aria-label="X Position" />
          <Slider value={calibLine.y} onChange={(_, v) => setCalibLine(c => ({...c, y: v as number}))} min={0} max={canvasRef.current?.height || 500} aria-label="Y Position" />
          <Slider value={calibLine.angle} onChange={(_, v) => setCalibLine(c => ({...c, angle: v as number}))} min={0} max={180} aria-label="Angle" />
          <Button onClick={setCalibration} variant="contained">Set Calibration & Continue</Button>
        </Paper>
      )}

      {step === CaptureStep.Measuring && (
        <Paper sx={{p: 2}} elevation={3}>
            <Typography gutterBottom><b>Step 2:</b> Measure Child's Height</Typography>
            <Typography variant="body2" gutterBottom>Click on the top of the child's head, then on the bottom of their feet.</Typography>
            <Box className="measurement-calculation" sx={{mt: 2}}>
                <TextField label="Reference Object Size (mm)" type="number" value={refObjectMm} onChange={e => setRefObjectMm(Number(e.target.value))} size="small" />
                <Typography>Calibrated Pixel Size: {refObjectPixels.toFixed(2)} px</Typography>
                {pixelHeight && <Typography>Measured distance in pixels: {pixelHeight.toFixed(2)}</Typography>}
                {calculatedHeightCm && <Typography variant="h6">Calculated Height: <strong>{calculatedHeightCm.toFixed(2)} cm</strong></Typography>}
                <Button onClick={handleSaveMeasurement} disabled={!calculatedHeightCm || !selectedChildId} variant="contained" sx={{ mt: 1 }}>
                    Save Measurement
                </Button>
            </Box>
        </Paper>
      )}
    </Box>
  );
};
