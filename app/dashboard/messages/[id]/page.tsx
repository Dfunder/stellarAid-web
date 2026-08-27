'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { getSocket } from '@/lib/socket';
import { FolderOpen, ExternalLink } from 'lucide-react';

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  createdAt: string;
}

interface ConversationDetails {
  id: string;
  participantName: string;
  projectId?: string;
  projectTitle?: string;
}

// Mock conversation details lookup - in a real app this would be fetched from an API
const CONVERSATION_DETAILS: { [key: string]: ConversationDetails } = {
  '1': {
    id: '1',
    participantName: 'Adaeze Okafor',
    projectId: 'commission-001',
    projectTitle: 'Website Redesign Project',
  },
  '2': {
    id: '2',
    participantName: 'Tunde Bakare',
    projectId: 'commission-001',
    projectTitle: 'Website Redesign Project',
  },
  '3': {
    id: '3',
    participantName: 'Ifeoma Adeleke',
    projectId: 'commission-002',
    projectTitle: 'Mobile App UI Design',
  },
  '4': {
    id: '4',
    participantName: 'Chinedu Arts Studio',
    projectId: 'commission-003',
    projectTitle: 'Brand Identity Package',
  },
  '5': {
    id: '5',
    participantName: 'Lola Design Co.',
    projectId: 'commission-002',
    projectTitle: 'Mobile App UI Design',
  },
  '6': {
    id: '6',
    participantName: 'General Chat',
  },
};

const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'them',
    text: 'Hi! I can start on the draft this afternoon.',
    createdAt: '09:10',
  },
  { id: 2, sender: 'me', text: 'Perfect, I will review the details then.', createdAt: '09:12' },
];

export default function MessageThreadPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [showTimestamp, setShowTimestamp] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  
  const conversation = CONVERSATION_DETAILS[params.id] || {
    id: params.id,
    participantName: `Conversation #${params.id}`,
  };

  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !params.id) return;

    socket.emit('join_conversation', params.id);

    const handleMessage = (payload: Message) => {
      setMessages((current) => {
        if (current.some((m) => m.id === payload.id)) return current;
        return [payload, ...current];
      });
    };

    socket.on('message_received', handleMessage);

    return () => {
      socket.off('message_received', handleMessage);
    };
  }, [params.id, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;

    const optimisticMessage: Message = {
      id: Date.now(),
      sender: 'me',
      text: draft.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((current) => [...current, optimisticMessage]);
    socket?.emit('send_message', { conversationId: params.id, message: optimisticMessage });
    setDraft('');
  };

  return (
    <DashboardLayout>
      <div className="flex h-[75vh] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {conversation.participantName}
              </h1>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Connected — messages sync in real time.' : 'Reconnecting...'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}
              />
              <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300">
                Mark all read
              </button>
            </div>
          </div>
          
          {conversation.projectId && conversation.projectTitle && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-900/20">
              <FolderOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                This conversation is part of:
              </span>
              <Link
                href={`/commissions/${conversation.projectId}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                {conversation.projectTitle}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => setShowTimestamp(message.id)}
              onMouseLeave={() => setShowTimestamp(null)}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  message.sender === 'me'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <p>{message.text}</p>
                {showTimestamp === message.id && (
                  <p className="mt-1 text-[11px] opacity-70">{message.createdAt}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-gray-200 p-4 dark:border-gray-800">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message"
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-800"
            />
            <button
              type="submit"
              disabled={!isConnected}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}