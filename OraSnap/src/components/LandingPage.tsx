import { PublicPhotographerBrowse } from "./PublicPhotographerBrowse";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Users, Star, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-b from-primary/5 to-background rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Capture Your Perfect Moments</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with professional photographers worldwide. Browse portfolios, compare styles, and book your ideal photographer.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => document.getElementById('photographers')?.scrollIntoView({ behavior: 'smooth' })}>
            Browse Photographers
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/auth/signup?type=photographer')}>
            Join as Photographer
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Camera className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Browse Freely</h3>
            <p className="text-sm text-muted-foreground">
              Explore photographer portfolios without creating an account
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Easy Booking</h3>
            <p className="text-sm text-muted-foreground">
              Create account only when ready to book your photographer
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Compare & Choose</h3>
            <p className="text-sm text-muted-foreground">
              Access comparison tools in your dashboard after signup
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Secure Platform</h3>
            <p className="text-sm text-muted-foreground">
              Safe payments and verified photographer profiles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Photographers Section */}
      <div id="photographers">
        <PublicPhotographerBrowse />
      </div>
    </div>
  );
}