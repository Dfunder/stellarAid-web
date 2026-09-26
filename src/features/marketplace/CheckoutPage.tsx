import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ExplorerLink, Input, Modal, Spinner } from '@/components/ui'
import { http } from '@/services'
import { useAuth } from '@/features/auth'
import { PaymentAssetSelector, WalletBalanceDisplay } from '@/features/payments'
import { formatDate } from '@/lib'

interface Artwork {
  id: string
  title: string
  description: string
  price: string
  asset: string
  acceptedAssets: string[]
  seller: {
    id: string
    name: string
    username: string
    avatarUrl?: string
  }
  licenseTerms: string
  images: string[]
}

interface CheckoutSession {
  id: string
  artworkId: string
  amount: string
  asset: string
  platformFee: string
  networkFeeEstimate: string
  total: string
  expiresAt: string
}

const LICENSE_PRESETS = [
  { value: 'personal', label: 'Personal Use', description: 'For personal, non-commercial use only' },
  { value: 'commercial', label: 'Commercial Use', description: 'Allows commercial use with attribution' },
  { value: 'exclusive', label: 'Exclusive Rights', description: 'Full exclusive rights, artwork removed from marketplace' },
] as const

export default function CheckoutPage({ artworkId }: { artworkId: string }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showLicense, setShowLicense] = useState(false)

  const { data: artwork, isPending: artworkPending } = useQuery({
    queryKey: ['artwork', artworkId],
    queryFn: async (): Promise<Artwork> => (await http.get<{ artwork: Artwork }>(`/artworks/${artworkId}`)).artwork,
    enabled: !!artworkId,
  })

  const { data: session } = useQuery({
    queryKey: ['checkoutSession', artworkId, selectedAsset],
    queryFn: async (): Promise<CheckoutSession> => {
      if (!selectedAsset) throw new Error('No asset selected')
      const response = await http.post<{ session: CheckoutSession }>(`/checkout/session`, {
        artworkId,
        asset: selectedAsset,
      })
      return response.session
    },
    enabled: !!artworkId && !!selectedAsset,
  })

  const createSessionMutation = useMutation({
    mutationFn: async (): Promise<CheckoutSession> => {
      if (!selectedAsset) throw new Error('Select an asset first')
      const response = await http.post<{ session: CheckoutSession }>(`/checkout/session`, {
        artworkId,
        asset: selectedAsset,
      })
      return response.session
    },
    onSuccess: (data) => {
      setSessionId(data.id)
    },
  })

  const handleProceedToPayment = async () => {
    if (!agreedToTerms) return
    if (!session) {
      await createSessionMutation.mutateAsync()
    }
    // Navigate to wallet signing flow
    // window.location.href = `/payment/sign?sessionId=${sessionId}`
  }

  const canProceed = !!artwork && !!selectedAsset && agreedToTerms && !!user && !createSessionMutation.isPending

  if (artworkPending) {
    return (
      <div className="container py-12">
        <div className="flex items-center gap-3 py-8 text-muted">
          <Spinner label="Loading artwork" className="h-5 w-5" />
          <span className="text-caption">Loading checkout…</span>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-h2">Artwork not found</h1>
        <Button className="mt-6" asChild>
          <a href="/">Browse marketplace</a>
        </Button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-12 max-w-md mx-auto">
        <div className="rounded-card border border-line bg-surface p-8 shadow-card text-center">
          <h1 className="text-h2">Sign in to purchase</h1>
          <p className="mt-2 text-caption text-muted">You need an account to buy artwork.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild>
              <a href={`/login?redirect=/checkout/${artworkId}`}>Sign in</a>
            </Button>
            <Button variant="secondary" asChild>
              <a href={`/register?redirect=/checkout/${artworkId}`}>Create account</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h2">Checkout</h1>
        <p className="mt-1 text-caption text-muted">Review your purchase before proceeding to payment.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-card border border-line bg-surface p-6 shadow-card">
            <h2 className="text-h3">Artwork Summary</h2>
            <div className="mt-4 flex gap-4">
              <img
                src={artwork.images[0] ?? '/placeholder-artwork.png'}
                alt={artwork.title}
                className="h-24 w-24 rounded-card object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-body font-semibold text-foreground">{artwork.title}</h3>
                <p className="mt-1 text-caption text-muted">by {artwork.seller.name}</p>
                <p className="mt-2 text-caption-sm text-muted">{artwork.description.slice(0, 120)}…</p>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-line bg-surface p-6 shadow-card">
            <h2 className="text-h3">Payment Asset</h2>
            <PaymentAssetSelector
              price={artwork.price}
              acceptedAssets={artwork.acceptedAssets}
              onSelect={setSelectedAsset}
              selectedAsset={selectedAsset}
            />
          </div>

          {session && (
            <div className="rounded-card border border-line bg-surface p-6 shadow-card">
              <h2 className="text-h3">Payment Summary</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-caption-sm">
                  <span className="text-muted">Artwork price</span>
                  <span className="font-mono">{artwork.price} {selectedAsset}</span>
                </div>
                <div className="flex justify-between text-caption-sm">
                  <span className="text-muted">Platform fee</span>
                  <span className="font-mono">{session.platformFee} {selectedAsset}</span>
                </div>
                <div className="flex justify-between text-caption-sm">
                  <span className="text-muted">Est. network fee</span>
                  <span className="font-mono">{session.networkFeeEstimate} {selectedAsset}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-3">
                  <span className="text-body font-semibold">Total</span>
                  <span className="text-body font-bold font-mono">{session.total} {selectedAsset}</span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-card border border-line bg-surface p-6 shadow-card">
            <h2 className="text-h3">License Terms</h2>
            <div className="mt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-primary"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                />
                <div>
                  <p className="text-caption-sm text-foreground">
                    I agree to the <button type="button" className="text-primary hover:underline" onClick={() => setShowLicense(true)}>license terms</button> for this artwork.
                  </p>
                  <p className="mt-1 text-caption-xs text-muted">
                    {LICENSE_PRESETS.find((l) => l.value === artwork.licenseTerms)?.description ?? artwork.licenseTerms}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-card border border-line bg-surface p-6 shadow-card sticky top-24">
            <h2 className="text-h3">Order Summary</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-caption-sm">
                <span className="text-muted">Price</span>
                <span className="font-mono">{artwork.price} {selectedAsset || artwork.asset}</span>
              </div>
              {session && (
                <>
                  <div className="flex justify-between text-caption-sm">
                    <span className="text-muted">Platform fee</span>
                    <span className="font-mono">{session.platformFee} {selectedAsset}</span>
                  </div>
                  <div className="flex justify-between text-caption-sm">
                    <span className="text-muted">Est. network fee</span>
                    <span className="font-mono">{session.networkFeeEstimate} {selectedAsset}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-line pt-3">
                <span className="text-body font-semibold">Total</span>
                <span className="text-body font-bold font-mono">{session?.total ?? artwork.price} {selectedAsset || artwork.asset}</span>
              </div>
            </div>

            <WalletBalanceDisplay assets={artwork.acceptedAssets} asDropdown className="mt-6" />

            <Button
              className="mt-6 w-full"
              size="lg"
              isLoading={createSessionMutation.isPending}
              disabled={!canProceed}
              onClick={handleProceedToPayment}
            >
              {session ? 'Proceed to Payment' : 'Create Checkout Session'}
            </Button>

            {createSessionMutation.isError && (
              <p className="mt-3 text-caption text-danger text-center" role="alert">
                {createSessionMutation.error instanceof Error ? createSessionMutation.error.message : 'Failed to create session'}
              </p>
            )}

            <p className="mt-3 text-center text-caption-xs text-muted">
              By proceeding, you authorize the payment from your connected wallet.
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showLicense}
        onClose={() => setShowLicense(false)}
        title="License Terms"
        description={`License for ${artwork.title}`}
      >
        <div className="mt-4 max-h-60 overflow-y-auto rounded-control bg-surface-muted p-4 text-caption-sm text-foreground whitespace-pre-wrap">
          {artwork.licenseTerms}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setShowLicense(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  )
}