(function () {
    'use strict';

    angular.module('mvReservas', ['ngRoute'])
        .component('mvReservas', mvReservas());

    function mvReservas() {
        return {
            bindings: {},
            templateUrl: window.installPath + '/mv-angular-reportes/mv-reservas.html',
            controller: MvReservasController
        }
    }


    MvReservasController.$inject = ['$scope', 'MvUtils', "SucursalesService", "ReportesService"];
    function MvReservasController($scope, MvUtils, SucursalesService, ReportesService) {

        var vm = this;
        vm.sucursal = {};
        vm.sucursales = [];
        vm.reservas = [];

        //FUNCIONES
        vm.loadSucursales = loadSucursales;
        vm.tableToExcel = tableToExcel;
        vm.getReservas = getReservas;


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
            console.log(vm.sucursales);
        }

        function tableToExcel() {
            window.location.href = ReportesService.tableToExcel("tablaReservas","Reservas");
        }

        function getReservas() {
            ReportesService.getReservas(vm.sucursal.sucursal_id).then(function (data) {
                if(data.length > 0) {
                    console.log(data);
                    vm.reservas = data;
                } else {
                    MvUtils.showMessage('warning', 'No hay datos para mostrar');
                }
            }).catch(function(error){
                //console.log(error);
            });
        }

    }

})();
