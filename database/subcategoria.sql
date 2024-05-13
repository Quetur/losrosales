CREATE TABLE subcategoria (
  id_subcategoria int(11) UNSIGNED,
  id_categoria int(11) UNSIGNED,
  des varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE subcategoria
  ADD PRIMARY KEY (id_subcategoria);


