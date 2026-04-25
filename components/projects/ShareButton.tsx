'use client';

import { useState } from 'react';

import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Mail, Copy, Check } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import { Modal } from '@/components/ui/Modal';

interface ShareButtonProps {
  projectId: string;
  projectTitle: string;
  projectUrl: string;
}

export function ShareButton({ projectId, projectTitle, projectUrl }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = projectUrl;
  const shareText = `Check out this project: ${projectTitle}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(projectTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
    },
  ];

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Share Project">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Share this project with others</p>
          <div className="flex flex-wrap gap-2">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"

              value={shareUrl}

              readOnly

              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"

            />

            <Button onClick={handleCopy} variant="outline" size="sm">

              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}

              {copied ? 'Copied' : 'Copy'}

            </Button>

          </div>

        </div>

      </Modal>

    </>

  );

}