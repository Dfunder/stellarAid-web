import { Button, Modal } from '@/components/ui'
import { useCopyToClipboard } from '@/hooks'
import type { ArtistProfileExtended } from '../types'

export interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  profile: ArtistProfileExtended
}

export default function ShareModal({ isOpen, onClose, profile }: ShareModalProps) {
  const profileUrl = typeof window !== 'undefined' ? window.location.href : `https://lumora.io/artists/${profile.username}`
  const { copy, isCopied } = useCopyToClipboard()

  const shareText = `Check out ${profile.displayName} (@${profile.username}) on Lumora - decentralized creative crowdfunding on Stellar!`

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(profileUrl)}`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Artist Profile"
      description={`Share ${profile.displayName}'s portfolio and commission offerings with your network.`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-control border border-line bg-surface-muted p-2.5">
          <input
            type="text"
            readOnly
            value={profileUrl}
            className="w-full bg-transparent text-caption-sm text-foreground focus:outline-none"
          />
          <Button size="sm" onClick={() => void copy(profileUrl)}>
            {isCopied(profileUrl) ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-control border border-line bg-surface px-4 py-2 text-caption-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </a>
        </div>
      </div>
    </Modal>
  )
}
