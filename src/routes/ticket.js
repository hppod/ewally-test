const express = require('express')
const router = express.Router()

router.get('/:digitableLine', require('../services/ticket/check'))

module.exports = router