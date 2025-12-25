import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayIcon, InformationCircleIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AnimeInfoModal } from "@/components/home/AnimeInfoModal";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
    animeList: any[];
}

export function HeroCarousel({ animeList }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const anime = animeList[currentIndex];

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % animeList.length);
    }, [animeList.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + animeList.length) % animeList.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
    };

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 6000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    const removeHtmlTags = (text: string) => {
        return text?.replace(/<[^>]*>/g, "") || "";
    };

    if (!anime) return null;

    return (
        <>
            <AnimeInfoModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                anime={anime}
            />
            <div className="relative w-full h-[450px] lg:h-[550px] overflow-hidden bg-primary">
                {/* Background Image with Gradient */}
                <div className="absolute inset-0">
                    <Image
                        src={anime.bannerImage || anime.coverImage?.extraLarge}
                        alt={anime.title?.romaji || anime.title?.english}
                        fill
                        priority
                        className="object-cover transition-transform duration-700"
                        sizes="100vw"
                    />
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary" />
                    {/* Glass morphism overlay */}
                    <div className="absolute inset-0 backdrop-blur-[2px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-4 lg:px-8 flex items-center">
                    <div className="w-full lg:w-[55%] space-y-6 animate-fade-in">
                        {/* Ranking Badge */}
                        <div className="flex items-center gap-3 animate-slide-in">
                            <Badge variant="default" className="text-base px-4 py-2 backdrop-blur-md bg-brand-500/90 hover:bg-brand-400 transition-all duration-300 hover:scale-105 shadow-lg">
                                #{currentIndex + 1} Trending
                            </Badge>
                            {anime.averageScore && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/70 transition-all duration-300 hover:scale-105 shadow-lg">
                                    <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    <span className="font-semibold text-white">
                                        {(anime.averageScore / 10).toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="font-outfit font-bold text-4xl lg:text-6xl text-white leading-tight line-clamp-2 drop-shadow-2xl">
                            {anime.title?.english || anime.title?.romaji}
                        </h1>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            {anime.seasonYear && (
                                <Badge variant="secondary" className="backdrop-blur-md bg-secondary-light/70 hover:bg-secondary-light transition-all duration-200 hover:scale-105">{anime.seasonYear}</Badge>
                            )}
                            {anime.format && (
                                <Badge variant="secondary" className="backdrop-blur-md bg-secondary-light/70 hover:bg-secondary-light transition-all duration-200 hover:scale-105">
                                    {anime.format.replace(/_/g, " ")}
                                </Badge>
                            )}
                            {anime.episodes && (
                                <Badge variant="ghost" className="backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105">{anime.episodes} Episodes</Badge>
                            )}
                            {anime.genres?.slice(0, 3).map((genre: string) => (
                                <Badge key={genre} variant="outline" className="backdrop-blur-md hover:bg-brand-500/20 transition-all duration-200 hover:scale-105">
                                    {genre}
                                </Badge>
                            ))}
                        </div>

                        {/* Description */}
                        <p className="text-white/90 text-base lg:text-lg font-light leading-relaxed line-clamp-3 max-w-2xl drop-shadow-lg">
                            {removeHtmlTags(anime.description)}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link href={`/en/anime/${anime.id}`}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    leftIcon={<PlayIcon className="w-5 h-5" />}
                                    className="min-w-[160px] shadow-xl"
                                >
                                    Watch Now
                                </Button>
                            </Link>
                            <Button
                                variant="secondary"
                                size="lg"
                                leftIcon={<InformationCircleIcon className="w-5 h-5" />}
                                onClick={() => setShowModal(true)}
                            >
                                More Info
                            </Button>
                        </div>
                    </div>

                    {/* Poster on the right (Desktop only) */}
                    <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[280px] h-[400px]">
                        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl group">
                            {/* Glass border effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                            <Image
                                src={anime.coverImage?.extraLarge || anime.coverImage?.large}
                                alt={anime.title?.romaji || anime.title?.english}
                                fill
                                className="object-cover transition-all duration-500 group-hover:scale-110"
                                sizes="280px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            {/* Shimmer effect on hover */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex-center bg-black/30 hover:bg-brand-500/80 backdrop-blur-md rounded-full transition-all duration-300 group shadow-lg hover:shadow-brand-500/50 hover:scale-110"
                    aria-label="Previous slide"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex-center bg-black/30 hover:bg-brand-500/80 backdrop-blur-md rounded-full transition-all duration-300 group shadow-lg hover:shadow-brand-500/50 hover:scale-110"
                    aria-label="Next slide"
                >
                    <ChevronRightIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full">
                    {animeList.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "transition-all duration-300 rounded-full",
                                index === currentIndex
                                    ? "w-8 h-2 bg-brand-400 shadow-lg shadow-brand-500/50"
                                    : "w-2 h-2 bg-white/50 hover:bg-white/70 hover:scale-125"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

            </div>
        </>
    );
}
