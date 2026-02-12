import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";

// ✅ Deine Seiten & Komponenten
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Enterprise from "./pages/Enterprise";
import NotFound from "./pages/NotFound";
import Preview from "./pages/Preview";
import MyCourse from "@/pages/MyCourse";
import Marketplace from "@/pages/Marketplace";
import CourseDetail from "@/pages/CourseDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import QuizEditorPage from "./pages/QuizEditorPage";
import WorkbookEditorPage from "./pages/WorkbookEditorPage";
import ScriptEditorPage from "./pages/ScriptEditorPage";

// ✅ Hier kommt dein Wizard aus src/components/
import IntakeWizard from "./components/IntakeWizard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ✅ Auth-Seite */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />

              {/* ✅ Wizard-Seite */}
              <Route path="/wizard" element={<IntakeWizard />} />

              {/* ✅ Vorschau-Seite */}
              <Route path="/preview" element={<Preview />} />

              <Route path="/my-course" element={<MyCourse />} />
              <Route path="/my-course/quiz" element={<QuizEditorPage />} />
              <Route path="/my-course/workbook" element={<WorkbookEditorPage />} />
              <Route path="/my-course/script" element={<ScriptEditorPage />} />
              
              {/* ✅ Marketplace */}
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />

              {/* ✅ Normale Seiten */}
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/enterprise" element={<Enterprise />} />

              {/* ✅ Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
