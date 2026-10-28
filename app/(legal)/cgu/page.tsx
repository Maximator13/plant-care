import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Règles d'accès et d'utilisation de l'application Plant Care.",
  alternates: { canonical: "/cgu" },
};

export default function Cgu() {
  return (
    <>
      <h1>Conditions générales d&apos;utilisation</h1>
      <p className="text-muted-foreground">Dernière mise à jour : 14 octobre 2026</p>

      <h2>1. Objet</h2>
      <p>
        Plant Care aide à suivre l&apos;arrosage de plantes d&apos;intérieur et d&apos;extérieur en tenant compte de
        l&apos;espèce, de la saison et de la météo locale. L&apos;utilisation de l&apos;application vaut acceptation des
        présentes conditions.
      </p>

      <h2>2. Accès et compte</h2>
      <p>
        L&apos;accès nécessite un compte. Tu es responsable de la confidentialité de tes identifiants et des données que
        tu saisis. Le service est fourni gratuitement et peut être interrompu pour maintenance.
      </p>

      <h2>3. Conseils fournis à titre indicatif</h2>
      <p>
        Les dates d&apos;arrosage, conseils et alertes sont calculés automatiquement par un algorithme, à partir de
        données tierces (météo, fiches botaniques, reconnaissance par photo). Ils sont indicatifs : observe toujours tes
        plantes. L&apos;éditeur, Maxime Coquet, ne peut être tenu responsable d&apos;une plante abîmée.
      </p>

      <h2>4. Utilisation interdite</h2>
      <p>Toute tentative d&apos;accès non autorisé, d&apos;envoi automatisé ou de perturbation du service est interdite.</p>

      <h2>5. Données personnelles</h2>
      <p>
        Leur traitement est décrit dans la <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>6. Modification et droit applicable</h2>
      <p>
        Ces conditions peuvent évoluer ; la version en vigueur est celle publiée sur cette page. Elles sont soumises au
        droit français.
      </p>
    </>
  );
}
