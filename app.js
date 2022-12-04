const App = {
    data() {
        return {
            message: "Hello world",
            jsonData: [],
            selectedType: null,
            arr: [],
            total: 0,
            current: 0
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

                        value.forEach((e, i) => {
                            if (e.country == 'RU') {
                                this.jsonData[key].msrp = e.msrp;
                                this.jsonData[key].lprice = e.lprice;
                            }
                        })
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
            console.log('filterlist');
            if (this.selectedType && this.selectedType !== "All") {
                let tmpArr = this.arr.filter(e => e.type === this.selectedType);
                this.current = tmpArr.length;
                return tmpArr;
            }
            else {
                this.current = this.arr.length;
                return this.arr;
            }
        }
    }
}
Vue.createApp(App).mount('#app');