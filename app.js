const express = require('express')
const cors = require('cors')
const logger = require('./middleware/logger')
// const logger = require('./middleware/veryExcitingLogger')

const app = express()
app.use(cors())
app.use(logger)

app.get('/', (req, res) => res.send("Woah!"))

module.exports = app 