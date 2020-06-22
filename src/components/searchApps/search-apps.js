import {token} from '../login/login';
import {Grid} from 'ag-grid-community';
import {handleError} from '../../js/handleError';
import flatpickr from 'flatpickr';

export const searchAppsPage = () => {

  let search = /*html */ `
  <div class="grid-x grid-margin-x grid-padding-x search-apps-title">
    <div class="cell">
      <h4>Search Apps</h4>
    </div>
    <div class="cell align-right expander svg-icon">
      <img src="images/icon-expand.svg" class="">
    </div>
    <div class="cell search-apps">
      <form class="grid-x grid-margin-x" id="search-apps">
        <div class="cell">
          <h5>Disposition</h5>
        </div>
        <div class="cell medium-3">
          <label for="disposition_status">Status
            <select name="disposition_status" id="disposition_status">
              <option value=""> -- Select -- </option>
              <option value="Received">Received</option>
              <option value="In Testing">In Testing</option>
              <option value="On Hold">On Hold</option>
              <option value="Testing Complete">Testing Complete</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
        </div>
        <div class="cell medium-3">Start Date
          <label for="disposition_start_date">
            <input type="text" name="disposition_start_date" id="disposition_start_date">
          </label>
        </div>
        <div class="cell medium-3">
          <label for="disposition_end_date">End Date
            <input type="text" name="disposition_end_date" id="disposition_end_date">
          </label>
        </div>
        <div class="cell medium-3">
          <label for="lab_number">Lab Number
            <input type="text" name="lab_number" id="lab_number">
          </label>
        </div>
        <div class="cell">
          <h5>Application</h5>
        </div>
        <div class="cell medium-4">
          <label for="application_app_id">App ID
            <input type="text" name="application_app_id" id="application_app_id">
          </label>
        </div>
        <div class="cell medium-4">
          <label for="application_supplier_name">Supplier Name
            <input type="text" name="application_supplier_name" id="application_supplier_name">
          </label>
        </div>
        <div class="cell medium-4">
          <label for="application_hvn">Vendor Number
            <input type="text" name="application_hvn" id="application_hvn">
          </label>
        </div>
        <div class="cell medium-4">
          <label for="application_supplier_number">Supplier Number
            <input type="text" name="application_supplier_number" id="application_supplier_number">
          </label>
        </div>
        <div class="cell medium-4">
          <label for="application_sample_description">Sample Description
            <input type="text" name="application_sample_description" id="application_sample_description">
          </label>
        </div>
        <div class="cell medium-4">
          <label for="application_style_number">Style Number
            <input type="text" name="application_style_number" id="application_style_number">
          </label>
        </div>
        <div class="cell medium-4">
          <label for="application_upc_number">UPC Number
            <input type="text" name="application_upc_number" id="application_upc_number">
          </label>
        </div>
        <div class="cell medium-4">
          <label for="application_item_number">Item Number
            <input type="text" name="application_item_number" id="application_item_number">
          </label>
        </div>
        <div class="cell medium-4">
          <label for="application_factory_name">Factory Name
            <input type="text" name="application_factory_name" id="application_factory_name">
          </label>
        </div>
        <div class="cell medium-4">
          <label for="application_factory_number">Factory Number
            <input type="text" name="application_factory_number" id="application_factory_number">
          </label>
        </div>
        <div class="cell ">
          <div class="grid-x grid-margin-x">
            <div class="cell medium-4">
              <button class="button expanded greenbtn" id="search-apps-button">Search</button>
            </div>
          </div>
        </div>
      </form>
      <div><h4 id="info-message"></h4></div>
    </div>
    <div id="search-results-table" class="ag-theme-alpine cell"></div>
  </div>
  `;

  document.getElementById('app').innerHTML = search;
  const startDate = document.getElementById('disposition_start_date');
  const endDate = document.getElementById('disposition_end_date');

  flatpickr(startDate, {
      // enableTime: true,
      // mode: "range",
      dateFormat: "m-d-Y"
  });

  flatpickr(endDate, {
    dateFormat: "m-d-Y"
  })

  const expand = document.querySelector('.expander');
  expand.onclick = () => {
    expand.firstElementChild.classList.toggle('is-collapsed');
    document.querySelector('.search-apps').classList.toggle('is-showing');
  }
  
  const searchAppsButton = document.getElementById('search-apps-button');
  searchAppsButton.onclick = (e) => {
    e.preventDefault();
    document.getElementById('info-message').innerHTML = `<img src="images/dots.gif">`;

    let queryString = '';
    const formEntry = $(':input').serializeArray();
    const status = document.getElementById('disposition_status');

    if (status.value != '') {
      queryString += `disposition_status=${status.value}&`;
    }
    if (startDate.value != '') {
      let [month, day, year] = startDate.value.split('-');
      queryString += `disposition_start_month=${parseInt(month, 10)}&`;
      queryString += `disposition_start_day=${parseInt(day, 10)}&`;
      queryString += `disposition_start_year=${parseInt(year, 10)}&`;
    }

    if (endDate.value != '') {
      let [month, day, year] = endDate.value.split('-');
      queryString += `disposition_end_month=${parseInt(month, 10)}&`;
      queryString += `disposition_end_day=${parseInt(day, 10)}&`;
      queryString += `disposition_end_year=${parseInt(year, 10)}&`;
      queryString += `disposition_use_date=on`;
    }

    if (status.value == ''){
      $.each(formEntry, (i, field) => {
        if (field.value) {
          queryString += (field.name + '=' + field.value) + '&';
        }
      });
    }
    queryString = queryString.replace(/&\s*$/, "");

    const url = `/url/search/`;
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
      data: queryString,
      success: response => {
        if (response.length == 0) {
          document.getElementById('info-message').innerHTML = `No results found`;
          return;
        }
        if (response != null && response != 'undefined') {
          document.getElementById('info-message').innerHTML = '';
          expand.firstElementChild.classList.toggle('is-collapsed');
          document.querySelector('.search-apps').classList.toggle('is-showing');
          localStorage.setItem('searchApps', JSON.stringify(response));
          appsTable(response);
        }
      },
      error: error => {
        handleError(error);
      }
    });
  }
}

