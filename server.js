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
    const lang = req.query.lang;

    let requiredFilename = `./data/gamesDataDescriptions.json`;
    if (fs.existsSync(requiredFilename)) {
        let data = fs.readFileSync(requiredFilename, (err) => {
            err ? console.log(err) : null
        });

        let full_lang_data = JSON.parse(data);
        let lang_data_4send = {};
        Object.entries(full_lang_data).forEach((entry) => {
            const [key, value] = entry;
                value.forEach((e) => {
                    if (e.lang === lang) {
                        lang_data_4send[key] = e;
                    }
                })
        })

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Content-Type", "application/json");
        res.end(JSON.stringify(lang_data_4send));
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