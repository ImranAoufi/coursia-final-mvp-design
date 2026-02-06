import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Edit2, Check, X, DollarSign, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CourseEditableHeaderProps {
  title: string;
  description?: string;
  marketingHook?: string;
  category?: string;
  audienceLevel?: string;
  outcome?: string;
  lessonsCount?: number;
  price?: number;
  bannerUrl?: string;
  onUpdate: (updates: {
    title?: string;
    description?: string;
    marketing_hook?: string;
    category?: string;
    audience_level?: string;
    custom_price?: number;
  }) => void;
  isSaving?: boolean;
}

const CATEGORIES = [
  "Technology",
  "Business",
  "Creative Arts",
  "Health & Wellness",
  "Personal Development",
  "Language",
  "Education",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export function CourseEditableHeader({
  title,
  description,
  marketingHook,
  category = "Personal Development",
  audienceLevel = "Intermediate",
  outcome,
  lessonsCount,
  price = 49,
  bannerUrl,
  onUpdate,
  isSaving = false,
}: CourseEditableHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingMarketingHook, setIsEditingMarketingHook] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isGeneratingHook, setIsGeneratingHook] = useState(false);
  
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description || "");
  const [editMarketingHook, setEditMarketingHook] = useState(marketingHook || "");
  const [editPrice, setEditPrice] = useState(price.toString());

  useEffect(() => {
    setEditTitle(title);
    setEditDescription(description || "");
    setEditMarketingHook(marketingHook || "");
    setEditPrice(price.toString());
  }, [title, description, marketingHook, price]);

  const handleGenerateMarketingHook = async () => {
    setIsGeneratingHook(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-marketing-description', {
        body: {
          courseTitle: title,
          courseDescription: description,
          audienceLevel,
          category,
          outcome,
          lessonsCount,
        },
      });

      if (error) throw error;
      
      if (data?.marketing_description) {
        setEditMarketingHook(data.marketing_description);
        onUpdate({ marketing_hook: data.marketing_description });
        toast.success("Marketing description generated!");
      }
    } catch (err) {
      console.error('Error generating marketing description:', err);
      toast.error("Failed to generate description");
    } finally {
      setIsGeneratingHook(false);
    }
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== title) {
      onUpdate({ title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (editDescription !== description) {
      onUpdate({ description: editDescription.trim() || undefined });
    }
    setIsEditingDescription(false);
  };

  const handleSaveMarketingHook = () => {
    if (editMarketingHook !== marketingHook) {
      onUpdate({ marketing_hook: editMarketingHook.trim() || undefined });
    }
    setIsEditingMarketingHook(false);
  };

  const handleSavePrice = () => {
    const numPrice = parseFloat(editPrice);
    if (!isNaN(numPrice) && numPrice >= 0 && numPrice !== price) {
      onUpdate({ custom_price: numPrice });
    }
    setIsEditingPrice(false);
  };

  const handleCategoryChange = (value: string) => {
    if (value !== category) {
      onUpdate({ category: value });
    }
  };

  const handleLevelChange = (value: string) => {
    if (value !== audienceLevel) {
      onUpdate({ audience_level: value });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Category & Level badges */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex flex-wrap items-center gap-3"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary border border-primary/20">
          <Sparkles className="w-3 h-3" />
          AI-Generated Course
        </span>
        
        {/* Editable Category */}
        <Select value={category} onValueChange={handleCategoryChange} disabled={isSaving}>
          <SelectTrigger className="w-auto h-7 text-xs border-muted bg-muted/50 hover:bg-muted">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Editable Level */}
        <Select value={audienceLevel} onValueChange={handleLevelChange} disabled={isSaving}>
          <SelectTrigger className="w-auto h-7 text-xs border-muted bg-muted/50 hover:bg-muted">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((level) => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Editable Price */}
        <div className="flex items-center gap-1">
          {isEditingPrice ? (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <Input
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-20 h-7 text-xs"
                type="number"
                min="0"
                step="0.01"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSavePrice();
                  if (e.key === "Escape") {
                    setEditPrice(price.toString());
                    setIsEditingPrice(false);
                  }
                }}
              />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSavePrice}>
                <Check className="w-3 h-3 text-green-500" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                setEditPrice(price.toString());
                setIsEditingPrice(false);
              }}>
                <X className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          ) : (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => setIsEditingPrice(true)}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              {price.toFixed(2)}
              <Edit2 className="w-3 h-3 ml-1 opacity-50" />
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Editable Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="group"
      >
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold h-auto py-2 bg-transparent border-primary/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setEditTitle(title);
                  setIsEditingTitle(false);
                }
              }}
            />
            <Button size="icon" variant="ghost" onClick={handleSaveTitle} disabled={isSaving}>
              <Check className="w-5 h-5 text-green-500" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => {
              setEditTitle(title);
              setIsEditingTitle(false);
            }}>
              <X className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        ) : (
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight cursor-pointer hover:text-primary/90 transition-colors flex items-center gap-3"
            onClick={() => setIsEditingTitle(true)}
          >
            {title || "Your Course"}
            <Edit2 className="w-6 h-6 opacity-0 group-hover:opacity-50 transition-opacity" />
          </h1>
        )}
      </motion.div>

      {/* Editable Description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="group"
      >
        {isEditingDescription ? (
          <div className="space-y-2">
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="text-lg bg-transparent border-primary/30 min-h-[100px]"
              placeholder="Add a compelling description for your course..."
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleSaveDescription} disabled={isSaving}>
                <Check className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setEditDescription(description || "");
                setIsEditingDescription(false);
              }}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p 
            className="text-lg text-muted-foreground max-w-3xl cursor-pointer hover:text-foreground transition-colors flex items-start gap-2"
            onClick={() => setIsEditingDescription(true)}
          >
            {description || "Click to add a description..."}
            <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity shrink-0 mt-1" />
          </p>
        )}
      </motion.div>

      {/* Editable Marketing Hook for Marketplace */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.37, duration: 0.5 }}
        className="glass-strong rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="w-4 h-4" />
            Marketplace Description
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateMarketingHook}
            disabled={isGeneratingHook || isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-primary/30"
          >
            {isGeneratingHook ? (
              <>
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                AI Generate
              </>
            )}
          </Button>
        </div>
        {isEditingMarketingHook ? (
          <div className="space-y-3">
            <Textarea
              value={editMarketingHook}
              onChange={(e) => setEditMarketingHook(e.target.value)}
              className="text-base bg-transparent border-primary/30 min-h-[140px]"
              placeholder="Write a compelling sales pitch for potential buyers. What will they learn? Why should they enroll?"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleSaveMarketingHook} disabled={isSaving}>
                <Check className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setEditMarketingHook(marketingHook || "");
                setIsEditingMarketingHook(false);
              }}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="cursor-pointer hover:bg-muted/30 rounded-xl p-3 -m-3 transition-colors group/hook"
            onClick={() => setIsEditingMarketingHook(true)}
          >
            {marketingHook ? (
              <p className="text-base text-foreground/80 leading-relaxed">
                {marketingHook}
              </p>
            ) : (
              <p className="text-base text-muted-foreground italic">
                Click to add a compelling sales pitch, or use AI Generate to create one automatically...
              </p>
            )}
            <Edit2 className="w-4 h-4 opacity-0 group-hover/hook:opacity-50 transition-opacity mt-2 text-muted-foreground" />
          </div>
        )}
      </motion.div>

      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden shadow-elevated group"
      >
        {bannerUrl ? (
          <div className="relative h-56 sm:h-72 lg:h-80">
            <img
              src={bannerUrl}
              alt="Course banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          </div>
        ) : (
          <div className="h-56 sm:h-72 lg:h-80 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 animate-gradient" />
        )}
      </motion.div>
    </motion.div>
  );
}
