"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Info, Mail, Globe, Calendar, Users, RefreshCw } from "lucide-react";

export function PlatformSettings() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "EDU-Toulouse",
    siteUrl: "https://edu-toulouse.vercel.app",
    contactEmail: "contact@edu-toulouse.com",
    enableRegistration: true,
    enableTeamCreation: true,
    enableEventCreation: true,
    requireApproval: false,
  });

  const handleSwitchChange = (field: string) => (checked: boolean) => {
    setSettings({
      ...settings,
      [field]: checked,
    });
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings({
        ...settings,
        [field]: e.target.value,
      });
    };

  const handleSaveSettings = async () => {
    setIsUpdating(true);

    // This is a mockup for now - in a real implementation,
    // this would save to a settings table in Supabase
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Site Settings</h3>
        </div>
        <Separator />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={handleInputChange("siteName")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="siteUrl">Site URL</Label>
            <Input
              id="siteUrl"
              value={settings.siteUrl}
              onChange={handleInputChange("siteUrl")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={settings.contactEmail}
              onChange={handleInputChange("contactEmail")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">User & Team Settings</h3>
        </div>
        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableRegistration">
                Enable User Registration
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to register on the platform
              </p>
            </div>
            <Switch
              id="enableRegistration"
              checked={settings.enableRegistration}
              onCheckedChange={handleSwitchChange("enableRegistration")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableTeamCreation">Enable Team Creation</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to create new teams
              </p>
            </div>
            <Switch
              id="enableTeamCreation"
              checked={settings.enableTeamCreation}
              onCheckedChange={handleSwitchChange("enableTeamCreation")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Event Settings</h3>
        </div>
        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableEventCreation">Enable Event Creation</Label>
              <p className="text-sm text-muted-foreground">
                Allow organizers to create new events
              </p>
            </div>
            <Switch
              id="enableEventCreation"
              checked={settings.enableEventCreation}
              onCheckedChange={handleSwitchChange("enableEventCreation")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requireApproval">Require Admin Approval</Label>
              <p className="text-sm text-muted-foreground">
                New events require admin approval before becoming visible
              </p>
            </div>
            <Switch
              id="requireApproval"
              checked={settings.requireApproval}
              onCheckedChange={handleSwitchChange("requireApproval")}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveSettings} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>

      <div className="rounded-md bg-muted p-4 text-sm flex items-start gap-3">
        <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
          <p className="font-medium mb-1">Note:</p>
          <p className="text-muted-foreground">
            These settings are currently demo placeholders. In a production
            environment, they would be stored in your Supabase database and
            affect actual platform functionality.
          </p>
        </div>
      </div>
    </div>
  );
}
