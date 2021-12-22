
const express = require('express');
const app = express();
const open = require('open');
const port = 3333;

app.use(express.static('html/template'));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    open(`http://localhost:${port}`, {app: ['google chrome', '--incognito']});
    console.log(`Example app listening at http://localhost:${port}`)
})