import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog-api';

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

    const blogPosts = getAllPosts();
    const blogRoutes = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [...routes, ...blogRoutes];
}
