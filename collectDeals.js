const fetch = require('node-fetch');
const fs = require('fs');

let headers = new Headers({
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36"
});

var urlRegionArrayFull = ["AR-AE", "AR-SA", "CS-CZ", "DA-DK", "DE-AT", "DE-CH", "DE-DE", "EL-GR", "EN-AE", "EN-GB", "EN-IE", "EN-ZA", "ES-CO", "ES-ES", "FI-FI", "FR-BE", "FR-CH", "FR-FR", "HE-IL", "HU-HU", "IT-IT", "NB-NO", "NL-BE", "NL-NL", "PL-PL", "PT-PT", "RU-RU", "SK-SK", "SV-SE", "TR-TR", "EN-AU", "EN-CA", "EN-HK", "EN-IN", "EN-NZ", "EN-SG", "EN-US", "ES-AR", "ES-CL", "ES-CO", "ES-MX", "JA-JP", "KO-KR", "PT-BR", /*"ZH-CN",*/ "ZH-HK", "ZH-TW"];

const urlRegionArray = urlRegionArrayFull.filter((e, i, a) => a.indexOf(e) === i);

var allGames = {};
var allGamesPrices = {};
var allGamesPosters = {};
var allGamesDescriptions = {};
var currencyDict = {};

var currencyChUrl = 'https://www.cbr-xml-daily.ru/daily_json.js';
// MAIN //
console.time('CollectAllData');
GetAllData()
    .then(() => {
        console.log("Getting description for EN language..");
        GetDescriptions("en-us")
            .then(() => {
                WriteData();
                console.log("FINISHED");
                console.timeEnd('CollectAllData');
            });
    })
