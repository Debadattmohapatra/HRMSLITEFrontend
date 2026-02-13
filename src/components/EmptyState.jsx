import { Inbox } from 'lucide-react';

const EmptyState = ({ message = 'No data found', action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-600 mb-4">{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;