import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, Upload, Loader2, X, Image as ImageIcon, 
  Target, TrendingUp, Zap, Star, ArrowRight, AlertCircle
} from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";

// Security: Sanitize user input to prevent XSS
const sanitizeText = (text: string): string => {
  return text.replace(/[<>"'&]/g, (match) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[match] || match;
  });
};

const NICHES = [
  { value: "portrait", label: "Portrait Photography", icon: "👤" },
  { value: "wedding", label: "Wedding Photography", icon: "💒" },
  { value: "landscape", label: "Landscape Photography", icon: "🏔️" },
  { value: "product", label: "Product Photography", icon: "📦" },
  { value: "fashion", label: "Fashion Photography", icon: "👗" },
  { value: "food", label: "Food Photography", icon: "🍽️" },
  { value: "event", label: "Event Photography", icon: "🎉" },
  { value: "architecture", label: "Architecture Photography", icon: "🏛️" },
];

interface Standard {
  standard: string;
  score: number;
  yourLevel: string;
}

interface Gap {
  standard: string;
  gap: string;
  priority: "high" | "medium" | "low";
}

interface Action {
  action: string;
  impact: "high" | "medium" | "low";
  difficulty: "easy" | "moderate" | "challenging";
}

interface ComparisonResult {
  overallMatch: number;
  nicheAlignment: string;
  competitiveLevel: string;
  meetsStandards: Standard[];
  gaps: Gap[];
  uniqueStrengths: string[];
  actionPlan: Action[];
  marketPosition: string;
  topTip: string;
  niche: string;
  nicheDescription: string;
}

interface ImagePreview {
  url: string;
  name: string;
}

export function PortfolioComparison() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [niche, setNiche] = useState<string>("portrait");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleFilesUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 6 - images.length;
    if (files.length > remaining) {
      toast.error(`You can only add ${remaining} more images (max 6)`);
    }

    const filesToAdd = files.slice(0, remaining);
    
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImages(prev => [...prev, { url: dataUrl, name: sanitizeText(file.name) }]);
      };
      reader.readAsDataURL(file);
    });

    setResult(null);
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const clearAll = () => {
    setImages([]);
    setResult(null);
  };

  const comparePortfolio = async () => {
    if (images.length < 2) {
      toast.error("Please add at least 2 images");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await apiClient.functions?.invoke?.("compare-portfolio", {
        body: { imageUrls: images.map(img => img.url), niche },
      });
      const { data, error } = response || {};

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setResult(data);
      toast.success("Portfolio comparison complete!");
    } catch (error) {
      console.error("Comparison error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to compare portfolio");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      elite: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      professional: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      advanced: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      beginner: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };
    return colors[level] || colors.intermediate;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default: return "bg-muted";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high": return <Zap className="h-4 w-4 text-yellow-500" />;
      case "medium": return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "low": return <ArrowRight className="h-4 w-4 text-gray-500" />;
      default: return null;
    }
  };

  const selectedNiche = NICHES.find(n => n.value === niche);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Portfolio Comparison
          </CardTitle>
          <CardDescription>
            Compare your work against industry standards for your photography niche
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Niche Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Your Niche</label>
            <Select value={niche} onValueChange={(v) => { setNiche(v); setResult(null); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your photography niche" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map(n => (
                  <SelectItem key={n.value} value={n.value}>
                    <span className="flex items-center gap-2">
                      <span>{n.icon}</span>
                      <span>{n.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && (
            <label className="block border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">Upload your best {selectedNiche?.label.toLowerCase()} shots</p>
              <p className="text-sm text-muted-foreground">Add 2-6 images to compare against top photographers</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={comparePortfolio}
              disabled={images.length < 2 || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Comparing to {selectedNiche?.label}...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Compare Portfolio
                </>
              )}
            </Button>
            {images.length > 0 && (
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          {/* Main Score Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Industry Match Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-6xl font-bold ${getMatchColor(result.overallMatch)}`}>
                      {result.overallMatch}%
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge className={getLevelColor(result.competitiveLevel)}>
                      {result.competitiveLevel}
                    </Badge>
                    <Badge variant="outline">
                      {selectedNiche?.icon} {selectedNiche?.label}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Niche Alignment</p>
                  <Badge variant={result.nicheAlignment === "strong" ? "default" : "secondary"}>
                    {result.nicheAlignment}
                  </Badge>
                </div>
              </div>
              <Progress value={result.overallMatch} className="mt-4 h-2" />
            </div>
            <CardContent className="pt-4">
              <p className="text-muted-foreground">{sanitizeText(result.marketPosition)}</p>
            </CardContent>
          </Card>

          {/* Top Tip */}
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Top Priority</p>
                  <p className="text-sm text-muted-foreground">{sanitizeText(result.topTip)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Standards Met */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Target className="h-4 w-4" />
                  Standards You Meet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.meetsStandards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keep improving to meet industry standards</p>
                ) : (
                  result.meetsStandards.map((item, i) => (
                    <div key={i} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{sanitizeText(item.standard)}</p>
                        <Badge variant="outline" className="text-green-600">{item.score}/10</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{sanitizeText(item.yourLevel)}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Unique Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Your Unique Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.uniqueStrengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-yellow-500 mt-0.5">★</span>
                      <span>{sanitizeText(strength)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Gaps */}
          {result.gaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Gaps to Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.gaps.map((gap, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{sanitizeText(gap.standard)}</p>
                          <p className="text-xs text-muted-foreground">{sanitizeText(gap.gap)}</p>
                        </div>
                        <Badge className={getPriorityColor(gap.priority)} variant="outline">
                          {sanitizeText(gap.priority)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Action Plan
              </CardTitle>
              <CardDescription>Steps to level up your {selectedNiche?.label.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.actionPlan.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{sanitizeText(action.action)}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getImpactIcon(action.impact)}
                          {sanitizeText(action.impact)} impact
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {sanitizeText(action.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
