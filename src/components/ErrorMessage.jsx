import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;