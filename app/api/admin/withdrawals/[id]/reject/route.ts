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
    stellarAddress: 'GD5XQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
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
    stellarAddress: 'GD6YQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
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
    stellarAddress: 'GD7YQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
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
    stellarAddress: 'GD8YQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
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
    stellarAddress: 'GD9YQZJZ5KQ4N5L5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
  },
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { reason } = body;
    
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }
    
    const withdrawalIndex = mockWithdrawals.findIndex(w => w.id === params.id);
    
    if (withdrawalIndex === -1) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }
    
    const withdrawal = mockWithdrawals[withdrawalIndex];
    
    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending withdrawals can be rejected' },
        { status: 400 }
      );
    }
    
    // Update withdrawal status to rejected
    mockWithdrawals[withdrawalIndex] = {
      ...withdrawal,
      status: 'REJECTED',
      processedDate: new Date().toISOString(),
      rejectionReason: reason.trim(),
    };
    
    // In a real app, you would:
    // 1. Send notification to creator with rejection reason
    // 2. Log the rejection action
    // 3. Update database transaction
    // 4. Potentially release any held funds
    
    return NextResponse.json({
      message: 'Withdrawal rejected successfully',
      withdrawal: mockWithdrawals[withdrawalIndex]
    });
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to reject withdrawal' },
      { status: 500 }
    );
  }
}
