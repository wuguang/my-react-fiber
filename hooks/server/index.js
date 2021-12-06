
const express = require('express')
const app = express()
const port = 3344;

app.use(express.static('html'));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})