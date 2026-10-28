// Built-in catalog of common indoor and garden plants. Watering intervals are general horticultural
// guidelines for the growing season in a typical pot; the formula then adjusts them for season and
// weather, and each plant can override its interval. No external API or AI involved.

export type Light = "sun" | "partial" | "shade";
export type Place = "indoor" | "outdoor" | "both";

export const ART_KINDS = [
  "broadleaf", "monstera", "roundleaf", "trailing", "upright", "rosette", "cactus", "orchid", "fern",
  "palm", "tree", "herb", "flowering", "spike", "fruiting", "grass", "bulb",
] as const;
export type ArtKind = (typeof ART_KINDS)[number];

export interface PlantArt {
  kind: ArtKind;
  leaf: string;
  accent?: string;
}

export interface CatalogPlant {
  slug: string;
  name: string;
  scientific: string;
  aliases: string[];
  place: Place;
  days: number;
  light: Light;
  tip: string;
  art: PlantArt;
}

// Leaf colours
const G = "#2f7d32"; // green
const GM = "#3f9142"; // mid green
const GL = "#5aa469"; // light green
const GD = "#1f5f3a"; // dark green
const LI = "#7fb069"; // lime
const SA = "#7d9d8c"; // sage
const GL2 = "#6b8f9e"; // glaucous blue-grey
const PU = "#6d3b6e"; // purple foliage
const RD = "#a23b3b"; // red foliage
// Accent colours (flowers, fruits)
const WH = "#f4f1e8", PK = "#e88aa8", RE = "#d94a4a", YE = "#f2c12e", OR = "#f08a24";
const VI = "#8e6bbf", BL = "#5b8fd9", MA = "#c2378b", LA = "#9b7fd1", NA = "#2a3f8f";

const p = (
  slug: string, name: string, scientific: string, place: Place, days: number, light: Light,
  kind: ArtKind, leaf: string, accent: string | undefined, tip: string, aliases: string[] = [],
): CatalogPlant => ({ slug, name, scientific, aliases, place, days, light, tip, art: { kind, leaf, accent } });

