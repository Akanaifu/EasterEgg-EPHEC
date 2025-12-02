import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// Get all eggs
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("eggs").get();
    const eggs = [];

    snapshot.forEach((doc) => {
      eggs.push({ id: doc.id, ...doc.data() });
    });

    res.json(eggs);
  } catch (error) {
    console.error("Error fetching eggs:", error);
    res.status(500).json({ error: "Failed to fetch eggs" });
  }
});

// Validate code
router.post("/validate", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const snapshot = await db
      .collection("eggs")
      .where("code", "==", code)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Code invalide" });
    }

    const doc = snapshot.docs[0];
    const egg = doc.data();

    if (egg.usedCount >= egg.maxUses) {
      return res
        .status(400)
        .json({ error: "Code déjà utilisé le maximum de fois" });
    }

    res.json({ id: doc.id, ...egg });
  } catch (error) {
    console.error("Error validating code:", error);
    res.status(500).json({ error: "Failed to validate code" });
  }
});

// Add new egg (admin only)
router.post("/", async (req, res) => {
  try {
    const { code, cours, teacherName, indice, maxUses, points } = req.body;

    // Validation
    if (!code || !cours || !teacherName || !indice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if code already exists
    const existing = await db
      .collection("eggs")
      .where("code", "==", code)
      .get();
    if (!existing.empty) {
      return res.status(400).json({ error: "Ce code existe déjà" });
    }

    // Add egg
    const docRef = await db.collection("eggs").add({
      code,
      cours,
      teacherName,
      indice,
      maxUses: maxUses || 1,
      usedCount: 0,
      points: points || 10,
    });

    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error adding egg:", error);
    res.status(500).json({ error: "Failed to add egg" });
  }
});

// Delete egg (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("eggs").doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting egg:", error);
    res.status(500).json({ error: "Failed to delete egg" });
  }
});

export default router;
