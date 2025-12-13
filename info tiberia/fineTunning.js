/*
{"messages":[
  {"role":"user","content":"Ciao!"},
  {"role":"assistant","content":"Ciao, come posso aiutarti?"},
  {"role":"user","content":"Come si arriva ad Anacapri?"},
  {"role":"assistant","content":"Puoi prendere un bus dal porto o salire a piedi."}
]}


//sempre tutto su una una riga
{"messages":[{"role":"user","content":"Quali sono le regole per i taxi a Capri?"},{"role":"assistant","content":"Il centro di Capri è pedonale al 100 %, i taxi ti lasciano al parcheggio e bon."}]}


{"messages":[
  {"role":"user","content":"Voglio sapere i ristoranti aperti a Capri."},
  {"role":"assistant","content":"{\"name\": \"searchRestaurants\", \"arguments\": {\"location\": \"Capri\", \"openNow\": true}}"},
  {"role":"assistant","content":"I ristoranti aperti a Capri sono: Ristorante A, Ristorante B, Ristorante C."},
  ]}


  {"messages":
  [{"role":"user","content":"What is the weather in San Francisco?"},
  {"role":"assistant","tool_calls":[{"id":"call_id","type":"function","function":{"name":"get_current_weather","arguments":"{\"location\": \"San Francisco, USA\", \"format\": \"celsius\"}"}}]}],"parallel_tool_calls":false,"tools":[{"type":"function","function":{"name":"get_current_weather","description":"Get the current weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The city and country, eg. San Francisco, USA"},"format":{"type":"string","enum":["celsius","fahrenheit"]}},"required":["location","format"]}}}]}
  
  
  
  
  */

let templateMsg = {
  "messages": [
     {
      "role": "system",
      "content": "You are a helpful assistant that helps people find information."
    },

    { 
      "role": "user",
      "content": "What is the weather in San Francisco?" },
    {
      "role": "assistant",
      "tool_calls": [
        {
          "id": "call_001",
          "type": "function",
          "function": {
            "name": "get_current_weather",
            "arguments": "{\"location\": \"San Francisco, USA\", \"format\": \"celsius\"}"
          }
        }
      ]
    },
    {
      "role": "tool",
      "tool_call_id": "call_001",
      "name": "get_current_weather",
      "content": "{\"temperature\": 19, \"condition\": \"soleggiato\", \"wind\": \"debole\"}"
    },
  { "role": "assistant", "content": "the weather look good today in San Francisco!" },

  ],
  "parallel_tool_calls": false,

  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
                "type": "string",
                "description": "The city and country, eg. San Francisco, USA"
            },
            "format": { "type": "string", "enum": ["celsius", "fahrenheit"] }
          },
          "required": ["location", "format"]
        }
      }
    }
  ]
}



let getFerryTimes_function = [
    {
      "type": "function",
      "function": {
        "name": "getFerryTimes",
        "description": "Recupera gli orari dei traghetti in tempo reale per una specifica tratta. Usalo ogni volta che un utente chiede informazioni su navi, aliscafi o traghetti.",
        "parameters": {
          "type": "object",
          "properties": {
            "trattaKey": {
              "type": "string",
              "description": "La tratta richiesta, nel formato 'partenza-destinazione'. Esempi validi: 'capri-napoli', 'napoli-capri', 'capri-sorrento', 'sorrento-capri', 'capri-ischia', 'ischia-capri'."
            }
          },
          "required": ["trattaKey"]
        }
      }
    }
  ]

let searchNews_function=[
    {
      "type": "function",
      "function": {
        "name": "searchNews",
        "description": "Cerca nel database delle news recenti di Capri in base alla domanda dell'utente.Usalo per rispondere a domande su cosa sta succedendo, novità, articoli sull'isola..",
        "parameters": {
          "type": "object",
          "properties": {
            "queryText": {
              "type": "string",
              "description": "La domanda specifica dell'utente da usare per la ricerca. Deve essere una frase completa, es: 'ci sono novità sui lavori al porto?'"
            }
          },
          "required": [
            "queryText"
          ]  
        }
      }
    }
  ]

  let getWeather_function=[
    {
      "type": "function",
      "function": {
        "name": "getWeather",
        "description": "Fornisce informazioni meteo aggiornate e le previsioni per i prossimi 3 giorni per l'isola di Capri o zone limitrofe. Usa questa funzione per aiutare i visitatori a pianificare escursioni, attività all'aperto, gite in barca e visite turistiche in base alle condizioni meteorologiche.",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "La località per cui vuoi il meteo, es: 'Capri, Italy'"
            }
          },
          "required": [
            "location"
          ]
        }
      }
    }
  ]

let searchWeather_function=[
    {
      "type": "function",
      "function":{
        "name": "searchWeather",
        "description": "Cerca nel database vettoriale meteo dell'isola di Capri per trovare informazioni storiche, previsioni passate o condizioni meteorologiche specifiche. Usa questa funzione per rispondere a domande avanzate sul meteo, come trend, eventi particolari o confronti tra giorni diversi.",
        "parameters": {
          "type": "object",
          "properties": {
            "queryText": {
              "type": "string",
              "description": "La domanda specifica dell'utente sul meteo, es: 'Quando ha piovuto di più?', 'Previsioni per il weekend', 'Giornate più calde di giugno'"
            }
          },
          "required": [
            "queryText"
          ]
        }
      }
    }
  ]
    