export const CATALOG: CatalogPlant[] = [
  // ── Plantes d'intérieur à feuillage
  p("monstera", "Monstera", "Monstera deliciosa", "indoor", 7, "partial", "monstera", GD, undefined, "Arrose quand les 3 premiers cm de terreau sont secs ; un tuteur en mousse l'aide à faire de grandes feuilles.", ["faux philodendron", "plante gruyère"]),
  p("monstera-adansonii", "Monstera adansonii", "Monstera adansonii", "indoor", 6, "partial", "trailing", G, undefined, "Aime l'humidité : brumise ses feuilles trouées et garde le terreau légèrement frais.", ["monkey mask"]),
  p("pothos", "Pothos", "Epipremnum aureum", "indoor", 7, "partial", "trailing", LI, undefined, "Très tolérant : laisse sécher la moitié du terreau entre deux arrosages ; les feuilles molles signalent la soif.", ["scindapsus", "lierre du diable"]),
  p("philodendron", "Philodendron grimpant", "Philodendron hederaceum", "indoor", 7, "partial", "trailing", GM, undefined, "Arrose quand la surface est sèche ; pince les tiges pour obtenir un port plus fourni.", ["philodendron scandens"]),
  p("philodendron-birkin", "Philodendron Birkin", "Philodendron 'Birkin'", "indoor", 7, "partial", "broadleaf", GM, undefined, "Lumière vive indirecte pour garder ses rayures blanches ; évite l'excès d'eau."),
  p("sansevieria", "Sansevieria", "Dracaena trifasciata", "indoor", 18, "partial", "upright", GD, undefined, "Arrose très peu, surtout en hiver : l'excès d'eau fait pourrir la base des feuilles.", ["langue de belle-mère", "sansevieria trifasciata", "snake plant"]),
  p("zamioculcas", "Zamioculcas", "Zamioculcas zamiifolia", "indoor", 18, "shade", "upright", G, undefined, "Ses rhizomes stockent l'eau : attends que le terreau soit sec en profondeur.", ["zz plant", "plante zz"]),
  p("ficus-elastica", "Caoutchouc", "Ficus elastica", "indoor", 10, "partial", "broadleaf", GD, undefined, "Dépoussière ses grandes feuilles avec un chiffon humide pour qu'elles respirent.", ["ficus elastica", "ficus caoutchouc"]),
  p("ficus-lyrata", "Ficus lyrata", "Ficus lyrata", "indoor", 9, "sun", "broadleaf", G, undefined, "Déteste être déplacé et les courants d'air ; arrose copieusement puis laisse sécher.", ["figuier lyre", "fiddle leaf"]),
  p("ficus-benjamina", "Ficus benjamina", "Ficus benjamina", "indoor", 7, "partial", "tree", GM, undefined, "Perd ses feuilles s'il change de place ou manque de lumière : trouve-lui un coin fixe et lumineux.", ["figuier pleureur"]),
  p("ficus-ginseng", "Ficus ginseng (bonsaï)", "Ficus microcarpa", "indoor", 4, "partial", "tree", GM, undefined, "Petit pot, sèche vite : vérifie la terre tous les 2-3 jours et brumise le feuillage.", ["bonsai", "bonsaï"]),
  p("calathea", "Calathea", "Goeppertia", "indoor", 5, "shade", "broadleaf", GD, undefined, "Garde le terreau frais, arrose à l'eau non calcaire ; les bords bruns signalent un air trop sec.", ["calathea orbifolia", "maranta calathea"]),
  p("maranta", "Maranta", "Maranta leuconeura", "indoor", 5, "shade", "broadleaf", GM, undefined, "Ses feuilles se replient la nuit ; elle apprécie un air humide et une eau à température ambiante.", ["plante qui prie", "prayer plant"]),
  p("aglaonema", "Aglaonema", "Aglaonema", "indoor", 8, "shade", "broadleaf", SA, undefined, "Supporte la pénombre ; laisse sécher la surface et évite les températures sous 15 °C."),
  p("dieffenbachia", "Dieffenbachia", "Dieffenbachia", "indoor", 7, "partial", "broadleaf", LI, undefined, "Sève toxique : manipule-la avec des gants et tiens-la hors de portée des animaux."),
  p("alocasia", "Alocasia", "Alocasia", "indoor", 6, "partial", "broadleaf", GD, undefined, "Aime chaleur et humidité ; elle peut perdre ses feuilles en hiver puis repartir au printemps.", ["oreille d'éléphant"]),
  p("croton", "Croton", "Codiaeum variegatum", "indoor", 6, "sun", "broadleaf", RD, YE, "Il lui faut beaucoup de lumière pour garder ses couleurs vives ; évite les courants d'air."),
  p("strelitzia", "Oiseau de paradis", "Strelitzia reginae", "indoor", 8, "sun", "broadleaf", GL2, OR, "Plein soleil derrière une vitre ; arrose généreusement au printemps et en été.", ["strelitzia"]),
  p("pilea", "Pilea", "Pilea peperomioides", "indoor", 7, "partial", "roundleaf", GL, undefined, "Tourne le pot chaque semaine pour qu'il pousse droit ; il produit des rejets faciles à bouturer.", ["plante à monnaie chinoise"]),
  p("peperomia", "Peperomia", "Peperomia obtusifolia", "indoor", 10, "partial", "roundleaf", GM, undefined, "Feuilles charnues : laisse bien sécher entre deux arrosages."),
  p("fittonia", "Fittonia", "Fittonia albivenis", "indoor", 4, "shade", "roundleaf", GM, PK, "S'affaisse dès qu'elle a soif mais se redresse vite après arrosage ; adore les terrariums."),
  p("oxalis-triangularis", "Oxalis pourpre", "Oxalis triangularis", "indoor", 6, "partial", "roundleaf", PU, PK, "Ses feuilles se ferment la nuit ; laisse-la au repos si elle se dessèche, elle repart.", ["faux trèfle"]),
  p("syngonium", "Syngonium", "Syngonium podophyllum", "indoor", 6, "partial", "trailing", GL, undefined, "Garde le terreau légèrement humide ; grimpe ou retombe selon le support."),
  p("tradescantia", "Tradescantia", "Tradescantia zebrina", "indoor", 6, "partial", "trailing", PU, undefined, "Pince les tiges régulièrement ; une bonne lumière garde ses reflets violets.", ["misère"]),
  p("ceropegia", "Chaîne des cœurs", "Ceropegia woodii", "indoor", 12, "partial", "trailing", SA, undefined, "Succulente retombante : arrose seulement quand le terreau est sec.", ["ceropegia woodii", "string of hearts"]),
  p("senecio-rowleyanus", "Plante chapelet", "Curio rowleyanus", "indoor", 14, "sun", "trailing", LI, undefined, "Ses perles stockent l'eau : arrose peu et place-la près d'une fenêtre lumineuse.", ["senecio rowleyanus", "string of pearls"]),
  p("hoya", "Hoya", "Hoya carnosa", "indoor", 10, "partial", "trailing", GM, PK, "Ne coupe pas les tiges qui ont fleuri : les fleurs reviennent au même endroit.", ["fleur de porcelaine"]),
  p("lierre", "Lierre", "Hedera helix", "both", 6, "partial", "trailing", GD, undefined, "Apprécie la fraîcheur ; en intérieur, surveille les araignées rouges si l'air est sec."),
  p("schefflera", "Schefflera", "Schefflera arboricola", "indoor", 8, "partial", "tree", GM, undefined, "Laisse sécher la surface ; taille les tiges trop longues pour l'étoffer.", ["arbre ombrelle"]),
  p("pachira", "Pachira", "Pachira aquatica", "indoor", 10, "partial", "tree", GM, undefined, "Arrose peu : son tronc stocke l'eau ; évite l'eau stagnante dans la soucoupe.", ["arbre à monnaie", "châtaignier de guyane"]),
  p("dracaena-marginata", "Dragonnier", "Dracaena marginata", "indoor", 10, "partial", "palm", GD, RD, "Laisse sécher les premiers centimètres ; les pointes brunes viennent souvent d'une eau trop calcaire.", ["dracaena"]),
  p("dracaena-fragrans", "Dracaena fragrans", "Dracaena fragrans", "indoor", 10, "partial", "upright", LI, undefined, "Tolère la mi-ombre ; dépoussière les feuilles et arrose modérément.", ["bois de bonheur"]),
  p("bambou-chance", "Bambou de la chance", "Dracaena sanderiana", "indoor", 7, "shade", "upright", GL, undefined, "En vase, change l'eau chaque semaine ; en terre, garde-la légèrement humide.", ["lucky bamboo"]),
  p("yucca", "Yucca", "Yucca elephantipes", "indoor", 14, "sun", "upright", G, undefined, "Plein soleil et peu d'eau ; il peut passer l'été dehors.", ["yucca"]),
  p("aspidistra", "Aspidistra", "Aspidistra elatior", "indoor", 10, "shade", "upright", GD, undefined, "Presque indestructible : supporte l'ombre et l'oubli, mais pas l'excès d'eau.", ["plante de fer"]),
  p("chlorophytum", "Plante araignée", "Chlorophytum comosum", "indoor", 6, "partial", "grass", LI, undefined, "Ses rejets s'enracinent facilement dans un verre d'eau ; arrose quand la surface sèche.", ["chlorophytum", "phalangère"]),
  p("cafeier", "Caféier", "Coffea arabica", "indoor", 6, "partial", "broadleaf", GD, RE, "Aime un terreau frais et un air humide ; protège-le du soleil direct de l'après-midi.", ["café"]),
  p("avocatier", "Avocatier", "Persea americana", "indoor", 6, "sun", "broadleaf", G, undefined, "Pince la tige principale à 30 cm pour qu'il se ramifie."),
  // ── Palmiers et fougères
  p("kentia", "Kentia", "Howea forsteriana", "indoor", 8, "partial", "palm", GD, undefined, "Palmier d'intérieur robuste ; laisse sécher la surface et brumise en hiver."),
  p("areca", "Areca", "Dypsis lutescens", "indoor", 6, "partial", "palm", LI, undefined, "Aime l'humidité et une eau non calcaire ; évite le soleil brûlant.", ["palmier areca"]),
  p("chamaedorea", "Palmier nain", "Chamaedorea elegans", "indoor", 7, "shade", "palm", GM, undefined, "Supporte la faible lumière ; garde le terreau légèrement frais.", ["palmier de salon"]),
  p("fougere-boston", "Fougère de Boston", "Nephrolepis exaltata", "indoor", 3, "shade", "fern", GL, undefined, "Ne doit jamais sécher complètement ; brumise souvent ou pose le pot sur des billes humides.", ["nephrolepis", "fougère"]),
  p("capillaire", "Capillaire", "Adiantum raddianum", "indoor", 3, "shade", "fern", LI, undefined, "Très sensible à la sécheresse : terreau toujours frais et air humide, idéal en salle de bain.", ["adiantum", "cheveux de vénus"]),
  p("asplenium", "Asplenium", "Asplenium nidus", "indoor", 5, "shade", "fern", GM, undefined, "Arrose autour de la rosette, pas au centre, pour éviter la pourriture.", ["fougère nid d'oiseau"]),
  // ── Succulentes et cactus
  p("aloe-vera", "Aloe vera", "Aloe vera", "indoor", 18, "sun", "rosette", SA, undefined, "Arrose seulement quand le terreau est sec en profondeur ; plein soleil ou très lumineux."),
  p("echeveria", "Echeveria", "Echeveria", "indoor", 14, "sun", "rosette", GL2, PK, "Arrose au pied, jamais sur la rosette ; manque de lumière = rosette qui s'étire."),
  p("crassula", "Arbre de jade", "Crassula ovata", "indoor", 16, "sun", "tree", GM, undefined, "Succulente : arrose peu, surtout en hiver ; elle fleurit après un hiver frais et sec.", ["crassula", "arbre de jade", "plante de jade"]),
  p("haworthia", "Haworthia", "Haworthia", "indoor", 16, "partial", "rosette", GD, WH, "Préfère une lumière indirecte au plein soleil ; peu d'eau."),
  p("sedum-morganianum", "Queue d'âne", "Sedum morganianum", "indoor", 14, "sun", "trailing", GL2, undefined, "Ses feuilles tombent au moindre choc : choisis-lui une place fixe et arrose peu.", ["sedum burrito"]),
  p("lithops", "Lithops", "Lithops", "indoor", 30, "sun", "rosette", SA, YE, "Ne l'arrose pas pendant la mue des feuilles ni en hiver ; très peu d'eau le reste du temps.", ["plante caillou"]),
  p("kalanchoe", "Kalanchoé", "Kalanchoe blossfeldiana", "indoor", 12, "sun", "flowering", GM, RE, "Succulente fleurie : laisse sécher entre deux arrosages ; retire les fleurs fanées."),
  p("cactus", "Cactus", "Cactaceae", "indoor", 21, "sun", "cactus", GM, undefined, "Presque pas d'eau en hiver ; au printemps et en été, arrose quand le terreau est sec.", ["cactée"]),
  p("opuntia", "Figuier de Barbarie", "Opuntia", "both", 21, "sun", "cactus", GL, YE, "Très rustique au sec ; protège-le de l'humidité hivernale.", ["oponce"]),
  p("mammillaria", "Mammillaria", "Mammillaria", "indoor", 21, "sun", "cactus", GL2, PK, "Petit cactus à fleurs en couronne ; un hiver frais et sec favorise la floraison."),
  p("euphorbia-trigona", "Euphorbe trigona", "Euphorbia trigona", "indoor", 18, "sun", "cactus", GD, undefined, "Sève irritante : porte des gants pour la manipuler ; peu d'eau."),
  p("schlumbergera", "Cactus de Noël", "Schlumbergera", "indoor", 8, "partial", "trailing", GM, MA, "Cactus de forêt : garde-le légèrement humide, et au frais en automne pour qu'il fleurisse.", ["schlumbergera", "cactus de noel"]),
  p("agave", "Agave", "Agave", "both", 21, "sun", "rosette", GL2, undefined, "Plein soleil et sol très drainant ; l'eau stagnante lui est fatale."),
  p("sedum", "Orpin", "Sedum", "outdoor", 14, "sun", "rosette", GL, YE, "Couvre-sol sans entretien ; arrose seulement en cas de longue sécheresse.", ["sedum"]),
  p("dionee", "Dionée attrape-mouche", "Dionaea muscipula", "indoor", 3, "sun", "rosette", GL, RE, "Uniquement eau de pluie ou déminéralisée, soucoupe toujours un peu remplie ; ne la nourris pas.", ["attrape-mouche", "plante carnivore"]),
  p("tillandsia", "Tillandsia", "Tillandsia", "indoor", 5, "partial", "rosette", SA, PK, "Sans terre : trempe-la 20 min dans l'eau de pluie, puis laisse-la sécher tête en bas.", ["fille de l'air"]),
  p("bromelia", "Broméliacée", "Guzmania", "indoor", 7, "partial", "rosette", GM, RE, "Garde un peu d'eau dans le cœur de la rosette et vide-le chaque mois.", ["guzmania", "bromélia"]),
  // ── Plantes d'intérieur à fleurs
  p("orchidee", "Orchidée", "Phalaenopsis", "indoor", 8, "partial", "orchid", GM, PK, "Trempe le pot 10 min quand les racines deviennent argentées, puis égoutte bien.", ["phalaenopsis", "orchidée papillon"]),
  p("spathiphyllum", "Fleur de lune", "Spathiphyllum wallisii", "indoor", 5, "shade", "flowering", GD, WH, "Ses feuilles retombent quand elle a soif ; elle se redresse en quelques heures après arrosage.", ["spathiphyllum", "lys de la paix"]),
  p("anthurium", "Anthurium", "Anthurium andraeanum", "indoor", 7, "partial", "flowering", GD, RE, "Lumière vive sans soleil direct, air humide ; laisse sécher la surface entre deux arrosages."),
  p("saintpaulia", "Violette africaine", "Saintpaulia ionantha", "indoor", 6, "partial", "flowering", GM, VI, "Arrose par la soucoupe pour ne pas mouiller les feuilles velues.", ["saintpaulia"]),
  p("cyclamen", "Cyclamen", "Cyclamen persicum", "indoor", 5, "partial", "flowering", GD, PK, "Aime la fraîcheur (15 °C) ; arrose par le dessous pour éviter de pourrir le tubercule."),
  p("begonia", "Bégonia", "Begonia", "both", 6, "partial", "flowering", GM, PK, "Arrose au pied sans mouiller le feuillage ; laisse sécher la surface.", ["begonia maculata"]),
  p("clivia", "Clivia", "Clivia miniata", "indoor", 10, "partial", "flowering", GD, OR, "Un hiver au frais et plus sec déclenche la floraison."),
  p("amaryllis", "Amaryllis", "Hippeastrum", "indoor", 7, "sun", "bulb", GM, RE, "Arrose peu jusqu'à l'apparition de la hampe, puis régulièrement pendant la floraison.", ["hippeastrum"]),
  p("gardenia", "Gardénia", "Gardenia jasminoides", "indoor", 5, "partial", "flowering", GD, WH, "Exigeant : eau non calcaire, terreau frais et air humide ; ses boutons tombent s'il a froid."),
  p("hibiscus", "Hibiscus", "Hibiscus rosa-sinensis", "both", 4, "sun", "flowering", GD, RE, "Gros buveur en été ; rentre-le dès que les nuits passent sous 12 °C."),
  p("jasmin-etoile", "Jasmin étoilé", "Trachelospermum jasminoides", "both", 5, "sun", "trailing", GD, WH, "Palisse-le sur un support ; arrose régulièrement la première année."),
  // ── Agrumes et fruitiers
  p("citronnier", "Citronnier", "Citrus limon", "both", 5, "sun", "fruiting", GD, YE, "Rentre-le à l'abri du gel l'hiver ; arrose quand la surface est sèche, avec un engrais agrumes au printemps.", ["citrus"]),
  p("calamondin", "Calamondin", "Citrus × microcarpa", "both", 5, "sun", "fruiting", GD, OR, "Petit oranger d'appartement : très lumineux, arrosages réguliers sans excès.", ["oranger d'appartement", "mini oranger"]),
  p("olivier", "Olivier", "Olea europaea", "outdoor", 10, "sun", "tree", SA, undefined, "En pot, arrose quand la terre est sèche sur 5 cm ; il craint plus l'humidité que la sécheresse."),
  p("figuier", "Figuier", "Ficus carica", "outdoor", 7, "sun", "broadleaf", G, undefined, "En pleine terre, arrose seulement la première année ; en pot, régulièrement en été."),
  p("vigne", "Vigne", "Vitis vinifera", "outdoor", 10, "sun", "trailing", G, VI, "En place, elle se débrouille ; arrose seulement les jeunes pieds et en pot.", ["raisin"]),
  p("framboisier", "Framboisier", "Rubus idaeus", "outdoor", 4, "sun", "fruiting", G, RE, "Paille le pied pour garder la fraîcheur ; arrose bien pendant la formation des fruits.", ["framboise"]),
  p("myrtillier", "Myrtillier", "Vaccinium corymbosum", "outdoor", 3, "sun", "fruiting", GM, NA, "Terre de bruyère acide et eau de pluie : l'eau calcaire jaunit ses feuilles.", ["myrtille"]),
  p("fraisier", "Fraisier", "Fragaria × ananassa", "outdoor", 2, "sun", "fruiting", GM, RE, "Arrose au pied, le matin, sans mouiller les fruits ; paille pour les garder propres.", ["fraise"]),
  // ── Aromatiques
  p("basilic", "Basilic", "Ocimum basilicum", "both", 2, "sun", "herb", GL, undefined, "Arrose le matin au pied ; pince les tiges florales pour qu'il reste touffu.", ["basilic"]),
  p("persil", "Persil", "Petroselinum crispum", "both", 3, "partial", "herb", GM, undefined, "Garde la terre fraîche ; coupe les tiges extérieures en premier."),
  p("ciboulette", "Ciboulette", "Allium schoenoprasum", "both", 3, "partial", "grass", GM, LA, "Coupe-la à ras régulièrement, elle repousse ; arrose dès que la surface sèche."),
  p("menthe", "Menthe", "Mentha", "both", 2, "partial", "herb", GL, undefined, "Envahissante : cultive-la en pot ; elle aime une terre toujours fraîche.", ["menthe poivrée", "menthe verte"]),
  p("thym", "Thym", "Thymus vulgaris", "both", 10, "sun", "herb", SA, LA, "Plante méditerranéenne : soleil, sol drainant et très peu d'eau."),
  p("romarin", "Romarin", "Salvia rosmarinus", "both", 10, "sun", "spike", SA, BL, "Arrose peu, il craint l'humidité stagnante bien plus que la sécheresse.", ["rosmarinus officinalis"]),
  p("sauge", "Sauge officinale", "Salvia officinalis", "both", 8, "sun", "herb", SA, VI, "Taille-la après la floraison pour qu'elle ne se dégarnisse pas."),
  p("origan", "Origan", "Origanum vulgare", "both", 8, "sun", "herb", GM, PK, "Peu exigeant : soleil et arrosage modéré.", ["marjolaine"]),
  p("coriandre", "Coriandre", "Coriandrum sativum", "both", 3, "partial", "herb", GL, WH, "Monte vite en graines par forte chaleur : place-la à mi-ombre l'été."),
  p("estragon", "Estragon", "Artemisia dracunculus", "both", 6, "sun", "herb", GM, undefined, "Arrose modérément ; rabats-le en fin d'automne."),
  p("citronnelle", "Citronnelle", "Cymbopogon citratus", "both", 3, "sun", "grass", LI, undefined, "Aime chaleur et eau ; rentre-la en hiver, elle ne supporte pas le gel.", ["lemongrass"]),
  p("verveine", "Verveine citronnelle", "Aloysia citrodora", "both", 4, "sun", "herb", LI, WH, "Arrose régulièrement en été ; protège-la du gel en hiver.", ["verveine odorante"]),
  p("laurier-sauce", "Laurier-sauce", "Laurus nobilis", "both", 8, "sun", "tree", GD, undefined, "Supporte bien la taille ; en pot, arrose quand la surface est sèche.", ["laurier noble"]),
  // ── Potager
  p("tomate", "Tomate", "Solanum lycopersicum", "outdoor", 2, "sun", "fruiting", G, RE, "Arrose au pied, régulièrement et sans mouiller le feuillage, pour éviter le mildiou.", ["tomate cerise", "tomates"]),
  p("poivron", "Poivron / piment", "Capsicum annuum", "outdoor", 3, "sun", "fruiting", G, RE, "Aime la chaleur ; arrose régulièrement, sans excès, une fois les fleurs apparues.", ["piment"]),
  p("aubergine", "Aubergine", "Solanum melongena", "outdoor", 2, "sun", "fruiting", G, VI, "Très gourmande en eau et en chaleur : paille le pied."),
  p("courgette", "Courgette", "Cucurbita pepo", "outdoor", 2, "sun", "broadleaf", G, YE, "Arrose abondamment au pied, jamais sur les feuilles (oïdium).", ["courge"]),
  p("concombre", "Concombre", "Cucumis sativus", "outdoor", 2, "sun", "trailing", G, YE, "Besoin d'eau régulier : une irrégularité rend les fruits amers."),
  p("salade", "Salade", "Lactuca sativa", "outdoor", 2, "partial", "rosette", LI, undefined, "Arrose souvent et peu à la fois ; la chaleur la fait monter en graines.", ["laitue"]),
  p("radis", "Radis", "Raphanus sativus", "outdoor", 2, "sun", "herb", GL, RE, "Sol toujours frais : un manque d'eau rend les radis creux et piquants."),
  p("haricot", "Haricot", "Phaseolus vulgaris", "outdoor", 3, "sun", "trailing", G, WH, "Arrose surtout pendant la floraison et la formation des gousses.", ["haricots verts"]),
  p("carotte", "Carotte", "Daucus carota", "outdoor", 4, "sun", "herb", GL, OR, "Arrosages réguliers ; un sol qui alterne sec et humide fait éclater les racines."),
  p("pomme-de-terre", "Pomme de terre", "Solanum tuberosum", "outdoor", 5, "sun", "herb", G, WH, "Butte les pieds ; arrose surtout pendant la floraison."),
  // ── Fleurs et arbustes d'extérieur
  p("rosier", "Rosier", "Rosa", "outdoor", 4, "sun", "flowering", GD, PK, "Arrose au pied le matin ; retire les fleurs fanées pour prolonger la floraison.", ["rose"]),
  p("lavande", "Lavande", "Lavandula angustifolia", "outdoor", 12, "sun", "spike", SA, LA, "Sol pauvre et sec, plein soleil ; taille-la après la floraison sans couper le vieux bois.", ["lavandin"]),
  p("geranium", "Géranium", "Pelargonium", "outdoor", 4, "sun", "flowering", GM, RE, "Laisse sécher la surface entre deux arrosages ; rentre-le à l'abri du gel.", ["pélargonium"]),
  p("hortensia", "Hortensia", "Hydrangea macrophylla", "outdoor", 3, "partial", "flowering", GM, BL, "Gros buveur, à mi-ombre ; une eau de pluie et un sol acide gardent les fleurs bleues.", ["hydrangea"]),
  p("petunia", "Pétunia", "Petunia × hybrida", "outdoor", 2, "sun", "flowering", GM, MA, "En jardinière, arrose tous les jours par forte chaleur.", ["surfinia"]),
  p("bougainvillier", "Bougainvillier", "Bougainvillea", "outdoor", 6, "sun", "trailing", G, MA, "Laisse sécher entre deux arrosages, c'est ce qui le fait fleurir ; craint le gel."),
  p("laurier-rose", "Laurier-rose", "Nerium oleander", "outdoor", 5, "sun", "flowering", GD, PK, "Toxique ; arrose généreusement en été, peu en hiver, à l'abri du gel s'il est en pot."),
  p("buis", "Buis", "Buxus sempervirens", "outdoor", 7, "partial", "tree", GD, undefined, "Arrose en période sèche ; surveille la pyrale au printemps."),
  p("camelia", "Camélia", "Camellia japonica", "outdoor", 5, "partial", "flowering", GD, PK, "Terre acide et eau non calcaire ; ne le laisse pas sécher en été, quand se forment les boutons."),
  p("glycine", "Glycine", "Wisteria sinensis", "outdoor", 6, "sun", "trailing", GM, LA, "En place, peu d'arrosage ; taille en été et en hiver pour la faire fleurir."),
  p("clematite", "Clématite", "Clematis", "outdoor", 5, "sun", "trailing", GM, VI, "Tête au soleil, pied à l'ombre : paille ou plante un couvre-sol au pied."),
  p("dahlia", "Dahlia", "Dahlia", "outdoor", 3, "sun", "flowering", GM, OR, "Arrose copieusement en été ; déterre les tubercules avant les gelées."),
  p("tulipe", "Tulipe", "Tulipa", "outdoor", 7, "sun", "bulb", GL2, RE, "Arrose peu, surtout après la floraison, et laisse le feuillage jaunir avant de le couper."),
  p("narcisse", "Narcisse", "Narcissus", "outdoor", 7, "sun", "bulb", GM, YE, "Peu d'arrosage ; laisse le feuillage en place jusqu'à ce qu'il jaunisse.", ["jonquille"]),
  p("agapanthe", "Agapanthe", "Agapanthus", "outdoor", 6, "sun", "bulb", GM, BL, "Fleurit mieux à l'étroit en pot ; arrose bien en été, peu en hiver."),
  p("fuchsia", "Fuchsia", "Fuchsia", "outdoor", 3, "partial", "flowering", GM, MA, "Terre toujours fraîche à mi-ombre ; il craint le soleil brûlant de l'après-midi."),
  p("oeillet-inde", "Œillet d'Inde", "Tagetes", "outdoor", 3, "sun", "flowering", GM, OR, "Éloigne certains pucerons du potager ; arrose au pied.", ["tagète"]),
  p("capucine", "Capucine", "Tropaeolum majus", "outdoor", 4, "sun", "trailing", GL, OR, "Sol pauvre : trop d'engrais donne des feuilles et peu de fleurs ; fleurs comestibles."),
  p("pensee", "Pensée", "Viola × wittrockiana", "outdoor", 3, "partial", "flowering", GM, VI, "Fleurit en saison fraîche ; retire les fleurs fanées.", ["violette"]),
  p("chrysantheme", "Chrysanthème", "Chrysanthemum", "outdoor", 3, "sun", "flowering", GD, YE, "Arrose au pied pour éviter les maladies ; ne laisse pas la motte sécher."),
  p("marguerite", "Marguerite", "Leucanthemum", "outdoor", 4, "sun", "flowering", GM, WH, "Coupe les fleurs fanées pour relancer la floraison."),
  p("tournesol", "Tournesol", "Helianthus annuus", "outdoor", 3, "sun", "flowering", G, YE, "Arrose abondamment au pied pendant la croissance ; tuteure les grandes variétés."),
  p("hosta", "Hosta", "Hosta", "outdoor", 4, "shade", "broadleaf", GL2, undefined, "Coin ombragé et terre fraîche ; protège ses feuilles des limaces."),
  p("heuchere", "Heuchère", "Heuchera", "outdoor", 4, "shade", "roundleaf", PU, undefined, "Feuillage décoratif à l'ombre ; garde le sol frais mais drainé."),
  p("fougere-exterieur", "Fougère d'extérieur", "Dryopteris filix-mas", "outdoor", 4, "shade", "fern", GM, undefined, "Ombre et sol humifère toujours frais.", ["fougère mâle"]),
  p("graminee", "Fétuque bleue", "Festuca glauca", "outdoor", 10, "sun", "grass", GL2, undefined, "Graminée de sol sec : arrose seulement en longue sécheresse.", ["graminée"]),
  p("bambou", "Bambou", "Phyllostachys", "outdoor", 4, "partial", "grass", GM, undefined, "En pot, il a besoin de beaucoup d'eau ; en terre, prévois une barrière anti-rhizomes."),
  p("palmier-chine", "Palmier de Chine", "Trachycarpus fortunei", "outdoor", 7, "sun", "palm", GD, undefined, "Le plus rustique des palmiers ; arrose régulièrement en été s'il est en pot.", ["trachycarpus"]),
  p("erable-japon", "Érable du Japon", "Acer palmatum", "outdoor", 4, "partial", "tree", RD, undefined, "Terre fraîche, à l'abri du vent et du soleil brûlant qui grillent ses feuilles."),
  p("magnolia", "Magnolia", "Magnolia", "outdoor", 6, "sun", "tree", GD, PK, "Arrose bien les jeunes sujets ; il n'aime pas être déplacé."),
  p("lilas", "Lilas", "Syringa vulgaris", "outdoor", 7, "sun", "tree", GM, LA, "Peu exigeant ; taille juste après la floraison."),
  p("azalee", "Azalée", "Rhododendron simsii", "outdoor", 3, "partial", "flowering", GD, PK, "Terre de bruyère et eau de pluie ; la motte ne doit jamais sécher.", ["rhododendron"]),
  p("pivoine", "Pivoine", "Paeonia", "outdoor", 6, "sun", "flowering", GM, PK, "Ne l'enterre pas trop profond ; arrose bien au printemps, pendant la formation des boutons."),
  p("iris", "Iris", "Iris germanica", "outdoor", 10, "sun", "bulb", GL2, VI, "Laisse le rhizome affleurer au soleil ; arrose très peu une fois installé."),
  p("lys", "Lys", "Lilium", "outdoor", 5, "sun", "bulb", GM, WH, "Tête au soleil, pied au frais ; surveille le criocère, un petit scarabée rouge."),
  p("glaieul", "Glaïeul", "Gladiolus", "outdoor", 4, "sun", "spike", GM, RE, "Arrose régulièrement pendant la floraison ; tuteure les grandes tiges."),
  p("cosmos", "Cosmos", "Cosmos bipinnatus", "outdoor", 5, "sun", "flowering", LI, PK, "Sol pauvre et peu d'eau donnent le plus de fleurs."),
  p("zinnia", "Zinnia", "Zinnia elegans", "outdoor", 3, "sun", "flowering", GM, OR, "Arrose au pied, le matin, pour éviter l'oïdium."),
  p("impatiens", "Impatiens", "Impatiens walleriana", "outdoor", 2, "shade", "flowering", GM, PK, "Fleurit à l'ombre ; terre toujours humide, elle flétrit vite si elle a soif.", ["impatiente"]),
  p("verveine-ornementale", "Verveine", "Verbena", "outdoor", 3, "sun", "flowering", GM, VI, "Retire les fleurs fanées ; arrosage régulier en jardinière."),
  p("gaura", "Gaura", "Gaura lindheimeri", "outdoor", 8, "sun", "spike", GM, WH, "Très résistante à la sécheresse une fois installée."),
  p("sauge-ornementale", "Sauge ornementale", "Salvia nemorosa", "outdoor", 7, "sun", "spike", GM, VI, "Rabats-la après la première floraison pour une seconde vague."),
  p("eucalyptus", "Eucalyptus", "Eucalyptus gunnii", "outdoor", 6, "sun", "tree", GL2, undefined, "Arrose bien la première année ; il pousse très vite en pleine terre."),
];

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9× ]+/g, " ").replace(/\s+/g, " ").trim();

