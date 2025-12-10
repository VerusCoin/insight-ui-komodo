'use strict';

angular.module('insight.search').controller('SearchController',
  function($scope, $routeParams, $location, $timeout, $http, Global, Block, Transaction, Address, BlockByHeight) {
  $scope.global = Global;
  $scope.loading = false;

  // Blocked addresses that cause daemon performance issues
  var blockedAddresses = [
    'RTqQe58LSj2yr5CrwYFwcsAQ1edQwmrkUU'
  ];
  
  // Protocol addresses that should never be searched (loaded from protocol-addresses.json)
  var protocolAddresses = [];
  
  // Load protocol addresses on initialization
  $http.get('/api/protocol-addresses').then(function(response) {
    if (response.data && response.data.addresses) {
      protocolAddresses = response.data.addresses;
      console.log('Loaded ' + protocolAddresses.length + ' protocol addresses to block');
    }
  }).catch(function(err) {
    console.warn('Could not load protocol addresses:', err);
  });

  var _isBlockedAddress = function(addr) {
    return blockedAddresses.indexOf(addr) !== -1 || protocolAddresses.indexOf(addr) !== -1;
  };

  var _badQuery = function() {
    $scope.badQuery = true;

    $timeout(function() {
      $scope.badQuery = false;
    }, 2000);
  };
  
  var _blockedAddress = function() {
    $scope.blockedAddress = true;

    $timeout(function() {
      $scope.blockedAddress = false;
    }, 3000);
  };

  var _resetSearch = function() {
    $scope.q = '';
    $scope.loading = false;
  };

  $scope.search = function() {
    var q = $scope.q;
    $scope.badQuery = false;
    $scope.blockedAddress = false;
    $scope.loading = true;

    // Check if it's a blocked address first
    if (_isBlockedAddress(q)) {
      $scope.loading = false;
      _blockedAddress();
      return;
    }

    Block.get({
      blockHash: q
    }, function() {
      _resetSearch();
      $location.path('block/' + q);
    }, function() { //block not found, search on TX
      Transaction.get({
        txId: q
      }, function() {
        _resetSearch();
        $location.path('tx/' + q);
      }, function() { //tx not found, search on Address
        Address.get({
          addrStr: q
        }, function() {
          _resetSearch();
          $location.path('address/' + q);
        }, function() { // block by height not found
          if (isFinite(q)) { // ensure that q is a finite number. A logical height value.
            BlockByHeight.get({
              blockHeight: q
            }, function(hash) {
              _resetSearch();
              $location.path('/block/' + hash.blockHash);
            }, function() { //not found, fail :(
              $scope.loading = false;
              _badQuery();
            });
          }
          else {
            $scope.loading = false;
            _badQuery();
          }
        });
      });
    });
  };

});
