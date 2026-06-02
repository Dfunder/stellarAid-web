import { NextRequest, NextResponse } from 'next/server';

// In-memory store for drafts (in production, use a database)
// Format: { userId: [{ id, title, formData, currentStep, createdAt, updatedAt }] }
const draftsStore = new Map<string, any[]>();

const MAX_DRAFTS_PER_USER = 5;

// Helper to extract user ID from token
function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;

    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return null;

    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);

    return payload.sub || payload.userId || null;
  } catch {
    return null;
  }
}

// GET /api/drafts - List all drafts for the current user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userDrafts = draftsStore.get(userId) || [];
    return NextResponse.json(userDrafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/drafts - Create or update a draft
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, title, formData, currentStep } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    const userDrafts = draftsStore.get(userId) || [];
    const now = new Date().toISOString();

    // Find existing draft
    const existingIndex = userDrafts.findIndex((d: any) => d.id === id);

    if (existingIndex >= 0) {
      // Update existing draft
      userDrafts[existingIndex] = {
        ...userDrafts[existingIndex],
        title,
        formData,
        currentStep,
        updatedAt: now,
      };
    } else {
      // Create new draft - check if user hasn't exceeded limit
      if (userDrafts.length >= MAX_DRAFTS_PER_USER) {
        // Delete the oldest draft
        userDrafts.sort((a: any, b: any) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        userDrafts.shift();
      }

      userDrafts.push({
        id,
        title,
        formData,
        currentStep,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Sort by updatedAt descending (newest first)
    userDrafts.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    draftsStore.set(userId, userDrafts);

    return NextResponse.json({
      id,
      title,
      formData,
      currentStep,
      createdAt: existingIndex >= 0 ? userDrafts[existingIndex]?.createdAt : now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
