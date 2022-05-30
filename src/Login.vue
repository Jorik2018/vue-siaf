04.<template>
	<div style="min-height: calc(100% - 40px);
    padding: 20px;">
	<div class="inner" style="max-width:400px;margin:2px auto;padding: 30px 0px;">
		<div>
			<div>
				<form id="LoginForm">
					<div style="padding: .5em 1em;" class="v-form">
					<div class="title center">Inicio de Sesi&oacute;n</div>
					<label for="name">Nombre de Usuario:</label>
					<input class="form-control center" type="text" v-model="o.name" required />
					<label for="pass">Contrase&ntilde;a:</label>
					<input class="form-control center" type="password" v-model="o.pass" minlength="6" required />
					</div>
					<v-button value="Iniciar Sesión" v-on:click.prevent="login" v-bind:disabled="!o.pass||!o.name"></v-button>
					<div class=center style="margin: 30px 0px;">
					<a class="v-primary-dark" style="
					display: inline-block;
					width: auto;
					padding: 5px 40px;
					text-decoration: none;
					border-radius: 10px;
					margin-bottom: 10px;" href="password.html"><i class="fa fa-exclamation-triangle"></i>&iquest;Olvido su Contrase&ntilde;a?</a>
					</div>
				</form>
			</div>
			<div class="subtitle center">
				<a href="https://www.isobit.pe" class="_">www.isobit.pe</a> - Adáptate a los cambios
			</div>
		</div>
		<div style="border-radius: 10px;z-index:-1;top:0px;position: absolute; opacity: 0.85; width: 100%; background-color: white; height: 100%"></div>
	</div>
	</div>
</template>
<script>
	var axios=window.axios;
	var _=window._;
	export default {
		data(){return {o:{}}},
		methods:{
			success(d){
				var me=this;
				if(d.user_nicename){
					d.people={};
					d.user=d.user_nicename;
					localStorage.setItem('session', JSON.stringify(d));
					axios.defaults.headers.common = {'Authorization': `Bearer `+d.token}
					window.app.session=d;
					me.$router.push('/');
				}else if(d.user){
					try{
						if(d.id){
							d.name=d.id;
						}else if(d.uid)d.name=-d.uid;
						d.datetime=new Date().getTime();
						window.app.session=d;
						localStorage.setItem('session', JSON.stringify(d));
						me.$router.push('/');
						//_.go(_.doma+'/index.html?page='+(destiny?destiny:'/'));
					}catch(e){console.log(e)}
				}else{
					_.MsgBox('El usuario o la contrase&ntilde;a no son reconocidas por el servidor.');
				}
			},
			login(){
				var me=this,o=me.o;
				if (this.validate(this.$el)) {
					axios.defaults.headers.common = {}
					axios.post('/api/login/',{username:o.name,password:o.pass})
					.then(response => {
						me.success(response.data);
					}).catch(function(e){
						console.log(e);
					});
				}
			}
		}
	,		
	extends:{
		methods:{validate:function() {
                var me = this;
                var ok = true;
                var input = me.$el.querySelectorAll("input,select,textarea,div[required=required]");
                var radio = {};

                for (i = 0; input.length > i; i++) {
                    var e = input[i];
                    if (e.type === 'radio') {
                        var oo = radio[e.name];
                        if (!oo)
                            radio[e.name] = (oo = []);
                        oo.push(e);
                        continue;
                    }
                    var previousSibling = e.previousSibling;
                    if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                        previousSibling.parentNode.removeChild(previousSibling);
                    }
//                    console.log('id='+e.id);
//                    console.log('disabled='+e.getAttribute('disabled'));
                    
                    if (!(e.disabled||e.getAttribute('disabled')) && (e.required || e.tagName === 'DIV')) {
                        if (e.value == 0 || (e.tagName === 'DIV' && !e.attributes.value)) {
                            previousSibling = e.previousSibling;
                            while (previousSibling && previousSibling.nodeType != 1) {
                                previousSibling = previousSibling.previousSibling;
                            }
                            if (!previousSibling) {
                                previousSibling = e.parentElement.previousSibling;
                                while (previousSibling && previousSibling.nodeType != 1) {
                                    previousSibling = previousSibling.previousSibling;
                                }
                            }
                            var error = document.createElement("div");
                            error.innerHTML = "Este campo es requerido!";
                            ok = false;
                            error.classList.add("v-error");
                            e.parentNode.insertBefore(error, e);
                        }
                    }
                }
                for (var r in radio) {
                    if (Object.prototype.hasOwnProperty.call(radio, r)) {
                        var op = radio[r];
                        var checked = false;
                        var required = false;
                        for (var i = 0; i < op.length; i++) {
                            if (op[i].required && !op[i].disabled)
                                required = true;
                            if (op[i].checked)
                                checked = true;
                        }
                        e = op[0].parentNode.parentNode;
                        previousSibling = e.previousSibling;
                        if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                            previousSibling.parentNode.removeChild(previousSibling);
                        }
                        if (required && !checked) {
                            me.showerror(e);
                            /*previousSibling = e.previousSibling;
                             while(previousSibling&&previousSibling.nodeType != 1) {
                             previousSibling = previousSibling.previousSibling;
                             }
                             if(!previousSibling){
                             previousSibling=e.parentElement.previousSibling;
                             while(previousSibling&&previousSibling.nodeType != 1) {
                             previousSibling = previousSibling.previousSibling;
                             }
                             }
                             var error = document.createElement("div"); 
                             error.innerHTML = "Este campo es requerido!";*/
                            ok = false;
                            //error.classList.add("v-error");
                            //e.parentNode.insertBefore(error, e);
                        }
                    }
                }
                return ok;
            }}
		
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
	@media(max-width:400px){
	.v-primary-dark{
	width: calc(100% - 120px) !important;
	}
	}
	.v-primary-dark i{
	margin-right:10px;
	}
	body{
		padding:20px;
		background-image: linear-gradient(#007bff, #000000);
	}
	html {
		height: 100%;
	}
	body {
		--height: 100%;
		min-height: calc(100% - 40px);
		margin: 0;
		background-repeat: no-repeat;
		background-attachment: fixed;
	}
	input[type='submit'],label,a {
		width: 100%;
	}
	.title {
		padding-bottom: 30px;
		font-size: 40px;
	}
	a{
		display:block;
		text-align: center;
	}
	.v-button {
		width: 100%;
		background: none !important;
		border: none !important;
		background-color: #d82f4b !important;
		border-color: #d82f4b !important;
		padding: 3px;
		color: white;
		font-weight: normal !important;
		padding: .3em 1em;
		margin: 10px 20px;
		width: calc(100% - 40px);
		border-radius: 10px;
	}
	div, li, span, label, .ui-outputlabel, a, ui-link {
		font-family: PTSans !important;
		-font-size: 16px;
	}
	.inner {
	--height: 100%;
	border: 1px solid #ececec;
	border-radius: 10px;
	position: relative;
	background-color: white;
	}
	.x-simple-header {
		padding: 10px 0px;
		background-color: white;
		max-height: 120px !important;
		display: inline-block;
		width: calc(100% - 0px);
		text-align: left;
		position: relative;
		border-radius: 10px 10px 0px 0px;
		border-bottom: 1px solid #d2cccc;
		padding-top: 18px;
		background-color: #0f62ac;
		text-align: center;
	}
	.subtitle {
		padding: 5px;
		padding-top: 10px;
		border-top: 1px solid #d2cccc;
		font-size: 14px;
		color: #d82f4b;
		margin: 0px 20px 12px 20px;
	}
	
</style>