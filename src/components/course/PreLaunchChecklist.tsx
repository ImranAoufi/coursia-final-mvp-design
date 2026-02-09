import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Rocket,
  CheckCircle2,
  Circle,
  DollarSign,
  Tag,
  Users,
  BookOpen,
  Image,
  Sparkles,
  Shield,
  ArrowRight,
  Crown,
  Zap,
  TrendingUp,
} from "lucide-react";

interface PreLaunchChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmPublish: (data: PreLaunchData) => void;
  isPublishing: boolean;
  initialData: {
    title: string;
    description?: string;
    category: string;
    audienceLevel: string;
    price: number;
    marketingHook?: string;
    lessonsCount: number;
    videosCount: number;
    quizzesCount: number;
    hasLogo: boolean;
    hasBanner: boolean;
  };
}

export interface PreLaunchData {
  title: string;
  description: string;
  category: string;
  audienceLevel: string;
  price: number;
  marketingHook: string;
  agreeToTerms: boolean;
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

interface CheckItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
}

export function PreLaunchChecklist({
  open,
  onOpenChange,
  onConfirmPublish,
  isPublishing,
  initialData,
}: PreLaunchChecklistProps) {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || "");
  const [category, setCategory] = useState(initialData.category);
  const [audienceLevel, setAudienceLevel] = useState(initialData.audienceLevel);
  const [price, setPrice] = useState(initialData.price.toString());
  const [marketingHook, setMarketingHook] = useState(initialData.marketingHook || "");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setCategory(initialData.category);
      setAudienceLevel(initialData.audienceLevel);
      setPrice(initialData.price.toString());
      setMarketingHook(initialData.marketingHook || "");
      setAgreeToTerms(false);
    }
  }, [open, initialData]);

  const checklist: CheckItem[] = useMemo(() => [
    {
      id: "title",
      label: "Course Title",
      description: "A compelling title that grabs attention",
      icon: <BookOpen className="w-4 h-4" />,
      isComplete: title.trim().length > 3,
    },
    {
      id: "description",
      label: "Course Description",
      description: "Tell buyers what they'll learn",
      icon: <Tag className="w-4 h-4" />,
      isComplete: description.trim().length > 20,
    },
    {
      id: "category",
      label: "Category & Level",
      description: "Help buyers find your course",
      icon: <Users className="w-4 h-4" />,
      isComplete: !!category && !!audienceLevel,
    },
    {
      id: "price",
      label: "Final Price",
      description: "Set your selling price",
      icon: <DollarSign className="w-4 h-4" />,
      isComplete: parseFloat(price) > 0,
    },
    {
      id: "branding",
      label: "Logo & Banner",
      description: "Professional branding assets",
      icon: <Image className="w-4 h-4" />,
      isComplete: initialData.hasLogo && initialData.hasBanner,
    },
    {
      id: "marketing",
      label: "Marketing Description",
      description: "Sales copy that converts",
      icon: <Sparkles className="w-4 h-4" />,
      isComplete: marketingHook.trim().length > 20,
    },
    {
      id: "content",
      label: "Course Content",
      description: `${initialData.lessonsCount} lessons, ${initialData.videosCount} videos, ${initialData.quizzesCount} quizzes`,
      icon: <Shield className="w-4 h-4" />,
      isComplete: initialData.lessonsCount > 0,
    },
  ], [title, description, category, audienceLevel, price, marketingHook, initialData]);

  const completedCount = checklist.filter((c) => c.isComplete).length;
  const allComplete = completedCount === checklist.length;
  const canPublish = allComplete && agreeToTerms;
  const progressPercent = (completedCount / checklist.length) * 100;

  const numPrice = parseFloat(price) || 0;
  const projectedMonthly = numPrice * 10;
  const projectedYearly = projectedMonthly * 12;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong rounded-3xl overflow-hidden"
        >
          {/* Header with gradient */}
          <div className="relative px-8 pt-8 pb-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-brand opacity-10" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />

            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Pre-Launch Checklist</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Review everything before going live
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative mt-6">
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-brand"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{checklist.length} complete
                </span>
                {allComplete && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-medium text-primary flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Ready to launch!
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="px-8 pb-2 max-h-[55vh] overflow-y-auto scrollbar-premium space-y-5">
            {/* Checklist items */}
            <div className="space-y-3">
              {checklist.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
                    item.isComplete
                      ? "bg-primary/5 border border-primary/15"
                      : "bg-muted/20 border border-muted/30"
                  }`}
                >
                  <div className={`mt-0.5 transition-colors ${item.isComplete ? "text-primary" : "text-muted-foreground"}`}>
                    {item.isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${item.isComplete ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.label}
                      </span>
                      <span className="text-muted-foreground">{item.icon}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Editable fields section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Crown className="w-4 h-4 text-primary" />
                Final Adjustments
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Course Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your course title"
                  className="bg-muted/30 border-muted/50 focus:border-primary/50"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Course Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what students will learn..."
                  className="bg-muted/30 border-muted/50 focus:border-primary/50 min-h-[80px]"
                />
              </div>

              {/* Category & Level row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-muted/30 border-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Difficulty Level</label>
                  <Select value={audienceLevel} onValueChange={setAudienceLevel}>
                    <SelectTrigger className="bg-muted/30 border-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price with revenue projection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Final Price (USD)</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-8 bg-muted/30 border-muted/50 focus:border-primary/50 text-lg font-semibold"
                    />
                  </div>
                </div>
                {numPrice > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-4 mt-2 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10"
                  >
                    <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex gap-4 text-xs">
                      <span className="text-muted-foreground">
                        Projected: <span className="font-semibold text-foreground">${projectedMonthly.toLocaleString()}/mo</span>
                      </span>
                      <span className="text-muted-foreground">
                        · <span className="font-semibold text-primary">${projectedYearly.toLocaleString()}/yr</span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Marketing Hook */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Marketing Description</label>
                <Textarea
                  value={marketingHook}
                  onChange={(e) => setMarketingHook(e.target.value)}
                  placeholder="Write a compelling sales pitch..."
                  className="bg-muted/30 border-muted/50 focus:border-primary/50 min-h-[80px]"
                />
              </div>
            </div>

            {/* Agreement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-muted/30"
            >
              <button
                onClick={() => setAgreeToTerms(!agreeToTerms)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
                  agreeToTerms
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/40 hover:border-primary/60"
                }`}
              >
                {agreeToTerms && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I confirm that all course content is original, my pricing is final, and I'm ready to make this course available on the Coursia Marketplace.
              </p>
            </motion.div>
          </div>

          {/* Footer with CTA */}
          <div className="px-8 py-6 border-t border-border/50">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isPublishing}
              >
                Cancel
              </Button>

              <motion.button
                whileHover={canPublish ? { scale: 1.02 } : {}}
                whileTap={canPublish ? { scale: 0.98 } : {}}
                disabled={!canPublish || isPublishing}
                onClick={() =>
                  onConfirmPublish({
                    title: title.trim(),
                    description: description.trim(),
                    category,
                    audienceLevel,
                    price: parseFloat(price) || 0,
                    marketingHook: marketingHook.trim(),
                    agreeToTerms,
                  })
                }
                className="relative flex-[2] group px-6 py-3 rounded-2xl font-semibold text-white overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-glow transition-shadow duration-500"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-brand animate-gradient-x" />

                {/* Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-brand opacity-50 blur-xl" />
                </div>

                {/* Shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>

                <span className="relative flex items-center justify-center gap-2 text-sm">
                  {isPublishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Publish to Marketplace
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
