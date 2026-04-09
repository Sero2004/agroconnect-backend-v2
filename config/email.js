const { BrevoClient } = require('@getbrevo/brevo');
require('dotenv').config();

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

const envoyerEmailVerification = async (email, nom, token) => {
    const lien = `https://agroconnect-backend-djtm.onrender.com/api/auth/verifier-email?token=${token}`;

    await brevo.transactionalEmails.sendTransacEmail({
        sender: { name: 'AgroConnect Bénin ', email: 'korasero16@gmail.com' },
        to: [{ email: email, name: nom }],
        subject: '✅ Confirmez votre adresse email — AgroConnect Bénin',
        htmlContent: `
            <!DOCTYPE html>
            <html>
                <body style="margin:0; padding:0; background-color:#f0fdf4; font-family: Arial, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding: 40px 20px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
            <!-- HEADER -->
            <tr>
                <td style="background: linear-gradient(135deg, #15803d, #22c55e); padding: 40px; text-align:center;">
                <h1 style="color:white; margin:0; font-size:28px;">🌱 AgroConnect Bénin</h1>
                <p style="color:rgba(255,255,255,0.85); margin:8px 0 0 0; font-size:14px;">La plateforme agricole du Bénin</p>
                </td>
            </tr>

            <!-- BODY -->
            <tr>
            <td style="padding: 40px 40px 20px 40px;">
                <h2 style="color:#1a1a1a; margin:0 0 16px 0;">Bonjour ${nom} ! 👋</h2>
                <p style="color:#555; line-height:1.7; margin:0 0 16px 0;">
                Merci de rejoindre <strong>AgroConnect Bénin</strong>. Votre compte a été créé avec succès.
                </p>
                <p style="color:#555; line-height:1.7; margin:0 0 32px 0;">
                Pour activer votre compte, confirmez votre adresse email en cliquant sur le bouton ci-dessous.
                </p>

                <!-- BOUTON -->
                <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding-bottom: 32px;">
                    <a href="${lien}" 
                        style="background:#15803d; color:white; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:16px; display:inline-block;">
                        ✅ Confirmer mon email
                    </a>
                    </td>
                </tr>
                </table>

                <!-- AVERTISSEMENT -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8; border:1px solid #fde047; border-radius:10px;">
                <tr>
                    <td style="padding:16px;">
                    <p style="color:#854d0e; margin:0; font-size:13px;">
                        ⚠️ Ce lien est valable <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez cet email.
                    </p>
                    </td>
                </tr>
                </table>
            </td>
            </tr>

            <!-- FOOTER -->
            <tr>
            <td style="background:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8; margin:0; font-size:12px;">
                © 2026 AgroConnect Bénin — République du Bénin 🇧🇯
                </p>
                <p style="color:#94a3b8; margin:8px 0 0 0; font-size:12px;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
            </td>
            </tr>

        </table>
        </td>
    </tr>
    </table>
</body>
</html>
`
    });
};

module.exports = { envoyerEmailVerification };