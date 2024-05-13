/*const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',  
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username,password, done) => {
  console.log("pso")
  const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  console.log(rows)
  console.log(rows.length)
  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.password)
    if (validPassword) {
      console.log("correcto")
      done(null, user, req.flash('success', 'Los Rosales te da la bienvenida ' + user.username));
    } else {
      console.log("no correcto")
      done(null, false, req.flash('message', 'Contraseña Incorrecta'));
    }
  } else {
    return done(null, false, req.flash('message', 'El Usuario '+[username]+' NO EXISTE !!!!.'));
  }
}));




passport.use('local.signup', new LocalStrategy({
  usernameField: 'username', 
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username,  password, done) => {

  const { fullname } = req.body;
  const { mail } = req.body;
  let newUser = {  
    username,    
    password,
    fullname,
    mail
    
  };

  newUser.password = await helpers.encryptPassword(password);
  // Saving in the Database
  const result = await pool.query('INSERT INTO users SET ? ', newUser);
  newUser.id_users = result.insertId;
  return done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user.id_users);
});

passport.deserializeUser(async (id_users, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id_users]);
  done(null, rows[0]);
});


/*
passport.use('local.producto', new LocalStrategy({
  
  /*usernameField: 'username',  
  passwordField: 'password',
  passReqToCallback: true*/
  /*
}, async (req, done) => {
  console.log('passport');
  const rows = await pool.query('SELECT * FROM producto');
  if (rows.length > 0) {
    const user = rows[0];   
      return done(null, req.flash('success', rows));
    
  } else {
    return done(null, null);
  }
}));
*/
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  console.log(rows)
  console.log(rows.length)
  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.password)
    if (validPassword) {
      hoy = new Date();
      d = new Date();
      console.log("hoy", hoy)
      ayer=(sumarDias(d, -1));
      console.log("d", d)
      console.log("ayer", ayer)
      hora = ("0"+hoy.getHours()).slice(-2) + ':' +("0"+hoy.getMinutes()).slice(-2);
      mdate = 20+ (hoy.getYear()).toString().slice(-2)+(("0"+(hoy.getMonth() + 1)).toString().slice(-2))+("0"+ hoy.getUTCDate()).slice(-2) ;
      mayer = 20+ (ayer.getYear()).toString().slice(-2)+("0"+((ayer.getMonth() + 1)).toString().slice(-2))+("0"+ ayer.getUTCDate()).slice(-2) ;
      done(null, user, req.flash('success', 'Welcome ' + user.username));
      console.log("hola", user.username," ", mdate, "Hora", hora)
      console.log("mdate ", mdate)
      console.log("mes ", (("0"+(hoy.getMonth() + 1)).toString().slice(-2)))
      console.log("dia ", ("0"+ hoy.getUTCDate()).slice(-2))
      //console.log(eeee)
      const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      console.log("codigo de usuario ",user.id)
      busca_ayer= user.id+mayer
      let horarioEntrada = rows[0].horaentrada.substring(0, 5)
      console.log("Horario de entrada = ", horarioEntrada)

      console.log("entro a la hora = ", hora.substring(0,2), " y ",hora.substring(3,5), "minutos")
      console.log("llego = ", Number(hora.substring(0,2))-Number(horarioEntrada.substring(0,2)), " y ",hora.substring(3,5), "minutos")
      let tarde = ""
      let hora_tarde = Number(hora.substring(0,2))-Number(horarioEntrada.substring(0,2))
      console.log("hora tarde -> ",hora_tarde)
      let minutos_tarde = Number(hora.substring(3,5))-Number(horarioEntrada.substring(3,5))
      console.log("minutos tarde -> ",minutos_tarde)
      /*if (hora_tarde>0){
        if (hora_tarde=1){
          tarde = tarde + hora_tarde + ":"}
        else{
          tarde = tarde + hora_tarde + ":"}
        }
      if (hora_tarde>0){
        tarde = tarde + ""
      }
      if (hora_tarde > 0 || minutos_tarde > 10){
        if (hora_tarde > 0){
          tarde = tarde + ""+ minutos_tarde + " tarde"}
        else if (minutos_tarde > 10 && hora_tarde>=0){
            tarde = tarde + ""+ minutos_tarde + "tarde"}
      }
      */
      if (hora_tarde > 0){
          if (hora_tarde > 0 || minutos_tarde > 10)  {tarde = hora_tarde + ":" + minutos_tarde + " tarde"}
      }
      console.log(" tarde -> ", tarde )
      const base_ayer = await pool.query('SELECT * FROM horario WHERE vendedordia = ?', [busca_ayer]);
      entrada_ayer=0;
      salida_ayer=0;
      console.log("base de datos ayer", base_ayer)
      if (base_ayer.length > 0)
      {
        const ayer = base_ayer[0];
        entrada_ayer=ayer.entrada;
        salida_ayer=ayer.salida;
        console.log("entrada_ayer", entrada_ayer)
        console.log("salida_ayer", salida_ayer)
      }
      busca= user.id+mdate
      console.log("busca", busca)
      const entrada = await pool.query('SELECT * FROM horario WHERE vendedordia = ?', [busca]);
      console.log("entrada", entrada)
      //console.log(eeee)
      if (entrada.length == 0)
        {

          linea = "INSERT INTO horario (id,id_vendedor,dia,vendedordia,entrada,salida,obs) "+ "values (NULL " + ", '" + user.id+ "', '" + mdate+ "', '" + busca + "', '" + hora + "', '" + "13:00" +"', '"+ tarde +"')";
        console.log(linea)
        //  console.log(ee)
        const resultadocobro = await pool.query(linea);
        }
    } else {
      done(null, false, req.flash('message', 'Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('message', 'The Username does not exists.'));
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, done) => {

  const { fullname,username,password,direccion,localidad,telefono,mail,valorhora,valorpresentismo,horaentrada,horasalida} = req.body;
  let newUser = {
    fullname,
    username,
    password
  };
  newUser.password = await helpers.encryptPassword(password);
  // Saving in the Database
  linea = "INSERT INTO users SET fullname = '"+fullname+"' , username = '" + username + "' , password = '"+ newUser.password + "', direccion = '"+direccion+"', barrio = '"+localidad+"', telefono = '"+telefono+"', valorhora = '"+valorhora +"', valorpresentismo = '"+ valorpresentismo +"', horaentrada = '08:00', horasalida = '13:00', tarde = 10;" 
  console.log("Linea sql",linea)
  const result = await pool.query(linea);
  newUser.id = result.insertId;
  //res.redirect('/');
  return done(null, newUser.id);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  done(null, rows[0]);
});

/* Función que suma o resta días a una fecha, si el parámetro
   días es negativo restará los días*/
   function sumarDias(fecha, dias){
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
  }
