import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Données collectées par Plant Care, finalités, sous-traitants, durée de conservation et droits RGPD.",
  alternates: { canonical: "/confidentialite" },
};

export default function Confidentialite() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p className="text-muted-foreground">Dernière mise à jour : 14 octobre 2026</p>

      <h2>Responsable du traitement</h2>
      <p>
        Maxime Coquet, éditeur de Plant Care (voir les <a href="/mentions-legales">mentions légales</a>). Contact :{" "}
        <a href="mailto:contact@willsim.fr">contact@willsim.fr</a>
      </p>

      <h2>Données collectées et finalités</h2>
      <ul>
        <li>
          <strong>Compte</strong> (adresse email, identifiant) : te connecter et t&apos;envoyer les rappels
          d&apos;arrosage si tu les actives.
        </li>
        <li>
          <strong>Localisation de la maison</strong> (ville ou coordonnées GPS arrondies, fuseau horaire) : récupérer la
          météo locale et déterminer la saison.
        </li>
        <li>
          <strong>Plantes et arrosages</strong> (noms, espèces, dates, notes) : calculer les prochains arrosages.
        </li>
        <li>
          <strong>Photo d&apos;une plante</strong>, si tu utilises la reconnaissance : envoyée à Pl@ntNet pour
          l&apos;identifier, puis oubliée. Plant Care ne la conserve pas.
        </li>
        <li>
          <strong>Abonnement aux notifications</strong> (adresse technique fournie par ton navigateur), si tu les
          actives : t&apos;envoyer les rappels d&apos;arrosage. Il est supprimé dès que tu les désactives.
        </li>
        <li>
          <strong>Mesure d&apos;audience</strong> anonyme, uniquement si tu l&apos;acceptes.
        </li>
      </ul>
      <p>Base légale : exécution du service que tu utilises (CGU) ; consentement pour la mesure d&apos;audience.</p>

      <h2>Sous-traitants</h2>
      <ul>
        <li>Vercel Inc. (États-Unis) : hébergement, mesure d&apos;audience.</li>
        <li>Neon (Databricks, États-Unis) : base de données.</li>
        <li>Clerk Inc. (États-Unis) : authentification.</li>
        <li>Resend (États-Unis) : envoi des emails.</li>
        <li>Open-Meteo (Suisse) : reçoit les coordonnées de la maison pour la météo.</li>
        <li>Perenual (États-Unis) : reçoit les termes de recherche d&apos;espèces.</li>
        <li>Pl@ntNet (Cirad, INRAE, Inria, IRD — France) : reçoit la photo envoyée pour la reconnaissance.</li>
        <li>
          Services de notification de ton navigateur (Apple, Google, Mozilla ou Microsoft) : acheminent les rappels
          jusqu&apos;à ton appareil, uniquement si tu les actives.
        </li>
      </ul>
      <p>
        Certains sous-traitants sont situés hors de l&apos;Union européenne ; les transferts reposent sur les clauses
        contractuelles types de la Commission européenne ou le Data Privacy Framework.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Tes données sont conservées tant que ton compte existe, puis supprimées dans un délai de 30 jours après sa
        suppression.
      </p>

      <h2>Cookies</h2>
      <p>
        Plant Care utilise uniquement des cookies strictement nécessaires à la connexion (Clerk), exemptés de
        consentement. La mesure d&apos;audience (Vercel Web Analytics) ne dépose pas de cookie et n&apos;est chargée
        qu&apos;après ton accord ; tu peux changer d&apos;avis via « Gérer les cookies » en bas de page.
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu disposes d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, de portabilité et
        d&apos;opposition. Écris à <a href="mailto:contact@willsim.fr">contact@willsim.fr</a>. Tu peux aussi
        introduire une réclamation auprès de la{" "}
        <a href="https://www.cnil.fr/fr/plaintes" rel="noopener noreferrer">
          CNIL
        </a>
        .
      </p>
    </>
  );
}
