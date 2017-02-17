(function () {

    'use strict';


    angular.module('mvDeudores', [])
        .component('mvDeudores', mvDeudores());

    function mvDeudores() {
        return {
            bindings: {},
            templateUrl: window.installPath + '/mv-angular-reportes/mv-deudores.html',
            controller: mvDeudoresController
        }
    }

    mvDeudoresController.$inject = ["$rootScope", "$location", 'UserService', 'UserVars', 'SucursalesService',
        'MvUtilsGlobals', 'MvUtils'];
    function mvDeudoresController($rootScope, $location, UserService, UserVars, SucursalesService,
                                  MvUtilsGlobals, MvUtils) {
        var vm = this;
        vm.usuario = {};
        vm.sucursal = {};
        vm.sucursales = [];
        vm.usuarios = []


        SucursalesService.get().then(function (data) {
            vm.sucursales = data;
            vm.sucursal = data[0];
        }).catch(function(data){
            console.log(data);
        });

        UserService.getDeudores().then(function (data) {
            console.log(data);
            vm.usuarios = data.data;
            vm.usuario = data.data[0];
        }).catch(function(data){
            console.log(data);
        });


    }


})();

