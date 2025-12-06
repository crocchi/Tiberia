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

import { GOOGLE_API_KEY } from '../.devcontainer/config.js';
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
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.currentOpeningHours,places.rating'
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
    console.log("Ristoranti aperti a Capri:", JSON.stringify(data));
    return data;
}



/*
Ristoranti aperti a Capri: {"places":
    [{"formattedAddress":"Via Palazzo a Mare, 11, 80076 Capri NA, Italy",
        "rating":4.2,
        "displayName":{"text":"Da Paolino","languageCode":"it"}},

        {"formattedAddress":"Via Lo Palazzo, 25, 80073 Capri NA, Italy",
            "rating":4.3,
            "displayName":{"text":"Ristorante Pizzeria Verginiello","languageCode":"it"}},
            {"formattedAddress":"Traversa Lo Palazzo, 2, 80073 Capri NA, Italy",
                "rating":4.5,
                "displayName":{"text":"Ristorante Panorama Capri","languageCode":"it"},
               
                "currentOpeningHours":{"openNow":false,

               // "nextOpenTime":"2025-12-06T11:00:00Z"}













               Ristoranti aperti a Capri: {"places":[{"formattedAddress":"Via Palazzo a Mare, 11, 80076 Capri NA, Italy","rating":4.2,"displayName":{"text":"Da Paolino","languageCode":"it"}},
                {"formattedAddress":"Via Lo Palazzo, 25, 80073 Capri NA, Italy","rating":4.3,"displayName":{"text":"Ristorante Pizzeria Verginiello","languageCode":"it"}},
                {"formattedAddress":"Traversa Lo Palazzo, 2, 80073 Capri NA, Italy","rating":4.5,"displayName":{"text":"Ristorante Panorama Capri","languageCode":"it"},"currentOpeningHours":{"openNow":false,"periods":[{"open":{"day":0,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":7}},"close":{"day":0,"hour":16,"minute":0,"date":{"year":2025,"month":12,"day":7}}},{"open":{"day":0,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":7}},"close":{"day":0,"hour":22,"minute":30,"date":{"year":2025,"month":12,"day":7}}},{"open":{"day":1,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":8}},"close":{"day":1,"hour":15,"minute":30,"date":{"year":2025,"month":12,"day":8}}},{"open":{"day":3,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":10}},"close":{"day":3,"hour":16,"minute":0,"date":{"year":2025,"month":12,"day":10}}},{"open":{"day":4,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":11}},"close":{"day":4,"hour":15,"minute":30,"date":{"year":2025,"month":12,"day":11}}},{"open":{"day":4,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":11}},"close":{"day":4,"hour":22,"minute":30,"date":{"year":2025,"month":12,"day":11}}},{"open":{"day":5,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":12}},"close":{"day":5,"hour":15,"minute":30,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":5,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":12}},"close":{"day":5,"hour":22,"minute":30,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":6,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":6}},"close":{"day":6,"hour":15,"minute":30,"date":{"year":2025,"month":12,"day":6}}},{"open":{"day":6,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":6}},"close":{"day":6,"hour":22,"minute":30,"date":{"year":2025,"month":12,"day":6}}}],"weekdayDescriptions":["Monday: 12:00 – 3:30 PM","Tuesday: Closed","Wednesday: 12:00 – 4:00 PM","Thursday: 12:00 – 3:30 PM, 7:00 – 10:30 PM","Friday: 12:00 – 3:30 PM, 7:00 – 10:30 PM","Saturday: 12:00 – 3:30 PM, 7:00 – 10:30 PM","Sunday: 12:00 – 4:00 PM, 7:00 – 10:30 PM"],"nextOpenTime":"2025-12-06T11:00:00Z"}},{"formattedAddress":"Capri Palace Jumeirah, Via Capodimonte, 14, Anacapri, Isola di Capri, 80071 Capri NA, Italy","rating":4.3,"displayName":{"text":"Zuma Capri","languageCode":"it"}},{"formattedAddress":"Via Giuseppe Orlandi, 182, 80071 Anacapri NA, Italy","rating":4.4,"displayName":{"text":"La Zagara","languageCode":"en"}},{"formattedAddress":"Via Gradola, 4, 80071 Anacapri NA, Italy","rating":4.3,"displayName":{"text":"Restaurant Il Riccio","languageCode":"en"}},{"formattedAddress":"Via le Botteghe, 14, 80073 Capri NA, Italy","rating":4.5,"displayName":{"text":"La capannina ristorante","languageCode":"en"}},{"formattedAddress":"Via Giuseppe Orlandi, 4, 80071 Anacapri NA, Italy","rating":4.8,"displayName":{"text":"Hotel Caesar Augustus","languageCode":"en"},"currentOpeningHours":{"openNow":true,"periods":[{"open":{"day":6,"hour":0,"minute":0,"truncated":true,"date":{"year":2025,"month":12,"day":6}},"close":{"day":5,"hour":23,"minute":59,"truncated":true,"date":{"year":2025,"month":12,"day":12}}}],"weekdayDescriptions":["Monday: Open 24 hours","Tuesday: Open 24 hours","Wednesday: Open 24 hours","Thursday: Open 24 hours","Friday: Open 24 hours","Saturday: Open 24 hours","Sunday: Open 24 hours"]}},{"formattedAddress":"Via Sella Orta, 6, 80073 Capri NA, Italy","rating":4.1,"displayName":{"text":"Villa Verde","languageCode":"it"}},{"formattedAddress":"Piazza Angelo Ferraro, 8, 80076 Capri NA, Italy","rating":4.8,"displayName":{"text":"Francuccio","languageCode":"en"},"currentOpeningHours":{"openNow":false,"periods":[{"open":{"day":0,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":7}},"close":{"day":1,"hour":0,"minute":0,"date":{"year":2025,"month":12,"day":8}}},{"open":{"day":1,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":8}},"close":{"day":2,"hour":0,"minute":0,"date":{"year":2025,"month":12,"day":9}}},{"open":{"day":2,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":9}},"close":{"day":3,"hour":0,"minute":0,"date":{"year":2025,"month":12,"day":10}}},{"open":{"day":3,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":10}},"close":{"day":4,"hour":0,"minute":0,"date":{"year":2025,"month":12,"day":11}}},{"open":{"day":4,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":11}},"close":{"day":5,"hour":0,"minute":0,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":5,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":12}},"close":{"day":5,"hour":23,"minute":59,"truncated":true,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":6,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":6}},"close":{"day":0,"hour":0,"minute":0,"date":{"year":2025,"month":12,"day":7}}}],"weekdayDescriptions":["Monday: 10:00 AM – 12:00 AM","Tuesday: 10:00 AM – 12:00 AM","Wednesday: 10:00 AM – 12:00 AM","Thursday: 10:00 AM – 12:00 AM","Friday: 10:00 AM – 12:00 AM","Saturday: 10:00 AM – 12:00 AM","Sunday: 10:00 AM – 12:00 AM"],"nextOpenTime":"2025-12-06T09:00:00Z"}},{"formattedAddress":"Piazza Umberto I, 4, 80073 Capri NA, Italy","rating":4.7,"displayName":{"text":"Pulalli","languageCode":"it"}},{"formattedAddress":"Via Fuorlovado, 18, 80073 Capri NA, Italy","rating":3.6,"displayName":{"text":"Aurora Capri","languageCode":"it"},"currentOpeningHours":{"openNow":false,"periods":[{"open":{"day":0,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":7}},"close":{"day":0,"hour":15,"minute":0,"date":{"year":2025,"month":12,"day":7}}},{"open":{"day":0,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":7}},"close":{"day":0,"hour":23,"minute":30,"date":{"year":2025,"month":12,"day":7}}},{"open":{"day":1,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":8}},"close":{"day":1,"hour":15,"minute":0,"date":{"year":2025,"month":12,"day":8}}},{"open":{"day":1,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":8}},"close":{"day":1,"hour":23,"minute":30,"date":{"year":2025,"month":12,"day":8}}},{"open":{"day":2,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":9}},"close":{"day":2,"hour":15,"minute":0,"date":{"year":2025,"month":12,"day":9}}},{"open":{"day":2,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":9}},"close":{"day":2,"hour":23,"minute":30,"date":{"year":2025,"month":12,"day":9}}},{"open":{"day":3,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":10}},"close":{"day":3,"hour":15,"minute":0,"date":{"year":2025,"month":12,"day":10}}},{"open":{"day":3,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":10}},"close":{"day":3,"hour":23,"minute":30,"date":{"year":2025,"month":12,"day":10}}},{"open":{"day":4,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":11}},"close":{"day":4,"hour":15,"minute":0,"date":{"year":2025,"month":12,"day":11}}},{"open":{"day":4,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":11}},"close":{"day":4,"hour":23,"minute":30,"date":{"year":2025,"month":12,"day":11}}},{"open":{"day":5,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":12}},"close":{"day":5,"hour":15,"minute":0,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":5,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":12}},"close":{"day":5,"hour":23,"minute":30,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":6,"hour":12,"minute":0,"date":{"year":2025,"month":12,"day":6}},"close":{"day":6,"hour":15,"minute":0,"date":{"year":2025,"month":12,"day":6}}},{"open":{"day":6,"hour":19,"minute":0,"date":{"year":2025,"month":12,"day":6}},"close":{"day":6,"hour":23,"minute":30,"date":{"year":2025,"month":12,"day":6}}}],"weekdayDescriptions":["Monday: 12:00 – 3:00 PM, 7:00 – 11:30 PM","Tuesday: 12:00 – 3:00 PM, 7:00 – 11:30 PM","Wednesday: 12:00 – 3:00 PM, 7:00 – 11:30 PM","Thursday: 12:00 – 3:00 PM, 7:00 – 11:30 PM","Friday: 12:00 – 3:00 PM, 7:00 – 11:30 PM","Saturday: 12:00 – 3:00 PM, 7:00 – 11:30 PM","Sunday: 12:00 – 3:00 PM, 7:00 – 11:30 PM"],"nextOpenTime":"2025-12-06T11:00:00Z"}},{"formattedAddress":"Via Migliara, 72, 80071 Anacapri NA, Italy","rating":4.5,"displayName":{"text":"Da Gelsomina - Ristorante","languageCode":"it"},"currentOpeningHours":{"openNow":false,"periods":[{"open":{"day":0,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":7}},"close":{"day":0,"hour":23,"minute":0,"date":{"year":2025,"month":12,"day":7}}},{"open":{"day":1,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":8}},"close":{"day":1,"hour":23,"minute":0,"date":{"year":2025,"month":12,"day":8}}},{"open":{"day":2,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":9}},"close":{"day":2,"hour":23,"minute":0,"date":{"year":2025,"month":12,"day":9}}},{"open":{"day":3,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":10}},"close":{"day":3,"hour":23,"minute":0,"date":{"year":2025,"month":12,"day":10}}},{"open":{"day":4,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":11}},"close":{"day":4,"hour":23,"minute":0,"date":{"year":2025,"month":12,"day":11}}},{"open":{"day":5,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":12}},"close":{"day":5,"hour":23,"minute":0,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":6,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":6}},"close":{"day":6,"hour":23,"minute":0,"date":{"year":2025,"month":12,"day":6}}}],"weekdayDescriptions":["Monday: 9:00 AM – 11:00 PM","Tuesday: 9:00 AM – 11:00 PM","Wednesday: 9:00 AM – 11:00 PM","Thursday: 9:00 AM – 11:00 PM","Friday: 9:00 AM – 11:00 PM","Saturday: 9:00 AM – 11:00 PM","Sunday: 9:00 AM – 11:00 PM"],"nextOpenTime":"2025-12-06T08:00:00Z"}},{"formattedAddress":"Via Matteotti, 8, 80073 Capri NA, Italy","rating":4.4,"displayName":{"text":"Ristorante Il Geranio Capri","languageCode":"it"}},{"formattedAddress":"Via Monsignor Carlo Serena, 9, 80073 Capri NA, Italy","rating":4.5,"displayName":{"text":"Hangout Capri","languageCode":"it"}},{"formattedAddress":"Piazzetta Fontana, 63, 80076 Capri NA, Italy","rating":4.8,"displayName":{"text":"La Focacciera Capri ( Porto )","languageCode":"it"},"currentOpeningHours":{"openNow":false,"periods":[{"open":{"day":1,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":8}},"close":{"day":1,"hour":14,"minute":30,"date":{"year":2025,"month":12,"day":8}}},{"open":{"day":2,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":9}},"close":{"day":2,"hour":14,"minute":30,"date":{"year":2025,"month":12,"day":9}}},{"open":{"day":3,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":10}},"close":{"day":3,"hour":14,"minute":30,"date":{"year":2025,"month":12,"day":10}}},{"open":{"day":4,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":11}},"close":{"day":4,"hour":14,"minute":30,"date":{"year":2025,"month":12,"day":11}}},{"open":{"day":5,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":12}},"close":{"day":5,"hour":14,"minute":30,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":6,"hour":10,"minute":0,"date":{"year":2025,"month":12,"day":6}},"close":{"day":6,"hour":14,"minute":30,"date":{"year":2025,"month":12,"day":6}}}],"weekdayDescriptions":["Monday: 10:00 AM – 2:30 PM","Tuesday: 10:00 AM – 2:30 PM","Wednesday: 10:00 AM – 2:30 PM","Thursday: 10:00 AM – 2:30 PM","Friday: 10:00 AM – 2:30 PM","Saturday: 10:00 AM – 2:30 PM","Sunday: Closed"],"nextOpenTime":"2025-12-06T09:00:00Z"}},{"formattedAddress":"Via Marina Grande, 80076 Capri NA, Italy","rating":4,"displayName":{"text":"Le Ondine Beach Club","languageCode":"it"},"currentOpeningHours":{"openNow":false,"periods":[{"open":{"day":0,"hour":9,"minute":30,"date":{"year":2025,"month":12,"day":7}},"close":{"day":0,"hour":18,"minute":0,"date":{"year":2025,"month":12,"day":7}}},{"open":{"day":1,"hour":9,"minute":30,"date":{"year":2025,"month":12,"day":8}},"close":{"day":1,"hour":18,"minute":0,"date":{"year":2025,"month":12,"day":8}}},{"open":{"day":2,"hour":9,"minute":30,"date":{"year":2025,"month":12,"day":9}},"close":{"day":2,"hour":18,"minute":0,"date":{"year":2025,"month":12,"day":9}}},{"open":{"day":3,"hour":9,"minute":30,"date":{"year":2025,"month":12,"day":10}},"close":{"day":3,"hour":18,"minute":0,"date":{"year":2025,"month":12,"day":10}}},{"open":{"day":4,"hour":9,"minute":30,"date":{"year":2025,"month":12,"day":11}},"close":{"day":4,"hour":18,"minute":0,"date":{"year":2025,"month":12,"day":11}}},{"open":{"day":5,"hour":9,"minute":30,"date":{"year":2025,"month":12,"day":12}},"close":{"day":5,"hour":18,"minute":0,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":6,"hour":9,"minute":30,"date":{"year":2025,"month":12,"day":6}},"close":{"day":6,"hour":18,"minute":0,"date":{"year":2025,"month":12,"day":6}}}],"weekdayDescriptions":["Monday: 9:30 AM – 6:00 PM","Tuesday: 9:30 AM – 6:00 PM","Wednesday: 9:30 AM – 6:00 PM","Thursday: 9:30 AM – 6:00 PM","Friday: 9:30 AM – 6:00 PM","Saturday: 9:30 AM – 6:00 PM","Sunday: 9:30 AM – 6:00 PM"],"nextOpenTime":"2025-12-06T08:30:00Z"}},{"formattedAddress":"Via Mulo, 76, 80076 Capri NA, Italy","rating":3.9,"displayName":{"text":"La Palma Beach Club","languageCode":"en"},"currentOpeningHours":{"openNow":false,"periods":[{"open":{"day":0,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":7}},"close":{"day":0,"hour":18,"minute":30,"date":{"year":2025,"month":12,"day":7}}},{"open":{"day":1,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":8}},"close":{"day":1,"hour":18,"minute":30,"date":{"year":2025,"month":12,"day":8}}},{"open":{"day":2,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":9}},"close":{"day":2,"hour":18,"minute":30,"date":{"year":2025,"month":12,"day":9}}},{"open":{"day":3,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":10}},"close":{"day":3,"hour":18,"minute":30,"date":{"year":2025,"month":12,"day":10}}},{"open":{"day":4,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":11}},"close":{"day":4,"hour":18,"minute":30,"date":{"year":2025,"month":12,"day":11}}},{"open":{"day":5,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":12}},"close":{"day":5,"hour":18,"minute":30,"date":{"year":2025,"month":12,"day":12}}},{"open":{"day":6,"hour":9,"minute":0,"date":{"year":2025,"month":12,"day":6}},"close":{"day":6,"hour":18,"minute":30,"date":{"year":2025,"month":12,"day":6}}}],"weekdayDescriptions":["Monday: 9:00 AM – 6:30 PM","Tuesday: 9:00 AM – 6:30 PM","Wednesday: 9:00 AM – 6:30 PM","Thursday: 9:00 AM – 6:30 PM","Friday: 9:00 AM – 6:30 PM","Saturday: 9:00 AM – 6:30 PM","Sunday: 9:00 AM – 6:30 PM"],"nextOpenTime":"2025-12-06T08:00:00Z"}},{"formattedAddress":"Via Giuseppe Orlandi, 73, 80071 Anacapri NA, Italy","rating":4.7,"displayName":{"text":"Sciue' Sciue'","languageCode":"it"}},{"formattedAddress":"Via Padre Serafino Cimmino, 6, 80076 Capri NA, Italy","rating":3.3,"displayName":{"text":"Concettina ai Tre Santi","languageCode":"it"}}]}

               */