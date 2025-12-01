
//https://www.capripost.it/wp-json/wp/v2/posts?per_page=1

//https://www.capripost.it/wp-json/wp/v2/posts?
//after=2025-11-30T00:00:00&before=2025-12-01T00:00:00
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { processAndSaveToPinecone } from '../DB/pineconeDB.js'; // Importiamo la funzione per salvare su Pinecone



const getDateToUpdate = ()=>{
    const dataItaliana = new Date().toLocaleDateString("it-IT", {
      timeZone: "Europe/Rome",
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    });
    return `${dataItaliana.slice(0,10)}T00:00:00`;
}

function getTextFromHtml(htmlString) {
    if (!htmlString) return '';
    const dom = new JSDOM(htmlString);
    dom.window.document.querySelectorAll('script, style, img, ins').forEach(el => el.remove());
    return dom.window.document.body.textContent.replace(/\s\s+/g, ' ').trim();
}

let categories=7;//eventi
let url=`https://www.capripost.it/wp-json/wp/v2/posts?categories=${categories}&after=${getDateToUpdate()}`;
url=`https://www.capripost.it/wp-json/wp/v2/posts?categories=${categories}&after=2025-11-25T00:00:00`;

/**https://www.capripost.it/wp-json/wp/v2/posts?categories=7&after=2025-11-30T00:00:00
 * Scarica gli eventi del giorno, li processa e li salva su Pinecone.
 */
