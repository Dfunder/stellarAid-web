import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditLog } from '@/types';

// Mock audit logs data - in a real app, this would come from a database
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    adminId: 'admin-1',
    adminName: 'John Admin',
    adminEmail: 'john@stellaraid.com',
    action: 'USER_CREATED',
    targetId: 'user-123',
    targetType: 'User',
    targetName: 'Alice Johnson',
    details: { role: 'creator', email: 'alice@example.com' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    adminId: 'admin-1',
    adminName: 'John Admin',
    adminEmail: 'john@stellaraid.com',
    action: 'PROJECT_APPROVED',
    targetId: 'project-456',
    targetType: 'Project',
    targetName: 'Clean Water Initiative',
    details: { category: 'Environment', fundingGoal: 50000 },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T11:15:00Z',
    createdAt: '2024-01-15T11:15:00Z',
  },
  {
    id: '3',
    adminId: 'admin-2',
    adminName: 'Sarah Admin',
    adminEmail: 'sarah@stellaraid.com',
    action: 'WITHDRAWAL_APPROVED',
    targetId: 'withdrawal-789',
    targetType: 'Withdrawal',
    targetName: 'Withdrawal Request #789',
    details: { amount: 1000, currency: 'USD', recipient: 'creator@example.com' },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: '2024-01-15T14:20:00Z',
    createdAt: '2024-01-15T14:20:00Z',
  },
  {
    id: '4',
    adminId: 'admin-1',
    adminName: 'John Admin',
    adminEmail: 'john@stellaraid.com',
    action: 'USER_SUSPENDED',
    targetId: 'user-999',
    targetType: 'User',
    targetName: 'Bob Smith',
    details: { reason: 'Violation of terms', suspensionDuration: '7 days' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-16T09:45:00Z',
    createdAt: '2024-01-16T09:45:00Z',
  },
  {
    id: '5',
    adminId: 'admin-2',
    adminName: 'Sarah Admin',
    adminEmail: 'sarah@stellaraid.com',
    action: 'SETTINGS_UPDATED',
    details: { setting: 'platform_fee', oldValue: '5%', newValue: '4%' },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: '2024-01-16T16:30:00Z',
    createdAt: '2024-01-16T16:30:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const adminFilter = searchParams.get('admin') || '';
    const actionFilter = searchParams.get('action') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredLogs = [...mockAuditLogs];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.adminName.toLowerCase().includes(searchLower) ||
        log.adminEmail.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.targetName?.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.details).toLowerCase().includes(searchLower)
      );
    }

    // Apply admin filter
    if (adminFilter) {
      filteredLogs = filteredLogs.filter(log => log.adminId === adminFilter);
    }

    // Apply action filter
    if (actionFilter) {
      filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
    }

    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const total = filteredLogs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    // Get unique admins for filter dropdown
    const uniqueAdmins = Array.from(
      new Set(mockAuditLogs.map(log => ({ id: log.adminId, name: log.adminName })))
    ).map(({ id, name }) => ({ id, name }));

    // Get unique actions for filter dropdown
    const uniqueActions = Array.from(new Set(mockAuditLogs.map(log => log.action)));

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        admins: uniqueAdmins,
        actions: uniqueActions,
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}