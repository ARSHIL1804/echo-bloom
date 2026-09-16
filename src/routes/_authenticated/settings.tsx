import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile, useUpdateProfile } from "@/lib/data";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Testimonially" },
      { name: "description", content: "Manage your account, password, and preferences." },
      { property: "og:title", content: "Settings — Testimonially" },
      { property: "og:description", content: "Manage your account, password, and preferences." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile(user?.id);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAvatar(profile.avatar_url ?? "");
    }
  }, [profile]);

  async function saveAccount() {
    if (!name.trim()) return toast.error("Your name can't be empty");
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        email: user?.email ?? profile?.email ?? "",
        avatar_url: avatar.trim() || null,
      } as never);
      toast.success("Account updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your account");
    }
  }

  async function changePassword() {
    if (newPassword.length < 8) return toast.error("Use at least 8 characters");
    setChanging(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    } as never);
    setChanging(false);
    if (error) return toast.error(error.message);
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password updated");
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-56 rounded-xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />

      <div className="grid max-w-3xl gap-5">
        <section className="surface-card space-y-4 p-6">
          <h2 className="font-display font-bold">Account</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="account-name">Name</Label>
              <Input
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="account-email">Email</Label>
              <Input id="account-email" value={user?.email ?? ""} disabled />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account-avatar">Profile image URL</Label>
            <Input
              id="account-avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <Button
            className="rounded-xl"
            onClick={saveAccount}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save changes
          </Button>
        </section>

        <section className="surface-card space-y-4 p-6">
          <h2 className="font-display font-bold">Security</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl" onClick={changePassword} disabled={changing}>
              {changing && <Loader2 className="size-4 animate-spin" />}
              Change password
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={async () => {
                await signOut();
                toast.success("Signed out of all devices");
              }}
            >
              <LogOut className="size-4" /> Log out of all devices
            </Button>
          </div>
        </section>

        <section className="surface-card space-y-4 p-6">
          <h2 className="font-display font-bold">Preferences</h2>
          <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Product email updates</p>
              <p className="text-xs text-muted-foreground">
                Occasional news about new layouts and features.
              </p>
            </div>
            <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
          </div>
        </section>
      </div>
    </div>
  );
}
