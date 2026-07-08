import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Palette, 
  Sparkles, 
  Camera, 
  Sun, 
  MapPin, 
  Shirt, 
  ListChecks, 
  BookOpen,
  Loader2,
  X,
  Plus,
  User,
  Calendar
} from 'lucide-react';

interface MoodBoard {
  theme: {
    title: string;
    description: string;
    keywords: string[];
  };
  colorPalette: Array<{
    name: string;
    hex: string;
    usage: string;
  }>;
  lighting: {
    style: string;
    timeOfDay: string;
    techniques: string[];
    tips: string;
  };
  composition: Array<{
    technique: string;
    description: string;
  }>;
  locations: Array<{
    type: string;
    description: string;
    considerations?: string;
  }>;
  styling: {
    wardrobe: string[];
    accessories: string[];
    props: string[];
    avoidItems?: string[];
  };
  shotList: Array<{
    shot: string;
    description: string;
    priority: 'must-have' | 'nice-to-have' | 'creative-extra';
  }>;
  inspirationReferences: Array<{
    reference: string;
    whatToEmulate: string;
  }>;
}

interface GeneratedResult {
  moodBoard: MoodBoard;
  clientName: string;
  eventType: string;
  generatedAt: string;
}

const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Portrait',
  'Family',
  'Maternity',
  'Newborn',
  'Corporate Headshot',
  'Fashion',
  'Product',
  'Event',
  'Graduation',
  'Boudoir',
  'Lifestyle',
  'Brand',
];

const STYLE_PRESETS = [
  'Romantic', 'Moody', 'Light & Airy', 'Dramatic', 'Vintage', 'Modern', 
  'Bohemian', 'Minimalist', 'Editorial', 'Documentary', 'Cinematic', 
  'Natural', 'Elegant', 'Rustic', 'Urban', 'Whimsical'
];

const COLOR_PRESETS = [
  'Warm tones', 'Cool tones', 'Earth tones', 'Pastels', 'Jewel tones',
  'Neutrals', 'Black & White', 'Bold & Vibrant', 'Muted', 'Monochromatic'
];

