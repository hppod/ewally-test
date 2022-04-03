require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.APP_PORT

app.use(cors())
app.use(express.text())
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ type: 'application/json' }))

require('./src/routes/index')(app)

if (PORT) {
    app.listen(PORT, () => {
        console.log(`API listening on port ${PORT}`)
    })
} else {
    console.log('Config port API on .env')
}

module.exports = app