require("expose-loader?$!jquery");
import './vendor/what-input';
import './vendor/foundation.min';

// Layout components
import Header from '../components/header/header.html';
import Footer from '../components/footer/footer.html';
import Sidebar from '../components/sidebar/sidebar.html';
import home from '../components/home/home.html';

//Dynamic components and functions
import {token, checkToken} from '../components/login/login';
import {searchAppsPage, appsTable} from '../components/searchApps/search-apps';
import {appLookup} from '../components/appDetail/app-detail';
import {handleError} from './handleError';

//All Styles
import '../sass/app.scss';

//Initiate Foundation
$(document).foundation();

// load all main page components
document.getElementById('header').innerHTML = Header;
document.getElementById('footer').innerHTML = Footer;
document.getElementById('sidebar').innerHTML = Sidebar;
// document.getElementById('app').innerHTML = home;
searchAppsPage();

//Login, get footer dates ready
checkToken();
const formattedDate = new Date();
document.getElementById('daYear').innerHTML = formattedDate.getFullYear();

// sidebar nav events
document.addEventListener('click', e => {
  if (e.target.id === 'home') {
    document.getElementById('app').innerHTML = home;
  }

  if (e.target.id === 'search') {
    searchAppsPage();
  }

  if (e.target.id === 'app-detail') {
    appLookup();
  }
})

$('#sidebar-toggle').click( () => {
  $("#sidebar, #app").toggleClass('closed');
  $('.search-apps-title, .app-detail-title').toggleClass('sidebar-closed');
  $('.tabs-title a img').toggleClass('float-right');
});

$('body').on('click', '#go-back-button', function () {
  const tableData = JSON.parse(localStorage.getItem('searchApps'));
  searchAppsPage();
  appsTable(tableData);
});

$('body').on('click', '.projectAppDetail', function () {
  const projectLink = $(this).attr('project');
  appLookup(projectLink);
  $('#go-back-button').removeClass('hide');
});

$('body').on('click', '.printAppDetail', function() {
  const appId = $(this).attr('project');
  const printType = $(this).attr('form-name');
  appLookup(appId, printType, event='grid-print')
});

$('body').on('click', '.projectLink', function () {
  const dispositionModal = new Foundation.Reveal($('#dispositionModal'));
  const projectLink = $(this).attr('project');
  const projectDesc = $(this).attr('desc');

  $.ajax({
    method: 'GET',
    url: './url?app_id=' + projectLink,
    xhrFields: {
      withCredentials: true,
    },
    contentType: "application/json",
    headers: {
      'Authorization': token
    },
    success: response => {
      const app = JSON.parse(response);
      
      if (app.status == 500) {
        throw new Error("There was a server error processing your request. Please try again");
      }else if (app.status != 200) {
        handleError(app);
      } else {
        const {data} = app;
        if (data == null || data == undefined || data == '') {
          document.getElementById('info-message').innerHTML = 'No results for that ';
          return;
        }

        if (data != null && data != 'undefined') {
          let dispositionModalBody = '';
          data.forEach(e => {
            dispositionModalBody += `
              <tr>
                <td>${e.datetime == '' ? '' : e.datetime}</td>
                <td>${e.disposition}</td>
                <td>${e.lab_number == '' ? '' : e.lab_number}</td>
                <td>${e.express == 0 ? '' : e.express}</td>
                <td>${e.due_date == '' ? '' : e.due_date}</td>
              </tr>
            `;
          });
          $('#disposition-modal-title').html(`(${projectLink}) ${projectDesc}`);
          $('#disposition-modal-body').html(dispositionModalBody);
          dispositionModal.open();
        }
      }
    },
    error: error => {
      handleError(error);
    }
  });
});
