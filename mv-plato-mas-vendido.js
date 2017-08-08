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
        vm.platos = [];


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
                console.log(error);
            });
        }

        function tableToExcel() {
            window.location.href = ReportesService.tableToExcel("tablaPlatos","Platos Más Vendidos");
        }

        function getPlatoMasVendido() {
            var filtro = {
                sucursal_id: vm.sucursal.sucursal_id,
                fecha_desde: '2017-04-01',
                fecha_hasta: '2017-05-01'
            }

            ReportesService.getPlatoMasVendido(filtro).then(function (data) {
                //vm.platos = data;
                console.log(data);
                if(data.status == 200) {

                } else {
                    MvUtils.showMessage('error', 'Error recuperando los datos');
                }
            }).catch(function(error){
                console.log(error);
            });
        }

    }

})();
