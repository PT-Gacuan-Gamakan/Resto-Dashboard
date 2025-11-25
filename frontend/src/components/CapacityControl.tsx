'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Settings } from 'lucide-react';
import { PasswordDialog } from './PasswordDialog';

interface CapacityControlProps {
  currentCapacity: number;
  onUpdate: (capacity: number, password: string) => Promise<{ success: boolean; error?: string }>;
}

export function CapacityControl({ currentCapacity, onUpdate }: CapacityControlProps) {
  const [capacity, setCapacity] = useState(currentCapacity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [error, setError] = useState('');

  // FIX FOR BUG 3: Update local state when prop changes (from Socket.IO broadcast)
  useEffect(() => {
    setCapacity(currentCapacity);
  }, [currentCapacity]);

  const handleUpdateClick = () => {
    setError('');
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = async (password: string) => {
    setShowPasswordDialog(false);
    setIsUpdating(true);
    setError('');

    try {
      const result = await onUpdate(capacity, password);

      if (!result.success) {
        setError(result.error || 'Gagal mengupdate kapasitas');
        // Reset capacity to current on failure
        setCapacity(currentCapacity);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghubungi server');
      setCapacity(currentCapacity);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
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
                disabled={isUpdating}
              />
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>
            <Button
              onClick={handleUpdateClick}
              disabled={isUpdating || capacity === currentCapacity || capacity < 1}
              className="w-full"
            >
              {isUpdating ? 'Mengupdate...' : 'Update Kapasitas'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Memerlukan password admin untuk mengubah kapasitas
            </p>
          </div>
        </CardContent>
      </Card>

      <PasswordDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onSubmit={handlePasswordSubmit}
        title="Konfirmasi Update Kapasitas"
        message={`Anda akan mengubah kapasitas dari ${currentCapacity} menjadi ${capacity}. Masukkan password admin untuk melanjutkan.`}
      />
    </>
  );
}
