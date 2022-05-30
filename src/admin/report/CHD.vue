<template>
	<v-form header="Cuenta" action="/api/voting/act"> 
		<div class="v-form"> 
			<div class="center" style="border-radius:10px">
				<div style="overflow-y: hidden;
					width2: calc(100vw - 90px);
					height: calc(100vw - 90px);
					border-radius: 50%;">
					<img v-bind:key="img" style="width:100%;" 
						onerror="this.src=window.logo;this.className='error'" 
						v-bind:src="baseURL+'/apishami/api/archivos/imgperfil/'+o.urlPerfil"/>
				</div>
				<div>{{o.names}} {{o.firstSurname}} {{o.lastSurname}}</div>
				<label>Usuario</label>
				<div>{{session.usuario}}</div>
				<div class="right" style="margin-top:10px">
					<v-uploader icon="image" value="" v-bind:click="test2" v-on:input="changeImage($event.tempFile)"/>
				</div>
			</div>
			<v-fieldset legend="Informaci&oacute;n de contacto">
				<div class="right">
					<span v-show="!editContact" class="v-controls">
						<span v-on:click="editContact=1"><i class="fa fa-edit"></i></span>
					</span>
					<span v-show="editContact" class="v-controls">
						<span v-on:click="saveContact" style="margin-right: 20px;"><i class="fa fa-save"></i></span>
						<span v-on:click="editContact=0"><i class="fa fa-times"></i></span>
					</span>
				</div>
				<div class="v-form">
					<label>Nombres:</label>
					<div v-if="!editContact">{{o.names?o.names:'---'}}</div>
					<input v-if="editContact" required="true" v-model="o.names" />
					<label>Apellido Paterno:</label>
					<div v-if="!editContact">{{o.firstSurname?o.firstSurname:'---'}}</div>
					<input v-if="editContact" v-model="o.firstSurname" />
					<label>Apellido Materno:</label>
					<div v-if="!editContact">{{o.lastSurname?o.lastSurname:'---'}}</div>
					<input v-if="editContact" v-model="o.lastSurname" />
					<label>Correo:</label>
					<div v-if="!editContact" required="true" >{{o.email?o.email:'---'}}</div>
					<input v-if="editContact" v-valid="email" v-model="o.mail" required="true"/>
					<label>Sexo:</label>
					<div v-if="!editContact">{{o.sex?(o.sex=='M'?'Masculino':'Femenino'):'---'}}</div>
					<v-radio-group v-if="editContact" v-model="o.sex" >
						<v-radio value="M" label="Masculino"></v-radio >
						<v-radio value="F" label="Femenino"></v-radio >
					</v-radio-group>
					<label>Celular:</label>
					<div v-if="!editContact">{{o.phone?o.phone:'---'}}</div>
					<input v-if="editContact" v-model="o.phone" />
					
				</div>
			</v-fieldset>
			<v-fieldset legend="Cambio de clave">
				<div class="v-form" ref="changePassword">
					<label>Contraseña actual:</label>
					<input type="password" required="required"  v-model="o.pass" />
					<label>Contraseña nueva:</label>
					<input type="password" required="required" v-model="o.newPass" />
					<label>Repetir contraseña nueva:</label>
					<input type="password" required="required"  v-model="o.confirm" />
					<div v-if="o.confirm&&o.confirm!=o.newPass" style="margin-top:15px" class="alert">Contraseña nueva y Repetir deben ser iguales.</div>
					<div class="right" style="margin-top:8px">
						<v-button value="Grabar" icon="fa-save" v-on:click="changePassword" v-bind:disabled="!(o.pass&&o.confirm&&o.confirm==o.newPass)"/>
					</div>
				</div>
				
			</v-fieldset>
		</div>
	</v-form>
</template>
<script>
import {Plugins,CameraResultType } from '@capacitor/core';
var axios=window.axios;

