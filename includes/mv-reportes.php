<?php


session_start();

if (file_exists('../../../includes/MyDBi.php')) {
    require_once '../../../includes/MyDBi.php';
    require_once '../../../includes/utils.php';
} else {
    require_once 'MyDBi.php';
}


class Reportes extends Main
{
    private static $instance;

    public static function init($decoded)
    {
        self::$instance = new Main(get_class(), $decoded['function']);
        try {
            call_user_func(get_class() . '::' . $decoded['function'], $decoded);
        } catch (Exception $e) {

            $file = 'error.log';
            $current = file_get_contents($file);
            $current .= date('Y-m-d H:i:s') . ": " . $e . "\n";
            file_put_contents($file, $current);

            header('HTTP/1.0 500 Internal Server Error');
            echo $e;
        }
    }

    function getMargenes($desde, $hasta)
    {
        $db = self::$instance->db;


        $SQL = '
    SELECT
    SUM(m.importe) importe,
    m.cuenta_id,
    sum((SELECT
            d1.valor
        FROM
            detallesmovimientos d1
        WHERE
            d1.detalle_tipo_id = 13
                AND d1.movimiento_id = m.movimiento_id)) cantidad,
    (SELECT
            p.nombre
        FROM
            detallesmovimientos d2
                LEFT JOIN
            productos p ON d2.valor = p.producto_id
        WHERE
            d2.detalle_tipo_id = 8
                AND d2.movimiento_id = m.movimiento_id) producto
FROM
    movimientos m
WHERE
    m.movimiento_id IN (SELECT
            d.movimiento_id
        FROM
            detallesmovimientos d
        WHERE
            d.detalle_tipo_id = 8)
        AND m.fecha BETWEEN "' . $desde . '" AND "' . $hasta . '"
        AND m.cuenta_id in ("4.1.1.01","5.1.1.01")
GROUP BY m.cuenta_id, producto
ORDER BY m.asiento_id, m.movimiento_id;
    ';


        $results = $db->rawQuery($SQL);

        echo json_encode($results);
    }


    function getTotalesPorCuenta($desde, $hasta)
    {
        $db = self::$instance->db;


        $SQL = '(select
                c.descripcion,
                sum(m.importe) importe,
                m.cuenta_id
                from movimientos m left join cuentas c on c.cuenta_id = m.cuenta_id
                where
                m.fecha BETWEEN "' . $desde . '" AND "' . $hasta . '"
                and importe <0
                group by c.descripcion, m.cuenta_id)
                union
                (select
                c.descripcion,
                sum(m.importe) importe,
                m.cuenta_id
                from movimientos m left join cuentas c on c.cuenta_id = m.cuenta_id
                where
                m.fecha BETWEEN "' . $desde . '" AND "' . $hasta . '"
                and importe > 0
                group by c.descripcion, m.cuenta_id)';


        $results = $db->rawQuery($SQL, '', false);

