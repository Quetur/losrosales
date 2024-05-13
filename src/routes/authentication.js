const express = require('express');
const multer = require('multer');
const path = require('path');
const nodemailer = require("nodemailer");

const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');

const dotenv = require('dotenv')
require("dotenv").config();
dotenv.config({path: './env/.env'})

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_host, // Gmail Host
  port: process.env.SMTP_port, // Port
  secure: process.env.SMTP_secure, // this is true as port is 465
  auth: {
    user: process.env.SMTP_user, //sendgrid
    pass: process.env.cSMTP_pass, // Gmail password
  }
});
console.log(transporter);


//console.log("   proccess.env" , process.env) // remove this after you've confirmed it is working
console.log("pepe",  process.env.S3_secretAccessKey) // outputs "THIS_IS_MY_TOKEN"
console.log("pep 2",  process.env.S3_accessKeyId) // outputs "THIS_IS_MY_TOKEN"
const AWS = require('aws-sdk');
AWS.config.region = 'sa-east-1';
//const multerS3 = require ('multer-s3');
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_accessKeyId ,
  secretAccessKey: process.env.S3_secretAccessKey
});

const storage = multer.diskStorage({
  //destination: path.join(__dirname, '../public/img'),
  destination: path.join(__dirname, '../public/img'),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
})




const fs = require('fs');

const router = express.Router();

const pool = require('../database');


const { CostExplorer } = require('aws-sdk');



const Afip = require('@afipsdk/afip.js');
const qr = require('qr-image');

router.get('/detallepedido/:id', async (req, res) => {
  console.log('detalle de venta', req.params.id);
  //console.log("req", req);

  linea = "SELECT * FROM pedidodetalle WHERE id_pedido = " + [req.params.id]
  //console.log("linea",linea)
  //console.log(ee)
  const detallepedido = await pool.query(linea);
  //console.log("detalle peddo: ",detallepedido)
  linea = "SELECT * FROM pedido WHERE id_pedido = " + [req.params.id]
  const pedido = await pool.query(linea)
  console.log("pedido: ", pedido)
  res.render('detallepedidopantalla', { pedido, detallepedido });
});

router.post('/procesarpedidoentrada', async (req, res) => {
  let { id_pedido } = req.body;
  console.log("procesar pedido entrada", id_pedido)
  linea = "UPDATE pedido SET estado=" + "'prepara' " +
    "WHERE id_pedido = " + id_pedido
  console.log("linea :", linea)
  const result = await pool.query(linea);
  console.log("resultado del pedido : ", result)
  console.log("result 0", result.affectedRows);
  if (result.affectedRows == 1) {
    res.render('pedidoOkaprocesar');
  }
})


router.get('/volveratras/:id_pedido', async (req, res) => {
  const { id_pedido } = req.params;
  console.log("procesar pedido entrada", id_pedido)
  linea = "UPDATE pedido SET estado=" + "'llega' " +
    "WHERE id_pedido = " + id_pedido
  console.log("linea :", linea)
  const result = await pool.query(linea);
  console.log("resultado del pedido : ", result)
  console.log("result 0", result.affectedRows);
  if (result.affectedRows == 1) {
    res.render('pedidoOkvolver');
  }
})


router.get('/pantalla_fechas', isLoggedIn, async (req, res) => {
  //sessionStore.close();
  console.log('authentication /pantalla_fechas');
  res.render('fecha_desde_hasta');
})

router.get('/pantalla_fechas_remito', isLoggedIn, async (req, res) => {
  //sessionStore.close();
  console.log('authentication /pantalla_fechas_remito');
  res.render('fecha_desde_hasta_remito');
})

router.get('/pantalla_fechas_cobro', isLoggedIn, async (req, res) => {
  //sessionStore.close();
  console.log('authentication /pantalla_fechas_cobro');
  res.render('fecha_desde_hasta_cobro');
})

router.get('/pantalla_fechas_afip', isLoggedIn, async (req, res) => {
  //sessionStore.close();
  console.log('authentication /pantalla_fechas_afip');
  res.render('fecha_desde_hasta_afip');
})

router.post('/verventas', isLoggedIn, async (req, res) => {
  const { fechadesde, fechahasta } = req.body;

  console.log('ver ventas');
  console.log("fechadesde : ", fechadesde,
    "fecha Hasta : ", fechahasta
  )
  //console.log(eeee)
  const comercio = null;
  // SELECT * STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` where STR_TO_DATE(fecha,'%d/%m/%Y')>"2022-10-01"

  // este
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/05/28'
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/09/02' and  STR_TO_DATE(fecha,'%d/%m/%Y') <= '22/09/02'
  var linea = "SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2, IF(tipo='Reparto', true, false) as Reparto, IF(tipo='Anulado', true, false) as anulado, IF(caja='CuentaCorriente', true, false) as CtaCte, IF(caja='Efectivo', true, false) as efectivo FROM venta where STR_TO_DATE(fecha,'%d/%m/%Y') >= '" + fechadesde + "' and STR_TO_DATE(fecha,'%d/%m/%Y')<= '" + fechahasta + "' order by id_venta desc"



  console.log(linea)
  const ventas = await pool.query(linea);
  //const detalleventas = await pool.query("SELECT * from ventadetalle");
  res.render('verventas', { ventas, fechadesde, fechahasta/*, detalleventas*/ });
});


router.get('/envios', isLoggedIn, async (req, res) => {
  const { fechadesde, fechahasta } = req.body;

  console.log('ver envios');
  console.log("fechadesde : ", fechadesde,
    "fecha Hasta : ", fechahasta
  )
  //console.log(eeee)
  const comercio = null;
  // SELECT * STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` where STR_TO_DATE(fecha,'%d/%m/%Y')>"2022-10-01"

  // este
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/05/28'
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/09/02' and  STR_TO_DATE(fecha,'%d/%m/%Y') <= '22/09/02'
  var linea = "SELECT *, date_format(fecha, '%d-%m-%Y') as fecha2, date_format(fecha_pedido, '%d-%m-%Y') as fecha3, c.nombre as cliente, u.username as username, IF(estado='facturado', true, false) as facturado , IF(estado='enviado', true, false) as enviado, IF(estado='preparacion', true, false) as preparacion, IF(estado='anulado', true, false) as anulado FROM reparto r INNER JOIN cliente c ON c.id = r.id_cliente INNER JOIN users u ON u.id = r.vendedor order by estado desc, fecha3 asc ;"

  //"SELECT * FROM venta where fecha>='" + fechadesde +  "' and fecha<='" + fechahasta + "' order by id_venta desc"
  console.log(linea)
  const ventas = await pool.query(linea);
  //const detalleventas = await pool.query("SELECT * from ventadetalle");
  res.render('envios', { ventas, fechadesde, fechahasta/*, detalleventas*/ });
});


router.post('/verremitos', isLoggedIn, async (req, res) => {
  const { fechadesde, fechahasta } = req.body;

  console.log('ver remitos');
  console.log("fechadesde : ", fechadesde,
    "fecha Hasta : ", fechahasta
  )
  //console.log(eeee)
  const comercio = null;
  // SELECT * STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` where STR_TO_DATE(fecha,'%d/%m/%Y')>"2022-10-01"

  // este
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/05/28'
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/09/02' and  STR_TO_DATE(fecha,'%d/%m/%Y') <= '22/09/02'
  var linea = "SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM remito where STR_TO_DATE(fecha,'%d/%m/%Y') >= '" + fechadesde + "' and STR_TO_DATE(fecha,'%d/%m/%Y')<= '" + fechahasta + "' order by id_remito desc"

  //"SELECT * FROM venta where fecha>='" + fechadesde +  "' and fecha<='" + fechahasta + "' order by id_venta desc"
  console.log(linea)
  const ventas = await pool.query(linea);
  //const detalleventas = await pool.query("SELECT * from ventadetalle");
  res.render('ver_remitos', { ventas/*, detalleventas*/ });
});



