import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Upload, CheckCircle2, Lightbulb, Loader2, AlertCircle } from "lucide-react";
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

interface AnalysisResult {
  overallScore: number;
  strengths: string[];
  suggestions: string[];
  category: string;
  rawResponse?: string;
}

export function ImageAnalyzer() {
  const [imageUrl, setImageUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    setAnalysis(null);
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
    setAnalysis(null);
  };

  const analyzeImage = async () => {
    if (!imageUrl) {
      toast.error("Please provide an image URL or upload an image");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await apiClient.functions?.invoke?.("analyze-portfolio-image", {
        body: { imageUrl },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      toast.success("Image analyzed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Portfolio Enhancement
        </CardTitle>
        <CardDescription>
          Get professional AI-powered suggestions to improve your portfolio images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Input */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste image URL..."
              value={imageUrl.startsWith("data:") ? "" : imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="flex-1"
            />
            <label className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border bg-muted">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-contain"
                onError={() => {
                  setPreviewUrl("");
                  toast.error("Failed to load image");
                }}
              />
            </div>
          )}

          <Button
            onClick={analyzeImage}
            disabled={!imageUrl || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Image
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Score */}
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Overall Score</div>
              <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}/10
              </div>
              <Progress value={analysis.overallScore * 10} className="h-2" />
              <Badge variant="secondary" className="mt-2">
                {analysis.category}
              </Badge>
            </div>

            {/* Strengths */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{sanitizeText(strength)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Lightbulb className="h-4 w-4" />
                Enhancement Suggestions
              </h4>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                    <span className="text-amber-500 font-bold">{i + 1}.</span>
                    <span>{sanitizeText(suggestion)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Raw Response (if parsing failed) */}
            {analysis.rawResponse && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <AlertCircle className="h-4 w-4" />
                  AI Response
                </div>
                <p className="text-sm whitespace-pre-wrap">{sanitizeText(analysis.rawResponse)}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
