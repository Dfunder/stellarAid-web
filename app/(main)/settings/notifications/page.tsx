"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui";

interface NotificationSettings {
  donations: { email: boolean; inApp: boolean };
  milestones: { email: boolean; inApp: boolean };
  updates: { email: boolean; inApp: boolean };
  followers: { email: boolean; inApp: boolean };
}

const NotificationSettingRow = ({
  title,
  description,
  settings,
  onChange,
}: {
  title: string;
  description: string;
  settings: { email: boolean; inApp: boolean };
  onChange: (newSettings: { email: boolean; inApp: boolean }) => void;
}) => (
  <div className="flex justify-between items-center py-4 border-b border-gray-200">
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div className="flex items-center gap-4">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={settings.inApp}
          onChange={() => onChange({ ...settings, inApp: !settings.inApp })}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-900">In-App</span>
      </label>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={settings.email}
          onChange={() => onChange({ ...settings, email: !settings.email })}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-900">Email</span>
      </label>
    </div>
  </div>
);

export default function NotificationSettingsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    donations: { email: true, inApp: true },
    milestones: { email: true, inApp: true },
    updates: { email: false, inApp: true },
    followers: { email: true, inApp: false },
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Saving settings:", settings);
      toast.success("Notification settings saved!");
    } catch (error) {
      toast.error("Failed to save settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-2">
          Choose how you want to be notified about activity on StellarAid.
        </p>
      </div>

      <Card className="p-8 shadow-sm">
        <div className="space-y-4">
          <NotificationSettingRow
            title="Donation Received"
            description="Get notified when a project you support receives a donation."
            settings={settings.donations}
            onChange={(newSettings) =>
              setSettings({ ...settings, donations: newSettings })
            }
          />
          <NotificationSettingRow
            title="Milestone Released"
            description="Get notified when a milestone is released for a project you support."
            settings={settings.milestones}
            onChange={(newSettings) =>
              setSettings({ ...settings, milestones: newSettings })
            }
          />
          <NotificationSettingRow
            title="Campaign Update"
            description="Get notified when a creator posts an update to their campaign."
            settings={settings.updates}
            onChange={(newSettings) =>
              setSettings({ ...settings, updates: newSettings })
            }
          />
          <NotificationSettingRow
            title="New Follower"
            description="Get notified when someone follows your profile."
            settings={settings.followers}
            onChange={(newSettings) =>
              setSettings({ ...settings, followers: newSettings })
            }
          />
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}