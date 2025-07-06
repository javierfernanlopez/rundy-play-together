import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";

import Index from "./pages/Index";
import MatchDetails from "./pages/MatchDetails";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listenerHandle: PluginListenerHandle;

    const setupBackButtonListener = async () => {
      listenerHandle = await CapacitorApp.addListener('backButton', () => {
        if (location.pathname === "/") {
          CapacitorApp.exitApp();
        } else {
          navigate(-1);
        }
      });
    };

    setupBackButtonListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/match/:id" element={<ProtectedRoute><MatchDetails /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  useEffect(() => {
    const initNativeUI = async () => {
      if (Capacitor.getPlatform() !== 'android') {
        return;
      }
      try {
        await EdgeToEdge.enable();
        await EdgeToEdge.setBackgroundColor({ color: '#ffffff' });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (error) {
        console.error("Error configurando la UI nativa:", error);
      }
    };
    initNativeUI();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;