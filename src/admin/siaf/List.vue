<template>
	<v-form header="Hojas de Control Contable" action="/admin/siaf/hcc">
		<v-table v-bind:selectable="true" v-bind:scrollable="true" src="/api/siaf/hcc" rowKey="id"
			row-style-class="row.physicalAdvance>=100?'blue':(row.physicalAdvance>row.scheduledAdvance?'green':(!row.scheduledAdvance||0>=row.scheduledAdvance?'':'red'))"
			v-bind:pagination="20" v-bind:filters="filters" v-on:row-select="rowSelectedCount = getRowSelectedCount()">
			<template v-slot:header="">
				<v-button icon="fa-plus" v-on:click.prevent="open('/admin/siaf/hcc/create')" class="on"
					value="Generar"></v-button>
				<v-button v-if="true" icon="fa-eye" v-on:click.prevent="edit" v-bind:disabled="!rowSelectedCount"
					value="Ver"></v-button>
				<v-button icon="fa-sync" v-on:click.prevent="refresh" title="Refrescar"></v-button>
			</template>
			<template v-slot="{ row }">
				<td class="center" width="80" header="AÑO">
					<v-filter>
						<input v-model="filters.anoEje" />
					</v-filter>
					{{ row.anoEje }}
				</td>
				<td header="MES" width="100"><v-filter>
						<input v-model="filters.month" />
					</v-filter>
					{{ month[row.month - 1] }}</td>
				<td header="NUMERO" width="100" class="center">
					<v-filter>
						<input v-model="filters.number" />
					</v-filter>
					{{ pad(row.number, 3) }}
				</td>
				<td header="EXPEDIENTE" width="100" class="center">
					<v-filter>
						<input v-model="filters.expediente" />
					</v-filter>
					{{ pad(row.expediente, 10) }}
				</td>
				<td header="FASE" width="50" class="center">
					<v-filter>
						<input v-model="filters.fase" />
					</v-filter>
					{{ row.fase }}
				</td>
				<td header="SECUENCIA" width="100" class="center">
					<v-filter>
						<input v-model="filters.secuencia" />
					</v-filter>
					{{ pad(row.secuencia, 4) }}
				</td>
				<td header="MONTO" width="100" class="right">{{ row.monto | number }}</td>
				<td header="NOTAS" width="300">
					<v-filter>
						<input v-model="filters.notas" />
					</v-filter>
					{{ row.notas }}
				</td>
				<td header="CREACION" width="100" class="center">{{ row.creation | date }}</td>
			</template>
		</v-table>
	</v-form>
</template>
<script>
var axios = window.axios;
export default window.ui({
	data() {
		return {
			month: [
				'ENERO', 'FEBRERO', 'MARZO', 'ABRIL',
				'MAYO', 'JUNIO', 'JULIO', 'AGOSTO',
				'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
			]
		};
	},
	methods: {
		view() {
			var me = this;
			var f = me.$children[0];
			var action = f.action;
			if (!action)
				action = window.location.pathname;
			var t = me.$children[0].$children[0];
			if (window.app.$router)
				window.app.$router.push('/admin/project/project/' + t.data[t.selected[0]][t.$attrs.rowkey]);
			else
				axios.get((action + '/project/' + t.data[t.selected[0]][t.$attrs.rowkey] + '?modal').replace(/([^:]\/)\/+/g, "$1")).then(me.open).catch(me.error);
		},
		manage(nuevo) {
			var me = this;
			var f = me.$children[0];
			var action = f.action;
			if (!action)
				action = window.location.pathname;
			var t = me.$children[0].$children[0];
			axios.get((action + '/project/' + (nuevo ? 0 : t.data[t.selected[0]][t.$attrs.rowkey]) + '/manage?modal').replace(/([^:]\/)\/+/g, "$1")).then(me.open).catch(me.error);
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