export default function MoodBoardGenerator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);

  // Form state
  const [clientName, setClientName] = useState('');
  const [eventType, setEventType] = useState('');
  const [styleKeywords, setStyleKeywords] = useState<string[]>([]);
  const [colorPreferences, setColorPreferences] = useState<string[]>([]);
  const [inspirationNotes, setInspirationNotes] = useState('');
  const [customKeyword, setCustomKeyword] = useState('');
  const [customColor, setCustomColor] = useState('');

  const handleGenerate = async () => {
    if (!eventType) {
      toast({
        title: 'Event type required',
        description: 'Please select or enter an event type',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-mood-board', {
        body: {
          clientName,
          eventType,
          styleKeywords,
          colorPreferences,
          inspirationNotes,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);
      toast({
        title: 'Mood board generated!',
        description: `Created mood board concept: "${data.moodBoard.theme.title}"`,
      });
    } catch (error) {
      console.error('Error generating mood board:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate mood board',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStyleKeyword = (keyword: string) => {
    setStyleKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const toggleColorPreference = (color: string) => {
    setColorPreferences(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const addCustomKeyword = () => {
    if (customKeyword.trim() && !styleKeywords.includes(customKeyword.trim())) {
      setStyleKeywords(prev => [...prev, customKeyword.trim()]);
      setCustomKeyword('');
    }
  };

  const addCustomColor = () => {
    if (customColor.trim() && !colorPreferences.includes(customColor.trim())) {
      setColorPreferences(prev => [...prev, customColor.trim()]);
      setCustomColor('');
    }
  };

  const resetForm = () => {
    setResult(null);
    setClientName('');
    setEventType('');
    setStyleKeywords([]);
    setColorPreferences([]);
    setInspirationNotes('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'must-have': return 'bg-primary text-primary-foreground';
      case 'nice-to-have': return 'bg-secondary text-secondary-foreground';
      case 'creative-extra': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  if (result) {
    const { moodBoard, clientName: name, eventType: type, generatedAt } = result;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{moodBoard.theme.title}</h3>
            <p className="text-muted-foreground">
              {name && `For ${name} • `}{type} • Generated {new Date(generatedAt).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" onClick={resetForm}>
            <Plus className="mr-2 h-4 w-4" />
            New Mood Board
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-lg leading-relaxed">{moodBoard.theme.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {moodBoard.theme.keywords.map((keyword, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Color Palette */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                Color Palette
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {moodBoard.colorPalette.map((color, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-sm border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{color.name}</p>
                    <p className="text-xs text-muted-foreground">{color.hex} • {color.usage}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Lighting */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="h-5 w-5 text-primary" />
                Lighting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{moodBoard.lighting.style}</p>
                <p className="text-sm text-muted-foreground">Best time: {moodBoard.lighting.timeOfDay}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {moodBoard.lighting.techniques.map((tech, i) => (
                  <Badge key={i} variant="outline">{tech}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">{moodBoard.lighting.tips}</p>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Location Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {moodBoard.locations.map((loc, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/30">
                      <p className="font-medium">{loc.type}</p>
                      <p className="text-sm text-muted-foreground">{loc.description}</p>
                      {loc.considerations && (
                        <p className="text-xs text-muted-foreground mt-1 italic">💡 {loc.considerations}</p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Styling */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shirt className="h-5 w-5 text-primary" />
                Styling Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Wardrobe</p>
                    <div className="flex flex-wrap gap-1">
                      {moodBoard.styling.wardrobe.map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Accessories</p>
                    <div className="flex flex-wrap gap-1">
                      {moodBoard.styling.accessories.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Props</p>
                    <div className="flex flex-wrap gap-1">
                      {moodBoard.styling.props.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  {moodBoard.styling.avoidItems && moodBoard.styling.avoidItems.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-destructive mb-2">Avoid</p>
                      <div className="flex flex-wrap gap-1">
                        {moodBoard.styling.avoidItems.map((item, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Composition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5 text-primary" />
              Composition Techniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {moodBoard.composition.map((comp, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/30">
                  <p className="font-medium text-sm">{comp.technique}</p>
                  <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shot List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-primary" />
              Shot List
            </CardTitle>
            <CardDescription>Prioritized shot ideas for your session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {moodBoard.shotList.map((shot, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                  <Badge className={`${getPriorityColor(shot.priority)} text-xs shrink-0`}>
                    {shot.priority.replace('-', ' ')}
                  </Badge>
                  <div>
                    <p className="font-medium">{shot.shot}</p>
                    <p className="text-sm text-muted-foreground">{shot.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inspiration References */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Inspiration References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {moodBoard.inspirationReferences.map((ref, i) => (
                <div key={i} className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <p className="font-medium">{ref.reference}</p>
                  <p className="text-sm text-muted-foreground mt-1">{ref.whatToEmulate}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Client Mood Board Generator</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter your client's preferences and let AI create a comprehensive mood board concept for their session
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Client Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name (optional)</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Sarah & John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventType">Event/Session Type *</Label>
              <div className="flex gap-2">
                <Input
                  id="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="Select or type custom..."
                  list="event-types"
                />
                <datalist id="event-types">
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {EVENT_TYPES.slice(0, 8).map(type => (
                  <Button
                    key={type}
                    type="button"
                    variant={eventType === type ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setEventType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Inspiration Notes</Label>
              <Textarea
                id="notes"
                value={inspirationNotes}
                onChange={(e) => setInspirationNotes(e.target.value)}
                placeholder="Any specific requests, Pinterest boards they've shared, celebrities/influencers they admire, specific locations in mind, etc."
                className="min-h-[140px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Style Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            Style & Aesthetic
          </CardTitle>
          <CardDescription>Select keywords that match your client's vision</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map(keyword => (
              <Badge
                key={keyword}
                variant={styleKeywords.includes(keyword) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => toggleStyleKeyword(keyword)}
              >
                {keyword}
                {styleKeywords.includes(keyword) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              placeholder="Add custom style keyword..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomKeyword())}
            />
            <Button type="button" variant="outline" onClick={addCustomKeyword}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {styleKeywords.filter(k => !STYLE_PRESETS.includes(k)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {styleKeywords.filter(k => !STYLE_PRESETS.includes(k)).map(keyword => (
                <Badge
                  key={keyword}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleStyleKeyword(keyword)}
                >
                  {keyword}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Color Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5" />
            Color Preferences
          </CardTitle>
          <CardDescription>Select color schemes your client prefers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map(color => (
              <Badge
                key={color}
                variant={colorPreferences.includes(color) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => toggleColorPreference(color)}
              >
                {color}
                {colorPreferences.includes(color) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="Add custom color preference..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
            />
            <Button type="button" variant="outline" onClick={addCustomColor}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {colorPreferences.filter(c => !COLOR_PRESETS.includes(c)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {colorPreferences.filter(c => !COLOR_PRESETS.includes(c)).map(color => (
                <Badge
                  key={color}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleColorPreference(color)}
                >
                  {color}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleGenerate}
        disabled={loading || !eventType}
        className="w-full h-12 gradient-primary text-lg font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Mood Board...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Mood Board
          </>
        )}
      </Button>
    </div>
  );
}
