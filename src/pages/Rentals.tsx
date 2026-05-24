import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Search, MapPin } from 'lucide-react';
import { apiClient } from '@/integrations/api/client';
import { RentalBookingModal } from '@/components/RentalBookingModal';

interface Equipment {
    id: string;
    name: string;
    category: string;
    brand: string;
    model: string;
    description: string;
    daily_rate: number;
    image_url: string;
    location: string;
    is_available: boolean;
}

// Fallback Mock Data
const MOCK_EQUIPMENT: Equipment[] = [
    {
        id: '1',
        name: 'Sony A7III',
        category: 'Camera',
        brand: 'Sony',
        model: 'A7III',
        description: 'Full frame mirrorless camera, perfect for low light.',
        daily_rate: 85.00,
        image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
        location: 'New York, NY',
        is_available: true
    },
    {
        id: '2',
        name: 'Canon R5',
        category: 'Camera',
        brand: 'Canon',
        model: 'EOS R5',
        description: 'High resolution professional mirrorless camera.',
        daily_rate: 120.00,
        image_url: 'https://images.unsplash.com/photo-1616423664057-a3794cd3cc16?w=800&q=80',
        location: 'Los Angeles, CA',
        is_available: true
    },
    {
        id: '3',
        name: 'DJI Mavic 3',
        category: 'Drone',
        brand: 'DJI',
        model: 'Mavic 3',
        description: 'Professional drone with Hasselblad camera.',
        daily_rate: 95.00,
        image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
        location: 'San Francisco, CA',
        is_available: true
    },
    {
        id: '4',
        name: 'Sigma 24-70mm',
        category: 'Lens',
        brand: 'Sigma',
        model: 'Art DG DN',
        description: 'Versatile zoom lens for E-mount.',
        daily_rate: 35.00,
        image_url: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80',
        location: 'New York, NY',
        is_available: true
    },
    {
        id: '5',
        name: 'Godox AD200',
        category: 'Lighting',
        brand: 'Godox',
        model: 'AD200 Pro',
        description: 'Portable pocket flash.',
        daily_rate: 25.00,
        image_url: 'https://images.unsplash.com/photo-1554048612-387768052bf7?w=800&q=80',
        location: 'Chicago, IL',
        is_available: true
    }
];

export default function Rentals() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Booking State
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('equipment').select('*');
            if (data && data.length > 0) {
                setEquipment(data);
            } else {
                setEquipment(MOCK_EQUIPMENT);
            }
        } catch (err) {
            console.error("Error fetching equipment:", err);
            setEquipment(MOCK_EQUIPMENT);
        } finally {
            setLoading(false);
        }
    };

    const filteredEquipment = equipment.filter(item => {
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['All', 'Camera', 'Lens', 'Drone', 'Lighting', 'Accessory'];

    return (
        <div className="min-h-screen bg-background pb-10">
            <Header />

            {/* Hero Section */}
            <section className="py-12 bg-gradient-to-r from-blue-900 via-slate-800 to-gray-900 text-white mb-10">
                <div className="container px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Rent Professional Gear</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                        Access top-tier cameras, lenses, and drones. Book instantly.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center max-w-lg mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search gear..."
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            <div className="container px-4">
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={categoryFilter === cat ? "default" : "outline"}
                            onClick={() => setCategoryFilter(cat)}
                            className="rounded-full"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEquipment.map(item => (
                            <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="backdrop-blur-md bg-black/50 text-white border-0">
                                            ${item.daily_rate}/day
                                        </Badge>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <Badge variant="outline" className="backdrop-blur-md bg-white/90 text-black border-0 font-bold">
                                            {item.category}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground">{item.brand} {item.model}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {item.location}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-4 pt-0">
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => setSelectedEquipment(item)}
                                    >
                                        Rent Now
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {!loading && filteredEquipment.length === 0 && (
                    <div className="text-center py-20">
                        <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">No equipment found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {selectedEquipment && (
                <RentalBookingModal
                    equipment={selectedEquipment}
                    onClose={() => setSelectedEquipment(null)}
                />
            )}
        </div>
    );
}
