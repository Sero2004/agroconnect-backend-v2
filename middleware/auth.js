const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req, res, next) => {
    // 1. Récupérer le header
    const authHeader = req.headers['authorization']

    // 2. Vérifier si le header existe et s'il commence bien par "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès refusé, format de token invalide' })
    }

    // 3. Extraire uniquement le jeton (on enlève "Bearer ")
    const token = authHeader.split(' ')[1]

    try {
        // 4. Vérifier le jeton propre
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        res.status(401).json({ message: 'Token invalide ou expiré' })
    }
}