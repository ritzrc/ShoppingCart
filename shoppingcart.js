angular.module('services.cart', [])
        .service('Cart', ['$rootScope', 'Reviewer', '$window', function ($rootScope, Reviewer, $window) {

                'use strict';

                /* Reading from local storage each time is costly. Instead, for every session, we keep a local vairable 'tempart' to read from.
                 ** If cart is empty, we read from local storage*/
                var cart, self = this;

                this.getCart = function () {
                    var cartStr = ($window.localStorage && $window.localStorage.getItem('cart')) || '{}';
                    cart = JSON.parse(cartStr);
                    return cart;
                };

                this.addItem = function (item) {
                    cart = cart || this.getCart();
                    cart[ item.itemId ] = item.quantity;
                    this.save(cart);
                    return this;
                };

                this.addItems = function (items) {
                    var self = this;
                    angular.forEach(items, function (value, key) {
                        self.addItem(value);
                    });
                    return this;
                };

                this.save = function (cart) {
                    var self = this;
                    Reviewer.review(cart).then(function (result) {
                        if (result === true) {
                            self.persist(cart);
                        }
                    });
                    return this;
                };

                this.remove = function (itemid) {
                    cart = cart || this.getCart();
                    if (cart[ itemid ]) {
                        delete cart[ itemid ];
                        this.save(cart);
                    }
                    return this;
                };

                this.clear = function () {
                    if ($window.localStorage && $window.localStorage.getItem('cart')) {
                        $window.localStorage.removeItem('cart');
                        this.refresh();
                    }
                    return this;
                };

                this.persist = function (cart) {
                    if ($window.localStorage) {
                        $window.localStorage.setItem('cart', JSON.stringify(cart));
                        this.refresh();
                    }
                    return this;
                };

                this.changeQuantity = function (itemid, newQuantity) {
                    cart = cart || this.getCart();
                    cart[ itemid ] = newQuantity;
                    this.save(cart);
                    return this;
                };

                this.refresh = function () {
                    $rootScope.$apply();
                };

                // real time cart updates between multiple tabs.
                angular.element($window).on('storage', function (event) {
                    if (event.key === 'cart') {
                        self.refresh();
                    }
                });
            }]);