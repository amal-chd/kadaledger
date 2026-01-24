import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://thekada.in';

    const routes = [
        '',
        '/about',
        '/contact',
        '/features',
        '/pricing',
        '/blog',
        '/resources',
        '/testimonials',
        '/login',
        '/register',
        '/legal/privacy',
        '/legal/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
