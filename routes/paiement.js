const express = require('express');
const router = express.Router();
// IMPORTATION SIMPLIFIÉE
const FedaPay = require('fedapay').FedaPay;
const Transaction = require('fedapay').Transaction;
const auth = require('../middleware/auth');
const db = require('../config/db');

// Configuration FedaPay
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
FedaPay.setEnvironment('sandbox'); 

router.post('/creer', auth, async (req, res) => {
    // 1. FORCER LE MONTANT EN ENTIER (Trés important pour FedaPay)
    console.log("Body reçu:", req.body);
    const montant = parseInt(req.body.montant);
    const { produit_id, email_client, nom_client, prenom_client } = req.body;
    console.log("prenom_client:", prenom_client);

    try {
        // 2. UTILISATION DE LA MÉTHODE STATIQUE CORRECTE
        const transaction = await Transaction.create({
            amount: montant,
            description: `Achat produit #${produit_nom} sur AgroConnect`,
            currency: { iso: 'XOF' },
            callback_url: 'https://agroconnect-frontend-ten.vercel.app/paiement-succes', // Recommandé d'ajouter ceci
            customer: {
                firstname: prenom_client || "Client", 
                lastname: nom_client || "AgroConnect", // FedaPay aime avoir les deux
                email: email_client
            }
        });

        const token = await transaction.generateToken();

        // 3. ENREGISTREMENT DB (Vérifie que ta table 'commandes' existe bien)
        await db.query(
            'INSERT INTO commandes (fedapay_id, montant, statut, produit_id, user_id) VALUES (?, ?, ?, ?, ?)',
            [transaction.id, montant, 'pending', produit_id, req.user.id]
        );

        res.json({ 
            url: token.url, 
            transaction_id: transaction.id 
        });
    } catch (err) {
        // Afficher l'erreur réelle dans la console Render pour débugger
        console.error("Détail Erreur FedaPay:", err.message);
        res.status(400).json({ message: "Erreur FedaPay", error: err.message });
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