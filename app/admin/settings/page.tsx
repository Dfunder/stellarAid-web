'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, ShieldCheck, History, Info } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import { SettingsForm, PlatformSettings } from '@/components/admin/settings/SettingsForm';
import { ConfirmationModal } from '@/components/admin/settings/ConfirmationModal';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [pendingSettings, setPendingSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app: const res = await apiClient.get('/admin/settings');
      // Mocking the response for now:
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData: PlatformSettings = {
        minGoal: 500,
        platformFee: 2.5,
        maxDuration: 60,
        lastModified: new Date().toLocaleString(),
        modifiedBy: 'Admin User',
      };
      
      setSettings(mockData);
    } catch (error) {
      toast.error('Failed to load platform settings', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFormSubmit = (data: PlatformSettings) => {
    setPendingSettings(data);
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingSettings) return;
    
    setIsSaving(true);
    try {
      // In a real app: await apiClient.put('/admin/settings', pendingSettings);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setSettings({
        ...pendingSettings,
        lastModified: new Date().toLocaleString(),
        modifiedBy: 'Current Admin',
      });
      
      toast.success('Platform settings updated successfully', 'Success');
      setShowConfirm(false);
      setPendingSettings(null);
    } catch (error) {
      toast.error('Failed to update settings', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="text-blue-600 w-8 h-8" />
          Platform Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage global parameters and financial configurations.</p>
      </motion.div>

      <div className="space-y-8">
        {/* Security Warning */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-900">Privileged Access</h4>
            <p className="text-xs text-blue-700 mt-1">
              You are currently editing global system settings. These changes affect core platform logic including donation processing and project eligibility.
            </p>
          </div>
        </div>

        {/* Settings Form Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            {settings && (
              <SettingsForm
                initialData={settings}
                onSubmit={handleFormSubmit}
                isLoading={isSaving}
              />
            )}
          </div>
        </div>

        {/* Helper Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm flex gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-gray-900 text-sm">Audit Logs</h5>
              <p className="text-xs text-gray-500 mt-1">Detailed history of all setting changes is available in the security audit module.</p>
            </div>
          </div>
          <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm flex gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-gray-900 text-sm">Fee Distribution</h5>
              <p className="text-xs text-gray-500 mt-1">Platform fees are automatically deducted on-chain during the project funding settlement.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {settings && pendingSettings && (
        <ConfirmationModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmSave}
          currentSettings={settings}
          newSettings={pendingSettings}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
