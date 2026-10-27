const express = require("express");

const {
  listCatways,
  getCatway,
  createCatway,
  updateCatway,
  deleteCatway
} = require("../controllers/catwayController");

const router = express.Router();

/**
 * Routes de gestion des catways.
 */
router.route("/")
  .get(listCatways)
  .post(createCatway);

router.route("/:id")
  .get(getCatway)
  .put(updateCatway)
  .delete(deleteCatway);

module.exports = router;