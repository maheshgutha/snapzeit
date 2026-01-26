import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { X, CreditCard, Calendar as CalendarIcon, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { differenceInDays, addDays, format } from 'date-fns';

interface RentalBookingModalProps {
    equipment: {
        id: string;
        name: string;
        daily_rate: number;
        image_url: string;
    };
    onClose: () => void;
}

export function RentalBookingModal({ equipment, onClose }: RentalBookingModalProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [duration, setDuration] = useState<number>(3); // Default 3 days
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-fill user details if logged in
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    email: user.email || '',
                    name: user.user_metadata?.full_name || ''
                }));
            }
        };
        fetchUser();
    }, []);

    const endDate = startDate ? addDays(startDate, duration) : undefined;
    const totalPrice = equipment.daily_rate * duration;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate) {
            toast.error('Please select a start date');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Please login to book a rental.");
                setIsSubmitting(false);
                return;
            }

            // Check for available stock (Optional - skipping for now as we assume 1 stock)

            const bookingData = {
                equipment_id: equipment.id,
                renter_id: user.id,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate?.toISOString().split('T')[0],
                total_price: totalPrice,
                status: 'pending' // Or 'confirmed' if we had payment
            };

            const { error } = await supabase.from('rental_bookings').insert(bookingData);

            if (error) throw error;

            toast.success(`Rental Request Sent for ${equipment.name}!`, {
                description: `Total: $${totalPrice}. Check your bookings/email for confirmation.`
            });
            onClose();

        } catch (err: any) {
            console.error("Rental booking failed:", err);
            toast.error("Booking failed: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <CardHeader className="flex-row items-center justify-between border-b pb-4">
                    <div>
                        <CardTitle className="text-xl font-bold">Rent {equipment.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Complete your rental request</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column: Date Selection */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <div className="border rounded-md p-1 bg-white dark:bg-black/20">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                            className="rounded-md border-0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Duration (Days)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Info className="h-3 w-3" /> Minimum 1 day rental
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: User Details & Summary */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Contact Details</Label>
                                    <Input
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    <Input
                                        placeholder="Phone (Optional)"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Order Summary</h4>
                                    <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                        <div className="flex justify-between">
                                            <span>Daily Rate:</span>
                                            <span>${equipment.daily_rate}/day</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Duration:</span>
                                            <span>{duration} days</span>
                                        </div>
                                        {startDate && (
                                            <div className="flex justify-between text-xs opacity-80 mt-1">
                                                <span>Period:</span>
                                                <span>{format(startDate, 'MMM d')} - {endDate ? format(endDate, 'MMM d') : ''}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-blue-200 dark:border-blue-700 my-2 pt-2 flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>${totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                                    disabled={isSubmitting || !startDate}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">Processing...</span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" /> Confirm Rental
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
