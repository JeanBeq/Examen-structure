const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const authenticateUser = require('../middlewares/auth');

router.get('/all',authenticateUser, async (req, res) => {
    try {
      // Vérifiez si l'utilisateur est connecté et qu'il est admin
      if (req.user.role === 'admin') {
        const users = await User.findAll();
        res.json(users);
      } else {
        // Sinon, renvoyez une erreur 403 (Interdit)
        res.status(403).json({ error: 'Accès refusé. Vous n\'avez pas les permissions.' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
    }
  });

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifiez si les champs obligatoires sont présents dans la requête
    if (!email || !password) {
      return res.status(400).json({ error: 'Les champs obligatoires ne sont pas fournis.' });
    }

    // Vérifiez si l'utilisateur avec cet e-mail existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet utilisateur existe déja.' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créez l'utilisateur avec les informations fournies
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    // Si une erreur survient, on la log et on renvoie un code 500
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur.' });
  }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
  
        // Recherchez l'utilisateur par son email dans la base de données
        const user = await User.findOne({ where: { email } });
  
        // Vérifiez si l'utilisateur existe et si le mot de passe est correct
        if (user && bcrypt.compareSync(password, user.password)) {
            // Générez un token JWT
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
  
            // Renvoyez le token et les informations de l'utilisateur
            res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
        } 
        else {
            // Si l'authentification échoue, renvoyez une erreur 401 (Non autorisé)
            res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de l\'authentification' });
    }
  });

module.exports = router;