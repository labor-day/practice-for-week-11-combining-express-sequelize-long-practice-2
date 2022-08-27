// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

/**
 * INTERMEDIATE BONUS PHASE 2 (OPTIONAL) - Code routes for the insects
 *   by mirroring the functionality of the trees
 */
// Your code here

//import Insect model
const { Insect } = require('../db/models');
//import Op class for use in queries
const { Op } = require("sequelize");

// List of insects returning id, name, and millimeters
//ordered by millimeters from smallest to largest
router.get('/', async (req, res, next) => {
  let insects = [];
  insects = await Insect.findAll({ //call findAll function on the Insect model
      attributes: ['id', 'name', 'millimeters'],
      order: [['millimeters', 'ASC']]
  })
  res.json(insects);
});

// Fetch an insect by id
router.get('/:id', async (req, res, next) => {
  let insect;
  try {
    insect = await Insect.findOne({
      where: {
        id: {
          [Op.eq]: req.params.id
        }
      }
    });

    if (insect) {
      res.json(insect);
    } else {
      next({
        status: 'not-found',
        message: `Could not find insect ${req.params.id}.`,
        details: 'Tree not found'
      });
    }
  } catch(err) {
      next({
        status: "error",
        message: `Could not find insect ${req.params.id}.`,
        details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
      });
  }
});

// Create an insect
router.post('/', async (req, res, next) => {
  try {
    let newInsect = Insect.build();
    if (req.body.name) {newInsect.name = req.body.name}
    if (req.body.description) {newInsect.description = req.body.description}
    if (req.body.fact) {newInsect.fact = req.body.fact}
    if (req.body.territory) {newInsect.territory = req.body.territory}
    if (req.body.millimeters) {newInsect.millimeters = req.body.millimeters}

    await newInsect.validate();
    await newInsect.save();

    res.json({
      status: "Success",
      message: "Successfully created new insect",
      data: newInsect
    });
  } catch(err) {
    next({
      status: "error",
      message: 'Could not create new insect',
      details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
  });
  }
});

// Delete an insect
router.delete('/:id', async (req, res, next) => {
  try {
    let insect = await Insect.findOne({
      where: {
        id: {
          [Op.eq]: req.params.id
        }
      }
    });
    if (!insect) {
      next({
        status: 'not-found',
        message: `Could not remove insect ${req.params.id}`,
        details: 'Insect not found'
      });
    }
    await insect.destroy();
    res.json({
      status: "success",
      message: `successfully removed insect ${req.params.id}`
    });
  } catch(err) {
      next({
        status: "error",
        message: `Could not remove insect ${req.params.id}`,
        details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
      });
  }
})

// Update an insect
router.put('/:id', async (req, res, next) => {
  if (req.params.id != req.body.id) {
    next({
      status: "error",
      message: "Could not update insect",
      details: `${req.params.id} does not match ${req.body.id}`
    });
  }

  try {
    let insect = await Insect.findOne({
      where: {
        id: {
          [Op.eq]: req.params.id
        }
      }
    })

    if (!insect) {
      next({
        status: "not-found",
        message: `Could not update insect ${req.params.id}`,
        details: "Insect not found"
      });
    }

    if (req.body.name) {insect.name = req.body.name}
    if (req.body.description) {insect.description = req.body.description}
    if (req.body.fact) {insect.fact = req.body.fact}
    if (req.body.territory) {insect.territory = req.body.territory}
    if (req.body.millimeters) {insect.millimeters = req.body.millimeters}

    await insect.validate();
    await insect.save();

    res.json({
      status: "success",
      message: "Successfully updated insect",
      data: insect
    });

  } catch(err) {
    next({
      status: "error",
      message: 'Could not update insect',
      details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
  });
  }
});

// Search for an insect by name
router.get('/search/:value', async (req, res, next) => {
  let insects = [];
  insects = await Insect.findAll({
    where: {
      name: {
        [Op.like]: `%${req.params.value}%`
      }
    },
    attributes: ['name', 'id']
  });
  res.json(insects);
});

// Export class - DO NOT MODIFY
module.exports = router;
