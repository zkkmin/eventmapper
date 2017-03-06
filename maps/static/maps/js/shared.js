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
        checkboxChanged: function(l, event) {
            console.log(l);
            //console.log(event);
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
                            
                            // control.addOverlay(temp, props.name);
                            // group them as layer group
                            // drawnItems.addLayer(temp);
                            temp.bindPopup("<b>" + props.name + "<b><br/>" + props.description);
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
            if (map.hasLayer(alayer.layerGroup)==true && alayer.layerGroup !== undefined){
                
            }
            
        },
        
        showDetail: function (index){},
        

        
    }, // methods
    
})