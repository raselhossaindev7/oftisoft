"use client";

import { useState, useEffect } from "react";
import { 
    ArrowLeft, 
    Save, 
    Layout, 
    FileArchive, 
    ShieldCheck, 
    Globe,
    Zap,
    Plus,
    X,
    Info,
    Tag
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
    SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/lib/api";

interface ProductFormProps {
    isEdit?: boolean;
    initialData?: Product;
}

export function ProductForm({ isEdit, initialData }: ProductFormProps) {
    const router = useRouter();
    const { createProduct, updateProduct, isCreating, isUpdating } = useProducts();
    const { categories = [] } = useCategories();
    
    // Form state
  const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [subcategory, setSubcategory] = useState(initialData?.subcategory || "");
    const [image, setImage] = useState(initialData?.image || "");
    const [features, setFeatures] = useState<string[]>(initialData?.features || [""]);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [screenshots, setScreenshots] = useState<string[]>(initialData?.screenshots || []);
    const [compatibility, setCompatibility] = useState<string[]>(initialData?.compatibility || ["React 18+", "Next.js 15+", "Tailwind 4+"]);
    const [version, setVersion] = useState(initialData?.version || "1.0.0");
    const [updatePolicy, setUpdatePolicy] = useState(initialData?.updatePolicy || "Free lifetime updates");
    const [demoUrl, setDemoUrl] = useState(initialData?.demoUrl || "");
    const [docUrl, setDocUrl] = useState(initialData?.docUrl || "");
    const [licenseRegular, setLicenseRegular] = useState(initialData?.licenseRegular || 49);
    const [licenseExtended, setLicenseExtended] = useState(initialData?.licenseExtended || 599);
    const [price, setPrice] = useState(initialData?.price || 49);

    // Auto-generate slug from name
    useEffect(() => {
        if (!isEdit && name) {
            const generatedSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setSlug(generatedSlug);
        }
    }, [name, isEdit]);

    // When category changes, clear subcategory
    useEffect(() => {
        if (!category) setSubcategory("");
    }, [category]);

    const selectedCategory = categories.find((c) => c.name === category);
    const subcategoryOptions = selectedCategory?.subcategories?.filter(Boolean) || [];

    const addFeature = () => setFeatures([...features, ""]);
    const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
    const updateFeature = (index: number, val: string) => {
        const newFeatures = [...features];
        newFeatures[index] = val;
        setFeatures(newFeatures);
    };

    const addCompatibility = (tech: string) => {
        if (tech && !compatibility.includes(tech)) {
            setCompatibility([...compatibility, tech]);
        }
    };

    const removeCompatibility = (tech: string) => {
        setCompatibility(compatibility.filter(t => t !== tech));
    };

    const handleSave = async () => {
        const productData: Partial<Product> = {
            name,
            slug,
            description,
            category,
            subcategory: (subcategory || "").trim(),
            image: image || "/placeholder-product.jpg",
            features: features.filter(f => f.trim() !== ""),
            tags: tags.length > 0 ? tags : [category],
            screenshots: screenshots.length > 0 ? screenshots : [image || "/placeholder-product.jpg"],
            compatibility,
            version,
            updatePolicy,
            demoUrl: demoUrl || undefined,
            docUrl: docUrl || undefined,
            licenseRegular: Number(licenseRegular),
            licenseExtended: Number(licenseExtended),
            price: Number(price),
            rating: initialData?.rating || 0,
            reviews: initialData?.reviews || 0,
        };

        const onSuccess = () => router.push("/dashboard/products");
        if (isEdit && initialData?.id) {
            updateProduct(initialData.id, productData, { onSuccess });
        } else {
            createProduct(productData, { onSuccess });
        }
    };

    const handleCancel = () => {
        router.push("/dashboard/products");
    };

    const isLoading = isCreating || isUpdating;

    return (
        <div className=" mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full">
                        <Link href="/dashboard/products">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEdit ? `Edit: ${initialData?.name || "Product"}` : "Add New Product"}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {isEdit ? "Update product details, assets, and licensing information." : "Create a new entry in the marketplace with detailed specs and files."}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="rounded-xl"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        className="rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                        disabled={isLoading || !name || !category || !description}
                    >
                        <Save className="w-4 h-4" />
                        {isLoading ? "Saving..." : (isEdit ? "Update Product" : "Publish Product")}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 h-12 rounded-xl border border-border">
                    <TabsTrigger value="basic" className="rounded-lg h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs uppercase tracking-wider">
                        <Layout className="w-4 h-4" /> Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="details" className="rounded-lg h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs uppercase tracking-wider">
                        <Info className="w-4 h-4" /> Details & Features
                    </TabsTrigger>
                    <TabsTrigger value="assets" className="rounded-lg h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs uppercase tracking-wider">
                        <FileArchive className="w-4 h-4" /> Digital Assets
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="rounded-lg h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" /> Pricing & Licensing
                    </TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Core Information</CardTitle>
                            <CardDescription>Primary details that appear on the product card and search results.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input 
                                        id="name" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. NeonStore E-commerce UI Kit" 
                                        className="rounded-lg h-9" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Auto-generated Slug</Label>
                                    <Input 
                                        id="slug" 
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="neonstore-ecommerce-ui-kit" 
                                        className="rounded-lg h-9 bg-muted/30" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Short Description *</Label>
                                <Textarea 
                                    id="description" 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="A futuristic UI kit designed for..." 
                                    className="rounded-lg min-h-[80px] text-sm" 
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Main Category *</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="rounded-lg h-9">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subcategory">Sub-category</Label>
                                    <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
                                        <SelectTrigger className="rounded-lg h-9">
                                            <SelectValue placeholder={category ? "Select sub-category" : "Select category first"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subcategoryOptions.map((sub) => (
                                                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                            ))}
                                            {category && subcategoryOptions.length === 0 && (
                                                <SelectItem value="none">— None —</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Main Preview Image URL</Label>
                                <Input 
                                    id="image" 
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg" 
                                    className="rounded-lg h-9" 
                                />
                                <p className="text-xs text-muted-foreground">Or upload an image (placeholder for file upload)</p>
                            </div>

                            <div className="p-6 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center bg-muted/10 group hover:border-primary/50 transition-all cursor-pointer">
                                <div className="w-12 h-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <p className="font-medium">Upload Main Preview Image</p>
                                <p className="text-xs text-muted-foreground mt-1">Recommended size: 1200x900px (JPG, PNG)</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-border/50">
                                <CardHeader>
                                    <CardTitle>Key Features</CardTitle>
                                    <CardDescription>List individual selling points for the features list.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {features.map((feature, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input 
                                                value={feature} 
                                                onChange={(e) => updateFeature(idx, e.target.value)}
                                                placeholder="e.g. 50+ Responsive Screens" 
                                                className="rounded-lg h-9" 
                                            />
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => removeFeature(idx)} 
                                                disabled={features.length === 1}
                                            >
                                                <X className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addFeature} className="rounded-lg gap-2">+ Add Another Feature
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50">
                                <CardHeader>
                                    <CardTitle>Compatibility & Versioning</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Current Version</Label>
                                            <Input 
                                                value={version}
                                                onChange={(e) => setVersion(e.target.value)}
                                                placeholder="v1.0.0" 
                                                className="rounded-lg h-9" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Update Policy</Label>
                                            <Input 
                                                value={updatePolicy}
                                                onChange={(e) => setUpdatePolicy(e.target.value)}
                                                placeholder="Free lifetime updates" 
                                                className="rounded-lg h-9" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Framework/Software Support</Label>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {compatibility.map((tech: string) => (
                                                <Badge key={tech} variant="outline" className="px-3 py-1.5 rounded-md bg-background flex items-center gap-2 text-xs">
                                                    {tech}
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                                                        onClick={() => removeCompatibility(tech)}
                                                    />
                                                </Badge>
                                            ))}
                                            <Button variant="ghost" size="sm" className="h-8 border border-dashed rounded-lg opacity-60">+ Add Tag</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-border/50 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-sm">Live Preview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-medium text-muted-foreground flex items-center gap-2">
                                            <Globe className="w-3 h-3" /> External Demo URL
                                        </Label>
                                        <Input 
                                            value={demoUrl}
                                            onChange={(e) => setDemoUrl(e.target.value)}
                                            placeholder="https://demo.example.com" 
                                            className="rounded-lg h-9 text-xs" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-medium text-muted-foreground flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> Documentation Link
                                        </Label>
                                        <Input 
                                            value={docUrl}
                                            onChange={(e) => setDocUrl(e.target.value)}
                                            placeholder="https://docs.example.com" 
                                            className="rounded-lg h-9 text-xs" 
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Assets Tab */}
                <TabsContent value="assets">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Digital Delivery</CardTitle>
                            <CardDescription>Upload the primary files users will download after purchase.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="p-12 border-2 border-dashed border-primary/20 rounded-[2rem] bg-muted/5 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 text-primary shadow-inner">
                                    <FileArchive className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Primary Product File (.zip)</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mb-6">Drag and drop your project bundle here. Max file size: <span className="text-foreground font-medium">500MB</span></p>
                                <div className="flex gap-4">
                                    <Button className="rounded-lg px-6 h-9 shadow-lg shadow-primary/20">Select File</Button>
                                    <Button variant="outline" className="rounded-lg px-6 h-9">Cloud Upload</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-primary" /> Regular License
                                </CardTitle>
                                <CardDescription>Single project use pricing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Standard Price (USD)</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                                        <Input 
                                            type="number"
                                            value={licenseRegular}
                                            onChange={(e) => {
                                                setLicenseRegular(Number(e.target.value));
                                                setPrice(Number(e.target.value));
                                            }}
                                            className="pl-10 h-9 rounded-lg text-xl font-semibold" 
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-500">
                                    <ShieldCheck className="w-5 h-5" /> Extended License
                                </CardTitle>
                                <CardDescription>Multi-project or commercial use pricing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Standard Price (USD)</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                                        <Input 
                                            type="number"
                                            value={licenseExtended}
                                            onChange={(e) => setLicenseExtended(Number(e.target.value))}
                                            className="pl-10 h-9 rounded-lg text-xl font-semibold" 
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
