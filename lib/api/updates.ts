import { apiClient } from '@/lib/api/client';
import type { ApiResponse, Update, CreateUpdateRequest } from '@/types/api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mockUpdates: Update[] = [
  {
    id: 'u1',
    campaignId: '1',
    title: 'Reached 50% of the goal',
    content: 'Thank you to everyone who has supported this campaign so far. We are now halfway to our goal and the team is ready to start the next phase of delivery.',
    imageUrls: [
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80'
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'u2',
    campaignId: '1',
    title: 'New volunteer training completed',
    content: 'Volunteers have completed the first round of training and are ready to begin distribution. We appreciate all the kind messages from our supporters.',
    imageUrls: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const updatesApi = {
  async getUpdates(campaignId: string): Promise<ApiResponse<Update[]>> {
    await delay(400);
    const updates = mockUpdates
      .filter((item) => item.campaignId === campaignId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      data: updates,
      status: 200
    };
  },

  async postUpdate(campaignId: string, body: CreateUpdateRequest): Promise<ApiResponse<Update>> {
    await delay(400);

    const newUpdate: Update = {
      id: `u_${Date.now()}`,
      campaignId,
      title: body.title,
      content: body.content,
      imageUrls: body.imageUrls || [],
      createdAt: new Date().toISOString()
    };

    mockUpdates = [newUpdate, ...mockUpdates];

    return {
      data: newUpdate,
      status: 201
    };
  },

  async updateUpdate(campaignId: string, updateId: string, body: CreateUpdateRequest): Promise<ApiResponse<Update>> {
    await delay(400);

    mockUpdates = mockUpdates.map((item) =>
      item.id === updateId && item.campaignId === campaignId
        ? { ...item, title: body.title, content: body.content, imageUrls: body.imageUrls || item.imageUrls }
        : item
    );

    const updated = mockUpdates.find((item) => item.id === updateId && item.campaignId === campaignId);

    return {
      data: updated || ({} as Update),
      status: 200
    };
  },

  async deleteUpdate(campaignId: string, updateId: string): Promise<ApiResponse<{ success: boolean }>> {
    await delay(300);
    mockUpdates = mockUpdates.filter((item) => !(item.id === updateId && item.campaignId === campaignId));

    return {
      data: { success: true },
      status: 200
    };
  }
};
