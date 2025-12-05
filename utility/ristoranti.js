/*
Key Features and Functionality
The Places API (New) is the current version, offering enhanced data and modern authentication methods. Key features include: 
Text Search: Search for places based on a text string, such as "Spicy Vegetarian Food in Sydney".
Nearby Search: Find places within a specified geographic area and place types (e.g., "pizza restaurant" in a specific radius).
Place Details: Get comprehensive information about a specific place using its unique place ID, including full address, phone number, user ratings, reviews, operating hours, and parking options.
Autocomplete: Provide type-ahead search behavior, predicting the name or address of a place as a user types, similar to the Google Maps search bar.
Place Photos: Access millions of high-quality photos stored in the Google Places database to enhance location listings in your app.
AI-powered Summaries: Access AI-generated summaries of places or areas to provide users with highlights from reviews or overviews of nearby attractions. 
*/


// API ENDPOINT API PLACES NEW API
// https://places.googleapis.com/v1/places:searchNearby

/*curl -X POST -d '{
  "includedTypes": ["restaurant"],
  "maxResultCount": 10,
  "locationRestriction": {
    "circle": {
      "center": {
        "latitude": 37.7937,
        "longitude": -122.3965},
      "radius": 500.0
    }
  }
}' \
-H 'Content-Type: application/json' -H "X-Goog-Api-Key: API_KEY" \
-H "X-Goog-FieldMask: places.displayName" \
https://places.googleapis.com/v1/places:searchNearby */

import {GOOGLE_API_KEY} from '../.devcontainer/config.js';
import fetch from 'node-fetch';

export async function getOpenRestaurantsCapri() {
    // Coordinate di Capri
    const lat = 40.5532;
    const lng = 14.2222;

    const url = 'https://places.googleapis.com/v1/places:searchNearby';
    const body = {
        includedTypes: ["restaurant"],
        //pageSize: 20,
        locationRestriction: {
            circle: {
                center: {
                    latitude: lat,
                    longitude: lng
                },
                radius: 2000.0 // metri
            }
        },
        openNow: true // Filtra solo quelli aperti
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.openingHours,places.rating'
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();

    // Restituisci solo nome, indirizzo e rating
    /*return (data.places || []).map(place => ({
        name: place.displayName?.text,
        address: place.formattedAddress,
        rating: place.rating,
        openingHours: place.openingHours
    }));*/
    console.log("Ristoranti aperti a Capri:", data);
    return data;
}
