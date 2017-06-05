app.directive('testDirective', function($compile) {
  return {
    restrict: 'EAC',
    link: function($scope, elements, attrs) {
      $(".pop-over-link").popover({
        'placement': 'top',
        'trigger': 'click',
        'html': true,
        'container': 'body',
        'content': function() {
          return $compile($(".pop-over-content").html())($scope);
        }
      });
    }
  }
});

app.directive('onFinishRender', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      $timeout(function() {
        scope.$emit(attr.onFinishRender);
      });
    }
  }
});

app.directive("keepScroll", function() {

  return {

    controller: function($scope) {
      var element = 0;

      this.setElement = function(el) {
        element = el;
      }

      this.addItem = function(item) {
        element.scrollTop = (element.scrollTop + item.clientHeight + 15); //15px for margin
      };

    },

    link: function(scope, el, attr, ctrl) {

      ctrl.setElement(el[0]);

    }

  };

})

app.directive("scrollItem", function() {
  return {
    require: "^keepScroll",
    link: function(scope, el, att, scrCtrl) {
      scrCtrl.addItem(el[0]);
    }
  }
})
