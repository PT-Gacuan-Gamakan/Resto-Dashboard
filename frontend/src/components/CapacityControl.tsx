'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Settings } from 'lucide-react';

interface CapacityControlProps {
  currentCapacity: number;
  onUpdate: (capacity: number) => void;
}

export function CapacityControl({ currentCapacity, onUpdate }: CapacityControlProps) {
  const [capacity, setCapacity] = useState(currentCapacity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(capacity);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className='h-full flex flex-col justify-center'>
      <CardHeader>
        <CardTitle className="flex items-center gap-6">
          <Settings className="h-5 w-5" />
          Kontrol Kapasitas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Kapasitas Maksimal
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              min="1"
            />
          </div>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || capacity === currentCapacity || capacity < 1}
            className="w-full"
          >
            {isUpdating ? 'Mengupdate...' : 'Update Kapasitas'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
