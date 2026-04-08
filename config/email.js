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
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #15803d; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                    <h1 style="color: white; margin: 0;">🌱 AgroConnect Bénin</h1>
                </div>
                <h2 style="color: #333;">Bonjour ${nom} !</h2>
                <p style="color: #666; line-height: 1.6;">
                    Merci de vous être inscrit sur AgroConnect Bénin. 
                    Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${lien}" 
                       style="background: #15803d; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        ✅ Confirmer mon email
                    </a>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
                </p>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="color: #15803d; margin: 0; font-size: 12px; text-align: center;">
                        © 2026 AgroConnect — République du Bénin
                    </p>
                </div>
            </div>
        `
    });
};

module.exports = { envoyerEmailVerification };