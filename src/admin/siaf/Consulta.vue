<template>
	<v-form header="Registrar Acta" action="/api/voting/act"> 
		<div class="v-form v-widget-header"> 
			<div>
				<div style="display: inline-block;width: 100px;margin-right: 4px;float: left;">
					<label>Año:</label>
					<v-number v-model="o.year" class="center"/>
				</div>
				<div style="display: inline-block;width: calc(100% - 104px)">
					<label>Expediente:</label>
					<v-number v-model="o.expediente" class="center"/>
				</div>
				<div class="right margin-t">
					<v-button icon="fa-sync" v-on:click="refresh"/>
				</div>
			</div>
		</div> 
		<div class="v-scrollable">
			<label>Tipo Operación</label>
			<div>xxx</div>
			<label>Modalidad de Compra</label>
			<div>xxx</div>
			<label>Tipo Proceso Selección</label>
			<div>xxx</div>
			<v-table ref="t1" v-bind:value="o.header"
				selectable="false"
				scrollable="true"
				style="height:300px;margin-bottom:10px;"
				v-on:row-select="rs=$event.current">
				<template v-slot:columns="">
					<td header="Ciclo" width="60" class="center"></td>
					<td header="Fase" width="60" class="center"></td>
					<td header="Secuencia" width="100" class="center"></td>
					<td header="Num Doc" width="100" class="center"></td>
					<td header="Fecha Doc" width="100" class="center"></td>
					<td header="Moneda" width="80" class="right"></td>
					<td header="Monto" width="120" class="right"></td>
					<td header="Proveedor" width="120" class="center"></td>
					<td header="Notas" width="500"></td>
				</template>
				<template v-slot:default="{row}">
					<td width="60" class="center">{{row.ciclo}}</td>
					<td width="60" class="center">{{row.fase}}</td>
					<td width="100" class="center">{{row.secuencia}}</td>
					<td width="100" class="center">{{row.numDoc}}</td>
					<td width="100" class="center">{{row.fechaDoc|date}}</td>
					<td width="80" class="right">{{row.moneda}}</td>
					<td width="120" class="right">{{row.monto|number}}</td>
					<td width="120" class="center">{{row.ruc}}</td>
					<td width="500">{{row.notas}}</td>
				</template>
				<template v-slot:summary="{data}">
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td class="right">{{data.sum('monto')|number}}</td>
					<td></td>
				</template>
			</v-table>
		</div>
	</v-form>
</template>
<script>
	import axios from 'axios';
	export default window.ui({
		data(){
			return{rs:null,rs2:null,o:{data:[],year: new Date().getFullYear()}};
		},
		computed:{
			selected(){
					return this.$refs.t1?this.$refs.t1.selected:0;
			},
			selectedRows(){
				var me=this,d=me.o.detail,rs=me.rs;
				return rs?d.filter((r) => {
					return r.ciclo==rs.ciclo&&r.fase==rs.fase&&r.secuencia==rs.secuencia;
				}):[];
			}
		},
		mounted(){
			var me=this,o=JSON.parse(localStorage.getItem('expediente'));
			if(o&&Array.isArray(o.header)){
				me.o=o;
			}else{
				localStorage.setItem('expediente',null);
			}
		},
		methods:{
			cadenaFuncional(r){
				return r.programaPpto+'.'+r.actProy+'.'+r.componente
				+'.'+r.funcion+'.'+r.programa+'.'+r.subPrograma;
			},
			refresh(){
				var me=this,o=JSON.clone(me.o);
				axios.post('/api/siaf/8/'+o.year+'/'+o.expediente,{}).then((r)=>{
					o.header=r.data;
					me.o=o;
					me.$refs.t1.kc++;
				});
			}
		}
	})
</script>