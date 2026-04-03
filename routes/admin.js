const express = require('express')
const router = express.Router()
const db = require('../config/db')
const auth = require('../middleware/auth')

// Middleware admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' })
    }
    next()
}

// Récupérer tous les agriculteurs
router.get('/agriculteurs', auth, adminOnly, (req, res) => {
    db.query(
        `SELECT id, nom, prenoms, email, telephone, ville, email_verifie, compte_valide, created_at 
         FROM users 
         WHERE role = 'agriculteur' 
         ORDER BY created_at DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
            res.status(200).json(results)
        }
    )
})

// Valider un compte agriculteur
router.put('/valider/:id', auth, adminOnly, (req, res) => {
    db.query(
        'UPDATE users SET compte_valide = 1 WHERE id = ?',
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
            res.status(200).json({ message: 'Compte validé ✅' })
        }
    )
})

// Rejeter un compte agriculteur
router.delete('/rejeter/:id', auth, adminOnly, (req, res) => {
    db.query(
        'DELETE FROM users WHERE id = ? AND role = "agriculteur"',
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
            res.status(200).json({ message: 'Compte rejeté ❌' })
        }
    )
})

module.exports = router