router.post('/vercobros', isLoggedIn, async (req, res) => {
  const { fechadesde, fechahasta } = req.body;

  console.log('ver cobros');
  console.log("fechadesde : ", fechadesde,
    "fecha Hasta : ", fechahasta
  )
  //console.log(eeee)
  const comercio = null;
  // SELECT * STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` where STR_TO_DATE(fecha,'%d/%m/%Y')>"2022-10-01"

  // este
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/05/28'
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/09/02' and  STR_TO_DATE(fecha,'%d/%m/%Y') <= '22/09/02'
  var linea = "SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM cobro where STR_TO_DATE(fecha,'%d/%m/%Y') >= '" + fechadesde + "' and STR_TO_DATE(fecha,'%d/%m/%Y')<= '" + fechahasta + "' order by id_cobro desc"

  //"SELECT * FROM venta where fecha>='" + fechadesde +  "' and fecha<='" + fechahasta + "' order by id_venta desc"
  console.log(linea)
  const cobros = await pool.query(linea);
  //const detalleventas = await pool.query("SELECT * from ventadetalle");
  res.render('ver_cobros', { cobros });
});

router.post('/verafip', isLoggedIn, async (req, res) => {
  const { fechadesde, fechahasta } = req.body;

  console.log('ver afip');
  console.log("fechadesde : ", fechadesde,
    "fecha Hasta : ", fechahasta
  )
  //console.log(eeee)
  const comercio = null;
  // SELECT * STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` where STR_TO_DATE(fecha,'%d/%m/%Y')>"2022-10-01"

  // este
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/05/28'
  //SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2 FROM `venta` WHERE STR_TO_DATE(fecha,'%d/%m/%Y') >= '22/09/02' and  STR_TO_DATE(fecha,'%d/%m/%Y') <= '22/09/02'
  var linea = "SELECT *, DATE_FORMAT(a.fecha_comp,'%Y/%m/%d') fecha_afip FROM factura_afip as a INNER JOIN venta v on a.id_pedido = v.id_venta where DATE(a.fecha_comp) >= '" + "20" + fechadesde + "' and DATE(a.fecha_comp)<= '" + "20" + fechahasta + "' order by a.id"

  //"SELECT * FROM venta where fecha>='" + fechadesde +  "' and fecha<='" + fechahasta + "' order by id_venta desc"
  console.log(linea)
  const ventas = await pool.query(linea);
  //const detalleventas = await pool.query("SELECT * from ventadetalle");
  res.render('ver_afip', { ventas/*, detalleventas*/ });
});
/*
router.get('/verventas', isLoggedIn, async (req, res) => {
  console.log('ver ventas');
  const comercio = null;
  const ventas = await pool.query("SELECT * FROM venta order by id_venta desc");
  const detalleventas = await pool.query("SELECT * from ventadetalle");
  res.render('verventas', { ventas, detalleventas });
});
*/
router.get('/detalleventa/:id', async (req, res) => {
  console.log('detalle de venta', req.params.id);
  //console.log("req", req);

  linea = "SELECT * FROM ventadetalle WHERE id_venta = " + [req.params.id]
  console.log("linea", linea)
  //console.log(ee)
  const detalleventa = await pool.query(linea);
  res.render('detalleremitopantalla', { detalleventa });
});



router.get('/imprime_autentication', async (req, res) => {
  const { combo_prov, fecha, condicion, articulos, total, largo, cliente } = req.body;
  console.log("procesar venta");
  console.log("vendedor :", combo_prov,
    "fecha :  ", fecha,
    "total :", total,
    "largo :", largo,
    "condicion:", condicion,
    "cliente : ", cliente)
  console.log('imprime_autentication');
  console.log("req", req);

  const data = await pool.query("SELECT id, id_venta, DATE_FORMAT(fecha,'%y/%m/%d') as fecha, id_producto, des, cant, precio_unit, venta FROM ventadetalle WHERE id_producto = ? order by fecha desc", [req.params.id]);
  console.log("data", data)
  res.render('ticket', { data, req, });
});

router.post('/grabarAfip', async (req, res) => {
  console.log('grabarAfip');
  //console.lof(eeee)
  const { factura } = req.body;

  console.log("factura : ", factura)
  //console.log("req", req);

  const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  let mcuit = "20937641592"
  let ver = 1

  const afip = new Afip({ 'CUIT': mcuit, 'production': true, access_token: 'yUauacGlWlZP8k84L3S6I6A449AOZBhcXPpGyFVTcSgHqInfIdOanzG6F3aO0pO7' });


  const punto_de_venta = 5;

  /**
   * Tipo de factura
   **/
  const tipo_de_factura = 11; // 11 = Factura C

  /**
   * Número de la ultima Factura C
   **/

  let linea = "SELECT * FROM venta WHERE id_venta = " + factura
  console.log("linea :", linea)
  const venta = await pool.query(linea);
  console.log("venta", venta)

  const serverStatus = await afip.ElectronicBilling.getServerStatus();
  console.log('Este es el estado del servidor:');
  console.log(serverStatus);
  const last_voucher = await afip.ElectronicBilling.getLastVoucher(punto_de_venta, tipo_de_factura);

  console.log("factura anterior :", last_voucher)

  let mfecha = venta[0].fecha
  const mhora = venta[0].Hora
  let mcliente = venta[0].cliente
  let mtotal = venta[0].total
  let mnota = venta[0].nota
  let mvendedor = venta[0].vendedor
  let mnumero = "000000000" + (last_voucher + 1)
  let mptoVta = "00000" + punto_de_venta
  mptoVta = mptoVta.slice(-5)
  mnumero = mptoVta + "-" + mnumero.slice(-10)
  console.log("mnumero ", mnumero)

  const concepto = 1; //concepto 1 =productos
  const fecha_servicio_desde = '', fecha_servicio_hasta = '', fecha_vencimiento_pago = '';
  let resultado_factura = "A"
  let facturaNro = last_voucher + 1
  let tipoDocRec = 99
  let nroDocRec = 0
  const data_factura = {
    'CantReg': 1, // Cantidad de facturas a registrar
    'PtoVta': punto_de_venta,
    'CbteTipo': tipo_de_factura,
    'Concepto': concepto,
    'DocTipo': tipoDocRec,
    'DocNro': nroDocRec,
    'CbteDesde': facturaNro,
    'CbteHasta': facturaNro,
    'CbteFch': "20" + mfecha.substr(6, 2) + mfecha.substr(3, 2) + mfecha.substr(0, 2),
    'FchServDesde': fecha_servicio_desde,
    'FchServHasta': fecha_servicio_hasta,
    'FchVtoPago': fecha_vencimiento_pago,
    'ImpTotal': Number(mtotal),
    'ImpTotConc': 0, // Importe neto no gravado
    'ImpNeto': Number(mtotal),
    'ImpOpEx': 0,
    'ImpIVA': 0,
    'ImpTrib': 0, //Importe total de tributos
    'MonId': 'PES', //Tipo de moneda usada en la factura ('PES' = pesos argentinos) 
    'MonCotiz': 1, // Cotización de la moneda usada (1 para pesos argentinos)  
  };
  console.log("datos de la factura", data_factura)
  //console.log(eeee)
  /** 
   * Creamos la Factura 
   **/
  //const resultado_webservice={ 
  //  'CAE':"123456789012345",
  //  'CAEFchVto': "2023-07-99"
  //}

  let mcae = "mcae" // lo pongo cuando estoy probando
  let mcaevto = "mcaevto" //lo pongo cuando estoy probando


  const resultado_webservice = await afip.ElectronicBilling.createVoucher(data_factura);

  /**
   * Mostramos por pantalla los datos de la nueva Factura   
  **/

  console.log({
    'cae': resultado_webservice.CAE, //CAE asignado a la Factura
    'vencimiento': resultado_webservice.CAEFchVto //Fecha de vencimiento del CAE
  });

  mcae = resultado_webservice.CAE
  mcaevto = resultado_webservice.CAEFchVto





  // armado del qr

  var objqr = {
    ver: ver,
    fecha: "20" + mfecha.substr(6, 2) + "-" + mfecha.substr(3, 2) + "-" + mfecha.substr(0, 2),
    cuit: Number(mcuit),
    ptoVta: punto_de_venta,
    tipoCmp: tipo_de_factura,
    nroCmp: facturaNro,
    importe: Number(mtotal),
    moneda: "PES",
    ctz: 1,
    tipoDocRec: tipoDocRec,
    nroDocRec: nroDocRec,
    tipoCodAut: resultado_factura,
    codAut: Number(mcae)
  }

  console.log("json = ", objqr)
  const myJSON = JSON.stringify(objqr);
  console.log("json :", myJSON)
  console.log("codificado :", Buffer.from(myJSON).toString('base64'));
  var qrtxt = "https://serviciosweb.afip.gob.ar/genericos/comprobantes/cae.aspx?p=" + Buffer.from(myJSON).toString('base64')

  console.log("armado de qr :", qrtxt)
  var qr_svg = qr.image(qrtxt, { type: 'png' });
  filenameqr = "./src/public/qr/qr_" + facturaNro + ".png"
  qr_svg.pipe(require('fs').createWriteStream(filenameqr));
  filenameqr = "./qr/qr_" + facturaNro + ".png"
  if (mcliente == "") {
    mcliente = "Consumidor Final"
  }
  linea = "SELECT * FROM ventadetalle WHERE id_venta = " + factura
  console.log("linea :", linea)
  const data = await pool.query(linea);
  console.log("detalle venta", data)
  let marticulos = data.length
  console.log("Cantidad de articulos :", marticulos)
  mfecha = "20" + mfecha.substr(6, 2) + "-" + mfecha.substr(3, 2) + "-" + mfecha.substr(0, 2)
  console.log(mfecha)
  //console.log(eeee)
  // grabo factura afip
  linea = "INSERT INTO `factura_afip` (`id`, `ver`, `id_pedido`, `nroCmp`, `tipoCmp`, `ptoVta`, `fecha_comp`, `hora_comp`, `cuit`, `tipoDocRec`, `nroDocRec`, `importe`, `Cae`, `CaeVto`, `moneda`, `ctz`, `tipoCodAut`, `CodAut`, `codqr`) VALUES (NULL," + ver + ", '" + factura + "', '" + facturaNro + "', '" + tipo_de_factura + "', '" + punto_de_venta + "', '" + mfecha + "', '" + mhora + "', '" + mcuit + "', '" + tipoDocRec + "', '" + nroDocRec + "', '" + mtotal + "', '" + mcae + "', '" + mcaevto + "', 'PES', '1.000000', 'A', '0', '" + qrtxt + "');"
  let resultFactura_afip = await pool.query(linea);
  console.log("grabo factura_afip", resultFactura_afip)
  if (resultFactura_afip.insertId > 0) {
    ////////////////// actualizó bien factura_afip
    res.render('ticket_afip', { venta, data, mfecha, mhora, mcliente, marticulos, mtotal, mnota, mvendedor, mnumero, mcae, mcaevto, filenameqr });
  }
  //console.log(eeee)



});

