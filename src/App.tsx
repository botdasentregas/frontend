import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BottomNavigation from "./components/BottomNavigation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Payment from "./pages/Payment";
import Connect from "./pages/Connect";
import Assistant from "./pages/Assistant";
import Commission from "./pages/Commission";
import NotFound from "./pages/NotFound";
import BlankPage from "./pages/BlankPage";

const queryClient = new QueryClient();

// Configuração das flags de futuro do React Router v7
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const App = () => (
  <BrowserRouter {...router}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/commission" element={<Commission />} />
          <Route path="/blank" element={<BlankPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