        echo json_encode($results);
    }


    function getPlatoMasVendido($params)
    {
        $db = self::$instance->db;

        $filtro_fecha = ($params["fecha_desde"] != "" ? ' AND m.fecha BETWEEN "'. $params["fecha_desde"] .'" AND "'. $params["fecha_hasta"] . '"' : '');


        $SQL = 'SELECT movimiento_id, fecha, cuenta_id, sucursal_id, pos_id, SUM(producto_id) as producto_id, SUM(cantidad) as cantidad,
(select nombre from sucursales where sucursal_id = t2.sucursal_id) sucursal
FROM
(SELECT movimiento_id, fecha, cuenta_id, sucursal_id, pos_id, producto_id, cantidad
FROM (
(SELECT m.movimiento_id, m.fecha, m.cuenta_id, m.sucursal_id,
m.pos_id, d.valor as producto_id, 0 as cantidad
FROM detallesmovimientos d
INNER JOIN movimientos m ON m.movimiento_id = d.movimiento_id
WHERE d.detalle_tipo_id = 8 ' . ($params["sucursal_id"] == -1 ? ' ' : ' AND m.sucursal_id = ' . $params["sucursal_id"] ) . '
AND m.cuenta_id = "4.1.1.01" '. $filtro_fecha .')
UNION
(SELECT m.movimiento_id, m.fecha, m.cuenta_id, m.sucursal_id,
m.pos_id, 0 producto_id, d.valor as cantidad
FROM detallesmovimientos d
INNER JOIN movimientos m ON m.movimiento_id = d.movimiento_id
WHERE d.detalle_tipo_id = 13 ' . ($params["sucursal_id"] == -1 ? ' ' : ' AND m.sucursal_id = ' . $params["sucursal_id"] ) . '
AND m.cuenta_id = "4.1.1.01" '. $filtro_fecha .')) as t1
order by fecha, movimiento_id) as t2
group by 1,2,3,4,5;';


        $results = $db->rawQuery($SQL);

        $productos = array();
        foreach ($results as $row) {
            $SQL = "select nombre from productos where producto_id =  " . $row['producto_id'] . ";";
            $producto = $db->rawQuery($SQL);

            array_push($productos, array(
                'cuenta_id' => $row['cuenta_id'],
                'pos_id' => $row['pos_id'],
                'producto_id' => $row['producto_id'],
                'sucursal_id' => $row['sucursal_id'],
                'sucursal' => $row['sucursal'],
                'cantidad' => $row['cantidad'],
                'producto' => $producto[0]["nombre"]));
        }

        $masVendidos = array();
        $encontrado = false;

        foreach ($productos as $item) {
            if(count($masVendidos) == 0) {
                array_push($masVendidos, array(
                    'cuenta_id' => $item['cuenta_id'],
                    'pos_id' => $item['pos_id'],
                    'producto_id' => $item['producto_id'],
                    'sucursal_id' => $item['sucursal_id'],
                    'sucursal' => $item['sucursal'],
                    'cantidad' => $item['cantidad'],
                    'producto' => $item["producto"]));
            } else {
                for($i = 0; $i <= count($masVendidos) - 1; $i++) {
                    if($masVendidos[$i]['producto_id'] == $item['producto_id']) {
                        $masVendidos[$i]['cantidad'] = $masVendidos[$i]['cantidad'] + $item['cantidad'];
                        $encontrado = true;
                    }
                }
                if(!$encontrado) {
                    array_push($masVendidos, array(
                        'cuenta_id' => $item['cuenta_id'],
                        'pos_id' => $item['pos_id'],
                        'producto_id' => $item['producto_id'],
                        'sucursal_id' => $item['sucursal_id'],
                        'sucursal' => $item['sucursal'],
                        'cantidad' => $item['cantidad'],
                        'producto' => $item["producto"]));
                }
            }
            $encontrado = false;
        }


        echo json_encode($masVendidos);
    }


    function getPromedioDeVentas($params)
    {
        $db = self::$instance->db;

        $filtro_fecha = ($params["fecha_desde"] != "" ? ' AND m.fecha BETWEEN "'. $params["fecha_desde"] .'" AND "'. $params["fecha_hasta"] . '"' : '');


        $SQL = 'SELECT movimiento_id, fecha, cuenta_id, sucursal_id, pos_id, SUM(producto_id) as producto_id, SUM(cantidad) as cantidad,
(select nombre from sucursales where sucursal_id = t2.sucursal_id) sucursal
FROM
(SELECT movimiento_id, fecha, cuenta_id, sucursal_id, pos_id, producto_id, cantidad
FROM (
(SELECT m.movimiento_id, DATE_FORMAT(m.fecha, "%d-%m-%Y") as fecha, m.cuenta_id, m.sucursal_id,
m.pos_id, d.valor as producto_id, 0 as cantidad
FROM detallesmovimientos d
INNER JOIN movimientos m ON m.movimiento_id = d.movimiento_id
WHERE d.detalle_tipo_id = 8 ' . ($params["sucursal_id"] == -1 ? ' ' : ' AND m.sucursal_id = ' . $params["sucursal_id"] ) . '
AND m.cuenta_id = "4.1.1.01" '. $filtro_fecha .')
UNION
(SELECT m.movimiento_id, DATE_FORMAT(m.fecha, "%d-%m-%Y") as fecha, m.cuenta_id, m.sucursal_id,
m.pos_id, 0 producto_id, d.valor as cantidad
FROM detallesmovimientos d
INNER JOIN movimientos m ON m.movimiento_id = d.movimiento_id
WHERE d.detalle_tipo_id = 13 ' . ($params["sucursal_id"] == -1 ? ' ' : ' AND m.sucursal_id = ' . $params["sucursal_id"] ) . '
AND m.cuenta_id = "4.1.1.01" '. $filtro_fecha .')) as t1
order by fecha, movimiento_id) as t2
group by 1,2,3,4,5;';

        $results = $db->rawQuery($SQL);

        $productos = array();
        foreach ($results as $row) {
            $SQL = "select nombre from productos where producto_id =  " . $row['producto_id'] . ";";
            $producto = $db->rawQuery($SQL);

            array_push($productos, array(
                'fecha' => $row['fecha'],
                'cuenta_id' => $row['cuenta_id'],
                'pos_id' => $row['pos_id'],
                'producto_id' => $row['producto_id'],
                'sucursal_id' => $row['sucursal_id'],
                'sucursal' => $row['sucursal'],
                'cantidad' => $row['cantidad'],
                'producto' => $producto[0]["nombre"]));
        }

        $promedioVentas = array();
        $encontrado = false;

        foreach ($productos as $item) {
            if(count($promedioVentas) == 0) {
                array_push($promedioVentas, array(
                    'fecha' => $item['fecha'],
                    'cuenta_id' => $item['cuenta_id'],
                    'pos_id' => $item['pos_id'],
                    'producto_id' => $item['producto_id'],
                    'sucursal_id' => $item['sucursal_id'],
                    'sucursal' => $item['sucursal'],
                    'cantidad' => $item['cantidad'],
                    'producto' => $item["producto"]));
            } else {
                for($i = 0; $i <= count($promedioVentas) - 1; $i++) {
                    if(($promedioVentas[$i]['producto_id'] == $item['producto_id'])
                        && ($promedioVentas[$i]['fecha'] == $item['fecha'])) {
                        $promedioVentas[$i]['cantidad'] = $promedioVentas[$i]['cantidad'] + $item['cantidad'];
                        $encontrado = true;
                    }
                }
                if(!$encontrado) {
                    array_push($promedioVentas, array(
                        'fecha' => $item['fecha'],
                        'cuenta_id' => $item['cuenta_id'],
                        'pos_id' => $item['pos_id'],
                        'producto_id' => $item['producto_id'],
                        'sucursal_id' => $item['sucursal_id'],
                        'sucursal' => $item['sucursal'],
                        'cantidad' => $item['cantidad'],
                        'producto' => $item["producto"]));
                }
            }
            $encontrado = false;
        }


        echo json_encode($promedioVentas);
    }


    function getMargenDeGanancia($params)
    {
        $db = self::$instance->db;

        $filtro = ($params["sucursal_id"] != -1 ? ' where  pe.sucursal_id = '. $params["sucursal_id"] . ' ' : ' ');

        $SQL = 'select pe.pedido_id, p.producto_id, p.nombre, p.descripcion, p.pto_repo, p.producto_tipo_id,
pd.precio_unidad, pr.precio, (pr.precio - pd.precio_unidad) as ganancia, pe.fecha_pedido
from productos p
inner join pedidos_detalles pd on pd.producto_id = p.producto_id
inner join pedidos pe on pe.pedido_id = pd.pedido_id
inner join precios pr on pr.producto_id = p.producto_id ' . $filtro . '
order by p.nombre, pe.fecha_pedido DESC;';

        $results = $db->rawQuery($SQL);

        echo json_encode($results);
    }


    function getReservas($params) {

        $db = self::$instance->db;

        $filtro = ($params["sucursal_id"] != -1 ? ' where  r.sucursal_id = '. $params["sucursal_id"] . ' ' : ' ');

        $SQL = 'SELECT r.reserva_id, s.nombre as sucursal, r.comensales, DATE_FORMAT(r.fecha, "%d-%m-%Y") fecha,
DATE_FORMAT(r.fecha, "%H:%i:%s") hora, r.pagado, c.comanda_id, u.apellido, u.nombre, u.telefono
FROM reservas r
INNER JOIN comandas c ON c.comanda_id = r.comanda_id
INNER JOIN sucursales s ON s.sucursal_id = r.sucursal_id
INNER JOIN usuarios u ON u.usuario_id = c.usuario_id ' . $filtro . '
ORDER BY s.sucursal_id, r.fecha as';

        $results = $db->rawQuery($SQL);

        echo json_encode($results);

    }


    function cierreDeCaja($params)
    {
        $db = self::$instance->db;


//    $SQL01 = 'select
//c.descripcion,
//sum(m.importe) importe,
//m.cuenta_id
//from movimientos m left join cuentas c on c.cuenta_id = m.cuenta_id
//where
//m.asiento_id > (select asiento_inicio_id from cajas where pos_id = ' . $pos_id . ' and sucursal_id = ' . $sucursal_id . ' order by caja_id desc limit 1)
//and sucursal_id = ' . $sucursal_id . ' and pos_id=' . $pos_id . '
//group by c.descripcion, m.cuenta_id;';


        $SQL01 = '(SELECT
    c.descripcion, SUM(m.importe) importe, m.cuenta_id
FROM
    movimientos m
        LEFT JOIN
    cuentas c ON c.cuenta_id = m.cuenta_id
WHERE
    m.asiento_id > (SELECT
            asiento_inicio_id
        FROM
            cajas
        WHERE
            pos_id = ' . $params['pos_id'] . ' AND sucursal_id = ' . $params['sucursal_id'] . '
        ORDER BY caja_id DESC
        LIMIT 1)
        AND sucursal_id = ' . $params['sucursal_id'] . '
        AND pos_id = ' . $params['pos_id'] . '
        AND (c.cuenta_id LIKE "4.%")
GROUP BY c.descripcion , m.cuenta_id)

