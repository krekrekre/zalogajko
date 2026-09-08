/**
 * Replaces the seeded/test recipes with 10 hand-written Serbian recipes.
 *
 *   npx tsx scripts/seed-real-recipes.ts
 *
 * Keeps the "Korisnik 1/2/3" fixtures from migration 20260301100000 so the
 * profile pages still have content. Everything else in `recipes` is deleted;
 * ingredients, directions, nutrition, categories, reviews, ratings and
 * saved_recipes all cascade from the recipe row.
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(projectRoot, ".env.local") });
config({ path: path.join(projectRoot, ".env") });

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const SERVICE_ROLE = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

/** Fixture recipes owned by the three demo profiles — not ours to delete. */
const KEEP_SLUGS = [
  "korisnik1-supa-biser",
  "korisnik1-dorucak",
  "korisnik1-salata-sirene",
  "korisnik2-pileca-corba",
  "korisnik2-punjene-paprike-lagano",
  "korisnik2-musaka-porodicna",
  "korisnik3-torta-cokolada",
  "korisnik3-kiflice-sir",
  "korisnik3-riblja-corba-domaca",
];

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

type Ing = [amount: string | null, unit: string | null, name: string];

interface NewRecipe {
  slug: string;
  title: string;
  description: string;
  whyYoullLove: string[];
  prep: number;
  cook: number;
  servings: number;
  skill: "lako" | "srednje" | "tesko";
  image: string;
  mealType: string;
  cuisine: string;
  ingredients: Ing[];
  steps: string[];
  nutrition: { calories: number; fat_g: number; carbs_g: number; protein_g: number };
}

