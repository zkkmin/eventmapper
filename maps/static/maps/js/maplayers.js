/* global axios */
/* global Vue */
/* global Cookies */
/* global Qs */
/* global $ */
/* global drawnItems */
/* global map */
/* global L */

var maplayersApp = new Vue({
    delimiters: ['${', '}'],
    el: '#root',
    
    data: {
        temp: false,
        layerNameHasError: false,
        layerLvlHasError: false,
        layerNameError: '',
        layerLvlError: '',
        
        selectedLayer: 0,
        layer: {
            name: '',
            building_level: '',
            description: '',
            eventmap: '',
            json_data: {},
            checked: true,
            features: [],
            pk: -1,
        }, //layer
        layers: [],
        feature: {
          name: 'Untitled Drawing',
          description: '',
          data: {}
        }, //feature
        drawnLayer: {}, // {featureid, drawnLayer}
        type: "", // marker or else
        json_data: {}, // to hold drawnItems.toGeoJson
    },
    
    computed: {
        mapPk: function(){
            // This function will get the id of the map being edited
            var pathArray = window.location.pathname.split('/');
            var pk = parseInt(pathArray[2]);
            ///api/eventmaps/4/
            return pk;
        },
        
        features: function(){
            var f = [];
            this.layers.forEach(function(l, i){
                l.features.forEach(function(drawnLayer, j){
                    // f.push(drawnItems.getLayerId(drawnLayer));
                }) // end inner forEach
            }); //end outer forEach
            return f;
        },
    }, // computed
    
    mounted() {
        this.getlayerlist(true); 
        
      
    },
    
    methods: {
        hideFeature: function (l) {
            if (l.feature.properties.type === 'marker'){
                l.setOpacity(0);
            }
            else{
                l.setStyle({opacity: 0, fillOpacity: 0});
            }
        },
        
        showFeature: function (l) {
            if (l.feature.properties.type === 'marker'){
                l.setOpacity(1);
            }
            else{
                l.setStyle({color: l.feature.properties.color, opacity: 0.7, fillOpacity: 0.2});
            }
        },
        
        sortFeatures: function (arr) {
            arr.sort(function (a, b){
                          return parseInt(a.properties.index) - parseInt(b.properties.index );
                        });  
        },
        
        getLayerByPK: function (pk) {
            function isPkEqualTo(l){
                return l.pk === pk;
            }
            
            return this.layers.find(isPkEqualTo)
        },
        
        leafletDrawEdited: function (layerIds) {
            
            for (var i = 0; i < layerIds.length; i++){
                this.updateLayerJSONField(this.getLayerByPK(layerIds[i]))    
            }
        },
        
        updateLayerJSONField: function (layer) {
            var layerToEdit = layer;
            this.json_data = drawnItems.toGeoJSON();
            console.log(this.json_data);
            
            // Filter only the features of this layer
            function belongsTo(featureVal){
                return featureVal.properties.ownerLayer == layerToEdit.pk;
             }
             this.json_data.features = this.json_data.features.filter(belongsTo);
            
            var _that = this;
            // https://eventmapper-zkkmin.c9users.io/api/layers/12/
            axios.patch('/api/layers/' + layerToEdit.pk + '/', 
                        { json_data: this.json_data }, 
                        {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}} 
            )
            .then(function(response){
                console.log(response);
                // _that.sortFeatures(response.data.json_data.features);
                
                // layerToEdit.features = [];
                // response.data.json_data.features.forEach(function(obj){
                //     if (obj.properties.ownerLayer == layerToEdit.pk){
                //         layerToEdit.features.push(obj);     
                //     }
                    
                // });
                // // _that.layers.push(layerToEdit);
                
            })
            .catch(function(error){
                console.log(error)
            });
            
        },
        
        updateFeatureProperty: function () {
            // This function will update the properties value of
            // a feature in a layer
            
            var layerToEdit = this.layers[this.selectedLayer];
            this.json_data = drawnItems.toGeoJSON();
            console.log(this.json_data);
            // Filter only the features of this layer
            function belongsTo(featureVal){
                return featureVal.properties.ownerLayer == layerToEdit.pk;
             }
             this.json_data.features = this.json_data.features.filter(belongsTo);
            
            var _that = this;
            // https://eventmapper-zkkmin.c9users.io/api/layers/12/
            axios.patch('/api/layers/' + layerToEdit.pk + '/', 
                        { json_data: this.json_data }, 
                        {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}} 
            )
            .then(function(response){
                console.log(response);
                _that.sortFeatures(response.data.json_data.features);
                
                layerToEdit.features = [];
                response.data.json_data.features.forEach(function(obj){
                    if (obj.properties.ownerLayer == layerToEdit.pk){
                        layerToEdit.features.push(obj);     
                    }
                    
                });
                // _that.layers.push(layerToEdit);
                
            })
            .catch(function(error){
                console.log(error)
            });
          
            
        },
        
        onFeatureIndexChange: function (l) {
           
            console.log(l);
            
            
            l.features.forEach(function(f, i){
                console.log(f.id + ": " + f.properties.name + ": " + i );
                
                drawnItems.eachLayer(function(dLayer){
                   if(dLayer.feature.id === f.id && dLayer.feature.properties.ownerLayer === f.properties.ownerLayer){
                       dLayer.feature.properties.index = i;
                   } 
                });
                
            });
            
            this.updateFeatureProperty();
            
            
            
            // console.log(this.)
            // console.log(evt.item._underlying_vm_.id);
            // var movedFeatureId = evt.item._underlying_vm_.id;
            // var ownerLayerId = evt.item._underlying_vm_.properties.ownerLayer;
            
            // console.log(evt);
            
            // drawnItems.eachLayer(function(l){
            //      if(l.feature.id == movedFeatureId && l.feature.properties.ownerLayer == ownerLayerId ){
                     
            //          l.feature.properties.index = evt.newIndex;
            //      } 
            //   });
            // this.updateFeatureProperty();
            
        },
        
        onFeatureClicked: function (feature) {
            var _that = this;
            console.log(this.selectedLayer);
            var layerClicked = this.layers[this.selectedLayer].pk;
            console.log(layerClicked)
            drawnItems.eachLayer(function (l) {
                if (l.feature != undefined && l.feature.properties.ownerLayer == layerClicked) {
                    if (l.feature.id == feature.id) {
                        
                        if (l.feature.properties.type !== 'marker'){
                            l.setStyle({ weight: '5', opacity: 0.5 }, 1);
                            
                            var middle = parseInt( l._latlngs.length / 2 );
                             map.setView(l._latlngs[0], 19);
                        }
                        else {
                            map.setView(l._latlng, 19);
                        } // end check marker
                        l.openPopup();
                    }
                    else {
                        if (l.feature.properties.type !== 'marker') {
                            l.setStyle({ weight: '2', opacity: 0.7 }, 1);
                        }
                        console.log(l.feature.properties.ownerLayer);
                    } // end check feature id

                }
            });
        },
        
        errorFormData: function (error) {
            if(error.response.data.name){
                this.layerNameError = error.response.data.name[0];
                this.layerNameHasError = true;
            }
            
            if(error.response.data.building_level){
                this.layerLvlError = error.response.data.building_level[0];
                this.layerLvlHasError = true;
            }
        },
        
        clearFormData: function () {
            this.layer = {};
            this.layerNameHasError = false;
            this.layerLvlHasError = false;
            this.layerNameError = '';
            this.layerLvlError = '';
        },
        
        getlayerlist: function (onFirstLoad) {
            var _that = this;
            axios.get('/api/eventmaps/' + this.mapPk + '/mlayers/')
            .then(function (response){
                
                var results = response.data.results;
                // console.log(results);
                _that.layers = [];
                drawnItems.clearLayers();
                
                for (var i=0; i < results.length; i++ ){
                    
                    results[i].features = [];
                    if (results[i].json_data.features){
                        
                        _that.sortFeatures( results[i].json_data.features);

                        results[i].json_data.features.forEach(function( obj) {
                            
                            results[i].features.push(obj);
                            
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
                            props.index = obj.properties.index;
                            
                            temp.bindPopup("<b>" + props.name + "</b><br/>" + props.description);
                            // if page is just loaded and 
                            // the first layer is shown 
                            if (onFirstLoad && i === 0){
                                _that.showFeature(temp);
                            }
                            else{
                                _that.hideFeature(temp);    
                            }
                            
                            drawnItems.addLayer(temp);
                            
                            
                        });
                    }
                    
                    results[i].checked = false;
                    
                    _that.layers.push(results[i]);
                    
                }
                
                // setView
                if (onFirstLoad && results.length > 0 && results[0].features.length > 0 ){
                    
                    // console.log(results[0].features[0].geometry.coordinates[0]);
                    var geometry = results[0].features[0].geometry;
                    var latlng = [];
                    // extract the very first point
                    if (geometry.coordinates[0].constructor===Array){
                    // non marker
                        latlng = geometry.coordinates[0];
                    }
                    else {
                    // marker
                        latlng = geometry.coordinates;
                    }
                    
                    // set map view
                    console.log(latlng);
                    map.setView(L.latLng(latlng[1], latlng[0]), 19);
                    
                    // checked first layer
                    _that.layers[0].checked = true;
                }
                
            });
        },
        
        selectLayer: function (index, alayer) {
            this.selectedLayer = index;
            
        },
        
        checkboxChanged: function (layer, event) {
            
            var _that = this;
            if (layer.checked){
                
                //set opicity of to 0 of this group
                drawnItems.eachLayer(function(l){
                 if(l.feature.properties.ownerLayer == layer.pk ){
                     //console.log(l);
                     // l.setStyle({opacity: 0.7, fillOpacity: 0.2});
                     _that.showFeature(l);
                 } 
              }); 

            }
            else{
                
                //set opicity of to 0 of this group
                drawnItems.eachLayer(function(l){
                 if(l.feature.properties.ownerLayer == layer.pk ){
                     console.log(l);
                     // l.setStyle({opacity: 0, fillOpacity: 0});
                     _that.hideFeature(l);
                 } 
              });  
            }
        },
        
        showDetail: function (index) {},
        
        addLayer: function (alayer) {
            console.log(alayer);
            var _that = this;
            axios.post('/api/layers/',
                        { 'name': alayer.name, 'building_level': alayer.building_level, 'eventmap': '/api/eventmaps/' + _that.mapPk + '/', 'json_data': "{}" },
                        {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}}
            )
            .then(function (response){
               // console.log(response); 
              _that.layers.push({
                  name: response.data.name,
                  building_level: response.data.building_level,
                  checked: false,
                  features: [],
                  pk: response.data.pk
                });
            
                //_that.getlayerlist();
                _that.clearFormData();
                $('#layerModal').modal('hide');
               
            })
            .catch(function(error){
                console.log(error.response);
               _that.errorFormData(error); 
            });
            
        },
        
        deleteLayer: function () {
            console.log(this.selectedLayer);
            var layerToDelete = this.layers[this.selectedLayer];
            // need to remove features associated with it
            var _that = this;
            axios.delete('/api/layers/' + layerToDelete.pk ,  {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}})
            .then(function (response){
                _that.getlayerlist();   
            });
            
        },
        
        addFeature: function () {
            // the layer is already saved
            // just edit the json field with newly created features
            var layerToEdit = this.layers[this.selectedLayer];
            
            var layer = this.drawnLayer,
            feature = layer.feature = layer.feature || {}; // Intialize layer.feature
            feature.type = feature.type || "Feature"; // Intialize feature.type
            feature.id = new Date().getTime() + Math.random(); // drawnItems.getLayers().length;
            var props = feature.properties = feature.properties || {}; // Intialize feature.properties
            props.name = this.feature.name;
            props.description = this.feature.description;
            props.ownerLayer = layerToEdit.pk;
            props.color = "blue";
            props.type = this.type;
            props.index = layerToEdit.features.length;
            
            if (this.type !== 'marker'){
                layer.setStyle({color: 'blue', weight: 1, opacity: 0.7});
            }
            
            layer.bindPopup("<b>" + props.name + "</b><br/>" + props.description);
            drawnItems.addLayer(layer);
            
            console.log('add Feature');
            
            
            this.json_data = drawnItems.toGeoJSON();
            console.log(this.json_data);
            // Filter only the features of this layer
            function belongsTo(featureVal){
                return featureVal.properties.ownerLayer == layerToEdit.pk;
             }
             this.json_data.features = this.json_data.features.filter(belongsTo);
            
            var _that = this;
            // https://eventmapper-zkkmin.c9users.io/api/layers/12/
            axios.patch('/api/layers/' + layerToEdit.pk + '/', 
                        { json_data: this.json_data }, 
                        {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}} 
            )
            .then(function(response){
                console.log(response);
                
                layerToEdit.features = [];
                response.data.json_data.features.forEach(function(obj){
                    if (obj.properties.ownerLayer == layerToEdit.pk){
                        layerToEdit.features.push(obj);     
                    }
                    
                });
                // _that.layers.push(layerToEdit);
                
            })
            .catch(function(error){
                console.log(error.data)
            });
             
        },
        
        changeColor: function (featureId, layerId, color) {
              console.log(color);
              
              // this.layers[layerIndex].features[featureIndex].properties.color = color;
              
              drawnItems.eachLayer(function(l){
                 if(l.feature.id == featureId && l.feature.properties.ownerLayer == layerId && l.feature.properties.type !== "marker"){
                     console.log(l);
                     l.setStyle({'color': color});
                     l.feature.properties.color = color;
                 } 
              });
              
            this.updateFeatureProperty();
          
        },
        
        
        deleteFeature: function (layerIndex, featureIndex, featureId, layerId) {
            
            console.log(this.layers[layerIndex].features[featureIndex].properties.name);
            
            this.layers[layerIndex].features = this.layers[layerIndex].features.filter(function(item){
               return item.id != featureId && item.properties.ownerLayer == layerId; 
            });
            
            drawnItems.eachLayer(function(l){
                if(l.feature.id == featureId && l.feature.properties.ownerLayer == layerId ){
                    console.log(l);
                    drawnItems.removeLayer(l);
                }
            });
            
            // json data update
            // TODO: duplicated code need to refector
            this.json_data = drawnItems.toGeoJSON();
            console.log(this.json_data);
            // Filter only the features of this layer
            function belongsTo(featureVal){
                return featureVal.properties.ownerLayer ==layerId;
             }
             this.json_data.features = this.json_data.features.filter(belongsTo);
            
            var _that = this;
            // https://eventmapper-zkkmin.c9users.io/api/layers/12/
            axios.patch('/api/layers/' + layerId + '/', 
                        { json_data: this.json_data }, 
                        {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}} 
            )
            .then(function(response){
                console.log(response);
            })
            .catch(function(error){
               console.log(error.data); 
            });
            
            
        },
        
        
    }, // methods
    
})