'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { selectUser } from '@/app/features/auth/authSelectors';
import { useRole } from '@/app/hooks/useRole';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import AvatarUpload from '@/app/components/dashboard/AvatarUpload';

export default function ProfileSettingsPage() {
  const user = useAppSelector(selectUser);
  const { isUser, role } = useRole();
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
    }
  }, [user, isArtist]);

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
        body: JSON.stringify({ email })
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
    setSkills(skills.filter(skill => skill !== skillToRemove));
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
        skills
      })
    };

    const endpoint = isArtist ? '/api/artists/me' : '/api/users/me';
    
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h2>
            <AvatarUpload 
              currentAvatar={profilePhotoUrl}
              onUpload={(url) => setProfilePhotoUrl(url)}
            />
          </div>

          {/* Cover Photo Upload - Only for artists */}
          {isArtist && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cover Photo</h2>
              <div className="space-y-4">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {(coverPhotoPreview || coverPhotoUrl) ? (
                    <img 
                      src={coverPhotoPreview || coverPhotoUrl} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Artist Information</h2>
              
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