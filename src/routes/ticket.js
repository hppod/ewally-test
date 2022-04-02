const express = require('express')
const router = express.Router()

router.get('/:digitableLine', require('../services/ticket/check'))
router.get('/convenio/:digitableLine', require('../services/ticket/convenio'))

module.exports = router