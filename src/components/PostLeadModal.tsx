import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/api/client';
import { CheckCircle, Loader2 } from 'lucide-react';

interface PostLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PostLeadModal({ isOpen, onClose }: PostLeadModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        serviceType: '',
        location: '',
        date: '',
        budget: '',
        description: ''
    });

    useEffect(() => {
        // Prefill user data if logged in
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    name: user.user_metadata?.full_name || '',
                    phone: user.phone || ''
                }));
            }
        };
        if (isOpen) fetchUser();
    }, [isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Please login to post a requirement.");
                return;
            }

            const { error } = await supabase.from('leads').insert({
                user_id: user.id,
                service_type: formData.serviceType,
                location: formData.location,
                event_date: formData.date || null,
                budget_range: formData.budget,
                description: formData.description,
                contact_number: formData.phone,
                contact_name: formData.name,
                status: 'open'
            });

            if (error) throw error;

            toast.success("Requirement Posted!", {
                description: "Photographers will contact you shortly with their best quotes."
            });
            setStep(3); // Success step
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to post requirement: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setFormData({
            name: '',
            phone: '',
            serviceType: '',
            location: '',
            date: '',
            budget: '',
            description: ''
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="sm:max-w-[500px]">
                {step === 1 && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Post Your Requirement</DialogTitle>
                            <DialogDescription>
                                Get the best quotes from top photographers near you.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter your name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Mobile Number</Label>
                                <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="e.g. +1 234 567 890" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setStep(2)} disabled={!formData.name || !formData.phone}>Next</Button>
                        </DialogFooter>
                    </>
                )}

                {step === 2 && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Tell us about your event</DialogTitle>
                            <DialogDescription>
                                Fill in the details to get accurate quotes.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Service Type</Label>
                                    <Select value={formData.serviceType} onValueChange={(val) => handleChange('serviceType', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Wedding">Wedding</SelectItem>
                                            <SelectItem value="Portrait">Portrait</SelectItem>
                                            <SelectItem value="Event">Event</SelectItem>
                                            <SelectItem value="Fashion">Fashion</SelectItem>
                                            <SelectItem value="Commercial">Commercial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Budget Range</Label>
                                    <Select value={formData.budget} onValueChange={(val) => handleChange('budget', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Budget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="$200-$500">$200 - $500</SelectItem>
                                            <SelectItem value="$500-$1000">$500 - $1,000</SelectItem>
                                            <SelectItem value="$1000-$2000">$1,000 - $2,000</SelectItem>
                                            <SelectItem value="$2000+">$2,000+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Location</Label>
                                <Input value={formData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="City or Area" />
                            </div>

                            <div className="grid gap-2">
                                <Label>Event Date (Optional)</Label>
                                <Input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Describe your requirements..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={handleSubmit} disabled={loading || !formData.serviceType || !formData.location}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Post Requirement
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 3 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Requirement Posted!</h3>
                            <p className="text-muted-foreground mt-2">
                                Your request has been sent to top photographers in your area.<br />
                                They will contact you shortly.
                            </p>
                        </div>
                        <Button onClick={resetAndClose} className="w-full">Done</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
