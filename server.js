const fs = require('fs');

const express = require('express');
const app = express();

const PORT = 3000;

app.get('/games', (req, res) => {
    console.log(req.url);
    if (fs.existsSync('./gamesDataRU.json')) {
        let data = fs.readFileSync('./gamesDataRU.json', (err) => {
            err ? console.log(err) : null
        });
        console.log(`Data: ОК`);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Content-Type", "application/json");
        res.end(data);
        console.log('OK')
    }
    else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send('Not extsts');
        console.log('Not exist')
    }
})
app.get('/prices', (req, res) => {
    console.log(req.url);
    setTimeout(() => {
        if (fs.existsSync('./gamesDataPrices.json')) {
            let data = fs.readFileSync('./gamesDataPrices.json', (err) => {
                err ? console.log(err) : null
            });
            console.log(`Data: ОК`);
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Content-Type", "application/json");
            res.end(data);
            console.log('OK')
        }
        else {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.send('Not extsts');
            console.log('Not exist')
        }
    }, 5000);
})

app.listen(PORT, () => {
    console.log(`Starting listening on port ${PORT}`)
})