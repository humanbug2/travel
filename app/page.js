'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logout } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Chatbot } from '@/components/chatbot';
import Markdown from 'react-markdown';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  Plane, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Users, 
  Star,
  LogOut,
  User,
  Map,
  Clock
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [userResponses, setUserResponses] = useState(null);
  const itineraryRef = useRef(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      console.log('Starting sign-in process...');
      const result = await signInWithGoogle();
      console.log('Sign-in successful!', result);
    } catch (error) {
      console.error('Sign-in failed:', error);
      // Show user-friendly error message
      alert(`Sign-in failed: ${error.message}`);
    }
  };

  const handleStartPlanning = () => {
    if (user) {
      setShowChatbot(true);
    } else {
      handleSignIn();
    }
  };

  const handleItineraryComplete = (itinerary, responses) => {
    setGeneratedItinerary(itinerary);
    setUserResponses(responses);
    setShowChatbot(false);
  };

  const handleStartOver = () => {
    setShowChatbot(false);
    setGeneratedItinerary(null);
    setUserResponses(null);
  };

  const handleDownloadPDF = async () => {
    const element = itineraryRef.current;
    const pdf = new jsPDF("p", "mm", "a4");
    const padding = 10;
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * padding;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let position = 0;

    if (pdfHeight < pageHeight) {
      pdf.addImage(imgData, "PNG", padding, padding, pdfWidth, pdfHeight);
    } else {
      // Split into multiple pages
      let heightLeft = pdfHeight;

      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", padding, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;

        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
    }

    pdf.save(`itinerary_${userResponses?.destination}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (generatedItinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <AnimatedBackground />
        
        {/* Header */}
        <header className="relative z-10 p-6 border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">TravelCraft</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.displayName || 'Traveler'}!
              </span>
              <Button variant="outline" onClick={handleStartOver}>
                Plan New Trip
              </Button>
              <Button variant="ghost" onClick={() => logout()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Itinerary Display */}
        <main className="relative z-10 container mx-auto p-6" ref={itineraryRef}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Your Perfect Trip to {userResponses?.destination.toUpperCase()}
              </h1>
              <div className="flex justify-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {userResponses?.travelDates.toUpperCase()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {userResponses?.travelStyle.toUpperCase()}
                </span>
              </div>
            </div>
            <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            {/* <Download className="w-4 h-4 mr-2" /> */}
            Download as PDF
          </button>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    <Markdown>{generatedItinerary}</Markdown>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (showChatbot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <AnimatedBackground />
        
        {/* Header */}
        <header className="relative z-10 mb-8">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">TravelCraft</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.displayName || 'Traveler'}!
              </span>
              <Button variant="ghost" onClick={() => setShowChatbot(false)}>
                Back
              </Button>
              <Button variant="ghost" onClick={() => logout()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Chatbot */}
        <main className="relative z-10 container mx-auto">
          <Chatbot onComplete={handleItineraryComplete} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plane className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800">TravelCraft</span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.displayName || 'Traveler'}!
              </span>
              <Button variant="ghost" onClick={() => logout()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Craft Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 block">
                Travel Adventure
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Let our AI travel assistant create personalized itineraries that match your dreams, budget, and style. 
              Every journey begins with a single question.
            </p>
            
            <Button 
              onClick={handleStartPlanning}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {user ? 'Start Planning' : 'Sign In & Start Planning'}
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Why Choose TravelCraft?
              </h2>
              <p className="text-xl text-gray-600">
                Experience the future of travel planning
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">AI-Powered Intelligence</h3>
                  <p className="text-gray-600">
                    Our advanced AI understands your preferences and creates unique itineraries tailored just for you.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Instant Planning</h3>
                  <p className="text-gray-600">
                    Get your complete travel itinerary in minutes, not hours. Just answer 5 simple questions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Map className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Itineraries</h3>
                  <p className="text-gray-600">
                    Day-by-day plans with activities, restaurants, costs, and local insights for the perfect trip.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 text-white">
              <h2 className="text-4xl font-bold mb-6">
                Ready for Your Next Adventure?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of travelers who've discovered their perfect trips with TravelCraft
              </p>
              <Button 
                onClick={handleStartPlanning}
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <MapPin className="w-5 h-5 mr-2" />
                {user ? 'Start Your Journey' : 'Sign In to Begin'}
              </Button>
            </div>
          </div>
        </section>

        {/* Travel Images */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative group overflow-hidden rounded-2xl">
              <img 
                src="https://images.unsplash.com/photo-1707344088547-3cf7cea5ca49?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MXwxfHNlYXJjaHwxfHx0cmF2ZWx8ZW58MHx8fHwxNzUzNzE4MzU2fDA&ixlib=rb-4.1.0&q=85"
                alt="Desert Adventure"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl">
              <img 
                src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHx0cmF2ZWx8ZW58MHx8fHwxNzUzNzE4MzU2fDA&ixlib=rb-4.1.0&q=85"
                alt="Airplane Journey"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl">
              <img 
                src="https://images.unsplash.com/photo-1528543606781-2f6e6857f318?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxhZHZlbnR1cmV8ZW58MHx8fHwxNzUzODAyOTYyfDA&ixlib=rb-4.1.0&q=85"
                alt="Mountain Adventure"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl">
              <img 
                src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxhZHZlbnR1cmV8ZW58MHx8fHwxNzUzODAyOTYyfDA&ixlib=rb-4.1.0&q=85"
                alt="Hiking Adventure"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="w-6 h-6" />
            <span className="text-xl font-bold">TravelCraft</span>
          </div>
          <p className="text-gray-400">
            Crafting unforgettable journeys with AI-powered personalization
          </p>
        </div>
      </footer>
    </div>
  );
}