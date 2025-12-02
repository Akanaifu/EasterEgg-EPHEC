import { api } from "./api.js";

const eggForm = document.getElementById("egg-form");
const eggSuccess = document.getElementById("egg-success");
const eggError = document.getElementById("egg-error");
const eggList = document.getElementById("egg-list");
const deleteModal = document.getElementById("delete-modal");
const confirmDelete = document.getElementById("confirm-delete");
const cancelDelete = document.getElementById("cancel-delete");

let selectedEggId = null;

// Charger la liste des eggs
async function loadEggs() {
  try {
    const eggs = await api.getEggs();
    eggList.innerHTML = "";

    eggs.forEach((egg) => {
      const row = document.createElement("div");
      row.className =
        "flex justify-between items-center bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-lg";

      row.innerHTML = `
        <div>
          <p><span class="font-semibold text-neonBlue">Code :</span> ${egg.code}</p>
          <p>Cours : ${egg.cours}</p>
          <p>Prof : ${egg.teacherName}</p>
        </div>

        <button 
          class="text-red-400 text-xl px-3 hover:text-red-300"
          data-id="${egg.id}"
        >
          ×
        </button>
      `;

      row.querySelector("button").addEventListener("click", () => {
        selectedEggId = egg.id;
        deleteModal.classList.remove("hidden");
      });

      eggList.appendChild(row);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des eggs:", error);
  }
}

// Gestion du modal
cancelDelete.addEventListener("click", () => {
  deleteModal.classList.add("hidden");
  selectedEggId = null;
});

confirmDelete.addEventListener("click", async () => {
  if (selectedEggId) {
    try {
      await api.deleteEgg(selectedEggId);
      deleteModal.classList.add("hidden");
      selectedEggId = null;
      loadEggs(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }
});

deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) {
    deleteModal.classList.add("hidden");
    selectedEggId = null;
  }
});

// Ajout d'un nouvel egg
eggForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  eggSuccess.classList.add("hidden");
  eggError.classList.add("hidden");

  const eggData = {
    code: document.getElementById("egg-code").value.trim(),
    cours: document.getElementById("egg-cours").value.trim(),
    teacherName: document.getElementById("egg-teacher").value.trim(),
    indice: document.getElementById("egg-indice").value.trim(),
    maxUses: parseInt(document.getElementById("egg-max").value, 10) || 1,
    points: parseInt(document.getElementById("egg-points").value, 10) || 0,
  };

  if (
    !eggData.code ||
    !eggData.cours ||
    !eggData.teacherName ||
    !eggData.indice
  ) {
    eggError.textContent = "Veuillez remplir tous les champs.";
    eggError.classList.remove("hidden");
    return;
  }

  try {
    await api.addEgg(eggData);
    eggForm.reset();
    eggSuccess.classList.remove("hidden");
    loadEggs(); // Recharger la liste
  } catch (error) {
    eggError.textContent =
      error.message || "Erreur lors de l'ajout de l'easter egg.";
    eggError.classList.remove("hidden");
  }
});

// Charger les eggs au démarrage
loadEggs();
