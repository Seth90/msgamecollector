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
                "RU": "./imgs/flags/ru.png",
                "AR": "./imgs/flags/ar.png",
                "TR": "./imgs/flags/tr.png",
                "MX": "./imgs/flags/mx.webp",
                "IN": "./imgs/flags/in.webp",
                "JP": "./imgs/flags/jp.webp",
                "BR": "./imgs/flags/br.webp",
                "KR": "./imgs/flags/kr.png",
                "IT": "./imgs/flags/it.webp",
                "CA": "./imgs/flags/ca.webp",
                "HU": "./imgs/flags/hu.webp",
                "ZA": "./imgs/flags/za.webp",
                "US": "./imgs/flags/us.webp",
                "GB": "./imgs/flags/gb.webp",
                "CO": "./imgs/flags/co.png",
                "AU": "./imgs/flags/au.png",
                "SE": "./imgs/flags/se.webp",
                "DE": "./imgs/flags/de.webp",
                "NZ": "./imgs/flags/nz.webp",
                "FR": "./imgs/flags/fr.webp",
                "TW": "./imgs/flags/tw.webp",
                "NO": "./imgs/flags/no.webp"
            }
        }
    },
    mounted() {
        //var url = "http://127.0.0.1:3000/ya_data";
        console.log("start fetching..");
        this.GetGeneralGameData().then((data) => {
            this.jsonData = data;
            Object.entries(this.jsonData).forEach((entry) => {
                const [key, value] = entry;
                //if (value.type === 'Durable') {
                this.arr.push(value);
                //}
            });
            this.arr.sort((prev, next) => (prev.title > next.title) - (prev.title < next.title));
            this.total = this.arr.length;
            //console.log(this.jsonData);
        });
        console.log('fetching - OK');
        console.log('getting prices...');


    },
    methods: {
        async GetGeneralGameData() {
            let options = {
                method: 'GET',
                headers: {}
            };
            var json = {};
            console.log('......')
            const response = await fetch('http://127.0.0.1:3000/games', options);
            if (response.ok) {
                json = await response.json();
                //console.log(json);
                this.GetPriceGameData().then((data) => {

                    console.log('Preparing data');
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
                            if (e.country == 'RU') {
                                this.jsonData[key].msrp_origin = e.msrp;
                                this.jsonData[key].lprice_origin = e.lprice;
                                this.jsonData[key].currency_origin = e.currency;
                                this.jsonData[key].country_origin = e.country;
                            }
                        })
                        this.jsonData[key].msrp_target = m_t;
                        this.jsonData[key].lprice_target = l_t;
                        this.jsonData[key].currency_target = c_t;
                        this.jsonData[key].country_target = cnt_t;
                    });
                });

            }
            else {
                console.log('Response not OK');
            }

            //this.filterList();
            return json;
        },
        async GetPriceGameData() {
            let options = {
                method: 'GET',
                headers: {}
            };
            var json = {};
            console.log('......')
            const response = await fetch('http://127.0.0.1:3000/prices', options);
            if (response.ok) {
                json = await response.json();
                //console.log(json);
            }
            else {
                console.log('Response not OK');
            }
            return json;
        }
    },
    computed: {
        filterList() {
            var tmpArr = [];
            console.log('filterlist');
            if (this.selectedType && this.selectedType !== "All") {
                tmpArr = this.arr.filter(e => e.type === this.selectedType);
                //this.current = tmpArr.length;
            }
            else {
                tmpArr = this.arr;
            }

            tmpArr = tmpArr.filter(e =>
                e.title.toLowerCase().includes(this.searchText.toLowerCase()));

            this.isHidden = tmpArr.length ? true : false;
            this.current = tmpArr.length;
            return tmpArr;
        },
    }

}

Vue.createApp(App).mount('#app');