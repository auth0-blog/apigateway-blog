angular.module( 'sample.login', [
  'auth0'
])
.controller( 'LoginCtrl', function HomeController( $scope, auth, $location, store ) {

  function getOptionsForRole(isAdmin, token) {
    if(isAdmin) {
      return {
          "id_token": token,        // the token we just obtained
          "role":"arn:aws:iam::025300657536:role/auth0-api-role",
          "principal": "arn:aws:iam::025300657536:saml-provider/auth0-api"
        };
      }
    else {
      return {
          "id_token": token,        // the token we just obtained
          "role":"arn:aws:iam::025300657536:role/auth0-api-social-role",
          "principal": "arn:aws:iam::025300657536:saml-provider/auth0-api"
        };
    }
  }

  $scope.login = function() {
    auth.signin({}, function(profile, token) {
      // set isAdmin based upon whether or not a social login. Often you'll do
      // something more sophisticated than this.
      store.set('profile', profile);
      store.set('token', token);

      // get delegation token from identity token.
      profile.isAdmin = !profile.identities[0].isSocial;
      var options = getOptionsForRole(profile.isAdmin, token);

      auth.getToken(options)
        .then(
          function(delegation)  {
            store.set('awstoken', delegation.Credentials);  //add to local storage
      $location.path("/");
          }, 
        function(err) {
           console.log('failed to acquire delegation token', err);
      });
    }, function(error) {
      console.log("There was an error logging in", error);
    });
  }
});
