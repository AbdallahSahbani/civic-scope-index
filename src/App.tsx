import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EntityProfile from "./pages/EntityProfile";
import OfficialProfile from "./pages/OfficialProfile";
import Interests from "./pages/Interests";
import MediaWatch from "./pages/MediaWatch";
import MediaProfile from "./pages/MediaProfile";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/entity/:id" element={<EntityProfile />} />
          <Route path="/official/:id" element={<OfficialProfile />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/media-watch" element={<MediaWatch />} />
          <Route path="/media/:id" element={<MediaProfile />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
