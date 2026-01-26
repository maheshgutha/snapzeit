import {
    keepPreviousData,
    useQuery
} from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
            const { data, error } = await supabase.rpc('get_photographers_paginated', {
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
