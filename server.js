const fs = require('fs');

const express = require('express');
const app = express();

const PORT = 3000;

app.get('/getGames', (req, res) => {
    console.log(req.url);
    if (fs.existsSync('./data/gamesDataRU.json')) {
        let data = fs.readFileSync('./data/gamesDataRU.json', (err) => {
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
app.get('/getPrices', (req, res) => {
    console.log(req.url);
    //setTimeout(() => {
        if (fs.existsSync('./data/gamesDataPrices.json')) {
            let data = fs.readFileSync('./data/gamesDataPrices.json', (err) => {
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
    //}, 5000);
})
app.get('/getPosters', (req, res) => {
    console.log(req.url);
    if (fs.existsSync('./data/gamesDataPosters.json')) {
        let data = fs.readFileSync('./data/gamesDataPosters.json', (err) => {
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
app.get('/getDescriptions', (req, res) => {
    console.log(req.url);
    if (fs.existsSync('./data/gamesDataPosters.json')) {
        let data = fs.readFileSync('./data/gamesDataDescriptions.json', (err) => {
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
app.listen(PORT, () => {
    console.log(`Starting listening on port ${PORT}`)
})