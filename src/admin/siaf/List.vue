<template>
	<v-form header="Hojas de Control Contable" action="/admin/siaf/hcc"> 
		<v-table v-bind:selectable="true" v-bind:scrollable="true" src="/api/siaf/hcc" 
		rowKey="id" row-style-class="row.physicalAdvance>=100?'blue':(row.physicalAdvance>row.scheduledAdvance?'green':(!row.scheduledAdvance||0>=row.scheduledAdvance?'':'red'))" 
		v-bind:pagination="20" v-bind:filters="filters" v-on:row-select="rowSelectedCount=getRowSelectedCount()"> 
			<template v-slot:header="">
				<v-button icon="fa-plus" v-on:click.prevent="open('/admin/siaf/hcc/create')" class="on" value="Generar"></v-button>
				<v-button v-if="true" icon="fa-eye" v-on:click.prevent="edit" v-bind:disabled="!rowSelectedCount" value="Ver"></v-button>
				<v-button icon="fa-sync" v-on:click.prevent="refresh" title="Refrescar"></v-button> 
			</template> 
			<template v-slot:columns="">
				<td width="80" header="AÑO"></td>
				<td width="100" header="MES"></td>
				<td width="100" header="NUMERO"></td>
				<td width="100" header="EXPEDIENTE"></td>
				<td width="50" header="FASE"></td>
				<td width="100" header="SECUENCIA"></td>
				<td width="100" header="MONTO"></td>
			</template>
			<template v-slot="{row}"> 
				<td class="center">{{row.anoEje}}</td> 
				<td>{{month[row.month-1]}}</td> 
				<td class="center">{{pad(row.number,3)}}</td> 
				<td class="center">{{pad(row.expediente,10)}}</td> 
				<td class="center">{{row.fase}}</td>
				<td class="center">{{pad(row.secuencia,4)}}</td>
				<td class="right">{{row.monto|number}}</td>
			</template> 
			<template v-slot:filters2="">
				<v-filter index="0"> 
				<input v-model="filters.estadoProceso" /> 
				</v-filter>
				<v-filter index="1"> 
				<input v-model="filters.description" /> 
				</v-filter>
				<v-filter index="2"> 
				<input v-model="filters.activity" /> 
				</v-filter>
				<v-filter index="3"> 
				<input v-model="filters.activity" /> 
				</v-filter>
			</template>
		</v-table> 
	</v-form>
</template>
<script>
	var axios=window.axios;
	export default window.ui({
		data(){
			return {month:[
					'ENERO','FEBRERO','MARZO','ABRIL',
					'MAYO','JUNIO','JULIO','AGOSTO',
					'SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'
				]};
		},
		methods: {
			view(){
				var me = this;
				var f = me.$children[0];
				var action = f.action;
				if (!action)
				action = window.location.pathname;
				var t = me.$children[0].$children[0];
				if(window.app.$router)
				window.app.$router.push('/admin/project/project/' + t.data[t.selected[0]][t.$attrs.rowkey]);
				else
				axios.get((action + '/project/' + t.data[t.selected[0]][t.$attrs.rowkey] + '?modal').replace(/([^:]\/)\/+/g, "$1")).then(me.open).catch(me.error);
			},
			manage(nuevo){
				var me = this;
				var f = me.$children[0];
				var action = f.action;
				if (!action)
				action = window.location.pathname;
				var t = me.$children[0].$children[0];
				axios.get((action + '/project/' + (nuevo?0:t.data[t.selected[0]][t.$attrs.rowkey]) + '/manage?modal').replace(/([^:]\/)\/+/g, "$1")).then(me.open).catch(me.error);
			},
			progress() {
				var me = this;
				var f = me.$children[0];
				var action = f.action;
				if (!action)
				action = window.location.pathname;
				var t = me.$children[0].$children[0];
				axios.get((action + '/project/' + (t.data[t.selected[0]][t.$attrs.rowkey]) + '/progress?modal').replace(/([^:]\/)\/+/g, "$1"))
				.then(me.open)
				.catch(me.error);
			}
		}
	})
</script>