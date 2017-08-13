(function () {
    'use strict';

    angular.module('mvEstadisticas', ['ngRoute'])
        .component('mvEstadisticas', mvEstadisticas());

    function mvEstadisticas() {
        return {
            bindings: {},
            templateUrl: window.installPath + '/mv-angular-reportes/mv-estadisticas.html',
            controller: MvEstadisticasController
        }
    }


    MvEstadisticasController.$inject = ['$scope', 'MvUtils', "SucursalesService", "ReportesService"];
    function MvEstadisticasController($scope, MvUtils, SucursalesService, ReportesService) {

        var vm = this;
        vm.sucursal = {};
        vm.sucursales = [];
        vm.productos = [];

        //FUNCIONES
        vm.loadSucursales = loadSucursales;
        vm.tableToExcel = tableToExcel;
        vm.getMargenDeGanancia = getMargenDeGanancia;


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

        function getMargenDeGanancia() {
            ReportesService.getMargenDeGanancia(vm.sucursal.sucursal_id).then(function (data) {
                if(data.status == 200) {
                    if(data.data.length <= 0) {
                        MvUtils.showMessage('warning', 'No hay datos para mostrar');
                    }
                    vm.productos = data.data;
                } else {
                    MvUtils.showMessage('error', 'Error recuperando los datos');
                }
            }).catch(function(error){
                //console.log(error);
            });
        }

    }

})();
