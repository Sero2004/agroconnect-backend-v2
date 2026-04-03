const mysql2 = require('mysql2/promise'); // 1. Ajout de /promise
require('dotenv').config();

// 2. Utiliser createPool est recommandé pour les applications web (plus stable)
const db = mysql2.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 3. Test de connexion simplifié pour le mode Promise
db.getConnection()
    .then(connection => {
        console.log('MySQL connecté avec Succès (Mode Promise) ✅');
        connection.release(); // Libère la connexion
    })
    .catch(err => {
        console.error('Erreur connexion MySQL ❌ :', err);
    });

module.exports = db;