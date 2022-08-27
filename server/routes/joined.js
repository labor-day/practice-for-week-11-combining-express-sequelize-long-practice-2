// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import models - DO NOT MODIFY
const { Insect, Tree } = require('../db/models');
const { Op } = require("sequelize");

/**
 * PHASE 7 - Step A: List of all trees with insects that are near them
 *
 * Approach: Eager Loading
 *
 * Path: /trees-insects
 * Protocol: GET
 * Response: JSON array of objects
 *   - Tree properties: id, tree, location, heightFt, insects (array)
 *   - Trees ordered by the tree heightFt from tallest to shortest
 *   - Insect properties: id, name
 *   - Insects for each tree ordered alphabetically by name
 */
router.get('/trees-insects', async (req, res, next) => {
    let trees = [];

    trees = await Tree.findAll({
        attributes: ['id', 'tree', 'location', 'heightFt'],
        order: [['heightFt', 'DESC']],
        include: [{
            model: Insect,
            attributes: ['id', 'name'],
            order: [['name', 'ASC']],
            required: true,
            through: {
                attributes: []
            }
        }]
    });

    res.json(trees);
});

/**
 * PHASE 7 - Step B: List of all insects with the trees they are near
 *
 * Approach: Lazy Loading
 *
 * Path: /insects-trees
 * Protocol: GET
 * Response: JSON array of objects
 *   - Insect properties: id, name, trees (array)
 *   - Insects for each tree ordered alphabetically by name
 *   - Tree properties: id, tree
 *   - Trees ordered alphabetically by tree
 */
router.get('/insects-trees', async (req, res, next) => {
    let payload = [];

    const insects = await Insect.findAll({
        attributes: ['id', 'name', 'description'],
        order: [ ['name'] ],
    });
    for (let i = 0; i < insects.length; i++) {
        const insect = insects[i];
        payload.push({
            id: insect.id,
            name: insect.name,
            description: insect.description,
            trees: await insect.getTrees({
                attributes: ['id', 'tree'],
                joinTableAttributes: []
            })
        });
    }

    res.json(payload);
});

/**
 * ADVANCED PHASE 3 - Record information on an insect found near a tree
 *
 * Path: /associate-tree-insect
 * Protocol: POST
 * Parameters: None
 * Request Body: JSON Object
 *   - Property: tree Object
 *     with id, name, location, height, size
 *   - Property: insect Object
 *     with id, name, description, fact, territory, millimeters
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully recorded information
 *   - Property: data
 *     - Value: object (the new tree)
 * Expected Behaviors:
 *   - If tree.id is provided, then look for it, otherwise create a new tree
 *   - If insect.id is provided, then look for it, otherwise create a new insect
 *   - Relate the tree to the insect
 * Error Handling: Friendly messages for known errors
 *   - Association already exists between {tree.tree} and {insect.name}
 *   - Could not create association (use details for specific reason)
 *   - (Any others you think of)
 */
// Your code here
router.post('/associate-tree-insect', async (req, res, next) => {

    //handle tree
    //if there is no tree object in the body
    if (!req.body.tree) {
        next({
            status: "error",
            message: 'tree missing in request',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }

    //if we do have a tree object, try to find the tree by id, or create one
    let tree;

    if (req.body.tree.id) {
        try {
            tree = await Tree.findByPk(req.body.tree.id);
            if (!tree) {
                next({
                    status: 'not-found',
                    message: `Could not find tree ${req.body.tree.id}.`,
                    details: 'Tree not found'
                });
            }
        } catch(err) {
            next({
                status: "error",
                message: `Could not find tree ${req.body.tree.id}.`,
                details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
            });
        }
    } else { //if there is no id in the body, create a tree
        try {
            tree = Tree.build();
            if (req.body.tree.name) {tree.tree = req.body.tree.name}
            if (req.body.tree.location) {tree.location = req.body.tree.location}
            if (req.body.tree.height) {tree.heightFt = req.body.tree.height}
            if (req.body.tree.size) {tree.groundCircumferenceFt = req.body.tree.size}

            await tree.validate();
            await tree.save();

        } catch(err) {
            next({
                status: "error",
                message: 'Could not create new tree',
                details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
            });
        }
    }


    //handle insect
    //if there is no insect object in the body
    if (!req.body.insect) {
        next({
            status: "error",
            message: 'insect missing in request',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }

    //if we do have a insect object, try to find the insect by id, or create one
    let insect;

    if (req.body.insect.id) {
        try {
            insect = await Insect.findByPk(req.body.insect.id);
            if (!insect) {
                next({
                    status: 'not-found',
                    message: `Could not find insect ${req.body.insect.id}.`,
                    details: 'insect not found'
                });
            }
        } catch(err) {
            next({
                status: "error",
                message: `Could not find insect ${req.body.insect.id}.`,
                details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
            });
        }
    } else { //if there is no id in the body, create a tree
        try {
            insect = Insect.build();
            if (req.body.insect.name) {insect.name = req.body.insect.name}
            if (req.body.insect.description) {insect.description = req.body.insect.description}
            if (req.body.insect.fact) {insect.fact = req.body.insect.fact}
            if (req.body.insect.territory) {insect.territory = req.body.insect.territory}
            if (req.body.insect.millimeters) {insect.millimeters = req.body.insect.millimeters}

            await insect.validate();
            await insect.save();

        } catch(err) {
            next({
                status: "error",
                message: 'Could not create new insect',
                details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
            });
        }
    }

    //check if association exists
    if (await tree.hasInsect(insect)) {
        next({
            status: "error",
            message: `Association already exists between ${tree.tree} and ${insect.name}`,
        });
    }


    //create the association
    await tree.addInsects([insect]);

    //respond
    res.json({
        status: 'success',
        message: 'Successfully created association',
        data: {tree: tree, insect: insect}
    });
});

// Export class - DO NOT MODIFY
module.exports = router;
