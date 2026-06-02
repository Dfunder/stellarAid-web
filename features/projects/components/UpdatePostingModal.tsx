'use client';

import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button } from '@/components/ui';
import { ImageUpload, type UploadedImage } from '@/components/ImageUpload';
import type { Update } from '@/types/api';
import { updatesApi } from '@/lib/api/updates';
import { useRouter } from 'next/navigation';
import { Eye, FileText, Upload as UploadIcon, X } from 'lucide-react';

function renderMarkdown(text: string) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">$1</a>');
  html = html.replace(/\n/g, '<br />');
  return { __html: html };
}

interface UpdatePostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onUpdatePosted?: (update: Update) => void;
}

export function UpdatePostingModal({
  isOpen,
  onClose,
  campaignId,
  onUpdatePosted,
}: UpdatePostingModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (uploadedImages: UploadedImage[]) => {
    setImages(uploadedImages);
  };

  const handleImageRemove = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const imageUrls = images.map(img => img.preview);
      const response = await updatesApi.postUpdate(campaignId, {
        title: title.trim(),
        content: content.trim(),
        imageUrls,
      });

      if (response.data) {
        onUpdatePosted?.(response.data);
        handleClose();
        router.refresh();
      }
    } catch (err) {
      setError('Failed to publish update. Please try again.');
      console.error('Failed to post update:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setImages([]);
    setError('');
    setShowPreview(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      variant="centered"
      size="lg"
      showCloseButton={false}
      aria-labelledby="update-posting-title"
      className="max-h-[90vh] overflow-y-auto"
    >
      <ModalHeader onClose={handleClose} showCloseButton>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 id="update-posting-title" className="text-lg font-semibold text-gray-900">
              Post Campaign Update
            </h2>
            <p className="text-sm text-gray-500">Share progress with your supporters</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-6">
        {/* Preview Toggle */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
          >
            {showPreview ? (
              <>
                <X className="w-4 h-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Preview
              </>
            )}
          </button>
        </div>

        {showPreview ? (
          <div className="space-y-6">
            <div className="border-b pb-4 mb-4">
              <h3 className="text-xl font-bold text-gray-900">{title || 'Update Title'}</h3>
            </div>
            <div
              className="text-sm leading-relaxed text-gray-700 prose prose-neutral max-w-none"
              dangerouslySetInnerHTML={renderMarkdown(content || 'Your update content will appear here...')}
            />
            {images.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-video overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={img.preview}
                      alt="Update attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Project milestone reached!"
                maxLength={100}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{title.length}/100</p>
            </div>

            {/* Content Field - Rich Text Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                maxLength={2000}
                placeholder="Share the progress, milestones, or impact of your campaign...

Tip: Use **bold** for emphasis, *italic* for highlights, and [links](url) for references."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-y"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{content.length}/2000</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <ImageUpload
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                maxFiles={4}
                multiple={true}
                showPreview={true}
                showProgress={false}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handlePublish}
          isLoading={isSubmitting}
          disabled={!title.trim() || !content.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <UploadIcon className="w-4 h-4" />
          Publish Update
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default UpdatePostingModal;