const RECIPES: NewRecipe[] = [
  {
    slug: "sarma",
    title: "Sarma",
    description:
      "Nedeljni ručak po kome cela kuća miriše. Listovi kiselog kupusa punjeni mlevenim mesom i pirinčem krčkaju polako nekoliko sati, a suvo meso i slanina im daju dubinu ukusa koju brza varijanta nikad ne postigne.",
    whyYoullLove: [
      "Posle pola sata pripreme rerna radi umesto vas.",
      "Drugog dana je još bolja — slobodno kuvajte veću šerpu.",
      "Jedno jelo koje zameni i predjelo i glavno jelo i prilog.",
    ],
    prep: 40,
    cook: 150,
    servings: 6,
    skill: "srednje",
    image: img("1622220736031-714bcc9f96b0"),
    mealType: "glavna-jela",
    cuisine: "srpska",
    ingredients: [
      ["1", "glavica", "Kiseli kupus (oko 1,5 kg)"],
      ["700", "g", "Mleveno meso (svinjsko i juneće)"],
      ["150", "g", "Pirinač"],
      ["2", "glavice", "Crni luk"],
      ["3", "češnja", "Beli luk"],
      ["250", "g", "Suvo meso ili suva rebra"],
      ["100", "g", "Slanina"],
      ["2", "kašike", "Ulje"],
      ["1", "kašika", "Aleva paprika"],
      ["2", "lista", "Lovorov list"],
      ["1", "kašičica", "So"],
      [null, "po ukusu", "Mleveni biber"],
    ],
    steps: [
      "Kiseli kupus rasklopite na listove, isecite deblje žile i isperite listove hladnom vodom ako su previše slani. Ostavite ih da se ocede.",
      "Crni luk sitno iseckajte i dinstajte na ulju dok ne omekša i ne postane staklast, oko 8 minuta. Dodajte protisnuti beli luk i pržite još pola minuta.",
      "Sklonite šerpu sa vatre, umešajte alevu papriku dok je luk još vruć, pa dodajte mleveno meso, opran pirinač, so i biber. Sve dobro sjedinite rukom.",
      "Na svaki list kupusa stavite kašiku fila, savijte bočne strane ka sredini i čvrsto urolajte. Krajeve utisnite prstom da se sarma ne otvori tokom kuvanja.",
      "Dno šerpe obložite iseckanim ostacima kupusa. Ređajte sarme jednu uz drugu, a između njih rasporedite komade suvog mesa i slanine. Ubacite lovorov list.",
      "Prelijte vodom taman toliko da prekrije sarme, poklopite i kuvajte na tihoj vatri 2 do 2,5 sata. Nemojte mešati — samo povremeno protresite šerpu.",
      "Poslednjih 30 minuta skinite poklopac da tečnost malo ispari i da sarme dobiju boju. Ostavite ih da odstoje 15 minuta pre služenja.",
    ],
    nutrition: { calories: 430, fat_g: 24, carbs_g: 28, protein_g: 26 },
  },
  {
    slug: "karadjordjeva-snicla",
    title: "Karađorđeva šnicla",
    description:
      "Rolna od tanko izlupanog belog mesa punjena kajmakom, pohovana do zlatne boje. Spolja hrskava, iznutra se topi — zato je i zovu devojački san. Služi se sa tartar sosom i pomfritom.",
    whyYoullLove: [
      "Izgleda kao restoransko jelo, a pravi se od četiri sastojka.",
      "Rolne možete pripremiti ujutru i pohovati tek pred ručak.",
      "Kajmak iznutra znači da meso ne može da se osuši.",
    ],
    prep: 30,
    cook: 15,
    servings: 4,
    skill: "srednje",
    image: img("1599921841143-819065a55cc6"),
    mealType: "glavna-jela",
    cuisine: "srpska",
    ingredients: [
      ["4", "kom", "Svinjski ili teleći but, isečen na velike šnicle"],
      ["200", "g", "Kajmak"],
      ["3", "kom", "Jaja"],
      ["150", "g", "Brašno"],
      ["200", "g", "Prezle"],
      ["500", "ml", "Ulje za prženje"],
      ["1", "kašičica", "So"],
      [null, "po ukusu", "Mleveni biber"],
    ],
    steps: [
      "Šnicle stavite između dve folije i izlupajte ih batom da budu tanke oko pola centimetra i što pravilnijeg pravougaonog oblika. Posolite ih i pobiberite sa obe strane.",
      "Po sredini svake šnicle razmažite debeo sloj kajmaka, ostavljajući oko dva centimetra slobodno uz ivice.",
      "Savijte bočne ivice ka sredini pa čvrsto urolajte meso u rolnu. Pritisnite krajeve da kajmak ne iscuri i ostavite rolne u frižideru 20 minuta da se stegnu.",
      "Pripremite tri tanjira: brašno, razmućena jaja i prezle. Uvaljajte svaku rolnu prvo u brašno, zatim u jaje, pa u prezle. Ponovite jaje i prezle još jednom za deblju koricu.",
      "Zagrejte ulje na 170 °C. Pržite rolne 6 do 8 minuta, okrećući ih da porumene sa svih strana.",
      "Izvadite ih na papirni ubrus da se ocede i ostavite dva minuta pre sečenja, da se kajmak slegne.",
    ],
    nutrition: { calories: 720, fat_g: 45, carbs_g: 38, protein_g: 42 },
  },
  {
    slug: "urnebes-salata",
    title: "Urnebes salata",
    description:
      "Ljuti namaz od mladog sira, feferona i belog luka koji na svakom roštilju nestane prvi. Nije salata u pravom smislu — to je ono što stavljate na pljeskavicu, na topao hleb ili pored pečenja.",
    whyYoullLove: [
      "Gotov je za petnaest minuta, bez kuvanja.",
      "Stoji u frižideru nedelju dana i svakog dana je bolji.",
      "Ljutinu podešavate sami — od blage do nemilosrdne.",
    ],
    prep: 15,
    cook: 0,
    servings: 6,
    skill: "lako",
    image: img("1627308595127-d9acf19107ce"),
    mealType: "hladna-predjela",
    cuisine: "srpska",
    ingredients: [
      ["500", "g", "Mladi sir"],
      ["4", "kom", "Feferoni iz turšije"],
      ["3", "češnja", "Beli luk"],
      ["2", "kašike", "Kajmak ili pavlaka"],
      ["1", "kašika", "Aleva paprika"],
      ["2", "kašike", "Maslinovo ulje"],
      [null, "po ukusu", "So"],
    ],
    steps: [
      "Mladi sir izgnječite viljuškom u većoj činiji dok ne dobijete grudvičastu, ali ujednačenu masu.",
      "Feferone ocedite, uklonite peteljke i seme ako želite blaži namaz, pa ih sitno iseckajte.",
      "Beli luk protisnite ili izgnječite sa prstohvatom soli da pusti sok.",
      "Umešajte feferone, beli luk, kajmak i alevu papriku u sir. Mešajte energično dva do tri minuta da se namaz ujednači.",
      "Dodajte maslinovo ulje i posolite po ukusu. Ostavite u frižideru najmanje sat vremena pre služenja da se ukusi povežu.",
    ],
    nutrition: { calories: 260, fat_g: 20, carbs_g: 4, protein_g: 15 },
  },
  {
    slug: "pileca-corba-sa-rezancima",
    title: "Pileća čorba sa rezancima",
    description:
      "Bistra čorba kuvana na celom pilećem batu, sa šargarepom, peršunom i domaćim rezancima. Ono što se sprema kad neko u kući nije dobro i ono što se traži svakog hladnog dana.",
    whyYoullLove: [
      "Jedna šerpa, malo posla, a kuća miriše dva sata.",
      "Bistra je jer se pena skida — jedini trik koji je zaista bitan.",
      "Rezanci se kuvaju u čorbi na kraju, pa ne raskuvaju.",
    ],
    prep: 20,
    cook: 50,
    servings: 6,
    skill: "lako",
    image: img("1555126634-323283e090fa"),
    mealType: "supe-i-corbe",
    cuisine: "srpska",
    ingredients: [
      ["600", "g", "Pileći batak i karabatak"],
      ["2", "kom", "Šargarepa"],
      ["1", "kom", "Peršunov koren"],
      ["1", "glavica", "Crni luk"],
      ["1", "kom", "Celer, manji komad"],
      ["150", "g", "Rezanci"],
      ["2", "l", "Voda"],
      ["1", "veza", "Peršunov list"],
      ["1", "kašičica", "So"],
      [null, "po ukusu", "Mleveni biber"],
    ],
    steps: [
      "Piletinu stavite u šerpu, prelijte hladnom vodom i stavite na jaku vatru. Čim provri, smanjite vatru i kašikom pažljivo skinite svu penu koja se digne — od toga zavisi da li će čorba biti bistra.",
      "Šargarepu i peršunov koren isecite na kolutove, luk prepolovite, celer na krupnije komade. Dodajte povrće u šerpu zajedno sa solju.",
      "Kuvajte poklopljeno na tihoj vatri 40 minuta. Tečnost treba jedva da podrhtava, ne da ključa.",
      "Izvadite meso, odvojite ga od kostiju i isecite na zalogaje. Luk i celer bacite, a šargarepu i peršun vratite u čorbu.",
      "Pojačajte vatru, ubacite rezance i kuvajte ih onoliko koliko piše na pakovanju, obično 6 do 8 minuta.",
      "Vratite meso u čorbu, pobiberite i pospite sveže seckanim peršunom neposredno pre služenja.",
    ],
    nutrition: { calories: 290, fat_g: 11, carbs_g: 26, protein_g: 22 },
  },
  {
    slug: "sopska-salata",
    title: "Šopska salata",
    description:
      "Paradajz, krastavac, paprika i more rendanog sira odozgo. Letnja salata koja se pravi za pet minuta i koja uz roštilj nikad nije višak.",
    whyYoullLove: [
      "Pet minuta od daske do stola.",
      "Sve što joj treba je dobar paradajz — ostalo je lako.",
      "Ide uz apsolutno sve sa roštilja.",
    ],
    prep: 15,
    cook: 0,
    servings: 4,
    skill: "lako",
    image: img("1622637103261-ae624e188bd0"),
    mealType: "salate",
    cuisine: "balkanska",
    ingredients: [
      ["4", "kom", "Paradajz"],
      ["2", "kom", "Krastavac"],
      ["1", "kom", "Zelena paprika"],
      ["1", "kom", "Crveni luk, manji"],
      ["150", "g", "Sir (feta ili mladi kravlji)"],
      ["3", "kašike", "Maslinovo ulje"],
      ["1", "kašika", "Vinsko sirće"],
      ["1", "veza", "Peršun"],
      [null, "po ukusu", "So"],
    ],
    steps: [
      "Paradajz isecite na krupnije kocke, krastavac oljuštite i isecite na polumesece, papriku na tanke trake.",
      "Crveni luk isecite na tanke kolutove i, ako vam je preoštar, kratko ga potopite u hladnu vodu pa ocedite.",
      "Pomešajte povrće u širokoj činiji, posolite i prelijte maslinovim uljem i sirćetom. Promešajte pažljivo da se paradajz ne izgnječi.",
      "Sir izrendajte krupno i pospite ga preko cele salate u debelom sloju — ne mešajte ga unutra.",
      "Pospite seckanim peršunom i poslužite odmah, dok je povrće još hladno i hrskavo.",
    ],
    nutrition: { calories: 210, fat_g: 16, carbs_g: 10, protein_g: 7 },
  },
  {
    slug: "gibanica",
    title: "Gibanica",
    description:
      "Kore, sir i jaja — ništa više. Gužvane kore upijaju smesu i peku se u pitu koja je odozgo hrskava, a unutra mekana i sočna. Slavski sto bez nje ne postoji.",
    whyYoullLove: [
      "Tri osnovna sastojka i nema mešenja testa.",
      "Podjednako dobra topla za doručak i hladna sutradan.",
      "Gužvanje kora prašta — ne mora ništa da bude pravilno.",
    ],
    prep: 30,
    cook: 45,
    servings: 8,
    skill: "srednje",
    image: img("1542761744-f88e3224ddfa"),
    mealType: "pite-i-testa",
    cuisine: "srpska",
    ingredients: [
      ["500", "g", "Kore za pitu"],
      ["500", "g", "Mladi sir"],
      ["200", "g", "Feta ili slani sir"],
      ["6", "kom", "Jaja"],
      ["400", "ml", "Kisela voda"],
      ["200", "ml", "Ulje"],
      ["200", "ml", "Jogurt"],
      ["1", "kašičica", "So"],
    ],
    steps: [
      "Zagrejte rernu na 200 °C i nauljite veći pleh, oko 30 x 40 cm.",
      "U velikoj činiji izgnječite oba sira, dodajte jaja, jogurt, so i polovinu ulja. Umutite dok ne dobijete gustu, ujednačenu smesu.",
      "Dve kore ostavite sa strane. Svaku preostalu koru pocepajte na krupnije komade, potopite ih u smesu i ne trudite se da budu uredni — treba da budu izgužvani.",
      "Ređajte natopljene kore u pleh, labavo, sloj po sloj. Nemojte ih pritiskati, gibanica treba da diše.",
      "Dve odvojene kore stavite odozgo, prelijte ostatkom ulja i po vrhu poprskajte kiselom vodom.",
      "Pecite 40 do 45 minuta dok vrh ne postane duboko zlatan. Ako previše brzo tamni, prekrijte je folijom poslednjih 10 minuta.",
      "Izvadite je i pokrijte čistom krpom na 15 minuta — tako će kore omekšati taman koliko treba pre sečenja.",
    ],
    nutrition: { calories: 480, fat_g: 32, carbs_g: 30, protein_g: 18 },
  },
  {
    slug: "ajvar",
    title: "Ajvar",
    description:
      "Pečene paprike, strpljenje i drvena kuvača. Pravi ajvar se kuva satima dok ne potamni i ne počne da se odvaja od dna šerpe — tada znate da je gotov i da će trajati celu zimu.",
    whyYoullLove: [
      "Jedna popodnevna smena i imate zimnicu za mesece.",
      "Kuvani ajvar drži boju i ukus mnogo duže od sirovog.",
      "Bez konzervansa — čuva ga so, ulje i pravilno kuvanje.",
    ],
    prep: 60,
    cook: 120,
    servings: 10,
    skill: "tesko",
    image: img("1692302756206-3dd7506cb8f0"),
    mealType: "zimnica",
    cuisine: "srpska",
    ingredients: [
      ["5", "kg", "Crvena roga paprika"],
      ["1", "kg", "Plavi patlidžan"],
      ["300", "ml", "Suncokretovo ulje"],
      ["4", "češnja", "Beli luk"],
      ["2", "kašike", "So"],
      ["3", "kašike", "Vinsko sirće"],
      ["1", "kašičica", "Šećer"],
    ],
    steps: [
      "Paprike pecite u rerni na 220 °C oko 30 minuta, okrećući ih jednom, dok kožica ne pocrni i ne počne da se odvaja. Patlidžane pecite isto toliko.",
      "Vrelo pečene paprike prebacite u veliku posudu i pokrijte folijom na 20 minuta — para će sama odvojiti kožicu.",
      "Ogulite paprike i patlidžane, uklonite peteljke i seme, pa ih ostavite u cediljci najmanje sat vremena. Suvišna voda je najčešći razlog zašto ajvar ne uspe.",
      "Sameljite povrće u mašini za mlevenje ili ga isecite nožem, ako volite krupniju teksturu.",
      "Prebacite masu u široku šerpu debljeg dna, dodajte polovinu ulja i kuvajte na srednjoj vatri, mešajući drvenom kuvačom skoro neprekidno.",
      "Postepeno dolivajte preostalo ulje tokom kuvanja. Posle sat i po do dva ajvar će potamneti i pri prevlačenju kuvačom dno šerpe ostaje kratko čisto — to je znak da je gotov.",
      "Umešajte protisnut beli luk, so, šećer i sirće, pa kuvajte još 10 minuta. Punite vruć u sterilisane tegle, zatvorite i okrenite naopako dok se ne ohlade.",
    ],
    nutrition: { calories: 180, fat_g: 14, carbs_g: 12, protein_g: 2 },
  },
  {
    slug: "prebranac",
    title: "Prebranac",
    description:
      "Beli pasulj i mnogo, mnogo crnog luka, pečeni u zemljanoj posudi dok se odozgo ne uhvati korica. Posno jelo koje ne izgleda kao da nešto nedostaje.",
    whyYoullLove: [
      "Posno, a toliko zasitno da ne traži prilog.",
      "Luka ide skoro isto koliko i pasulja — tu je ceo ukus.",
      "Iz rerne izlazi sa koricom koju svi prvo napadnu.",
    ],
    prep: 20,
    cook: 90,
    servings: 6,
    skill: "lako",
    image: img("1698917467449-08bcd1d9014b"),
    mealType: "prilozi",
    cuisine: "srpska",
    ingredients: [
      ["500", "g", "Beli pasulj (tetovac)"],
      ["1", "kg", "Crni luk"],
      ["150", "ml", "Suncokretovo ulje"],
      ["1", "kašika", "Aleva paprika"],
      ["3", "lista", "Lovorov list"],
      ["1", "kašičica", "So"],
      [null, "po ukusu", "Mleveni biber"],
    ],
    steps: [
      "Pasulj potopite u hladnu vodu preko noći, pa ga ocedite i isperite.",
      "Prelijte ga svežom vodom, prokuvajte 5 minuta i tu vodu prospite. Zatim ga kuvajte u novoj vodi oko 40 minuta, dok ne omekša ali ostane celo zrno.",
      "Dok se pasulj kuva, sav luk isecite na tanke kolutove i dinstajte ga na ulju na srednjoj vatri 20 do 25 minuta, dok ne postane mek i zlatan. Ne žurite ovaj korak.",
      "Sklonite luk sa vatre i tek onda umešajte alevu papriku, da ne zagori.",
      "U zemljanu posudu ili pleh ređajte naizmenično sloj pasulja pa sloj luka, počinjući i završavajući lukom. Između slojeva ubacite lovorov list, posolite i pobiberite.",
      "Prelijte sa toliko vode od kuvanja pasulja da tečnost dođe do vrha, ali da ne prekrije poslednji sloj luka.",
      "Pecite na 180 °C oko 50 minuta, dok tečnost ne uvri i dok se odozgo ne uhvati tamna korica.",
    ],
    nutrition: { calories: 340, fat_g: 14, carbs_g: 42, protein_g: 13 },
  },
  {
    slug: "palacinke-sa-dzemom",
    title: "Palačinke sa džemom",
    description:
      "Tanke, mekane palačinke sa domaćim džemom od kajsije. Testo se pravi za dva minuta, a prva palačinka je po pravilu žrtvena — tako je oduvek bilo.",
    whyYoullLove: [
      "Sastojci koje već imate u kući, bez izuzetka.",
      "Testo koje odstoji pola sata daje mekše palačinke.",
      "Deca ih jedu brže nego što stižete da ih pečete.",
    ],
    prep: 15,
    cook: 20,
    servings: 4,
    skill: "lako",
    image: img("1637036124732-cb0fab13bb15"),
    mealType: "kolaci",
    cuisine: "srpska",
    ingredients: [
      ["300", "g", "Brašno"],
      ["3", "kom", "Jaja"],
      ["500", "ml", "Mleko"],
      ["150", "ml", "Mineralna voda"],
      ["2", "kašike", "Ulje"],
      ["1", "kašika", "Šećer"],
      ["1", "prstohvat", "So"],
      ["250", "g", "Džem od kajsije"],
      ["2", "kašike", "Šećer u prahu"],
    ],
    steps: [
      "Jaja umutite sa šećerom i solju, pa dodajte polovinu mleka i postepeno umešajte brašno da ne bude grudvica.",
      "Dolijte ostatak mleka, mineralnu vodu i ulje. Testo treba da bude retko, kao slatka pavlaka.",
      "Ostavite testo da odstoji 30 minuta na sobnoj temperaturi — palačinke će biti znatno mekše.",
      "Zagrejte tiganj na srednje jakoj vatri i premažite ga tankim slojem ulja. Sipajte kutlaču testa i brzo okrenite tiganj da se razlije po celoj površini.",
      "Pecite oko minut, dok se ivice ne odvoje i dok odozdo ne porumeni, pa okrenite i pecite još pola minuta.",
      "Svaku palačinku premažite džemom, urolajte i pospite šećerom u prahu pre služenja.",
    ],
    nutrition: { calories: 410, fat_g: 12, carbs_g: 64, protein_g: 12 },
  },
  {
    slug: "pastrmka-na-zaru",
    title: "Pastrmka na žaru",
    description:
      "Cela pastrmka sa limunom i peršunom u trbuhu, pečena na žaru dok kožica ne postane hrskava. Riba koja ne traži ništa osim soli, ulja i da je ne prepečete.",
    whyYoullLove: [
      "Od pripreme do tanjira nema ni pola sata.",
      "Kožica se ne lepi ako je riba suva i rešetka vrela.",
      "Ide sa blitvom i krompirom kao da su napravljeni jedno za drugo.",
    ],
    prep: 15,
    cook: 20,
    servings: 2,
    skill: "lako",
    image: img("1584300005420-38486f627b07"),
    mealType: "riba-i-morski-plodovi",
    cuisine: "srpska",
    ingredients: [
      ["2", "kom", "Pastrmka, očišćena"],
      ["1", "kom", "Limun"],
      ["1", "veza", "Peršunov list"],
      ["3", "češnja", "Beli luk"],
      ["3", "kašike", "Maslinovo ulje"],
      ["1", "kašičica", "So"],
      [null, "po ukusu", "Mleveni biber"],
    ],
    steps: [
      "Ribu isperite i, što je najvažnije, dobro osušite papirnim ubrusom spolja i iznutra. Vlažna kožica se lepi za rešetku.",
      "Sa svake strane napravite nožem dva do tri plitka reza, do kosti. Posolite i pobiberite ribu spolja i unutra.",
      "U trbuh svake ribe stavite dva kolutića limuna, nekoliko grančica peršuna i po jedan zgnječen češanj belog luka.",
      "Premažite ribu maslinovim uljem sa svih strana i ostavite je 10 minuta na sobnoj temperaturi.",
      "Zagrejte roštilj dobro i premažite rešetku uljem. Pecite ribu 6 do 8 minuta sa prve strane, ne pomerajući je — sama će se odvojiti kad je spremna za okretanje.",
      "Okrenite je i pecite još 5 do 6 minuta. Meso je gotovo kad uz kičmu postane neprozirno i lako se odvaja viljuškom.",
      "Poslužite odmah, sa kriškom limuna i preostalim peršunom.",
    ],
    nutrition: { calories: 320, fat_g: 18, carbs_g: 3, protein_g: 36 },
  },
];

