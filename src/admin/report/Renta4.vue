<template>
	<v-form header="Generar Renta 4ta Categoría" > 
		<div class="v-form"> 
			<div>
			<v-uploader domain="http://web.regionancash.gob.pe" v-on:input="upload"/>
			</div>
			<v-fieldset v-if="o.fileName" class="v-form">
				<label>Archivo:</label>
				<div>{{o.fileName}}</div>
				<label>Nombre de Pestaña:</label>
				<select v-model="o.tab">
					<option v-for="(m,i) in o.pages" v-bind:key="'p-'+i" v-bind:value="i">{{m}}</option>
				</select>
				<label>Seleccionar Mes:</label>
				<select v-model="o.month">
					<option v-for="(m,i) in month" v-bind:key="i" v-bind:value="i">{{m}}</option>
				</select>
				<div class="right margin-t">
					<v-button value="Descargar" icon="fa-download" v-on:click="saveAs('/api/siaf/renta5',o)"/>
				</div>
			</v-fieldset>
		</div>
	</v-form>
</template>
<script>
import axios from 'axios';
import Vue from 'vue';
export default window.ui({
	data(){return {o:{pages:[],fileName:null,month:new Date().getMonth(),tab:null},month:['ENERO','FEBRERO','FEBRERO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']};},
	methods:{
		upload(e){
			var me=this,o=me.o;
			o.fileName=e.fileName;
			axios.post('/api/siaf/renta5',e).then(e=>{
				o=Vue.mergeDeep(o,e.data);
				o.tab=0;
				me.o=o;
			});
		}
	}
});
</script>
<style>
	.c-6{
		width:50%;
		display:inline-block;
	}
</style>