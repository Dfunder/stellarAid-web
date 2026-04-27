import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import { ChangeSummary } from './ChangeSummary';
import { PlatformSettings } from './SettingsForm';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentSettings: PlatformSettings;
  newSettings: PlatformSettings;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentSettings,
  newSettings,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="w-5 h-5" />
          <span>Confirm Settings Change</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <p className="text-gray-600 mb-6">
          You are about to update the global platform settings. Please review the changes below before proceeding.
        </p>
        
        <ChangeSummary current={currentSettings} updated={newSettings} />
        
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> These changes will take effect immediately and will be visible to all users and project creators.
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="default" onClick={onConfirm} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700 border-amber-600">
          {isLoading ? 'Updating...' : 'Confirm & Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
