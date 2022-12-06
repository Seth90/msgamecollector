const fetch = require('node-fetch');
const fs = require('fs');
const { resolve } = require('path');
const { Console } = require('console');

var urlRegionArrayFull = ["ru-ru", "ru-us", "ru-ar", "ru-ae", "ru-sa", "ru-cz", "ru-dk", "ru-at", "ru-ch", "ru-de", "ru-gr", "ru-ae", "ru-gb", "ru-ie", "ru-za", "ru-co", "ru-es", "ru-fi", "ru-be", "ru-ch", "ru-fr", "ru-il", "ru-hu", "ru-it", "ru-no", "ru-be", "ru-nl", "ru-pl", "ru-pt", "ru-sk", "ru-se", "ru-tr", "ru-au", "ru-ca", "ru-hk", "ru-in", "ru-nz", "ru-sg", "ru-cl", "ru-mx", "ru-jp", "ru-kr", "ru-br", /*"ru-cn",*/ "ru-tw"];

//urlRegionArrayFull = ["ru-in"];

const urlRegionArray = urlRegionArrayFull.filter((e, i, a) => a.indexOf(e) === i);

var country_promise = [];
var allGames = {};
var allGamesPrices = {};
var currencyDict = {};

var currencyChUrl = 'https://www.cbr-xml-daily.ru/daily_json.js';

async function GetAllData() {

    // await fetch(currencyChUrl)
    //         .then(res => res.json())
    //         .then(json => {
    //             currencyDict = json.Valute;
    //             fs.writeFile(`./currency.json`, JSON.stringify(json), (error) => {
    //                 error ? console.log(error) : null;
    //             });
    //         })
    // console.log('Get currency_data - ok');

    var myHeaders = new Headers();
    myHeaders.append("apikey", "CEAsqALWnEqO9mUFw6YQGd4SFfFmEFsA");

    var requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: myHeaders
    };

    await fetch("https://api.apilayer.com/currency_data/change?source=RUB&start_date=2022-12-06&end_date=2022-12-06", requestOptions)
        .then(response => response.json())
        .then(result => {
            currencyDict = result.quotes;
            console.log('Get currency_data - ok');
            fs.writeFile(`./currency.json`, JSON.stringify(result), (error) => {
                error ? console.log(error) : null;
            });
        })
        .catch(error => console.log('error', error));



    for (let i = 0; i < urlRegionArray.length; i++) {
        console.log(`Progress: ${i + 1} / ${urlRegionArray.length}`);
        const urlRegion = urlRegionArray[i];
        console.log(urlRegion.toUpperCase());
        const countryCode = urlRegion.split("-")[1].toUpperCase();
        console.time('CollectingItems');
        await GetDataFromCountry(urlRegion);
        console.timeEnd('CollectingItems');
        console.log('--------------');
        fs.writeFile(`./gamesDataRU.json`, JSON.stringify(allGames), (error) => {
            error ? console.log(error) : null;
        });
        fs.writeFile(`./gamesDataPrices.json`, JSON.stringify(allGamesPrices), (error) => {
            error ? console.log(error) : null;
        });
    }
}
async function GetDataFromCountry(urlRegion) {

    const countryCode = urlRegion.split("-")[1].toUpperCase();
    const regionLang = urlRegion.split("-")[0].toUpperCase();
    var skip = 0;
    var array_ids = [];

    var recoUrl = "https://reco-public.rec.mp.microsoft.com/channels/Reco/V8.0/Lists/Computed/Deal?Market=US&Language=EN&ItemTypes=Game&deviceFamily=Windows.Xbox&count=2000&skipitems=";

    recoUrl = recoUrl.replace("US", countryCode).replace("EN", regionLang);

    const res = await fetch(recoUrl + skip);
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
        //const res = await fetch(url + skip);
        //console.log(recoUrl + skip);
        prom_arr[index++] = new Promise((resolve, reject) => {
            fetch(recoUrl + skip).then((res) => res.json()).then((json) => resolve(json)).catch((err) => console.log(err));
        });
        skip += 200;
    } while (skip < totalItems);
    var gamePromiseArray = [];
    await Promise.all(prom_arr).then((data) => {
        data.forEach((e, i) => {
            e.Items.forEach(el => {
                array_ids.push(el.Id);
                //console.log(el.Id);
            })
        })
    })
    var r = array_ids;
    var gamesUrl = 'https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=GAMEIDS&market=' + countryCode + '&languages=' + regionLang + '&MS-CV=DGU1mcuYo0WMMp+F.1';
    let chunk = 0;
    for (let i = 0; i < Math.ceil(r.length / 10); i++) {
        //console.log(`Chunk: ${chunk} / ${r.length}`);
        let tmpArr = r.slice(chunk, chunk + 10);
        chunk += 10;
        let tmpGameUrl = gamesUrl.replace('GAMEIDS', tmpArr.join(','));
        //console.log(`GAMES ULR: ${tmpGameUrl}`);

        gamePromiseArray[i] = new Promise((resolve, reject) =>
            fetch(tmpGameUrl)
                .then(res => res.json())
                .then(json => resolve(json)))
            .catch((err) => { console.log(err); reject() });
    }

    await Promise.all(gamePromiseArray).then(data => {
        data.forEach((e) => {
            ParseData(e, countryCode);
        })
    })
}

function ParseData(jsonData, countryCode) {
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
        // END MARKETS

        allGamesPrices[e.ProductId] = tmp_market;



        allGames[e.ProductId] = {
            type: type,
            multiplayer: multiplayer,
            coop: coop,
            title: title,
            description: shortdesc,
            boxshot: itemBoxshot,
            boxshotsmall: itemBoxshotSmall,
            //market: tmp_market,
            msrp_target: '',
            lprice_target: '',
            country_target: '',
            currency_target: '',
            msrp_origin: '',
            lprice_origin: '',
            country_origin: '',
            currency_origin: '',
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
GetAllData().then(() => {
    fs.writeFile(`./gamesDataRU.json`, JSON.stringify(allGames), (error) => {
        error ? console.log(error) : null;
    });
    fs.writeFile(`./gamesDataPrices.json`, JSON.stringify(allGamesPrices), (error) => {
        error ? console.log(error) : null;
    });
});









//console.log(prom_arr);

