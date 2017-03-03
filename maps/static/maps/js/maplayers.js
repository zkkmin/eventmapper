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
            level: '',
            checked: true,
            features: [] 
        }, //layer
        layers: [],
        feature: {
          name: 'Untitled Drawing',
          description: '',
          drawnLayer: {}
        }, //feature
        drawnLayer: {}, // {featureid, drawnLayer}
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
                _that.layers = [];
                for (var i=0; i < results.length; i++ ){
                    results[i].checked = false;
                    _that.layers.push(results[i]);
                }
                
            });
        },
        
        selectLayer: function(index, alayer){
            this.selectedLayer = index;
        },
        
        checkboxChanged: function(changedLayer){
            
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
               _that.layers.push({
                   name: response.data.name,
                   level: response.data.building_level,
                   pk: response.data.pk
               });
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
        
        addFeature: function(){},
        
        deleteFeature: function(layerIndex, featureIndex) {},
        
        
    }, // methods
    
})