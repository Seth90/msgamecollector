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
            country_flag_origin: '',
            country_flag_target: '',
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
            show: false,
            clientX: 0,
            clientY: 0,
            wasLoaded: false,
            language: 'AR',
            selectedCurrency: '',
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
            const response = await fetch('http://127.0.0.1:3000/getGames', options).catch((err)=> console.log("Error fetching"));
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
        GetAdditionalInfo () {
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
                    this.jsonData[key].msrp_target = m_t;
                    this.jsonData[key].lprice_target = l_t;
                    this.jsonData[key].currency_target = c_t;
                    this.jsonData[key].country_target = this.сountriesShortToFull[cnt_t];
                });
            });
            this.GetData(target = 'getPosters').then((data) => {
                Object.entries(data).forEach((entry) => {
                    const [key, value] = entry;
                    this.jsonData[key].boxshotsmall = value;
                })
            });
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
        //     this.GetData(target = 'getDescriptions?lang=' + this.language).then((data) => {
        //         Object.entries(data).forEach((entry) => {
        //             const [key, value] = entry;
        //             this.jsonData[key].title = value.title;
        //             this.jsonData[key].description = value.shortdesc;
        //             console.log(value.shortdesc);
        //             this.jsonData[key].shortDescription = String(value.shortdesc).substring(0, 300) + '...';
        //         })
        //     })
        // }
    },
    computed: {
        filterList() {
            var tmpArr = [];
            //console.log('filterlist');
            if (this.selectedType && this.selectedType !== "All") {
                tmpArr = this.arr.filter(e => e.type === this.selectedType);
                //this.current = tmpArr.length;
            }
            else {
                tmpArr = this.arr;
            }

            tmpArr = tmpArr.filter(e =>
                e.title.toLowerCase().includes(this.searchText.toLowerCase()));

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
            this.current = tmpArr.length;
            return tmpArr;
        },
    }
}

Vue.createApp(App).mount('#app');