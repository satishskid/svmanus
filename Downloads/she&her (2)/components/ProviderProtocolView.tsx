import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ProductKnowledge, ChatMessage, ClinicalGuideline } from '../types';
import { SHE_HER_PHILOSOPHY_DATA, SHE_HER_COVERAGE_DATA, GUIDING_PRINCIPLES_DATA, PROVIDER_TRAINING_SYSTEM_INSTRUCTION, GEMINI_MODEL_NAME, CLINICAL_GUIDELINES_DATA } from '../constants';
import { PaperAirplaneIcon, AcademicCapIcon } from './Icons';
import ChatMessageBubble from './ChatMessageBubble';

interface ProviderProtocolViewProps {
  productKnowledge: ProductKnowledge[];
  ai: GoogleGenAI | null;
}

const ProviderProtocolView: React.FC<ProviderProtocolViewProps> = ({ productKnowledge, ai }) => {
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initializeChat = useCallback(() => {
        if (!ai) {
            setError("AI service is not available. API Key may be missing.");
            return;
        }

        let systemInstruction = `${PROVIDER_TRAINING_SYSTEM_INSTRUCTION}\n\n--- KNOWLEDGE BASE START ---\n`;
        systemInstruction += `\n**She&Her Philosophy:**\n${SHE_HER_PHILOSOPHY_DATA}\n`;
        systemInstruction += `\n**She&Her Coverage:**\n${SHE_HER_COVERAGE_DATA}\n`;
        systemInstruction += `\n**Guiding Principles:**\n${GUIDING_PRINCIPLES_DATA}\n`;
        
        if (CLINICAL_GUIDELINES_DATA.length > 0) {
            systemInstruction += `\n**Clinical Service Guidelines:**\n`;
            CLINICAL_GUIDELINES_DATA.forEach(stage => {
                systemInstruction += `\n--- Stage: ${stage.stageTitle} ---\n`;
                stage.guidelines.forEach(g => {
                    systemInstruction += `Service: ${g.serviceName}\nProtocol: ${g.protocol}\nReferences: ${g.references}\n\n`;
                });
            });
        }

        if (productKnowledge.length > 0) {
            systemInstruction += `\n**Product-Specific Knowledge:**\n`;
            productKnowledge.forEach(p => {
                systemInstruction += `\n--- Product: ${p.name} ---\nDescription: ${p.description}\nStaff Training Info: ${p.staffTrainingInfo}\n--- End Product: ${p.name} ---\n`;
            });
        }
        systemInstruction += `\n--- KNOWLEDGE BASE END ---`;

        try {
            const newChat = ai.chats.create({ model: GEMINI_MODEL_NAME, config: { systemInstruction }});
            setChatSession(newChat);
            setError(null);
        } catch(e) {
            console.error("Error initializing training chat:", e);
            setError("Could not start training session with the AI.");
        }
    }, [ai, productKnowledge]);

    useEffect(() => {
        initializeChat();
    }, [initializeChat]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatSession) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userInput, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setUserInput('');

        try {
            const result = await chatSession.sendMessage({ message: userInput });
            const botMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: result.text, timestamp: new Date() };
            setChatMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error("Error sending message to training AI:", err);
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: "Sorry, I encountered an error. Please try again.", timestamp: new Date() };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Knowledge Base Display */}
            <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-4">
                <Section title="Our Philosophy" content={SHE_HER_PHILOSOPHY_DATA} />
                <Section title="What We Cover" content={SHE_HER_COVERAGE_DATA} />
                <Section title="Guiding Principles" content={GUIDING_PRINCIPLES_DATA} />
                
                {/* Clinical Guidelines Section */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 border-b-2 border-green-200 pb-2 mb-3 flex items-center">
                        <AcademicCapIcon className="h-6 w-6 mr-2 text-green-600"/>
                        Clinical Service Guidelines
                    </h3>
                    <div className="space-y-2">
                        {CLINICAL_GUIDELINES_DATA.map(stageData => (
                            <details key={stageData.stage} className="bg-gray-50 rounded-lg group">
                                <summary className="p-3 font-semibold text-gray-700 cursor-pointer group-hover:bg-gray-100 rounded-t-lg">
                                    {stageData.stageTitle}
                                </summary>
                                <div className="p-4 border-t border-gray-200 space-y-4">
                                    {stageData.guidelines.map((guideline, index) => (
                                        <div key={index}>
                                            <h5 className="font-bold text-indigo-700">{guideline.serviceName}</h5>
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1"><strong className="font-semibold">Protocol:</strong> {guideline.protocol}</p>
                                            <p className="text-xs text-gray-500 whitespace-pre-wrap mt-2"><strong className="font-semibold">References:</strong> {guideline.references}</p>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Product Knowledge Section */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 border-b-2 border-indigo-200 pb-2">Product Specific Knowledge</h3>
                    {productKnowledge.map(p => (
                        <div key={p.id} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-indigo-700">{p.name}</h4>
                            <p className="text-sm text-gray-600 mt-1 mb-2">{p.description}</p>
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans bg-white p-3 rounded-md border">{p.staffTrainingInfo}</pre>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Training Chat */}
            <div className="flex flex-col border rounded-lg shadow-inner h-[70vh]">
                <div className="p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">AI Training Assistant</h3>
                    <p className="text-sm text-gray-500">Ask questions about the protocols and products.</p>
                </div>
                <div className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
                   {chatMessages.map(msg => <ChatMessageBubble key={msg.id} message={msg} stageColor="bg-indigo-500" />)}
                   {chatMessages.length === 0 && (
                       <p className="text-center text-gray-500 p-8">Ask me anything about the documents on the left. For example: "What is the protocol for Niramai?"</p>
                   )}
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                    <div className="flex items-center space-x-2">
                         <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={error || "Type your question..."}
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            disabled={isLoading || !!error}
                        />
                        <button type="submit" disabled={isLoading || !userInput.trim() || !!error} className="p-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div>
    <h3 className="text-xl font-bold text-gray-800 border-b-2 border-pink-200 pb-2 mb-3">{title}</h3>
    <p className="text-gray-700 whitespace-pre-wrap font-sans">{content}</p>
  </div>
);

export default ProviderProtocolView;