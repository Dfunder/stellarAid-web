import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Spinner } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useCheckUsername } from '../hooks/useCheckUsername'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import type { ProfileEditFormValues } from '../types'

const MAX_NAME_LENGTH = 50
const MAX_BIO_LENGTH = 500

export default function ProfileEditPage() {
  const { user } = useAuth()
  const updateProfileMutation = useUpdateProfile()

  const initialValues: ProfileEditFormValues = useMemo(() => {
    return {
      displayName: user?.name ?? '',
      username: user?.username ?? (user?.name ? user.name.toLowerCase().replace(/\s+/g, '_') : ''),
      bio: user?.bio ?? '',
      location: user?.location ?? '',
      website: user?.website ?? '',
      avatarUrl: user?.avatarUrl ?? '',
      coverUrl: user?.coverUrl ?? '',
      skills: user?.skills ? user.skills.join(', ') : '',
      twitter: user?.socials?.twitter ?? '',
      github: user?.socials?.github ?? '',
      instagram: user?.socials?.instagram ?? '',
      discord: user?.socials?.discord ?? '',
      artstation: user?.socials?.artstation ?? '',
    }
  }, [user])

  const [form, setForm] = useState<ProfileEditFormValues>(initialValues)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Sync form when user profile data loads
  useEffect(() => {
    setForm(initialValues)
  }, [initialValues])

  // Username availability check hook
  const {
    isChecking: isCheckingUsername,
    isAvailable: isUsernameAvailable,
    message: usernameCheckMessage,
  } = useCheckUsername(form.username, user?.username, user?.id)

  // Dirty state detection
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialValues)
  }, [form, initialValues])

  // Browser beforeunload prompt on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleChange = <K extends keyof ProfileEditFormValues>(
    field: K,
    value: ProfileEditFormValues[K],
  ) => {
    setSuccessMessage(null)
    setErrorMessage(null)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    // Inline validation checks
    if (!form.displayName.trim()) {
      setErrorMessage('Display name is required.')
      return
    }

    if (form.displayName.length > MAX_NAME_LENGTH) {
      setErrorMessage(`Display name cannot exceed ${MAX_NAME_LENGTH} characters.`)
      return
    }

    if (form.bio.length > MAX_BIO_LENGTH) {
      setErrorMessage(`Bio cannot exceed ${MAX_BIO_LENGTH} characters.`)
      return
    }

    if (isUsernameAvailable === false) {
      setErrorMessage('Please choose a valid and available username.')
      return
    }

    if (form.website && !/^https?:\/\//.test(form.website)) {
      setErrorMessage('Website must start with http:// or https://')
      return
    }

    try {
      await updateProfileMutation.mutateAsync(form)
      setSuccessMessage('Your profile changes have been saved successfully!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save profile changes. Please try again.',
      )
    }
  }

  const previewUsername = form.username.trim() || user?.username || 'elena_art'

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="container max-w-4xl pt-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
          <div>
            <h1 className="text-h2 font-bold">Edit Profile</h1>
            <p className="mt-1 text-body text-muted">
              Manage your identity, public creator details, portfolio links, and socials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/artists/${previewUsername}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-surface px-4 py-2 text-caption font-semibold text-foreground shadow-card transition hover:bg-surface-muted focus-visible:shadow-focus-ring"
            >
              <span>Preview Public Profile</span>
              <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Unsaved Changes Banner */}
        {isDirty && (
          <div
            role="status"
            className="sticky top-4 z-40 my-4 flex items-center justify-between rounded-control border border-warning/40 bg-warning/15 p-3.5 text-caption backdrop-blur-md shadow-elevated"
          >
            <div className="flex items-center gap-2 text-warning font-semibold">
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>You have unsaved changes</span>
            </div>
            <span className="text-caption-sm text-muted">
              Remember to click "Save Changes" before navigating away.
            </span>
          </div>
        )}

        {/* Status Alerts */}
        {successMessage && (
          <div
            role="alert"
            className="my-4 flex items-center gap-2 rounded-control border border-success bg-success/15 p-4 text-caption text-success"
          >
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="my-4 flex items-center gap-2 rounded-control border border-danger bg-danger/15 p-4 text-caption text-danger"
          >
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-8">
          {/* Section: Basic Identity */}
          <section className="rounded-card border border-line bg-surface p-6 shadow-card">
            <h2 className="text-h3 font-semibold text-foreground">Basic Identity</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Display Name */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-caption-sm font-semibold">
                  <label htmlFor="displayName">Display Name *</label>
                  <span
                    className={`text-caption-sm ${
                      form.displayName.length > MAX_NAME_LENGTH ? 'text-danger' : 'text-muted'
                    }`}
                  >
                    {form.displayName.length}/{MAX_NAME_LENGTH}
                  </span>
                </div>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={form.displayName}
                  maxLength={MAX_NAME_LENGTH}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  className="rounded-control border border-line bg-surface px-3.5 py-2.5 text-body text-foreground focus-visible:shadow-focus-ring"
                />
              </div>

              {/* Username with real-time availability check */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-caption-sm font-semibold">
                  <label htmlFor="username">Username Handle *</label>
                  {isCheckingUsername && (
                    <span className="flex items-center gap-1 text-caption-sm text-muted">
                      <Spinner className="h-3 w-3" /> Checking…
                    </span>
                  )}
                  {!isCheckingUsername && isUsernameAvailable === true && (
                    <span className="text-caption-sm text-success font-medium">✓ Available</span>
                  )}
                  {!isCheckingUsername && isUsernameAvailable === false && (
                    <span className="text-caption-sm text-danger font-medium">✕ Unavailable</span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    @
                  </span>
                  <input
                    id="username"
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => handleChange('username', e.target.value.replace(/^@/, ''))}
                    className={`w-full rounded-control border bg-surface pl-8 pr-3.5 py-2.5 text-body text-foreground focus-visible:shadow-focus-ring ${
                      isUsernameAvailable === false
                        ? 'border-danger'
                        : isUsernameAvailable === true
                        ? 'border-success'
                        : 'border-line'
                    }`}
                  />
                </div>
                {usernameCheckMessage && (
                  <p
                    className={`text-caption-sm ${
                      isUsernameAvailable === false
                        ? 'text-danger'
                        : isUsernameAvailable === true
                        ? 'text-success'
                        : 'text-muted'
                    }`}
                  >
                    {usernameCheckMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Bio Field with character counter */}
            <div className="mt-6 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-caption-sm font-semibold">
                <label htmlFor="bio">Biography</label>
                <span
                  className={`text-caption-sm ${
                    form.bio.length > MAX_BIO_LENGTH ? 'text-danger' : 'text-muted'
                  }`}
                >
                  {form.bio.length}/{MAX_BIO_LENGTH}
                </span>
              </div>
              <textarea
                id="bio"
                rows={4}
                maxLength={MAX_BIO_LENGTH}
                placeholder="Tell potential backers, clients, and supporters about your creative background, techniques, and projects..."
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="rounded-control border border-line bg-surface p-3 text-body text-foreground focus-visible:shadow-focus-ring"
              />
            </div>
          </section>

          {/* Section: Profile Media & Visuals */}
          <section className="rounded-card border border-line bg-surface p-6 shadow-card">
            <h2 className="text-h3 font-semibold text-foreground">Media & Visuals</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Avatar Image URL"
                placeholder="https://example.com/avatar.jpg"
                value={form.avatarUrl}
                onChange={(e) => handleChange('avatarUrl', e.target.value)}
                hint="Direct link to a square JPG, PNG, or WebP image."
              />

              <Input
                label="Cover Banner Image URL"
                placeholder="https://example.com/banner.jpg"
                value={form.coverUrl}
                onChange={(e) => handleChange('coverUrl', e.target.value)}
                hint="Recommended aspect ratio 16:9 or 3:1."
              />
            </div>

            {/* Media Previews */}
            {(form.avatarUrl || form.coverUrl) && (
              <div className="mt-6 flex flex-col gap-3 rounded-control border border-line/60 bg-surface-muted p-4">
                <p className="text-caption font-semibold text-foreground">Media Preview:</p>
                <div className="flex items-center gap-4">
                  {form.avatarUrl && (
                    <img
                      src={form.avatarUrl}
                      alt="Avatar Preview"
                      className="h-14 w-14 rounded-full object-cover border border-line shadow-sm"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                    />
                  )}
                  {form.coverUrl && (
                    <div className="h-14 w-36 overflow-hidden rounded-control border border-line">
                      <img
                        src={form.coverUrl}
                        alt="Cover Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Section: Location & Online Presence */}
          <section className="rounded-card border border-line bg-surface p-6 shadow-card">
            <h2 className="text-h3 font-semibold text-foreground">Presence & Details</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Location"
                placeholder="e.g. Berlin, Germany or Remote"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />

              <Input
                label="Personal Website or Portfolio"
                placeholder="https://yourportfolio.art"
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
              />
            </div>

            <div className="mt-6">
              <Input
                label="Skills & Tags (comma separated)"
                placeholder="e.g. Digital Illustration, Blender 3D, Character Design, Concept Art"
                value={form.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                hint="Displayed as discovery badges on your public artist page."
              />
            </div>
          </section>

          {/* Section: Social Media Accounts */}
          <section className="rounded-card border border-line bg-surface p-6 shadow-card">
            <h2 className="text-h3 font-semibold text-foreground">Social Links</h2>
            <p className="mt-1 text-caption text-muted">
              Connect your verified profiles to build trust with collectors and clients.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="X / Twitter Handle or URL"
                placeholder="https://x.com/username or @username"
                value={form.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
              />

              <Input
                label="GitHub URL or Username"
                placeholder="https://github.com/username"
                value={form.github}
                onChange={(e) => handleChange('github', e.target.value)}
              />

              <Input
                label="Instagram URL or Handle"
                placeholder="https://instagram.com/username"
                value={form.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
              />

              <Input
                label="Discord Tag or Server"
                placeholder="username#0000 or discord.gg/..."
                value={form.discord}
                onChange={(e) => handleChange('discord', e.target.value)}
              />

              <div className="sm:col-span-2">
                <Input
                  label="ArtStation Profile URL"
                  placeholder="https://artstation.com/username"
                  value={form.artstation}
                  onChange={(e) => handleChange('artstation', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Form Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <Link
              to={`/artists/${previewUsername}`}
              className="text-caption font-semibold text-muted hover:text-foreground"
            >
              ← Cancel & View Public Profile
            </Link>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={!isDirty || updateProfileMutation.isPending}
                onClick={() => setForm(initialValues)}
              >
                Reset Changes
              </Button>
              <Button
                type="submit"
                isLoading={updateProfileMutation.isPending}
                disabled={!isDirty || isUsernameAvailable === false}
              >
                Save Profile Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
