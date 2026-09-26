import type { ArtistProfileExtended } from '../types'

export interface ProfileReviewsTabProps {
  profile: ArtistProfileExtended
}

export default function ProfileReviewsTab({ profile }: ProfileReviewsTabProps) {
  const reviews = profile.reviews || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 font-bold text-foreground">Client Reviews & Testimonials</h2>
        <p className="text-body text-muted">
          Feedback from clients who completed commissions and purchases with {profile.displayName}.
        </p>
      </div>

      {/* Review summary header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-gold/15 text-gold">
            <span className="text-display font-bold">{profile.rating.toFixed(1)}</span>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gold">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-1 text-caption text-muted">
              Based on {profile.reviewCount} verified on-chain commission deliveries
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-12 text-center">
          <p className="text-body font-semibold text-foreground">No reviews yet</p>
          <p className="mt-1 text-caption text-muted">
            Be the first client to complete a commission with this artist!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-caption-sm font-bold text-foreground">
                    {rev.authorId.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-caption font-semibold text-foreground">{rev.authorId}</p>
                    <p className="text-caption-sm text-muted">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gold">
                  {[...Array(Math.floor(rev.rating))].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-caption-sm font-bold text-foreground">{rev.rating}</span>
                </div>
              </div>

              {rev.comment && (
                <p className="text-body text-foreground/90 leading-relaxed pl-11">
                  "{rev.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
