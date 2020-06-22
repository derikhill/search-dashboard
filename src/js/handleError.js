export function handleError(data) {
  let err = {};
  if (typeof data.responseJSON != 'undefined') {
      err = data.responseJSON;
  } else {
      err = data;
  }

  if (err.status == 401) {
    alert(`We're sorry...\n\nThere was an authorization error processing your request.\n\nPlease log in.`);
  } else {
    const errorModal = new Foundation.Reveal($('#errorModal'));
    if (err.status == 403) {
        err.message = `You do not have access to this application. Please contact support for more information or to request access.`;
    }
    document.getElementById('errMsg').innerHTML = `There was an error processing your request.<br><br>Error Code: ${err.error_id}<br>Description: ${err.message}`;
    errorModal.open();
  }
}