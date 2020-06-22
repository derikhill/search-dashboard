import {token} from '../login/login';
import {handleError} from '../../js/handleError';

export const appLookup = (data, form, event) => {
  let lookupForm = /*html */ `
    <div class="grid-x grid-padding-x app-detail-title hide-for-print">
      <div class="cell"><button class="button hollow hide" id="go-back-button">Return to results</button></div>
      <div class="cell">
        <h4>Application Detail</h4>
      </div>
      <div class="cell medium-4">
        <label for="">App ID
          <input type="text" name="app_id" id="app-id-search" placeholder="enter app id to search">
        </label>
      </div>
      <div class="cell medium-4">
        <button class="button greenbtn cell medium-5" id="app-detail-search-button">Get Application Information</button>
      </div>
      <div class="cell" id="info-message"></div>
      <div class="cell" id="app-detail-table"></div>
    </div>
    <div id="print-div" class="hide"></div>
  `;

  if (event !== 'grid-print') {
    document.getElementById('app').innerHTML = lookupForm;
  }

  const appDetailSearchButton = document.getElementById('app-detail-search-button');
  const appIdSearch = document.getElementById('app-id-search');
  
  let getAppDetail = searchBy => {
    const url = `/url/${searchBy}`;
    $.ajax({
      method: 'GET',
      url: url,
      xhrFields: {
        withCredentials: true,
      },
      contentType: "application/json",
      headers: {
        'Authorization': token
      },
      success: response => {
          const {record} = response;
          if (record == null) {
            document.getElementById('app-detail-table').innerHTML = '';
            document.getElementById('info-message').innerHTML = `No results for app ID: ${appIdSearch.value}. Try another search`;
            return;
          }
  
          if (record != null && record != 'undefined') {
            localStorage.setItem('appDetail', JSON.stringify(response));

            if (event == 'grid-print') {
              Promise.all([printForm(form, searchBy)]).then(() => {
                window.open(`${form}.html?appid=${searchBy}`);
              })
              return;
            } 
            showAppDetail(record);
            searchBy = '';
          }
      },
      error: error => {
        handleError(error);
      }
    });
  };

  if ( data != '' && data != undefined) {
    let searchBy = data;
    getAppDetail(searchBy);
  }

  appDetailSearchButton.onclick = () => {
    let searchBy = appIdSearch.value;
    if (!$('#go-back-button').hasClass('hide')) {
      $(this).addClass('hide');
    }
    getAppDetail(searchBy);
  }
}

