import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";

// ✅ Deine Seiten & Komponenten
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Enterprise from "./pages/Enterprise";
import NotFound from "./pages/NotFound";
import Preview from "./pages/Preview";
import MyCourse from "@/pages/MyCourse";

// ✅ Hier kommt dein Wizard aus src/components/
import IntakeWizard from "./components/IntakeWizard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ✅ Wizard-Seite */}
            <Route path="/wizard" element={<IntakeWizard />} />

            {/* ✅ Vorschau-Seite */}
            <Route path="/preview" element={<Preview />} />

            <Route path="/my-course" element={<MyCourse />} />

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
  </QueryClientProvider>
);

export default App;
