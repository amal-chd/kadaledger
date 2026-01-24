
'use client';

import { useEffect, useState } from 'react';

export default function TableOfContents() {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const elements = Array.from(document.querySelectorAll('h2, h3'));
        const items = elements.map((elem, index) => {
            if (!elem.id) {
                elem.id = `heading-${index}`;
            }
            return {
                id: elem.id,
                text: elem.textContent || '',
                level: Number(elem.tagName.substring(1)),
            };
        });
        setHeadings(items);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );

        elements.forEach((elem) => observer.observe(elem));
        return () => observer.disconnect();
    }, []);

    if (headings.length === 0) return null;

    return (
        <nav className="hidden lg:block sticky top-32 w-64 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 h-fit max-h-[80vh] overflow-y-auto">
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs border-b border-white/10 pb-4">
                Table of Contents
            </h4>
            <ul className="space-y-4">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className={`text-sm transition-all duration-300 ${heading.level === 3 ? 'pl-4' : ''
                            }`}
                    >
                        <a
                            href={`#${heading.id}`}
                            className={`block border-l-2 pl-4 py-1 leading-relaxed ${activeId === heading.id
                                    ? 'border-blue-500 text-blue-400 font-bold bg-blue-500/10 rounded-r-lg'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                                }`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                                setActiveId(heading.id);
                            }}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
