const router = require('express').Router();
const transparencyController = require('../controllers/transparencyController');

router.get('/audit', transparencyController.getAudit);

module.exports = router;
