import Image from "next/image";
import Link from "next/link";
import { parseImageProxy } from "@/utils/imageUtils";
import { PlayIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

export default function ModernEpisodeCard({
    info,
    providerId,
    episode,
    artStorage,
    progress,
    dub,
}) {
    const time = artStorage?.[episode?.id]?.timeWatched;
    const duration = artStorage?.[episode?.id]?.duration;
    let prog = (time / duration) * 100;
    if (prog > 90) prog = 100;

    const isWatched = progress && episode?.number <= progress;
    const isInProgress = !isWatched && artStorage?.[episode?.id] && prog > 0;

    // Determine image source - prioritize episode image, fallback to AniList cover
    const getImageSource = () => {
        if (!episode?.img || episode.img === "" || episode.img.includes("null") || episode.img.includes("s4.anilist.co")) {
            return info.coverImage?.extraLarge || info.bannerImage || null;
        }
        return episode.img;
    };

    const parsedImage = getImageSource();

    return (
        <Link
            href={`/en/anime/watch/${info.id}/${providerId}?id=${encodeURIComponent(
                episode.id
            )}&num=${episode.number}${dub ? `&dub=${dub}` : ""}`}
            className="group relative bg-secondary-light/50 backdrop-blur-sm rounded-lg overflow-hidden border border-white/5 transition-all duration-300 ease-out hover:scale-[1.03] hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/20"
        >
            {/* 16:9 Aspect Ratio Container */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                {/* Image */}
                {parsedImage && (
                    <Image
                        src={
                            parseImageProxy(
                                parsedImage,
                                providerId === "animepahe" ? "https://animepahe.ru" : undefined
                            ) || ""
                        }
                        alt={`Episode ${episode?.number} Thumbnail`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-300"
                    />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play Icon - Shows on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-brand-500/90 backdrop-blur-sm rounded-full p-3 transform scale-100 group-hover:scale-110 transition-transform duration-300">
                        <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Watched Badge */}
                {isWatched && (
                    <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm rounded-full p-1.5">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                )}

                {/* Progress Bar */}
                {(isWatched || isInProgress) && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                            className="h-full bg-brand-500 transition-all duration-300"
                            style={{
                                width: isWatched ? "100%" : `${prog}%`,
                            }}
                        />
                    </div>
                )}

                {/* Episode Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-inter font-medium text-brand-400 mb-1">
                                Episode {episode?.number || 0}
                            </div>
                            {episode?.title && episode?.title !== `Episode ${episode?.number}` && (
                                <h3 className="text-sm font-inter font-semibold text-white line-clamp-2 leading-tight">
                                    {episode.title}
                                </h3>
                            )}
                        </div>

                        {/* Duration Badge (if available) */}
                        {duration && (
                            <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs font-inter font-medium text-white shrink-0">
                                {Math.floor(duration / 60)}m
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description Section (Optional - shows below image) */}
            {episode?.description && (
                <div className="p-3 border-t border-white/5">
                    <p className="text-xs font-inter text-gray-400 line-clamp-2 leading-relaxed">
                        {episode.description}
                    </p>
                </div>
            )}
        </Link>
    );
}
