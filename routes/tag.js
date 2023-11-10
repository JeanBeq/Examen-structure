const express = require('express');
const router = express.Router();
const { Tag } = require('../models');
const authenticateUser = require('../middlewares/auth');

router.get('/', async (req, res) => {
    try {
        // Récupération des tags
        const Tags = await Tag.findAll();

        // Envoi de la réponse
        res.json(Tags);
    } catch (err) {
        // Si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        // Récupération du tag
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) {
            return res.status(404).json({ error: 'Tag non trouvé' });
        }
        res.json(tag);
    } catch (err) {
        // Si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
});

router.post('/',authenticateUser, async (req, res) => {
    try {
        // Vérifiez si l'utilisateur est connecté et qu'il est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès interdit. Vous n\'avez pas les autorisations nécessaires.' });
        }
        // Récupération des paramètres de la requête
        const { name } = req.body;

        // Vérification si le champ obligatoire est présent dans la requête
        if (!name) {
            return res.status(400).json({ error: 'Le champ obligatoire "name" n\'est pas fourni.' });
        }

        // Création du tag avec les informations fournies
        const tag = await Tag.create({
            name,
        });

        res.status(201).json({ success: true, tag });
    } catch (err) {
        // Si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
});

router.patch('/:id',authenticateUser, async (req, res) => {
    try {
        // Vérifiez si l'utilisateur est connecté et qu'il est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès interdit. Vous n\'avez pas les autorisations nécessaires.' });
        }
        // Récupération du tag
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) {
            return res.status(404).json({ error: 'Tag non trouvé' });
        }

        // Récupération des paramètres
        const { name } = req.body;

        // Mise à jour du tag
        if (name) {
            tag.name = name;
        }

        await tag.save();

        res.json(tag);
    } catch (err) {
        // Si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
});

router.delete('/:id',authenticateUser, async (req, res) => {
    try {
        // Vérifiez si l'utilisateur est connecté et qu'il est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès interdit. Vous n\'avez pas les autorisations nécessaires.' });
        }
        // Récupération du tag
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) {
            return res.status(404).json({ error: 'Tag non trouvé' });
        }

        // Suppression du tag
        await tag.destroy();

        res.json({ success: true });
    } catch (err) {
        // Si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;
