import { api } from "./api.js";

const form = document.getElementById("code-form");
const matriculeField = document.getElementById("matricule-field");
const additionalFields = document.getElementById("additional-fields");
const codeInput = document.getElementById("code");
const matriculeInput = document.getElementById("student-matricule");
const prenomInput = document.getElementById("student-prenom");
const nomInput = document.getElementById("student-nom");
const classInput = document.getElementById("student-class");
const errorBox = document.getElementById("error-box");
const errorText = document.getElementById("error-text");
const card = document.getElementById("card");
const leaderboardEl = document.getElementById("leaderboard");
const hiddenAdminBtn = document.getElementById("hidden-admin-btn");
const hintsListEl = document.getElementById("hints-list");

let currentEggDoc = null;
let step = 1; // 1 = code, 2 = matricule, 3 = infos supplémentaires si nouveau

// Bouton admin caché -> page de login admin
hiddenAdminBtn.addEventListener("click", () => {
  window.location.href = "admin.html";
});

function showError(msg) {
  errorText.textContent = msg;
  errorBox.classList.remove("hidden");
  card.classList.remove("shake");
  void card.offsetWidth;
  card.classList.add("shake");
}

function clearError() {
  errorBox.classList.add("hidden");
  card.classList.remove("shake");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  if (step === 1) {
    const code = codeInput.value.trim();
    if (!code) {
      showError("Merci d'entrer un code.");
      return;
    }

    try {
      const egg = await api.validateCode(code);
      currentEggDoc = egg;
      step = 2;
      matriculeField.classList.remove("hidden");
      additionalFields.classList.add("hidden");
    } catch (error) {
      showError(
        error.message || "🛑 Code invalide. Vérifie le code et réessaie."
      );
    }
  } else if (step === 2 && currentEggDoc) {
    const matricule = matriculeInput.value.trim();

    if (!matricule.match(/^HE\d{6}$/i)) {
      showError(
        "🛑 Le matricule doit être au format HExxxxxx (HE suivi de 6 chiffres)."
      );
      return;
    }

    const formattedMatricule = matricule.toUpperCase();

    try {
      // Tenter d'ajouter la découverte
      await api.addDiscovery({
        eggId: currentEggDoc.id,
        matricule: formattedMatricule,
      });

      form.reset();
      matriculeField.classList.add("hidden");
      additionalFields.classList.add("hidden");
      currentEggDoc = null;
      step = 1;
      clearError();
      loadHints();
      loadLeaderboard();
    } catch (error) {
      // Si le matricule n'existe pas, demander les infos
      if (error.message.includes("matricule inconnu")) {
        step = 3;
        additionalFields.classList.remove("hidden");
      } else {
        showError(
          error.message || "🛑 Erreur lors de la vérification du matricule."
        );
      }
    }
  } else if (step === 3 && currentEggDoc) {
    const prenom = prenomInput.value.trim();
    const nom = nomInput.value.trim();
    const studentClass = classInput.value.trim();
    const matricule = matriculeInput.value.trim().toUpperCase();

    if (!prenom || !nom || !studentClass) {
      showError("🛑 Merci de compléter prénom, nom et classe.");
      return;
    }

    try {
      await api.addDiscovery({
        eggId: currentEggDoc.id,
        matricule,
        prenom,
        nom,
        studentClass,
        points: currentEggDoc.points,
      });

      form.reset();
      matriculeField.classList.add("hidden");
      additionalFields.classList.add("hidden");
      currentEggDoc = null;
      step = 1;
      clearError();
      loadHints();
      loadLeaderboard();
    } catch (error) {
      showError(
        error.message || "🛑 Erreur lors de l'enregistrement de ta découverte."
      );
    }
  }
});

async function loadLeaderboard() {
  try {
    const leaderboard = await api.getLeaderboard();

    if (leaderboard.length === 0) {
      leaderboardEl.innerHTML =
        '<p class="text-slate-400 text-sm">Aucune découverte pour le moment.</p>';
      return;
    }

    let html = "";
    let rank = 1;
    leaderboard.forEach((p) => {
      const fullName = `${p.prenom} ${p.nom}`.trim();
      const displayClass = p.class ? `(${p.class})` : "";
      html += `
        <div class="flex items-center justify-between rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-100">
              ${rank++}
            </div>
            <div>
              <p class="font-semibold">${fullName}</p>
              <p class="text-xs text-slate-400">${displayClass}</p>
            </div>
          </div>
          <p class="font-semibold text-neonBlue">${p.points} pts</p>
        </div>
      `;
    });

    leaderboardEl.innerHTML = html;
  } catch (error) {
    console.error("Erreur lors du chargement du leaderboard:", error);
  }
}

async function loadHints() {
  try {
    const eggs = await api.getEggs();

    const items = eggs
      .filter((egg) => (egg.maxUses ?? 0) - (egg.usedCount ?? 0) > 0)
      .map((egg) => ({
        cours: egg.cours || "Cours / bloc inconnu",
        indice: egg.indice || "Pas d'indice communiqué.",
        teacher: egg.teacherName || "Professeur anonyme",
        remaining: (egg.maxUses ?? 0) - (egg.usedCount ?? 0),
      }));

    if (items.length === 0) {
      hintsListEl.innerHTML =
        '<p class="text-slate-400 text-sm">Tous les Easter Eggs ont été découverts pour le moment.</p>';
      return;
    }

    let html = "";
    items.forEach((item) => {
      html += `
        <div class="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3">
          <p class="text-xs font-semibold text-neonBlue mb-1">${item.cours}</p>
          <p class="text-sm text-slate-200 mb-1">${item.indice}</p>
          <p class="text-xs text-slate-400 mb-1">Proposé par ${item.teacher}</p>
          <p class="text-xs text-slate-500">Encore ${item.remaining} validation(s) possible(s).</p>
        </div>
      `;
    });

    hintsListEl.innerHTML = html;
  } catch (error) {
    console.error("Erreur lors du chargement des indices:", error);
    hintsListEl.innerHTML =
      '<p class="text-red-400 text-sm">Erreur lors du chargement des indices.</p>';
  }
}

loadLeaderboard();
loadHints();

// Recharger toutes les 30 secondes
setInterval(() => {
  loadLeaderboard();
  loadHints();
}, 30000);
