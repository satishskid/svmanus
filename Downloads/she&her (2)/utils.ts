import { ProviderSlot } from './types';

export const generateInitialProviderSlots = (): ProviderSlot[] => {
  const slots: ProviderSlot[] = [];
  const today = new Date();
  today.setHours(9, 0, 0, 0); // Start at 9:00 AM today

  for (let day = 0; day < 7; day++) { // Generate slots for the next 7 days
    for (let hour = 9; hour < 17; hour++) { // From 9 AM to 5 PM
        if(Math.random() > 0.3) { // Create some random gaps in the schedule
            const slotTime = new Date(today.getTime());
            slotTime.setDate(today.getDate() + day);
            slotTime.setHours(hour);
            
            slots.push({
                id: `slot_${slotTime.getTime()}`,
                startTime: slotTime,
                isBooked: false,
            });

            const halfHourSlotTime = new Date(slotTime.getTime());
            halfHourSlotTime.setMinutes(30);
            slots.push({
                id: `slot_${halfHourSlotTime.getTime()}`,
                startTime: halfHourSlotTime,
                isBooked: false,
            });
        }
    }
  }

  return slots;
};