'use strict';

angular.module('insight.system').controller('GetCurrencyController',
  function($scope, $http, $location, $rootScope) {
    $scope.activeTab = 'overview';
    $scope.searchQuery = '';
    $scope.currency = null;
    $scope.loading = false;
    $scope.error = null;

    // Get currency from URL parameter
    var searchParams = $location.search();
    var currencyParam = searchParams.currency;

    $scope.searchCurrency = function() {
      if (!$scope.searchQuery) {
        $scope.error = 'Please enter a currency name';
        return;
      }
      
      $scope.loading = true;
      $scope.error = null;
      $scope.currency = null;

      $http.get('/api/getcurrency/' + encodeURIComponent($scope.searchQuery))
        .then(function(response) {
          $scope.currency = response.data;
          $scope.loading = false;
          $scope.activeTab = 'overview';
        })
        .catch(function(error) {
          $scope.loading = false;
          $scope.error = error.data && error.data.error ? error.data.error : 'Currency not found or error loading data';
        });
    };

    $scope.quickSearch = function(name) {
      $scope.searchQuery = name;
      $scope.searchCurrency();
    };

    $scope.setActiveTab = function(tab) {
      $scope.activeTab = tab;
    };

    $scope.isPBaaSChain = function() {
      return $scope.currency && ($scope.currency.options & 0x100) !== 0;
    };

    $scope.isGateway = function() {
      return $scope.currency && ($scope.currency.options & 0x80) !== 0;
    };

    $scope.isToken = function() {
      return $scope.currency && ($scope.currency.options & 0x20) !== 0;
    };

    $scope.isFractional = function() {
      return $scope.currency && ($scope.currency.options & 1) !== 0;
    };

    $scope.isNFT = function() {
      return $scope.currency && ($scope.currency.options & 0x800) !== 0;
    };

    $scope.hasOption = function(flag) {
      return $scope.currency && ($scope.currency.options & flag) !== 0;
    };

    $scope.getNotarizationProtocol = function() {
      if (!$scope.currency) return '';
      var protocols = {
        1: 'Auto Notarization (PBaaS MMR)',
        2: 'Notary Confirmation',
        3: 'Chain ID Control'
      };
      return protocols[$scope.currency.notarizationprotocol] || 'Unknown';
    };

    $scope.getProofProtocol = function() {
      if (!$scope.currency) return '';
      var protocols = {
        1: 'PBaaS MMR Proof',
        2: 'Chain ID Proof',
        3: 'Ethereum Notarization'
      };
      return protocols[$scope.currency.proofprotocol] || 'Unknown';
    };

    $scope.getCurrencyName = function(id) {
      if (!$scope.currency) return id;
      if ($scope.currency.currencynames && $scope.currency.currencynames[id]) {
        return $scope.currency.currencynames[id];
      }
      return id;
    };

    $scope.getSystemName = function() {
      if (!$scope.currency) return '';
      if ($scope.currency.currencynames && $scope.currency.systemid) {
        return $scope.currency.currencynames[$scope.currency.systemid] || 'VRSC';
      }
      return 'VRSC';
    };

    $scope.getFirstKey = function(obj) {
      return Object.keys(obj)[0];
    };

    // Auto-load currency from URL parameter or default to VRSC
    if (currencyParam) {
      $scope.searchQuery = currencyParam;
      $scope.searchCurrency();
    } else {
      $scope.searchQuery = 'VRSC';
      $scope.searchCurrency();
    }
  });
