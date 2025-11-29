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


//navi capri napoli
//let el=document.querySelectorAll(".td.time .value")
//el[0].textContent
export async function fetchFerryTime() {
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
                console.log(element.textContent.trim());
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


