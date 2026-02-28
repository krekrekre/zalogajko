// Shared types and mock data for blog/saveti articles

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string; // ISO date
  imageUrl?: string | null;
  category?: string;
}

const PLACEHOLDER_ARTICLE =
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80";

export const SAVETI_ARTICLES: Article[] = [
  {
    slug: "kako-cuvati-sveze-zeleni",
    title: "Kako čuvati sveže zelene i začinsko bilje",
    excerpt:
      "Saveti za duži rok trajanja persuna, bosiljka, peršuna i drugih svežih začina u frižideru ili zamrzivaču.",
    content: `
      <p>Sveže zelene i začinsko bilje mogu brzo da uvenu ako ih ne čuvate na pravi način. Evo nekoliko proverenih metoda:</p>
      <h2>U frižideru</h2>
      <p>Stabljike stavite u čašu sa malo vode i prekrijte vrećicom. Persun, bosiljak i mirođija ostaju sveži do nedelju dana.</p>
      <h2>Zamrzavanje</h2>
      <p>Iseckajte bilje, stavite u kockice za led sa malo vode ili maslinovog ulja i zamrznite. Idealno za supe i variva.</p>
      <h2>Sušenje</h2>
      <p>Za dugotrajno čuvanje, vežite snopiće i ostavite na suvom, tamnom mestu. Posle sušenja samelite ili čuvajte listove u teglama.</p>
    `,
    publishedAt: "2025-02-20T10:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80",
    category: "Čuvanje",
  },
  {
    slug: "zamenjivanje-sastojaka-u-receptima",
    title: "Zamenjivanje sastojaka u receptima",
    excerpt:
      "Šta možete koristiti umesto jaja, mleka ili brašna kada vam nešto zafali u kuhinji.",
    content: `
      <p>Često se desi da vam nedostaje jedan sastojak. Evo najčešćih zamena koje rade u većini recepta.</p>
      <h2>Jaja</h2>
      <p>Jedno jaje možete zameniti sa: 2 kašike mleka + 1 kašika sode bikarbone, ili 60 g jogurta, ili 1 kašikom lanenog semena u 3 kašike vode.</p>
      <h2>Mleko</h2>
      <p>U slatkim receptima: biljno mleko (badem, soja, ovseno) ili jogurt razblažen vodom. U slanim: voda ili supa.</p>
      <h2>Brašno</h2>
      <p>Za bezglutenske varijante: mešavina kukuruznog, pirinčanog i sojinog brašna u jednakim delovima.</p>
    `,
    publishedAt: "2025-02-15T09:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    category: "Saveti",
  },
  {
    slug: "organizacija-frizidera",
    title: "Kako organizovati frižider da hrana duže traje",
    excerpt:
      "Gde staviti mleko, meso, povrće i ostale namirnice da ostanu sveže što duže.",
    content: `
      <p>Pravilno raspoređivanje namirnica u frižideru produžava njihov rok trajanja i smanjuje bacanje hrane.</p>
      <h2>Gornja polica</h2>
      <p>Ovde temperatura je najstabilnija. Idealno za mlečne proizvode, gotova jela i ostale stvari koje ne zahtevaju najnižu temperaturu.</p>
      <h2>Srednje police</h2>
      <p>Jaja, sirevi, otvorene tegle. Meso i riba idu na najnižu policu ili u fioku gde je najhladnije.</p>
      <h2>Fioke</h2>
      <p>Povrće i voće u posebnim fiokama sa kontrolom vlažnosti. Zelena salata i sveža zelena traju duže uz malo vlažnosti.</p>
    `,
    publishedAt: "2025-02-10T14:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80",
    category: "Čuvanje",
  },
  {
    slug: "merenje-bez-vage",
    title: "Merenje sastojaka bez kuhinjske vage",
    excerpt:
      "Kako približno odmeriti brašno, šećer i tečnosti koristeći šolje i kašike.",
    content: `
      <p>Nemate vagu? Sa ovim trikovima možete uspešno pratiti recepte.</p>
      <h2>Brašno</h2>
      <p>Jedna šolja (250 ml) brašna iznosi približno 130–150 g, zavisno od toga da li ga nabijate ili ne. Za preciznije recepte koristite kašiku za „nabijanje” u šolju.</p>
      <h2>Šećer</h2>
      <p>Šolja šećera = oko 200 g. Kašika = oko 15 g.</p>
      <h2>Tečnosti</h2>
      <p>Šolja = 250 ml. Kašika = 15 ml. Kašičica = 5 ml.</p>
    `,
    publishedAt: "2025-02-05T11:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80",
    category: "Saveti",
  },
  {
    slug: "zacini-za-pocetnike",
    title: "Osnovni začini za početnike u kuvanju",
    excerpt:
      "Koje začine imati u ormanu da možete pripremiti većinu domaćih jela.",
    content: `
      <p>Sa ovih nekoliko začina možete pripremiti ogroman broj recepta.</p>
      <h2>Suvi začini</h2>
      <p>So, biber, aleva paprika, vegeta (ili slična mešavina), suvi bosiljak, peršun, lovorov list, kim, kari. Ovo je osnova za sve.</p>
      <h2>Sveži začini</h2>
      <p>Persun, bosiljak, mirođija – mogu se kupiti u saksiji ili zamrznuti. Češnjak i crni luk su obavezni.</p>
      <h2>Tečni začini</h2>
      <p>Sirće, soja sos, maslinovo ulje, paradajz pasata. Za deserte: vanila ekstrakt, cimet.</p>
    `,
    publishedAt: "2025-01-28T08:00:00Z",
    imageUrl: PLACEHOLDER_ARTICLE,
    category: "Saveti",
  },
];