router.get('/verticket/:id', async (req, res) => {
  const id = req.params.id;
  console.log('verticket', id);
  linea = "SELECT * FROM venta WHERE id_venta = " + id
  console.log("linea :", linea)
  const datos = await pool.query(linea);
  console.log(datos)
  let factura = id
  let combo_prov = datos[0].vendedor
  let tipodeventa = datos[0].tipo
  let fecha = datos[0].fecha
  let hora = datos[0].Hora
  let id_cliente = datos[0].id_cliente
  let cliente = datos[0].cliente
  let tipoventa = datos[0].tipoventa
  let total = datos[0].total
  let condicion = datos[0].caja
  let nota = datos[0].nota
  let cliente_saldo = datos[0].saldoant
  let trans = datos[0].trans
  let efec = datos[0].efec
  let tran = datos[0].tran

  console.log("Caja :", datos[0].caja)


  console.log("factura : ", factura)
  console.log("tipodeventa : ", tipodeventa)
  console.log("fecha :  ", fecha)
  console.log("hora :   ", hora,)
  console.log("total :", total)
  console.log("condicion: ", condicion)
  console.log("trans:", trans)
  console.log("nota:", nota)
  console.log("cliente : ", cliente)



  /* let { combo_prov, factura, fecha, hora, condicion, total, largo, cliente, tipodeventa, cliente_saldo, trans, nota } = req.body;
 
   console.log("vendedor :", combo_prov,
     "factura : ", factura,
     "tipodeventa : ", tipodeventa,
     "fecha :  ", fecha,
     "hora :   ", hora,
     "total :", total,
     "largo :", largo,
     "condicion:", condicion,
     "trans:", trans,
     "nota:", nota,
     "cliente : ", cliente)
 */
  //console.log("req", req);
  //console.log(eeee)
  particular = false;
  if (tipodeventa == "Particular") {
    particular = true;
  }
  console.log("Particular :", particular);

  const compra_nro = factura
  const mfecha = fecha;
  const mhora = hora;
  console.log("id: ", compra_nro)
  linea = "SELECT * FROM ventadetalle WHERE id_venta = " + compra_nro
  console.log("linea :", linea)
  const data = await pool.query(linea);
  console.log("data", data)
  largo = data.length
  imprimeCtaCte = null;
  if (condicion == "CuentaCorriente") {
    imprimeCtaCte = true;
  }

  saldo_actualizado = Number(cliente_saldo) + Number(total);
  let monto_efec =false
  if (efec > 0) {monto_efec=true}
  console.log("monto_efec 522 : ",monto_efec )
  let monto_tran =false
  if (tran > 0) {monto_tran=true}
  console.log("monto_tran : ",monto_tran )
  res.render('ticket', { data, compra_nro, combo_prov, mfecha, mhora, condicion, particular, total, largo, cliente, imprimeCtaCte, cliente_saldo, saldo_actualizado, trans, nota,monto_efec,monto_tran, efec,tran });
});

router.post('/imprimircobro', async (req, res) => {
  const { combo_prov, factura, fecha, hora, condicion, total, largo, cliente, tipodeventa, cliente_saldo, trans, cobro } = req.body;
  console.log('imprimircobro');
  console.log('nro', cobro);
  linea = "SELECT * FROM cobro WHERE id_cobro = " + cobro
  console.log("linea :", linea)
  const mcobro = await pool.query(linea);
  console.log("data", mcobro)
  const nvosaldo = mcobro[0].saldoant - mcobro[0].total
  console.log("nvosaldo", nvosaldo)
  res.render('imp_cobro', { mcobro, nvosaldo });
});

router.post('/verticket_remito', async (req, res) => {
  const { combo_prov, factura, fecha, hora, condicion, total, largo, cliente, tipodeventa, cliente_saldo, trans,efec,tran } = req.body;
  console.log('verticket_remito');
  remito = true;
  console.log("vendedor :", combo_prov,
    "factura : ", factura,
    "tipodeventa : ", tipodeventa,
    "fecha :  ", fecha,
    "hora :   ", hora,
    "total :", total,
    "largo :", largo,
    "condicion:", condicion,
    "trans: ", trans,
    "cliente : ", cliente)

  //console.log("req", req);
  //console.log(eeee)
  particular = false;
  if (tipodeventa == "Particular") {
    particular = true;
  }
  console.log("Particular :", particular);

  const compra_nro = factura
  const mfecha = fecha;
  const mhora = hora;
  console.log("id: ", compra_nro)
  linea = "SELECT * FROM remitodetalle WHERE id_remito = " + compra_nro
  console.log("linea :", linea)
  const data = await pool.query(linea);
  console.log("data", data)
  imprimeCtaCte = null;
  if (condicion == "CuentaCorriente") {
    imprimeCtaCte = true;
  }
  let monto_efec =false
  if (efec > 0) {monto_efec=true}
  console.log("monto_efec 579: ",monto_efec )
  let monto_tran =false
  if (tran > 0) {monto_tran=true}
  console.log("monto_tran : ",monto_tran )
  saldo_actualizado = Number(cliente_saldo) + Number(total);
  res.render('ticket', { data, compra_nro, combo_prov, mfecha, mhora, condicion, particular, total, largo, cliente, imprimeCtaCte, cliente_saldo, saldo_actualizado, remito, trans ,monto_efec,monto_tran, efec,tran});
});

