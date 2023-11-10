const express = require('express');
const router = express.Router();
const { Tag } = require('../models');

router.get('/', async (req, res) => {
    try {
        // Paramètres de pagination
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const offset = (page - 1) * pageSize;

        // Récupération des tags
        const { count, rows } = await Tag.findAndCountAll({
            offset: offset,
            limit: pageSize,
        });

        // Calcul du nombre de pages total
        const totalPages = Math.ceil(count / pageSize);

        // Envoi de la réponse
        res.json({
            tags: rows,
            totalTags: count,
            totalPages: totalPages,
            currentPage: page,
        });
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

router.post('/', async (req, res) => {
    try {
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

router.patch('/:id', async (req, res) => {
    try {
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

router.delete('/:id', async (req, res) => {
    try {
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
