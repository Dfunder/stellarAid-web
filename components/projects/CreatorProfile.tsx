import { Button } from '@/components/ui/Button';

interface CreatorProfileProps {
  creator: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    isVerified: boolean;
    campaignsCount: number;
    totalRaised: number;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
  };
}

export function CreatorProfile({ creator }: CreatorProfileProps) {
  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-4">
        <img
          src={creator.avatar || '/default-avatar.png'}
          alt={creator.name}
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h3 className="text-lg font-semibold">{creator.name}</h3>
          {creator.isVerified && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Verified
            </span>
          )}
        </div>
      </div>
      {creator.bio && (
        <p className="text-gray-600">{creator.bio}</p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Campaigns Created</p>
          <p className="text-2xl font-bold">{creator.campaignsCount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Raised</p>
          <p className="text-2xl font-bold">${creator.totalRaised.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          View More Projects
        </Button>
        {creator.socialLinks?.twitter && (
          <a href={creator.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Twitter</Button>
          </a>
        )}
        {creator.socialLinks?.linkedin && (
          <a href={creator.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">LinkedIn</Button>
          </a>
        )}
      </div>
    </div>
  );
}