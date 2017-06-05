/**
 * fileModel Directive to upload multipart form data.
 * @param {}
 */
// app.directive('fileModel', ['$parse', 'toastr', function($parse, toastr) {
//     return {
//         restrict: 'A',
//         link: function(scope, element, attrs) {
//             var model = $parse(attrs.fileModel);
//             var modelSetter = model.assign;
//             element.bind('change', function() {
//                 var file = element[0].files[0];

//                 if (!file.type.match('image.*')) {
//                     console.log(file.size);
//                     toastr.warning('The file must be a file of type: jpeg, jpg, png.');

//                     return false

//                 }
//                 else {

//                     if (file.type == 'image/gif') {
//                         toastr.warning('The file must be a file of type: jpeg, jpg, png.');
//                         return false;
//                     }
//                     else if (file.size > 1024000) {

//                         toastr.warning('The file should not be greater than 1 MB.');

//                         return false

//                     }
//                     else {
//                         var reader = new FileReader();
//                         reader.onload = element[0].files[0];
//                         reader.readAsDataURL(element[0].files[0]);
//                         scope.$apply(function() {
//                             modelSetter(scope, element[0].files[0]);
//                         });
//                     }
//                 }

//             });
//         }
//     };
// }]);
