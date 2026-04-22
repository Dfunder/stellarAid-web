'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { BasicInfoForm } from '@/features/projects/components/BasicInfoForm';
import { SubmissionSuccessModal } from '@/components/projects/SubmissionSuccessModal';
import { useDraftManager } from '@/hooks/useDraftManager';
import {
  CheckCircle2,
  ArrowLeft,
  Layout,
  ListTodo,
  Wallet,
  Eye,
  X,
  Save,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 'basics', title: 'Basics', icon: Layout },
  { id: 'details', title: 'Details', icon: ListTodo },
  { id: 'funding', title: 'Funding', icon: Wallet },
  { id: 'review', title: 'Review', icon: Eye },
];

function formatLastSaved(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Saved just now';
  const minutes = Math.floor(diff / 60);
  return `Saved ${minutes}m ago`;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draft') ?? undefined;

  const { saveDraft, getDraft, deleteDraft, lastSaved, saveStatus, scheduleAutoSave, stopAutoSave } =
    useDraftManager(draftIdParam);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedProjectId, setSubmittedProjectId] = useState<string | undefined>();

  // Load draft on mount
  useEffect(() => {
    if (draftIdParam) {
      const draft = getDraft(draftIdParam);
      if (draft) {
        setFormData(draft.formData);
        setCurrentStep(draft.currentStep);
      }
    }
  }, [draftIdParam, getDraft]);

  // Trigger auto-save whenever form data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      scheduleAutoSave(formData, currentStep);
    }
  }, [formData, currentStep, scheduleAutoSave]);

  // Stop auto-save timer on unmount
  useEffect(() => () => stopAutoSave(), [stopAutoSave]);

  function handleManualSave() {
    saveDraft(formData, currentStep);
  }

  const handleNext = (stepData: Record<string, unknown>) => {
    const newData = { ...formData, ...stepData };
    setFormData(newData);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleExit = () => {
    const hasData = Object.keys(formData).length > 0;
    if (hasData && saveStatus !== 'saved') {
      if (window.confirm('You have unsaved changes. Save draft before exiting?')) {
        saveDraft(formData, currentStep);
      }
    }
    router.push('/dashboard');
  };

  const handleSubmit = async () => {
    // In a real app this would POST to the API.
    const mockProjectId = `proj_${Date.now()}`;
    setSubmittedProjectId(mockProjectId);

    // Clean up the draft after successful submission
    if (draftIdParam) {
      deleteDraft(draftIdParam);
    } else {
      // Delete whichever draft was auto-created
      saveDraft(formData, currentStep); // ensure it exists, then delete
    }

    setShowSuccess(true);
  };

  const handleGoToDashboard = () => {
    setShowSuccess(false);
    router.push('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoForm initialData={formData} onNext={handleNext} />;
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Project Details</h2>
            <p className="text-gray-500">More details about your project go here.</p>
            <div className="flex justify-between pt-6">
              <Button onClick={handleBack} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                onClick={() => handleNext({ details: 'Mock details' })}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue to Funding
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Funding Goal</h2>
            <p className="text-gray-500">Define your funding target and duration.</p>
            <div className="flex justify-between pt-6">
              <Button onClick={handleBack} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                onClick={() => handleNext({ funding: 'Mock funding' })}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Review Project
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center mb-4">Review Your Project</h2>
            <Card className="p-6 bg-gray-50 border-dashed border-2">
              <div className="space-y-4">
                <p><strong>Title:</strong> {formData.title as string}</p>
                <p><strong>Category:</strong> {formData.category as string}</p>
                <p><strong>Description:</strong> {formData.description as string}</p>
                <p><strong>Location:</strong> {formData.location as string}</p>
              </div>
            </Card>
            <div className="flex justify-between pt-6">
              <Button onClick={handleBack} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit Campaign
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
            <p className="text-gray-500 mt-1">
              Get started with your social impact project on StellarAid.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Save Draft button + status */}
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatLastSaved(lastSaved)}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualSave}
                isLoading={saveStatus === 'saving'}
                className="flex items-center gap-1.5 text-gray-600"
                title="Save Draft"
              >
                <Save className="w-3.5 h-3.5" />
                Save Draft
              </Button>
            </div>
            <button
              onClick={handleExit}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              title="Exit Wizard"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between z-10">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isActive
                        ? 'bg-white border-2 border-blue-600 text-blue-600 ring-4 ring-blue-50'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 shadow-sm border border-gray-100">{renderStep()}</Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between items-center text-sm text-gray-400 font-light">
          <span>Step {currentStep + 1} of {STEPS.length} • All progress is auto-saved every 30s.</span>
          <button
            onClick={() => router.push('/dashboard/projects/drafts')}
            className="text-blue-500 hover:underline text-xs"
          >
            View all drafts
          </button>
        </div>
      </div>

      <SubmissionSuccessModal
        isOpen={showSuccess}
        projectId={submittedProjectId}
        projectTitle={formData.title as string | undefined}
        onViewProject={() => router.push(`/projects/${submittedProjectId}`)}
        onGoToDashboard={handleGoToDashboard}
      />
    </>
  );
}
