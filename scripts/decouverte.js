import { api } from "./api.js";

const discoveriesTable = document.getElementById("discoveries-table");

async function loadDiscoveries() {
  try {
    const discoveries = await api.getDiscoveries();
    const eggs = await api.getEggs();

    // Créer une map des eggs pour accès rapide
    const eggsMap = new Map(eggs.map((egg) => [egg.id, egg]));

    if (discoveries.length === 0) {
      discoveriesTable.innerHTML = `
        <tr>
          <td colspan="6" class="px-4 py-3 text-center text-slate-400">
            Aucune découverte pour le moment.
          </td>
        </tr>
      `;
      return;
    }

    let html = "";
    discoveries.forEach((discovery) => {
      const egg = eggsMap.get(discovery.eggId) || {};
      const date = discovery.createdAt
        ? new Date(discovery.createdAt).toLocaleDateString("fr-FR")
        : "N/A";

      html += `
        <tr class="border-b border-slate-800 hover:bg-slate-900/40">
          <td class="px-4 py-3">${egg.cours || "N/A"}</td>
          <td class="px-4 py-3">${egg.teacherName || "N/A"}</td>
          <td class="px-4 py-3">${egg.indice || "N/A"}</td>
          <td class="px-4 py-3">${discovery.prenom} ${discovery.nom}</td>
          <td class="px-4 py-3">${discovery.matricule}</td>
          <td class="px-4 py-3">${date}</td>
        </tr>
      `;
    });

    discoveriesTable.innerHTML = html;
  } catch (error) {
    console.error("Erreur lors du chargement des découvertes:", error);
    discoveriesTable.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-3 text-center text-red-400">
          Erreur lors du chargement des découvertes.
        </td>
      </tr>
    `;
  }
}

loadDiscoveries();
