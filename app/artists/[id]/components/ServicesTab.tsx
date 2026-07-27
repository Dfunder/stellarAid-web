'use client';

import { Image } from 'lucide-react';

interface ServicesTabProps {
  artistId: string;
}

export default function ServicesTab({ artistId: _artistId }: ServicesTabProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Image className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
        Services Coming Soon
      </h3>
      <p className="text-neutral-400 dark:text-neutral-500 text-sm max-w-sm mx-auto">
        Commission services will be available here. Stay tuned!
      </p>
    </div>
  );
}
