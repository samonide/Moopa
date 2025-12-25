import Image from "next/image";
import Link from "next/link";
import { parseImageProxy } from "@/utils/imageUtils";
import { cn } from "@/lib/utils";
import { PlayIcon, StarIcon } from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";

interface AnimeCardProps {
    id: string | number;
    title: string;
    image: string;
    rating?: number;
    episodes?: number;
    format?: string;
    status?: string;
    year?: number;
    className?: string;
    href?: string;
    variant?: "default" | "compact" | "wide";
    showRating?: boolean;
    showMetadata?: boolean;
    priority?: boolean;
}

export function AnimeCard({
    id,
    title,
    image,
    rating,
    episodes,
    format,
    status,
    year,
    className,
    href,
    variant = "default",
    showRating = true,
    showMetadata = true,
    priority = false,
}: AnimeCardProps) {
    const linkHref = href || `/en/anime/${id}`;

    return (
        <Link
            href={linkHref}
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl bg-secondary-light/50 backdrop-blur-sm border border-white/5 transition-all duration-300",
                "hover:scale-[1.02] hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10",
                variant === "compact" && "max-w-[160px]",
                variant === "wide" && "flex-row max-w-[400px]",
                className
            )}
        >
            {/* Image Container */}
            <div className={cn(
                "relative overflow-hidden shrink-0",
                variant === "wide" ? "w-[40%]" : "aspect-[2/3] w-full"
            )}>
                <Image
                    src={parseImageProxy(image, undefined) || ""}
                    alt={title}
                    fill
                    priority={priority}
                    className="object-cover transition-all duration-300 group-hover:scale-110"
                    sizes={variant === "compact" ? "160px" : "200px"}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-brand-500 rounded-full p-3 shadow-lg shadow-black/50">
                        <PlayIcon className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Rating Badge */}
                {showRating && rating && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
                        <StarIcon className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs font-semibold text-white">
                            {(rating / 10).toFixed(1)}
                        </span>
                    </div>
                )}

                {/* Status Badge */}
                {status && status !== "FINISHED" && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-brand-500 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-white uppercase tracking-wide">
                            {status === "RELEASING" ? "Airing" : status}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={cn(
                "flex flex-col gap-2 p-3",
                variant === "wide" && "justify-center flex-1"
            )}>
                {/* Title */}
                <h3
                    className={cn(
                        "font-inter font-semibold text-white line-clamp-2 group-hover:text-brand-400 transition-colors",
                        variant === "compact" ? "text-sm" : "text-base"
                    )}
                    title={title}
                >
                    {title}
                </h3>

                {/* Metadata */}
                {showMetadata && (
                    <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
                        {format && (
                            <span className="px-1.5 py-0.5 rounded bg-white/10">
                                {format}
                            </span>
                        )}
                        {episodes && (
                            <span className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {episodes} eps
                            </span>
                        )}
                        {year && <span>{year}</span>}
                    </div>
                )}
            </div>
        </Link>
    );
}

interface EpisodeCardProps {
    info: any;
    episode: any;
    providerId: string;
    artStorage?: any;
    progress?: number;
    dub?: boolean;
    variant?: "thumbnail" | "detailed";
}

export function EpisodeCard({
    info,
    episode,
    providerId,
    artStorage,
    progress,
    dub,
    variant = "thumbnail",
}: EpisodeCardProps) {
    const time = artStorage?.[episode?.id]?.timeWatched;
    const duration = artStorage?.[episode?.id]?.duration;
    let prog = (time / duration) * 100;
    if (prog > 90) prog = 100;

    const parsedImage = episode?.img
        ? episode?.img?.includes("null")
            ? info.coverImage?.extraLarge
            : episode?.img
        : info.coverImage?.extraLarge || null;

    const href = `/en/anime/watch/${info.id}/${providerId}?id=${encodeURIComponent(
        episode.id
    )}&num=${episode.number}${dub ? `&dub=${dub}` : ""}`;

    if (variant === "detailed") {
        return (
            <Link
                href={href}
                className="group flex gap-4 h-[140px] lg:h-[180px] w-full rounded-xl overflow-hidden bg-secondary-light/50 border border-white/5 transition-all duration-300 hover:scale-[1.01] hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/10"
            >
                {/* Thumbnail */}
                <div className="relative w-[45%] lg:w-[35%] shrink-0 overflow-hidden">
                    {parsedImage && (
                        <Image
                            src={
                                parseImageProxy(
                                    parsedImage,
                                    providerId === "animepahe" ? "https://animepahe.ru" : undefined
                                ) || ""
                            }
                            alt={`Episode ${episode?.number}`}
                            fill
                            className="object-cover"
                            sizes="300px"
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-secondary-light/50" />

                    {/* Progress Bar */}
                    <span
                        className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-300"
                        style={{
                            width:
                                progress !== undefined && progress >= episode?.number
                                    ? "100%"
                                    : artStorage?.[episode?.id]
                                        ? `${prog}%`
                                        : "0%",
                        }}
                    />

                    {/* Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-brand-500 rounded-full p-3 shadow-lg">
                            <PlayIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Episode Number Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-white">
                            EP {episode?.number || 0}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center flex-1 py-3 pr-4 gap-2">
                    <h3 className="font-inter font-semibold text-base lg:text-lg text-white line-clamp-1 group-hover:text-brand-400 transition-colors">
                        {episode?.title || `Episode ${episode?.number || 0}`}
                    </h3>
                    {episode?.description && (
                        <p className="text-sm lg:text-base text-white/70 line-clamp-2 lg:line-clamp-3 font-light">
                            {episode?.description}
                        </p>
                    )}
                </div>
            </Link>
        );
    }

    // Thumbnail variant
    return (
        <Link
            href={href}
            className="group relative overflow-hidden rounded-xl bg-secondary-light/50 border border-white/5 transition-all duration-300 hover:scale-105 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/10"
        >
            <div className="relative aspect-video w-full">
                {parsedImage && (
                    <Image
                        src={
                            parseImageProxy(
                                parsedImage,
                                providerId === "animepahe" ? "https://animepahe.ru" : undefined
                            ) || ""
                        }
                        alt={`Episode ${episode?.number}`}
                        fill
                        className="object-cover"
                        sizes="300px"
                    />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-brand-500 rounded-full p-2.5 shadow-lg">
                        <PlayIcon className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Episode Number */}
                <div className="absolute bottom-2 left-2">
                    <span className="text-sm font-semibold text-white drop-shadow-lg">
                        Episode {episode?.number || 0}
                    </span>
                </div>

                {/* Progress Bar */}
                <span
                    className="absolute bottom-0 left-0 h-1 bg-brand-500"
                    style={{
                        width:
                            progress !== undefined && progress >= episode?.number
                                ? "100%"
                                : artStorage?.[episode?.id]
                                    ? `${prog}%`
                                    : "0%",
                    }}
                />
            </div>
        </Link>
    );
}
