import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Calendar, DollarSign, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
    id: string;
    service_type: string;
    location: string;
    event_date: string;
    budget_range: string;
    description: string;
    contact_name: string;
    contact_number: string;
    created_at: string;
}

export function LeadsList() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('status', 'open')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error: any) {
            console.error('Error fetching leads:', error);
            toast({
                title: "Error",
                description: "Failed to load leads.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleContact = (lead: Lead) => {
        if (lead.contact_number) {
            const formattedNumber = lead.contact_number.replace(/\D/g, '');
            window.open(`https://wa.me/${formattedNumber}`, '_blank');
        } else {
            toast({
                title: "Contact Info",
                description: `Contact Name: ${lead.contact_name || 'N/A'} (No number provided)`,
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4">
                    <Loader2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Open Leads</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                    There are currently no new photography opportunities available. Check back soon!
                </p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
            {leads.map((lead, index) => (
                <Card
                    key={lead.id}
                    className="glass-card hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 group border-0 overflow-hidden relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardHeader className="pb-3 relative">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                                {lead.service_type}
                            </Badge>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-purple-600 transition-colors" title={lead.description}>
                            {lead.description || `${lead.service_type} Request`}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="pb-4 space-y-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg backdrop-blur-sm">
                            <MapPin className="h-4 w-4 mr-3 text-red-500 shrink-0" />
                            <span className="font-medium">{lead.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg backdrop-blur-sm">
                            <Calendar className="h-4 w-4 mr-3 text-blue-500 shrink-0" />
                            <span className="font-medium">{lead.event_date ? new Date(lead.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date Flexible'}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg backdrop-blur-sm">
                            <DollarSign className="h-4 w-4 mr-3 text-green-500 shrink-0" />
                            <span className="font-bold text-green-700 dark:text-green-400">{lead.budget_range || 'Budget Negotiable'}</span>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-2 flex gap-2">
                        <Button
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:shadow-green-500/40 rounded-xl py-5"
                            onClick={() => handleContact(lead)}
                        >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            Contact Client
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
