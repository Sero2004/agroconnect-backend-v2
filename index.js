const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const produitsRoutes = require('./routes/produits');
const adminRoutes = require('./routes/admin');
const paiementRoutes = require('./routes/paiement');

const app = express();

// Middlewares (Configurés une seule fois)
app.use(cors()); 
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/produits', produitsRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/paiement', paiementRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'AgroConnect API fonctionne ✅' });
});

// Gestion du port (Une seule fois à la fin)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});