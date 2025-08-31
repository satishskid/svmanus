import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/database/database';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface ChildSelectorProps {
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({ selectedChildId, setSelectedChildId }) => {
  const children = useLiveQuery(() => db.children.toArray());

  const handleChange = (event: SelectChangeEvent<string | null>) => {
    setSelectedChildId(event.target.value as string | null);
  };

  return (
    <FormControl fullWidth sx={{ my: 2 }}>
      <InputLabel id="child-selector-label">Select a Child to View Chart</InputLabel>
      <Select
        labelId="child-selector-label"
        value={selectedChildId || ''}
        onChange={handleChange}
        label="Select a Child to View Chart"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {children?.map(child => (
          <MenuItem key={child.id} value={child.id}>
            {child.name} (ID: {child.id.substring(0, 8)})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