export function appsTable(data) {
  document.getElementById('info-message').innerHTML = '';
  const eGridDiv = document.querySelector('#search-results-table');
  eGridDiv.innerHTML = '';
  eGridDiv.style.display = 'block';
  
  let columnDefs = [];
  let headers = '';
  Object.values(data).forEach( e => {
    headers = Object.keys(e)

  })
  
  headers.forEach(element => {
    let colDefs = {
      headerName: element.split('_').join(' ').toUpperCase(),
      field: element,
      width: (element == 'sample_description' || element == 'app_id' ? 250 : 170),

    };
    if (element === 'app_id') {
      colDefs.pinned = 'left';
      colDefs.cellStyle = {
        backgroundColor: '#E0E0E0',
        fontWeight: 'bold',
        textAlign: 'center'
      };
      colDefs.cellRenderer = labCellRenderer;
      colDefs.autoHeight = false;
    }
    colDefs.autoHeight = true;
    colDefs.sortable = true;
    colDefs.resizable = true;
    columnDefs.push(colDefs)
  });

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: Object.values(data),
    pagination: true,
    paginationPageSize: 20,
    rowSelection: 'single',
    defaultColDef: {
      filter: true
    } 
  }

  new Grid(eGridDiv, gridOptions);

}

function labCellRenderer(params) {
  const returnVar = `
  <img width="32px" src="images/icon-appdetail.svg" class="projectAppDetail" project="${params.data.app_id}" title="App Detail">
  <img width="32px" src="images/icon-print.svg" class="printAppDetail" project="${params.data.app_id}" title="Print Application" form-name="${params.data.app_type}-${params.data.form_name}">
  <a class="projectLink" project="${params.data.app_id}" desc="${params.data.sample_description}" title="See Disposition History">${params.data.app_id}</a>`;
  return returnVar;
}
