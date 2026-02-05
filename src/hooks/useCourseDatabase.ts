import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface CourseData {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  category?: string;
  outcome?: string;
  target_audience?: string;
  audience_level?: string;
  course_size?: string;
  materials?: string;
  links?: string;
  logo_url?: string;
  banner_url?: string;
  color_palette?: Record<string, string | string[]>;
  marketing_hook?: string;
  custom_price?: number;
  lessons?: any[];
  status?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseCourseDatabase {
  saveCourse: (course: CourseData) => Promise<CourseData | null>;
  updateCourse: (id: string, updates: Partial<CourseData>) => Promise<CourseData | null>;
  getCourse: (id: string) => Promise<CourseData | null>;
  getUserCourses: () => Promise<CourseData[]>;
  getPublishedCourses: () => Promise<CourseData[]>;
  publishCourse: (id: string) => Promise<CourseData | null>;
  unpublishCourse: (id: string) => Promise<CourseData | null>;
  deleteCourse: (id: string) => Promise<boolean>;
  isSaving: boolean;
  isLoading: boolean;
}

export function useCourseDatabase(): UseCourseDatabase {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const saveCourse = useCallback(async (course: CourseData): Promise<CourseData | null> => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save your course");
        return null;
      }

      const courseToSave = {
        user_id: user.id,
        title: course.title,
        description: course.description || null,
        category: course.category || "Personal Development",
        outcome: course.outcome || null,
        target_audience: course.target_audience || null,
        audience_level: course.audience_level || "Intermediate",
        course_size: course.course_size || "standard",
        materials: course.materials || null,
        links: course.links || null,
        logo_url: course.logo_url || null,
        banner_url: course.banner_url || null,
        color_palette: (course.color_palette || null) as Json,
        marketing_hook: course.marketing_hook || null,
        custom_price: course.custom_price || 49.00,
        lessons: (course.lessons || []) as Json,
        status: course.status || "draft",
      };

      const { data, error } = await supabase
        .from("courses")
        .insert(courseToSave)
        .select()
        .single();

      if (error) {
        console.error("Error saving course:", error);
        toast.error("Failed to save course");
        return null;
      }

      toast.success("Course saved successfully!");
      return data as unknown as CourseData;
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error("Failed to save course");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateCourse = useCallback(async (id: string, updates: Partial<CourseData>): Promise<CourseData | null> => {
    setIsSaving(true);
    try {
      // Build update object, converting complex types to Json
      const updateData: Record<string, any> = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.outcome !== undefined) updateData.outcome = updates.outcome;
      if (updates.target_audience !== undefined) updateData.target_audience = updates.target_audience;
      if (updates.audience_level !== undefined) updateData.audience_level = updates.audience_level;
      if (updates.course_size !== undefined) updateData.course_size = updates.course_size;
      if (updates.materials !== undefined) updateData.materials = updates.materials;
      if (updates.links !== undefined) updateData.links = updates.links;
      if (updates.logo_url !== undefined) updateData.logo_url = updates.logo_url;
      if (updates.banner_url !== undefined) updateData.banner_url = updates.banner_url;
      if (updates.color_palette !== undefined) updateData.color_palette = updates.color_palette as Json;
      if (updates.marketing_hook !== undefined) updateData.marketing_hook = updates.marketing_hook;
      if (updates.custom_price !== undefined) updateData.custom_price = updates.custom_price;
      if (updates.lessons !== undefined) updateData.lessons = updates.lessons as Json;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.published_at !== undefined) updateData.published_at = updates.published_at;

      const { data, error } = await supabase
        .from("courses")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating course:", error);
        toast.error("Failed to update course");
        return null;
      }

      return data as unknown as CourseData;
    } catch (err) {
      console.error("Error updating course:", err);
      toast.error("Failed to update course");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const getCourse = useCallback(async (id: string): Promise<CourseData | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching course:", error);
        return null;
      }

      return data as unknown as CourseData;
    } catch (err) {
      console.error("Error fetching course:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserCourses = useCallback(async (): Promise<CourseData[]> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user courses:", error);
        return [];
      }

      return (data || []) as unknown as CourseData[];
    } catch (err) {
      console.error("Error fetching user courses:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPublishedCourses = useCallback(async (): Promise<CourseData[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error fetching published courses:", error);
        return [];
      }

      return (data || []) as unknown as CourseData[];
    } catch (err) {
      console.error("Error fetching published courses:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const publishCourse = useCallback(async (id: string): Promise<CourseData | null> => {
    return updateCourse(id, {
      status: "published",
      published_at: new Date().toISOString(),
    });
  }, [updateCourse]);

  const unpublishCourse = useCallback(async (id: string): Promise<CourseData | null> => {
    return updateCourse(id, {
      status: "draft",
      published_at: undefined,
    });
  }, [updateCourse]);

  const deleteCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting course:", error);
        toast.error("Failed to delete course");
        return false;
      }

      toast.success("Course deleted");
      return true;
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error("Failed to delete course");
      return false;
    }
  }, []);

  return {
    saveCourse,
    updateCourse,
    getCourse,
    getUserCourses,
    getPublishedCourses,
    publishCourse,
    unpublishCourse,
    deleteCourse,
    isSaving,
    isLoading,
  };
}
