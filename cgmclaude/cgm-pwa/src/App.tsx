import { useState } from 'react';
import { ChildRegistration } from './components/forms/ChildRegistration';
import { ManualMeasurementEntry } from './components/forms/ManualMeasurementEntry';
import { GrowthChart } from './components/charts/GrowthChart';
import { PhotoCapture } from './components/camera/PhotoCapture';
import { ChildSelector } from './components/common/ChildSelector';
import { ChildList } from './components/common/ChildList';
import { MeasurementList } from './components/common/MeasurementList';
import { exportDataToCsv } from './utils/dataManagement/ExportManager';
import { CssBaseline, Container, Typography, Box, Button, Paper } from '@mui/material';

function App() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Child Growth Monitoring PWA
            </Typography>
            <Button variant="contained" onClick={exportDataToCsv}>Export All Data to CSV</Button>
          </Box>

          <Paper elevation={3} sx={{ p: 2, my: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>Data Entry</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <ChildRegistration />
              <ManualMeasurementEntry />
            </Box>
          </Paper>

          <ChildList />

          <Paper elevation={3} sx={{ p: 2, my: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>Child Details</Typography>
            <ChildSelector selectedChildId={selectedChildId} setSelectedChildId={setSelectedChildId} />
            <GrowthChart childId={selectedChildId} />
            <MeasurementList childId={selectedChildId} />
          </Paper>

          <Paper elevation={3} sx={{ p: 2, my: 2 }}>
             <Typography variant="h5" component="h2" gutterBottom>Photogrammetry Module</Typography>
            <PhotoCapture selectedChildId={selectedChildId} />
          </Paper>
        </Box>
      </Container>
    </>
  )
}

export default App
