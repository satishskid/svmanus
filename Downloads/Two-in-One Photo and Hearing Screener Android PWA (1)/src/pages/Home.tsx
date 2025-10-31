import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Eye, Ear, AlertCircle, Clock, Shield } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-xl font-bold text-primary">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-foreground/70">{user?.name || user?.email}</span>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground">
            Comprehensive Health Screening
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/70">
            Fast, non-invasive preliminary screening for vision and hearing health. 
            Designed for preliminary assessment only—not a diagnostic tool.
          </p>
        </div>

        {/* Medical Disclaimer Alert */}
        <Card className="mb-12 border-destructive/30 bg-destructive/5">
          <CardContent className="flex gap-4 pt-6">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive mb-2">Important Medical Disclaimer</h3>
              <p className="text-sm text-foreground/80">
                This application is designed for preliminary screening and educational purposes only. 
                Results are <strong>not diagnostic</strong> and do not constitute medical advice. 
                If you have concerns about your vision or hearing, please consult with a qualified healthcare professional 
                for proper diagnosis and treatment. Always seek professional medical evaluation for any health concerns.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Screening Options Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          {/* Vision Screening Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-2 border-transparent hover:border-primary/20">
            <Link href="/vision-screening">
              <CardHeader className="pb-4">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary/20 transition-colors">
                  <Eye className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Vision Screening</CardTitle>
                <CardDescription>
                  Assess visual acuity and eye alignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Photoscreening</p>
                      <p className="text-xs text-foreground/60">Red reflex and eye alignment detection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Visual Acuity Test</p>
                      <p className="text-xs text-foreground/60">Snellen-style chart reading</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60 pt-2 border-t border-border">
                  <Clock className="h-4 w-4" />
                  <span>~5-10 minutes</span>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Hearing Screening Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-2 border-transparent hover:border-primary/20">
            <Link href="/hearing-screening">
              <CardHeader className="pb-4">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary/20 transition-colors">
                  <Ear className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Hearing Screening</CardTitle>
                <CardDescription>
                  Evaluate hearing sensitivity and speech perception
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Pure Tone Audiometry</p>
                      <p className="text-xs text-foreground/60">Hearing thresholds at multiple frequencies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Speech-in-Noise Test</p>
                      <p className="text-xs text-foreground/60">Real-world listening scenarios</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60 pt-2 border-t border-border">
                  <Clock className="h-4 w-4" />
                  <span>~8-12 minutes</span>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="mb-3 inline-flex rounded-lg bg-accent/10 p-2 text-accent">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">Privacy Protected</h3>
              <p className="text-sm text-foreground/70">
                Your screening data is securely stored and never shared without consent.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="mb-3 inline-flex rounded-lg bg-accent/10 p-2 text-accent">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">Quick Assessment</h3>
              <p className="text-sm text-foreground/70">
                Complete both screenings in under 20 minutes from your device.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="mb-3 inline-flex rounded-lg bg-accent/10 p-2 text-accent">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">Preliminary Only</h3>
              <p className="text-sm text-foreground/70">
                Results guide you toward professional evaluation, not diagnosis.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="mb-4 text-2xl font-bold">Ready to Get Started?</h3>
              <p className="mb-6 text-foreground/70">
                Create an account to save your screening history and track changes over time.
              </p>
              <Button 
                size="lg" 
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-primary hover:bg-primary/90"
              >
                Sign In to Begin
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8 mt-16">
        <div className="container text-center text-sm text-foreground/60">
          <p className="mb-2">
            {APP_TITLE} is a preliminary screening tool for educational purposes.
          </p>
          <p>
            Always consult with healthcare professionals for medical diagnosis and treatment.
          </p>
        </div>
      </footer>
    </div>
  );
}

