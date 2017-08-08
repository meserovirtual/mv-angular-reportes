(function () {

    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    if (currentScriptPath.length == 0) {
        currentScriptPath = window.installPath + '/mv-angular-reportes/includes/mv-reportes.php';
    }


    angular.module('mvReportes', [])
        .component('mvReportes', MvReportes())
        .factory('ReportesService', ReportesService);



    function MvReportes() {
        return {
            bindings: {},
            templateUrl: window.installPath + '/mv-angular-reportes/mv-reportes.html',
            controller: mvReportesController
        }
    }

    mvReportesController.$inject = ['$rootScope'];
    function mvReportesController($rootScope) {
        var vm = this;
        vm.reporte = 'stock';

        $rootScope.$on('$routeChangeStart', function (event, next, current) {

            var location = next.$$route.originalPath.split('/');
            vm.reporte = (location[1] == 'reportes') ? location[2] : '';
            console.log(vm.reporte);
        });
    }

    //AcReportesController.$inject = ['$timeout', 'ReportesService'];
    //function AcReportesController($timeout, ReportesService) {
    //    var vm = this;
    //
    //    vm.exportHref = {};
    //    vm.reporte = 'reportes/lstMargenes.html';
    //    vm.hasta = new Date();
    //    vm.desde = new Date();
    //    vm.desde.setDate(vm.desde.getDate() - 30);
    //    vm.datos = [];
    //    vm._datos = [];
    //
    //
    //    vm.values = [];
    //
    //    // Funciones
    //    vm.verReporte = verReporte;
    //    vm.generar = generar;
    //    vm.exportExcel = exportExcel;
    //
    //
    //    function exportExcel(tableId){
    //        vm.exportHref=ReportesService.tableToExcel(tableId,'sheet name');
    //        $timeout(function(){location.href=vm.exportHref;},100); // trigger download
    //    }
    //
    //
    //    function verReporte(reporte) {
    //        vm.datos = [];
    //        vm.reporte = reporte;
    //    }
    //
    //    function generar() {
    //        vm.datos = [];
    //        switch (vm.reporte) {
    //            case 'reportes/lstMargenes.html':
    //                //google.charts.setOnLoadCallback(drawMargenes);
    //                drawMargenes();
    //                break;
    //            case 'reportes/lstTotalesPorCuenta.html':
    //                //google.charts.setOnLoadCallback(drawMargenes);
    //                drawTotalesPorCuenta();
    //                break;
    //        }
    //    }
    //
    //    function drawTotalesPorCuenta() {
    //        ReportesService.getTotalesPorCuenta(vm.desde, vm.hasta, function (data) {
    //            var ordenado = [];
    //            for (var i = 0; i < data.length; i++) {
    //                var index = {};
    //
    //                index = ordenado.find(function (elem, idx, array) {
    //
    //                    if (data[i].cuenta_id == elem.cuenta_id) {
    //                        return elem;
    //                    }
    //                });
    //
    //
    //                if (ordenado.indexOf(index) > -1) {
    //                    if (data[i].importe > 0) {
    //                        ordenado[ordenado.indexOf(index)].haber = data[i].importe;
    //                    } else {
    //                        ordenado[ordenado.indexOf(index)].debe = data[i].importe;
    //                    }
    //                } else {
    //                    if (data[i].importe > 0) {
    //                        ordenado.push({
    //                            descr: data[i].descripcion,
    //                            cuenta_id: data[i].cuenta_id,
    //                            debe: 0,
    //                            haber: data[i].importe,
    //                            total: 0
    //                        });
    //                    } else {
    //                        ordenado.push({
    //                            descr: data[i].descripcion,
    //                            cuenta_id: data[i].cuenta_id,
    //                            debe: data[i].importe,
    //                            haber: 0,
    //                            total: 0
    //                        })
    //                    }
    //                }
    //            }
    //
    //
    //            for (var i = 0; i < ordenado.length; i++) {
    //                ordenado[i].total = parseFloat(ordenado[i].debe) + parseFloat(ordenado[i].haber);
    //            }
    //            vm.datos = ordenado;
    //        });
    //    }
    //
    //
    //    function drawMargenes() {
    //        ReportesService.getMargenes(vm.desde, vm.hasta, function (data) {
    //
    //            var res = {'producto': '', 'cantidad': 0, 'costo': 0, 'vendido': 0, 'margen': 0};
    //            for (var i = 0; i < data.length; i = i + 2) {
    //                res = {'producto': '', 'cantidad': 0, 'costo': 0, 'vendido': 0, 'margen': 0};
    //
    //                res.producto = data[i].producto;
    //                res.cantidad = data[i].cantidad;
    //
    //                if (data[i].cuenta_id == '4.1.1.01') {
    //                    res.vendido = data[i].importe / data[i].cantidad;
    //                } else {
    //                    res.costo = data[i].importe / data[i].cantidad;
    //                }
    //                if (data[i + 1].cuenta_id == '5.1.1.01') {
    //                    res.costo = data[i + 1].importe / data[i].cantidad;
    //                } else {
    //                    res.vendido = data[i + 1].importe / data[i].cantidad;
    //                }
    //
    //                res.margen = res.vendido - res.costo;
    //                vm.datos.push(res);
    //
    //            }
    //
    //
    //            vm.datos.sort(function (a, b) {
    //                // Turn your strings into dates, and then subtract them
    //                // to get a value that is either negative, positive, or zero.
    //                return b.margen - a.margen;
    //            });
    //
    //            var values = [];
    //            for (var i = 0; i < vm.datos.length; i++) {
    //                values.push([vm.datos[i].producto, vm.datos[i].margen]);
    //            }
    //
    //            // Define the chart to be drawn.
    //            var data = new google.visualization.DataTable();
    //            data.addColumn('string', 'Producto');
    //            data.addColumn('number', 'Margen');
    //            data.addRows(values);
    //
    //            // Instantiate and draw the chart.
    //            var chart = new google.charts.Bar(document.getElementById('graphMargenes'));
    //            //var chart = new google.visualization.BarChart(document.getElementById('graphMargenes'));
    //            //var chart = new google.visualization.PieChart(document.getElementById('graphMargenes'));
    //
    //
    //            //angular.element(document).ready(chart.draw(data, null));
    //            //$timeout(chart.draw(data, null), 100);
    //            chart.draw(data, null);
    //
    //
    //        });
    //
    //
    //    }
    //}

    ReportesService.$inject = ['$http', '$window', 'ErrorHandler', '$q'];
    function ReportesService($http, $window, ErrorHandler, $q) {

        var service = {};
        var url = currentScriptPath.replace('mv-reportes.js', '/includes/mv-reportes.php');
        // Generación de excel
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
            base64 = function (s) {
                return $window.btoa(unescape(encodeURIComponent(s)));
            },
            format = function (s, c) {
                return s.replace(/{(\w+)}/g, function (m, p) {
                    return c[p];
                })
            };


        service.getMargenes = getMargenes;
        service.getTotalesPorCuenta = getTotalesPorCuenta;
        service.cierreDeCaja = cierreDeCaja;
        service.tableToExcel = tableToExcel;
        service.getResumenStock = getResumenStock;
        service.getPlatoMasVendido = getPlatoMasVendido;


        return service;

        function getResumenStock() {

        }

        function cierreDeCaja(sucursal_id, pos_id) {
            return $http.get(url + '?function=cierreDeCaja&sucursal_id=' + sucursal_id + '&pos_id=' + pos_id)
                .then(function (data) {
                    return data;
                })
                .catch(function (data) {
                    ErrorHandler(data);
                });
        }

        function getMargenes(desde, hasta) {
            var _desde = desde.getFullYear() + '-' + (desde.getMonth() + 1) + '-' + desde.getDate();
            var _hasta = hasta.getFullYear() + '-' + (hasta.getMonth() + 1) + '-' + hasta.getDate();

            return $http.get(url + '?function=getMargenes&desde=' + _desde + '&hasta=' + _hasta)
                .then(function (data) {
                    return data;
                })
                .catch(function (data) {
                    ErrorHandler(data);
                });
        }

        function getTotalesPorCuenta(desde, hasta) {
            var _desde = desde.getFullYear() + '-' + (desde.getMonth() + 1) + '-' + desde.getDate();
            var _hasta = hasta.getFullYear() + '-' + (hasta.getMonth() + 1) + '-' + hasta.getDate();

            return $http.get(url + '?function=getTotalesPorCuenta&desde=' + _desde + '&hasta=' + _hasta)
                .then(function (data) {
                    return data;
                })
                .catch(function (data) {
                    ErrorHandler(data);
                });
        }


        function tableToExcel(tableId, worksheetName) {
            var table = document.getElementById(tableId),
                ctx = {worksheet: worksheetName, table: table.innerHTML},
                href = uri + base64(format(template, ctx));
            return href;
        }

        function getPlatoMasVendido(filtro) {
            return $http.post(url,
              {
                  'function': 'getPlatoMasVendido',
                  'sucursal_id': filtro.sucursal_id,
                  'fecha_desde': filtro.fecha_desde,
                  'fecha_hasta': filtro.fecha_hasta
              })
              .then(function (data) {
                  console.log(data);
                  //PedidoVars.clearCache = true;
                  return data;
              })
              .catch(function (data) {
                  //PedidoVars.clearCache = true;
                  ErrorHandler(data);
              });
        }

    }


})();
