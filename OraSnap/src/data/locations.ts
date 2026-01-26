export const POPULAR_LOCATIONS = [
    // Major Cities
    { name: 'New York City', slug: 'new-york-city', country: 'USA', photographers: 245, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', description: 'The city that never sleeps offers endless street and architectural photography opportunities.' },
    { name: 'London', slug: 'london', country: 'UK', photographers: 189, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400', description: 'From the historic Tower Bridge to modern Shard, London is a photographers dream.' },
    { name: 'Paris', slug: 'paris', country: 'France', photographers: 167, image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400', description: 'The city of lights is perfect for romantic portraits and fashion photography.' },
    { name: 'Tokyo', slug: 'tokyo', country: 'Japan', photographers: 134, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', description: 'A blend of neon-lit streets and traditional temples.' },

    // Tourist Destinations - Europe
    { name: 'Rome', slug: 'rome', country: 'Italy', photographers: 156, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400', description: 'Capture the eternal citys ancient ruins and vibrant street life.' },
    { name: 'Barcelona', slug: 'barcelona', country: 'Spain', photographers: 112, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400', description: 'Gaudis architecture and the Mediterranean vibe await.' },
    { name: 'Amsterdam', slug: 'amsterdam', country: 'Netherlands', photographers: 89, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400', description: 'Canals, bikes, and historic houses make for picturesque scenes.' },
    { name: 'Prague', slug: 'prague', country: 'Czech Republic', photographers: 76, image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400', description: 'The gothic architecture of Prague is perfect for moody, atmospheric shots.' },

    // Tourist Destinations - Asia Pacific
    { name: 'Bali', slug: 'bali', country: 'Indonesia', photographers: 143, image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400', description: 'Tropical paradise perfect for lifestyle and wedding photography.' },
    { name: 'Bangkok', slug: 'bangkok', country: 'Thailand', photographers: 98, image: 'https://images.unsplash.com/photo-1563492065-1a83d0c8b6d8?w=400', description: 'Vibrant street life and ornate temples.' },
    { name: 'Sydney', slug: 'sydney', country: 'Australia', photographers: 98, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', description: 'Iconic harbor views and stunning beaches.' },
    { name: 'Singapore', slug: 'singapore', country: 'Singapore', photographers: 87, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400', description: 'Futuristic gardens and colonial architecture.' },

    // Americas
    { name: 'Los Angeles', slug: 'los-angeles', country: 'USA', photographers: 198, image: 'https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=400', description: 'Hollywood glamour and beautiful coastlines.' },
    { name: 'Miami', slug: 'miami', country: 'USA', photographers: 134, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', description: 'Art Deco architecture and vibrant nightlife.' },
    { name: 'Rio de Janeiro', slug: 'rio-de-janeiro', country: 'Brazil', photographers: 89, image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400', description: 'Stunning landscapes where mountains meet the sea.' }
];

export const HOTSPOTS = [
    { name: 'Eiffel Tower', slug: 'eiffel-tower', city: 'Paris', country: 'France', type: 'Landmark', image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=400', description: 'The iron lady of Paris. Best captured from Trocadero or Champ de Mars.' },
    { name: 'Times Square', slug: 'times-square', city: 'New York City', country: 'USA', type: 'Street', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400', description: 'The crossroads of the world. Neon lights and endless energy.' },
    { name: 'Bondi Beach', slug: 'bondi-beach', city: 'Sydney', country: 'Australia', type: 'Beach', image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400', description: 'Australias most famous beach. Great for surfing and lifestyle shoots.' },
    { name: 'Santa Monica Pier', slug: 'santa-monica-pier', city: 'Los Angeles', country: 'USA', type: 'Beach', image: 'https://images.unsplash.com/photo-1496180470114-6ef440662f0a?w=400', description: 'Classic California vibe with the Ferris wheel and ocean sunset.' },
    { name: 'Shibuya Crossing', slug: 'shibuya-crossing', city: 'Tokyo', country: 'Japan', type: 'Street', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400', description: 'The busiest pedestrian crossing in the world.' },
    { name: 'Copacabana', slug: 'copacabana', city: 'Rio de Janeiro', country: 'Brazil', type: 'Beach', image: 'https://images.unsplash.com/photo-1564659907532-6968d6e6bd43?w=400', description: 'Famous 4km beach with its iconic patterned promenade.' },
    { name: 'Taj Mahal', slug: 'taj-mahal', city: 'Agra', country: 'India', type: 'Landmark', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400', description: 'Symbol of love. majestic white marble mausoleum.' },
    { name: 'Santorini', slug: 'santorini', city: 'Oia', country: 'Greece', type: 'Scenic', image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?w=400', description: 'White washed houses with blue domes overlooking the sea.' },
    { name: 'Burj Khalifa', slug: 'burj-khalifa', city: 'Dubai', country: 'UAE', type: 'Landmark', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', description: 'The tallest building in the world.' },
    { name: 'Colosseum', slug: 'colosseum', city: 'Rome', country: 'Italy', type: 'Landmark', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400', description: 'Ancient gladiatorial arena in the heart of Rome.' },
];

export const REGIONS = [
    { name: 'North America', locations: 45, photographers: 1250 },
    { name: 'Europe', locations: 67, photographers: 1890 },
    { name: 'Asia Pacific', locations: 38, photographers: 980 },
    { name: 'Middle East', locations: 12, photographers: 340 },
    { name: 'Africa', locations: 18, photographers: 290 },
    { name: 'South America', locations: 22, photographers: 450 },
];
