import React from 'react';
import { Card } from '@/components/ui/Card';

export interface PressMention {
  id: string;
  source: string;
  quote: string;
  date: string;
}

interface PressMentionsProps {
  mentions: PressMention[];
}

export const PressMentions: React.FC<PressMentionsProps> = ({ mentions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {mentions.map((mention) => (
        <Card key={mention.id} variant="outlined" className="p-6 hover:shadow-md transition-shadow bg-white">
          <div className="flex flex-col h-full">
            <p className="text-gray-700 italic flex-grow mb-6 text-lg">
              "{mention.quote}"
            </p>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
              <span className="font-bold text-gray-900">{mention.source}</span>
              <span className="text-sm text-gray-500">{mention.date}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
