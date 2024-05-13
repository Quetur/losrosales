const controler = {};

controler.list = (req, res) => {
  console.log('producti cotroler');
    req.getConnection((err,conm) => {
      console.log('producti cotroler 2')
        conm.query('SELECT  id_producto,des,precio1,tipoventa FROM producto',(err, producto_view) => {
            if (err) {
                res.json(err);
            }
            console.log('producto_view');
            res.render('producto', {
                data:producto_view
            })
        })
    })

};

controler.guardar = (req, res) => {
    //console.log(req.body);  // dentro de req.body recibimos todos los campos del formulario
    const data = req.body;
    console.log('data');

    // agrega en la base de datos
    req.getConnection((err, connection) => {
        const query = connection.query('INSERT INTO producto set ?', data, (err, producto) => { // insert en la base custmer de sql
         // console.log(producto)
          res.redirect('/'); //redirecciona nuevmente a l aplicacion
        })
    })
}

controler.delete = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, connection) => {
      connection.query('DELETE FROM producto WHERE id = ?', [id], (err, rows) => {
        res.redirect('/');
      });
    });
  }

  
controler.edit = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
      conn.query("SELECT * FROM producto WHERE id = ?", [id], (err, rows) => {
          const newLocal = rows[0];
        res.render('producto_edit', {
          data: newLocal
        })
      });
    });
  };

  controler.update = (req, res) => {
    const { id } = req.params;
    const newProducto = req.body;
    req.getConnection((err, conn) => {
     conn.query('UPDATE producto set ? where id = ?', [newProducto, id], (err, rows) => {
      res.redirect('/');
    });
    });
  };

 
module.exports = controler;
