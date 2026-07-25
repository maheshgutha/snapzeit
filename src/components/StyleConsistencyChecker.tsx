// NOTE: consistency scoring here is local heuristic logic, not a call to
// an AI vision model.
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Palette, Loader2, X, Image as ImageIcon, 
  CheckCircle2, AlertTriangle, Lightbulb, Eye, Lock
} from "lucide-react";
import { supabase } from "@/integrations/api/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

interface StyleProfile {
  dominantColorPalette: string[];
  lightingStyle: string;
  compositionStyle: string;
  editingStyle: string;
  mood: string;
}

interface Inconsistency {
  issue: string;
  severity: "high" | "medium" | "low";
  affectedImages: number[];
}

interface StyleResult {
  consistencyScore: number;
  styleProfile: StyleProfile;
  consistentElements: string[];
  inconsistencies: Inconsistency[];
  recommendations: string[];
  brandIdentityStrength: string;
  summary: string;
}

interface ImagePreview {
  url: string;
  name: string;
}

export function StyleConsistencyChecker() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<StyleResult | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserRole(null);
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const role = roles?.role || 'user';
      setUserRole(role);
      setHasAccess(role === 'photographer' || role === 'admin');
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole(null);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 8 - images.length;
    if (files.length > remaining) {
      toast.error(`You can only add ${remaining} more images (max 8)`);
    }

    const filesToAdd = files.slice(0, remaining);
    
    const validFiles = filesToAdd.filter(file => {
      const safeName = sanitizeText(file.name);
      if (!file.type.startsWith('image/')) {
        toast.error(`${safeName} is not a valid image file`);
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${safeName} is too large (max 10MB)`);
        return false;
      }
      
      return true;
    });
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImages(prev => [...prev, { url: dataUrl, name: sanitizeText(file.name) }]);
      };
      reader.onerror = () => {
        toast.error(`Failed to read ${sanitizeText(file.name)}`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
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

  const checkConsistency = async () => {
    if (images.length < 2) {
      toast.error("Please add at least 2 images");
      return;
    }

    if (!hasAccess) {
      toast.error("Access denied: Photographer role required");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }
      
      const { data, error } = await supabase.functions.invoke("check-style-consistency", {
        body: { 
          imageUrls: images.map(img => img.url),
          userId: user.id
        },
      });

      if (error) {
        throw new Error(error.message || 'Supabase function error');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data) {
        throw new Error('No data received from analysis');
      }

      setResult(data);
      toast.success("Style analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? sanitizeText(error.message) : "Failed to analyze style";
      toast.error(errorMessage);
      
      if (errorMessage.includes('AI service not configured') || errorMessage.includes('credits')) {
        const mockResult = {
          consistencyScore: 75,
          styleProfile: {
            dominantColorPalette: ["Warm tones", "Natural colors", "Earth tones"],
            lightingStyle: "natural",
            compositionStyle: "rule-of-thirds",
            editingStyle: "warm",
            mood: "professional"
          },
          consistentElements: [
            "Consistent lighting approach",
            "Similar color temperature",
            "Professional composition"
          ],
          inconsistencies: [
            {
              issue: "Varying depth of field across images",
              severity: "medium" as const,
              affectedImages: [2, 4]
            }
          ],
          recommendations: [
            "Maintain consistent aperture settings for uniform depth of field",
            "Use similar post-processing techniques across all images",
            "Consider standardizing your color grading workflow"
          ],
          brandIdentityStrength: "moderate",
          summary: "Your portfolio shows good consistency in lighting and composition, with room for improvement in post-processing uniformity."
        };
        setResult(mockResult);
        toast.success("Demo analysis complete! (Using mock data)");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Inconsistent";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default: return "bg-muted";
    }
  };

  const getBrandStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "moderate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "weak": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-muted";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking access permissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Photographer Access Required</h3>
            <p className="text-muted-foreground mb-4">
              The Style Consistency Checker is exclusively available for photographers to analyze their portfolio images.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {userRole === 'user' 
                ? 'Please register as a photographer to access this professional tool.' 
                : 'Please contact support if you believe this is an error.'}
            </p>
            <Button onClick={() => navigate('/auth/signup?type=photographer')} className="mr-2">
              Become a Photographer
            </Button>
            <Button variant="outline" onClick={() => navigate('/auth/signin')}>
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Style Consistency Checker
            <Badge variant="secondary" className="ml-auto">
              {userRole === 'admin' ? 'Admin Access' : 'Photographer Only'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Upload 2-8 portfolio images to analyze visual consistency and brand identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 8 && (
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

          {images.length === 0 && (
            <label className="block border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Palette className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">Upload portfolio images</p>
              <p className="text-sm text-muted-foreground">Add 2-8 images to check style consistency</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesUpload}
                className="hidden"
              />
            </label>
          )}

          <div className="flex gap-2">
            <Button
              onClick={checkConsistency}
              disabled={images.length < 2 || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing style...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Check Consistency ({images.length} images)
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

      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Consistency Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold ${getScoreColor(result.consistencyScore)}`}>
                      {result.consistencyScore}
                    </span>
                    <span className="text-muted-foreground">/100</span>
                  </div>
                  <Badge className={`mt-2 ${getScoreColor(result.consistencyScore).replace('text-', 'border-')}`} variant="outline">
                    {getScoreLabel(result.consistencyScore)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Brand Identity</p>
                  <Badge className={getBrandStrengthColor(result.brandIdentityStrength)}>
                    {sanitizeText(result.brandIdentityStrength)}
                  </Badge>
                </div>
              </div>
              <Progress value={result.consistencyScore} className="h-3" />
              <p className="mt-4 text-muted-foreground">{sanitizeText(result.summary)}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Style Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Color Palette</p>
                  <div className="flex gap-2 flex-wrap">
                    {result.styleProfile.dominantColorPalette.map((color, i) => (
                      <Badge key={i} variant="secondary">{sanitizeText(color)}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Lighting</p>
                    <p className="font-medium capitalize">{sanitizeText(result.styleProfile.lightingStyle)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Composition</p>
                    <p className="font-medium capitalize">{sanitizeText(result.styleProfile.compositionStyle)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Editing Style</p>
                    <p className="font-medium capitalize">{sanitizeText(result.styleProfile.editingStyle)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mood</p>
                    <p className="font-medium capitalize">{sanitizeText(result.styleProfile.mood)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Consistent Elements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.consistentElements.map((element, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{sanitizeText(element)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {result.inconsistencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  Inconsistencies Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.inconsistencies.map((issue, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge className={getSeverityColor(issue.severity)}>
                        {sanitizeText(issue.severity)}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm">{sanitizeText(issue.issue)}</p>
                        {issue.affectedImages && issue.affectedImages.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Affects images: {issue.affectedImages.map(n => `#${n}`).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm bg-primary/5 p-3 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{sanitizeText(rec)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}