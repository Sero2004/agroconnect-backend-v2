const express = require('express');
const router = express.Router();
const { FedaPay, Transaction } = require('fedapay');
const auth = require('../middleware/auth');
const db = require('../config/db'); // On importe la DB pour enregistrer les paiements

// Configuration FedaPay
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
FedaPay.setEnvironment('sandbox'); 

// 1. ROUTE POUR CRÉER LE LIEN DE PAIEMENT
router.post('/creer', auth, async (req, res) => {
    const { montant, produit_id, email_client, nom_client } = req.body;

    try {
        const transaction = await Transaction.create({
            amount: montant,
            description: `Achat produit #${produit_id} sur AgroConnect`,
            currency: { iso: 'XOF' },
            customer: {
                firstname: nom_client,
                email: email_client
            }
        });

        const token = await transaction.generateToken();

        // OPTIONNEL : Enregistrer la commande en 'pending' (en attente)
        await db.query(
            'INSERT INTO commandes (fedapay_id, montant, statut, produit_id, user_id) VALUES (?, ?, ?, ?, ?)',
            [transaction.id, montant, 'pending', produit_id, req.user.id]
        );

        res.json({ 
            url: token.url, 
            transaction_id: transaction.id 
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur FedaPay", error: err.message });
    }
});

// 2. LE WEBHOOK (L'URL que FedaPay appellera toute seule)
// ATTENTION : Pas de middleware "auth" ici !
router.post('/callback', async (req, res) => {
    const event = req.body;

    try {
        // Si la transaction est approuvée par FedaPay
        if (event.status === 'approved') {
            const fedapayId = event.id;

            // On met à jour le statut dans notre base de données
            await db.query(
                'UPDATE commandes SET statut = "approved" WHERE fedapay_id = ?',
                [fedapayId]
            );

            console.log(`💰 Paiement approuvé pour la transaction ${fedapayId}`);
        }

        // On répond 200 à FedaPay pour confirmer la réception
        res.sendStatus(200);
    } catch (err) {
        console.error("Erreur Webhook:", err.message);
        res.status(500).send("Erreur interne");
    }
});

module.exports = router;