UNION

(SELECT
"Ahorro" descripcion,
    total + COALESCE((SELECT
            SUM(m.importe)
        FROM
            movimientos m
        WHERE
            m.fecha >= (NOW() between  DATE_FORMAT(NOW() ,"%Y-%m-01") AND NOW() )
                AND sucursal_id = ' . $params['sucursal_id'] . '
                AND m.cuenta_id = "1.1.1.3' . $params['sucursal_id'] . '"
        GROUP BY m.cuenta_id), 0) importe,
        "1.1.1.3' . $params['sucursal_id'] . '" cuenta_id
FROM
    resultados
WHERE
    cuenta_id = "1.1.1.3' . $params['sucursal_id'] . '" AND mes = Month(last_day(date_sub(now(),interval 30 day)))
        AND anio = Year(last_day(date_sub(now(),interval 30 day)))
        )
UNION

(SELECT
    "Caja Chica" Caja, (SUM(m.importe) + (SELECT
            saldo_inicial
        FROM
            cajas
        WHERE
            pos_id = ' . $params['pos_id'] . ' AND sucursal_id = ' . $params['sucursal_id'] . '
        ORDER BY caja_id DESC
        LIMIT 1))  importe, "1.1.1.0' . $params['sucursal_id'] . '" cuenta_id
FROM
    movimientos m
WHERE
    m.asiento_id >= (SELECT
            asiento_inicio_id
        FROM
            cajas
        WHERE
            pos_id = ' . $params['pos_id'] . ' AND sucursal_id = ' . $params['sucursal_id'] . '
        ORDER BY caja_id DESC
        LIMIT 1)
        AND sucursal_id = ' . $params['sucursal_id'] . '
        AND pos_id = ' . $params['pos_id'] . '
        AND m.cuenta_id = "1.1.1.0' . $params['sucursal_id'] . '")';


        $SQL02 = 'select * from cajas c inner join cajas_detalles d on c.caja_id = d.caja_id where c.pos_id = ' . $params['pos_id'] . ' and c.sucursal_id = ' . $params['sucursal_id'] . ' order by c.caja_id desc limit 1;';

        $SQL03 = 'SELECT
    sum((select valor from detallesmovimientos where movimiento_id = m.movimiento_id and detalle_tipo_id = 13)) cantidad,
    m.detalle_tipo_id,
    valor,
    nombre