router.post('/verticket_afip', async (req, res) => {
  const { combo_prov, factura, fecha, hora, condicion, total, largo, cliente, tipodeventa, cliente_saldo, trans } = req.body;
  console.log('verticket_afip');
  remito = true;
  console.log("vendedor :", combo_prov,
    "factura : ", factura,
    "tipodeventa : ", tipodeventa,
    "fecha :  ", fecha,
    "hora :   ", hora,
    "total :", total,
    "largo :", largo,
    "condicion:", condicion,
    "trans: ", trans,
    "cliente : ", cliente)

  //console.log("req", req);
  //console.log(eeee)
  particular = false;
  if (tipodeventa == "Particular") {
    particular = true;
  }
  console.log("Particular :", particular);

  const compra_nro = factura
  let mfecha = fecha;
  let mhora = hora;
  console.log("id: ", compra_nro)

  //  console.log(eeee)
  linea = "SELECT * FROM factura_afip WHERE id = " + compra_nro
  console.log("linea :", linea)
  let data = await pool.query(linea);
  console.log("data", data)
  imprimeCtaCte = null;
  console.log("numero venta", data[0].id_pedido)
  filenameqr = "../qr/qr_" + data[0].nroCmp + ".png"
  console.log("numero venta", filenameqr)
  linea = "SELECT * FROM venta WHERE id_venta = " + data[0].id_pedido
  console.log("linea :", linea)
  const venta = await pool.query(linea);
  console.log("venta", venta)

  mfecha = venta[0].fecha
  mhora = data[0].hora_comp
  mcliente = venta[0].cliente
  mtotal = data[0].importe
  mnota = venta[0].nota
  mvendedor = venta[0].vendedor
  mnumero = "000000000" + data[0].nroCmp
  mptoVta = "00000" + data[0].ptoVta
  mptoVta = mptoVta.slice(-5)
  mnumero = mptoVta + "-" + mnumero.slice(-10)
  console.log("mnumero ", mnumero)
  mcae = data[0].Cae
  mcaevto = data[0].CaeVto

  linea = "SELECT * FROM ventadetalle WHERE id_venta = " + data[0].id_pedido
  console.log("linea :", linea)
  data = await pool.query(linea);
  console.log("detalle venta", data)
  marticulos = data.length

  res.render('ticket_afip', { venta, data, mfecha, mhora, mcliente, marticulos, mtotal, mnota, mvendedor, mnumero, mcae, mcaevto, filenameqr });
});


router.get('/productoventa', isLoggedIn, async (req, res) => {
  //sessionStore.close();
  debito = 0.08
  console.log('authentication /productoventa');
  const comercio = null;
  const llegapedido = await pool.query("SELECT * FROM pedido WHERE estado='llega'");
  const preparapedido = await pool.query("SELECT * FROM pedido WHERE estado='prepara'");
  const produ = await pool.query("SELECT id_producto,orden,id_categoria,id_subcategoria,des,precio1,tipoventa,foto2,visible,costo,DATE_FORMAT(fecha,'%d/%m/%y') as fecha,precio2,porcprecio1,porcprecio2,descuentoxunidad,descuentoapartir,stock,(precio1*0.08+precio1) as precio1_debito, (precio2*0.08+precio2) as precio2_debito,  IF(tipoventa = 'kilo' or tipoventa = 'kilo.', 'P', 'U') as pesa, cod_barra FROM producto  WHERE visible=1 ORDER BY id_categoria,id_subcategoria,orden");
  const prov = await pool.query("SELECT * FROM vendedores");
  const cli = await pool.query("SELECT * FROM cliente where categoria=1 order by nombre");
  res.render('productoventa', { produ, prov, comercio, cli, llegapedido, preparapedido });
});

router.get('/productopedido', isLoggedIn, async (req, res) => {
  //sessionStore.close();
  console.log('authentication /productopedido');
  const comercio = null;
  const llegapedido = await pool.query("SELECT * FROM pedido WHERE estado='llega'");
  const preparapedido = await pool.query("SELECT * FROM pedido WHERE estado='prepara'");
  const produ = await pool.query("SELECT id_producto,orden,id_categoria,id_subcategoria,des,precio1,tipoventa,foto2,visible,costo,DATE_FORMAT(fecha,'%d/%m/%y') as fecha,precio2,porcprecio1,porcprecio2,descuentoxunidad,descuentoapartir , cod_barra FROM producto  WHERE visible=1 ORDER BY id_categoria,id_subcategoria,orden");
  const prov = await pool.query("SELECT * FROM vendedores");
  const cli = await pool.query("SELECT * FROM cliente where categoria=1 order by nombre");
  const pedido = await pool.query("SELECT * FROM pedido where id>_pedido =",);
  const pedidodetalle = await pool.query("SELECT * FROM pedidodetalle where id_pedido =",);
  res.render('productoventa', { produ, prov, comercio, cli, llegapedido, preparapedido });
});

router.get('/productoventamayor', isLoggedIn, async (req, res) => {
  console.log('authentication /productoventamayor1');
  const comercio = true;
  //const produ = await pool.query("SELECT id_producto,orden,id_categoria,id_subcategoria,des,precio1,precio2,tipoventa,foto2,visible,costo,DATE_FORMAT(fecha,'%d/%m/%y') as fecha,porcprecio1,porcprecio2,stock FROM producto  WHERE visible=1 ORDER BY id_categoria,id_subcategoria,orden");
  const produ = await pool.query("SELECT des, precio1, precio2,tipoventa, stock, id_producto, DATE_FORMAT(fecha,'%d/%m/%y') as fecha,(precio1*0.08+precio1) as precio1_debito, (precio2*0.08+precio2) as precio2_debito,  IF(tipoventa = 'kilo' or tipoventa = 'kilo.', 'P', 'U') as pesa, cod_barra  FROM producto  WHERE visible=1 ORDER BY id_categoria,id_subcategoria,orden");

  const prov = await pool.query("SELECT * FROM vendedores");
  const cli = await pool.query("SELECT *, IF(tipo = 'cuentacorriente', true, false) as ctacte FROM cliente where categoria=2 order by nombre");
  const llegapedido = await pool.query("SELECT * FROM pedido WHERE estado='llega'");
  const preparapedido = await pool.query("SELECT * FROM pedido WHERE estado='prepara'");
  const reparto = await pool.query("SELECT *, date_format(fecha_pedido, '%d-%m-%Y') as fecha3 FROM reparto WHERE estado='preparacion'");
  res.render('productoventa', { produ, prov, comercio, cli, llegapedido, preparapedido, reparto });
});

router.get('/productoremito', isLoggedIn, async (req, res) => {
  console.log('authentication remito');
  const comercio = null;
  const remito = true;
  //const produ = await pool.query("SELECT id_producto,orden,id_categoria,id_subcategoria,des,precio1,precio2,tipoventa,foto2,visible,costo,DATE_FORMAT(fecha,'%d/%m/%y') as fecha,porcprecio1,porcprecio2 FROM producto  WHERE visible=1 ORDER BY id_categoria,id_subcategoria,orden");
  const produ = await pool.query("SELECT des, precio1, precio2, stock, id_producto, descuentoxunidad, descuentoapartir, DATE_FORMAT(fecha,'%d/%m/%y') as fecha,(precio1*0.08+precio1) as precio1_debito, (precio2*0.08+precio2) as precio2_debito, IF(tipoventa = 'kilo' or tipoventa = 'kilo.', 'P', 'U') as pesa , cod_barra FROM producto  WHERE visible=1 ORDER BY id_categoria,id_subcategoria,orden");
  const prov = await pool.query("SELECT * FROM vendedores");
  const cli = await pool.query("SELECT * FROM cliente where categoria=3 order by nombre");
  const llegapedido = await pool.query("SELECT * FROM pedido WHERE estado='llega'");
  const preparapedido = await pool.query("SELECT * FROM pedido WHERE estado='prepara'");
  const reparto = await pool.query("SELECT *, date_format(fecha_pedido, '%d-%m-%Y') as fecha3 FROM reparto WHERE estado='preparacion'");
  res.render('productoventa', { produ, prov, comercio, remito, cli, llegapedido, preparapedido, reparto });
});

router.get('/hacerpedido/:id', isLoggedIn, async (req, res) => {
  console.log('authentication /hacerpedido', [req.params.id]);
  let lin = "SELECT * FROM pedido where id_pedido=" + [req.params.id]
  const pedido = await pool.query(lin);
  console.log("pedido ", pedido)

  lin = "SELECT * FROM pedidodetalle where id_pedido=" + [req.params.id]
  const pedidodetalle = await pool.query(lin);
  console.log("pedido detalle", pedidodetalle)

  lin = "SELECT * FROM cliente where id=" + pedido[0].id_cliente;
  console.log("linea de consulta cliente  ", lin)
  const cli = await pool.query(lin);
  console.log("cliente ", cli)
  const comercio = false;
  console.log("categoria de cliente", cli[0].categoria)
  if (cli[0].categoria == "2") {
    comercio = true;
  }

  const preparapedido = await pool.query("SELECT * FROM pedido WHERE estado='prepara'");
  const llegapedido = await pool.query("SELECT * FROM pedido WHERE estado='llega'");

  const produ = await pool.query("SELECT id_producto,orden,id_categoria,id_subcategoria,des,precio1,tipoventa,foto2,visible,costo,DATE_FORMAT(fecha,'%d/%m/%y') as fecha,precio2,porcprecio1,porcprecio2,descuentoxunidad,descuentoapartir FROM producto  WHERE visible=1 ORDER BY id_categoria,id_subcategoria,orden");


  res.render('pedido', { produ, cli, pedido, pedidodetalle, comercio, preparapedido, llegapedido });
});

