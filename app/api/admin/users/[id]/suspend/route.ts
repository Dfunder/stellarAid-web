import { NextRequest, NextResponse } from 'next/server';

// Mock data - in a real app, this would come from a database
let mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
    kycStatus: 'APPROVED',
    createdAt: '2024-01-15T10:30:00Z',
    isSuspended: false,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'CREATOR',
    kycStatus: 'PENDING',
    createdAt: '2024-01-20T14:22:00Z',
    isSuspended: false,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'USER',
    kycStatus: 'REJECTED',
    createdAt: '2024-02-01T09:15:00Z',
    isSuspended: false,
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'ADMIN',
    kycStatus: 'APPROVED',
    createdAt: '2024-02-10T16:45:00Z',
    isSuspended: false,
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'CREATOR',
    kycStatus: 'APPROVED',
    createdAt: '2024-02-15T11:30:00Z',
    isSuspended: true,
  },
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userIndex = mockUsers.findIndex(u => u.id === params.id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Toggle suspension status
    mockUsers[userIndex].isSuspended = !mockUsers[userIndex].isSuspended;
    
    return NextResponse.json({
      message: `User ${mockUsers[userIndex].isSuspended ? 'suspended' : 'unsuspended'} successfully`,
      user: mockUsers[userIndex]
    });
  } catch (error) {
    console.error('Error updating user suspension status:', error);
    return NextResponse.json(
      { error: 'Failed to update user suspension status' },
      { status: 500 }
    );
  }
}
