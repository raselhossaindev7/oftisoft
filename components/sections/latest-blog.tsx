"use client"
import { AnimatedDiv } from "@/lib/animated";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { postsAPI, Post } from "@/lib/api";
import { format, isValid } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";

const gradients = [
  "from-blue-600 via-indigo-600 to-violet-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-orange-500 via-pink-500 to-rose-600",
  "from-purple-600 via-pink-500 to-red-500",
  "from-cyan-500 via-blue-500 to-indigo-600",
  "from-amber-500 via-orange-500 to-red-600",
];

function formatDate(value: string | undefined | null) {
  if (!value) return "";
  const d = new Date(value);
  return isValid(d) ? format(d, "MMM d, yyyy") : "";
}

export default function LatestBlog() {
  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts-latest"],
    queryFn: () => postsAPI.getPosts({ status: "published", limit: 6 }),
  });

  const apiPosts = data?.posts || [];
  const posts = apiPosts.map((post: Post, i: number) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage || "",
    category: post.category?.name || post.categoryId || "Uncategorized",
    date: formatDate(post.publishedAt) || formatDate(post.createdAt),
    readTime: `${post.readTime} min`,
    gradient: post.gradient || gradients[i % gradients.length],
  }));

  const blogContent = {
    title: "Insights from the",
    subtitle: "Bleeding Edge.",
    badge: "Thought Leadership",
    posts: posts.length > 0 ? posts : [
      {
        id: "1",
        slug: "ai-web-dev",
        title: "The Agentic Web: How AI is Rewriting the Frontend",
        excerpt:
          "Why traditional UI components are being replaced by generative interfaces.",
        category: "Deep Tech",
        date: "Oct 15, 2026",
        readTime: "5 min",
        gradient: "from-blue-600 via-indigo-600 to-violet-600",
      },
    ],
  };

  const swiperRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevSlide = () => swiperRef.current?.slidePrev();
  const nextSlide = () => swiperRef.current?.slideNext();

  return (
    <section ref={containerRef}
      className="py-24 md:py-32 bg-transparent relative overflow-hidden z-10"
      id="blog"
    >
      {/* Texture */}
      <div className="absolute inset-0 bg-grain opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6 md:gap-8">
          <AnimatedDiv initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-auto"
            style={{ willChange: "transform, opacity" }}
          >
            <Badge variant="outline"
              className="mb-4 border-primary/20 text-primary tracking-wide px-3 py-1 font-semibold text-xs"
            >
              {blogContent.badge}
            </Badge>
            <h3 className="type-h1 text-white">
              {blogContent.title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {blogContent.subtitle}
              </span>
            </h3>
          </AnimatedDiv>

          <div className="flex items-center gap-4">
            {/* Custom Controls */}
            <div className="flex items-center gap-3 hidden md:flex">
              <Button onClick={prevSlide}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button onClick={nextSlide}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full border-white/10 bg-white/5 hover:bg-white hover:text-black transition-all duration-300"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <Link href="/blog" className="hidden md:block">
              <Button variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10 group"
              >
                View Archive
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Swiper Slider */}
        <div className="relative group/swiper h-full">
          <Swiper modules={[Navigation, Pagination, Autoplay, FreeMode]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={24}
            slidesPerView={1.2}
            breakpoints={{
                640: { slidesPerView: 2.2, spaceBetween: 24 },
                760: { slidesPerView: 2.2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 32 },
              1440: { slidesPerView: 3, spaceBetween: 32 },
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            speed={800}
            className="!overflow-visible h-full"
            grabCursor={true}
            autoHeight={false}
          >
            {blogContent.posts.map((post: any, index: number) => (
              <SwiperSlide key={post.id || post.slug} className="h-full">
                <BlogCard post={post} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Mobile Link & Controls */}
        <div className="mt-12 md:hidden flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <Button onClick={prevSlide}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-white/10 bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button onClick={nextSlide}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-white/10 bg-white/5"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <Link href="/blog">
            <Button variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10 group"
            >
              View Editorial Archive
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlogCard({ post, index }: { post: any; index: number }) {
  const hasImage = !!post.featuredImage;
  return (
    <AnimatedDiv initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="h-full flex flex-col"
      style={{ willChange: "transform, opacity" }}
    >
      <Link href={`/blog/${post.slug}`} className="h-full flex flex-col">
        <Card className="pt-0 group relative flex flex-col h-full justify-between bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 overflow-hidden backdrop-blur-sm rounded-[32px]">
          {/* Image Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {hasImage ? (
              <img src={post.featuredImage}
                alt={post.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-80 transition-transform duration-700 group-hover:scale-105",
                  post.gradient,
                )}
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

            {/* Floating Badge */}
            <div className="absolute top-6 left-6 z-10">
              <Badge variant="secondary"
                className="bg-black/30 backdrop-blur-md border-white/10 text-white font-semibold tracking-wide text-xs hover:bg-black/50 py-1.5 px-4 rounded-full"
              >
                {post.category}
              </Badge>
            </div>

            {/* Corner Icon */}
            <div className="absolute bottom-6 right-6 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-2xl">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          <CardContent className="flex flex-col flex-1 justify-between">
            <div className="flex items-center gap-4 text-caption text-muted-foreground mb-3 font-semibold tracking-wide">
              <span className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-3.5 h-3.5 text-primary" /> {post.date}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-primary" /> {post.readTime}
              </span>
            </div>

                            <h3 className="type-h3 text-white mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {post.title}
            </h3>

            <p className="type-body-sm text-muted-foreground line-clamp-3 font-medium flex-grow">
              {post.excerpt}
            </p>
          </CardContent>

          <CardFooter className="pt-0 mt-auto border-t border-white/5">
            <div className="w-full flex items-center justify-between text-xs font-semibold tracking-wide text-white/30 group-hover:text-white transition-colors">
              <span>Read Story</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </AnimatedDiv>
  );
}