export function showAppDetail (data) {
  document.getElementById('info-message').innerHTML = '';
  document.getElementById('app-detail-table').innerHTML = '';
  const {app_id, first_name, last_name, entity_name, form_name} = data;

  let counter = 0;
  let supplierInfoRow = '';
  let billingInfoRow = '';
  let sampleInfoRow = '';
  let commentsRow = '';
  let filesRow = '';
  
  const sections = {
    supplier_information: ["first_name", "last_name", "user_name", "entity_name", "supplier_name", "host_vendor_number", "supplier_number", "po_type", "receipt_notification_receive_email", "report_receive_email"],
    billing_information: ["billing_company_name", "billing_attn", "billing_address_1", "billing_tel_no", "billing_address_city_state_zip", "billing_email_address"],
    skip_fields: ['app_id','submit','app_type','created','app_time','retrieved','form_name','user_id','entity_id','']
  }

  Object.keys(data).forEach((key) => {
    if (sections.supplier_information.indexOf(key) !== -1) {
      if (counter == 2) {
        counter = 0;
        supplierInfoRow += "</tr>\n<tr>";
      }
      supplierInfoRow += `<td class="app-field-name">${key.replace(/\_/g, ' ').toUpperCase()}</td>`;
      if (data.hasOwnProperty(key)) {
        supplierInfoRow += `<td>${data[key].replace(/\,/g, ', <br>')}</td>`;
      }
      counter++;
    }
  })

  Object.keys(data).forEach((key) => {
    if (sections.billing_information.indexOf(key) !== -1) {
      if (counter == 2) {
        counter = 0;
        billingInfoRow += "</tr>\n<tr>";
      }
      billingInfoRow += `<td class="app-field-name">${key.replace(/\_/g, ' ').toUpperCase()}</td>`;
      if (data.hasOwnProperty(key)) {
        billingInfoRow += `<td>${data[key].replace(/\,/g, ', <br>')}</td>`;
      }
      counter++;
    }
  })

  Object.keys(data).forEach((key) => {
    if (sections.supplier_information.indexOf(key) == -1 && sections.billing_information.indexOf(key) == -1 && sections.skip_fields.indexOf(key) == -1) {
      if (counter == 2) {
        counter = 0;
        sampleInfoRow += "</tr>\n<tr>";
      }
      if (key === 'comments') {
        commentsRow += `<td class="app-field-name">${key.replace(/\_/g, ' ').toUpperCase()}</td>`;
        if (data.hasOwnProperty(key)) {
          commentsRow += `<td class="comments-row">${data[key]}</td>`;
        }
      } else if (key === 'files') {
        data.files.forEach( filename => {
          filesRow += `<p><a >${filename.file_name}</a></p>`
        })
      } else {
        sampleInfoRow += `<td class="app-field-name">${key.replace(/\_/g, ' ').toUpperCase()}</td>`;
        if (data.hasOwnProperty(key)) {
          sampleInfoRow += `<td>${data[key]}</td>`; //.replace(/\,/g, ', <br>')
        }
      }
      counter++;
    }
  })

  let showDets = /*html */ `
    <div class="cell app-quick-details">
      <div class="grid-x">
        <div class="cell medium-6">
          <h6>Application ID: <span>${app_id}</span></h6>
          <h6>Submitted by: <span>${first_name} ${last_name}</span></h6>
          <h6>Entity: <span>${entity_name}</span></h6>
        </div>
        <div class="cell medium-6">
          <div class="button-group float-center text-right">
            <a class="button hollow" id="getPrintPage" form-name="${form_name}" app-id="${app_id}">Print Page</a>
            <a class="button hollow" id="getAttachedFiles">Attached Files</a>
          </div>
        </div>
    </div>
    <div class="cell">
      <div class="grid-x grid-margin-x app-details">
        <div class="cell">
          <table class="unstriped">
            <tbody id="appTableDets">
              <!-- SUPPLIER INFORMATION -->
              <tr>
                <td colspan="4" class="section-title" id="supplier_information">SUPPLIER INFORMATION</td>
              </tr>
              ${supplierInfoRow}
              <!-- BILLING INFORMATION -->
              <tr>
                <td colspan="4" class="section-title">BILLING INFORMATION</td>
              </tr>
              ${billingInfoRow}
              <!-- SAMPLE INFORMATION -->
              <tr>
                <td colspan="4" class="section-title">SAMPLE / TESTING INFORMATION</td>
              </tr>
              ${sampleInfoRow}
              <!-- COMMENTS AND FILES -->
              <tr>
                <td colspan="4" class="section-title">COMMENTS and ATTACHED FILES</td>
              </tr>
              ${commentsRow}
            </tbody>
          </table>
          <div>
            <h6>Attached Files:</h6>
            ${filesRow}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('app-detail-table').innerHTML = showDets;

  const getPrintPage = document.getElementById('getPrintPage');
  getPrintPage.onclick = () => {
    const printType = getPrintPage.getAttribute('form-name');
    const appId = getPrintPage.getAttribute('app-id');
    Promise.all([printForm(printType, appId)]).then(() => {
      window.open(`${printType}.html?appid=${appId}`);
    })
    
  }
}

export function printForm(printType, appId) {
  return $.ajax({
    url: `${printType}.html?appid=${appId}`,
    type: 'GET'
  });
}
