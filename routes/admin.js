const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Middleware admin (Reste inchangé, il est très bien)
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
};

// 1. Récupérer tous les agriculteurs (Version Async)
router.get('/agriculteurs', auth, adminOnly, async (req, res) => {
    try {
        // Avec mysql2/promise, on utilise la déstructuration [rows]
        const [rows] = await db.query(
            `SELECT id, nom, prenoms, email, telephone, ville, email_verifie, compte_valide, created_at 
             FROM users 
             WHERE role = 'agriculteur' 
             ORDER BY created_at DESC`
        );
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

// 2. Valider un compte agriculteur (Version Async)
router.put('/valider/:id', auth, adminOnly, async (req, res) => {
    try {
        await db.query(
            'UPDATE users SET compte_valide = 1 WHERE id = ?',
            [req.params.id]
        );
        res.status(200).json({ message: 'Compte validé ✅' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

// 3. Rejeter un compte agriculteur (Version Async)
router.delete('/rejeter/:id', auth, adminOnly, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM users WHERE id = ? AND role = "agriculteur"',
            [req.params.id]
        );
        res.status(200).json({ message: 'Compte rejeté ❌' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

module.exports = router;