export default window.ui({
	data(){return{email:'email',o:{urlPerfil:null,errorMail:null,ext:{province:null,region:null,district:null,districtName:null}},count:0,tab:0,editContact:0,editAddress:0,img:0}},
	created(){
		window.logo=require('@/fs/profile.svg');
		var me=this;
		axios.get('/api/user/people').then((d) => {
			var o=d.data;console.log(o);
			/*o.ext={
				region:{id:'155-'+o.idDep,name:o.departamento,code:o.idDep},
				province:{id:'155-'+me.pad(o.idProv,4),code:me.pad(o.idProv,4),name:o.provincia},
				district:me.pad(o.idDist,6),
				districtName:o.distrito
			};*/
			//o.urlPerfil='img-perfil-'+o.idPer+'.jpeg';
			me.img++;
			me.o=o;
		});
	},
	methods:{
		changeDistrict(a,b){
			console.log(a+' '+JSON.stringify(b));
			if(b){
				this.o.ext.districtName=b.name;
			}
		},
		testToken(){
			var o={token:this.session[0].token};
			axios.post('http://web.regionancash.gob.pe/apishami/api/token/verificartoken/',o).then(response => {
				console.log(response);
			}).catch((e) => {
				console.log(e);
			});
		},
		changeRegion(){
			var o=this.o.ext.region;
			if(o)o=o.id.split('-')[1];
			this.$refs.provinceSelect.load({regionId:o});
		},
		changeProvince(){
			var me=this,o=me.o.ext.province;
			if(o)o=o.code;
			me.$refs.districtSelect.load({provinceId:o});
			me.o.ext.districtName=null;
			me.o.ext.district=null;
		},
		changeImage(url){
			//var me=this;
			console.log(url);
			/*axios.post('/admin/commerce/api/store/change-image',{image:url,people:me.session.idPer}).then((result) => {
				me.o.urlPerfil=result.data.trim();
				me.img++;
			});*/
		},
		saveContact(){
			var me=this,o=JSON.clone(me.o);
			delete o.ext;
			axios.post('/api/user/people',o).then(() => {
				me.editContact=0;
			})
		},
		saveAddress(){
			var me=this;
			var o=me.o;
			console.log(o);
			o.idDep=o.ext.region.code;
			o.departamento=o.ext.region.name;
			o.idProv=o.ext.province.code;
			o.provincia=o.ext.province.name;
			console.log(o.ext.district);
			o.idDist=o.ext.district;
			o.distrito=o.ext.districtName;
			o=JSON.clone(o);
			delete o.ext;
			console.log(o);
			axios.post('/apishami/api/usuarios/cambiarinfodireccion/',{id:me.session.idUsuario,"svdPersona":o}).then(() => {
				me.editAddress=0; 
			})
		},
		changePassword(){
			var me=this,o=me.o;
			if(o.pass&&o.newPass&&o.confirm==o.newPass){
				if(me.validate(me.$refs.changePassword)){
					console.log(o);
					axios.post('/api/user/change-password',{
							"current":o.pass,
							"new":o.newPass,
							"confirm":o.confirm
						}).then((e) => {
							if(e.data.changed){
								window._.MsgBox('Contraseña actualizada.');
								o.pass='';
								o.newPass='';
								o.confirm='';
							}else
								window._.MsgBox('La contrasña actual ingresada no es la correcta');
						})
				}else window._.MsgBox('Verifique el formulario, aun tiene campos obligatorios sin completar.');
			}
		},
		test2(u){
			var me=this;
			me.count++;
			Plugins.Camera.getPhoto({
				quality: 100,
				resultType: CameraResultType.Uri
			}).then((result) => {
				me.count--;
				if(me.count==0){
					fetch(result.webPath).then(r=>r.blob()).then((b) => {
						u.submitFile(b,'name.'+result.format);
					});
				}
			});
		}
	}
});
</script>
<style scope>
	img.error{
		padding: 30% !important;
		width: 40% !important;
		background-color: transparent;
	}
	.controls a:not(:last-child){
		display:inline-block;
		margin-right:10px;
	}
	.controls{
		position:relative;
	}
	.controls > *:not(:last-child){
		margin-right:10px;
	}
	.view{
		margin:15px 0px;
	}
	.v-form > div{
		line-break: anywhere;
	}
</style>