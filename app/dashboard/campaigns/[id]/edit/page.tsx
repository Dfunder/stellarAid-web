'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

// Mock data for a single campaign - in a real app, you'd fetch this.
const mockCampaign = {
  id: '123',
  title: 'Clean Water for Rural Schools',
  description: 'Providing clean and safe drinking water to over 5,000 children in rural communities. This project will fund the installation of water purification systems and the construction of new wells.',
  coverImage: '/images/water-project.jpg',
  goal: 120000,
  milestones: '3 Milestones',
  acceptedAsset: 'XLM',
};

export default function EditCampaignPage() {
  const params = useParams();
  const campaignId = params.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Simulate fetching campaign data
    setTitle(mockCampaign.title);
    setDescription(mockCampaign.description);
    setCoverImage(mockCampaign.coverImage);
  }, [campaignId]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setIsSaved(false);
    console.log('Saving changes for campaign:', campaignId, { title, description });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Hide message after 3s
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/dashboard/campaigns`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Button>
          </Link>
        </div>

        <Card>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
            <p className="text-sm text-gray-500 mt-1">Update your campaign details. Fields that are part of the smart contract are not editable.</p>
          </div>

          <div className="p-6 border-t border-gray-200 space-y-6">
            {/* Editable Fields */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">Campaign Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Solar Power for a Village"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the story of your campaign..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cover Image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <Button variant="outline">Change Image</Button>
              </div>
            </div>

            {/* Non-Editable Fields */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-800">On-Chain Details (Read-Only)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Funding Goal</label>
                  <Input value={`$${mockCampaign.goal.toLocaleString()}`} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Accepted Asset</label>
                  <Input value={mockCampaign.acceptedAsset} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Milestones</label>
                  <Input value={mockCampaign.milestones} disabled />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end items-center gap-4">
            {isSaved && <p className="text-sm text-emerald-600">Changes saved successfully!</p>}
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}