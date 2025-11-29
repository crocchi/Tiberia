import fetch from 'node-fetch';
import JSDOM from 'jsdom';



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
        const el = dom.window.document.querySelectorAll(".td.time .value");
        if (el.length > 0) {
            el.forEach(element => {
                console.log(element.textContent.trim());
            });
        } else {
            console.log("Element not found");
        }
    } catch (error) {
        console.error("Error fetching the page:", error);
    }
}


