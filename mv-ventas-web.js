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

    MvVentasWebController.$inject = ['CategoryVars', 'CategoryService', "MvUtils", "ProductService"];
    /**
     * @param AcUsuarios
     * @constructor
     */
    function MvVentasWebController(CategoryVars, CategoryService, MvUtils, ProductService) {
        var vm = this;

        vm.categorias = [];
        vm.categoria = {};
        vm.detailsOpen = false;
        vm.status = true;
        vm.update = false;
        vm.soloActivos = true;
        vm.productos = [];

        vm.save = save;
        vm.cancel = cancel;
        vm.setData = setData;
        vm.loadCategorias = loadCategorias;
        vm.remove = remove;
        vm.omitirAcentos = omitirAcentos;
        //vm.cleanCategoria = cleanCategoria;

        var element = angular.element(document.getElementById('nombre'));

        element[0].addEventListener('focus', function () {
            element[0].classList.remove('error-input');
            element[0].removeEventListener('focus', removeFocus);
        });

        function removeFocus() { }

        loadCategorias();

        function loadCategorias() {
            /*
             CategoryService.get().then(function (data) {
             setData(data);
             });*/
            CategoryVars.clearCache = true;
            if (vm.soloActivos) {
                CategoryVars.all = false;
                CategoryService.get().then(function (data) {
                    setData(data);
                }).catch(function(error){
                    console.log(error);
                });
            } else {
                CategoryVars.all = true;
                CategoryService.get().then(function (data) {
                    setData(data);
                }).catch(function(error){
                    console.log(error);
                });
            }
        }

        function save() {
            if(vm.categoria.nombre === undefined || vm.categoria.nombre.length == 0) {
                element[0].classList.add('error-input');
                MvUtils.showMessage('error', 'El nombre de la categoria no puede ser vacio');
                return;
            } else if(vm.categoria.nombre.length > 70) {
                element[0].classList.add('error-input');
                MvUtils.showMessage('error', 'El nombre de la categoria no puede tener más de 100 caracteres');
                return;
            }

            if (vm.categoria.categoria_id == undefined) {
                vm.categoria.status = 1;
            } else {
                vm.categoria.status = vm.status ? 1 : 0;
            }

            if(vm.categoria.status == 0) {
                ProductService.getByCategoria(vm.categoria.categoria_id).then(function(data){
                    vm.productos = data;
                    if(data.length > 0) {
                        MvUtils.showMessage('warning', 'Categoria con productos asociados. No se puede deshabilitar');
                        return;
                    } else {
                        saveCategoria();
                    }
                }).catch(function(error){
                    console.log(error);
                });
            } else {
                saveCategoria();
            }
        }

        function saveCategoria() {
            CategoryService.save(vm.categoria).then(function (data) {
                //vm.detailsOpen = (data === undefined || data < 0) ? true : false;
                vm.detailsOpen = data.error;
                if(data.error) {
                    element[0].classList.add('error-input');
                    MvUtils.showMessage('error', data.message);
                }
                else {
                    vm.categoria = {};
                    vm.productos = [];
                    loadCategorias();
                    element[0].classList.remove('error-input');
                    MvUtils.showMessage('success', data.message);
                }
            })
                .catch(function (data) {
                    vm.categoria = {};
                    vm.detailsOpen = true;
                });
        }

        function setData(data) {
            vm.categorias = data;
            vm.paginas = CategoryVars.paginas;
        }

        function remove() {
            if(vm.categoria.categoria_id == undefined) {
                alert('Debe seleccionar una categoria');
            } else {
                ProductService.getByCategoria(vm.categoria.categoria_id).then(function(data){
                    vm.productos = data;
                    if(data.length > 0) {
                        MvUtils.showMessage('warning', 'Categoria con productos asociados. No se puede borrar');
                        return;
                    } else {
                        removeCategoria();
                    }
                }).catch(function(error){
                    console.log(error);
                });
            }
        }


        function removeCategoria() {
            var result = confirm('¿Esta seguro que desea eliminar la categoria seleccionada?');
            if(result) {
                CategoryService.remove(vm.categoria.categoria_id).then(function(data){
                    vm.categoria = {};
                    vm.productos = [];
                    vm.detailsOpen = false;
                    loadCategorias();
                    MvUtils.showMessage('success', 'El registro se borro satisfactoriamente');
                }).catch(function(data){
                    console.log(data);
                });
            }
        }


        /*
         function cleanCategoria() {
         vm.categoria = {};
         vm.status = false;
         vm.update = false;
         element[0].classList.remove('error-input');
         }
         */

        function omitirAcentos(texto) {
            return MvUtils.omitirAcentos(texto);
        }

        function cancel() {
            vm.categorias = [];
            vm.categoria={};
            vm.productos = [];
            vm.detailsOpen = false;
            vm.status = false;
            vm.update = false;
            element[0].classList.remove('error-input');
            CategoryVars.clearCache = true;
            loadCategorias();
        }



        // Implementación de la paginación
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

    }


})();
