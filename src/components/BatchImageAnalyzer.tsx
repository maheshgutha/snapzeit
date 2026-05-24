import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Upload, CheckCircle2, Lightbulb, Loader2, 
  X, Image as ImageIcon, BarChart3, TrendingUp 
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

interface ImageAnalysis {
  imageUrl: string;
  score: number;
  strengths: string[];
  suggestions: string[];
  category: string;
}

interface BatchResult {
  overallScore: number;
  totalImages: number;
  categoryBreakdown: Record<string, number>;
  portfolioSummary: string;
  topStrengths: string[];
  topSuggestions: string[];
  imageAnalyses: ImageAnalysis[];
}

interface ImagePreview {
  url: string;
  file?: File;
  name: string;
}

export function BatchImageAnalyzer() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageAnalysis | null>(null);

  const handleFilesUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 10 - images.length;
    if (files.length > remaining) {
      toast.error(`You can only add ${remaining} more images (max 10)`);
    }

    const filesToAdd = files.slice(0, remaining);
    
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImages(prev => [...prev, { url: dataUrl, file, name: sanitizeText(file.name) }]);
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
    setSelectedImage(null);
  };

  const analyzePortfolio = async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setSelectedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-portfolio-batch", {
        body: { imageUrls: images.map(img => img.url) },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setResult(data);
      toast.success("Portfolio analyzed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze portfolio");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 6) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-orange-100 dark:bg-orange-900/30";
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Batch Portfolio Analysis
          </CardTitle>
          <CardDescription>
            Upload up to 10 images to get a comprehensive portfolio score and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {result && result.imageAnalyses[index] && (
                    <button
                      onClick={() => setSelectedImage(result.imageAnalyses[index])}
                      className={`absolute bottom-1 right-1 px-2 py-0.5 rounded text-xs font-bold ${getScoreBg(result.imageAnalyses[index].score)} ${getScoreColor(result.imageAnalyses[index].score)}`}
                    >
                      {result.imageAnalyses[index].score}
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add More Button */}
              {images.length < 10 && (
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
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">Drop images here or click to upload</p>
              <p className="text-sm text-muted-foreground">Upload up to 10 portfolio images</p>
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
              onClick={analyzePortfolio}
              disabled={images.length === 0 || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing {images.length} images...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Portfolio ({images.length} images)
                </>
              )}
            </Button>
            {images.length > 0 && (
              <Button variant="outline" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in-50 duration-500">
          {/* Overall Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Portfolio Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </div>
                <p className="text-muted-foreground">out of 10</p>
                <Progress value={result.overallScore * 10} className="mt-4 h-3" />
              </div>

              {/* Category Breakdown */}
              <div>
                <p className="text-sm font-medium mb-2">Category Breakdown</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.categoryBreakdown).map(([cat, count]) => (
                    <Badge key={cat} variant="secondary">
                      {cat}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{result.portfolioSummary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strengths */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400 mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  Top Strengths
                </h4>
                <ul className="space-y-2">
                  {result.topStrengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{sanitizeText(strength)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
                  <Lightbulb className="h-4 w-4" />
                  Areas to Improve
                </h4>
                <ul className="space-y-2">
                  {result.topSuggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                      <span className="text-amber-500 font-bold">{i + 1}.</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual Image Analysis Modal */}
      {selectedImage && (
        <Card className="animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Image Analysis</CardTitle>
              <CardDescription>
                Score: <span className={`font-bold ${getScoreColor(selectedImage.score)}`}>{selectedImage.score}/10</span>
                {" · "}
                <Badge variant="secondary">{selectedImage.category}</Badge>
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedImage(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={selectedImage.imageUrl}
                alt="Selected"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {selectedImage.strengths.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-500">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Suggestions</h4>
                <ul className="space-y-1">
                  {selectedImage.suggestions.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-amber-500">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
