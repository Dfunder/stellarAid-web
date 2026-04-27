import React from 'react';
import { PlatformSettings } from './SettingsForm';
import { ArrowRight } from 'lucide-react';

interface ChangeSummaryProps {
  current: PlatformSettings;
  updated: PlatformSettings;
}

export const ChangeSummary: React.FC<ChangeSummaryProps> = ({ current, updated }) => {
  const changes = [
    { label: 'Minimum Goal', old: `$${current.minGoal}`, new: `$${updated.minGoal}`, changed: current.minGoal !== updated.minGoal },
    { label: 'Platform Fee', old: `${current.platformFee}%`, new: `${updated.platformFee}%`, changed: current.platformFee !== updated.platformFee },
    { label: 'Max Duration', old: `${current.maxDuration} days`, new: `${updated.maxDuration} days`, changed: current.maxDuration !== updated.maxDuration },
  ].filter(c => c.changed);

  if (changes.length === 0) return null;

  return (
    <div className="space-y-4">
      {changes.map((change) => (
        <div key={change.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-sm font-medium text-gray-500">{change.label}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 line-through">{change.old}</span>
            <ArrowRight className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-blue-600">{change.new}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
