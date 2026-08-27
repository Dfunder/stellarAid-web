'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/app/store/hooks';
import { selectUser } from '@/app/features/auth/authSelectors';
import { useRole } from '@/app/hooks/useRole';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import AvatarUpload from '@/app/components/dashboard/AvatarUpload';
import { Plus, X } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfileSettingsPage() {
  const user = useAppSelector(selectUser);
  const { isUser, role, isAgency } = useRole();
  const isArtist = role === 'artist';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  // Artist-specific fields
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Agency-specific fields
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newTeamMember, setNewTeamMember] = useState<TeamMember>({
    id: '',
    name: '',
    email: '',
    role: ''
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setOriginalEmail(user.email || '');
      setProfilePhotoUrl(user.avatar || user.profilePhoto || '');

      if (isArtist) {
        setBio(user.bio || '');
        setTagline(user.tagline || '');
        setSkills(user.skills || []);
        setCoverPhotoUrl(user.coverPhoto || '');
      }

      if (isAgency) {
        setBio(user.bio || '');
        setTagline(user.tagline || '');
        setCoverPhotoUrl(user.coverPhoto || '');
        setTeamMembers(user.teamMembers || []);
      }
    }
  }, [user, isArtist, isAgency]);

  useEffect(() => {
    setEmailChanged(email !== originalEmail && email !== '');
  }, [email, originalEmail]);

  const sendEmailVerification = async () => {
    setSendingVerification(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccessMessage('Verification email sent! Please check your inbox.');
      } else {
        setError('Failed to send verification email. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSendingVerification(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // Team member management functions for agencies
  const addTeamMember = () => {
    if (newTeamMember.name.trim() && newTeamMember.email.trim() && newTeamMember.role.trim()) {
      setTeamMembers([...teamMembers, { ...newTeamMember, id: Date.now().toString() }]);
      setNewTeamMember({ id: '', name: '', email: '', role: '' });
    }
  };

  const removeTeamMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only .jpg and .png files are allowed for cover photo.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Cover photo size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCoverPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadCoverPhoto = async () => {
    if (!coverInputRef.current?.files?.[0]) return;

    const formData = new FormData();
    formData.append('coverPhoto', coverInputRef.current.files[0]);

    const endpoint = isArtist ? '/api/artists/me/cover-photo' : '/api/users/me/cover-photo';
    const response = await fetch(endpoint, { method: 'POST', body: formData });

    if (response.ok) {
      const { url } = await response.json();
      setCoverPhotoUrl(url);
      setCoverPhotoPreview(null);
    } else {
      setError('Failed to upload cover photo. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSuccessMessage('');

    const payload = {
      name,
      email: emailChanged ? email : undefined,
      ...(isArtist && {
        bio,
        tagline,
        skills,
      }),
      ...(isAgency && {
        bio,
        tagline,
        teamMembers,
      }),
    };

    const endpoint = isArtist ? '/api/artists/me' : isAgency ? '/api/agencies/me' : '/api/users/me';

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSaved(true);
        setOriginalEmail(email);
        setEmailChanged(false);
        setSuccessMessage('Profile updated successfully!');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Profile Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Profile Photo
            </h2>
            <AvatarUpload
              currentAvatar={profilePhotoUrl}
              onUpload={(url) => setProfilePhotoUrl(url)}
            />
          </div>

          {/* Cover Photo Upload - Only for artists */}
          {isArtist && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Cover Photo
              </h2>
              <div className="space-y-4">
                <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {coverPhotoPreview || coverPhotoUrl ? (
                    <Image
                      src={coverPhotoPreview || coverPhotoUrl}
                      alt="Cover"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full h-full flex items-center justify-center text-gray-400 text-xl"
                    >
                      + Add Cover Photo
                    </button>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleCoverPhotoChange}
                />
                {coverPhotoPreview && (
                  <button
                    type="button"
                    onClick={uploadCoverPhoto}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Confirm Upload
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {emailChanged && (
                  <button
                    type="button"
                    onClick={sendEmailVerification}
                    disabled={sendingVerification}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {sendingVerification ? 'Sending...' : 'Re-verify Email'}
                  </button>
                )}
              </div>
              {emailChanged && (
                <p className="mt-2 text-sm text-orange-600">
                  You&apos;ve changed your email. Please re-verify it to maintain account access.
                </p>
              )}
            </div>
          </div>

          {/* Artist-specific Fields */}
          {isArtist && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Artist Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="A short tagline that describes you"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your story..."
                  rows={5}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill"
                    className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Agency-specific Fields */}
          {isAgency && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Agency Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="A short tagline that describes your agency"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your agency..."
                  rows={5}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Team Members
                  </label>
                </div>

                {/* Current Team Members */}
                <div className="space-y-3 mb-6">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <span className="text-sm text-gray-900 dark:text-white">{member.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{member.email}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{member.role}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Team Member */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Team Member</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newTeamMember.name}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                      placeholder="Name"
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      value={newTeamMember.email}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                      placeholder="Email"
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newTeamMember.role}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                      placeholder="Role"
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}