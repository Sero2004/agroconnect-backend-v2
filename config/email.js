const { BrevoClient } = require('@getbrevo/brevo');
require('dotenv').config();

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

const envoyerEmailVerification = async (email, nom, token) => {
    const lien = `https://agroconnect-backend-djtm.onrender.com/api/auth/verifier-email?token=${token}`;

    await brevo.transactionalEmails.sendTransacEmail({
        sender: { name: 'AgroConnect Bénin 🌱', email: 'korasero16@gmail.com' },
        to: [{ email: email, name: nom }],
        subject: '✅ Confirmez votre adresse email — AgroConnect Bénin',
        htmlContent: '<div style="font-family: Arial; padding: 20px;"><h1 style="color: #15803d;">🌱 AgroConnect Bénin</h1><h2>Bonjour ' + nom + ' !</h2><p>Cliquez ci-dessous pour confirmer votre email :</p><a href="' + lien + '" style="background: #15803d; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">✅ Confirmer mon email</a><p style="color: #999; font-size: 12px;">Ce lien expire dans 24 heures.</p></div>'
    });
};

module.exports = { envoyerEmailVerification };