'use strict';

const {Tree, Insect} = require('../models');
const {Op} = require('sequelize');

const data = [
  {
    insect: { name: "Western Pygmy Blue Butterfly" },
    trees: [
      { tree: "General Sherman" },
      { tree: "General Grant" },
      { tree: "Lincoln" },
      { tree: "Stagg" },
    ],
  },
  {
    insect: { name: "Patu Digua Spider" },
    trees: [
      { tree: "Stagg" },
    ],
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (let i = 0; i < data.length; i++) {
      let {insect, trees} = data[i];
      let targetInsect = await Insect.findOne({
        where: {
          name: insect.name
        }
      });
      let targetTrees = await Tree.findAll({
        where: {
          [Op.or]: trees
        }
      });
      await targetInsect.addTrees(targetTrees);
    }
  },

  down: async (queryInterface, Sequelize) => {
    for (let i = 0; i < data.length; i++) {
      let {insect, trees} = data[i];
      let targetInsect = await Insect.findOne({
        where: {
          name: insect.name
        }
      });
      let targetTrees = await Tree.findAll({
        where: {
          [Op.or]: trees
        }
      });
      await targetInsect.removeTrees(targetTrees);
    }
  }
};
