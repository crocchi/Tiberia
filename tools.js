import fetch from 'node-fetch';
import {JSDOM } from 'jsdom';



//https://caprinews.it/?feed=rss2
//poco aggiorato...


//capripost 
//esecuzione ogni 24h
//https://www.capripost.it/feed/


//ferry
//capri-napoli
//https://www.capritourism.com/en/t/capri/napoli
//https://www.capritourism.com/en/t/napoli/capri


//https://www.facebook.com/InfoCollegamentiMarittimiEMeteo

// Mappatura per costruire gli URL corretti
const tratteMap = {
    "capri-napoli": "capri/napoli",
    "napoli-capri": "napoli/capri",
    "capri-sorrento": "capri/sorrento",
    "sorrento-capri": "sorrento/capri",
    "capri-ischia": "capri/ischia",
    "ischia-capri": "ischia/capri"
};
//navi capri napoli
//let el=document.querySelectorAll(".td.time .value")
//el[0].textContent



export async function fetchFerryTime(trattaKey) {
    const path = tratteMap[trattaKey];
    if (!path) {
        return JSON.stringify({ error: "Tratta non valida. Usa una delle seguenti: " + Object.keys(tratteMap).join(', ') });
    }

    const url = `https://www.naplesbayferry.com/it/t/${path}`;
    console.log(`Fetching data from: ${url}`);

    try {
        const response = await fetch(url);
        const text = await response.text();
        const dom = new JSDOM(text);
        
        const tratta = dom.window.document.querySelector(".hgroup > h2")?.textContent.trim();
        const orarioNodes = dom.window.document.querySelectorAll(".td.time .value");
        
        if (orarioNodes.length === 0) {
            return JSON.stringify({ tratta, message: "Nessun orario trovato per oggi." });
        }

        const ferryInfo = Array.from(orarioNodes).map((node, index) => {
            const row = node.closest('tr'); // Trova la riga genitore per cercare solo al suo interno
            return {
                orario: node.textContent.trim(),
                compagnia: row.querySelector(".td.company .value .company-name")?.textContent.trim(),
                durata: row.querySelector(".td.duration .value")?.textContent.trim(),
                porto: row.querySelector(".td.seaport .value span")?.textContent.trim(),
                prezzo: row.querySelector(".td.price .value")?.textContent.trim()
            };
        });
        
        // Restituiamo una stringa JSON, che è il formato migliore per l'AI
        return JSON.stringify(ferryInfo);

    } catch (error) {
        console.error("Error fetching ferry times:", error);
        return JSON.stringify({ error: "Impossibile recuperare gli orari dei traghetti." });
    }
}



const tratte =["capri/napoli" , "napoli/capri" , "capri/sorrento" , "capri/ischia" ];
export async function fetchFerryTimee() {
    try {
        const response = await fetch('https://www.naplesbayferry.com/it/t/capri/napoli');
        const text = await response.text();
        const dom = new JSDOM(text);
        //informazioni orari navi
        const tratta= dom.window.document.querySelector(".hgroup > h2").textContent.trim();
        const orario = dom.window.document.querySelectorAll(".td.time .value");
        const navi = dom.window.document.querySelectorAll(".td.ship .value");
        const durata = dom.window.document.querySelectorAll(".td.duration .value");
        const compagnia= dom.window.document.querySelectorAll(".td.company .value .company-name");
        const seaPort= dom.window.document.querySelectorAll(".td.seaport .value span");
        const note= dom.window.document.querySelectorAll(".td.notes .value") || [];
        const price= dom.window.document.querySelectorAll(".td.price .value") || [];

        //creo un file x l'ai per  memorizzazione informazioni sulle navi
        console.log(`Orari navi per la tratta: ${tratta}`);
        const ferryInfo = [];

        if (orario.length > 0) {
            orario.forEach((element, index) => {
                //console.log(element.textContent.trim());
                ferryInfo.push({
                    tratta,
                    orario: element.textContent.trim(),
                    navi: navi[index]?.textContent.trim(),
                    durata: durata[index]?.textContent.trim(),
                    compagnia: compagnia[index]?.textContent.trim(),
                    seaPort: seaPort[index]?.textContent.trim(),
                    note: note[index]?.textContent.trim(),
                    price: price[index]?.textContent.trim()
                });
            });
            console.log("Ferry Information:", ferryInfo);
        } else {
            console.log("Element not found");
        }
    } catch (error) {
        console.error("Error fetching the page:", error);
    }
}

//booking 
//https://www.naplesbayferry.com/it/ferry-booking?from=capri&to=sorrento&
// ferry_group=capri&one_way_date=29%2F11%2F2025&radio_way_type=on

/*

function calling example:
{
  "name": "getFerryTimes",
  "description": "Recupera gli orari dei traghetti in tempo reale per una specifica tratta. Usalo ogni volta che un utente chiede informazioni su navi, aliscafi o traghetti.",
  "strict": true,
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state e.g. San Francisco, CA"
      },
      "unit": {
        "type": "string",
        "enum": [
          "c",
          "f"
        ]
      }
    },
    "additionalProperties": false,
    "required": [
      "location",
      "unit"
    ]
  }
}


*/