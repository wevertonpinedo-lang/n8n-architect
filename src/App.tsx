import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import WorkflowLibrary from './components/WorkflowLibrary';
import NexusManager from './components/NexusManager';
import { Workflow, LogOut, MessageSquarePlus, Activity, ArrowLeft } from 'lucide-react';
import { WorkflowTemplate } from './types';

// Component wrapper for the App Layout (Header + Main Content)
const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [viewMode, setViewMode] = useState<'chat' | 'library'>('chat');

  // Custom workflows state (persisted in parent for now)
  const [customWorkflows, setCustomWorkflows] = useState<WorkflowTemplate[]>([]);

  const handleWorkflowGenerated = (workflow: WorkflowTemplate) => {
    setCustomWorkflows(prev => [workflow, ...prev]);
  };

  const handleOpenChatWithPrompt = (prompt: string) => {
    setInitialPrompt(prompt);
    setViewMode('chat');
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 selection:bg-blue-500 selection:text-white overflow-hidden relative bg-gray-50">
      {/* Clean Background with subtle decorations */}
      <div className="fixed inset-0 bg-white -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen p-4 md:p-6 max-w-[1600px] mx-auto animate-fade-in">
        {/* App Header */}
        <header className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
            {/* Minimalist Icon */}
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            {/* Text */}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-tight tracking-tight">N8N <span className="text-blue-600">Architect</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {viewMode === 'library' ? (
              <button
                onClick={() => setViewMode('chat')}
                className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span className="hidden sm:inline">Criar Novo</span>
              </button>
            ) : (
              /* Library Button Hidden per original logic */
              null
            )}

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-2 rounded-full transition-all border border-gray-200 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* Main Interface Container */}
        <main className="flex-1 w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col relative">
          {viewMode === 'chat' ? (
            <ChatInterface
              initialPrompt={initialPrompt}
              onWorkflowGenerated={handleWorkflowGenerated}
            />
          ) : (
            <WorkflowLibrary
              onUseTemplate={handleOpenChatWithPrompt}
              customWorkflows={customWorkflows}
            />
          )}
        </main>

        <footer className="mt-4 text-center text-gray-400 text-[10px]">
          <p>© 2024 N8N Architect. Powered by Gemini 2.5.</p>
        </footer>
      </div>
    </div>
  );
};

// Main App Component with Routes
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={
          <div className="relative">
            {/* Secret Nexus Access */}
            <div className="absolute top-6 right-6 z-50">
              <a
                href="/nexus-admin"
                className="text-[10px] font-bold text-gray-300 hover:text-gray-500 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 uppercase tracking-widest"
              >
                <Activity className="w-3 h-3" /> Login Nexus
              </a>
            </div>
            <LandingPage onStart={() => window.location.href = '/app'} />
          </div>
        } />

        {/* Main App Route */}
        <Route path="/app" element={<AppLayout />} />

        {/* Nexus Admin Route */}
        <Route path="/nexus-admin" element={<NexusManager onExit={() => window.location.href = '/'} />} />

        {/* Catch all redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;