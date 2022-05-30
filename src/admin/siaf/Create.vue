<template>
	<v-form header="Generar Hoja de Control Contable" action="/api/voting/act"> 
		<div class="v-form v-widget-header">
			<div>
				<div style="display: inline-block;width: 100px;margin-right: 4px;float: left;">
					<label>Año:</label>
					<v-number v-model="o.year" class="center"/>
				</div>
				<div style="display: inline-block;margin-right: 4px;width: calc(150px)">
					<label>Expediente:</label>
					<v-number v-model="o.expediente" class="center"/>
				</div>
				<v-button icon="fa-sync" v-on:click="refresh" style=""/>
			</div>
		</div>
		<div class="v-scrollable">
			<v-table ref="t1" v-bind:value="o.header"
				selectable="false"
				scrollable="true"
				style="height:300px;margin-bottom:10px;"
				v-on:row-select="rs=$event.current;$refs.t2.kc++">
				<template v-slot:columns="">
					<td header="Ciclo" width="60" class="center"></td>
					<td header="Fase" width="60" class="center"></td>
					<td header="Secuencia" width="100" class="center"></td>
					<td header="Num Doc" width="100" class="center"></td>
					<td header="Fecha Doc" width="100" class="center"></td>
					<td header="FF" width="50" class="right"></td>
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
					<td width="50" class="center">{{row.fuenteFinanc}}</td>
					<td width="80" class="right">{{row.moneda}}</td>
					<td width="120" class="right">{{row.monto|number}}</td>
					<td header="Proveedor" width="200" class="center">{{row.ruc}}</td>
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
			<div v-show="rs">
				<v-table ref="t2" scrollable="true" v-bind:value="selectedRows" v-on:row-select="rs2=$event.current" selectable="false">
					<template v-slot:columns="">
						<td header="Ciclo" width="60" class="center"></td>
						<td header="Fase" width="60" class="center"></td>
						<td header="Secuencia" width="100" class="center"></td>
						<td header="Clasificador" width="120" class="center"></td>
						<td header="Especifica" width="300" class="center"></td>
						<td header="Monto" width="120" class="right"></td>
						<td header="Cadena Programática" width="320" class="center"></td>
						<td header="Meta" width="70" class="center"></td>
						<td header="Finalidad" width="500"></td>
					</template>
					<template v-slot:default="{row}">
						<td width="60" class="center">{{row.ciclo}}</td>
						<td width="60" class="center">{{row.fase}}</td>
						<td width="100" class="center">{{row.secuencia}}</td>
						<td width="120" class="center">{{row.clasificador}}</td>
						<td width="300">{{row.especificaDetDescripcion}}</td>
						<td width="120" class="right">{{row.monto|number}}</td>
						<td width="320" class="center">{{cadenaFuncional(row)}}</td>
						<td width="70" class="center">{{row.secFunc}}</td>
						<td width="500">{{row.finalidad}} {{row.finalidadNombre}}</td>
					</template>
				</v-table>
				<div class="right margin-t">
					<v-button value="HCC" icon="fa-download" v-on:click="hcc"/>
				</div>
			</div>
		</div>
		<v-panel ref="dialog" header="Generar HCC" style="display:none">
			<div class="v-form v-panel" v-if="rs3">
				<label>Año:</label>
				<div>{{rs3.anoEje}}</div>
				<label>Mes:</label>
				<div>{{rs3.monthName}}</div>
				<label>Numero HCC:</label>
				<v-number v-bind:disabled="!disabled" v-model="rs3.number"/>
				<v-checkbox v-model="disabled" label="Sobrescribir HCC existente"/>
				<label>Expediente:</label>
				<div>{{rs3.expediente}}</div>
				<label>Monto:</label>
				<div>{{rs3.moneda}} {{rs3.monto|number}}</div>
				<center>
					<v-button icon="fa-download" v-on:click="generate" value="Generar"/>
					<v-button icon="fa-ban" value="Cancelar" v-on:click.prevent="close"/>
				</center>
			</div>
		</v-panel>
	</v-form>
