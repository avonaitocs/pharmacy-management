import React, { useState, useEffect } from 'react';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface DisclaimerModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onClose, onConfirm }) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const handleConfirm = () => {
    if (isAcknowledged) {
      onConfirm();
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Enter' && isAcknowledged) {
        event.preventDefault(); // Prevent form submission if it's inside one
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onConfirm, isAcknowledged]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Upload Acknowledgment</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            <strong>Important:</strong> Do not upload any documents containing confidential patient information.
          </p>
          <p className="text-sm text-gray-600">
            This includes, but is not limited to, patient names, addresses, medical records, prescription details, or any other Protected Health Information (PHI). This system is not intended for storing PHI.
          </p>
          <label htmlFor="acknowledgment" className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md cursor-pointer">
            <input
              type="checkbox"
              id="acknowledgment"
              checked={isAcknowledged}
              onChange={(e) => setIsAcknowledged(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary mt-0.5 flex-shrink-0"
            />
            <span className="text-sm font-medium text-gray-800">
              I understand and confirm that the file I am uploading does not contain any confidential patient information.
            </span>
          </label>
        </div>
        <div className="flex justify-end p-4 bg-gray-50 border-t space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isAcknowledged}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Proceed to Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;