let searchEvent_function=[
    {
      "type": "function",
      "function": {
        "name": "searchEvent",
        "description": "Cerca nel database eventi recenti di Capri in base alla domanda dell'utente.Usalo per rispondere a domande su eventi culturali, feste locali, concerti, mostre d'arte e altre attività che si svolgono sull'isola.",
        "parameters": {
          "type": "object",
          "properties": {
            "queryText": {
              "type": "string",
              "description": "La domanda specifica dell'utente da usare per la ricerca. Deve essere una frase completa, es: 'ci sono eventi culturali questo weekend?'"
            }
          },
          "required": [
            "queryText"
          ]  
        }
      }
    }
  ]

  let prompt_Istrunction =`Tu sei TIBERIA, una giovane donna caprese di età misteriosa.  
Dicono che tu discenda in qualche modo dall’imperatore Tiberio, e che la tua famiglia abbia sempre vissuto lassù, tra Villa Jovis e il Salto di Tiberio.
Hai gli occhi color mare di gennaio e un sorriso che nasconde mille segreti dell’isola.

DATA E ORA: ogni messaggio inizia con [GG/MM/AAAA HH:MM:SS]. È la data/ora reale, usala sempre come riferimento assoluto per eventi, orari traghetti, meteo, aperture/chiusure, notizie,musei.

Parli per il 95% in italiano corretto e fluido, ma ogni tanto (massimo 5-10% del messaggio) butti dentro espressioni capresi leggere e senza preavviso.  
Non esagerare mai: devono solo far sentire il profumo di Capri, non creare confusione.

VOCABOLARIO CAPRESE AUTORIZZATO (queste e solo queste):
- Cià → ciao, bella!
- Uè uè → ehi ehi (per richiamare attenzione o scherzare)
- Mo’ → adesso, ora
- Chest’è → questo è tutto, punto
- Nun se ne parla → assolutamente no
- ’O ssaje → lo sai (retorico)

Carattere: ironica, pungente ma sempre gentile e mai offensiva.  
Proteggi i turisti come fossero cugini un po’ ingenui, spingi le esperienze autentiche, scoraggia con garbo le trappole turistiche e dai opinioni sincere e sui posti.

Sei la guida più aggiornata e affidabile che esista:
- Quando ti servono dati in tempo reale (meteo, orari traghetti/nave, notizie recenti) usa SEMPRE le funzioni disponibili (getWeather, getFerryTimes, searchNews) e riportali in modo naturale, come se stessi guardando il telefono in piazzetta.
Per queste informazioni devi SEMPRE consultare prima i file nel vector store e riportare SOLO ed ESATTAMENTE quello che c’è scritto lì dentro (mai inventare o “ricordare” cose che non trovi):
- Eventi natalizi, Capodanno, luminarie, mercatini, concerti → file “eventi natale 2025.docx”  
- Hotel, B&B, case vacanza aperti/chiusi, periodi di apertura → file “Alberghiaperti2025-2026.pdf”  
- Musei, ville, siti archeologici, orari, giorni di chiusura, prezzi biglietti → file “musei.docx”  

REGOLE FERREE (mai violare):
3. Rispondi come una persona vera: tono caldo, confidenziale, complice. Inizia spesso con «Senti…», «Cià…», «Uè uè…».
4. Se sbagli qualcosa, ammetti con ironia: «Hai ragione, mo’ ero distratta col vento… grazie dell’occhio!».
5. Niente elenchi, niente risposte da guida turistica fredda. Solo chiacchiere tra amici.

LINGUA – REGOLA D’ORO:
Rispondi SEMPRE ed ESATTAMENTE nella lingua in cui ti scrive l’utente. Zero eccezioni.
Quando NON parli italiano, NIENTE dialetto caprese.

REGOLE ANTI-ERRORE PER EVENTI E DATE (OBBLIGATORIE, SEMPRE):
- La data attuale è SEMPRE quella fornita daGLI user. NON assumere mai date diverse, anche se il file o le funzioni dicono altro.
- Prima di rispondere su eventi, meteo, orari o attrazioni: 
  1. Consulta il vector store/file specifico e filtra SOLO per la data esatta richiesta (es. "eventi del 5 dicembre 2025").
  2. Se non trovi eventi precisi per OGGI, di' onestamente: "Oggi è un po' tranquillo, niente di grosso in agenda, ma domani...". NON inventare o spostare eventi da altri giorni (es. niente "6 dicembre" se chiedono il 5).
  3. Usa la funzione searchNews per cross-check live: "Aspè che do 'na guardata alle news fresche...".
  4. Se il file ha elenchi generici (tipo "inizio dicembre"), specifica: "Il programma natalizio parte dal 6, ma per oggi ti consiglio un giro tranquillo ai Faraglioni".
- Se l'utente corregge un tuo errore (come hai fatto tu), rispondi umilmente ma con ironia: "Eh, hai ragione, mo' so' distratta co' 'stu vento di scirocco. Grazie pe' l'occhio – la prossima volta controllo duje volte!".
- Obiettivo: zero allucinazioni. Meglio dire "non lo so al 100%" che sbagliare e perdere fiducia.
`;


export{ getFerryTimes_function, searchNews_function, getWeather_function, searchWeather_function, searchEvent_function}