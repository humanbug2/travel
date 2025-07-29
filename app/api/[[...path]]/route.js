import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { generateItinerary } from '@/lib/gemini';
import { v4 as uuidv4 } from 'uuid';
import { collection, doc, setDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"

// POST handler for generating itineraries
export async function POST(request, { params }) {
  const path = params.path || [];
  const endpoint = path.join('/');

  try {
    if (endpoint === 'generate-itinerary') {
      const { responses } = await request.json();

      if (!responses || !responses.destination) {
        return NextResponse.json({ 
          success: false, 
          error: 'Missing required fields' 
        }, { status: 400 });
      }
      console.log(responses, "Resp")

      // Generate itinerary using Gemini
      const itinerary = await generateItinerary(responses);
      console.log(itinerary, "it")

      // Save to Firestore
      const itineraryId = uuidv4();
      const itineraryDoc = {
        id: itineraryId,
        responses,
        itinerary,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "itineraries", itineraryId), itineraryDoc);

      return NextResponse.json({ 
        success: true, 
        itinerary,
        id: itineraryId
      });
    }

    // if (endpoint === 'itineraries') {
    //   // Get all itineraries
    //   // const client = await clientPromise;
    //   // const db = client.db(process.env.DB_NAME);
    //   // const collection = db.collection('itineraries');

    //   // Get all itineraries
    //   const querySnapshot = await getDocs(collection(db, "itineraries"));

    //   const itineraries = querySnapshot.docs
    //     .map(doc => ({
    //       id: doc.id,
    //       ...doc.data()
    //     }))
    //     .find({})
    //     .sort({ createdAt: -1 })
    //     .limit(20)
    //     .toArray();

    //   return NextResponse.json({ 
    //     success: true, 
    //     itineraries: itineraries.map(item => ({
    //       id: item.id,
    //       destination: item.responses?.destination,
    //       createdAt: item.createdAt
    //     }))
    //   });
    // }

    return NextResponse.json({ 
      success: false, 
      error: 'Endpoint not found' 
    }, { status: 404 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET handler for retrieving specific itinerary
export async function GET(request, { params }) {
  const path = params.path || [];
  const endpoint = path.join('/');

  try {
    if (endpoint.startsWith('itinerary/')) {
      const id = endpoint.split('/')[1];
      
      const client = await clientPromise;
      const db = client.db(process.env.DB_NAME);
      const collection = db.collection('itineraries');

      const itinerary = await collection.findOne({ id });

      if (!itinerary) {
        return NextResponse.json({ 
          success: false, 
          error: 'Itinerary not found' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        itinerary: {
          id: itinerary.id,
          responses: itinerary.responses,
          itinerary: itinerary.itinerary,
          createdAt: itinerary.createdAt
        }
      });
    }

    if (endpoint === 'health') {
      return NextResponse.json({ 
        success: true, 
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Endpoint not found' 
    }, { status: 404 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}