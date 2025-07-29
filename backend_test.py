#!/usr/bin/env python3
"""
Backend API Testing for Travel Itinerary Planner
Tests all backend endpoints and integrations
"""

import requests
import json
import time
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://d3f8fe24-50de-4990-a640-4a91c24e294d.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_health_endpoint():
    """Test the health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'timestamp' in data:
                print("✅ Health endpoint working correctly")
                return True
            else:
                print("❌ Health endpoint response format incorrect")
                return False
        else:
            print(f"❌ Health endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health endpoint error: {str(e)}")
        return False

def test_generate_itinerary():
    """Test the generate-itinerary endpoint with sample data"""
    print("\n=== Testing Generate Itinerary Endpoint ===")
    
    # Sample travel data as requested
    sample_data = {
        "responses": {
            "destination": "Paris, France",
            "travelDates": "December 15-22, 2024",
            "budget": "$2000-3000",
            "travelStyle": "Cultural and romantic",
            "interests": "Museums, fine dining, historic sites"
        }
    }
    
    try:
        print(f"Sending request to: {API_BASE}/generate-itinerary")
        print(f"Request data: {json.dumps(sample_data, indent=2)}")
        
        response = requests.post(
            f"{API_BASE}/generate-itinerary",
            json=sample_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if data.get('success') and 'itinerary' in data and 'id' in data:
                print("✅ Generate itinerary endpoint working correctly")
                print(f"Generated itinerary ID: {data['id']}")
                print(f"Itinerary preview: {str(data['itinerary'])[:200]}...")
                return True, data['id']
            else:
                print("❌ Generate itinerary response format incorrect")
                print(f"Response: {data}")
                return False, None
        else:
            print(f"❌ Generate itinerary failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error response: {error_data}")
            except:
                print(f"Raw response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Generate itinerary error: {str(e)}")
        return False, None

def test_get_itineraries():
    """Test the get all itineraries endpoint"""
    print("\n=== Testing Get All Itineraries Endpoint ===")
    
    try:
        response = requests.post(f"{API_BASE}/itineraries", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if data.get('success') and 'itineraries' in data:
                print(f"✅ Get itineraries endpoint working correctly")
                print(f"Found {len(data['itineraries'])} itineraries")
                return True
            else:
                print("❌ Get itineraries response format incorrect")
                return False
        else:
            print(f"❌ Get itineraries failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Get itineraries error: {str(e)}")
        return False

def test_get_specific_itinerary(itinerary_id):
    """Test getting a specific itinerary by ID"""
    print(f"\n=== Testing Get Specific Itinerary (ID: {itinerary_id}) ===")
    
    if not itinerary_id:
        print("❌ No itinerary ID provided, skipping test")
        return False
    
    try:
        response = requests.get(f"{API_BASE}/itinerary/{itinerary_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if data.get('success') and 'itinerary' in data:
                itinerary_data = data['itinerary']
                required_fields = ['id', 'responses', 'itinerary', 'createdAt']
                if all(field in itinerary_data for field in required_fields):
                    print("✅ Get specific itinerary endpoint working correctly")
                    return True
                else:
                    print("❌ Get specific itinerary missing required fields")
                    return False
            else:
                print("❌ Get specific itinerary response format incorrect")
                return False
        else:
            print(f"❌ Get specific itinerary failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Get specific itinerary error: {str(e)}")
        return False

def test_error_handling():
    """Test error handling for invalid requests"""
    print("\n=== Testing Error Handling ===")
    
    # Test missing required fields
    print("Testing missing required fields...")
    try:
        response = requests.post(
            f"{API_BASE}/generate-itinerary",
            json={"responses": {}},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 400:
            data = response.json()
            if not data.get('success') and 'error' in data:
                print("✅ Error handling for missing fields working correctly")
            else:
                print("❌ Error response format incorrect")
                return False
        else:
            print(f"❌ Expected 400 status code, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error handling test failed: {str(e)}")
        return False
    
    # Test invalid endpoint
    print("Testing invalid endpoint...")
    try:
        response = requests.get(f"{API_BASE}/invalid-endpoint", timeout=10)
        
        if response.status_code == 404:
            data = response.json()
            if not data.get('success') and 'error' in data:
                print("✅ Error handling for invalid endpoint working correctly")
                return True
            else:
                print("❌ Error response format incorrect")
                return False
        else:
            print(f"❌ Expected 404 status code, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error handling test failed: {str(e)}")
        return False

def test_database_connectivity():
    """Test database connectivity by checking if data persists"""
    print("\n=== Testing Database Connectivity ===")
    
    # Generate an itinerary first
    success, itinerary_id = test_generate_itinerary()
    if not success:
        print("❌ Cannot test database connectivity - itinerary generation failed")
        return False
    
    # Wait a moment for database write
    time.sleep(2)
    
    # Try to retrieve the itinerary
    if test_get_specific_itinerary(itinerary_id):
        print("✅ Database connectivity working - data persisted and retrieved")
        return True
    else:
        print("❌ Database connectivity issue - data not persisted or retrievable")
        return False

def run_all_tests():
    """Run all backend tests"""
    print("=" * 60)
    print("TRAVEL ITINERARY PLANNER - BACKEND API TESTS")
    print("=" * 60)
    print(f"Testing API at: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    test_results = {}
    
    # Test 1: Health endpoint
    test_results['health'] = test_health_endpoint()
    
    # Test 2: Generate itinerary (includes Gemini API integration)
    success, itinerary_id = test_generate_itinerary()
    test_results['generate_itinerary'] = success
    
    # Test 3: Get all itineraries
    test_results['get_itineraries'] = test_get_itineraries()
    
    # Test 4: Get specific itinerary
    test_results['get_specific_itinerary'] = test_get_specific_itinerary(itinerary_id)
    
    # Test 5: Error handling
    test_results['error_handling'] = test_error_handling()
    
    # Test 6: Database connectivity
    test_results['database_connectivity'] = test_database_connectivity()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend tests passed!")
        return True
    else:
        print("⚠️  Some backend tests failed")
        return False

if __name__ == "__main__":
    run_all_tests()