const INDEX = CATALOG.map((plant) => ({
  plant,
  name: norm(plant.name),
  terms: [plant.name, plant.scientific, ...plant.aliases].map(norm),
}));

/** Local, accent-insensitive search: names starting with the query rank first. */
export function searchCatalog(query: string, limit = 8): CatalogPlant[] {
  const q = norm(query);
  if (!q) return [];
  const score = (e: (typeof INDEX)[number]) =>
    e.name.startsWith(q) ? 0 : e.terms.some((t) => t.startsWith(q)) ? 1 : e.terms.some((t) => t.includes(q)) ? 2 : 3;
  return INDEX.map((e) => ({ e, s: score(e) }))
    .filter(({ s }) => s < 3)
    .sort((a, b) => a.s - b.s || a.e.name.localeCompare(b.e.name))
    .slice(0, limit)
    .map(({ e }) => e.plant);
}

export const getCatalogPlant = (slug: string) => CATALOG.find((p) => p.slug === slug);

/** Matches a scientific name (e.g. from photo identification): species first, then genus. */
export function findByScientific(scientificName: string): CatalogPlant | undefined {
  const [genus, epithet] = norm(scientificName).split(" ");
  if (!genus) return undefined;
  const sci = (p: CatalogPlant) => norm(p.scientific).split(" ");
  return (
    CATALOG.find((p) => { const [g, e] = sci(p); return g === genus && e === epithet; }) ??
    CATALOG.find((p) => sci(p)[0] === genus)
  );
}
