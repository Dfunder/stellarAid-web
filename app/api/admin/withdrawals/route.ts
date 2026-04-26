import { NextRequest, NextResponse } from 'next/server';

// Mock data - in a real app, this would come from a database
let mockWithdrawals = [
  {
    id: '1',
    amount: 1000,
    currency: 'USD',
    status: 'PENDING',
    creatorId: 'creator1',
    creatorName: 'Alice Creator',
    creatorEmail: 'alice@example.com',
    projectId: 'project1',
    projectName: 'Community Garden Project',
    requestDate: '2024-03-15T10:30:00Z',
    stellarAddress: 'GD5XQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
  },
  {
    id: '2',
    amount: 2500,
    currency: 'USD',
    status: 'APPROVED',
    creatorId: 'creator2',
    creatorName: 'Bob Builder',
    creatorEmail: 'bob@example.com',
    projectId: 'project2',
    projectName: 'School Renovation',
    requestDate: '2024-03-14T14:22:00Z',
    processedDate: '2024-03-15T09:15:00Z',
    stellarAddress: 'GD6YQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
  },
  {
    id: '3',
    amount: 500,
    currency: 'USD',
    status: 'REJECTED',
    creatorId: 'creator3',
    creatorName: 'Charlie Artist',
    creatorEmail: 'charlie@example.com',
    projectId: 'project3',
    projectName: 'Public Art Installation',
    requestDate: '2024-03-13T16:45:00Z',
    processedDate: '2024-03-14T11:30:00Z',
    rejectionReason: 'Insufficient project documentation',
    stellarAddress: 'GD7YQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
  },
  {
    id: '4',
    amount: 3000,
    currency: 'USD',
    status: 'COMPLETED',
    creatorId: 'creator4',
    creatorName: 'Diana Developer',
    creatorEmail: 'diana@example.com',
    projectId: 'project4',
    projectName: 'Tech Education Platform',
    requestDate: '2024-03-12T09:15:00Z',
    processedDate: '2024-03-13T14:22:00Z',
    transactionHash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    stellarAddress: 'GD8YQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
  },
  {
    id: '5',
    amount: 1500,
    currency: 'USD',
    status: 'PENDING',
    creatorId: 'creator5',
    creatorName: 'Eve Entrepreneur',
    creatorEmail: 'eve@example.com',
    projectId: 'project5',
    projectName: 'Startup Incubator',
    requestDate: '2024-03-11T11:30:00Z',
    stellarAddress: 'GD9YQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
  },
];

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would:
    // 1. Verify admin authentication
    // 2. Fetch withdrawals from database with filters
    // 3. Apply query parameters for filtering/pagination
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    
    let filteredWithdrawals = [...mockWithdrawals];
    
    if (status) {
      filteredWithdrawals = filteredWithdrawals.filter(w => w.status === status);
    }
    
    if (date) {
      const filterDate = new Date(date);
      filteredWithdrawals = filteredWithdrawals.filter(w => {
        const requestDate = new Date(w.requestDate);
        return requestDate.toDateString() === filterDate.toDateString();
      });
    }
    
    return NextResponse.json(filteredWithdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real app, you would:
    // 1. Validate the request body
    // 2. Create new withdrawal request in database
    // 3. Return the created withdrawal
    
    const newWithdrawal = {
      id: (mockWithdrawals.length + 1).toString(),
      ...body,
      status: 'PENDING',
      requestDate: new Date().toISOString(),
    };
    
    mockWithdrawals.push(newWithdrawal);
    
    return NextResponse.json(newWithdrawal, { status: 201 });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal' },
      { status: 500 }
    );
  }
}
