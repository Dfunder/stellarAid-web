import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCopyToClipboard } from '@/hooks'
import { truncateMiddle } from '@/lib'
import { useAuth } from '../hooks/useAuth'
import { useWallet } from '../hooks/useWallet'

function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase()
  }
  return 'LA'
}

/**
 * Auth-aware navbar account dropdown menu.
 * Shows user identity, quick copyable wallet address, and links to Profile, Dashboard, Settings, Wallet, and Logout.
 */
export default function AccountMenu() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { publicKey: connectedPublicKey } = useWallet()
  const { copy, isCopied } = useCopyToClipboard()

  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuItemsRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation within the menu
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setIsOpen(true)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      triggerRef.current?.focus()
      return
    }

    const items = menuItemsRef.current.filter((item): item is HTMLAnchorElement | HTMLButtonElement => item !== null)
    if (items.length === 0) return

    const activeIndex = items.findIndex((item) => item === document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = (activeIndex + 1) % items.length
      items[nextIndex]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prevIndex = (activeIndex - 1 + items.length) % items.length
      items[prevIndex]?.focus()
    }
  }

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate('/')
  }

  // Skeleton loading state while profile loads
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading profile"
        className="flex items-center gap-2 rounded-control bg-surface-muted/60 p-1.5 animate-pulse"
      >
        <div className="h-7 w-7 rounded-full bg-line" />
        <div className="hidden h-4 w-20 rounded bg-line md:block" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const displayPublicKey = user.publicKey || connectedPublicKey
  const profileHandle = user.username || user.id
  const displayName = user.name || 'Lumora Creator'
  const initials = getInitials(user.name, user.email)

  return (
    <div
      ref={menuRef}
      onKeyDown={handleKeyDown}
      className="relative inline-block text-left"
    >
      {/* Menu Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id="account-menu-button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Account menu for ${displayName}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-control border border-line/60 bg-surface px-2.5 py-1.5 text-body text-foreground shadow-card transition hover:border-line hover:bg-surface-muted focus-visible:shadow-focus-ring"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover border border-line"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-gold/30 via-primary/30 to-brand-purple-400/40 text-caption-sm font-bold text-foreground">
            {initials}
          </div>
        )}
        <span className="hidden max-w-32 truncate text-caption font-semibold md:inline">
          {displayName}
        </span>
        <svg
          className={`h-4 w-4 text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="account-menu-button"
          className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-card border border-line bg-surface p-2 shadow-elevated animate-in fade-in zoom-in-95 duration-100"
        >
          {/* User Header Section */}
          <div className="border-b border-line px-3 py-3">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="h-10 w-10 rounded-full object-cover border border-line"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-gold/30 via-primary/30 to-brand-purple-400/40 text-caption font-bold text-foreground">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-semibold text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-caption-sm text-muted">{user.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-caption-sm font-semibold capitalize text-primary">
                    {user.role}
                  </span>
                  {user.username && (
                    <span className="text-caption-sm text-muted">@{user.username}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Truncated Wallet Section with Instant Copy Feedback */}
            {displayPublicKey && (
              <div className="mt-3 flex items-center justify-between rounded-control border border-line/70 bg-surface-muted px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-gold"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                  <span
                    className="truncate text-caption-sm font-mono text-muted"
                    title={displayPublicKey}
                  >
                    {truncateMiddle(displayPublicKey, 6, 4)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void copy(displayPublicKey)}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-caption-sm font-semibold text-primary transition hover:bg-surface focus-visible:shadow-focus-ring"
                  title="Copy address to clipboard"
                >
                  {isCopied(displayPublicKey) ? (
                    <>
                      <svg
                        className="h-3.5 w-3.5 text-success"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-success">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-3.5 w-3.5 text-muted hover:text-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items: Profile, Dashboard, Settings, Wallet, Logout */}
          <div className="py-1">
            <Link
              to={`/artists/${profileHandle}`}
              role="menuitem"
              ref={(el) => {
                menuItemsRef.current[0] = el
              }}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-control px-3 py-2 text-caption font-medium text-foreground transition hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
            >
              <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Public Profile</span>
            </Link>

            <Link
              to="/dashboard"
              role="menuitem"
              ref={(el) => {
                menuItemsRef.current[1] = el
              }}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-control px-3 py-2 text-caption font-medium text-foreground transition hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
            >
              <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/profile/edit"
              role="menuitem"
              ref={(el) => {
                menuItemsRef.current[2] = el
              }}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-control px-3 py-2 text-caption font-medium text-foreground transition hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
            >
              <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Edit Profile & Settings</span>
            </Link>

            <Link
              to="/settings/wallets"
              role="menuitem"
              ref={(el) => {
                menuItemsRef.current[3] = el
              }}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-control px-3 py-2 text-caption font-medium text-foreground transition hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
            >
              <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Linked Wallets</span>
            </Link>
          </div>

          {/* Logout Section */}
          <div className="border-t border-line pt-1">
            <button
              type="button"
              role="menuitem"
              ref={(el) => {
                menuItemsRef.current[4] = el
              }}
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-caption font-medium text-danger transition hover:bg-danger/10 focus:bg-danger/10 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