router.get('/pedidos', isLoggedIn, async (req, res) => {
  console.log('authentication /productoventamayor');
  const comercio = null;
  const produ = await pool.query("SELECT id_producto,orden,id_categoria,id_subcategoria,des,precio1,precio2,tipoventa,foto2,visible,costo,DATE_FORMAT(fecha,'%d/%m/%y') as fecha,porcprecio1,porcprecio2, cod_barra FROM producto  WHERE visible=1 ORDER BY id_categoria,id_subcategoria,orden");
  const prov = await pool.query("SELECT * FROM vendedores");
  const cli = await pool.query("SELECT * FROM cliente where categoria=2 order by nombre");
  const llegapedido = await pool.query("SELECT * FROM pedido WHERE estado='llega'");
  const preparapedido = await pool.query("SELECT * FROM pedido WHERE estado='prepara'");
  const pedidodetalle = await pool.query("SELECT * FROM pedidodetalle");
  //console.log("pedido detalle" , pedidodetalle)
  res.render('bandejaentrada', { produ, prov, comercio, cli, llegapedido, preparapedido, pedidodetalle });
});

router.post('/procesar-venta', async (req, res) => {
  console.log("/procesar-venta");
  let { combo_prov, fecha, horalocal, caja, articulos, total, total_lista, largo, cliente, condicion, reparto, pago, vuelto, tipodeventa, prod_compra, nota, id_cliente, guardacliente, trans, id_reparto, efec, tran, debi } = req.body;
  // actualizo reparto
  console.log("id_reparto a actualizar", id_reparto)
  if (id_reparto > 0) {
    console.log("esta actualizando reparto")
    linea = "update reparto set estado='facturado' where id_reparto = " + id_reparto + ";"
    console.log("Linea ", linea)
    const pro = await pool.query(linea)
  }
  /// console.log(eeee)
  if (guardacliente == "SI") {
    console.log("guarda cliente nuevo")
    const { nombre, calle, localidad, telefono, iva, cuit, mail, categoria } = req.body;
    console.log("alta cliente nuevo");
    console.log("Nombre :", nombre,
      "Calle :  ", calle,
      "Localidad : ", localidad,
      "Telefono :", telefono,
      "Iva :", iva,
      "Cuit : ", cuit,
      "Mail :", mail,
      "Categoria :", categoria);
    let linea = "INSERT INTO `cliente` (`id`, `nombre`, `direccion`, `localidad`, `telefono`, `iva`, `cuit`, `correo`, `categoria`, `saldo`, `acum_venta`, `tipo`)" +
      "VALUES (NULL       " + ", '" +
      nombre + "', '" +
      calle + "', '" +
      localidad + "', '" +
      telefono + "', '" +
      iva + "', '" +
      cuit + "', '" +
      mail + "', '" +
      categoria + "', '" + 0 + "', '" + 0 +
      "' , 'efectivo'" + ")";
    console.log(linea);
    const result = await pool.query(linea);
    console.log(result.insertId)
    id_cliente = result.insertId
  }
  cliente_saldo = 0
  cliente_acum_venta = 0
  imprimeCtaCte = null

  console.log("vendedor :", combo_prov,
    "fecha :  ", fecha,
    "hora : ", horalocal,
    "total :", total,
    "largo :", largo,
    "id_cliente :", id_cliente,
    "cliente : ", cliente,
    "pago :", pago,
    "vuelto :", vuelto,
    "tipodeventa:", tipodeventa,
    "reparto:", reparto,
    "Caja de:", caja,
    "Nota :", nota,
    "condicion :", condicion,
    "trans : ", trans)
  // console.log(eeee)
  //console.log("articulos :", articulos);
  console.log("reparto :", reparto)
  if (reparto == "") {
    let reparto = "Mostrador"
  }
  console.log("reparto :", reparto)

  //console.log(ee)
  // busco datos de cliente
  if (condicion == "CuentaCorriente") {
    console.log("entro en cuenta corriente")
    linea = "select * from cliente where id=" + id_cliente
    console.log(linea)
    const result = await pool.query(linea)
    console.log("cliente:-->", result[0].nombre)
    cliente = result[0].nombre;
    cliente_saldo = result[0].saldo;
    cliente_acum_venta = result[0].acum_venta;
  }
  console.log("cliente:->", cliente)
  console.log("saldo:->", cliente_saldo)
  if (cliente_saldo > 0) {
    imprimeCtaCte = true
  }
  const newProducto = req.body;
  console.log("newProducto nuevo", newProducto);

  //console.log(newProducto);
  console.log("cant", newProducto.cant);
  console.log("antes");
  const newCompra = req.body;
  //console.log(ee)
  console.log(newCompra)
  //const mfecha= fecha.substring(8,10)+"-"+fecha.substring(5,7)+"-"+fecha.substring(0,4);
  const mfecha = fecha;
  console.log("mfecha :", mfecha)
  const mhora = horalocal;
  console.log("hora:", mhora);
  // creo registro de venta
  if (tipodeventa == "REMITO") {
    var lineadesql = "INSERT INTO remito "
    var lineadesqldetalle = "INSERT INTO remitodetalle "
  }
  else {
    var lineadesql = "INSERT INTO venta "
    var lineadesqldetalle = "INSERT INTO ventadetalle "
  }
  if (id_cliente == '') {
    id_cliente = '0'
  }
  if (condicion == "Debito") {
    total = total_lista
  }
  lineadesql = lineadesql + "values (NULL,'" + combo_prov + "', '" + caja + "', '" + fecha + "', '" + mhora + "', '" + id_cliente + "', '" + cliente + "', '" + tipodeventa + "', '" + efec + "', '" + tran + "', '" + debi + "', '" + total + "', '" + condicion + "', '" + nota + "', '" + cliente_saldo + "', '" + trans + "')";
  console.log("linea de venta", lineadesql);
  // console.log(eeee) se agrego numero de transferencia 10/05/23
  const result = await pool.query(lineadesql);
  var compra_nro = result.insertId;
  console.log("venta cargada", compra_nro);
  // creo detalle de venta
  lineadesqldetalle = lineadesqldetalle + "values (NULL,'" + compra_nro + "','" + fecha + "', '";
  /// console.log(eee)
  if (largo == 1) {
    console.log("una linea");
    if (condicion == "Debito") {
      linea = lineadesqldetalle + newProducto.cod + "', '" +
        newProducto.desc + "', '" +
        newProducto.cant + "', '" +
        newProducto.costo_debito + "', '" +
        newProducto.subttl_debito + "', '" +
        id_cliente + "')";
    }
    else {
      linea = lineadesqldetalle + newProducto.cod + "', '" +
        newProducto.desc + "', '" +
        newProducto.cant + "', '" +
        newProducto.costo + "', '" +
        newProducto.subttl + "', '" +
        id_cliente + "')";
    }
    console.log("linea de detalle", linea);
    const result = await pool.query(linea);
    // actualizo stock producto
    linea = "select * from producto where id_producto=" + newProducto.cod
    console.log(linea)
    const resultad = await pool.query(linea)
    console.log("producto:-->", resultad[0].des, "  stock = ", resultad[0].stock)
    producto_stockactualizado = resultad[0].stock - newProducto.cant;
    console.log("stock a actualizar : ", producto_stockactualizado)
    if (producto_stockactualizado < 0) {
      producto_stockactualizado = 0
    }
    lineadesqlproducto = "UPDATE producto SET stock='" + producto_stockactualizado +
      "' WHERE id_producto = " + newProducto.cod
    console.log("linea sql de producto", lineadesqlproducto);

    const resultado = await pool.query(lineadesqlproducto);
  }
  else {
    console.log("multiples linea");
    console.log("cant.leght", newProducto.cant.length)
    for (let i = 0; i < newProducto.cant.length; i++) {
      if (condicion == "Debito") {
        linea = lineadesqldetalle + newProducto.cod[i] + "', '" +
          newProducto.desc[i] + "', '" +
          newProducto.cant[i] + "', '" +
          newProducto.costo_debito[i] + "', '" +
          newProducto.subttl_debito[i] + "', '" +
          id_cliente + "')";
      }
      else {
        linea = lineadesqldetalle + newProducto.cod[i] + "', '" +
          newProducto.desc[i] + "', '" +
          newProducto.cant[i] + "', '" +
          newProducto.costo[i] + "', '" +
          newProducto.subttl[i] + "', '" +
          id_cliente + "')";
      }
      console.log("linea de detalle de venta:", linea);
      console.log("codigo :", newProducto.cod[i]);
      console.log("desc :", newProducto.desc[i]);
      console.log("cant :", newProducto.cant[i]);
      console.log("costo :", newProducto.costo[i]);
      console.log("linea :", linea)
      const resultadodetalle = await pool.query(linea);
      console.dir("result: ", resultadodetalle)
      // actualizo stock producto multiples lineas
      linea = "select * from producto where id_producto=" + newProducto.cod[i]
      console.log(linea)
      const resultad = await pool.query(linea)
      console.log("producto:-->", resultad[0].des, "  stock = ", resultad[0].stock)
      producto_stockactualizado = resultad[0].stock - newProducto.cant[i];
      console.log("stock a actualizar : ", producto_stockactualizado)
      if (producto_stockactualizado < 0) {
        producto_stockactualizado = 0
      }
      lineadesqlproducto = "UPDATE producto SET stock='" + producto_stockactualizado +
        "' WHERE id_producto = " + newProducto.cod[i]


      //  lineadesqlproducto = "UPDATE producto SET stock=stock-'" + newProducto.cant[i]+
      //  "' WHERE id_producto = " + newProducto.cod[i]
      console.log("linea sql de producto", lineadesqlproducto);
      const resultado = await pool.query(lineadesqlproducto);
    }

  }
  // actualizamos cuenta corriente
  saldo_actualizado = Number(cliente_saldo) + Number(total);
  console.log("saldo_actualizado : ", saldo_actualizado)
  if (condicion == "CuentaCorriente") {
    console.log("entro en cuenta corriente")
    imprimeCtaCte = true;
    const lineadecuentacorriente = "INSERT INTO cuentacorriente (id,id_comprobante,tipo_comprobante,fecha,hora,id_cliente,cliente,vendedor,debe,haber,nota,saldo) " +
      "values (NULL,'" + compra_nro + "','venta','" + fecha + "','" + mhora + "','" + id_cliente + "','" + cliente + "','" +
      combo_prov + "','" + total + "','" + "0" + "','" + nota + "','" + saldo_actualizado + "')";
    console.log(lineadecuentacorriente);
    const resultadodetalle = await pool.query(lineadecuentacorriente);
    console.dir("result: ", resultadodetalle)
  }
  // actualizo cliente
  //saldo_actualizado = 0
  if (condicion == "CuentaCorriente") {
    //saldo_actualizado = Number(cliente_saldo) + Number(total);
    //console.log("saldo_actualizado : ", saldo_actualizado)
    acum_venta_actualizado = Number(cliente_acum_venta) + Number(total);
    console.log("acum_venta_actualizado : ", acum_venta_actualizado);
    lineadesqlcliente = "UPDATE cliente SET acum_venta='" + acum_venta_actualizado +
      "', saldo='" + saldo_actualizado + "' " +
      "WHERE id = " + id_cliente
    console.log("lineasql", lineadesqlcliente)
    const resultadocliente = await pool.query(lineadesqlcliente);
    console.log("resultado de cliente : ", resultadocliente)
    //console.log(ee)
  }

  // preparo para imprimir ticket
  console.log("compra nro : ", compra_nro)
  remito = false;
  if (tipodeventa == "REMITO") {
    linea = "SELECT * FROM remitodetalle WHERE id_remito = " + compra_nro
    remito = true;
  }
  else {
    linea = "SELECT * FROM ventadetalle WHERE id_venta = " + compra_nro
  }
  console.log("linea :", linea)
  const data = await pool.query(linea);
  console.log("data dos", data)
  //console.log("req",req.body)
  //console.log("articulos ", articulos)
  particular = false;
  if (tipodeventa == "Particular") {
    particular = true;
  }
  console.log("Particular :", particular);
  let monto_efec =false
  if (efec > 0) {monto_efec=true}
  console.log("monto_efec 579: ",monto_efec )
  let monto_tran =false
  if (tran > 0) {monto_tran=true}
  console.log("monto_tran : ",monto_tran )
  res.render('ticket', { combo_prov, mfecha, mhora, total, largo, condicion, reparto, cliente, vuelto, pago, compra_nro, data, tipodeventa, particular, nota, cliente_saldo, imprimeCtaCte, saldo_actualizado, remito, trans ,monto_efec,monto_tran, efec,tran });
});



