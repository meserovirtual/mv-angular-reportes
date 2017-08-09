(function () {
    'use strict';

    angular.module('mvPlatoMasVendido', ['ngRoute'])
        .component('mvPlatoMasVendido', mvPlatoMasVendido());

    function mvPlatoMasVendido() {
        return {
            bindings: {},
            templateUrl: window.installPath + '/mv-angular-reportes/mv-plato-mas-vendido.html',
            controller: MvPlatoMasVendidoController
        }
    }


    MvPlatoMasVendidoController.$inject = ['$scope', 'MvUtils', "SucursalesService", "ReportesService"];
    function MvPlatoMasVendidoController($scope, MvUtils, SucursalesService, ReportesService) {

        var vm = this;
        vm.sucursal = {};
        vm.sucursales = [];
        vm.platosMasVendidos = [];
        vm.fecha_desde = '';
        vm.fecha_hasta = '';

        //FUNCIONES
        vm.loadSucursales = loadSucursales;
        vm.tableToExcel = tableToExcel;
        vm.getPlatoMasVendido = getPlatoMasVendido;


        loadSucursales();

        function loadSucursales() {
            SucursalesService.get().then(function (data) {
                vm.sucursales = data;
                vm.sucursales.push({sucursal_id: -1, nombre: "Todas", direccion: "", telefono: ""});
                vm.sucursal = vm.sucursales[vm.sucursales.length - 1];
            }).catch(function(error){
                //console.log(error);
            });
        }

        function tableToExcel() {
            window.location.href = ReportesService.tableToExcel("tablaPlatos","Platos Más Vendidos");
        }

        function getPlatoMasVendido() {
            var filtro = {sucursal_id:-1,fecha_desde:'',fecha_hasta:''};
            //console.log(vm.fecha_desde);
            filtro.sucursal_id = vm.sucursal.sucursal_id;

            if(vm.fecha_desde instanceof Date && !isNaN(vm.fecha_desde.valueOf())) {
                //console.log('es fecha');
                if(vm.fecha_desde == undefined) {
                    MvUtils.showMessage('warning', 'Ingrese una fecha desde valida');
                } else {
                    filtro.fecha_desde = vm.fecha_desde.getFullYear()+'-'+(vm.fecha_desde.getMonth() + 1)+'-'+vm.fecha_desde.getDate();
                }

            } else {
                //console.log('NO es fecha');
            }

            if(vm.fecha_hasta instanceof Date && !isNaN(vm.fecha_hasta.valueOf())) {
                //console.log('es fecha');
                if(vm.fecha_hasta == undefined) {
                    MvUtils.showMessage('warning', 'Ingrese una fecha hasta valida');
                } else {
                    filtro.fecha_hasta = vm.fecha_hasta.getFullYear()+'-'+(vm.fecha_hasta.getMonth() + 1)+'-'+vm.fecha_hasta.getDate();
                }

            } else {
               // console.log('NO es fecha');
            }

            //console.log(filtro);


            ReportesService.getPlatoMasVendido(filtro).then(function (data) {
                //vm.platos = data;
                //console.log(data);
                if(data.status == 200) {
                    if(data.data.length <= 0) {
                        MvUtils.showMessage('warning', 'No hay datos para mostrar');
                    }
                    vm.platosMasVendidos = data.data;
                } else {
                    MvUtils.showMessage('error', 'Error recuperando los datos');
                }
            }).catch(function(error){
                //console.log(error);
            });
        }

    }

})();
