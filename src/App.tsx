import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import DateTimeTools from "./pages/DateTimeTools";
import CodeSnippets from "./pages/CodeSnippets";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ImageTools from "./pages/ImageTools";
import TextTools from "./pages/TextTools";
import ColorTools from "./pages/ColorTools";
import ExcelToPdfConverter from "./pages/ExcelToPdfConverter";

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
              <Route path="/sign-in" element={<Layout><SignInPage /></Layout>} />
              <Route path="/sign-up" element={<Layout><SignUpPage /></Layout>} />
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/svg-viewer" element={<Layout><Index /></Layout>} />
              <Route path="/notes" element={<Layout><Notes /></Layout>} />
              <Route path="/datetime-tools" element={<Layout><DateTimeTools /></Layout>} />
              <Route path="/code-snippets" element={<Layout><CodeSnippets /></Layout>} />
              <Route path="/image-tools" element={<Layout><ImageTools /></Layout>} />
              <Route path="/text-tools" element={<Layout><TextTools /></Layout>} />
              <Route path="/color-tools" element={<Layout><ColorTools /></Layout>} />
              <Route path="/excel-to-pdf" element={<Layout><ExcelToPdfConverter /></Layout>} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
