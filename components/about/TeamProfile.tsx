import React from 'react';
import { Card } from '@/components/ui/Card';
import { Github, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';

interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
}

export interface TeamProfileProps {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  socials?: SocialLinks;
}

export const TeamProfile: React.FC<TeamProfileProps> = ({ name, role, bio, imageUrl, socials }) => {
  return (
    <Card variant="default" className="overflow-hidden flex flex-col h-full bg-white transition-shadow hover:shadow-lg">
      <div className="relative w-full pt-[100%] bg-gray-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <p className="text-sm font-medium text-blue-600 mb-3">{role}</p>
        <p className="text-gray-600 text-sm flex-grow">{bio}</p>
        
        {socials && (
          <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                <Linkedin className="w-5 h-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            )}
            {socials.github && (
              <a href={socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
