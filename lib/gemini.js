import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateItinerary(userResponses) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Create a detailed travel itinerary based on these user preferences:
    
    Destination: ${userResponses.destination}
    Travel Dates: ${userResponses.travelDates}
    Budget Range: ${userResponses.budget}
    Travel Style: ${userResponses.travelStyle}
    Interests: ${userResponses.interests}
    
    Please create a day-by-day itinerary with:
    - Morning, afternoon, and evening activities
    - Restaurant recommendations
    - Transportation tips
    - Estimated costs
    - Local tips and cultural insights
    
    Make it engaging and detailed. Format it as readable text, not JSON.
  `;

  try {
    console.log('Calling Gemini API with model: gemini-2.5-flash');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini API response received successfully');
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('Error details:', error.message);
    throw new Error(`Failed to generate itinerary: ${error.message}`);
  }
}