'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { X } from 'lucide-react';

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  title: string;
  message: string;
}

export function PasswordDialog({ isOpen, onClose, onSubmit, title, message }: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Password diperlukan');
      return;
    }

    onSubmit(password);
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{message}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Password Admin
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              placeholder="Masukkan password admin"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
            >
              Batal
            </Button>
            <Button type="submit">
              Konfirmasi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
