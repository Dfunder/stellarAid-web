import { useState } from 'react'
import { Button } from '@/components/ui'
import type { ArtistProfileExtended, ArtistServicePackage } from '../types'
import CommissionRequestModal from './CommissionRequestModal'

export interface ProfileServicesTabProps {
  profile: ArtistProfileExtended
}

export default function ProfileServicesTab({ profile }: ProfileServicesTabProps) {
  const [selectedService, setSelectedService] = useState<ArtistServicePackage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleHire = (pkg: ArtistServicePackage) => {
    setSelectedService(pkg)
    setIsModalOpen(true)
  }

  const services = profile.services || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 font-bold text-foreground">Commission Offerings & Services</h2>
        <p className="text-body text-muted">
          Hire {profile.displayName} for custom digital commissions, concept art, and creative services with Stellar milestone escrow protection.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-12 text-center">
          <p className="text-body font-semibold text-foreground">No direct service packages listed</p>
          <p className="mt-1 text-caption text-muted">
            You can still submit a custom commission proposal using the Hire Creator button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col justify-between rounded-card border border-line bg-surface p-6 shadow-card transition-all duration-200 hover:border-primary/50 hover:shadow-elevated"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-caption-sm font-semibold text-primary">
                    {pkg.category}
                  </span>
                  <div className="text-right">
                    <span className="text-caption-sm text-muted">Starting at</span>
                    <p className="text-h3 font-bold text-foreground">
                      {pkg.startingPrice.amount}{' '}
                      <span className="text-caption font-normal text-muted">
                        {pkg.startingPrice.asset.code}
                      </span>
                    </p>
                  </div>
                </div>

                <h3 className="mt-4 text-h4 font-semibold text-foreground">{pkg.title}</h3>
                <p className="mt-2 text-caption text-muted leading-relaxed">{pkg.description}</p>

                <div className="mt-5 flex items-center gap-2 text-caption-sm text-foreground/80 font-medium">
                  <svg className="h-4 w-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Estimated delivery: ~{pkg.turnaroundDays} business days</span>
                </div>

                {pkg.deliverables && pkg.deliverables.length > 0 && (
                  <div className="mt-4 border-t border-line/70 pt-4">
                    <p className="text-caption-sm font-semibold text-foreground">What's included:</p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {pkg.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-caption-sm text-muted">
                          <svg className="h-3.5 w-3.5 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-line">
                <Button className="w-full" onClick={() => handleHire(pkg)}>
                  Request This Service
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CommissionRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
        selectedService={selectedService}
      />
    </div>
  )
}
