import type { Metadata } from "next";
import { AddPlantForm } from "@/components/add-plant-form";
import { requireHome } from "@/lib/plants";

export const metadata: Metadata = {
  title: "Ajouter une plante",
  description: "Recherche une espèce et ajoute une plante à suivre.",
};

export default async function NewPlantPage() {
  await requireHome();
  return (
    <>
      <h1 className="text-2xl font-semibold">Ajouter une plante</h1>
      <AddPlantForm />
    </>
  );
}
