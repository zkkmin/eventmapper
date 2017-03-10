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
        this.getlayerlist(); 
          
      
    },
    
    methods: {
        
        sortFeatures: function(arr){
            arr.sort(function (a, b){
                          return parseInt(a.properties.index) - parseInt(b.properties.index );
                        });  
        },
        
        updateFeatureProperty: function(){
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
        
        onFeatureIndexChange: function(l){
           
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
        
        errorFormData: function(error){
            if(error.response.data.name){
                this.layerNameError = error.response.data.name[0];
                this.layerNameHasError = true;
            }
            
            if(error.response.data.building_level){
                this.layerLvlError = error.response.data.building_level[0];
                this.layerLvlHasError = true;
            }
        },
        
        clearFormData: function() {
            this.layer = {};
            this.layerNameHasError = false;
            this.layerLvlHasError = false;
            this.layerNameError = '';
            this.layerLvlError = '';
        },
        
        getlayerlist: function(){
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
                            if (props.type !== "marker"){
                                temp.setStyle({color: props.color, weight: 1, opacity: 0.7});    
                            }
                            
                            drawnItems.addLayer(temp);
                            
                            temp.setStyle({opacity: 0, fillOpacity: 0});
                            
                        });
                    }
                    
                    results[i].checked = false;
                    
                    _that.layers.push(results[i]);
                    
                }
                
            });
        },
        
        selectLayer: function(index, alayer){
            this.selectedLayer = index;
            
        },
        
        checkboxChanged: function(layer, event){
            
            if (layer.checked){
                //set opicity of to 0 of this group
                drawnItems.eachLayer(function(l){
                 if(l.feature.properties.ownerLayer == layer.pk ){
                     console.log(l);
                     l.setStyle({opacity: 0.7, fillOpacity: 0.2});
                     
                 } 
              }); 

            }
            else{
                //set opicity of to 0 of this group
                drawnItems.eachLayer(function(l){
                 if(l.feature.properties.ownerLayer == layer.pk ){
                     console.log(l);
                     l.setStyle({opacity: 0, fillOpacity: 0});
                     
                 } 
              });  
            }
        },
        
        showDetail: function (index){},
        
        addLayer: function(alayer){
            console.log(alayer);
            var _that = this;
            axios.post('/api/layers/',
                        { 'name': alayer.name, 'building_level': alayer.level, 'eventmap': '/api/eventmaps/' + _that.mapPk + '/', 'json_data': "{}" },
                        {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}}
            )
            .then(function (response){
               // console.log(response); 
            //   _that.layers.push({
            //       name: response.data.name,
            //       level: response.data.building_level,
            //       checked: false,
            //       features: [],
            //       pk: response.data.pk
            //   });
            
                _that.getlayerlist();
                _that.clearFormData();
                $('#layerModal').modal('hide');
               
            })
            .catch(function(error){
                console.log(error.response);
               _that.errorFormData(error); 
            });
            
        },
        
        deleteLayer: function(){
            console.log(this.selectedLayer);
            var layerToDelete = this.layers[this.selectedLayer];
            // need to remove features associated with it
            var _that = this;
            axios.delete('/api/layers/' + layerToDelete.pk ,  {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}})
            .then(function (response){
                _that.getlayerlist();   
            });
            
        },
        
        addFeature: function(){
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
        
        changeColor: function(featureId, layerId, color){
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
        
        
        deleteFeature: function(layerIndex, featureIndex, featureId, layerId) {
            
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