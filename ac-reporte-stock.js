(function () {

    'use strict';


    angular.module('acReporteStock', [])

        .component('reporteStock', reporteStock());

    function reporteStock() {
        return {
            bindings: {},
            templateUrl: window.installPath + '/ac-angular-reportes/ac-reporte-stock.html',
            controller: ReporteStockController
        }
    }

    ReporteStockController.$inject = ['StockService', 'SucursalesService', 'UserService', 'AcUtilsGlobals'];
    function ReporteStockController(StockService, SucursalesService, UserService, AcUtilsGlobals) {
        var vm = this;
        vm.sucursales = [];
        vm.sucursal = {};
        vm.sucursal_id = UserService.getFromToken().data.sucursal_id;

        vm.getData = getData;

        SucursalesService.get().then(function (data) {
            vm.sucursales = data;
            for (var i in vm.sucursales) {

                if (vm.sucursales[i].sucursal_id == vm.sucursal_id) {

                    vm.sucursal = vm.sucursales[i];
                }
            }
            getData();
        });


        function getData() {
            AcUtilsGlobals.sucursal_id_search = vm.sucursal.sucursal_id;
            StockService.get().then(function (data) {

                vm.stocks = [];


                for (var i in data) {
                    if (data[i].producto_tipo == 0) {
                        data[i].cantidad = 0;
                        for (var x in data[i].stocks) {

                            if (data[i].stocks[x].sucursal_id == vm.sucursal.sucursal_id) {
                                data[i].cantidad = data[i].cantidad + data[i].stocks[x].cant_actual;
                            }
                        }
                        vm.stocks.push(data[i]);
                    }
                }


                AcUtilsGlobals.sucursal_id_search = 0;


            })
        }


    }


})();