</template>
<script>
	import axios from 'axios';
	import Vue from 'vue';
	var _=window._;
	export default _.ui({
		props:['id'],
		data(){
			return{
				disabled:false,
				month:[
					'ENERO','FEBRERO','MARZO','ABRIL',
					'MAYO','JUNIO','JULIO','AGOSTO',
					'SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'
				],
				rs:null,rs2:null,rs3:{number:null},o:{data:[],year: new Date().getFullYear(),expediente:null}};
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
		mounted(){this.changeRoute();},
		methods:{
			changeRoute(){
				var me=this,o=JSON.parse(localStorage.getItem('expediente'));
				if(o&&Array.isArray(o.header)){
					me.o=o;
				}else{
					localStorage.setItem('expediente',null);
				}
				if(me.id){
					axios.get('/api/siaf/hcc/'+me.id).then(r=>{
						var d=r.data,e=d.ext;
						me.o.year=d.anoEje;
						me.o.expediente=d.expediente;
						var h=e.header;
						for(var i=0;i<h.length;i++){
							if(h[i].fase==d.fase&&1*h[i].secuencia==d.secuencia){
								me.$refs.t1.selected=[i];
								me.rs=h[i];
								break;
							}
						}
						me.o.header=h;
						me.o.detail=e.detail;
						me.$refs.t1.kc++;
						me.$refs.t2.kc++;
					});
				}else{
					me.rs=null;
					me.rs2=null;
					me.rs3={number:null};
					me.o={data:[],header:[],detail:[],year: new Date().getFullYear(),expediente:null};
					me.$refs.t1.kc++;
					me.$refs.t2.kc++;
				}
			},
			cadenaFuncional(r){
				return r.programaPpto+'.'+r.actProy+'.'+r.componente
				+'.'+r.funcion+'.'+r.programa+'.'+r.subPrograma;
			},
			refresh(){
				var me=this,o=JSON.clone(me.o);
				axios.post('/api/siaf/2/'+o.year+'/'+o.expediente,{}).then((r)=>{
					o.header=r.data.header;
					o.detail=r.data.detail;
					me.rs=null;
					me.rs2=null;
					me.rs3={number:null};
					me.o=o;
					me.$refs.t1.selected=[];
					me.$refs.t2.selected=[];
					me.$refs.t1.kc++;
					me.$refs.t2.kc++;
				});
			},
			generate(){
				var me=this;
				axios.post('/api/siaf/hcc',me.rs3).then((r)=>{
					me.rs3.number=r.data.number;
					me.rs3.id=r.data.id;
					me.dd();
				});
			},
			hcc(){
				var me=this,o=Vue.mergeDeep(me.rs,me.rs2);
				if(o.fechaDoc)o.fechaDoc=_.toDate(o.fechaDoc,1);
				console.log(o.fechaDoc);
				o.month=o.fechaDoc.getMonth()+1;
				o.monthName=me.month[o.month-1];
				if(me.rs.monto)o.montoTotal=me.rs.monto;
				o.number=null;
				me.rs3 = {...me.rs3, ...o};
				me.$refs.dialog.$forceUpdate();
				me.disabled=false;
				this.open(this.$refs.dialog);
			},
			dd(){
				var me=this,hcc=[];
				me.$refs.t2.data.forEach((rs2)=>{
					var o=Vue.mergeDeep(me.rs,rs2);
					o.cadenaFuncional=me.cadenaFuncional(o);
					var notas=o.notas;
					if(notas){
						notas=notas.toUpperCase();
						var i1 = notas.indexOf("-") + 1,i2 = notas.indexOf("OREM");
						o.planilla=(i2 > -1 ? notas.substring(i2 + 4).trim() : notas);
						if (i2 > -1) {
							i2 += 4;
							if (i2 > i1) {
								notas=notas.substring(i1, i2);
							}
						}
					}
					if(!notas)notas="<Correlativo no Valido>";
					o.correlativo=me.rs3.number+'-'+notas;
					if(o.fechaDoc)o.fechaDoc=_.toDate(o.fechaDoc,'date-');
					if(o.monto)o.montoTotal=o.monto;
					o.number=me.rs3.number;
					var mes=[
						'ENERO','FEBRERO','MARZO','ABRIL',
						'MAYO','JUNIO','JULIO','AGOSTO',
						'SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'
					];
					if(o.mesProceso>0){
						o.mesProceso=mes[o.mesProceso-1]+' '+o.anoEje;
					}
				
					hcc.push(o);
				});
				
				console.log(hcc);
				me.saveAs('https://web.regionancash.gob.pe/admin/jasper/api/download',{
					template: 'HCC',
					data: JSON.stringify(hcc)
				}, 'report.pdf');
			}
		}
	})
</script>