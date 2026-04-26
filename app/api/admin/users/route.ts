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

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would:
    // 1. Verify admin authentication
    // 2. Fetch users from database
    // 3. Apply any query parameters for filtering/pagination
    
    return NextResponse.json(mockUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real app, you would:
    // 1. Validate the request body
    // 2. Create new user in database
    // 3. Return the created user
    
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      ...body,
      createdAt: new Date().toISOString(),
      isSuspended: false,
    };
    
    mockUsers.push(newUser);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
