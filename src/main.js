document.title = 'Sistema Integrado de Remuneraciones - SIR V1.0';
import Vue from 'vue'
import Router from 'vue-router'
import './cdn/test.js'
import IsobitUI from 'isobit-ui'
import App from './App.vue'
Vue.config.productionTip = false;
Vue.use(Router);
Vue.use(IsobitUI);
Vue.n=function(v){
    v=v?(v==''?null:Number(''+v)):0;
    return v;
}
Vue.component('v-number',{
    props: {
        value: {
            type: Number
        },
        delay:null
    },
    watch:{
        value(v){var me=this;
            me.$el.value=v;
            //me.$emit('input', v);
        }
    },
    data(){return {v:null};},
    template: '<input type="number" v-on:keyup.enter="input" v-model.number="v" v-on:input="input" class="_"/>',
    created(){
        this.v=this.value;
    },
    mounted(){
        console.log('mounted '+this.value);
    },
    updated(){
     
        /*var me=this;
        setTimeout(()=>{
            var v=me.value;
            me.$el.value=v;
            me.$emit('input', v);
        }, 200);*/
    },
    methods:{
		
        input(){
            console.log("input222");
            var me = this,t=me.$el;
            /*me.value=t.value;*/
            var v=me.v,n=Vue.n;
			
            if(v){
                v=n(v);
                if (me.max&&v > n(me.max)) {
                    v = n(me.max);
                }
                if (me.min&&v < n(me.min)) {
                    v = n(me.min);
                }
                var de=t.getAttribute('decimal');
                if(de!==null){
                    v=v.toFixed(1*de);
                }
                //Debe evitarse borrarse el valor por edicion y mostrar un mensaje de error
            }else{
                v=null;
            }
            v = event.target.value;var ti=Vue.calendarTimer;
            if(ti)clearTimeout(ti);
			if(me.delay)
                Vue.calendarTimer = setTimeout(function() {
                    me.$emit('input',v);
                    Vue.calendarTimer=null;
                }, event.keyCode===13?0:me.delay);
            else{
				console.log('vvv='+v+'  medelay='+me.delay);
            
                me.$emit('input',v);
			}
        }
    }
});
const  router  =  new  Router({
	mode: 'history',
	routes: [
		{
			path:  '/',
			component:  r => require.ensure([], () => r(require('./admin/siaf/Create.vue')), 'big-pages')
		},
		{
			path:  '/admin/siaf/hcc',
			component:  r => require.ensure([], () => r(require('./admin/siaf/List.vue')), 'big-pages')
		},
		{
			path:  '/admin/siaf/hcc/create',
			component:  r => require.ensure([], () => r(require('./admin/siaf/Create.vue')), 'big-pages')
		},
		{
			path:  '/admin/siaf/hcc/:id/edit',props: true,
			component:  r => require.ensure([], () => r(require('./admin/siaf/Create.vue')), 'big-pages')
		},
		{
			path:  '/admin/siaf/consulta',
			component:  r => require.ensure([], () => r(require('./admin/siaf/Consulta.vue')), 'big-pages')
		},
		{
			path:  '/admin/report/renta4',
			component:  r => require.ensure([], () => r(require('./admin/report/Renta4.vue')), 'big-pages')
		},

		{
			path:  '/admin/report/chd',
			component:  r => require.ensure([], () => r(require('./admin/report/CHD.vue')), 'big-pages')
		},
		{
			path:  '/admin/profile',
			component:  r => require.ensure([], () => r(require('./admin/Profile.vue')), 'big-pages')
		}
	]
});
new Vue({
	router,
	render: h => h(App),
}).$mount('#app')

