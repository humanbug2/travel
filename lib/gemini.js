import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateItinerary(userResponses) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
    
    Format the response as a detailed JSON object with day-wise breakdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate itinerary');
  }
}