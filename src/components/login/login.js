export function getCookie (cname) {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    c = c.trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length);
    }
  }
  return '';
}

export let token = 'Bearer ' + getCookie('secureToken');

export function checkToken() {
  if (token === 'Bearer ') {
    $('#loginModal').load('/login.html', function () {
      $('#loginModal').foundation('open');
      $('#loginForm').on('submit', function (e) {
        e.preventDefault();
        const submitObj = {};
        $('#loginButton').attr('disabled', true).text('Logging in...');
        $('#returnMsg').text('');
        submitObj.username = $('#username').val();
        submitObj.password = $('#password').val();

        $.ajax({
          method: 'POST',
          url: '/login.php',
          xhrFields: {
            withCredentials: true,
          },
          contentType: "application/json",
          headers: {
            'Authorization': token
          },
          data: JSON.stringify(submitObj),
          success: response => {
            if (response.status !== 200) {
              $('#returnMsg').text(response.message);
              $('#loginButton').attr('disabled', false).text('Sign In');
            } else {
              $('#loginModal').foundation('close');
              token = response.token_type + ' ' + response.access_token;
              $('#daUser').html('...');
              $.ajax({
                method: 'POST',
                url: '/url/user/information',
                xhrFields: {
                  withCredentials: true,
                },
                contentType: "application/json",
                headers: {
                  'Authorization': token
                },
                data: JSON.stringify(submitObj),
                success: response => {
                  const {first_name, user_id} = response.details;
                  $('#daUser').html(first_name + ' (<a href="/logout.php" style="color: #FFF;">logout</a>)');
                  $('#user_id').val(user_id);
                }
              });
            }
          }
        });
      });
    });
  } else {
    $('#daUser').html('...');
    $.ajax({
      method: 'POST',
      url: '/url/user/information',
      xhrFields: {
        withCredentials: true,
      },
      contentType: "application/json",
      headers: {
        'Authorization': token
      },
      success: response => {
        const {first_name, user_id} = response.details;
        if (typeof response.details !== 'undefined' && response.details !== '' && response.details !== null) {
          $('#daUser').html(first_name + ' (<a href="/logout.php" style="color: #FFF;">logout</a>)');
          $('#user_id').val(user_id);
        } else {
          $('#loginModal').foundation('open');
          $('#daUser').html('Guest (<a id="loginLink" style="cursor: pointer; color: #FFFFFF;">login</a>)');
          $('#loginModal').load('/login.html', function () {
            $('#loginForm').on('submit', function (e) {
              e.preventDefault();
              const submitObj = {};
              $('#loginButton').attr('disabled', true).text('Logging in...');
              $('#returnMsg').text('');
              submitObj.username = $('#username').val();
              submitObj.password = $('#password').val();
              $.ajax({
                method: 'POST',
                url: '/login.php',
                xhrFields: {
                  withCredentials: true,
                },
                contentType: "application/json",
                headers: {
                  'Authorization': token
                },
                data: JSON.stringify(submitObj),
                success: response => {
                  if (response.status !== 200) {
                    $('#returnMsg').text(response.message);
                    $('#loginButton').attr('disabled', false).text('Sign In');
                  } else {
                    $('#loginModal').foundation('close');
                    token = response.token_type + ' ' + response.access_token;

                    $('#daUser').html('...');
                    $.ajax({
                      method: 'POST',
                      url: '/url/user/information',
                      xhrFields: {
                        withCredentials: true,
                      },
                      contentType: "application/json",
                      headers: {
                        'Authorization': token
                      },
                      data: JSON.stringify(submitObj),
                      success: response => {
                        const {first_name, user_id} = response.details;
                        $('#daUser').html(first_name + ' (<a href="/logout.php" style="color: #FFF;">logout</a>)');
                        $('#user_id').val(user_id);
                      }
                    });
                  }
                }
              });
            });
          });
        }
      }
    });
  }
}
