"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    ArrowLeft,
    Save,
    Globe,
    Eye,
    Calendar,
    Image,
    Bold,
    Italic,
    List,
    ListOrdered,
    Link,
    Heading1,
    Heading2,
    Quote,
    Code,
    AlignLeft,
    X,
    Plus,
    Upload,
    FileText,
    Tag as TagIcon,
    Folder,
    ChevronDown,
    Clock,
    EyeOff,
    Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LinkNext from "next/link";
import { useRouter } from "next/navigation";
import { usePosts, usePostTags, usePostCategories } from "@/hooks/usePosts";
import { Post, Category } from "@/lib/api";
import { aiAPI } from "@/lib/api/domains/ai";
import { MediaPickerModal } from "@/components/dashboard/media-picker-modal";
import { Loader2, Sparkles } from "lucide-react";

interface PostFormProps {
    isEdit?: boolean;
    initialData?: Post;
}

type Visibility = "public" | "private" | "password";

export function PostForm({ isEdit, initialData }: PostFormProps) {
    const router = useRouter();
    const { createPost, updatePost, isCreating, isUpdating } = usePosts();
    const { data: tags = [] } = usePostTags();
    const { data: categories = [] } = usePostCategories();

    const editorRef = useRef<HTMLDivElement>(null);

    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
    const [tagInput, setTagInput] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>(
        initialData?.tags?.map(t => t.name) || []
    );
    const [status, setStatus] = useState(initialData?.status || "draft");
    const [postType, setPostType] = useState(initialData?.type || "article");
    const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
    const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
    const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
    const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");
    const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
    const [keywordInput, setKeywordInput] = useState("");
    const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt || "");
    const [allowComments, setAllowComments] = useState(initialData?.allowComments ?? true);
    const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
    const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
    const [isIndexed, setIsIndexed] = useState(initialData?.isIndexed ?? true);
    const [visibility, setVisibility] = useState<Visibility>("public");
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
        initialData?.scheduledAt ? new Date(initialData.scheduledAt) : undefined
    );
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<"featured" | "content">("content");
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [aiInput, setAiInput] = useState("");
    const [aiResult, setAiResult] = useState("");
    const [aiMode, setAiMode] = useState<"titles" | "content" | "seo" | "excerpt" | "ideas">("titles");

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!aiResult || aiLoading) return;
        switch (aiMode) {
            case "titles":
            case "ideas":
            case "content":
                break;
            case "seo": {
                const lines = aiResult.split("\n").filter(Boolean);
                lines.forEach((line) => {
                    const lower = line.toLowerCase();
                    if (lower.includes("seo title") || lower.startsWith("1")) {
                        const val = line.replace(/^[\d.)\s-]*seo title:?\s*/i, "").replace(/^[\d.)\s-]+/, "").trim();
                        if (val && val.length < 100) setSeoTitle(val);
                    } else if (lower.includes("meta") || lower.startsWith("2")) {
                        const val = line.replace(/^[\d.)\s-]*meta description:?\s*/i, "").replace(/^[\d.)\s-]+/, "").trim();
                        if (val) setSeoDescription(val);
                    } else if (lower.includes("keyword") || lower.startsWith("3") || lower.startsWith("-")) {
                        const kw = line.replace(/^[\d.)\s-]*keywords?:?\s*/i, "").replace(/^[\d.)\s-]+/, "").trim();
                        if (kw) {
                            const parsed = kw.split(",").map((s) => s.trim()).filter(Boolean);
                            setKeywords((prev) => [...new Set([...prev, ...parsed])]);
                        }
                    }
                });
                break;
            }
            case "excerpt":
                setExcerpt(aiResult.replace(/^["']|["']$/g, "").trim());
                break;
        }
    }, [aiResult, aiLoading, aiMode]);

    // Auto-generate slug
    useEffect(() => {
        if (!isEdit && title) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    }, [title, isEdit]);

    const addTag = useCallback((name: string) => {
        const trimmed = name.trim();
        if (trimmed && !selectedTags.includes(trimmed)) {
            setSelectedTags(prev => [...prev, trimmed]);
        }
        setTagInput("");
    }, [selectedTags]);

    const removeTag = useCallback((name: string) => {
        setSelectedTags(prev => prev.filter(t => t !== name));
    }, []);

    const handleEditorCommand = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    }, []);

    const handleEditorInput = useCallback(() => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    }, []);

    const insertLink = useCallback(() => {
        const url = prompt("Enter URL:");
        if (url) handleEditorCommand("createLink", url);
    }, [handleEditorCommand]);

    const insertImage = useCallback(() => {
        setMediaPickerTarget("content");
        setMediaPickerOpen(true);
    }, []);

    const handleMediaSelect = useCallback((url: string) => {
        if (mediaPickerTarget === "content") {
            handleEditorCommand("insertImage", url);
        } else {
            setFeaturedImage(url);
        }
    }, [mediaPickerTarget, handleEditorCommand]);

    const addKeyword = useCallback((kw: string) => {
        const trimmed = kw.trim().toLowerCase();
        if (trimmed && !keywords.includes(trimmed)) {
            setKeywords(prev => [...prev, trimmed]);
        }
        setKeywordInput("");
    }, [keywords]);

    const removeKeyword = useCallback((kw: string) => {
        setKeywords(prev => prev.filter(k => k !== kw));
    }, []);

    const handleSubmit = () => {
        if (!title.trim()) return;

        const postData = {
            title: title.trim(),
            slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            content,
            excerpt: excerpt.trim(),
            type: postType,
            status: scheduledDate && status === "published" ? "scheduled" : status,
            categoryId: categoryId || undefined,
            tags: selectedTags,
            featuredImage: featuredImage || undefined,
            featuredImageAlt: featuredImageAlt || undefined,
            seoTitle: seoTitle || undefined,
            seoDescription: seoDescription || undefined,
            canonicalUrl: canonicalUrl || undefined,
            keywords: keywords.length > 0 ? keywords : undefined,
            isFeatured,
            isPinned,
            isIndexed,
            allowComments,
            scheduledAt: scheduledDate?.toISOString(),
        };

        if (isEdit && initialData?.id) {
            updatePost(initialData.id, postData, {
                onSuccess: () => router.push("/dashboard/posts"),
            });
        } else {
            createPost(postData, {
                onSuccess: () => router.push("/dashboard/posts"),
            });
        }
    };

    const handlePublish = () => {
        setStatus("published");
        if (isEdit && initialData?.id) {
            updatePost(initialData.id, {
                ...getCurrentPostData(),
                status: scheduledDate ? "scheduled" : "published",
            }, {
                onSuccess: () => router.push("/dashboard/posts"),
            });
        } else {
            createPost({
                ...getCurrentPostData(),
                status: scheduledDate ? "scheduled" : "published",
            }, {
                onSuccess: () => router.push("/dashboard/posts"),
            });
        }
    };

    const getCurrentPostData = () => ({
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        content,
        excerpt: excerpt.trim(),
        type: postType,
        status,
        categoryId: categoryId || undefined,
        tags: selectedTags,
        featuredImage: featuredImage || undefined,
        featuredImageAlt: featuredImageAlt || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        canonicalUrl: canonicalUrl || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
        isFeatured,
        isPinned,
        isIndexed,
        allowComments,
        scheduledAt: scheduledDate?.toISOString(),
    });

    const existingTags = tags.map((t: any) => t.name);
    const filteredTagSuggestions = existingTags.filter(
        (t: string) => !selectedTags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
    );

    const selectedCategory = categories.find((c: Category) => c.id === categoryId);

    const runAi = useCallback(async (mode: typeof aiMode, prompt: string) => {
        setAiMode(mode);
        setAiLoading(mode);
        setAiResult("");
        try {
            const pageKey = "posts";
            let message = "";
            switch (mode) {
                case "titles":
                    message = `Suggest 5 blog post titles${prompt ? ` about: ${prompt}` : ""}. Return them as a numbered list.`;
                    break;
                case "content":
                    message = `Write a blog post${prompt ? ` about: ${prompt}` : ` with the title "${title}"`}. Include an introduction, main points, and conclusion. Use proper HTML formatting with <h2>, <p>, <ul> tags.`;
                    break;
                case "seo":
                    message = `For a blog post titled "${title}"${prompt ? ` about ${prompt}` : ""}, suggest: 1) SEO title (max 60 chars), 2) Meta description (max 160 chars), 3) 5-7 keywords. Format clearly.`;
                    break;
                case "excerpt":
                    message = `Write a compelling 2-3 sentence excerpt for a blog post titled "${title}"${prompt ? ` about ${prompt}` : ""}. Keep under 160 characters.`;
                    break;
                case "ideas":
                    message = `Suggest 5 blog post topic ideas${prompt ? ` related to: ${prompt}` : " for a software development company"}. Include a brief description for each.`;
                    break;
            }
            const res = await aiAPI.generate(message, pageKey);
            setAiResult(res.response);
        } catch {
            setAiResult("Failed to generate. Check your connection and try again.");
        } finally {
            setAiLoading(null);
        }
    }, [title]);

    if (!mounted) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full -ml-2 h-10 w-10 hover:bg-muted/60">
                        <LinkNext href="/dashboard/posts">
                            <ArrowLeft className="w-5 h-5" />
                        </LinkNext>
                    </Button>
                    <div>
                        <h1 className="text-[28px] font-[600] tracking-tight">{isEdit ? "Edit Post" : "New Post"}</h1>
                        <p className="text-[13px] text-muted-foreground/80 mt-0.5">
                            {isEdit ? "Update your article content" : "Create a new article for your blog"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" onClick={() => setPreviewModalOpen(true)} className="rounded-full h-9 px-4 text-[13px] gap-2 shadow-sm">
                        <Eye className="w-4 h-4" />
                        Preview
                    </Button>
                    <Button variant="outline" onClick={handleSubmit} disabled={isCreating || isUpdating} className="rounded-full h-9 px-4 text-[13px] gap-2 shadow-sm">
                        <Save className="w-4 h-4" />
                        Save Draft
                    </Button>
                    <Button onClick={handlePublish} disabled={isCreating || isUpdating} className="rounded-full h-9 px-5 text-[13px] gap-2 shadow-sm shadow-primary/10">
                        <Globe className="w-4 h-4" />
                        {scheduledDate ? "Schedule" : "Publish"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
                {/* Main Content */}
                <div className="space-y-8">
                    {/* Title */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <Input placeholder="Add title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-[42px] font-[700] tracking-tight leading-[1.1] border-0 focus-visible:ring-0 h-auto py-1 placeholder:text-muted-foreground/40"
                                />
                                <div className="flex items-center gap-2 text-[13px] text-muted-foreground/60 px-0.5 mt-2">
                                    <Globe className="w-3.5 h-3.5" />
                                    <span className="text-muted-foreground/30">/</span>
                                    <input value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="bg-transparent border-none outline-none text-[13px] text-muted-foreground/60 focus:text-foreground/80 transition-colors"
                                        placeholder="post-url-slug"
                                    />
                                </div>
                            </div>
                            <button type="button"
                                onClick={async () => {
                                    if (!title.trim() || aiLoading) return;
                                    setAiLoading("full");
                                    try {
                                        const [excerptRes, contentRes, seoRes] = await Promise.all([
                                            aiAPI.generate(`Write a 2-3 sentence excerpt for a blog post titled "${title}". Keep it under 160 characters. Sound authentic and specific — no generic fluff.`, "posts"),
                                            aiAPI.generate(`Write a complete blog post for the title: "${title}". Write like a real industry expert — specific, detailed, authentic. Include an introduction, 3-4 main sections with practical insights, and a conclusion. Use natural paragraph breaks. Format in HTML with <h2> for headings and <p> for paragraphs. Make it 500-800 words of genuinely useful content.`, "posts"),
                                            aiAPI.generate(`For a blog post titled "${title}", generate: SEO title (max 60 chars), meta description (max 160 chars), and 5 relevant keywords. Label each clearly.`, "posts"),
                                        ]);
                                        setExcerpt(excerptRes.response.replace(/^["']|["']$/g, "").trim());
                                        setContent(contentRes.response);
                                        const lines = seoRes.response.split("\n").filter(Boolean);
                                        lines.forEach((line) => {
                                            const l = line.toLowerCase();
                                            if ((l.includes("seo title") || /^\d/.test(line)) && line.length < 80) {
                                                setSeoTitle(line.replace(/^[\d.)\s-]*seo title:?\s*/i, "").replace(/^[\d.)\s-]+/, "").trim());
                                            } else if (l.includes("meta") || (l.includes("description") && !l.includes("seo"))) {
                                                setSeoDescription(line.replace(/^[\d.)\s-]*meta description:?\s*/i, "").replace(/^[\d.)\s-]+/, "").trim());
                                            } else if (l.includes("keyword")) {
                                                const kw = line.replace(/^[\d.)\s-]*keywords?:?\s*/i, "").replace(/^[\d.)\s-]+/, "").trim();
                                                if (kw) setKeywords((prev) => [...new Set([...prev, ...kw.split(",").map((s) => s.trim()).filter(Boolean)])]);
                                            }
                                        });
                                    } catch { } finally {
                                        setAiLoading(null);
                                    }
                                }}
                                disabled={!title.trim() || !!aiLoading}
                                className="shrink-0 flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[13px] font-[500] shadow-sm hover:shadow-md hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none transition-all mt-0.5"
                            >
                                {aiLoading === "full" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {aiLoading === "full" ? "Generating..." : "Generate Post"}
                            </button>
                        </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div className="bg-card rounded-2xl border border-border/40 shadow-sm">
                        <div className="px-5 pt-4 pb-3 border-b border-border/30">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-[500] text-muted-foreground/70">Content</span>
                                <div className="flex items-center gap-0.5">
                                    <ToolbarButton onClick={() => handleEditorCommand("bold")} title="Bold">
                                        <Bold className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <ToolbarButton onClick={() => handleEditorCommand("italic")} title="Italic">
                                        <Italic className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <span className="w-px h-4 bg-border/40 mx-1" />
                                    <ToolbarButton onClick={() => handleEditorCommand("formatBlock", "<h1>")} title="Heading 1">
                                        <Heading1 className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <ToolbarButton onClick={() => handleEditorCommand("formatBlock", "<h2>")} title="Heading 2">
                                        <Heading2 className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <ToolbarButton onClick={() => handleEditorCommand("formatBlock", "<p>")} title="Paragraph">
                                        <FileText className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <span className="w-px h-4 bg-border/40 mx-1" />
                                    <ToolbarButton onClick={() => handleEditorCommand("insertUnorderedList")} title="Bullet List">
                                        <List className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <ToolbarButton onClick={() => handleEditorCommand("insertOrderedList")} title="Numbered List">
                                        <ListOrdered className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <span className="w-px h-4 bg-border/40 mx-1" />
                                    <ToolbarButton onClick={insertLink} title="Insert Link">
                                        <Link className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <ToolbarButton onClick={() => handleEditorCommand("formatBlock", "<blockquote>")} title="Blockquote">
                                        <Quote className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <ToolbarButton onClick={() => handleEditorCommand("formatBlock", "<pre>")} title="Code">
                                        <Code className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <ToolbarButton onClick={insertImage} title="Insert Image">
                                        <Image className="w-3.5 h-3.5" />
                                    </ToolbarButton>
                                    <span className="w-px h-4 bg-border/40 mx-1" />
                                    <ToolbarButton onClick={() => { setAiMode("content"); setAiInput(""); setAiResult(""); setAiDialogOpen(true); }} title="AI Content Assistant">
                                        <Sparkles className="w-3.5 h-3.5 text-purple-500/70" />
                                    </ToolbarButton>
                                </div>
                            </div>
                        </div>
                        <div className="p-5">
                            <div ref={editorRef}
                                contentEditable onInput={handleEditorInput}
                                dangerouslySetInnerHTML={{ __html: content }}
                                className="min-h-[600px] focus:outline-none prose prose-sm dark:prose-invert max-w-none text-base leading-relaxed"
                                data-placeholder="Start writing..."
                            />
                            <div className="flex items-center justify-end gap-4 mt-4 pt-3 border-t border-border/20 text-[12px] text-muted-foreground/50">
                                <span>{content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words</span>
                                <span>{content.replace(/<[^>]*>/g, '').length} characters</span>
                            </div>
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-[13px] font-[500] text-muted-foreground/70">Excerpt</h3>
                                <p className="text-[12px] text-muted-foreground/50 mt-0.5">Write a short summary for listings and SEO</p>
                            </div>
                            <button type="button" onClick={() => runAi("excerpt", excerpt)}
                                disabled={!!aiLoading || !title}
                                className="flex items-center gap-1.5 text-[12px] text-muted-foreground/50 hover:text-purple-500 disabled:opacity-30 transition-colors px-2.5 py-1 rounded-full hover:bg-purple-500/5"
                            >
                                {aiLoading === "excerpt" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                Generate
                            </button>
                        </div>
                        <Textarea value={aiLoading === "excerpt" ? "Generating..." : excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Brief summary of your article..."
                            className="min-h-[80px] text-[14px] rounded-xl border-border/40 focus-visible:ring-primary/20"
                        />
                    </div>

                    {/* SEO */}
                    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-[13px] font-[500] text-muted-foreground/70">SEO Settings</h3>
                                <p className="text-[12px] text-muted-foreground/50 mt-0.5">Customize how this post appears in search results</p>
                            </div>
                            <button type="button" onClick={() => runAi("seo", title)}
                                disabled={!!aiLoading || !title}
                                className="flex items-center gap-1.5 text-[12px] text-muted-foreground/50 hover:text-purple-500 disabled:opacity-30 transition-colors px-2.5 py-1 rounded-full hover:bg-purple-500/5"
                            >
                                {aiLoading === "seo" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                Auto-Generate
                            </button>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-[400] text-muted-foreground/80">SEO Title</Label>
                            <Input value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                                placeholder={title || "SEO title..."}
                                className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-[400] text-muted-foreground/80">Meta Description</Label>
                            <Textarea value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                                placeholder="Brief description for search engines..."
                                className="min-h-[60px] rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-[400] text-muted-foreground/80">Canonical URL</Label>
                            <Input value={canonicalUrl}
                                onChange={(e) => setCanonicalUrl(e.target.value)}
                                placeholder="https://oftisoft.com/blog/post-slug"
                                className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-[400] text-muted-foreground/80">Keywords</Label>
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                                {keywords.map((kw) => (
                                    <Badge key={kw} variant="secondary" className="gap-1 text-[12px] rounded-full px-2.5 py-0.5 font-[400]">
                                        {kw}
                                        <button onClick={() => removeKeyword(kw)} className="hover:text-destructive ml-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    placeholder="Add keyword..."
                                    className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px]"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addKeyword(keywordInput);
                                        }
                                    }}
                                />
                                <Button variant="outline" size="icon" onClick={() => addKeyword(keywordInput)} className="rounded-xl shrink-0">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Publish Settings */}
                    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5 space-y-4">
                        <h3 className="text-[13px] font-[500] flex items-center gap-2 text-muted-foreground/70">
                            <Globe className="w-4 h-4" />
                            Publish
                        </h3>
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-[400] text-muted-foreground/80">Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                                <SelectTrigger className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="pending_review">Pending Review</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-[400] text-muted-foreground/80">Visibility</Label>
                            <Select value={visibility} onValueChange={(v: Visibility) => setVisibility(v)}>
                                <SelectTrigger className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                    <SelectItem value="password">Password Protected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {status === "published" && (
                            <div className="space-y-1.5">
                                <Label className="text-[13px] font-[400] text-muted-foreground/80">Schedule Publish</Label>
                                <Input type="datetime-local"
                                    value={scheduledDate ? scheduledDate.toISOString().slice(0, 16) : ""}
                                    onChange={(e) => setScheduledDate(e.target.value ? new Date(e.target.value) : undefined)}
                                    className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px] h-9"
                                />
                            </div>
                        )}
                        <div className="h-px bg-border/30" />
                        <div className="flex items-center justify-between">
                            <Label htmlFor="featured" className="cursor-pointer text-[13px] font-[400]">Featured Post</Label>
                            <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} className="scale-75" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="pinned" className="cursor-pointer text-[13px] font-[400]">Pinned Post</Label>
                            <Switch id="pinned" checked={isPinned} onCheckedChange={setIsPinned} className="scale-75" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="indexed" className="cursor-pointer text-[13px] font-[400]">Search Engine Indexed</Label>
                            <Switch id="indexed" checked={isIndexed} onCheckedChange={setIsIndexed} className="scale-75" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="comments" className="cursor-pointer text-[13px] font-[400]">Allow Comments</Label>
                            <Switch id="comments" checked={allowComments} onCheckedChange={setAllowComments} className="scale-75" />
                        </div>
                    </div>

                    {/* Post Type */}
                    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5 space-y-3">
                        <h3 className="text-[13px] font-[500] flex items-center gap-2 text-muted-foreground/70">
                            <FileText className="w-4 h-4" />
                            Post Type
                        </h3>
                        <Select value={postType} onValueChange={(v) => setPostType(v as typeof postType)}>
                            <SelectTrigger className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px] h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="article">Article</SelectItem>
                                <SelectItem value="tutorial">Tutorial</SelectItem>
                                <SelectItem value="case_study">Case Study</SelectItem>
                                <SelectItem value="news">News</SelectItem>
                                <SelectItem value="announcement">Announcement</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category */}
                    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5 space-y-3">
                        <h3 className="text-[13px] font-[500] flex items-center gap-2 text-muted-foreground/70">
                            <Folder className="w-4 h-4" />
                            Category
                        </h3>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px] h-9">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                                {categories.map((cat: Category) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedCategory && (
                            <div>
                                <Badge variant="secondary" className="rounded-full text-[12px] font-[400] px-2.5 py-0.5">{selectedCategory.name}</Badge>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5 space-y-3">
                        <h3 className="text-[13px] font-[500] flex items-center gap-2 text-muted-foreground/70">
                            <TagIcon className="w-4 h-4" />
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {selectedTags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="gap-1 text-[12px] rounded-full px-2.5 py-0.5 font-[400]">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-destructive ml-0.5">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Add tag..."
                                className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px] h-9"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addTag(tagInput);
                                    }
                                }}
                            />
                            <Button variant="outline" size="icon" onClick={() => addTag(tagInput)} className="rounded-xl shrink-0 h-9 w-9">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {tagInput && filteredTagSuggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {filteredTagSuggestions.slice(0, 5).map((tag: string) => (
                                    <button key={tag}
                                        onClick={() => addTag(tag)}
                                        className="text-[12px] text-muted-foreground/70 hover:text-foreground bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-full transition-colors"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Featured Image */}
                    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5 space-y-3">
                        <h3 className="text-[13px] font-[500] flex items-center gap-2 text-muted-foreground/70">
                            <Image className="w-4 h-4" />
                            Featured Image
                        </h3>
                        {featuredImage ? (
                            <div className="relative rounded-xl overflow-hidden group">
                                <img src={featuredImage}
                                    alt={featuredImageAlt || "Featured"}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button variant="secondary"
                                        size="sm"
                                        onClick={() => { setMediaPickerTarget("featured"); setMediaPickerOpen(true); }}
                                        className="rounded-full h-8 text-[12px] px-3"
                                    >
                                        Replace
                                    </Button>
                                    <Button variant="destructive"
                                        size="sm"
                                        onClick={() => setFeaturedImage("")}
                                        className="rounded-full h-8 text-[12px] px-3"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => { setMediaPickerTarget("featured"); setMediaPickerOpen(true); }}
                                className="border-2 border-dashed border-border/30 rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer"
                            >
                                <Upload className="w-7 h-7 mx-auto mb-2 text-muted-foreground/40" />
                                <p className="text-[13px] text-muted-foreground/60">Click to choose image</p>
                            </div>
                        )}
                        {featuredImage && (
                            <Input value={featuredImageAlt}
                                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                                placeholder="Alt text for featured image..."
                                className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[13px] h-9"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Media Picker Modal */}
            <MediaPickerModal open={mediaPickerOpen}
                onOpenChange={setMediaPickerOpen}
                onSelect={handleMediaSelect}
                title={mediaPickerTarget === "featured" ? "Select Featured Image" : "Insert Image"}
            />

            {/* Preview Modal */}
            <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-[600]">
                            <Eye className="w-5 h-5" />
                            Preview: {title || "Untitled"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="prose prose-sm dark:prose-invert max-w-none px-1">
                        {featuredImage && (
                            <img src={featuredImage} alt="Featured" className="w-full rounded-xl mb-6 max-h-[300px] object-cover" />
                        )}
                        <h1 className="text-[28px] font-[600] tracking-tight">{title || "Untitled"}</h1>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                            <span>{excerpt ? `${excerpt.slice(0, 100)}...` : "No excerpt"}</span>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: content || "<p>No content yet</p>" }} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* AI Floating Button */}
            <button type="button" onClick={() => { setAiDialogOpen(true); setAiResult(""); setAiInput(""); }}
                className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                title="AI Assistant"
            >
                <Sparkles className="w-5 h-5" />
            </button>

            {/* AI Assistant Dialog */}
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-[600]">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            AI Assistant
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Mode selector */}
                        <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl">
                            {([
                                { key: "titles", label: "Titles" },
                                { key: "content", label: "Content" },
                                { key: "seo", label: "SEO" },
                                { key: "excerpt", label: "Excerpt" },
                                { key: "ideas", label: "Ideas" },
                            ] as const).map((m) => (
                                <button key={m.key} type="button" onClick={() => { setAiMode(m.key); setAiResult(""); }}
                                    className={`flex-1 text-[12px] font-[500] py-1.5 px-2 rounded-lg transition-all ${aiMode === m.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground/60 hover:text-foreground/80"}`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="space-y-1.5">
                            <Label className="text-[13px] font-[400] text-muted-foreground/70">
                                {aiMode === "titles" && "Describe your blog topic for title suggestions"}
                                {aiMode === "content" && "Describe what you want the content to cover"}
                                {aiMode === "seo" && "Topic or focus for SEO generation"}
                                {aiMode === "excerpt" && "Optional focus for the excerpt"}
                                {aiMode === "ideas" && "Topic area for blog post ideas"}
                            </Label>
                            <div className="flex gap-2">
                                <Input value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    placeholder={aiMode === "titles" ? "e.g. AI in healthcare..." : aiMode === "content" ? "e.g. Benefits of Next.js..." : "Optional context..."}
                                    className="rounded-xl border-border/40 focus-visible:ring-primary/20 text-[14px]"
                                    onKeyDown={(e) => { if (e.key === "Enter" && !aiLoading) { e.preventDefault(); runAi(aiMode, aiInput); } }}
                                />
                                <Button onClick={() => runAi(aiMode, aiInput)} disabled={!!aiLoading}
                                    className="rounded-xl gap-1.5 text-[13px] shadow-sm"
                                >
                                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    Generate
                                </Button>
                            </div>
                        </div>

                        {/* Result */}
                        {aiLoading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                            </div>
                        )}
                        {aiResult && !aiLoading && (
                            <div className="space-y-3">
                                <div className="text-[13px] font-[500] text-muted-foreground/70">Result</div>
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-[14px] leading-relaxed whitespace-pre-wrap">
                                    {aiResult}
                                </div>
                                <div className="flex gap-2 justify-end">
                                    {aiMode === "titles" && title && (
                                        <Button variant="outline" size="sm" className="rounded-full text-[12px] h-8"
                                            onClick={() => {
                                                const match = aiResult.match(/["""]([^"""]+)["""]/);
                                                if (match) setTitle(match[1]);
                                            }}
                                        >
                                            Use as Title
                                        </Button>
                                    )}
                                    {aiMode === "excerpt" && (
                                        <Button variant="outline" size="sm" className="rounded-full text-[12px] h-8"
                                            onClick={() => { setExcerpt(aiResult.replace(/^["']|["']$/g, "").trim()); setAiDialogOpen(false); }}
                                        >
                                            Apply Excerpt
                                        </Button>
                                    )}
                                    {aiMode === "content" && (
                                        <Button variant="outline" size="sm" className="rounded-full text-[12px] h-8"
                                            onClick={() => {
                                                const htmlMatch = aiResult.match(/<([a-z][a-z0-9]*)\b[^>]*>[\s\S]*?<\/\1>/i);
                                                if (htmlMatch) {
                                                    setContent((prev) => prev + htmlMatch[0]);
                                                } else {
                                                    setContent((prev) => prev + "<p>" + aiResult.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br />") + "</p>");
                                                }
                                                setAiDialogOpen(false);
                                            }}
                                        >
                                            Insert Content
                                        </Button>
                                    )}
                                    {aiMode === "seo" && (
                                        <Button variant="outline" size="sm" className="rounded-full text-[12px] h-8"
                                            onClick={() => { setAiDialogOpen(false); }}
                                        >
                                            Applied to SEO Fields
                                        </Button>
                                    )}
                                    {aiMode === "ideas" && (
                                        <Button variant="outline" size="sm" className="rounded-full text-[12px] h-8"
                                            onClick={() => {
                                                const match = aiResult.match(/\d+\.\s*["""]?([^""""\n]+)["""]?/);
                                                if (match) setTitle(match[1]);
                                            }}
                                        >
                                            Use First as Title
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ToolbarButton({
    children,
    onClick,
    title,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
}) {
    return (
        <button type="button"
            onClick={onClick}
            title={title}
            className="p-1.5 rounded-lg hover:bg-muted/70 transition-all text-muted-foreground/60 hover:text-foreground/80"
        >
            {children}
        </button>
    );
}
