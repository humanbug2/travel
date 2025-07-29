'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Sparkles } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    question: "Where would you like to travel?",
    placeholder: "e.g., Paris, Tokyo, New York...",
    key: "destination"
  },
  {
    id: 2,
    question: "What are your travel dates?",
    placeholder: "e.g., December 15-22, 2024",
    key: "travelDates"
  },
  {
    id: 3,
    question: "What's your budget range?",
    placeholder: "e.g., $1000-2000, Budget-friendly, Luxury",
    key: "budget"
  },
  {
    id: 4,
    question: "What's your travel style?",
    placeholder: "e.g., Adventure, Relaxation, Cultural, Family-friendly",
    key: "travelStyle"
  },
  {
    id: 5,
    question: "What are your main interests?",
    placeholder: "e.g., Museums, Food, Nature, Nightlife, History",
    key: "interests"
  }
];

export function Chatbot({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;

    const question = QUESTIONS[currentQuestion];
    const newResponses = { ...responses, [question.key]: currentAnswer };
    setResponses(newResponses);

    // Add to chat history
    setChatHistory([
      ...chatHistory,
      { type: 'question', text: question.question },
      { type: 'answer', text: currentAnswer }
    ]);

    setCurrentAnswer('');

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, generate itinerary
      generateItinerary(newResponses);
    }
  };

  const generateItinerary = async (userResponses) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: userResponses })
      });

      const data = await response.json();
      if (data.success) {
        onComplete(data.itinerary, userResponses);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-500" />
          <h3 className="text-xl font-semibold mb-2">Creating Your Perfect Itinerary</h3>
          <p className="text-gray-600">Our AI is crafting a personalized travel plan just for you...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Travel Planning Assistant
        </CardTitle>
        <p className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </p>
      </CardHeader>
      <CardContent>
        {/* Chat History */}
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {chatHistory.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                item.type === 'question'
                  ? 'bg-blue-50 text-blue-800 ml-0 mr-8'
                  : 'bg-green-50 text-green-800 ml-8 mr-0'
              }`}
            >
              {item.text}
            </div>
          ))}
        </div>

        {/* Current Question */}
        {currentQuestion < QUESTIONS.length && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 text-blue-800 rounded-lg">
              {QUESTIONS[currentQuestion].question}
            </div>
            <div className="flex gap-2">
              <Input
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={QUESTIONS[currentQuestion].placeholder}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                className="flex-1"
              />
              <Button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}