// END MAIN //
async function GetAllData() {
    await GetChangeData();
    for (let i = 0; i < urlRegionArray.length; i++) {
        console.log(`Progress: ${i + 1} / ${urlRegionArray.length}`);
        
        await sleep(1000); //Задержка между странами

        const urlRegion = urlRegionArray[i];
        console.log(urlRegion.toUpperCase());
        const languageCode = urlRegion.split("-")[0].toUpperCase();
        //const countryCode = urlRegion.split("-")[1].toUpperCase();
        console.time('CollectingItems');

        await GetDataFromCountry(urlRegion);

        console.timeEnd('CollectingItems');
        console.log('--------------');

        WriteData(languageCode);
    }
}
async function GetDataFromCountry(urlRegion) {

    const countryCode = urlRegion.split("-")[1].toUpperCase();
    const regionLang = urlRegion.split("-")[0].toUpperCase();
    var skip = 0;
    var array_ids = [];

    var recoUrl = "https://reco-public.rec.mp.microsoft.com/channels/Reco/V8.0/Lists/Computed/Deal?Market=US&Language=EN&ItemTypes=Game&deviceFamily=Windows.Xbox&count=2000&skipitems=";

    recoUrl = recoUrl.replace("US", countryCode).replace("EN", regionLang);

    const res = await fetch(recoUrl + skip, { headers: headers });
    const json = await res.json();
    totalItems = +json.PagingInfo.TotalItems;
    json.Items.forEach(e => {
        array_ids.push(e.Id);
    })
    skip = 200;
    console.log("Total: " + totalItems);
    var prom_arr = [];
    var index = 0;
    do {
        prom_arr[index++] = new Promise((resolve, reject) => {
            fetch(recoUrl + skip, { headers: headers }).then((res) => res.json()).then((json) => resolve(json)).catch((err) => console.log(err));
        });
        skip += 200;
    } while (skip < totalItems);
    var gamePromiseArray = [];
    await Promise.all(prom_arr).then((data) => {
        data.forEach((e, i) => {
            e.Items.forEach(el => {
                array_ids.push(el.Id);
            })
        })
    })

    

    var r = array_ids;
    var gamesUrl = 'https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=GAMEIDS&market=' + countryCode + '&languages=' + regionLang + '&MS-CV=DGU1mcuYo0WMMp+F.1';
    let chunk = 0;
    for (let i = 0; i < Math.ceil(r.length / 10); i++) {

        if (i === 40) {
            await sleep(1000);
            console.log("sleep" + i);
        }

        let tmpArr = r.slice(chunk, chunk + 10);
        chunk += 10;
        let tmpGameUrl = gamesUrl.replace('GAMEIDS', tmpArr.join(','));
        gamePromiseArray[i] = new Promise((resolve, reject) =>
            fetch(tmpGameUrl, { headers: headers })
                .then(res => res.json())
                .then(json => resolve(json)))
            .catch((err) => {
            });
    }
    await Promise.all(gamePromiseArray).then(data => {
        data.forEach((e) => {
            ParseData(e, urlRegion);
        })
    })
}
async function GetChangeData() {
    let data = fs.readFileSync('./data/currency_DO-NOT-DELETE.json', (err) => {
        err ? console.log(err) : null
    });
    currencyDict = JSON.parse(data);

    // var myHeaders = new Headers();
    // myHeaders.append("apikey", "CEAsqALWnEqO9mUFw6YQGd4SFfFmEFsA");

    // var requestOptions = {
    //     method: 'GET',
    //     redirect: 'follow',
    //     headers: myHeaders
    // };

    // await fetch("https://api.apilayer.com/currency_data/change?source=USD&start_date=2022-12-06&end_date=2022-12-06", requestOptions)
    //     .then(response => response.json())
    //     .then(result => {
    //         currencyDict = result.quotes;
    //         console.log('Get currency_data - ok');
    //         fs.writeFile(`./data/currency.json`, JSON.stringify(result), (error) => {
    //             error ? console.log(error) : null;
    //         });
    //     })
    //     .catch(error => console.log('error', error));
}
async function GetDescriptions(region) {
    var gamePromiseArray = [];
    let ids_array = [];
    Object.entries(allGames).forEach((entry) => {
        const [key, value] = entry;
        ids_array.push(key);
    });
    const languageCode = region.split("-")[0].toUpperCase();
    const countryCode = region.split("-")[1].toUpperCase();

    var r = ids_array;
    var gamesUrl = 'https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=GAMEIDS&market=' + countryCode + '&languages=' + languageCode + '&MS-CV=DGU1mcuYo0WMMp+F.1';
    let chunk = 0;
    for (let i = 0; i < Math.ceil(r.length / 10); i++) {
        let tmpArr = r.slice(chunk, chunk + 10);
        chunk += 10;
        let tmpGameUrl = gamesUrl.replace('GAMEIDS', tmpArr.join(','));
        gamePromiseArray[i] = new Promise((resolve, reject) =>
            fetch(tmpGameUrl)
                .then(res => res.json())
                .then(json => resolve(json)))
            .catch((err) => { console.log(err); reject() });
    }
    await Promise.all(gamePromiseArray).then(data => {
        data.forEach((json) => {
            json.Products.forEach((e, i) => {
                var title = e.LocalizedProperties[0].ProductTitle;
                var shortdesc = e.LocalizedProperties[0].ShortDescription;
                if (shortdesc === "") {
                    shortdesc = e.LocalizedProperties[0].ProductDescription;
                }
                if (shortdesc === undefined) {
                    shortdesc = "";
                }
                allGamesDescriptions[e.ProductId] = {
                    lang: languageCode,
                    title: title,
                    description: shortdesc
                }
            })
        })
    })
}
function ParseData(jsonData, urlRegion) {
    const languageCode = urlRegion.split("-")[0].toUpperCase();
    const countryCode = urlRegion.split("-")[1].toUpperCase();

    jsonData.Products.forEach((e, i) => {
        var phys = "false";
        var title = e.LocalizedProperties[0].ProductTitle;
        var type = e.ProductType;
        //get prices
        var listprice;
        var msrpprice;
        var currencycode;
        var onsale = "false";
        var gwg = "false";
        var golddiscount = "false"; // deals with gold ... and gold member sale prices?
        var goldandsilversale = "false";
        var goldandsilversalegoldprice = 100000000;
        var specialprice = 100000000;
        var eaaccessgame = "false";
        var gamepassgame = "false";
        var purchasable = "false";
        var tempea = "false"
        var tempgs = "false";
        var goldaffids = [];
        var platxbox = "false";
        var platpc = "false";
        var platxo = "false";
        var platxsx = "false";
        var plat360 = "false";
        var silversaleperc = "0%";
        var goldandsilversalegoldperc = "0%";
        var multiplayer = "false";
        var coop = "false";
        var mptest = e.Properties;
        var shortdesc = e.LocalizedProperties[0].ShortDescription;
        if (shortdesc === "") {
            shortdesc = e.LocalizedProperties[0].ProductDescription;
        }
        if (shortdesc === undefined) {
            shortdesc = "";
        }
        // BOXSHOT
        if (phys === "false" && e.LocalizedProperties[0].Images !== undefined) {
            var imagesNum = e.LocalizedProperties[0].Images.length;
            var imageInd = 999;
            for (var j = 0; j < imagesNum; j++) {
                if (e.LocalizedProperties[0].Images[j].ImagePurpose === "Poster") { // boxshots BrandedKeyArt
                    imageInd = j;
                    break;
                }
            }
            if (imageInd === 999) {
                for (var j = 0; j < imagesNum; j++) {
                    if (e.LocalizedProperties[0].Images[j].Width < e.LocalizedProperties[0].Images[j].Height) {
                        imageInd = j;
                        break;
                    }
                }
            }
            if (imageInd === 999) {
                imageInd = 1
            }
            if (e.LocalizedProperties[0].Images[imageInd]) {
                var itemBoxshot = e.LocalizedProperties[0].Images[imageInd].Uri.replace("http:", "https:");
                var itemBoxshotSmall;
            } else {
                var itemBoxshot = "https://compass-ssl.xbox.com/assets/3b/7a/3b7a3497-fc6a-4cae-b37e-48c487b084c5.jpg?n=X1-Standard-digital-boxshot_584x800.jpg";
                var itemBoxshotSmall = "https://compass-ssl.xbox.com/assets/3b/7a/3b7a3497-fc6a-4cae-b37e-48c487b084c5.jpg?n=X1-Standard-digital-boxshot_584x800.jpg";
            }
            if (itemBoxshot.indexOf("store-images") !== -1) {
                itemBoxshotSmall = itemBoxshot + "?w=140";
                // itemBoxshot = itemBoxshot + "&h=300&w=200&format=jpg";
                itemBoxshot = itemBoxshot + "?w=200";
            } else {
                itemBoxshotSmall = itemBoxshot;
            }
        } else if (phys === "true" && e.LocalizedProperties[0].Images !== undefined) {
            var imagesNum = e.LocalizedProperties[0].Images.length;
            var imageInd = 999;
            for (var j = 0; j < imagesNum; j++) {
                if (e.LocalizedProperties[0].Images[j].ImagePurpose === "Poster") {
                    imageInd = j;
                    break;
                }
            }
            if (e.LocalizedProperties[0].Images[imageInd]) {
                var itemBoxshot = e.LocalizedProperties[0].Images[imageInd].Uri.replace("http:", "https:");
                var itemBoxshotSmall;
            } else {
                if (e.LocalizedProperties[0].Images[0]) {
                    if (e.LocalizedProperties[0].Images[0].Uri.toLowerCase().indexOf("s-microsoft") === -1) {
                        var itemBoxshot = e.LocalizedProperties[0].Images[0].Uri.replace("http:", "https:") + "&w=231&h=197&q=90&m=6&b=%23FFFFFFFF&o=f";
                    } else {
                        var itemBoxshot = e.LocalizedProperties[0].Images[0].Uri.replace("http:", "https:")
                    }
                    var itemBoxshotSmall = itemBoxshot;
                } else {
                    var itemBoxshot = "https://compass-ssl.xbox.com/assets/3b/7a/3b7a3497-fc6a-4cae-b37e-48c487b084c5.jpg?n=X1-Standard-digital-boxshot_584x800.jpg";
                    var itemBoxshotSmall = "https://compass-ssl.xbox.com/assets/3b/7a/3b7a3497-fc6a-4cae-b37e-48c487b084c5.jpg?n=X1-Standard-digital-boxshot_584x800.jpg";
                }
            }
        } else {
            var itemBoxshot = "https://compass-ssl.xbox.com/assets/3b/7a/3b7a3497-fc6a-4cae-b37e-48c487b084c5.jpg?n=X1-Standard-digital-boxshot_584x800.jpg";
            var itemBoxshotSmall = "https://compass-ssl.xbox.com/assets/3b/7a/3b7a3497-fc6a-4cae-b37e-48c487b084c5.jpg?n=X1-Standard-digital-boxshot_584x800.jpg";
        }
        // END BOXSHOT

        // MP, COOP
        if (mptest.Attributes) {
            for (var n = 0; n < mptest.Attributes.length; n++) {
                if (mptest.Attributes[n].Name.toLowerCase().indexOf("multiplayer") !== -1) {
                    multiplayer = "true";
                }
                if (mptest.Attributes[n].Name.toLowerCase().indexOf("coop") !== -1) {
                    coop = "true";
                }
            }
        }
        //END MP, COOP

        //EACCESS, GAMEPASS, GOLD
        if (phys === "false") {
            if (e.LocalizedProperties[0].EligibilityProperties !== null && e.LocalizedProperties[0].EligibilityProperties !== undefined &&
                e.LocalizedProperties[0].EligibilityProperties !== "undefined") {
                if (e.LocalizedProperties[0].EligibilityProperties.Affirmations.length > 0) {
                    e.LocalizedProperties[0].EligibilityProperties.Affirmations.forEach(function (aff) {
                        if (aff.Description.toLowerCase().indexOf("ea access") !== -1) {
                            tempea = "true";
                        }
                        if (aff.Description.toLowerCase().indexOf("game pass") !== -1) {
                            gamepassgame = "true";
                        }
                        if (aff.Description.toLowerCase().indexOf("gold") !== -1) {
                            tempgs = "true";
                            goldaffids.push(aff.AffirmationProductId);
                        }
                    })
                }
            }
            e.DisplaySkuAvailabilities.forEach(function (sku) {
                var purchnum = 0;
                sku.Availabilities.forEach(function (av, ind) {
                    if (av.Actions.indexOf("Purchase") !== -1) {
                        purchasable = "true";
                        purchnum++;
                        if (purchnum > 1 && tempgs === "true" && av.RemediationRequired === true && goldaffids.indexOf(av.Remediations[0].BigId) !== -1) {
                            goldandsilversale = "true";
                        }
                        // get platform info
                        av.Conditions.ClientConditions.AllowedPlatforms.forEach(function (plat) {
                            if (plat.PlatformName === "Windows.Xbox") {
                                platxbox = "true";
                            }
                            if (plat.PlatformName === "Windows.Desktop") {
                                platpc = "true";
                            }
                        })
                    }
                    if (av.Actions.indexOf("Purchase") !== -1 && (av.OrderManagementData.Price.MSRP !== 0 || (av.OrderManagementData.Price.MSRP === 0 && av.OrderManagementData.Price.ListPrice === 0)) &&
                        sku.Sku.Properties.IsTrial === false) {
                        if ((av.OrderManagementData.Price.ListPrice !== av.OrderManagementData.Price.MSRP || (av.OrderManagementData.Price.MSRP === 0 && av.OrderManagementData.Price.ListPrice === 0)) && ind !== 0) {
                            specialprice = av.OrderManagementData.Price.ListPrice;
                        } else {
                            listprice = av.OrderManagementData.Price.ListPrice;
                        }
                        if (ind === 0) {
                            msrpprice = av.OrderManagementData.Price.MSRP;
                        }
                        currencycode = av.OrderManagementData.Price.CurrencyCode;
                        if (av.Properties.MerchandisingTags !== undefined) {
                            if (av.Properties.MerchandisingTags.indexOf("LegacyGamesWithGold") !== -1) {
                                gwg = "true";
                                specialprice = listprice;
                                listprice = msrpprice;
                            }
                            if (av.Properties.MerchandisingTags.indexOf("LegacyDiscountGold") !== -1) {
                                golddiscount = "true";

                            }
                        }
                        if (goldandsilversale === "true" && av.DisplayRank === 1) {
                            goldandsilversalegoldprice = av.OrderManagementData.Price.ListPrice;
                            var golddiff = msrpprice - goldandsilversalegoldprice;
                            goldandsilversalegoldperc = Math.round(golddiff / msrpprice * 100).toString() + "%";
                        }
                        if (tempea === "true" && av.Actions.length === 2) {
                            eaaccessgame = "true";
                        }
                        // if (gameIdArrays["onsale"].indexOf(itemId) !== -1) {
                        //     onsale = "true";
                        // }
                        if (listprice < msrpprice || specialprice < msrpprice) {
                            var listdiff = msrpprice - listprice;
                            silversaleperc = Math.round(listdiff / msrpprice * 100).toString() + "%";
                        }
                    }
                })
            })
            // END EACCESS, GAMEPASS, GOLD

            // PLATFORM
            if (platxbox === "true") {
                if (e.Properties.XboxConsoleGenCompatible === null) {
                    platxo = "true";
                    platxsx = "true";
                } else if (e.Properties.XboxConsoleGenCompatible === undefined) {
                    platxo = "true";
                } else if (e.Properties.XboxConsoleGenCompatible.length === 2) {
                    platxo = "true";
                    platxsx = "true";
                } else if (e.Properties.XboxConsoleGenCompatible[0] === "ConsoleGen8") {
                    platxo = "true";
                } else if (e.Properties.XboxConsoleGenCompatible[0] === "ConsoleGen9") {
                    platxsx = "true";
                }
            }

        } else {
            e.DisplaySkuAvailabilities.forEach(function (sku) {
                sku.Availabilities.forEach(function (av) {
                    if (av.Actions.indexOf("Purchase") !== -1 && av.Actions.indexOf("Browse") !== -1 && (av.OrderManagementData.Price.MSRP !== 0 || (av.OrderManagementData.Price.MSRP === 0 && av.OrderManagementData.Price.ListPrice === 0)) && av.Actions.length > 2) {
                        listprice = av.OrderManagementData.Price.ListPrice;
                        msrpprice = av.OrderManagementData.Price.MSRP;
                        currencycode = av.OrderManagementData.Price.CurrencyCode;
                        // if (gameIdArrays["onsale"].indexOf(itemId) !== -1) {
                        //     onsale = "true";
                        // }
                    }
                })
            })
        }
        // END PLATFORM

        // MARKETS
        if (listprice === undefined) {
            console.log("NOTE: BigID " + e.ProductId + " has no price information.");
            listprice = 100000000;
            msrpprice = 100000000;
            currencycode = "USD";
        }
        var tmp_market = [];
        var tmp_dict = {};
        var tmp_desc = [];
        var tmp_lang_dict = {};


        // if (currencyDict[currencycode]) {
        //     msrpprice = Math.round(msrpprice * (currencyDict[currencycode].Value / currencyDict[currencycode].Nominal) * 100) / 100;
        //     listprice = Math.round(listprice * (currencyDict[currencycode].Value / currencyDict[currencycode].Nominal) * 100) / 100;
        //     currencycode = 'RUB';
        // }
        let changename = "RUB" + currencycode.toUpperCase();
        if (currencyDict[changename]) {
            msrpprice = Math.round((msrpprice / currencyDict[changename].start_rate) * 100) / 100;
            listprice = Math.round((listprice / currencyDict[changename].start_rate) * 100) / 100;
            currencycode = 'RUB';
        }

        if (typeof allGamesPrices[e.ProductId] === 'undefined') {
            tmp_dict = {
                country: countryCode,
                msrp: msrpprice,
                lprice: listprice,
                currency: currencycode
            }
            tmp_market.push(tmp_dict);
        }
        else {
            tmp_dict = {
                country: countryCode,
                msrp: msrpprice,
                lprice: listprice,
                currency: currencycode
            }
            tmp_market = allGamesPrices[e.ProductId];
            tmp_market.push(tmp_dict);
        }
        allGamesPrices[e.ProductId] = tmp_market;

        // END MARKETS
        //tmpLangDict[languageCode] = shortdesc;

        allGamesPosters[e.ProductId] = itemBoxshotSmall;

        let s = title.replace(/[^a-zа-яё0-9\s]/gi, '').replace(/\s+/g, ' ').toLowerCase().split(' ').join('-');
        let gameUrl = `https://www.xbox.com/en-us/games/store/${s}/${e.ProductId}`;

        allGames[e.ProductId] = {
            url: gameUrl,
            type: type,
            multiplayer: multiplayer,
            coop: coop,
            title: title,
            //description: shortdesc,
            boxshot: itemBoxshot,
            //boxshotsmall: itemBoxshotSmall,
            //market: tmp_market,
            // msrp_target: '',
            // lprice_target: '',
            // country_target: '',
            // currency_target: '',
            // msrp_origin: '',
            // lprice_origin: '',
            // country_origin: '',
            // currency_origin: '',
            onsale: onsale,
            eaaccessgame: eaaccessgame,
            gamepassgame: gamepassgame,
            purchasable: purchasable,
            platformxbox: platxbox,
            platformpc: platpc,
            platformxo: platxo,
            platformxsx: platxsx,
            platform360: plat360,
            silversaleperc: silversaleperc,
            goldandsilversalegoldperc: goldandsilversalegoldperc
        };
    })
}
function WriteData(country) {
    fs.writeFile(`./data/gamesDataRU.json`, JSON.stringify(allGames), (error) => {
        error ? console.log(error) : null;
    });
    fs.writeFile(`./data/gamesDataPrices.json`, JSON.stringify(allGamesPrices), (error) => {
        error ? console.log(error) : null;
    });
    fs.writeFile(`./data/gamesDataDescriptions.json`, JSON.stringify(allGamesDescriptions), (error) => {
        error ? console.log(error) : null;
    });
    fs.writeFile(`./data/gamesDataPosters.json`, JSON.stringify(allGamesPosters), (error) => {
        error ? console.log(error) : null;
    });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}