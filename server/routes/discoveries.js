import express from "express";
import { db } from "../config/firebase.js";
import admin from "../config/firebase.js";

const router = express.Router();

// Get all discoveries
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("discoveries")
      .orderBy("createdAt", "desc")
      .get();
    const discoveries = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      discoveries.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
      });
    });

    res.json(discoveries);
  } catch (error) {
    console.error("Error fetching discoveries:", error);
    res.status(500).json({ error: "Failed to fetch discoveries" });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const snapshot = await db.collection("discoveries").get();
    const stats = new Map();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const key = data.matricule || "inconnu";

      if (!stats.has(key)) {
        stats.set(key, {
          prenom: data.prenom || "",
          nom: data.nom || "Anonyme",
          class: data.class || "",
          points: 0,
        });
      }

      const entry = stats.get(key);
      entry.points += data.points || 0;
      if (data.prenom) entry.prenom = data.prenom;
      if (data.nom) entry.nom = data.nom;
      if (data.class) entry.class = data.class;
    });

    const leaderboard = Array.from(stats.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Add discovery
router.post("/", async (req, res) => {
  try {
    const { eggId, matricule, prenom, nom, studentClass, points } = req.body;

    if (!eggId || !matricule) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!matricule.match(/^HE\d{6}$/i)) {
      return res.status(400).json({ error: "Invalid matricule format" });
    }

    const formattedMatricule = matricule.toUpperCase();

    // Check if already validated
    const existing = await db
      .collection("discoveries")
      .where("matricule", "==", formattedMatricule)
      .where("eggId", "==", eggId)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: "Vous avez déjà validé ce code" });
    }

    // Check if matricule exists
    const matriculeCheck = await db
      .collection("discoveries")
      .where("matricule", "==", formattedMatricule)
      .limit(1)
      .get();

    let discoveryData;

    if (!matriculeCheck.empty) {
      // Matricule connu, récupérer les infos
      const existingData = matriculeCheck.docs[0].data();
      discoveryData = {
        eggId,
        prenom: existingData.prenom,
        nom: existingData.nom,
        class: existingData.class,
        matricule: formattedMatricule,
        points: points || 10,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
    } else {
      // Nouveau matricule, vérifier qu'on a toutes les infos
      if (!prenom || !nom || !studentClass) {
        return res.status(400).json({ error: "matricule inconnu" });
      }

      discoveryData = {
        eggId,
        prenom,
        nom,
        class: studentClass,
        matricule: formattedMatricule,
        points: points || 10,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
    }

    // Add discovery
    await db.collection("discoveries").add(discoveryData);

    // Increment egg usedCount
    await db
      .collection("eggs")
      .doc(eggId)
      .update({
        usedCount: admin.firestore.FieldValue.increment(1),
      });

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding discovery:", error);
    res.status(500).json({ error: "Failed to add discovery" });
  }
});

export default router;
