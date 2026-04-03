const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Récupérer tous les produits (Public)
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT p.*, u.nom AS vendeur_nom, u.prenoms AS vendeur_prenoms, u.telephone AS vendeur_tel 
             FROM produits p 
             JOIN users u ON p.user_id = u.id 
             ORDER BY p.created_at DESC`
        );
        res.status(200).json(results);
    } catch (err) {
        console.error("DÉTAIL COMPLET DE L'ERREUR :", err);
        
        res.status(500).json({ 
            success: false,
            message: 'Erreur technique sur le serveur', 
            erreur_precise: err.sqlMessage || err.message, // Ceci s'affichera sur votre écran
            code_erreur: err.code // Exemple: 'ER_NO_SUCH_TABLE'
        });
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

// Publier un produit
router.post('/', auth, async (req, res) => {
    const { nom, categorie, description, prix, quantite, unite, ville, photo } = req.body;
    const user_id = req.user.id;

    try {
        await db.query(
            'INSERT INTO produits (nom, categorie, description, prix, quantite, unite, ville, photo, user_id) VALUES (?,?,?,?,?,?,?,?,?)',
            [nom, categorie, description, prix, quantite, unite, ville, photo, user_id]
        );
        res.status(201).json({ message: "Produit publié ✅" });
    } catch (err) {
        console.error("DÉTAIL COMPLET DE L'ERREUR :", err);
        
        res.status(500).json({ 
            success: false,
            message: 'Erreur technique sur le serveur', 
            erreur_precise: err.sqlMessage || err.message, // Ceci s'affichera sur votre écran
            code_erreur: err.code // Exemple: 'ER_NO_SUCH_TABLE'
        });
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

// Voir les produits de l'agriculteur connecté
router.get('/mes-produits', auth, async (req, res) => {
    try {
        const [results] = await db.query(
            'SELECT * FROM produits WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.status(200).json(results);
    } catch (err) {
        onsole.error("DÉTAIL COMPLET DE L'ERREUR :", err);
        
        res.status(500).json({ 
            success: false,
            message: 'Erreur technique sur le serveur', 
            erreur_precise: err.sqlMessage || err.message, // Ceci s'affichera sur votre écran
            code_erreur: err.code // Exemple: 'ER_NO_SUCH_TABLE'
        });
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

// Supprimer un produit
router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM produits WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Produit non trouvé' });
        res.status(200).json({ message: 'Produit supprimé ✅' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

// Récupérer un produit par ID
router.get('/:id', auth, async (req, res) => {
    try {
        const [results] = await db.query(
            'SELECT * FROM produits WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (results.length === 0) return res.status(404).json({ message: 'Produit non trouvé' });
        res.status(200).json(results[0]);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

// Modifier un produit
router.put('/:id', auth, async (req, res) => {
    const { nom, categorie, description, prix, quantite, unite, ville, photo } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE produits SET nom=?, categorie=?, description=?, prix=?, quantite=?, unite=?, ville=?, photo=? WHERE id=? AND user_id=?',
            [nom, categorie, description, prix, quantite, unite, ville, photo, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Produit non trouvé' });
        res.status(200).json({ message: 'Produit modifié ✅' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

module.exports = router;