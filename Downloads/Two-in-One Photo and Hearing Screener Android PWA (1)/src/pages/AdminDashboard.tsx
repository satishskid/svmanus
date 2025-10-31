import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus, Trash2, Edit2, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

type SubscriptionTier = "trial" | "paid";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<SubscriptionTier>("trial");
  const [notes, setNotes] = useState("");
  const [editingEmail, setEditingEmail] = useState<string | null>(null);

  // Fetch whitelist entries
  const { data: whitelistEntries = [], isLoading, refetch } = trpc.admin.getWhitelistEntries.useQuery();

  // Add to whitelist mutation
  const addMutation = trpc.admin.addToWhitelist.useMutation({
    onSuccess: () => {
      setEmail("");
      setTier("trial");
      setNotes("");
      refetch();
    },
  });

  // Delete from whitelist mutation
  const deleteMutation = trpc.admin.removeFromWhitelist.useMutation({
    onSuccess: () => refetch(),
  });

  // Update whitelist mutation
  const updateMutation = trpc.admin.updateWhitelistEntry.useMutation({
    onSuccess: () => {
      setEditingEmail(null);
      refetch();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Please log in to access admin dashboard.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground/60">You do not have permission to access the admin dashboard.</p>
            <Link href="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "expired":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "revoked":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getDurationLabel = (days: number) => {
    if (days === 3) return "3 Days (Trial)";
    if (days === 365) return "1 Year (Paid)";
    return `${days} Days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="container flex items-center gap-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm text-foreground/60">Manage user access and subscriptions</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add User</TabsTrigger>
            <TabsTrigger value="manage">Manage Users</TabsTrigger>
          </TabsList>

          {/* Add User Tab */}
          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add User to Whitelist</CardTitle>
                <CardDescription>
                  Grant access to a user by adding their email and selecting subscription tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={addMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Subscription Tier</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={tier === "trial" ? "default" : "outline"}
                        onClick={() => setTier("trial")}
                        disabled={addMutation.isPending}
                        className="h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-semibold">Trial</div>
                          <div className="text-xs text-foreground/60">3 Days Access</div>
                        </div>
                      </Button>
                      <Button
                        variant={tier === "paid" ? "default" : "outline"}
                        onClick={() => setTier("paid")}
                        disabled={addMutation.isPending}
                        className="h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-semibold">Paid</div>
                          <div className="text-xs text-foreground/60">1 Year Access</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <Input
                      placeholder="e.g., School trial, Premium customer"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={addMutation.isPending}
                    />
                  </div>

                  <Button
                    onClick={() => {
                      addMutation.mutate({
                        email,
                        subscriptionTier: tier,
                        accessDurationDays: tier === "trial" ? 3 : 365,
                        notes: notes || undefined,
                      });
                    }}
                    disabled={!email || addMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    {addMutation.isPending ? "Adding..." : "Add to Whitelist"}
                  </Button>

                  {addMutation.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">{addMutation.error.message}</p>
                    </div>
                  )}

                  {addMutation.isSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">✓ User added successfully!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Users Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Whitelisted Users</CardTitle>
                <CardDescription>
                  {whitelistEntries.length} user{whitelistEntries.length !== 1 ? "s" : ""} in whitelist
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-foreground/60">Loading...</p>
                  </div>
                ) : whitelistEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-foreground/60">No whitelisted users yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {whitelistEntries.map((entry: any) => (
                      <div
                        key={entry.email}
                        className="border border-border rounded-lg p-4 flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(entry.status)}
                            <span className="font-semibold">{entry.email}</span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {entry.subscriptionTier === "trial" ? "Trial" : "Paid"}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/60 mb-1">
                            Duration: {getDurationLabel(entry.accessDurationDays)}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-foreground/60">Notes: {entry.notes}</p>
                          )}
                          <p className="text-xs text-foreground/40 mt-2">
                            Added: {new Date(entry.createdAt!).toLocaleDateString()}
                            {entry.expiresAt && ` • Expires: ${new Date(entry.expiresAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingEmail(entry.email)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Remove ${entry.email} from whitelist?`)) {
                                deleteMutation.mutate({ email: entry.email });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>1. Add Email:</strong> Enter the user's email and select their subscription tier (Trial or Paid)
            </p>
            <p>
              <strong>2. Auto Access:</strong> When the user logs in with that email, they automatically get access
            </p>
            <p>
              <strong>3. Time Limit:</strong> Trial users get 3 days, Paid users get 1 year from their first login
            </p>
            <p>
              <strong>4. Manage:</strong> You can edit or remove users from the "Manage Users" tab anytime
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

