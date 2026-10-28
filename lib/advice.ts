import type { Light } from "./catalog";
import type { Season } from "./season";
import type { PlantLocation, WateringStatus } from "./watering";
import type { WeatherContext } from "./weather";

export interface AdviceInput {
  nickname: string;
  location: PlantLocation;
  light: Light;
  baseIntervalDays: number;
  speciesTip: string | null;
  season: Season;
  weather: WeatherContext | null;
  status: WateringStatus;
}

export interface Advice {
  alerts: string[]; // urgent, weather-driven, outdoor plants only
  tips: string[]; // at most 3, most relevant first
}

const RAIN_SKIP_MM = 10;
const MAX_TIPS = 3;

const SEASON_TIPS: Record<Season, Record<PlantLocation, string>> = {
  spring: {
    indoor: "Printemps : la croissance reprend, c'est le bon moment pour rempoter et reprendre l'engrais.",
    outdoor: "Printemps : la croissance reprend, apporte du compost et surveille les dernières gelées.",
  },
  summer: {
    indoor: "Été : la plante boit davantage, vérifie le terreau plus souvent.",
    outdoor: "Été : arrose au pied plutôt que sur le feuillage, de préférence le soir.",
  },
  autumn: {
    indoor: "Automne : espace peu à peu les arrosages et arrête l'engrais.",
    outdoor: "Automne : réduis les arrosages et prépare la protection des plantes frileuses.",
  },
  winter: {
    indoor: "Hiver : croissance ralentie, laisse sécher le terreau en surface ; le chauffage assèche l'air, éloigne-la des radiateurs.",
    outdoor: "Hiver : arrose seulement par temps doux, le matin, jamais sur un sol gelé.",
  },
};

const LIGHT_TIPS: Record<Light, Record<PlantLocation, string>> = {
  sun: {
    indoor: "Place-la près d'une fenêtre très lumineuse, idéalement orientée au sud.",
    outdoor: "À installer en plein soleil, au moins 6 heures par jour.",
  },
  partial: {
    indoor: "Lumière vive mais indirecte, à 1 ou 2 mètres d'une fenêtre.",
    outdoor: "Mi-ombre idéale : soleil le matin, ombre l'après-midi.",
  },
  shade: {
    indoor: "Supporte une faible luminosité ; évite le soleil direct qui brûle ses feuilles.",
    outdoor: "Coin ombragé de préférence ; le soleil direct l'abîme.",
  },
};

/** Rule-based care advice from what we know about the plant, its place, the season and the weather. */
export function adviseFor(i: AdviceInput): Advice {
  const w = i.weather;
  const outdoor = i.location === "outdoor";

  const alerts = !outdoor || !w ? [] : [
    w.frostRisk &&
      `Gel annoncé${w.tempMinC !== null ? ` (jusqu'à ${Math.round(w.tempMinC)} °C)` : ""} : protège ${i.nickname} avec un voile d'hivernage ou rentre-la si elle est en pot.`,
    w.heatwave && `Vague de chaleur : arrose ${i.nickname} tôt le matin ou le soir, et vérifie la terre chaque jour.`,
    w.rain48hMm >= RAIN_SKIP_MM && `Environ ${Math.round(w.rain48hMm)} mm de pluie prévus : inutile d'arroser ${i.nickname} d'ici là.`,
  ].filter((a): a is string => Boolean(a));

  const tips = [
    i.status === "overdue" &&
      "Arrosage en retard : vérifie la terre du doigt ; si elle est sèche sur 2 cm, arrose copieusement.",
    !outdoor && w?.heatwave && i.light === "sun" &&
      "Forte chaleur : éloigne-la de la vitre aux heures les plus chaudes pour éviter les brûlures.",
    i.speciesTip,
    SEASON_TIPS[i.season][i.location],
    i.baseIntervalDays >= 14 && "Plante économe en eau : en cas de doute, attends quelques jours avant d'arroser.",
    i.baseIntervalDays <= 3 && "Aime une terre toujours légèrement humide, mais sans eau stagnante dans la soucoupe.",
    LIGHT_TIPS[i.light][i.location],
  ].filter((t): t is string => Boolean(t));

  return { alerts, tips: tips.slice(0, MAX_TIPS) };
}
