(function () {
    'use strict';

    angular.module('mvVentasWeb', [])
        .component('mvVentasWeb', mvVentasWeb());

    function mvVentasWeb() {
        return {
            bindings: {
                searchFunction: '&'
            },
            templateUrl: window.installPath + '/mv-angular-reportes/mv-ventas-web.html',
            controller: MvVentasWebController
        }
    }

    MvVentasWebController.$inject = ['ReportesService', "MvUtils"];
    /**
     * @param AcUsuarios
     * @constructor
     */
    function MvVentasWebController(ReportesService, MvUtils) {
        var vm = this;

        vm.ventas_web = [];
        vm.soloActivos={};
        vm.soloActivos.status = 2;

        //FUNCIONES
        //vm.detalle = detalle;
        vm.loadVentasWeb = loadVentasWeb;


        loadVentasWeb();


        function loadVentasWeb() {
            ReportesService.getVentasWeb().then(function (data) {
                console.log(data);
                vm.ventas_web = data;
            }).catch(function(error){
                console.log(error);
            });
        }





        // Implementación de la paginación
        /*
        vm.start = 0;
        vm.limit = CategoryVars.paginacion;
        vm.pagina = CategoryVars.pagina;
        vm.paginas = CategoryVars.paginas;

        function paginar(vars) {
            if (vars == {}) {
                return;
            }
            vm.start = vars.start;
            vm.pagina = vars.pagina;
        }

        vm.next = function () {
            paginar(MvUtils.next(CategoryVars));
        };
        vm.prev = function () {
            paginar(MvUtils.prev(CategoryVars));
        };
        vm.first = function () {
            paginar(MvUtils.first(CategoryVars));
        };
        vm.last = function () {
            paginar(MvUtils.last(CategoryVars));
        };

        vm.goToPagina = function () {
            paginar(MvUtils.goToPagina(vm.pagina, CategoryVars));
        }

        */

    }


})();
