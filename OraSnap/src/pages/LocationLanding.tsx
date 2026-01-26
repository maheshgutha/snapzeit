import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // Assuming footer exists
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Users, Camera, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { POPULAR_LOCATIONS, HOTSPOTS } from '@/data/locations';
import { updatePageSEO } from '@/utils/seo';

export default function LocationLanding() {
    const { slug } = useParams<{ slug: string }>();
    const [locationData, setLocationData] = useState<any>(null);
    const [photographers, setPhotographers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            // Find location data
            const city = POPULAR_LOCATIONS.find(l => l.slug === slug);
            const hotspot = HOTSPOTS.find(h => h.slug === slug);
            const data = city || hotspot;

            if (data) {
                setLocationData(data);

                // SEO Update
                updatePageSEO({
                    title: `Best Photographers in ${data.name} | Top Rated Pros | OraSnap`,
                    description: `Find and book the best photographers in ${data.name}. ${data.description} Verified reviews, portfolios, and instant booking available.`,
                    keywords: `photographers in ${data.name}, ${data.name} photography, hire photographer ${data.name}, professional photographers`,
                    canonical: `https://orasnap.com/location/${slug}`,
                    ogImage: data.image,
                    structuredData: {
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": `Photographers in ${data.name}`,
                        "description": data.description,
                        "image": data.image,
                        "about": {
                            "@type": "Place",
                            "name": data.name,
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": (data as any).city || data.name,
                                "addressCountry": data.country
                            }
                        }
                    }
                });

                // Fetch Photographers
                fetchPhotographers(data.name, (data as any).city);
            } else {
                // Handle 404 or unknown location
                setLoading(false);
            }
        }
    }, [slug]);

    const fetchPhotographers = async (name: string, city?: string) => {
        setLoading(true);
        try {
            let query = supabase
                .from('photographers')
                .select('*')
                .eq('status', 'approved');

            // If it's a hotspot (has city), search by location containing city OR bio containing hotspot name
            if (city) {
                query = query.or(`location.ilike.%${city}%,bio.ilike.%${name}%,specialty.ilike.%${name}%`);
            } else {
                // It is a city
                query = query.textSearch('location', `'${name}'`);
                // Note: textSearch might be strict. Using ilike is safer for partial matches
                // query = query.ilike('location', `%${name}%`);
            }

            const { data, error } = await query.limit(20);

            if (data) {
                setPhotographers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!locationData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Location not found. <Link to="/locations" className="text-blue-600">Browse all locations</Link></p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Header */}
            <div className="relative h-[50vh] min-h-[400px]">
                <img
                    src={locationData.image}
                    alt={locationData.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                    <div className="max-w-3xl text-white">
                        <Link to="/locations" className="inline-flex items-center text-sm hover:underline mb-4 opacity-80">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Locations
                        </Link>
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">{locationData.name}</h1>
                        <p className="text-xl md:text-2xl opacity-90 mb-6">{locationData.description}</p>
                        <div className="flex items-center justify-center gap-4 text-sm font-medium">
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {locationData.country}</span>
                            <span className="flex items-center gap-1"><Camera className="h-4 w-4" /> {(locationData as any).type || 'City'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Top Photographers in {locationData.name}</h2>
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                        {photographers.length} Available
                    </Badge>
                </div>

                {/* Photographers Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-xl" />)}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {photographers.length > 0 ? photographers.map(photographer => (
                            <Link to={`/photographer/${photographer.id}`} key={photographer.id}>
                                <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden border-0 bg-white dark:bg-gray-800">
                                    <div className="relative h-64 overflow-hidden">
                                        {/* Cover Image mockup using first portfolio image or fallback */}
                                        <img
                                            src={photographer.portfolio_images?.[0] || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-white/90 text-black backdrop-blur-sm shadow-sm hover:bg-white">
                                                ${photographer.price_per_hour}/hr
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-5 relative pt-12">
                                        <div className="absolute -top-8 left-5">
                                            <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-800 shadow-lg">
                                                <AvatarImage src={photographer.avatar_url || ''} />
                                                <AvatarFallback>{photographer.name[0]}</AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div className="mb-3">
                                            <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{photographer.name}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {photographer.location}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4 text-sm">
                                            <Badge variant="outline">{photographer.specialty}</Badge>
                                            <div className="flex items-center gap-1 text-yellow-500 font-medium">
                                                <Star className="h-3 w-3 fill-current" />
                                                {photographer.rating}
                                            </div>
                                            <span className="text-muted-foreground">({photographer.review_count})</span>
                                        </div>

                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                            {photographer.bio}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800 rounded-3xl">
                                <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">No photographers found specifically for this spot yet.</h3>
                                <p className="text-muted-foreground mb-6">But we have many in the region!</p>
                                <Button asChild>
                                    <Link to="/photographers">Browse All Photographers</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* SEO Content Block (Important for "Complete SEO Page") */}
                <div className="mt-20 prose dark:prose-invert max-w-none">
                    <h2>Why hire a photographer at {locationData.name}?</h2>
                    <p>
                        {locationData.name} is one of the most iconic locations in {locationData.country}.
                        Whether you are looking for a pre-wedding shoot, a family vacation portrait, or high-end fashion photography,
                        our local professionals know the best lighting, angles, and hidden corners of {locationData.name} to capture the perfect shot.
                    </p>
                    <h3>Best times for photography at {locationData.name}</h3>
                    <p>
                        Most photographers recommend the "Golden Hour" - just after sunrise or before sunset - for the most flattering natural light.
                        However, {locationData.type === 'Street' ? 'street photography here comes alive at night with neon lights and bustling crowds.' :
                            locationData.type === 'Beach' ? 'mid-day sun captures the vibrant colors of the ocean, while sunset offers romantic silhouettes.' :
                                'early morning is often best to avoid large tourist crowds.'}
                    </p>
                </div>
            </div>
            {/* assuming Footer component is available or I skip it. The import exists. */}
        </div>
    );
}
