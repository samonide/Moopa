import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function MangaProviderSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState("comix");

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/v2/manga/search?query=${encodeURIComponent(query)}&provider=${provider}`
            );

            if (response.ok) {
                const data = await response.json();
                setResults(data);
            } else {
                console.error("Search failed");
                setResults([]);
            }
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="bg-secondary rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Search Manga</h2>

                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for manga..."
                            className="flex-1 px-4 py-2 bg-primary rounded-md outline-none focus:ring-2 focus:ring-action"
                        />

                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="px-4 py-2 bg-primary rounded-md outline-none focus:ring-2 focus:ring-action"
                        >
                            <option value="comix">Comix</option>
                            {/* Add more providers here as they become available */}
                        </select>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-action text-white rounded-md hover:bg-action/80 disabled:opacity-50 flex items-center gap-2"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5" />
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </form>
            </div>

            {results.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {results.map((manga) => (
                        <MangaCard key={manga.id} manga={manga} provider={provider} />
                    ))}
                </div>
            )}

            {!loading && results.length === 0 && query && (
                <div className="text-center text-gray-400 py-12">
                    No results found for "{query}"
                </div>
            )}
        </div>
    );
}

function MangaCard({ manga, provider }) {
    return (
        <Link
            href={`/en/manga/provider/${provider}/${encodeURIComponent(manga.id)}`}
            className="group"
        >
            <div className="bg-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-action transition-all">
                <div className="relative aspect-[2/3]">
                    {manga.image ? (
                        <Image
                            src={manga.image}
                            alt={manga.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}
                </div>

                <div className="p-3">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-action transition-colors">
                        {manga.title}
                    </h3>

                    {manga.year && (
                        <p className="text-sm text-gray-400 mt-1">{manga.year}</p>
                    )}

                    {manga.synonyms && manga.synonyms.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {manga.synonyms[0]}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}
