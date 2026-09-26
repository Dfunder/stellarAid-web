import { stellarAccountExplorerUrl } from '@/config'
import { useCopyToClipboard } from '@/hooks'
import { truncateMiddle } from '@/lib'
import type { ArtistProfileExtended } from '../types'

export interface ProfileAboutTabProps {
  profile: ArtistProfileExtended
}

export default function ProfileAboutTab({ profile }: ProfileAboutTabProps) {
  const { copy, isCopied } = useCopyToClipboard()

  return (
    <div className="flex flex-col gap-8">
      {/* Biography */}
      <section className="rounded-card border border-line bg-surface p-6 shadow-card">
        <h2 className="text-h3 font-bold text-foreground">Biography</h2>
        <p className="mt-3 text-body text-foreground/90 leading-relaxed whitespace-pre-line">
          {profile.bio || 'No detailed biography provided yet.'}
        </p>
      </section>

      {/* Skills & Disciplines */}
      {profile.skills && profile.skills.length > 0 && (
        <section className="rounded-card border border-line bg-surface p-6 shadow-card">
          <h2 className="text-h3 font-bold text-foreground">Skills & Disciplines</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="rounded-control border border-line bg-surface-muted px-3 py-1.5 text-caption font-semibold text-foreground shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* On-Chain Identity & Stellar Wallet */}
      {profile.publicKey && (
        <section className="rounded-card border border-line bg-surface p-6 shadow-card">
          <h2 className="text-h3 font-bold text-foreground">On-Chain Verification</h2>
          <p className="mt-1 text-caption text-muted">
            Direct public Stellar payout address used for smart contract escrow settlement.
          </p>

          <div className="mt-4 flex flex-col gap-3 rounded-control border border-line bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="text-caption-sm text-muted">Stellar Address</span>
              <p className="break-all font-mono text-caption-sm font-semibold text-foreground">
                {profile.publicKey}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void copy(profile.publicKey!)}
                className="rounded-control border border-line bg-surface px-3 py-1.5 text-caption-sm font-semibold text-primary transition hover:bg-surface-muted"
              >
                {isCopied(profile.publicKey) ? 'Copied!' : 'Copy Address'}
              </button>
              <a
                href={stellarAccountExplorerUrl(profile.publicKey, 'testnet')}
                target="_blank"
                rel="noreferrer"
                className="rounded-control border border-line bg-surface px-3 py-1.5 text-caption-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Explorer ↗
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
