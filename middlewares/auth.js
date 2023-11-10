// Ce fichier contient les middleware relatif à l'authentification

const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function authenticateUser(req, res, next) {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET;

      const decoded = jwt.verify(token, secret);
      const userId = decoded.id;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      req.user = user;
      next();
    } else {
      res.status(401).json({ message: 'Token manquant' });
    }
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
}

module.exports = authenticateUser;