// SIGNUP
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

// listado de clientes

router.get('/cliente', isLoggedIn, async (req, res) => {
  console.log('listado de cliente');
  const data = await pool.query('SELECT * FROM cliente ORDER BY nombre');
  res.render('cliente', { data });
});

// cliente nuevo
router.get('/clientenuevo', async (req, res) => {
  console.log('cliente nuevo');
  res.render('clientenuevo');
});

// envio nuevo
router.get('/envionuevo', async (req, res) => {
  console.log('envio nuevo');
  //  console.log(eeee)
  const cli = await pool.query("SELECT * FROM cliente where categoria=2 or categoria=3 order by nombre");
  //console.log("clientes ", cli)
  res.render('envionuevo', { cli });
});

// caja nuevo
router.get('/cajanuevo', async (req, res) => {
  console.log('caja nuevo');
  //  console.log(eeee)
  //const cli = await pool.query("SELECT * FROM cliente where categoria=2 or categoria=3 order by nombre");
  //console.log("clientes ", cli)
  let now = new Date();
  console.log('La fecha actual es', now);
  mfecha=fecha_actual()
  console.log('fecha actual', mfecha );
  
  var linea = "SELECT SUM(efec) as total_efec FROM Venta where fecha =" + " '"+ mfecha +"' and tipo = 'Negocio' and tipo<>'Anulado' and caja='Efectivo'"  //and caja='Efectivo'
  //"SELECT *, STR_TO_DATE(fecha,'%d/%m/%Y') as fecha2, IF(tipo='Reparto', true, false) as Reparto, IF(tipo='Anulado', true, false) as anulado, IF(caja='CuentaCorriente', true, false) as CtaCte, IF(caja='Efectivo', true, false) as efectivo FROM venta where STR_TO_DATE(fecha,'%d/%m/%Y') >= '" + mfecha + "' and STR_TO_DATE(fecha,'%d/%m/%Y')<= '" + mfecha + "' order by id_venta desc"
  console.log(linea)
  const ventas = await pool.query(linea);
  //const detalleventas = await pool.query("SELECT * from ventadetalle");
  //res.render('verventas', { ventas, fechadesde, fechahasta });
  console.log("total",ventas)
  res.render('cajanuevo',{ventas});
});

