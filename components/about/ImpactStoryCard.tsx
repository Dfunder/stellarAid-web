import React from 'react';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import { Quote } from 'lucide-react';

export interface ImpactStoryCardProps {
  quote: string;
  author: string;
  location: string;
  imageUrl: string;
  projectUrl?: string;
}

export const ImpactStoryCard: React.FC<ImpactStoryCardProps> = ({
  quote,
  author,
  location,
  imageUrl,
}) => {
  return (
    <Card variant="elevated" className="overflow-hidden flex flex-col md:flex-row h-full">
      <div className="relative w-full md:w-2/5 aspect-video md:aspect-auto">
        <Image
          src={imageUrl}
          alt={`Impact story from ${author}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 40vw"
        />
      </div>
      <div className="p-8 flex flex-col justify-center flex-1 bg-blue-50/50">
        <Quote className="w-10 h-10 text-blue-200 mb-4" />
        <blockquote className="text-lg md:text-xl font-medium text-gray-800 mb-6 italic">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div className="mt-auto">
          <p className="font-bold text-gray-900">{author}</p>
          <p className="text-sm text-gray-500">{location}</p>
        </div>
      </div>
    </Card>
  );
};
