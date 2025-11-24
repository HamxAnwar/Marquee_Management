"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, AlertCircle } from "lucide-react";
import { usePlatformSettings, useUpdatePlatformSettings } from "@/hooks/use-platform-admin";
import { toast } from "sonner";

export default function PlatformAdminSettings() {
  const { data: settings, isLoading, error } = usePlatformSettings();
  const updateSettingsMutation = useUpdatePlatformSettings();

  const [formData, setFormData] = React.useState({
    platform_name: "",
    platform_email: "",
    platform_phone: "",
    support_email: "",
    maintenance_mode: false,
    maintenance_message: "",
    api_rate_limit: 1000,
    allow_user_registration: true,
    require_email_verification: true,
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        platform_name: settings.platform_name || "",
        platform_email: settings.platform_email || "",
        platform_phone: settings.platform_phone || "",
        support_email: settings.support_email || "",
        maintenance_mode: settings.maintenance_mode || false,
        maintenance_message: settings.maintenance_message || "",
        api_rate_limit: settings.api_rate_limit || 1000,
        allow_user_registration: settings.allow_user_registration ?? true,
        require_email_verification: settings.require_email_verification ?? true,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettingsMutation.mutateAsync(formData);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          There was an error loading the platform settings.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Platform Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Platform Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <Input
                    id="platform_name"
                    value={formData.platform_name}
                    onChange={(e) => handleInputChange("platform_name", e.target.value)}
                    placeholder="MarqueeBooking"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform_email">Platform Email</Label>
                  <Input
                    id="platform_email"
                    type="email"
                    value={formData.platform_email}
                    onChange={(e) => handleInputChange("platform_email", e.target.value)}
                    placeholder="admin@marqueebooking.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform_phone">Platform Phone</Label>
                  <Input
                    id="platform_phone"
                    value={formData.platform_phone}
                    onChange={(e) => handleInputChange("platform_phone", e.target.value)}
                    placeholder="+92-XXX-XXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={formData.support_email}
                    onChange={(e) => handleInputChange("support_email", e.target.value)}
                    placeholder="support@developerplatform.com"
                  />
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">System Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api_rate_limit">API Rate Limit</Label>
                  <Input
                    id="api_rate_limit"
                    type="number"
                    min="1"
                    value={formData.api_rate_limit}
                    onChange={(e) => handleInputChange("api_rate_limit", parseInt(e.target.value) || 1000)}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to disable the platform
                    </p>
                  </div>
                  <Switch
                    checked={formData.maintenance_mode}
                    onCheckedChange={(checked) => handleInputChange("maintenance_mode", checked)}
                  />
                </div>

                {formData.maintenance_mode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance_message"
                      value={formData.maintenance_message}
                      onChange={(e) => handleInputChange("maintenance_message", e.target.value)}
                      placeholder="The platform is currently under maintenance. Please check back later."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* User Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">User Management</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={formData.allow_user_registration}
                    onCheckedChange={(checked) => handleInputChange("allow_user_registration", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new user accounts
                    </p>
                  </div>
                  <Switch
                    checked={formData.require_email_verification}
                    onCheckedChange={(checked) => handleInputChange("require_email_verification", checked)}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="min-w-32"
              >
                {updateSettingsMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}