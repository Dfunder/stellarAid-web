'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, FolderOpen } from 'lucide-react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { useDebounce } from '@/hooks/useDebounce';

interface Conversation {
  id: string;
  participantName: string;
  participantInitials: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
  projectId?: string;
  projectTitle?: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participantName: 'Adaeze Okafor',
    participantInitials: 'AO',
    lastMessage: 'I can start on the draft this afternoon — does that work for you?',
    timestamp: '9:42 AM',
    unreadCount: 2,
    online: true,
    projectId: 'commission-001',
    projectTitle: 'Website Redesign Project',
  },
  {
    id: '2',
    participantName: 'Tunde Bakare',
    participantInitials: 'TB',
    lastMessage: 'Thanks, I have sent the revised agreement over for your review.',
    timestamp: 'Yesterday',
    unreadCount: 0,
    online: false,
    projectId: 'commission-001',
    projectTitle: 'Website Redesign Project',
  },
  {
    id: '3',
    participantName: 'Ifeoma Adeleke',
    participantInitials: 'IA',
    lastMessage: 'Final invoice attached. Let me know once the payment clears.',
    timestamp: 'Yesterday',
    unreadCount: 1,
    online: true,
    projectId: 'commission-002',
    projectTitle: 'Mobile App UI Design',
  },
  {
    id: '4',
    participantName: 'Chinedu Arts Studio',
    participantInitials: 'CA',
    lastMessage: 'Great working with you — happy to take on the next commission.',
    timestamp: 'Mon',
    unreadCount: 0,
    online: false,
    projectId: 'commission-003',
    projectTitle: 'Brand Identity Package',
  },
  {
    id: '5',
    participantName: 'Lola Design Co.',
    participantInitials: 'LD',
    lastMessage: 'Sketch preview ready for feedback whenever you can take a look.',
    timestamp: 'Sun',
    unreadCount: 0,
    online: false,
    projectId: 'commission-002',
    projectTitle: 'Mobile App UI Design',
  },
  {
    id: '6',
    participantName: 'General Chat',
    participantInitials: 'GC',
    lastMessage: 'Thanks for the quick response!',
    timestamp: 'Sat',
    unreadCount: 0,
    online: false,
  },
];

export default function ConversationsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(['commission-001', 'commission-002', 'commission-003', 'ungrouped']));

  const filteredConversations = useMemo(() => {
    if (!debouncedSearch.trim()) return MOCK_CONVERSATIONS;
    const q = debouncedSearch.toLowerCase();
    return MOCK_CONVERSATIONS.filter(
      (c) => c.participantName.toLowerCase().includes(q) || 
             c.lastMessage.toLowerCase().includes(q) ||
             c.projectTitle?.toLowerCase().includes(q)
    );
  }, [debouncedSearch]);

  const groupedConversations = useMemo(() => {
    const groups: { [key: string]: Conversation[] } = {};
    
    filteredConversations.forEach(conversation => {
      const groupKey = conversation.projectId || 'ungrouped';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(conversation);
    });
    
    return groups;
  }, [filteredConversations]);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pick up where you left off with the artists and clients you work with.
          </p>
        </header>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search conversations"
            aria-label="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        {filteredConversations.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
            No conversations match your search.
          </p>
        ) : (
          <ul
            className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900"
            aria-label="Conversations"
          >
            {filteredConversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  href={`/dashboard/messages/${conversation.id}`}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:bg-gray-800/60 dark:focus-visible:bg-gray-800/60"
                >
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                      {conversation.participantInitials}
                    </div>
                    {conversation.online && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900"
                      />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {conversation.participantName}
                      </p>
                      <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm text-gray-600 dark:text-gray-300">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span
                          aria-label={`${conversation.unreadCount} unread messages`}
                          className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[11px] font-semibold text-white"
                        >
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}