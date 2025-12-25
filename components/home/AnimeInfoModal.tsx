import { Fragment } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, PlayIcon, StarIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface AnimeInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    anime: any;
}

export function AnimeInfoModal({ isOpen, onClose, anime }: AnimeInfoModalProps) {
    const router = useRouter();

    if (!anime) return null;

    const removeHtmlTags = (text: string) => {
        return text?.replace(/<[^>]*>/g, "") || "";
    };

    const handleWatchNow = () => {
        onClose();
        router.push(`/en/anime/${anime.id}`);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[300]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-secondary border border-white/10 shadow-2xl transition-all">
                                {/* Banner Section */}
                                <div className="relative h-[300px] lg:h-[400px] w-full">
                                    <Image
                                        src={anime.bannerImage || anime.coverImage?.extraLarge}
                                        alt={anime.title?.romaji || anime.title?.english}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 1200px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />

                                    {/* Close Button */}
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 w-10 h-10 flex-center bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full transition-all duration-200 z-10"
                                    >
                                        <XMarkIcon className="w-6 h-6 text-white" />
                                    </button>

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Poster */}
                                            <div className="flex-shrink-0 w-32 lg:w-40 h-48 lg:h-60 relative rounded-xl overflow-hidden shadow-2xl">
                                                <Image
                                                    src={anime.coverImage?.extraLarge || anime.coverImage?.large}
                                                    alt={anime.title?.romaji || anime.title?.english}
                                                    fill
                                                    className="object-cover"
                                                    sizes="160px"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 space-y-3">
                                                <h2 className="font-outfit font-bold text-3xl lg:text-4xl text-white">
                                                    {anime.title?.english || anime.title?.romaji}
                                                </h2>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {anime.averageScore && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg">
                                                            <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                            <span className="font-semibold text-white text-sm">
                                                                {(anime.averageScore / 10).toFixed(1)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {anime.seasonYear && (
                                                        <Badge variant="secondary">{anime.seasonYear}</Badge>
                                                    )}
                                                    {anime.format && (
                                                        <Badge variant="secondary">
                                                            {anime.format.replace(/_/g, " ")}
                                                        </Badge>
                                                    )}
                                                    {anime.episodes && (
                                                        <Badge variant="ghost">{anime.episodes} Episodes</Badge>
                                                    )}
                                                    {anime.status && (
                                                        <Badge variant={anime.status === "RELEASING" ? "success" : "ghost"}>
                                                            {anime.status.replace(/_/g, " ")}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    leftIcon={<PlayIcon className="w-5 h-5" />}
                                                    className="w-full lg:w-auto"
                                                    onClick={handleWatchNow}
                                                >
                                                    Watch Now
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="p-6 lg:p-8 space-y-6">
                                    {/* Genres */}
                                    {anime.genres && anime.genres.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                                                Genres
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {anime.genres.map((genre: string) => (
                                                    <Badge key={genre} variant="outline">
                                                        {genre}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {anime.description && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                                                Synopsis
                                            </h3>
                                            <p className="text-white/80 text-base leading-relaxed">
                                                {removeHtmlTags(anime.description)}
                                            </p>
                                        </div>
                                    )}

                                    {/* Additional Info Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                                        {anime.studios?.nodes?.[0] && (
                                            <div className="space-y-1">
                                                <p className="text-xs text-white/60 uppercase tracking-wider">Studio</p>
                                                <p className="text-white font-medium">{anime.studios.nodes[0].name}</p>
                                            </div>
                                        )}
                                        {anime.startDate?.year && (
                                            <div className="space-y-1">
                                                <p className="text-xs text-white/60 uppercase tracking-wider">Released</p>
                                                <p className="text-white font-medium">
                                                    {anime.startDate.month}/{anime.startDate.day}/{anime.startDate.year}
                                                </p>
                                            </div>
                                        )}
                                        {anime.duration && (
                                            <div className="space-y-1">
                                                <p className="text-xs text-white/60 uppercase tracking-wider">Duration</p>
                                                <p className="text-white font-medium">{anime.duration} min</p>
                                            </div>
                                        )}
                                        {anime.popularity && (
                                            <div className="space-y-1">
                                                <p className="text-xs text-white/60 uppercase tracking-wider">Popularity</p>
                                                <p className="text-white font-medium">#{anime.popularity}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
