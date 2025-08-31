import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/database/database';
import { List, ListItem, ListItemText, Typography, Paper, Divider } from '@mui/material';

export const ChildList: React.FC = () => {
  const children = useLiveQuery(() => db.children.toArray());

  return (
    <Paper elevation={3} sx={{ p: 2, my: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
            Registered Children
        </Typography>
        <List>
            {children && children.length > 0 ? (
                children.map(child => (
                    <React.Fragment key={child.id}>
                        <ListItem>
                            <ListItemText
                                primary={child.name}
                                secondary={
                                    `DOB: ${new Date(child.dateOfBirth).toLocaleDateString()} | Sex: ${child.sex} | UUID: ${child.id}`
                                }
                            />
                        </ListItem>
                        <Divider component="li" />
                    </React.Fragment>
                ))
            ) : (
                <ListItem>
                    <ListItemText primary="No children registered yet." />
                </ListItem>
            )}
        </List>
    </Paper>
  );
};
