/* global axios */
/* global Vue */
/* global Cookies */
/* global Qs */
/* global $ */
/* global drawnItems */

var maplayersApp = new Vue({
    delimiters: ['${', '}'],
    el: '#root',
    
    data: {
        lgroups: [],
        layers: [],
        selectedLayer: 0,
        feature: {},
        layer: {},
    },
    
    computed: {
        mapPk: function(){
            // This function will get the id of the map being edited
            var pathArray = window.location.pathname.split('/');
            var pk = parseInt(pathArray[2]);
            ///api/eventmaps/4/
            return pk;
        },
        
        
    }, // computed
    
    mounted() {
      this.getlayerlist();  
    },
    
    methods: {
        
        checkAndSetStyle: function(style, l){
          if (l.feature.properties.type !== 'marker') {
              l.setStyle(style);
          } 
        },
        
        onFeatureClicked: function(feature){
          _that = this;
          map.eachLayer(function(l){
             
             if(l.feature != undefined ){
                 //console.log(l);
                    
                 if ( l.feature.id === feature.id){
                     _that.checkAndSetStyle({ weight: '5', opacity: 0.5}, l);
                     l.openPopup();
                 }
                 else{
                     _that.checkAndSetStyle({ weight: '2', opacity: 0.7}, l);
                 }
                 
             }
             
          });
        },
        
        checkboxChanged: function(l, event) {
            
            if (l.checked){
                if (map.hasLayer(l.layerGroup) == false && l.layerGroup !== undefined){
                    map.addLayer(l.layerGroup);
                    console.log("found layer");
                }
            }
            else{
                if (map.hasLayer(l.layerGroup) == true && l.layerGroup !== undefined){
                    map.removeLayer(l.layerGroup);
                }
            }
            
        },
        
        getlayerlist: function(){
            var _that = this;
            axios.get('/api/eventmaps/' + this.mapPk + '/mlayers/')
            .then(function (response){
                
                var results = response.data.results;
                // console.log(results);
                _that.layers = [];
                // drawnItems.clearLayers();
                
                for (var i=0; i < results.length; i++ ){
                    
                    results[i].features = [];
                    if (results[i].json_data.features){
                        var tempLayerGroup = L.layerGroup();
                        results[i].json_data.features.forEach(function( obj) {
                            results[i].features.push(obj);
                            console.log(obj);
                            var temp = L.GeoJSON.geometryToLayer(obj);
                            // console.log(temp);
                            
                            var feature = temp.feature = temp.feature || {}; // Intialize layer.feature
                            feature.type = feature.type || "Feature"; // Intialize feature.type
                            feature.id = obj.id;
                            var props = feature.properties = feature.properties || {}; // Intialize feature.properties
                            props.name = obj.properties.name;
                            props.description = obj.properties.description;
                            props.ownerLayer = obj.properties.ownerLayer;
                            props.color = obj.properties.color;
                            props.type = obj.properties.type;
                            // control.addOverlay(temp, props.name);
                            // group them as layer group
                            // drawnItems.addLayer(temp);
                            if (props.type !== 'marker'){
                                temp.setStyle({color: props.color, weight:2, opacity:0.7});
                            }
                            
                           
                            temp.bindPopup("<b>" + props.name + "</b><br/>" + props.description);
                            tempLayerGroup.addLayer(temp);
                        }); // end foreach
                        
                        tempLayerGroup.addTo(map);
                        //_that.lgroups.push(tempLayerGroup);
                        
                    } // endif
                    
                    results[i].checked = true;
                    results[i].layerGroup = tempLayerGroup || undefined;
                    _that.layers.push(results[i]);
                    
                    
                }
                
            });
        },
        
        selectLayer: function(index, alayer){
            this.selectedLayer = index;
            
            
        },
        
        showDetail: function (index){},
        

        
    }, // methods
    
})