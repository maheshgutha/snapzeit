import {
    keepPreviousData,
    useQuery
} from '@tanstack/react-query';
import { apiClient } from '@/integrations/api/client';

export interface UsePhotographersOptions {
    page: number;
    limit: number;
    search?: string;
    specialty?: string;
    country?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
}

export function usePhotographers({
    page,
    limit,
    search,
    specialty,
    country,
    city,
    minPrice,
    maxPrice,
    sortBy
}: UsePhotographersOptions) {
    return useQuery({
        queryKey: ['photographers', page, limit, search, specialty, country, city, minPrice, maxPrice, sortBy],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await apiClient.rpc('get_photographers_paginated', {
                p_limit: limit,
                p_offset: (page - 1) * limit,
                p_search: search || null,
                p_specialty: specialty || null,
                p_country: country || null,
                p_city: city || null,
                p_min_price: minPrice || null,
                p_max_price: maxPrice === 500 ? null : maxPrice, // Assumption: 500+ is max
                p_sort_by: sortBy || 'rating'
            });

            if (error) {
                // In development, fall back to mock data so the UI remains usable
                // Allows frontend work without the backend running.
                // @ts-ignore
                if (import.meta.env?.DEV) {
                    const samplePhotos = [
                        'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=1200&q=80&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1519340333755-59a4a9f0c6b2?w=1200&q=80&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&q=80&auto=format&fit=crop',
                    ];

                    const mock = Array.from({ length: limit }).map((_, i) => ({
                        id: `mock-${page}-${i}`,
                        name: `Mock Photographer ${i + 1}`,
                        specialty: specialty || (i % 2 === 0 ? 'Wedding' : 'Portrait'),
                        location: city || country || 'United States',
                        bio: 'Experienced photographer (mock data)',
                        price_per_hour: 80 + i * 15,
                        experience_years: 2 + i,
                        rating: Math.max(3.8, 4.9 - (i * 0.12)),
                        review_count: 5 + i * 3,
                        avatar_url: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
                        portfolio: [samplePhotos[i % samplePhotos.length]],
                        tags: ['Mock', 'Local'],
                        currency: 'USD',
                        country: country || 'United States'
                    }));

                    return {
                        photographers: mock,
                        total: 100
                    };
                }

                throw error;
            }

            return {
                photographers: data || [],
                total: data && data.length > 0 ? (data[0] as any).total_count : 0
            };
        },
        placeholderData: keepPreviousData,
    });
}
