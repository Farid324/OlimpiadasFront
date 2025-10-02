// src/components/ui/ErrorMessage.tsx
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-2 border border-red-200 bg-red-50 text-red-700 rounded-md p-3 mb-3">
      <AlertCircle className="w-4 h-4 mt-0.5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}