function fecha_actual() {
  fecha = new Date(); //Actualizar fecha.
  dia = fecha.getDate(); //dia actual
  mes = fecha.getMonth() + 1; // mes actual
  año = fecha.getYear() - 100; // año actual
  hora = fecha.getHours(); //hora actual
  minuto = fecha.getMinutes(); //minuto actual
  segundo = fecha.getSeconds(); //segundo actual
  if (hora < 10) { //dos cifras para la hora
    hora = "0" + hora;
  }
  if (dia < 10) { //dos cifras para la hora
    dia = "0" + dia;
  }
  if (mes < 10) { //dos cifras para la hora
    mes = "0" + mes;
  }
  if (minuto < 10) { //dos cifras para el minuto
    minuto = "0" + minuto;
  }
  if (segundo < 10) { //dos cifras para el segundo
    segundo = "0" + segundo;
  }
  mfecha= dia+"/"+mes+"/"+año
  console.log("fecha_actual :", mfecha)
  return mfecha
}
router.post('/envioNuevo', async (req, res) => {
  const { userid, fechahoy, fechapedido, id_cliente, pedido, nota, saldo_cliente, cliente } = req.body;

  console.log("alta envio nuevo");
  console.log("vendedor :", userid,
    "fecha :  ", fechahoy,
    "fechapedido : ", fechapedido,
    "id_cliente :", id_cliente,
    "cliente : ", cliente,
    "saldo :", saldo_cliente,
    "pedido :", pedido,
    "nota : ", nota);

  let estado = "preparacion"
  let tipo = " "
  let tipoventa = " "
  let caja = "reparto"

  let linea = "INSERT INTO `reparto` (`id_reparto`, `estado`, `vendedor`,`tipo`, `fecha`, `fecha_pedido`, `id_cliente`, `nombre`, `saldo`, `tipoventa`, `caja`, `pedido`, `nota`)" + "VALUES (NULL       " + ", '" + estado + "', '" + userid + "', '" + tipo + "', '" + fechahoy + "', '" + fechapedido + "', '" + id_cliente + "', '" + cliente + "', '" + saldo_cliente + "', '" +
    tipoventa + "', '" + caja + "', '" + pedido + "', '" + nota + "')";
  console.log(linea);
  //console.log(eeee)
  const result = await pool.query(linea);

  console.log(result.insertId);

  if (result.insertId > 0) {
    linea = "SELECT *, date_format(fecha, '%d-%m-%Y') as fecha2, date_format(fecha_pedido, '%d-%m-%Y') as fecha3, c.nombre as cliente, u.username as username, IF(estado='facturado', true, false) as facturado , IF(estado='enviado', true, false) as enviado, IF(estado='preparacion', true, false) as preparacion, IF(estado='anulado', true, false) as anulado FROM reparto r INNER JOIN cliente c ON c.id = r.id_cliente INNER JOIN users u ON u.id = r.vendedor order by estado desc, fecha3 asc;"
    const ventas = await pool.query(linea);
    //console.log("reparto :", ventas)
    res.render('envios', { ventas });
  }
});


//ver envio
router.get('/verenvio/:id', async (req, res) => {
  const id = req.params.id;
  console.log('verenvio', id);
  linea = "SELECT *, date_format(fecha, '%d-%m-%Y') as fecha2, date_format(fecha_pedido, '%d-%m-%Y') as fecha3 FROM reparto WHERE id_reparto = " + id
  console.log("linea :", linea)
  const datos = await pool.query(linea);
  console.log(datos)

  let envio = id
  let estado = datos[0].estado
  let vendedor = datos[0].vendedor
  let tipo = datos[0].tipo
  let fecha = datos[0].fecha
  let fecha_pedido = datos[0].fecha_pedido
  let id_cliente = datos[0].id_cliente
  let saldo = datos[0].saldo
  let tipoventa = datos[0].tipoventa
  let caja = datos[0].caja
  let pedido = datos[0].pedido
  let nota = datos[0].nota

  console.log("envio :", envio,
    "estado : ", estado,
    "vendedor :", vendedor,
    "tipo : ", tipo,
    "fecha : ", fecha,
    "fecha_pedido = ", fecha_pedido,
    "id_cliente   = ", id_cliente,
    "saldo = ", saldo,
    "tipoventa = ", tipoventa,
    "caja   = ", caja,
    "pedido = ", pedido,
    "nota = ", nota)

  linea = "SELECT * FROM cliente WHERE id = " + id_cliente
  console.log("linea :", linea)
  const cliente = await pool.query(linea);
  console.log(cliente)
  let cliente_nombre = cliente[0].nombre
  console.log("cliente nombre = ", cliente_nombre)

  res.render('enviover', { datos, cliente_nombre });
});



router.post('/clienteNuevo', async (req, res) => {
  const { nombre, calle, localidad, telefono, iva, cuit, mail, categoria } = req.body;
  console.log("alta cliente nuevo");
  console.log("Nombre :", nombre,
    "Calle :  ", calle,
    "Localidad : ", localidad,
    "Telefono :", telefono,
    "Iva :", iva,
    "Cuit : ", cuit,
    "Mail :", mail,
    "Categoria :", categoria);

  let linea = "INSERT INTO `cliente` (`id`, `nombre`, `direccion`, `localidad`, `telefono`, `iva`, `cuit`, `correo`, `categoria`, `saldo`, `acum_venta`,`tipo`)" +
    "VALUES (NULL       " + ", '" +
    nombre + "', '" +
    calle + "', '" +
    localidad + "', '" +
    telefono + "', '" +
    iva + "', '" +
    cuit + "', '" +
    mail + "', '" +
    categoria + "', '" + 0 + "', '" + 0 + "', 'efectivo')";
  console.log(linea);
  const result = await pool.query(linea);

  console.log(result.insertId);

  if (result.insertId > 0) {
    const data = await pool.query('SELECT * FROM cliente ORDER BY nombre');
    res.render('cliente', { data });
  }
});



router.get('/clientemodi/:id', isLoggedIn, async (req, res) => {
  console.log('modificar cliente');
  const { id } = req.params;
  const cli = await pool.query('SELECT * FROM cliente WHERE id = ?', [req.params.id]);
  console.log(cli)
  res.render('cliente_modi', { cli });
});

router.post('/grabacliente', isLoggedIn, async (req, res) => {
  console.log('graba modificar cliente');
  const { id, nombre, calle, localidad, telefono, iva, tipo, cuit, mail, categoria } = req.body;
  console.log("Id :", id,
    "Nombre :", nombre,
    "Calle :  ", calle,
    "Localidad : ", localidad,
    "Telefono :", telefono,
    "Iva :", iva,
    "Cuit : ", cuit,
    "Mail :", mail,
    "Categoria :", categoria);

  let linea = "update cliente set nombre= '" + nombre +
    "', direccion= '" + calle +
    "', localidad= '" + localidad +
    "', telefono= '" + telefono +
    "', iva= '" + iva +
    "', cuit= '" + cuit +
    "', correo= '" + mail +
    "', categoria= '" + categoria +
    "' WHERE id = " + id;
  console.log(linea);

  const result = await pool.query(linea);

  console.log(result);
  //console.log(ee)
  if (result.affectedRows == 1) {
    const data = await pool.query('SELECT * FROM cliente ORDER BY nombre');
    res.render('cliente', { data });
  }
});

router.get('/cobro', isLoggedIn, async (req, res) => {
  const cli = await pool.query("SELECT * FROM cliente where categoria=2 order by nombre");
  res.render('cobro', { cli });
});

router.post('/procesarcobro', async (req, res) => {
  const { id_cliente, cliente_nombre, saldo, tipo_cobro, monto, saldonuevo, nota, fecha, hora, vendedor, tipo_comp } = req.body;
  console.log("id_cliente: ", id_cliente,
    "  cliente: ", cliente_nombre,
    "  saldo: ", saldo,
    "  tipo: ", tipo_cobro,
    "tipo_comp", tipo_comp,
    "  monto: ", monto,
    "saldonuevo:", saldonuevo,
    "nota:", nota,
    "fecha:", fecha,
    "hora: ", hora,
    "usuario: ", vendedor)

  linea = "INSERT INTO `cobro` (`id_cobro`, `comprobante`, `vendedor`, `tipo`, `fecha`, `hora`, `id_cliente`, `cliente`, `total`, `nota`, `saldoant`)" +
    "VALUES (NULL " + ", '" +
    tipo_comp + "', '" +
    vendedor + "', '" +
    tipo_cobro + "', '" +
    fecha + "', '" +
    hora + "', '" +
    id_cliente + "', '" +
    cliente_nombre + "', '" +
    monto + "', '" +
    nota + "', '" +
    saldo + "')";
  console.log(linea)
  //  console.log(ee)
  const resultadocobro = await pool.query(linea);
  //resultadocobro =1
  console.log("registro de cobro : ", resultadocobro.insertId);
  if (resultadocobro.insertId > 0) {
    ////// se graba cuenta corriente
    console.log("entro en ctacte")
    linea = "INSERT INTO `cuentacorriente` (`id`, `id_comprobante`, `tipo_comprobante`, `fecha`, `hora`, `id_cliente`, `cliente`, `vendedor`, `debe`, `haber`,  `saldo`, `nota`)" +
      "VALUES (NULL " + ", '" +
      resultadocobro.insertId + "', '" +
      tipo_comp + "', '" +
      fecha + "', '" +
      hora + "', '" +
      id_cliente + "', '" +
      cliente_nombre + "', '" +
      vendedor + "', '" +
      '0' + "', '" +
      monto + "', '" +
      saldonuevo + "', '" +
      nota + "')";
    console.log(linea)
    //console.log(ee)
    const resultctacte = await pool.query(linea);
    console.log("cuenta corriente : ", resultctacte.insertId);
    if (resultctacte.insertId > 0) {
      ////////////////// actualizo cliente
      lineadesqlcliente = "UPDATE cliente SET saldo='" +
        saldonuevo + "' " +
        "WHERE id = " + id_cliente
      console.log("lineasql", lineadesqlcliente)

      const resultadocliente = await pool.query(lineadesqlcliente);
      console.log("resultado de cliente : ", resultadocliente)
      res.redirect('/');
    }
  }
});

