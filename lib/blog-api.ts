
import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    readTime: string;
    image: string;
    content: string;
    tags: string[];
}

export function getPostSlugs() {
    return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string): BlogPost | null {
    const realSlug = slug.replace(/\.json$/, '');
    const fullPath = path.join(postsDirectory, `${realSlug}.json`);

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const post = JSON.parse(fileContents);
        return { ...post, slug: realSlug };
    } catch (e) {
        return null;
    }
}

export function getAllPosts(): BlogPost[] {
    const slugs = getPostSlugs();
    const posts = slugs
        .map((slug) => getPostBySlug(slug))
        .filter((post): post is BlogPost => post !== null)
        .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
    return posts;
}
