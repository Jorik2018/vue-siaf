<template>
	<v-popup ref="menu" style="max-width: 300px;left:0px;z-index: 10000;width:70%;position:absolute;background-color: white;bottom:0px;overflow-y:auto">
		<ul class="tre">
			<li>
				<a href="/"><i class="fa fa-home"></i>Inicio</a>
				<ul style="padding-left: 0px;">
					<li><a href="/admin/siaf/hcc"><i class="fa fa-file"></i>Hojas de Control Contable</a>
						<ul style="margin-left:30px">
							<li><a href="/admin/siaf/hcc/create"><i class="fa fa-plus"></i>Generar</a></li>
						</ul>
					</li>
					<li><a href="/admin/report/renta4"><i class="fa fa-file"></i>Generar Renta 4ta Categoría</a></li>
					<li><a class="_ green" v-on:click.prevent="sync"><i class="fa fa-sync"></i>Sincronizar SIAF</a></li>
					<li><a class="v-primary-dark alert" style="color:red !important" v-if="!online"><i class="fa fa-circle"></i>Equipo Desconectado</a></li>
				</ul>
			</li>
		</ul>
	</v-popup>
</template>
<script>
import axios from 'axios';
export default window.ui({ 
	mounted(){
		this.app.bindLinks(this.$el,this.hide);
	},
	/*update(){
		app.bindLinks(this.$el,this.hide);
	},*/
	computed:{
		app(){return window.app;},
		showMenu(){return this.app.showMenu;}
	},
	methods:{
		toggle(m){
			var me=this,h=document.querySelector('.v-layout-north');
			me.$el.style.top=h.offsetHeight+'px';
			me.$refs.menu.toggle(m)
		},
		sync(){
			axios.get('/api/siaf/sync').then((r)=>{
				console.log(r);
			});
		},
		hide(){
			if(this.$refs.menu)this.$refs.menu.hide();
		},
		opp(path){
			this.app.$router.push('/shami/'+path);
		}
	}
});
</script>
<style scope>

	a{
	display:inline-block;
	}
	.controls a:not(:last-child){
		display:inline-block;
		margin-right:10px;
	}
	.alert{
		padding: 20px;
		background-color: #fff7a8;
		font-size: 20px;
		border: 1px solid #ffca69;
		border-radius: 5px;
		color:black;
	}
	.v-main{
		padding:0px;
		background-color:#FFF;
	}
	.contact svg{
		margin-right: 10px;
		color: orange;
		font-size: 25px;
	}
		.v-ss{

    background-color: #ffecbd;
    border-radius: 35px 35px 0 0;
    float: left;
	}
	li > a.v-primary-dark{
		width: -webkit-fill-available !important;
		margin:0px;
		border-radius: 0px;
		border-width:0px;
	}
	.green {
    background-color: #baffba !important;
}
</style>