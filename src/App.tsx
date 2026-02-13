import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import DateTimeTools from "./pages/DateTimeTools";
import CodeSnippets from "./pages/CodeSnippets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* SVG Viewer accessible without auth */}
      <Route
        path="/svg-viewer"
        element={
          user ? (
            <Layout><Index /></Layout>
          ) : (
            <Layout><Index /></Layout>
          )
        }
      />
      {/* Auth-protected routes */}
      <Route
        path="*"
        element={
          user ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/datetime-tools" element={<DateTimeTools />} />
                <Route path="/code-snippets" element={<CodeSnippets />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          ) : (
            <Auth />
          )
        }
      />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