async function main() {
  console.log("Loading categories...");
  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug");
  if (catErr || !cats?.length) throw new Error(`categories: ${catErr?.message ?? "none found"}`);
  const catId = new Map(cats.map((c: { id: string; slug: string }) => [c.slug, c.id]));

  for (const r of RECIPES) {
    for (const slug of [r.mealType, r.cuisine]) {
      if (!catId.has(slug)) throw new Error(`Unknown category slug "${slug}" for ${r.slug}`);
    }
  }

  const { data: existing, error: exErr } = await supabase.from("recipes").select("id, slug");
  if (exErr) throw new Error(`recipes: ${exErr.message}`);

  const doomed = (existing ?? []).filter((r: { slug: string }) => !KEEP_SLUGS.includes(r.slug));
  const kept = (existing?.length ?? 0) - doomed.length;
  console.log(`Deleting ${doomed.length} recipes, keeping ${kept}...`);
  for (let i = 0; i < doomed.length; i += 100) {
    const chunk = doomed.slice(i, i + 100).map((r: { id: string }) => r.id);
    const { error } = await supabase.from("recipes").delete().in("id", chunk);
    if (error) throw new Error(`delete: ${error.message}`);
  }

  for (const r of RECIPES) {
    const { data: inserted, error: insErr } = await supabase
      .from("recipes")
      .insert({
        slug: r.slug,
        title_sr: r.title,
        description_sr: r.description,
        why_youll_love: r.whyYoullLove,
        prep_time_minutes: r.prep,
        cook_time_minutes: r.cook,
        servings: r.servings,
        author_name: "Domaći kuvar",
        image_url: r.image,
        status: "published",
        skill_level: r.skill,
      })
      .select("id")
      .single();
    if (insErr || !inserted) throw new Error(`insert ${r.slug}: ${insErr?.message}`);
    const id = inserted.id;

    const ings = r.ingredients.map(([amount, unit_sr, name_sr], sort_order) => ({
      recipe_id: id,
      amount,
      unit_sr,
      name_sr,
      sort_order,
    }));
    const { error: ingErr } = await supabase.from("ingredients").insert(ings);
    if (ingErr) throw new Error(`ingredients ${r.slug}: ${ingErr.message}`);

    const steps = r.steps.map((instruction_sr, i) => ({
      recipe_id: id,
      step_number: i + 1,
      instruction_sr,
      sort_order: i,
      image_url: null,
    }));
    const { error: dirErr } = await supabase.from("directions").insert(steps);
    if (dirErr) throw new Error(`directions ${r.slug}: ${dirErr.message}`);

    const { error: linkErr } = await supabase.from("recipe_categories").insert([
      { recipe_id: id, category_id: catId.get(r.mealType) },
      { recipe_id: id, category_id: catId.get(r.cuisine) },
    ]);
    if (linkErr) throw new Error(`categories ${r.slug}: ${linkErr.message}`);

    const { error: nutErr } = await supabase
      .from("recipe_nutrition")
      .insert({ recipe_id: id, ...r.nutrition });
    if (nutErr) throw new Error(`nutrition ${r.slug}: ${nutErr.message}`);

    console.log(`  + ${r.title} (${r.slug}) -> ${r.mealType}, ${r.cuisine}`);
  }

  const { count } = await supabase.from("recipes").select("*", { count: "exact", head: true });
  console.log(`Done. ${RECIPES.length} recipes inserted; ${count} recipes in the database.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
