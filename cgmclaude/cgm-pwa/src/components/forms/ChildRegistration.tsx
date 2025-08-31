import React, { useState } from 'react';
import { db } from '../../core/database/database';
import type { ChildRecord } from '../../core/database/models/Child';
import { TextField, Button, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Select, MenuItem, InputLabel, Box, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

export const ChildRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    sex: 'F' as 'M' | 'F',
    guardianName: '',
    guardianRelationship: 'mother',
    guardianPhone: '',
    guardianEducation: '',
    secondaryGuardianName: '',
    secondaryGuardianRelationship: '',
    secondaryGuardianPhone: '',
    village: '',
    block: '',
    district: '',
    state: '',
    pincode: '',
    gpsLat: '',
    gpsLng: '',
    birthWeight: '',
    gestationalAge: '',
    deliveryType: '',
    complications: '',
    vaccinationStatus: '',
    chronicConditions: '',
    previousMalnutrition: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name === 'sex') {
      setFormData(prev => ({ ...prev, sex: value as 'M' | 'F' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newChild: Omit<ChildRecord, 'localId'> = {
        id: crypto.randomUUID(),
        name: formData.name,
        dateOfBirth: new Date(formData.dob),
        sex: formData.sex,
        guardianInfo: {
          primaryGuardian: {
            name: formData.guardianName,
            relationship: formData.guardianRelationship as 'mother' | 'father' | 'grandparent' | 'other',
            phone: formData.guardianPhone,
            education: formData.guardianEducation
          },
          secondaryGuardian: formData.secondaryGuardianName ? {
            name: formData.secondaryGuardianName,
            relationship: formData.secondaryGuardianRelationship,
            phone: formData.secondaryGuardianPhone
          } : undefined
        },
        address: {
          village: formData.village,
          block: formData.block,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          gpsCoordinates: formData.gpsLat && formData.gpsLng ? { lat: parseFloat(formData.gpsLat), lng: parseFloat(formData.gpsLng) } : undefined
        },
        medicalHistory: {
          birthWeight: formData.birthWeight ? parseFloat(formData.birthWeight) : undefined,
          gestationalAge: formData.gestationalAge ? parseInt(formData.gestationalAge) : undefined,
          deliveryType: formData.deliveryType as 'normal' | 'cesarean',
          complications: formData.complications ? formData.complications.split(',').map(s => s.trim()) : [],
          vaccinationStatus: formData.vaccinationStatus ? JSON.parse(formData.vaccinationStatus) : [],
          chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map(s => s.trim()) : [],
          previousMalnutrition: !!formData.previousMalnutrition
        },
        metadata: {
          registeredBy: 'worker-id-placeholder',
          registrationDate: new Date(),
          lastUpdated: new Date(),
          dataSource: 'manual',
          qualityScore: 100
        },
        measurements: [],
        analytics: {
          totalVisits: 0,
          growthTrend: 'stable',
          riskScore: 0,
          interventionsNeeded: []
        }
      };

      await db.children.add(newChild as ChildRecord);
      alert(`Child "${formData.name}" successfully registered!`);
      setFormData({ name: '', dob: '', sex: 'F', guardianName: '', guardianRelationship: 'mother', guardianPhone: '', guardianEducation: '', secondaryGuardianName: '', secondaryGuardianRelationship: '', secondaryGuardianPhone: '', village: '', block: '', district: '', state: '', pincode: '', gpsLat: '', gpsLng: '', birthWeight: '', gestationalAge: '', deliveryType: '', complications: '', vaccinationStatus: '', chronicConditions: '', previousMalnutrition: false });
    } catch (error) {
      console.error("Failed to register child:", error);
      alert("Error registering child.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, border: '1px solid grey', borderRadius: '4px' }}>
      <Typography variant="h5" component="h2">Child Registration</Typography>
      <fieldset style={{border: 'none', padding: 0, margin: 0}}>
        <legend><Typography variant="h6">Basic Information</Typography></legend>
        <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} required fullWidth />
        <TextField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Sex</FormLabel>
          <RadioGroup row name="sex" value={formData.sex} onChange={handleChange}>
            <FormControlLabel value="F" control={<Radio />} label="Female" />
            <FormControlLabel value="M" control={<Radio />} label="Male" />
          </RadioGroup>
        </FormControl>
      </fieldset>
      <fieldset style={{border: 'none', padding: 0, margin: 0}}>
        <legend><Typography variant="h6">Guardian Information</Typography></legend>
        <TextField label="Primary Guardian's Name" name="guardianName" value={formData.guardianName} onChange={handleChange} fullWidth />
        <FormControl fullWidth>
          <InputLabel id="guardian-relationship-label">Relationship</InputLabel>
          <Select labelId="guardian-relationship-label" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} label="Relationship">
            <MenuItem value="mother">Mother</MenuItem>
            <MenuItem value="father">Father</MenuItem>
            <MenuItem value="grandparent">Grandparent</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Guardian's Phone" name="guardianPhone" type="tel" value={formData.guardianPhone} onChange={handleChange} fullWidth />
        <TextField label="Guardian's Education" name="guardianEducation" value={formData.guardianEducation} onChange={handleChange} fullWidth />
        <TextField label="Secondary Guardian's Name" name="secondaryGuardianName" value={formData.secondaryGuardianName} onChange={handleChange} fullWidth />
        <TextField label="Secondary Guardian's Relationship" name="secondaryGuardianRelationship" value={formData.secondaryGuardianRelationship} onChange={handleChange} fullWidth />
        <TextField label="Secondary Guardian's Phone" name="secondaryGuardianPhone" value={formData.secondaryGuardianPhone} onChange={handleChange} fullWidth />
      </fieldset>
      <fieldset style={{border: 'none', padding: 0, margin: 0}}>
        <legend><Typography variant="h6">Location Data</Typography></legend>
        <TextField label="Village" name="village" value={formData.village} onChange={handleChange} fullWidth />
        <TextField label="Block" name="block" value={formData.block} onChange={handleChange} fullWidth />
        <TextField label="District" name="district" value={formData.district} onChange={handleChange} fullWidth />
        <TextField label="State" name="state" value={formData.state} onChange={handleChange} fullWidth />
        <TextField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} fullWidth />
        <TextField label="GPS Latitude" name="gpsLat" value={formData.gpsLat} onChange={handleChange} fullWidth />
        <TextField label="GPS Longitude" name="gpsLng" value={formData.gpsLng} onChange={handleChange} fullWidth />
      </fieldset>
      <fieldset style={{border: 'none', padding: 0, margin: 0}}>
        <legend><Typography variant="h6">Medical History</Typography></legend>
        <TextField label="Birth Weight (kg)" name="birthWeight" type="number" value={formData.birthWeight} onChange={handleChange} fullWidth inputProps={{ step: "0.1" }} />
        <TextField label="Gestational Age (weeks)" name="gestationalAge" type="number" value={formData.gestationalAge} onChange={handleChange} fullWidth />
        <FormControl fullWidth>
          <InputLabel id="delivery-type-label">Delivery Type</InputLabel>
          <Select labelId="delivery-type-label" name="deliveryType" value={formData.deliveryType} onChange={handleChange} label="Delivery Type">
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="cesarean">Cesarean</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Complications (comma separated)" name="complications" value={formData.complications} onChange={handleChange} fullWidth />
        <TextField label="Vaccination Status (JSON array)" name="vaccinationStatus" value={formData.vaccinationStatus} onChange={handleChange} fullWidth />
        <TextField label="Chronic Conditions (comma separated)" name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} fullWidth />
        <FormControlLabel control={<Radio checked={!!formData.previousMalnutrition} onChange={e => setFormData(prev => ({ ...prev, previousMalnutrition: e.target.checked }))} />} label="Previous Malnutrition" />
      </fieldset>
      <Box>
        <Button type="submit" variant="contained" color="primary">Register Child</Button>
      </Box>
    </Box>
  );
};
