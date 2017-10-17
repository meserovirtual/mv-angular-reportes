(function () {
    'use strict';

    angular.module('mvTablasProduccion', ['ngRoute'])
        .component('mvTablasProduccion', mvTablasProduccion());

    function mvTablasProduccion() {
        return {
            bindings: {},
            templateUrl: window.installPath + '/mv-angular-reportes/mv-tablas-produccion.html',
            controller: MvTablasProduccionController
        }
    }


    MvTablasProduccionController.$inject = ['$scope', 'MvUtils', "SucursalesService", "ReportesService"];
    function MvTablasProduccionController($scope, MvUtils, SucursalesService, ReportesService) {

        var vm = this;
        vm.sucursal = {};
        vm.sucursales = [];
        vm.tablasProduccion = [];
        vm.fecha_desde = '';
        vm.fecha_hasta = '';

        //FUNCIONES
        vm.loadSucursales = loadSucursales;
        vm.tableToExcel = tableToExcel;
        vm.getTablasDeProduccion = getTablasDeProduccion;


        loadSucursales();

        function loadSucursales() {
            SucursalesService.get().then(function (data) {
                vm.sucursales = [];
                vm.sucursales = data;
                var encontrado = false;
                for(var i=0; i <= vm.sucursales.length -1; i++) {
                    if(vm.sucursales[i].sucursal_id == -1) {
                        encontrado = true;
                    }
                }
                if(!encontrado) {
                    vm.sucursales.push({sucursal_id: -1, nombre: "Todas", direccion: "", telefono: ""});
                }
                vm.sucursal = vm.sucursales[vm.sucursales.length - 1];
            }).catch(function(error){
                //console.log(error);
            });
        }

        function tableToExcel() {
            window.location.href = ReportesService.tableToExcel("tablaPlatos","Platos Más Vendidos");
        }

        function getTablasDeProduccion() {
            var filtro = {sucursal_id:-1,fecha_desde:'',fecha_hasta:''};
            filtro.sucursal_id = vm.sucursal.sucursal_id;

            if(vm.fecha_desde instanceof Date && !isNaN(vm.fecha_desde.valueOf())) {
                if(vm.fecha_desde == undefined) {
                    MvUtils.showMessage('warning', 'Ingrese una fecha desde valida');
                } else {
                    filtro.fecha_desde = vm.fecha_desde.getFullYear()+'-'+(vm.fecha_desde.getMonth() + 1)+'-'+vm.fecha_desde.getDate();
                }
            } else {
                //console.log('NO es fecha');
            }

            if(vm.fecha_hasta instanceof Date && !isNaN(vm.fecha_hasta.valueOf())) {
                if(vm.fecha_hasta == undefined) {
                    MvUtils.showMessage('warning', 'Ingrese una fecha hasta valida');
                } else {
                    filtro.fecha_hasta = vm.fecha_hasta.getFullYear()+'-'+(vm.fecha_hasta.getMonth() + 1)+'-'+vm.fecha_hasta.getDate();
                }
            } else {
                // console.log('NO es fecha');
            }

            ReportesService.getTablasDeProduccion(filtro).then(function (data) {
                console.log(data);
                if(data.status == 200) {
                    if(data.data.length <= 0) {
                        MvUtils.showMessage('warning', 'No hay datos para mostrar');
                    }
                    vm.tablasProduccion = data.data;
                } else {
                    MvUtils.showMessage('error', 'Error recuperando los datos');
                }
            }).catch(function(error){
                //console.log(error);
            });
        }

    }

})();
