const express = require('express')
const router = express.Router()

router.get('', require('../services/ticket/check'))

module.exports = router