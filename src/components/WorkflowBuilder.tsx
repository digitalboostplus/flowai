'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightning, 
  SpinnerGap, 
  WarningCircle,
  DownloadSimple,
  ArrowsOut,
  X
} from '@phosphor-icons/react';
import mermaid from 'mermaid';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'trigger' | 'action' | 'condition';
}

export function WorkflowBuilder() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [mermaidSyntax, setMermaidSyntax] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const fullScreenDiagramRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize mermaid only on client side
  useEffect(() => {
    if (isMounted) {
      try {
        mermaid.initialize({
          startOnLoad: true,
          securityLevel: 'loose',
          theme: 'dark',
          logLevel: 'debug',
          flowchart: {
            curve: 'basis',
            padding: 20,
            nodeSpacing: 50,
            rankSpacing: 50,
            defaultRenderer: 'dagre',
          },
          themeVariables: {
            darkMode: true,
            background: '#000000',
            primaryColor: '#1f4532',
            primaryTextColor: '#4ade80',
            primaryBorderColor: '#4ade80',
            lineColor: '#4ade80',
            secondaryColor: '#1f3f52',
            tertiaryColor: '#1f1f52'
          }
        });
      } catch (error) {
        console.error('Error initializing Mermaid:', error);
        setError('Failed to initialize diagram renderer');
      }
    }
  }, [isMounted]);

  // Render diagram when mermaidSyntax changes
  useEffect(() => {
    if (!isMounted || !mermaidSyntax) return;

    const renderDiagram = async (ref: HTMLDivElement | null) => {
      if (!ref) return;

      try {
        // Clear previous content
        ref.innerHTML = '';
        
        // Create a container for the diagram
        const container = document.createElement('div');
        container.className = 'mermaid w-full h-full flex items-center justify-center';
        container.textContent = mermaidSyntax;
        ref.appendChild(container);
        
        // Render the diagram
        await mermaid.run();
      } catch (error) {
        console.error('Error rendering diagram:', error);
        setError('Failed to render workflow diagram');
      }
    };

    renderDiagram(diagramRef.current);
    if (isFullScreen) {
      renderDiagram(fullScreenDiagramRef.current);
    }
  }, [mermaidSyntax, isFullScreen, isMounted]);

  const handleDownload = async () => {
    if (!isMounted || !diagramRef.current) return;

    try {
      // Get the SVG element
      const svgElement = diagramRef.current.querySelector('svg');
      if (!svgElement) return;

      // Create a blob from the SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'workflow-diagram.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading diagram:', error);
      setError('Failed to download workflow diagram');
    }
  };

  const handleGenerateWorkflow = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workflow');
      }

      if (!data.mermaidSyntax || !data.workflow || !Array.isArray(data.workflow)) {
        throw new Error('Invalid workflow format received');
      }

      console.log('Received mermaid syntax:', data.mermaidSyntax);
      setMermaidSyntax(data.mermaidSyntax);
      setWorkflow(data.workflow);
    } catch (error) {
      console.error('Error generating workflow:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setWorkflow([]);
      setMermaidSyntax('');
    } finally {
      setIsLoading(false);
    }
  };

  // Only render diagram containers if mounted
  const renderDiagramContainer = (ref: React.RefObject<HTMLDivElement>) => (
    <div className="bg-black rounded-lg p-6 overflow-x-auto border border-gray-800 min-h-[500px] flex items-center justify-center">
      {isMounted ? (
        <div ref={ref} className="w-full h-full" />
      ) : (
        <div className="flex items-center justify-center text-gray-500">
          <SpinnerGap className="animate-spin mr-2" size={20} weight="bold" />
          Loading diagram...
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-gray-800">
          <div className="flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your workflow in plain English... (e.g., 'When a new lead comes in, check their score, and if it's above 80, send them a personalized email')"
              className="w-full h-32 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateWorkflow}
                disabled={isLoading || !prompt.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                {isLoading ? (
                  <>
                    <SpinnerGap className="animate-spin" size={20} weight="bold" />
                    Generating Workflow...
                  </>
                ) : (
                  <>
                    <Lightning size={20} weight="bold" />
                    Generate AI Workflow
                  </>
                )}
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
                >
                  <WarningCircle size={20} weight="bold" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {workflow.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Visual Workflow */}
                  <div className="lg:sticky lg:top-4 order-last lg:order-first">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Visual Workflow</h3>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDownload}
                          disabled={!isMounted}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                          title="Download as SVG"
                        >
                          <DownloadSimple size={20} weight="bold" />
                          Download SVG
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsFullScreen(true)}
                          disabled={!isMounted}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                          title="View in full screen"
                        >
                          <ArrowsOut size={20} weight="bold" />
                          Full Screen
                        </motion.button>
                      </div>
                    </div>
                    {renderDiagramContainer(diagramRef)}
                  </div>

                  {/* Workflow Steps */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Workflow Steps</h3>
                    <div className="flex flex-col gap-4">
                      {workflow.map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                        >
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                            ${step.type === 'trigger' ? 'bg-green-500/20 text-green-400' :
                              step.type === 'condition' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'}
                          `}>
                            {step.id}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{step.title}</h4>
                            <p className="text-sm text-gray-400">{step.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          >
            <div className="w-full h-full relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullScreen(false)}
                className="absolute top-4 right-4 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="Close full screen"
              >
                <X size={24} weight="bold" />
              </motion.button>
              {renderDiagramContainer(fullScreenDiagramRef)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 