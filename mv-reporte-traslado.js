(function () {

    'use strict';


    angular.module('mvReporteTraslado', [])
        .component('mvReporteTraslado', mvReporteTraslado());

    function mvReporteTraslado() {
        return {
            bindings: {},
            templateUrl: window.installPath + '/mv-angular-reportes/mv-reporte-traslado.html',
            controller: ReporteTrasladoController
        }
    }

    ReporteTrasladoController.$inject = ['StockService', 'SucursalesService', 'UserService', 'AcUtilsGlobals', 'StockVars', 'AcUtils'];
    function ReporteTrasladoController(StockService, SucursalesService, UserService, AcUtilsGlobals, StockVars, AcUtils) {
        var vm = this;
        vm.detailsOpen = false;
        vm.sucursales = [];
        vm.sucursal = {};
        vm.traslados = [];
        vm.traslado = {};
        vm.trasladoDetalle = [];
        vm.sucursal_id = UserService.getFromToken().data.sucursal_id;
        vm.paginas = 1;
        vm.indice = -1;

        vm.getData = getData;
        vm.getDetalle = getDetalle;

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
            StockService.getTraslado().then(function (data) {
                vm.traslados = data;

                StockVars.clearCache = true;
            })
        }

        function getDetalle(traslado) {
            StockService.getTrasladoDetalle(traslado).then(function (data) {
                vm.trasladoDetalle = data;

                StockVars.clearCache = true;
            });
        }

        // Implementación de la paginación
        vm.start = 0;
        vm.limit = StockVars.paginacion;
        vm.pagina = StockVars.pagina;
        vm.paginas = StockVars.paginas;

        function paginar(vars) {
            if (vars == {}) {
                return;
            }
            vm.start = vars.start;
            vm.pagina = vars.pagina;
        }

        vm.next = function () {
            paginar(AcUtils.next(StockVars));
        };
        vm.prev = function () {
            paginar(AcUtils.prev(StockVars));
        };
        vm.first = function () {
            paginar(AcUtils.first(StockVars));
        };
        vm.last = function () {
            paginar(AcUtils.last(StockVars));
        };

        vm.goToPagina = function () {
            paginar(AcUtils.goToPagina(vm.pagina, StockVars));
        }

    }


})();