FROM
    detallesmovimientos m
        LEFT JOIN
    productos ON valor = producto_id
        INNER JOIN
    movimientos mm ON mm.movimiento_id = m.movimiento_id
WHERE
    mm.movimiento_id IN (SELECT
            movimiento_id
        FROM
            movimientos
        WHERE
            cuenta_id like "4.1.1.01" and
            asiento_id >= (SELECT
                    asiento_inicio_id
                FROM
                    cajas
                WHERE
                    sucursal_id = ' . $params['sucursal_id'] . ' and pos_id=' . $params['pos_id'] . '
                ORDER BY caja_id DESC
                LIMIT 1))
        AND detalle_tipo_id = 8
        AND mm.sucursal_id = ' . $params['sucursal_id'] . ' and mm.pos_id=' . $params['pos_id'] . '
group by
detalle_tipo_id, valor, nombre;';

        $SQL04 = 'SELECT
    concat(c.descripcion, \': \', d.valor) descripcion , m.importe importe, m.cuenta_id
FROM
    movimientos m
        INNER JOIN
    detallesmovimientos d ON m.movimiento_id = d.movimiento_id
    INNER JOIN
    cuentas c
    ON m.cuenta_id = c.cuenta_id
WHERE
m.sucursal_id = ' . $params['sucursal_id'] . ' and m.pos_id=' . $params['pos_id'] . ' and
    (m.cuenta_id LIKE "5.2.%" || m.cuenta_id LIKE "5.3.%")
        AND d.detalle_tipo_id = 2
        AND m.asiento_id >= (SELECT
                    asiento_inicio_id
                FROM
                    cajas
                WHERE
                    sucursal_id = ' . $params['sucursal_id'] . ' and pos_id=' . $params['pos_id'] . '
                ORDER BY caja_id DESC
                LIMIT 1);';


        $SQL05 = 'select sum(m.importe) importe, m.cuenta_id, c.descripcion descripcion from
movimientos m
left join cuentas c
on m.cuenta_id = c.cuenta_id
where m.cuenta_id in("1.1.4.01", "1.1.1.22","1.1.1.21","1.1.1.24", "1.1.1.0' . $params['sucursal_id'] . '")
and m.importe > 0 and
m.sucursal_id = ' . $params['sucursal_id'] . ' and m.pos_id=' . $params['pos_id'] . '
        AND m.asiento_id >= (SELECT
                    asiento_inicio_id
                FROM
                    cajas
                WHERE
                    sucursal_id = ' . $params['sucursal_id'] . ' and pos_id=' . $params['pos_id'] . '
                ORDER BY caja_id DESC
                LIMIT 1)
group by cuenta_id;';

        $results01 = $db->rawQuery($SQL01, '', false);
        $results02 = $db->rawQuery($SQL02, '', false);
        $results03 = $db->rawQuery($SQL03, '', false);
        $results04 = $db->rawQuery($SQL04, '', false);
        $results05 = $db->rawQuery($SQL05, '', false);

        $results = array();

        array_push($results, $results01);
        array_push($results, $results02);
        array_push($results, $results03);
        array_push($results, $results04);
        array_push($results, $results05);

        echo json_encode($results);
    }


}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = file_get_contents("php://input");
    $decoded = json_decode($data);
    Reportes::init(json_decode(json_encode($decoded), true));
} else {
    Reportes::init($_GET);
}



