/* global axios */
/* global Vue */
/* global Cookies */
/* global Qs */
/* global $ */

var dashboardApp = new Vue({
    delimiters: ['${', '}'],
    el: '#root',
    
    data: {
        editPk: -1,
        nameHasError: false,
        descHasError: false,
        nameError: '',
        descError: '',
        formMapName: '',
        formMapDescripton: '',
        maps: [], // to hold the eventmaps of current user
    },
    
    mounted() {
        this.getmaplist();
    },
    
    methods: {
        
        getmaplist: function(){
            var _that = this;
            axios.get('/api/eventmaps/mymaps/')
            .then(function (response){
                _that.maps = response.data.results;
            });
        },
        
        
        editMap: function(mapid){
            var _that = this;
            axios.get('/api/eventmaps/' + mapid )
            .then(function (response){
                _that.editPk = response.data.pk;
                _that.formMapName = response.data.name;
                _that.formMapDescripton = response.data.description;
                $('#editMapModal').modal('show');
            });
        },
        
        
        clearFormData: function(){
            this.editPk = -1;
            this.formMapName = '';
            this.formMapDescripton = '';
            this.nameError = "";
            this.nameHasError = false;
            this.descHasError = false;
            this.descError = "";
        },
        
        
        errorFormData: function (error){
            if (error.response.data.name){
                this.nameError = error.response.data.name[0];
                this.nameHasError = true;
            }
            
            if (error.response.data.description){
                this.descHasError = true;
                this.descError = error.response.data.description[0];
            }  
        },
        
        
        updateMap: function(){
          var _that = this;
          axios.patch('/api/eventmaps/' + this.editPk + '/', 
                    {'name': this.formMapName, 'description': this.formMapDescripton},
                    {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}}
                    )
            .then(function(response) {
                console.log(response);
                _that.clearFormData();
                _that.getmaplist();
                $('#editMapModal').modal('hide');
            })
            .catch(function(error) {
                console.log(error);
                _that.errorFormData(error);
            });
          
        },
        
        
        createMap: function(){
            var _that = this;
          
            axios.post('/api/eventmaps/',
                    {'name': this.formMapName, 'description': this.formMapDescripton},
                    {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}}
                    )
            .then(function (response){
                console.log(response);
                _that.clearFormData();
                _that.getmaplist();
                
                $('#createMapModal').modal('hide');
            })
            .catch(function(error){
                //console.log(error.response.data);
                _that.errorFormData(error);
            
            });
        },
        
        
        deleteMap: function(mapid){
            var _that = this;
            axios.delete('/api/eventmaps/' + mapid,  {headers: {"X-CSRFToken": Cookies.get('csrftoken'), 'X-Requested-With': 'XMLHttpRequest'}})
            .then(function (response){
                _that.getmaplist();    
            });
            
        }, // end of deleteMap
        
    }
})