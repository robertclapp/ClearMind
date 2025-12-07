import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/_core/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SENSORY_PROFILES } from '@shared/const';
import type { SensoryProfile } from '@/contexts/ThemeContext';

/**
 * SettingsPage allows users to configure their preferences.
 */
export default function SettingsPage() {
  const { user } = useAuth();
  const { sensoryProfile, setSensoryProfile } = useTheme();
  const [selectedProfile, setSelectedProfile] = useState<SensoryProfile>(sensoryProfile);

  const updateProfileMutation = trpc.auth.updateSensoryProfile.useMutation({
    onSuccess: () => {
      setSensoryProfile(selectedProfile);
      toast.success('Sensory profile updated');
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const handleSaveProfile = async () => {
    await updateProfileMutation.mutateAsync({
      sensoryProfile: selectedProfile,
    });
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your ClearMind experience
          </p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Login Method</Label>
              <p className="font-medium capitalize">{user?.loginMethod || 'Unknown'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Sensory Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility & Sensory Profile</CardTitle>
            <CardDescription>
              Choose a theme optimized for your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedProfile}
              onValueChange={(value) => setSelectedProfile(value as SensoryProfile)}
            >
              {Object.entries(SENSORY_PROFILES).map(([key, profile]) => (
                <div key={key} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={key} id={key} />
                  <div className="flex-1">
                    <Label htmlFor={key} className="font-semibold cursor-pointer">
                      {profile.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {profile.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            {selectedProfile !== sensoryProfile && (
              <div className="pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  Save Sensory Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification settings will be available in a future update.
            </p>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Offline Storage</h3>
              <p className="text-sm text-muted-foreground mb-2">
                ClearMind stores your data locally for offline access and faster performance.
              </p>
              <Button variant="outline" size="sm">
                Clear Local Cache
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Export Data</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Download all your data in a portable format.
              </p>
              <Button variant="outline" size="sm">
                Export All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About ClearMind</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Version:</strong> 1.0.0
            </p>
            <p className="text-sm text-muted-foreground">
              A neurodivergent-first productivity platform combining powerful knowledge
              management with visual planning and executive function support.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
