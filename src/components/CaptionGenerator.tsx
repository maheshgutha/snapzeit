// Calls the server-side /api/functions/generate-captions route (see
// server/app.js), which uses OPENAI_API_KEY to generate real captions.
// Falls back to an error toast if OPENAI_API_KEY isn't configured.
import { useState, useEffect } from 'react';
import { apiClient, supabase } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { 
  Upload, Link as LinkIcon, Sparkles, Copy, Check, 
  Instagram, Linkedin, Image as ImageIcon, Hash, Search,
  Save, History, Trash2, ChevronRight
} from 'lucide-react';

interface CaptionResult {
  imageDescription: string;
  captions: {
    instagram: {
      short: string;
      long: string;
    };
    seo: {
      title: string;
      altText: string;
      description: string;
    };
    linkedin: string;
    pinterest: string;
  };
  keywords: string[];
  mood: string;
  suggestedHashtags: string[];
}

interface SavedCaption {
  id: string;
  image_url: string;
  image_thumbnail: string | null;
  captions_data: CaptionResult;
  created_at: string;
}

interface CaptionGeneratorProps {
  photographerId?: string;
}

export function CaptionGenerator({ photographerId }: CaptionGeneratorProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savedCaptions, setSavedCaptions] = useState<SavedCaption[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch photographer ID if not provided
  const [currentPhotographerId, setCurrentPhotographerId] = useState<string | null>(photographerId || null);

  useEffect(() => {
    if (!photographerId && user) {
      fetchPhotographerId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, photographerId]);

  useEffect(() => {
    if (currentPhotographerId && showHistory) {
      fetchSavedCaptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhotographerId, showHistory]);

  const fetchPhotographerId = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('photographers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setCurrentPhotographerId(data.id);
    }
  };

  const fetchSavedCaptions = async () => {
    if (!currentPhotographerId) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await apiClient
        .from('generated_captions')
        .select('*')
        .eq('photographer_id', currentPhotographerId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Map the data to our interface
      const mappedData: SavedCaption[] = (data || []).map(item => ({
        id: item.id,
        image_url: item.image_url,
        image_thumbnail: item.image_thumbnail,
        captions_data: item.captions_data as unknown as CaptionResult,
        created_at: item.created_at
      }));
      
      setSavedCaptions(mappedData);
    } catch (error) {
      console.error('Error fetching saved captions:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
        setPreviewUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const generateCaptions = async () => {
    if (!imageUrl) {
      toast({ title: 'Error', description: 'Please provide an image', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await apiClient.functions?.invoke?.('generate-captions', {
        body: { imageUrl, context }
      });
      const { data, error } = response || {};

      if (error) throw error;

      if (data.success && data.result && !data.result.parseError) {
        setResult(data.result);
        toast({ title: 'Success', description: 'Captions generated successfully!' });
      } else if (data.result?.parseError) {
        toast({ 
          title: 'Partial Success', 
          description: 'Generated content but could not parse structured data',
          variant: 'destructive'
        });
      } else {
        throw new Error(data.error || 'Failed to generate captions');
      }
    } catch (error: any) {
      console.error('Caption generation error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to generate captions', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCaption = async () => {
    if (!result || !currentPhotographerId) {
      toast({ 
        title: 'Error', 
        description: 'No captions to save or photographer profile not found', 
        variant: 'destructive' 
      });
      return;
    }

    setSaving(true);
    try {
      // Use type assertion for the new table not yet in types
      const insertData = {
        photographer_id: currentPhotographerId,
        image_url: imageUrl.startsWith('data:') ? 'uploaded-image' : imageUrl,
        image_thumbnail: previewUrl.substring(0, 500),
        captions_data: result as unknown as Record<string, unknown>
      };
      
      const { error } = await supabase
        .from('generated_captions')
        .insert(insertData as any);

      if (error) throw error;
      toast({ title: 'Saved!', description: 'Caption saved to your library' });
      if (showHistory) {
        fetchSavedCaptions();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save caption', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteCaption = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_captions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSavedCaptions(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Deleted', description: 'Caption removed from library' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete caption', 
        variant: 'destructive' 
      });
    }
  };

  const loadSavedCaption = (caption: SavedCaption) => {
    setResult(caption.captions_data);
    setPreviewUrl(caption.image_thumbnail || '');
    setShowHistory(false);
    toast({ title: 'Loaded', description: 'Caption loaded from library' });
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copied!', description: 'Caption copied to clipboard' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="h-8 w-8 p-0"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Caption Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Generate SEO-optimized captions for Instagram, LinkedIn, Pinterest, and your portfolio
            </p>
          </div>
          {currentPhotographerId && (
            <Button
              variant={showHistory ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-1" />
              {showHistory ? 'New' : 'History'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showHistory ? (
          // Saved Captions History
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase">Saved Captions</h3>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
              </div>
            ) : savedCaptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No saved captions yet</p>
                <p className="text-sm">Generate and save captions to see them here</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {savedCaptions.map((caption) => (
                    <div
                      key={caption.id}
                      className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {caption.captions_data.imageDescription?.substring(0, 60)}...
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {caption.captions_data.mood}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(caption.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadSavedCaption(caption)}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCaption(caption.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          <>
            {/* Image Input */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="caption-image-upload"
                  />
                  <label htmlFor="caption-image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload</p>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Or paste image URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="rounded-lg overflow-hidden border bg-muted">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-64 w-full object-contain"
                  onError={() => setPreviewUrl('')}
                />
              </div>
            )}

            {/* Context */}
            <div className="space-y-2">
              <Label>Additional Context (Optional)</Label>
              <Textarea
                placeholder="E.g., Wedding shoot in Tuscany, golden hour portraits, client wanted romantic vibes..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Add context about the shoot to get more personalized captions
              </p>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={generateCaptions} 
              disabled={loading || !imageUrl}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                  Generating Captions...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Captions
                </>
              )}
            </Button>

            {/* Results */}
            {result && (
              <div className="space-y-6 pt-4 border-t">
                {/* Save Button */}
                {currentPhotographerId && (
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={saveCaption}
                      disabled={saving}
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save to Library
                    </Button>
                  </div>
                )}

                {/* Image Description & Mood */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Image Analysis</span>
                    <Badge variant="secondary">{result.mood}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.imageDescription}</p>
                </div>

                {/* Platform Tabs */}
                <Tabs defaultValue="instagram" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="instagram" className="text-xs sm:text-sm">
                      <Instagram className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Instagram</span>
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="text-xs sm:text-sm">
                      <Search className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">SEO</span>
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="text-xs sm:text-sm">
                      <Linkedin className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">LinkedIn</span>
                    </TabsTrigger>
                    <TabsTrigger value="pinterest" className="text-xs sm:text-sm">
                      <ImageIcon className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Pinterest</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="instagram" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase text-muted-foreground">Short Caption</Label>
                        <CopyButton text={result.captions.instagram.short} field="ig-short" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        {result.captions.instagram.short}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase text-muted-foreground">Long Caption</Label>
                        <CopyButton text={result.captions.instagram.long} field="ig-long" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap">
                        {result.captions.instagram.long}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase text-muted-foreground">SEO Title</Label>
                        <CopyButton text={result.captions.seo.title} field="seo-title" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        {result.captions.seo.title}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({result.captions.seo.title.length} chars)
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase text-muted-foreground">Alt Text</Label>
                        <CopyButton text={result.captions.seo.altText} field="seo-alt" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        {result.captions.seo.altText}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({result.captions.seo.altText.length} chars)
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase text-muted-foreground">Meta Description</Label>
                        <CopyButton text={result.captions.seo.description} field="seo-desc" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        {result.captions.seo.description}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({result.captions.seo.description.length} chars)
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="linkedin" className="mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase text-muted-foreground">LinkedIn Caption</Label>
                        <CopyButton text={result.captions.linkedin} field="linkedin" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap">
                        {result.captions.linkedin}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pinterest" className="mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs uppercase text-muted-foreground">Pinterest Description</Label>
                        <CopyButton text={result.captions.pinterest} field="pinterest" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap">
                        {result.captions.pinterest}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Keywords & Hashtags */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-xs uppercase text-muted-foreground">SEO Keywords</Label>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-xs uppercase text-muted-foreground">Hashtags</Label>
                      </div>
                      <CopyButton 
                        text={result.suggestedHashtags.map(h => `#${h}`).join(' ')} 
                        field="hashtags" 
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.suggestedHashtags.slice(0, 10).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {result.suggestedHashtags.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.suggestedHashtags.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}