router.get('/pantalla_horario', isLoggedIn, async (req, res) => {
  //sessionStore.close();
  console.log('authentication /pantalla_fechas');
  res.render('fecha_desde_hasta_horario');
})

router.post('/horario', isLoggedIn, async (req, res) => {
  const { userid, fechad, fechah } = req.body;
  console.log("userid", userid)
  console.log("fecha desde ", fechad)
  console.log("fecha hasta ", fechah)
  console.log("user", userid)
  linea = "SELECT u.fullname usuario, DATE_FORMAT(h.dia,'%d/%m') fecha,dia, h.entrada, h.salida,truncate( TIMESTAMPDIFF(minute,CONCAT(h.dia,' ',h.entrada), CONCAT(h.dia,' ',h.salida))/60,0) AS horas, ((truncate( TIMESTAMPDIFF(minute,CONCAT(h.dia,' ',h.entrada), CONCAT(h.dia,' ',h.salida) )/60,0)*60) - TIMESTAMPDIFF(minute,CONCAT(h.dia,' ',h.entrada), CONCAT(h.dia,' ',h.salida) ) )*(-1) as minutos, ELT( DAYOFWEEK(h.dia), 'Dom','Lun','Mar','Mié','Jue','Vie','Sáb') as diadesemana,obs,  TIME_FORMAT(entrada, '%H:%i') as ent2, TIME_FORMAT(salida, '%H:%i') as sal2 FROM negocio.horario h INNER JOIN users u on u.id = h.id_vendedor where h.id_vendedor=" + userid + " and h.dia>='" + fechad + "' and h.dia<='" + fechah + "' order by h.id_vendedor,h.dia;"
  console.log("linea ", linea)
  const horario = await pool.query(linea)
  linea = 'select * from users where id=' + userid
  console.log("linea ", linea)
  const usuario = await pool.query(linea);
  res.render('horario', { horario, usuario });
});

router.post('/signup', passport.authenticate
  ('local.signup',
    {
      successRedirect: '/profile',
      failureRedirect: '/signup',
      failureFlash: true
    }
  )
);

//
// SINGIN
router.get('/signin', (req, res) => {
  res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {

  req.check('username', 'Username is Required').notEmpty();
  req.check('password', 'Password is Required').notEmpty();
  const errors = req.validationErrors();
  if (errors.length > 0) {
    console.log("llego error")
    req.flash('message', errors[0].msg);
    res.redirect('/signin');
  }
  console.log("llego1")
  passport.authenticate('local.signin', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile',);
});

router.get('/pasaraenviado/:id', async (req, res) => {
  const id = req.params.id;
  console.log("/pasaraenviado/", id)
  // console.log("parametros ", req.params);
  // console.log("query ", req.query);
  //  console.log('ver remito', id);
  linea = "update reparto set estado='enviado' where id_reparto = " + id + ";"
  console.log("Linea ", linea)
  const pro = await pool.query(linea)
  var linea = "SELECT *, date_format(fecha, '%d-%m-%Y') as fecha2, date_format(fecha_pedido, '%d-%m-%Y') as fecha3, c.nombre as cliente, u.username as username, IF(estado='facturado', true, false) as facturado , IF(estado='enviado', true, false) as enviado, IF(estado='preparacion', true, false) as preparacion, IF(estado='anulado', true, false) as anulado FROM reparto r INNER JOIN cliente c ON c.id = r.id_cliente INNER JOIN users u ON u.id = r.vendedor order by estado desc, fecha3 asc;"

  console.log(linea)
  const ventas = await pool.query(linea);
  //const detalleventas = await pool.query("SELECT * from ventadetalle");
  res.render('envios', { ventas });
});

router.get('/pasarafacturado/:id', async (req, res) => {
  const id = req.params.id;
  console.log('/pasarafacturado/', id);
  linea = "update reparto set estado='facturado' where id_reparto = " + id + ";"
  //console.log(eeee)
  console.log("Linea ", linea)
  const pro = await pool.query(linea)
  var linea = "SELECT *, date_format(fecha, '%d-%m-%Y') as fecha2, date_format(fecha_pedido, '%d-%m-%Y') as fecha3, c.nombre as cliente, u.username as username, IF(estado='facturado', true, false) as facturado , IF(estado='enviado', true, false) as enviado, IF(estado='preparacion', true, false) as preparacion, IF(estado='anulado', true, false) as anulado FROM reparto r INNER JOIN cliente c ON c.id = r.id_cliente INNER JOIN users u ON u.id = r.vendedor order by estado desc, fecha3 asc;"

  //"SELECT * FROM venta where fecha>='" + fechadesde +  "' and fecha<='" + fechahasta + "' order by id_venta desc"
  console.log(linea)
  const ventas = await pool.query(linea);
  //const detalleventas = await pool.query("SELECT * from ventadetalle");
  res.render('envios', { ventas, /*fechadesde, fechahasta/*, detalleventas*/ });
});

router.get('/envioeliminar/:id', async (req, res) => {
  const id = req.params.id;
  console.log('/envioeliminar/', id);
  linea = "update reparto set estado='anulado' where id_reparto = " + id + ";"
  console.log("Linea ", linea)
  const pro = await pool.query(linea)
  var linea = "SELECT *, date_format(fecha, '%d-%m-%Y') as fecha2, date_format(fecha_pedido, '%d-%m-%Y') as fecha3, c.nombre as cliente, u.username as username, IF(estado='facturado', true, false) as facturado , IF(estado='enviado', true, false) as enviado, IF(estado='preparacion', true, false) as preparacion, IF(estado='anulado', true, false) as anulado FROM reparto r INNER JOIN cliente c ON c.id = r.id_cliente INNER JOIN users u ON u.id = r.vendedor order by estado desc, fecha3 asc;"

  //"SELECT * FROM venta where fecha>='" + fechadesde +  "' and fecha<='" + fechahasta + "' order by id_venta desc"
  console.log(linea)
  const ventas = await pool.query(linea);
  //const detalleventas = await pool.query("SELECT * from ventadetalle");
  res.render('envios', { ventas, /*fechadesde, fechahasta/*, detalleventas*/ });
});


router.get('/pasaEfec/:id', async (req, res) => {
  const id = req.params.id;
  console.log('pasaEfect');
  linea = "update venta set caja='Efectivo' where id_venta = " + id + ";"
  console.log("Linea ", linea)
  const pro = await pool.query(linea)
  res.render('fecha_desde_hasta');
});

router.get('/pasaTrans/:id', async (req, res) => {
  const id = req.params.id;
  console.log('pasaTrans');
  linea = "update venta set caja='Transferencia' where id_venta = " + id + ";"
  console.log("Linea ", linea)
  const pro = await pool.query(linea)
  res.render('fecha_desde_hasta');
});

router.get('/pasareparto/:id', async (req, res) => {
  const id = req.params.id;
  console.log('pasareparto');
  linea = "update venta set tipo='Reparto' where id_venta = " + id + ";"
  console.log("Linea ", linea)
  const pro = await pool.query(linea)
  res.render('fecha_desde_hasta');
});

router.get('/pasanegocio/:id', async (req, res) => {
  const id = req.params.id;
  console.log('pasanegocio');
  linea = "update venta set tipo='Negocio' where id_venta = " + id + ";"
  console.log("Linea ", linea)
  const pro = await pool.query(linea)
  res.render('fecha_desde_hasta');
});

router.get('/botoneliminar/:id', async (req, res) => {
  const id = req.params.id;
  console.log('botoneliminar', id);
  linea = "update venta set tipo='Anulado' where id_venta = " + id + ";"
  console.log("Linea ", linea)
  const pro = await pool.query(linea)
  res.render('fecha_desde_hasta');
});

module.exports = router;