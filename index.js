const navBar = {
    template:`
    <nav class="pa2 outline">
        <ul class="list flex flex-row">
            <li>home</li>
            <li>about</li>
            <li>contact</li>
            <li>A site about {{text}}</li>
        </ul>
    </nav>
    `,
    props:['text']
}

// <p>{{climate}} </p>
const scatterplot = {
    template:`
        <div class="w-50">
            <p class="h4 overflow-y-scroll">{{climate}}</p>
            <div id="barchart"></div>
            <button v-on:click="updateClimateChild">Update Highs!</button>
        </div>
    `,
    data: function() {
        return {
            width: 400,
            height: 400,
            margin: {top: 20, right: 40, bottom: 20, left: 40},
            drawing: null,
            drawingArea: null,
            yMax:null,
            barWidth:null,
            myBars: null
        }
    },
    methods:{
        updateClimateChild: function(){
            this.$emit('update-climate')
        },
        calcXScale: function(val){
            const scale = d3
            .scaleBand()
            .domain(this.climate.map(d => d.Month))
            .rangeRound([0, this.width])
            .padding(0.1);

            return scale(val);
        },
        calcYScale: function(val){
             const scale = d3
            .scaleLinear()
            .domain([this.yMax, 0])
            .range([0, this.height]);

            return scale(val);
        },
        calcYMax: function(_prop){
            return d3.max(this.climate.map(d => d[_prop]));
        },
        setupChart: function(){
            this.yMax = this.calcYMax('Rain');

            this.drawing = d3.select("#barchart").append("svg");
            // set the size of your drawing area
            this.drawing
              .attr("width", this.width + this.margin.left + this.margin.right)
              .attr("height", this.height + this.margin.top + this.margin.bottom)
              .style("background", "#D8D8D8")
          
            // add a group to your drawing
            this.drawingArea = this.drawing.append("g")
            // move your drawing area to have padding
            // don't add .style here unless you want
            // those styles to propogate down
            this.drawingArea
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
    
            this.myBars = this.drawingArea.selectAll(".myBars").data(this.climate);
            this.barWidth = this.width / this.climate.length;
          
            this.myBars
              .enter()
              .append("rect")
              .attr("class", "myBars")
              .attr("x", (d, idx) => this.calcXScale(d.Month))
              .attr("y", d => this.height - this.calcYScale(d.Rain))
              .attr("width", this.barWidth)
              .attr("height", d => this.calcYScale(d.Rain))
              .style("fill", "black")
              .style("stroke", "#F6FFFE")
              .style("stroke-width", 1)
                
        },
        updateChart: function(){
                this.yMax = this.calcYMax('Rain');
              
                this.myBars = this.drawingArea.selectAll(".myBars").data(this.climate);
                
                this.myBars
                  .merge(this.myBars)
                  .transition()
                  .attr("x", (d, idx) => this.calcXScale(d.Month))
                  .attr("y", d => this.height - this.calcYScale(d.Rain))
                  .attr("width", this.barWidth)
                  .attr("height", d => this.calcYScale(d.Rain))
                  .style("fill", "black")
                  .style("stroke", "#F6FFFE")
                  .style("stroke-width", 2);
            
        }
    },
    mounted: function(){
        this.setupChart()
    },
    updated:function(){
        // d3.select("#scatterplot").selectAll('svg').remove()
        // this.makeChart()
        this.updateChart();
    },
    props:['climate']
}

const geoChart = {
    template: `
    <div class="w-50">
        <p class="h4 overflow-y-scroll">{{climate}}</p>
        <div id="geo"></div>
    </div>
    `,
    data: function(){
        return{
            myMap: null,
            circles: null,
        }
    },
    // watch: { 
    //     climate: function(newVal, oldVal) { // watch it
    //         this.updateChart();
    //   }
    // },
    methods:{
        setupChart: function(){
            this.myMap = L.map('geo').setView([ 40.778790, -73.966510], 10);

            // get the stamen toner-lite tiles
            var Stamen_Toner = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> — Map data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: 'abcd',
                minZoom: 0,
                maxZoom: 20,
                ext: 'png'
            });

            // add the tiles to the map
            Stamen_Toner.addTo(this.myMap); 

            this.circles = new L.layerGroup().addTo(this.myMap);

            this.climate.forEach(item => {
                L.circle([40.778790, -73.966510],item.Rain*100, {
                    fillOpacity: 0.1
                }).addTo(this.circles);
            })


        },
        updateChart: function(){
            this.circles.clearLayers();
            this.climate.forEach(item => {
                L.circle([40.778790, -73.966510],item.Rain*100, {
                    fillOpacity: 0.1
                }).addTo(this.circles);
            })
        }
    },
    mounted: function(){
        this.setupChart();
    },
    updated:function(){
        this.updateChart();
    },    
    props:['climate']
}



var app = new Vue({
    el: '#app',
    components: {
        'navbar-top': navBar,
        'graph-scatterplot': scatterplot,
        'graph-geochart': geoChart
    },
    methods:{
        updateClimate: function(){
            this.climate = this.climate.map(item => {
                item.Rain = Math.random()*100;
                return item
            })
        }
    },
    watch: {
        climate: function(){
            console.log("yo yo!")
        }
    },
    data: function(){
        return {
            message1: 'NYC Monthly Avg. Climate',
            climate: [
                {
                  "Month": "July",
                  "High": 85,
                  "Low": 69,
                  "Rain": 8
                },
                {
                  "Month": "August",
                  "High": 84,
                  "Low": 68,
                  "Rain": 7
                },
                {
                  "Month": "September",
                  "High": 76,
                  "Low": 61,
                  "Rain": 7
                },
                {
                  "Month": "October",
                  "High": 65,
                  "Low": 50,
                  "Rain": 6
                },
                {
                  "Month": "November",
                  "High": 54,
                  "Low": 42,
                  "Rain": 7
                },
                {
                  "Month": "December",
                  "High": 44,
                  "Low": 32,
                  "Rain": 8
                },
                {
                  "Month": "January",
                  "High": 39,
                  "Low": 27,
                  "Rain": 8
                },
                {
                  "Month": "February",
                  "High": 42,
                  "Low": 28,
                  "Rain": 6
                },
                {
                  "Month": "March",
                  "High": 50,
                  "Low": 35,
                  "Rain": 8
                },
                {
                  "Month": "April",
                  "High": 62,
                  "Low": 45,
                  "Rain": 8
                },
                {
                  "Month": "May",
                  "High": 72,
                  "Low": 54,
                  "Rain": 9
                },
                {
                  "Month": "June",
                  "High": 80,
                  "Low": 64,
                  "Rain": 8
                }
              ]
        }
    }
  })