import { CheckCircle, X } from 'lucide-react';

const SuccessMessage = ({ message, onClose }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        <div className="ml-3 flex-1">
          <p className="text-sm text-green-800">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;