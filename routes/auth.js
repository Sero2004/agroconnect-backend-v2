const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const db = require('../config/db')
const { envoyerEmailVerification } = require('../config/email')

// Inscription
router.post('/inscription', (req, res) => {
    const { nom, prenoms, email, mot_de_passe, role, telephone, ville } = req.body

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
        if (results.length > 0) return res.status(400).json({ message: 'Email déjà utilisé' })

        const hash = bcrypt.hashSync(mot_de_passe, 10)
        const token = uuidv4()

        db.query(
            'INSERT INTO users (nom, prenoms, email, mot_de_passe, role, telephone, ville, token_verification) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nom, prenoms, email, hash, role, telephone, ville, token],
            async (err, result) => {
                if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message })

                // Envoyer email de vérification
                try {
                    await envoyerEmailVerification(email, nom, token)
                } catch (emailErr) {
                    console.error('Erreur envoi email:', emailErr)
                }

                res.status(201).json({ 
                    message: 'Inscription réussie ✅ Vérifiez votre email pour activer votre compte.' 
                })
            }
        )
    })
})

// Vérification email
router.get('/verifier-email', (req, res) => {
    const { token } = req.query

    if (!token) return res.status(400).send('Token manquant')

    db.query('SELECT * FROM users WHERE token_verification = ?', [token], (err, results) => {
        if (err) return res.status(500).send('Erreur serveur')
        if (results.length === 0) return res.status(400).send('Token invalide ou expiré')

        db.query(
            'UPDATE users SET email_verifie = 1, token_verification = NULL WHERE token_verification = ?',
            [token],
            (err) => {
                if (err) return res.status(500).send('Erreur serveur')
                res.send(`
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0fdf4;">
                            <h1 style="color: #15803d;">✅ Email confirmé !</h1>
                            <p style="color: #666;">Votre email a été vérifié. Un administrateur va valider votre compte sous peu.</p>
                            <a href=https://agroconnect-frontend-ten.vercel.app/connexion" style="background: #15803d; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                                Se connecter
                            </a>
                        </body>
                    </html>
                `)
            }
        )
    })
})

// Connexion
router.post('/connexion', (req, res) => {
    const { email, mot_de_passe } = req.body

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', erreur: err.message })
        if (results.length === 0) return res.status(400).json({ message: 'Email ou mot de passe incorrect' })

        const user = results[0]

        const valide = bcrypt.compareSync(mot_de_passe, user.mot_de_passe)
        if (!valide) return res.status(400).json({ message: 'Email ou mot de passe incorrect' })

        // Vérifier email confirmé
        if (!user.email_verifie) {
            return res.status(403).json({ message: 'Veuillez confirmer votre email avant de vous connecter.' })
        }

        // Vérifier compte validé par admin (seulement pour les agriculteurs)
        if (user.role === 'agriculteur' && !user.compte_valide) {
            return res.status(403).json({ message: 'Votre compte est en attente de validation par un administrateur.' })
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            message: 'Connexion réussie ✅',
            token,
            user: {
                id: user.id,
                nom: user.nom,
                prenoms: user.prenoms,
                email: user.email,
                role: user.role,
                ville: user.ville
            }
        })
    })
})

module.exports = router