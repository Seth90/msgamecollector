const App = {
    data() {
        return {
            message: "Hello world",
            jsonData: []
        }
    },
    mounted() {
        //var url = "http://127.0.0.1:3000/ya_data";
        console.log("start fetching..");
        this.GetGeneralGameData().then((data) => {
            this.jsonData = data;
            //console.log(this.jsonData);
        });
        console.log('fetching - OK');
        console.log('getting prices...');

        this.GetPriceGameData().then((data) => {

            console.log('Preparing data');
            Object.entries(data).forEach((entry) => {
                const [key, value] = entry;

                value.forEach((e, i) => {
                    if (e.country == 'RU') {
                        this.jsonData[key].msrp = e.msrp;
                        this.jsonData[key].lprice = e.lprice;
                    }
                })

                //if (typeof value.market[0].RU !== 'undefined') {
                // value.market.forEach((e, i) => {
                //     for (const [key, value] of Object.entries(e)) {
                //         console.log(key, value);
                //       }
                // })
                //}
            });
        });
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
            }
            else {
                console.log('Response not OK');
            }
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
        NonEmptyPrices() {
            let arr = [];
            Object.entries(this.jsonData).forEach((entry) => {
                const [key, value] = entry;
                if (value.type === 'Game') {
                    arr.push(value);
                }
            });
            arr.sort((prev, next) => (prev.title > next.title) - (prev.title < next.title));
            return arr;
        }
    }
}
Vue.createApp(App).mount('#app');