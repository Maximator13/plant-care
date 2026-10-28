import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, développeur, directeur de publication et hébergeur de l'application Plant Care.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegales() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p className="text-muted-foreground">Dernière mise à jour : 14 octobre 2026</p>

      <h2>Éditeur et développeur</h2>
      <p>
        Plant Care est conçue, développée et éditée par <strong>Maxime Coquet</strong>, à titre personnel et non
        commercial.
        <br />
        Contact : <a href="mailto:contact@willsim.fr">contact@willsim.fr</a>
      </p>

      <h2>Directeur de la publication</h2>
      <p>Maxime Coquet</p>

      <h2>Hébergeur</h2>
      <p>
        Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis —{" "}
        <a href="https://vercel.com" rel="noopener noreferrer">
          vercel.com
        </a>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le code, les textes et l&apos;interface de Plant Care sont protégés par le droit d&apos;auteur. Les données
        botaniques proviennent en partie de Perenual, la reconnaissance par photo de Pl@ntNet et les données météo
        d&apos;Open-Meteo (licence CC BY 4.0).
      </p>
    </>
  );
}
