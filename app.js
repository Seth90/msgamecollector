//import { ref, onMounted } from 'vue';
const App = {
    data() {
        return {
            message: "Hello world",
            jsonData: [],
            selectedType: null,
            searchText: '',
            arr: [],
            total: 0,
            current: 0,
            isHidden: true,
            /* Словарь соответствий изображений флага и страны */
            flags: {
                "U.A.E.": "./imgs/flags/ae.png",
                "Russia": "./imgs/flags/ru.png",
                "Argentina": "./imgs/flags/ar.png",
                "Turkey": "./imgs/flags/tr.png",
                "Mexico": "./imgs/flags/mx.webp",
                "India": "./imgs/flags/in.webp",
                "Japan": "./imgs/flags/jp.webp",
                "Brazil": "./imgs/flags/br.webp",
                "Korea": "./imgs/flags/kr.png",
                "Italy": "./imgs/flags/it.webp",
                "Canada": "./imgs/flags/ca.webp",
                "Hungary": "./imgs/flags/hu.webp",
                "South Africa": "./imgs/flags/za.webp",
                "United States": "./imgs/flags/us.webp",
                "United Kingdom": "./imgs/flags/gb.webp",
                "Colombia": "./imgs/flags/co.png",
                "Australia": "./imgs/flags/au.png",
                "Sweden": "./imgs/flags/se.webp",
                "Germany": "./imgs/flags/de.webp",
                "New Zealand": "./imgs/flags/nz.webp",
                "France": "./imgs/flags/fr.webp",
                "Taiwan": "./imgs/flags/tw.webp",
                "Norway": "./imgs/flags/no.webp"
            },
            /* Словарь соответствий кодf страны и её полного названия */
            сountriesShortToFull: {
                "RU": "Russia",
                "AE": "U.A.E.",
                "AR": "Argentina",
                "TR": "Turkey",
                "MX": "Mexico",
                "IN": "India",
                "JP": "Japan",
                "BR": "Brazil",
                "KR": "Korea",
                "IT": "Italy",
                "CA": "Canada",
                "HU": "Hungary",
                "ZA": "South Africa",
                "US": "United States",
                "GB": "United Kingdom",
                "CO": "Colombia",
                "AU": "Australia",
                "SE": "Sweden",
                "DE": "Germany",
                "NZ": "New Zealand",
                "FR": "France",
                "TW": "Taiwan",
                "NO": "Norway"
            },
            /* Словарь соответствий страны и её кода (код языка + код страны) для получения правильной ссылки на магазин xbox */
            urlRegion: {
                "RU": "RU-RU",
                "AE": "AR-AE",
                "AR": "ES-AR",
                "TR": "TR-TR",
                "MX": "ES-MX",
                "IN": "EN-IN",
                "JP": "JA-JP",
                "BR": "PT-BR",
                "KR": "KO-KR",
                "IT": "IT-IT",
                "CA": "EN-CA",
                "HU": "HU-HU",
                "ZA": "EN-ZA",
                "US": "EN-US",
                "GB": "EN-GB",
                "CO": "ES-CO",
                "AU": "EN-AU",
                "SE": "SV-SE",
                "DE": "DE-DE",
                "NZ": "EN-NZ",
                "FR": "FR-FR",
                "TW": "ZH-TW",
                "NO": "NB-NO"
            },
            wasLoaded: false,
            selectedCurrency: '',
            currencyList: ['USD'],
            currencyObject: {},
            notCurrencyLoaded: true
        }
    },
    mounted() {
        this.GetGeneralGameData().then((data) => {
            this.jsonData = data;
            Object.entries(this.jsonData).forEach((entry) => {
                const [key, value] = entry;
                this.arr.push(value);
            });
            this.arr.sort((prev, next) => (prev.title > next.title) - (prev.title < next.title));
            this.total = this.arr.length;
            this.wasLoaded = true;
            //console.log(this.jsonData);
        });
    },
    methods: {
        async GetGeneralGameData() {
            let options = {
                method: 'GET',
                headers: {}
            };
            var json = {};
            // console.log('......')
            const response = await fetch('http://127.0.0.1:3000/getGames', options).catch((err) => console.log("Error fetching"));
            if (response.ok) {
                json = await response.json();
                //console.log(json);
                this.GetAdditionalInfo();
            }
            else {
                console.log('Response for "getGames" not OK');
            }
            return json;
        },
        GetAdditionalInfo() {
            this.GetData(target = 'getExchanges').then((data) => {
                this.currencyObject = data.quotes;
                Object.entries(data.quotes).forEach((entry) => {
                    const [key, value] = entry;
                    this.currencyList.push(key.substring(3, 6));
                })
                this.notCurrencyLoaded = false;
            });
            this.GetData(target = 'getPrices').then((data) => {
                Object.entries(data).forEach((entry) => {
                    const [key, value] = entry;
                    //!!!!! Присваивание осуществляется для каждого, кто соответствует минимальному !!!!//
                    var min = 1000000;
                    var m_t, l_t, c_t, cnt_t = 0;
                    value.forEach((e, i) => {
                        //console.log("-----");
                        if (e.lprice < min) {
                            //console.log(key, e.lprice, e.currency, e.country);
                            m_t = e.msrp;
                            l_t = e.lprice;
                            c_t = e.currency;
                            cnt_t = e.country;
                            min = e.lprice;
                        }
                        // if (e.country == 'RU') {
                        //     this.jsonData[key].msrp_origin = e.msrp;
                        //     this.jsonData[key].lprice_origin = e.lprice;
                        //     this.jsonData[key].currency_origin = e.currency;
                        //     this.jsonData[key].country_origin = e.country;
                        // }
                    })
                    this.jsonData[key].msrp_usd = m_t;
                    this.jsonData[key].lprice_usd = l_t;
                    this.jsonData[key].msrp_target = m_t;
                    this.jsonData[key].lprice_target = l_t;
                    this.jsonData[key].currency_target = c_t;
                    this.jsonData[key].country_target = this.сountriesShortToFull[cnt_t];
                    if (this.urlRegion[cnt_t]) {
                        this.jsonData[key].url = this.jsonData[key].url.replace('en-us', this.urlRegion[cnt_t]);
                    }
                });
            });
            /* Получение постеров */
            this.GetData(target = 'getPosters').then((data) => {
                Object.entries(data).forEach((entry) => {
                    const [key, value] = entry;
                    this.jsonData[key].boxshotsmall = value;
                })
            });
            /* Получение описаний */
            this.GetData(target = 'getDescriptions').then((data) => {
                Object.entries(data).forEach((entry) => {
                    const [key, value] = entry;
                    this.jsonData[key].title = value.title;
                    this.jsonData[key].description = value.description;
                    //console.log(value.shortdesc);
                    this.jsonData[key].shortDescription = String(value.description).substring(0, 300) + '...';
                })
            })
        },
        /* Функция получения json-данных с сервера*/
        async GetData(target) {
            let options = {
                method: 'GET',
                headers: {}
            };
            var json = {};
            //console.log('......')
            const response = await fetch(`http://127.0.0.1:3000/${target}`, options);
            if (response.ok) {
                json = await response.json();
                //console.log(json);
            }
            else {
                //console.log('Response not OK');
            }
            return json;
        },
        // onHover(e) {
        //     const { clientX, clientY } = e;
        //     this.show = true;
        //     this.clientX = clientX;
        //     this.clientY = clientY;
        // },
        // onChange(event) {
        //     console.log(event.target.value)
        //     console.log(this.selectedCurrency)
        //     Object.entries(this.jsonData).forEach((entry) => {
        //         const [key, value] = entry;
        //         //     this.jsonData[key].title = value.title;
        //         //     this.jsonData[key].description = value.shortdesc;
        //         //     console.log(value.shortdesc);
        //         //     this.jsonData[key].shortDescription = String(value.shortdesc).substring(0, 300) + '...';
        //     })
        // }
    },
    computed: {
        filterList() {
            var tmpArr = [];
            /* -----Фильтрация по типу----- */
            if (this.selectedType && this.selectedType !== "All") {
                tmpArr = this.arr.filter(e => e.type === this.selectedType);
                //this.current = tmpArr.length;
            }
            else {
                tmpArr = this.arr;
            }
            /* -----END Фильтрация по типу----- */

            /* -----Фильтрация по строке поиска----- */
            tmpArr = tmpArr.filter(e =>
                e.title.toLowerCase().includes(this.searchText.toLowerCase()));
            /* -----END Фильтрация по строке поиска----- */

            /* Прячет список на время загрузки */
            if (this.wasLoaded) {
                if (tmpArr.length === 0) {
                    this.isHidden = false;
                }
                else {
                    this.isHidden = true;
                }
            }
            else {
                this.isHidden = true;
            }
            // this.isHidden = (tmpArr.length && this.wasLoaded) ? true : false;

            /* Количество элементов после фильтрации */
            this.current = tmpArr.length;
            /* ----- Пересчет в выбранную валюту ---- */
            if (this.selectedCurrency !== '') {
                if (this.selectedCurrency !== 'USD') {
                    tmpArr.map((e) => {
                        e.currency_target = this.selectedCurrency;
                        e.lprice_target = Math.round(this.currencyObject['USD' + this.selectedCurrency] * e.lprice_usd * 100) / 100;
                        e.msrp_target = Math.round(this.currencyObject['USD' + this.selectedCurrency] * e.msrp_usd * 100) / 100;
                    })
                }
                else {
                    tmpArr.map((e) => {
                        e.currency_target = this.selectedCurrency;
                        e.lprice_target = e.lprice_usd;
                        e.msrp_target = e.msrp_usd;
                    })
                }
            }
            /* -----END Пересчет в выбранную валюту ---- */
            return tmpArr;
        },
    }
}

Vue.createApp(App).mount('#app');