import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-red-50 text-red-800 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <span>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
}