export async function fetchAndIndexEvents() {
    console.log('Esecuzione task: aggiornamento eventi di Capri...');
    
    
    // Costruisci l'URL per ottenere i post di oggi nella categoria "Eventi"
    //const url = `${API_BASE_URL}?categories=${EVENTS_CATEGORY_ID}&after=${startOfDay}&before=${endOfDay}&per_page=100`;
    
    console.log(`Fetching eventi da: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        const events = await response.json();

        if (!events || events.length === 0) {
            console.log('Nessun nuovo evento trovato per oggi.');
            return;
        }

        console.log(`Trovati ${events.length} eventi. Inizio processamento per Pinecone.`);

        // Formatta i dati per il salvataggio
        const formattedEvents = events.map(event => ({
            title: event.title.rendered,
            link: event.link,
            pubDate: event.date,
            snippet: getTextFromHtml(event.content.rendered).substring(0, 800) + '...'
        }));

        // Definisci come estrarre il testo per l'embedding
        const eventTextExtractor = (item) => `Title: ${item.title}. Snippet: ${item.snippet}`;

        // Chiama la funzione per generare embeddings e salvare su Pinecone
        await processAndSaveToPinecone(formattedEvents, eventTextExtractor);

    } catch (error) {
        console.error("Errore durante l'aggiornamento degli eventi:", error);
    }
}




/*[
  {
    "id": 22177,
    "date": "2025-11-30T18:24:00",
    "date_gmt": "2025-11-30T17:24:00",
    "guid": {
      "rendered": "https://www.capripost.it/?p=22177"
    },
    "modified": "2025-11-30T18:24:00",
    "modified_gmt": "2025-11-30T17:24:00",
    "slug": "il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975",
    "status": "publish",
    "type": "post",
    "link": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/",
    "title": {
      "rendered": "Il party dei 50enni sull&#8217;isola di Capri: in festa i nati nel 1975"
    },
    "content": {
      "rendered": "\u003Ch4 dir=\"auto\"\u003EGrande festa sull&#8217;isola di Capri per tutti i nati nel 1975, coloro che hanno compiuto o compiranno 50 anni nel 2025. Gli organizzatori ringraziano don Marino De Rosa per la celebrazione della santa messa che ha avuto un momento commovente nel ricordo di alcuni 50enni che non ci sono più e a cui è stata dedicata la messa messa in suffragio: Costanzo Federico (Pataniello), Pierangelo Maresca, Massimo Apuzzo, Monica Maresca, Jessica Scarpati e Pietro Aprea. Gli organizzatori ringraziano il locale che ha ospitato la festa, la Lanterna Verde di Anacapri, con tutto il suo staff, ed in particolar modo Lorenzo Coppola, che ha deliziato i presenti con le proprie specialità, i dj dell&#8217;UnderGround Family Alessandro D&#8217;Ambrosio, Antonio D&#8217;Angiola e e Filippo Scoppa che hanno fatto ballare tutti i presenti dall&#8217;inizio fino alla fine, la guest star Daniele Vitale che con il suo sax ha regalato momenti incredibili e unici, poi Adelmo Viva per la torta e la Capri Party planner per l&#8217;allestimento.\u003C/h4\u003E\n\u003Cp\u003E\u003Cimg decoding=\"async\" loading=\"lazy\" class=\"aligncenter wp-image-22181 size-large\" src=\"https://www.capripost.it/wp-content/uploads/2025/11/590269436_10237803097831938_8450338662893737731_n-1024x768.jpg\" alt=\"\" width=\"640\" height=\"480\" srcset=\"https://www.capripost.it/wp-content/uploads/2025/11/590269436_10237803097831938_8450338662893737731_n-1024x768.jpg 1024w, https://www.capripost.it/wp-content/uploads/2025/11/590269436_10237803097831938_8450338662893737731_n-300x225.jpg 300w, https://www.capripost.it/wp-content/uploads/2025/11/590269436_10237803097831938_8450338662893737731_n-768x576.jpg 768w, https://www.capripost.it/wp-content/uploads/2025/11/590269436_10237803097831938_8450338662893737731_n-1536x1152.jpg 1536w, https://www.capripost.it/wp-content/uploads/2025/11/590269436_10237803097831938_8450338662893737731_n-720x540.jpg 720w, https://www.capripost.it/wp-content/uploads/2025/11/590269436_10237803097831938_8450338662893737731_n.jpg 1600w\" sizes=\"auto, (max-width: 640px) 100vw, 640px\" /\u003E\u003C/p\u003E\n\u003Cp\u003E&nbsp;\u003C/p\u003E\n\u003Cp\u003E\u003Cscript async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3544778154896467\" crossorigin=\"anonymous\"\u003E\u003C/script\u003E\u003Cbr /\u003E\n\u003Cins class=\"adsbygoogle\" style=\"display: block;\" data-ad-format=\"fluid\" data-ad-layout-key=\"-58+c5-5p-h2+1p5\" data-ad-client=\"ca-pub-3544778154896467\" data-ad-slot=\"9999242541\"\u003E\u003C/ins\u003E\u003Cbr /\u003E\n\u003Cscript\u003E\n     (adsbygoogle = window.adsbygoogle || []).push({});\n\u003C/script\u003E\u003C/p\u003E\n\u003Cp\u003E\u003Cscript async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3544778154896467\" crossorigin=\"anonymous\"\u003E\u003C/script\u003E\u003Cbr /\u003E\n\u003Cins class=\"adsbygoogle\" style=\"display: block;\" data-ad-format=\"autorelaxed\" data-ad-client=\"ca-pub-3544778154896467\" data-ad-slot=\"3228135859\"\u003E\u003C/ins\u003E\u003Cbr /\u003E\n\u003Cscript\u003E\n     (adsbygoogle = window.adsbygoogle || []).push({});\n\u003C/script\u003E\u003C/p\u003E\n",
      "protected": false
    },
    "excerpt": {
      "rendered": "\u003Cp\u003EGrande festa sull&#8217;isola di Capri per tutti i nati nel 1975, coloro che hanno compiuto\u003C/p\u003E\n",
      "protected": false
    },
    "author": 1,
    "featured_media": 22182,
    "comment_status": "open",
    "ping_status": "open",
    "sticky": false,
    "template": "",
    "format": "standard",
    "meta": {
      "footnotes": ""
    },
    "categories": [6],
    "tags": [4114, 673, 21, 10, 521, 1572],
    "class_list": [
      "post-22177",
      "post",
      "type-post",
      "status-publish",
      "format-standard",
      "has-post-thumbnail",
      "hentry",
      "category-eventi",
      "tag-4114",
      "tag-50enni",
      "tag-anacapri",
      "tag-capri",
      "tag-festa",
      "tag-party"
    ],
    "yoast_head": "\u003C!-- This site is optimized with the Yoast SEO plugin v26.4 - https://yoast.com/wordpress/plugins/seo/ --\u003E\n\u003Ctitle\u003EIl party dei 50enni sull&#039;isola di Capri: in festa i nati nel 1975 - Capri Post\u003C/title\u003E\n\u003Cmeta name=\"robots\" content=\"index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1\" /\u003E\n\u003Clink rel=\"canonical\" href=\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/\" /\u003E\n\u003Cmeta property=\"og:locale\" content=\"it_IT\" /\u003E\n\u003Cmeta property=\"og:type\" content=\"article\" /\u003E\n\u003Cmeta property=\"og:title\" content=\"Il party dei 50enni sull&#039;isola di Capri: in festa i nati nel 1975 - Capri Post\" /\u003E\n\u003Cmeta property=\"og:description\" content=\"Grande festa sull&#8217;isola di Capri per tutti i nati nel 1975, coloro che hanno compiuto\" /\u003E\n\u003Cmeta property=\"og:url\" content=\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/\" /\u003E\n\u003Cmeta property=\"og:site_name\" content=\"Capri Post\" /\u003E\n\u003Cmeta property=\"article:published_time\" content=\"2025-11-30T17:24:00+00:00\" /\u003E\n\u003Cmeta property=\"og:image\" content=\"https://www.capripost.it/wp-content/uploads/2025/11/592189733_10237803098231948_1175388281144916159_n.jpg\" /\u003E\n\t\u003Cmeta property=\"og:image:width\" content=\"1368\" /\u003E\n\t\u003Cmeta property=\"og:image:height\" content=\"911\" /\u003E\n\t\u003Cmeta property=\"og:image:type\" content=\"image/jpeg\" /\u003E\n\u003Cmeta name=\"author\" content=\"capri post\" /\u003E\n\u003Cmeta name=\"twitter:card\" content=\"summary_large_image\" /\u003E\n\u003Cmeta name=\"twitter:label1\" content=\"Scritto da\" /\u003E\n\t\u003Cmeta name=\"twitter:data1\" content=\"capri post\" /\u003E\n\t\u003Cmeta name=\"twitter:label2\" content=\"Tempo di lettura stimato\" /\u003E\n\t\u003Cmeta name=\"twitter:data2\" content=\"2 minuti\" /\u003E\n\u003Cscript type=\"application/ld+json\" class=\"yoast-schema-graph\"\u003E{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"WebPage\",\"@id\":\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/\",\"url\":\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/\",\"name\":\"Il party dei 50enni sull'isola di Capri: in festa i nati nel 1975 - Capri Post\",\"isPartOf\":{\"@id\":\"https://www.capripost.it/#website\"},\"primaryImageOfPage\":{\"@id\":\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#primaryimage\"},\"image\":{\"@id\":\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#primaryimage\"},\"thumbnailUrl\":\"https://www.capripost.it/wp-content/uploads/2025/11/592189733_10237803098231948_1175388281144916159_n.jpg\",\"datePublished\":\"2025-11-30T17:24:00+00:00\",\"author\":{\"@id\":\"https://www.capripost.it/#/schema/person/6ab9461291eef95cce0fd03f14d7f40c\"},\"breadcrumb\":{\"@id\":\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#breadcrumb\"},\"inLanguage\":\"it-IT\",\"potentialAction\":[{\"@type\":\"ReadAction\",\"target\":[\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/\"]}]},{\"@type\":\"ImageObject\",\"inLanguage\":\"it-IT\",\"@id\":\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#primaryimage\",\"url\":\"https://www.capripost.it/wp-content/uploads/2025/11/592189733_10237803098231948_1175388281144916159_n.jpg\",\"contentUrl\":\"https://www.capripost.it/wp-content/uploads/2025/11/592189733_10237803098231948_1175388281144916159_n.jpg\",\"width\":1368,\"height\":911},{\"@type\":\"BreadcrumbList\",\"@id\":\"https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#breadcrumb\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Home\",\"item\":\"https://www.capripost.it/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Il party dei 50enni sull&#8217;isola di Capri: in festa i nati nel 1975\"}]},{\"@type\":\"WebSite\",\"@id\":\"https://www.capripost.it/#website\",\"url\":\"https://www.capripost.it/\",\"name\":\"Capri Post\",\"description\":\"News in tempo reale dall&#039;isola di Capri\",\"potentialAction\":[{\"@type\":\"SearchAction\",\"target\":{\"@type\":\"EntryPoint\",\"urlTemplate\":\"https://www.capripost.it/?s={search_term_string}\"},\"query-input\":{\"@type\":\"PropertyValueSpecification\",\"valueRequired\":true,\"valueName\":\"search_term_string\"}}],\"inLanguage\":\"it-IT\"},{\"@type\":\"Person\",\"@id\":\"https://www.capripost.it/#/schema/person/6ab9461291eef95cce0fd03f14d7f40c\",\"name\":\"capri post\",\"image\":{\"@type\":\"ImageObject\",\"inLanguage\":\"it-IT\",\"@id\":\"https://www.capripost.it/#/schema/person/image/\",\"url\":\"https://secure.gravatar.com/avatar/0e18271785571c0d18540ea1e5a8e90c0fc3b9aa51e6529c63aff7e703e5ee66?s=96&d=mm&r=g\",\"contentUrl\":\"https://secure.gravatar.com/avatar/0e18271785571c0d18540ea1e5a8e90c0fc3b9aa51e6529c63aff7e703e5ee66?s=96&d=mm&r=g\",\"caption\":\"capri post\"},\"sameAs\":[\"https://www.capripost.it\"],\"url\":\"https://www.capripost.it/author/wp_10031831/\"}]}\u003C/script\u003E\n\u003C!-- / Yoast SEO plugin. --\u003E",
    "yoast_head_json": {
      "title": "Il party dei 50enni sull'isola di Capri: in festa i nati nel 1975 - Capri Post",
      "robots": {
        "index": "index",
        "follow": "follow",
        "max-snippet": "max-snippet:-1",
        "max-image-preview": "max-image-preview:large",
        "max-video-preview": "max-video-preview:-1"
      },
      "canonical": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/",
      "og_locale": "it_IT",
      "og_type": "article",
      "og_title": "Il party dei 50enni sull'isola di Capri: in festa i nati nel 1975 - Capri Post",
      "og_description": "Grande festa sull&#8217;isola di Capri per tutti i nati nel 1975, coloro che hanno compiuto",
      "og_url": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/",
      "og_site_name": "Capri Post",
      "article_published_time": "2025-11-30T17:24:00+00:00",
      "og_image": [
        {
          "width": 1368,
          "height": 911,
          "url": "https://www.capripost.it/wp-content/uploads/2025/11/592189733_10237803098231948_1175388281144916159_n.jpg",
          "type": "image/jpeg"
        }
      ],
      "author": "capri post",
      "twitter_card": "summary_large_image",
      "twitter_misc": {
        "Scritto da": "capri post",
        "Tempo di lettura stimato": "2 minuti"
      },
      "schema": {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/",
            "url": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/",
            "name": "Il party dei 50enni sull'isola di Capri: in festa i nati nel 1975 - Capri Post",
            "isPartOf": {
              "@id": "https://www.capripost.it/#website"
            },
            "primaryImageOfPage": {
              "@id": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#primaryimage"
            },
            "image": {
              "@id": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#primaryimage"
            },
            "thumbnailUrl": "https://www.capripost.it/wp-content/uploads/2025/11/592189733_10237803098231948_1175388281144916159_n.jpg",
            "datePublished": "2025-11-30T17:24:00+00:00",
            "author": {
              "@id": "https://www.capripost.it/#/schema/person/6ab9461291eef95cce0fd03f14d7f40c"
            },
            "breadcrumb": {
              "@id": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#breadcrumb"
            },
            "inLanguage": "it-IT",
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/"
                ]
              }
            ]
          },
          {
            "@type": "ImageObject",
            "inLanguage": "it-IT",
            "@id": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#primaryimage",
            "url": "https://www.capripost.it/wp-content/uploads/2025/11/592189733_10237803098231948_1175388281144916159_n.jpg",
            "contentUrl": "https://www.capripost.it/wp-content/uploads/2025/11/592189733_10237803098231948_1175388281144916159_n.jpg",
            "width": 1368,
            "height": 911
          },
          {
            "@type": "BreadcrumbList",
            "@id": "https://www.capripost.it/il-party-dei-50enni-sullisola-di-capri-in-festa-i-nati-nel-1975/#breadcrumb",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.capripost.it/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Il party dei 50enni sull&#8217;isola di Capri: in festa i nati nel 1975"
              }
            ]
          },
          {
            "@type": "WebSite",
            "@id": "https://www.capripost.it/#website",
            "url": "https://www.capripost.it/",
            "name": "Capri Post",
            "description": "News in tempo reale dall&#039;isola di Capri",
            "potentialAction": [
              {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.capripost.it/?s={search_term_string}"
                },
                "query-input": {
                  "@type": "PropertyValueSpecification",
                  "valueRequired": true,
                  "valueName": "search_term_string"
                }
              }
            ],
            "inLanguage": "it-IT"
          },
          {
            "@type": "Person",
            "@id": "https://www.capripost.it/#/schema/person/6ab9461291eef95cce0fd03f14d7f40c",
            "name": "capri post",
            "image": {
              "@type": "ImageObject",
              "inLanguage": "it-IT",
              "@id": "https://www.capripost.it/#/schema/person/image/",
              "url": "https://secure.gravatar.com/avatar/0e18271785571c0d18540ea1e5a8e90c0fc3b9aa51e6529c63aff7e703e5ee66?s=96&d=mm&r=g",
              "contentUrl": "https://secure.gravatar.com/avatar/0e18271785571c0d18540ea1e5a8e90c0fc3b9aa51e6529c63aff7e703e5ee66?s=96&d=mm&r=g",
              "caption": "capri post"
            },
            "sameAs": [
              "https://www.capripost.it"
            ],
            "url": "https://www.capripost.it/author/wp_10031831/"
          }
        ]
      }
    },
    "_links": {
      "self": [
        {
          "href": "https://www.capripost.it/wp-json/wp/v2/posts/22177",
          "targetHints": {
            "allow": [
              "GET"
            ]
          }
        }
      ],
      "collection": [
        {
          "href": "https://www.capripost.it/wp-json/wp/v2/posts"
        }
      ],
      "about": [
        {
          "href": "https://www.capripost.it/wp-json/wp/v2/types/post"
        }
      ],
      "author": [
        {
          "embeddable": true,
          "href": "https://www.capripost.it/wp-json/wp/v2/users/1"
        }
      ],
      "replies": [
        {
          "embeddable": true,
          "href": "https://www.capripost.it/wp-json/wp/v2/comments?post=22177"
        }
      ],
      "version-history": [
        {
          "count": 2,
          "href": "https://www.capripost.it/wp-json/wp/v2/posts/22177/revisions"
        }
      ],
      "predecessor-version": [
        {
          "id": 22183,
          "href": "https://www.capripost.it/wp-json/wp/v2/posts/22177/revisions/22183"
        }
      ],
      "wp:featuredmedia": [
        {
          "embeddable": true,
          "href": "https://www.capripost.it/wp-json/wp/v2/media/22182"
        }
      ],
      "wp:attachment": [
        {
          "href": "https://www.capripost.it/wp-json/wp/v2/media?parent=22177"
        }
      ],
      "wp:term": [
        {
          "taxonomy": "category",
          "embeddable": true,
          "href": "https://www.capripost.it/wp-json/wp/v2/categories?post=22177"
        },
        {
          "taxonomy": "post_tag",
          "embeddable": true,
          "href": "https://www.capripost.it/wp-json/wp/v2/tags?post=22177"
        }
      ],
      "curies": [
        {
          "name": "wp",
          "href": "https://api.w.org/{rel}",
          "templated": true
        }
      ]
    }
  }, */