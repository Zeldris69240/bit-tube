"use client";

import { Button } from "@/components/ui/button";
import { z } from "zod";
import { trpc } from "@/trpc/client";
import { useForm } from "react-hook-form";
import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBoundary } from "react-error-boundary";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Form,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import { CopyCheckIcon, CopyIcon, Globe2Icon, ImagePlusIcon, LockIcon, MoreVerticalIcon, RotateCcwIcon, SparklesIcon, TrashIcon } from "lucide-react";
import { videosUpdateSchema } from "@/db/schema";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";
import { APP_URL } from "@/constants";

interface FormSectionProps {
    videoId: string;
};

export const FormSection = ({ videoId }: FormSectionProps) => {
    return (
        <Suspense fallback={<FormSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <FormSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
};

const FormSectionSkeleton = () => {
    return <p>Loading...</p>
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
    const router = useRouter();
    const utils = trpc.useUtils();

    const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);

    const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
    const [categories] = trpc.categories.getMany.useSuspenseQuery();

    const update = trpc.videos.update.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: videoId });
            toast.success("Video updated successfully");
        },
        onError: () => {
            toast.error("Something went wrong");
        },
    });
    
    const remove = trpc.videos.remove.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            toast.success("Video removed successfully");
            router.push("/studio");
        },
        onError: () => {
            toast.error("Something went wrong");
        },
    });

    const revalidate = trpc.videos.revalidate.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: videoId });
            toast.success("Video revalidated");
        },
        onError: () => {
            toast.error("Something went wrong");
        },
    });


    const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: videoId });
            toast.success("thumbnail restored");
        },
        onError: () => {
            toast.error("Something went wrong");
        },
    });

    const form = useForm<z.infer<typeof videosUpdateSchema>>({
        resolver: zodResolver(videosUpdateSchema),
        defaultValues: video,
    });

    const onSubmit = (data: z.infer<typeof videosUpdateSchema>) => {
        update.mutate(data);
    };

    //Change if Deploying outside of Vercel
    const fullUrl = `${APP_URL || "http://localhost:3000"}/videos/${videoId}`;
    const [isCopied, setIsCopied] = useState(false);

    const onCopy = async() => {
        await navigator.clipboard.writeText(fullUrl);
        setIsCopied(true);

        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };

    return (
        <>
            <ThumbnailUploadModal 
            open={thumbnailModalOpen}
            onOpenChange={setThumbnailModalOpen}
            videoId={videoId}
            />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Video Details</h1>
                            <p className="text-xs text-gray-500">Manage Your video details </p>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <Button type="submit" disabled={update.isPending}>
                            Save  
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVerticalIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => revalidate.mutate({ id: videoId})}>
                                        <RotateCcwIcon className="size-4 mr-2" />
                                        Revalidate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => remove.mutate({ id: videoId})}>
                                        <TrashIcon className="size-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="space-y-8 lg:col-span-3">
                            <FormField 
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Title 
                                            {/* Todo: Add ai generate button*/}
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                            {...field}
                                            placeholder="Enter video title"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Description 
                                            {/* Todo: Add ai generate button*/}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea 
                                            {...field}
                                            value={field.value?? ""}
                                            rows={10}
                                            className="resize-none pr-10"
                                            placeholder="Video Description"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                            name="thumbnailUrl"
                            control={form.control}
                            render={() => (
                                <FormItem>
                                    <FormLabel>
                                        Thumbnail
                                    </FormLabel>
                                    <FormControl>
                                        <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                                            <Image 
                                                src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
                                                className="object-cover"
                                                alt="thumbnail"
                                                fill
                                            />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                    type="button"
                                                    size="icon"
                                                    className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                                                    >
                                                        <MoreVerticalIcon className="text-white" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" side="right">
                                                    <DropdownMenuItem onClick={() => setThumbnailModalOpen(true)}>
                                                    <ImagePlusIcon className="size-4 mr-1" />
                                                    Change
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                    <SparklesIcon className="size-4 mr-1" />
                                                    AI-Generated
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => restoreThumbnail.mutate({ id: videoId })}>
                                                    <RotateCcwIcon className="size-4 mr-1" />
                                                    Restore
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>                                             
                                            </DropdownMenu>
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                            />
                            <FormField 
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Category
                                        </FormLabel>
                                        <Select onValueChange={field.onChange}
                                            defaultValue={field.value ?? undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                            ))};
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-y-8 lg:col-span-2">
                            <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                                <div className="aspect-video overflow-hidden relative">
                                    <VideoPlayer 
                                    playbackId={video.muxPlaybackId}
                                    thumbnailUrl={video.thumbnailUrl}
                                    />
                                </div>
                                <div className="p-4 flex flex-col gap-y-6">
                                    <div className="flex justify-between items-center gap-x-2">
                                        <p>Video Link</p>
                                        <div className="flex items-center gap-x-2">
                                            <Link href={`/videos/${video.id}`}>
                                            <p className="line-clamp-1 text-sm text-blue-500">
                                                {}
                                            </p>
                                            </Link>
                                            <Button 
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={onCopy}
                                            disabled={isCopied}
                                            >
                                                {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-y-1">
                                    <p className="text-muted-foreground text-xs">
                                        Video Status
                                    </p>
                                    <p className="text-sm">
                                        {snakeCaseToTitle(video.muxStatus || "preparing")}
                                    </p>
                                </div>
                                </div>
                                <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-y-1">
                                    <p className="text-muted-foreground text-xs">
                                        Subtitle Status
                                    </p>
                                    <p className="text-sm">
                                        {snakeCaseToTitle(video.muxTrackStatus || "no_subtitles")}
                                    </p>
                                </div>
                                </div>
                            </div>
                            <FormField 
                                control={form.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Visibility
                                        </FormLabel>
                                        <Select onValueChange={field.onChange}
                                            defaultValue={field.value ?? undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select visibility" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="public">
                                                <div className="flex items-center">
                                                <Globe2Icon className="size-4 mr-2" />
                                                Public
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="private">
                                            <div className="flex items-center">
                                                <LockIcon className="size-4 mr-2" />
                                                Private
                                            </div>
                                            </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </form>
            </Form>
        </>
    );
};