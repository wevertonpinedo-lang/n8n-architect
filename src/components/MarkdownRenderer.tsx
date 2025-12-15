import React from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4 text-gray-700 leading-relaxed text-sm md:text-base">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Extract language and code
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const language = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div key={index} className="relative mt-6 mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-md bg-[#1e1e2e] group">
              <div className="flex justify-between items-center px-4 py-2 bg-[#27273a] border-b border-white/5">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{language || 'JSON'}</span>
                <button
                  onClick={() => handleCopy(code, index)}
                  className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium shadow-lg shadow-purple-900/20"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copiar Código
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-purple-100 scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Basic formatting for non-code parts
        return (
          <div key={index} dangerouslySetInnerHTML={{
            __html: part
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-bold">$1</strong>') // Bold
              .replace(/### (.*?)\n/g, '<h3 class="text-lg font-bold text-purple-700 mt-6 mb-2 flex items-center gap-2"><span class="w-1.5 h-1.5 bg-purple-500 rounded-full inline-block"></span>$1</h3>') // H3
              .replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b-2 border-purple-100 pb-2">$1</h2>') // H2
              .replace(/- (.*?)\n/g, '<li class="ml-4 list-disc marker:text-purple-500 mb-1 pl-1">$1</li>') // List items
              .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-purple-700 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200">$1</code>') // Inline code
              .replace(/\n/g, '<br />') // Line breaks
          }} />
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;