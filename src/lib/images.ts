// Public-domain / CC0 artwork, processed by scripts/process-images.mjs into public/images/.
// Each entry has a -bw.webp (newsprint) and -color.webp (shown on hover) version.

export type Art = { alt: string; credit: string; license: string; source: string };

const LOC = "Photochrom Print Collection, Library of Congress / Detroit Publishing Co., c. 1890–1900";

export const CITY_ART: Record<string, Art> = {
  paris: {
    alt: "The Eiffel Tower framing the Trocadéro, Exposition Universelle 1900",
    credit: LOC,
    license: "Public domain",
    source:
      "https://commons.wikimedia.org/wiki/File:Eiffel_Tower_and_the_Trocadero,_Exposition_Universal,_1900,_Paris,_France.jpg",
  },
  london: {
    alt: "Tower Bridge closed, seen across the Thames",
    credit: LOC,
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Tower_Bridge,_III._(closed),_London,_England-LCCN2002696929.jpg",
  },
  berlin: {
    alt: "The Brandenburg Gate with carriages, around 1900",
    credit: "Photochrom, c. 1890–1900",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Berlin_Brandenburger_Tor_um_1900.jpeg",
  },
  zurich: {
    alt: "The Limmatquai and the river Limmat, Zürich",
    credit: LOC,
    license: "Public domain",
    source:
      "https://commons.wikimedia.org/wiki/File:The_Limmatquay,_with_Polytechnic,_Zurich,_Switzerland-LCCN2001703376.jpg",
  },
  amsterdam: {
    alt: "The tree-lined Herengracht canal, Amsterdam",
    credit: LOC,
    license: "Public domain",
    source:
      "https://commons.wikimedia.org/wiki/File:The_Heerengracht_(main_canal),_Amsterdam,_Holland-LCCN2001698757.jpg",
  },
  rome: {
    alt: "The Forum Romanum seen from the Palatine Hill",
    credit: LOC,
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Forum_Romanum_from_the_Palatine,_Rome,_Italy-LCCN2001700946.jpg",
  },
  florence: {
    alt: "Florence rooftops and the Duomo from the Palazzo Vecchio",
    credit: LOC,
    license: "No known restrictions",
    source:
      "https://commons.wikimedia.org/wiki/File:The_Cathedral,_panoramic_view_from_Vecchio_Palace,_Florence,_Italy_LOC_4712014954.jpg",
  },
  venice: {
    alt: "A gondola on the Grand Canal, Venice",
    credit: "Detroit Publishing Co., c. 1890–1900",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Grand_Canal_photochrom_2c.jpg",
  },
};

const RIJKS = "Rijksmuseum, Amsterdam";
const C = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

/** Fashion plates (1913–1924), keyed by outfit id. */
export const OUTFIT_ART: Record<string, Art> = {
  "wet-flaneur": {
    alt: "Fashion plate, 1913: a woman in a deep-blue travelling coat seated by a window",
    credit: `Journal des Dames et des Modes, 1913 · ${RIJKS}`,
    license: "CC0",
    source: C(
      "Journal_des_Dames_et_des_Modes_de_modetekenaars_Journal_des_Dames_et_des_Modes,_Costumes_Parisiens,_1913,_No._100_Manteau_de_voyag_(..),_RP-P-2009-1783.jpg",
    ),
  },
  "gallery-hours": {
    alt: "Fashion plate, 1914: a tailored suit by Redfern beside two rugby players",
    credit: `Gazette du Bon Ton, 1914 · ${RIJKS}`,
    license: "CC0",
    source: C(
      "Gazette_du_Bon_Ton,_1914_-_No._4,_Pl._39_Rugby_Costume_tailleur_de_Redfern_(titel_op_object),_RP-P-2009-1937-9.jpg",
    ),
  },
  "wine-at-eight": {
    alt: "Fashion plate, 1922: an evening gown by Beer against a gilded phoenix",
    credit: `Gazette du Bon Ton, 1922 · ${RIJKS}`,
    license: "CC0",
    source: C("Gazette_du_Bon_Ton,_1922_-_No._9_Sortil%C3%A8ges_Robe_du_soir,_de_Beer,_RP-P-2009-1963-3.jpg"),
  },
  "canal-frost": {
    alt: "Fashion plate by Charles Martin, 1924: a fur-trimmed winter coat under bare trees",
    credit: "Charles Martin, Gazette du Bon Ton, 1924",
    license: "Public domain",
    source: C("Charles_Martin_-_Gazette_du_bon_ton_-_L%27_Hiver.jpg"),
  },
  "market-layers": {
    alt: "Fashion plate, 1913: a walking outfit with a pink jacket and a huge fur muff",
    credit: `Journal des Dames et des Modes, 1913 · ${RIJKS}`,
    license: "CC0",
    source: C(
      "Journal_des_Dames_et_des_Modes_de_modetekenaars_Journal_des_Dames_et_des_Modes,_Costumes_Parisiens,_1913,_No._118_Toilette_de_promenade,_RP-P-2009-1849.jpg",
    ),
  },
  "drizzle-standard": {
    alt: "Fashion plate, 1913: two children in wool coats under falling autumn leaves",
    credit: `Journal des Dames et des Modes, 1913 · ${RIJKS}`,
    license: "CC0",
    source: C(
      "Journal_des_Dames_et_des_Modes,_Costumes_Parisiens,_1913,_No._44_Manteau_de_ratin_(..),_RP-P-2009-1747.jpg",
    ),
  },
  "noel-stroll": {
    alt: "Fashion plate, 1913: a white fur-trimmed winter outfit for St. Moritz",
    credit: `Journal des Dames et des Modes, 1913 · ${RIJKS}`,
    license: "CC0",
    source: C(
      "Journal_des_Dames_et_des_Modes_de_modetekenaars_Journal_des_Dames_et_des_Modes,_Costumes_Parisiens,_1913,_No._51_Pour_St._Moritz_(..),_RP-P-2009-1753.jpg",
    ),
  },
  "oud-nieuw": {
    alt: "Fashion plate, 1921: a black evening gown by Worth before a red lacquer screen",
    credit: `Gazette du Bon Ton, 1921 · ${RIJKS}`,
    license: "CC0",
    source: C(
      "Gazette_du_Bon_Ton._Art_%E2%80%93_Modes_%26_Frivolit%C3%A9s_beroemde_modehuizen_Gazette_du_Bon_Ton,_1921_-_No._10,_Pl._80_Le_paravent_rouge_Robe_du_soir,_de_Worth_(titel_op_object),_RP-P-2009-1961-16.jpg",
    ),
  },
  "mild-spell": {
    alt: "Fashion plate, 1914: a navy tailored suit by Chéruit in a formal garden",
    credit: `Gazette du Bon Ton, 1914 · ${RIJKS}`,
    license: "CC0",
    source: C(
      "Gazette_du_Bon_Ton,_1914_-_No._1,_Pl._VI_Le_Jardin_de_Peyrou,_Costume_tailleur_de_Ch%C3%A9ruit,_RP-P-2009-1934-6.jpg",
    ),
  },
};

export const cityArt = (slug: string) => (CITY_ART[slug] ? { ...CITY_ART[slug], key: slug } : null);
export const outfitArt = (id: string) => (OUTFIT_ART[id] ? { ...OUTFIT_ART[id], key: id } : null);