export const BLOG_ARTICLES: Article[] = [
  {
    slug: "istorija-srpske-kuhinje",
    title: "Kratka istorija srpske kuhinje",
    excerpt:
      "Od srednjovekovnih gozbi do savremenih fusion jela — kako se razvijala srpska kuhinja.",
    content: `
      <p>Srpska kuhinja nosi uticaje Vizantije, Osmanskog carstva i centralnoevropskih kultura. Tradicionalna jela kao sarma, prebranac i ćevapi i danas su stubovi domaće trpeze.</p>
      <h2>Srednji vek</h2>
      <p>Zabeležene su gozbe sa pečenim mesom, hlebom i vinom. Pčelinji med i voće bili su deo svakodnevice.</p>
      <h2>Osmanski uticaj</h2>
      <p>Doneli su burek, ćevape, sarma, suvu pastrmu i mnoge slatke poslastice. Aleva paprika i ljuta paprika postale su sastavni deo.</p>
      <h2>Danas</h2>
      <p>Moderna srpska kuhinja kombinuje tradiciju sa novim tehnikama i sastojcima, ali uvek sa puno povrća, mesa i domaćeg hleba.</p>
    `,
    publishedAt: "2025-02-22T12:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    category: "Kultura",
  },
  {
    slug: "sezonsko-voce-i-povrce-februar",
    title: "Sezonsko voće i povrće u februaru",
    excerpt:
      "Šta je u sezoni u februaru i kako ga najbolje iskoristiti u kuhinji.",
    content: `
      <p>Februar je još uvek zimski mesec, ali tržište nudi kvalitetno zimsko povrće i uvozno voće.</p>
      <h2>Povrće</h2>
      <p>Kupus (beli i crveni), crna rotkvica, šargarepa, pasrnjak, celer, praziluk, crni luk. Idealno za variva, čorbu i podvarak.</p>
      <h2>Voće</h2>
      <p>Jabuke, kruške, narandže, mandarine, limuni. Suvo voće — šljive, smokve, urme — odlično za kolače i kompote.</p>
      <h2>Recepti</h2>
      <p>Kuvana šargarepa i pasrnjak, kupus salata, sarma od svežeg kupusa, pire od celera.</p>
    `,
    publishedAt: "2025-02-18T07:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
    category: "Sezona",
  },
  {
    slug: "zdravi-obroci-za-zauzetost",
    title: "Zdravi obroci kada ste zauzeti",
    excerpt:
      "Brzi doručak, ručak i večera koje možete pripremiti unapred za celu nedelju.",
    content: `
      <p>Meal prep ne mora da bude dosadan. Sa malo planiranja možete imati zdrave obroke svaki dan.</p>
      <h2>Doručak</h2>
      <p>Ovsenáča u tegli (overnight oats) sa voćem i orašastim plodovima. Pripremite pet tegli u nedelju uveče.</p>
      <h2>Ručak</h2>
      <p>Kuvana piletina ili soja sa pirinčem i povrćem u posudama. Salate u staklenkama sa prelivom pored.</p>
      <h2>Večera</h2>
      <p>Supe i variva mogu stajati u frižideru 3–4 dana. Zamrzite porcije u kesicama za brzu večeru.</p>
    `,
    publishedAt: "2025-02-12T10:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    category: "Zdravlje",
  },
  {
    slug: "kuhinja-po-sezonama",
    title: "Zašto kuhati po sezonama",
    excerpt:
      "Prednosti sezonske hrane: bolji ukus, niža cena i manji ugaoni otisak.",
    content: `
      <p>Sezonsko povrće i voće nije samo trend — ima konkretne prednosti za vas i za životnu sredinu.</p>
      <h2>Ukus i hranljivost</h2>
      <p>Plodovi ubrani u punoj zrelosti imaju više vitamina i bolji ukus od onih koji putuju nedeljama.</p>
      <h2>Cena</h2>
      <p>Kada je nešto u sezoni, ponuda je veća i cene su niže. Zimska šargarepa i kupus su primer.</p>
      <h2>Životna sredina</h2>
      <p>Lokalna sezonska hrana zahteva manje transporta i grejanja staklenika. Manje plastike i pakovanja.</p>
    `,
    publishedAt: "2025-02-01T09:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
    category: "Sezona",
  },
  {
    slug: "deset-najcescih-gresaka-pocetnika",
    title: "10 najčešćih grešaka početnika u kuhinji",
    excerpt:
      "Šta izbegavati kada tek počinjete da kuvate — od pregrevanja ulja do zanemarivanja soli.",
    content: `
      <p>Svako je pravio greške na početku. Evo kako ih izbeći.</p>
      <h2>1. Pregrejano ulje</h2>
      <p>Kada dimi, ulje je pregorelo. Smanjite temperaturu ili koristite ulje sa višom tačkom dimljenja.</p>
      <h2>2. Previše sastojaka u tavi</h2>
      <p>Prepunjena tava ne peče, već pari. Pečite u dve serije ako je potrebno.</p>
      <h2>3. Zanemarivanje soli</h2>
      <p>So izvlači ukus i treba je dodavati postepeno. Probajte tokom kuvanja.</p>
      <p>Ostale česte greške: ne zagrejati tavu dovoljno, ne čitati recept do kraja, mešati testo previše, ne ostaviti meso da „odmara” posle pečenja…</p>
    `,
    publishedAt: "2025-01-25T14:00:00Z",
    imageUrl: PLACEHOLDER_ARTICLE,
    category: "Saveti",
  },
];

export function getArticleBySlug(
  slug: string,
  source: "saveti" | "blog"
): Article | undefined {
  const list = source === "saveti" ? SAVETI_ARTICLES : BLOG_ARTICLES;
  return list.find((a) => a.slug === slug);
}

/** Get other articles from the same source, excluding current slug (for "Pročitajte još"). */
export function getRelatedArticles(
  currentSlug: string,
  source: "saveti" | "blog",
  limit = 4
): Article[] {
  const list = source === "saveti" ? SAVETI_ARTICLES : BLOG_ARTICLES;
  return list.filter((a) => a.slug !== currentSlug).slice(0, limit);
}

export function formatArticleDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("sr-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
