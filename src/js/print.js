require("expose-loader?$!jquery");
const JsBarcode = require('jsbarcode');
// import {labAddresses, useAddress} from '../js/lab-addresses';

//All Styles
import '../sass/app.scss';

const urlParams = window.location.search.substr(1);
const rawParams = urlParams.split('&');
const paramsArr = {};

rawParams.forEach(function(itm) {
    let tmpArr = itm.split('=');
    paramsArr[tmpArr[0]] = tmpArr[1];
    JsBarcode('#barcode', paramsArr.appid, {
        format: 'code39',
        width: 2,
        height: 40
    })
});

const printAppData = JSON.parse(localStorage.getItem('appDetail'));
const {record} = printAppData;

// const nvaSplit = ['supplier_name','supplier_address','supplier_address_city_state_zip','billing_company_name', 'billing_address_1','billing_address_city_state_zip'];
// const fwCompo = ['shoe_sole_supplier','sock_material_notes','shoe_lining_supplier','shoe_accessories_notes','sock_material_supplier','shoe_insole_board_notes','shoe_sole_material_notes','shoe_accessories_supplier','shoe_upper_material_notes','shoe_insole_board_supplier','shoe_lining_material_notes','shoe_upper_material_supplier',''];

   
const additionalOptions = ["retest", "additional_size", "additional_color", "additional_style", "additional_screen", "new_store", "textile_quality_program"],
    additionalOptionText = [];
if (record.form_name == "bluestem-general") {
    $('.' + (record.ind_test_other_notes == 'flammability' ? 'otherTests' : 'flammability')).remove();
    //prop65 handling
    const prop65 = ["ind_test_bbi", "ind_test_light", "ind_test_other"];
    prop65.forEach(function(p) {
        if (typeof record[p] != 'undefined') {
            $('#table-data').find('.' + p).removeClass('fa-square').addClass('fa-check-square');
        }
    });
}

for (let key in record) {
    // if (record[key] != null && record[key].indexOf(", ") == -1 && record[key].indexOf(",") != -1) {
    //     record[key] = record[key].split(",");
    // }
    // if (fwCompo.indexOf(key) != -1) {
    //     record[key] = JSON.parse(record[key]);
    // }
    if (typeof record[key] == 'object') {
        $('#table-data').find('#' + key).html('');
        $.each(record[key], function(idx, val) {
            $('#table-data').find('#' + key).append('&bull; ' + val + '<br>');
        });
    } else if (key == 'express') {
        const expressVal = {
            '1': '1 Day',
            '1day': '1 Day',
            '2': '2 Day',
            '2day': '2 Day',
            'exp': 'Express - 5 Days',
            'no': '',
            'shu': 'Shuttle - 3 Days',
            'yes': 'Express'
        }
        $('.expresshd, #express').html((typeof expressVal[record[key]] == 'undefined' ? record[key] : expressVal[record[key]]));
    } else {
        if (typeof record[key] == 'string') {
            const valString = record[key].replace(/\,\[\n]\;/g, ', <br>');
            $('#table-data').find(`#${key}`).html(valString);
        } else {
            $('#table-data').find(`#${key}`).html(record[key]);
        }
    }
}

if (typeof record.target_market == 'undefined') {
    const tm = (typeof record.client != 'undefined' ? record.client : '') + (typeof record.client_country != undefined && record.client_country != '' ? '*' + record.client_country : '');
    $('#target_market').html(tm);
}


additionalOptions.forEach(function(ao) {
    if (typeof record[ao] != 'undefined') {
        additionalOptionText.push(titleCase(ao.replace(/_/g, " ")));
    }
});

$('#additionalOptions').text(additionalOptionText.toString().replace(/,/g, ", "));

if ($('#ind_test_trim_components').is(':checked')) {
    $('#trim_comp').removeClass('hidden');
}

//handle lab addresses
let addressArray = useAddress[record.app_type + '-' + record.form_name];
let addrContent = '';
let addrCntr = 0;

if (record.form_name == 'softlines' && record.app_type == 'trf') {
    if (record.sample_type == 'Supplier Only Vendor Testing') {
        addressArray = ['USSL', 'Bang', 'HongKongSL', 'Canada'];
    } else if (record.sample_type.indexOf('Size/Fit') != -1) {
        addressArray = ['Canada'];
    }
}

if (record.form_name == 'hardlines' && record.app_type == 'trf') { // show testing options divs
    record.subform.split(",").forEach(function(itm) {
        $('#' + itm + '_print').show();
    });

    if (record.child_full_test == 'Choose Individually') {
        $('.addlChildRow').show();
    } else {
        $('.addlChildRow').hide();
    }
}

addressArray.forEach(function(dt) {
    addrContent += '<td valign="top" class="sendto text-center" width="' + (record.form_name == 'expedited-compliance' ? '20' : '25') + '%">' + (addrCntr == 0 || labAddresses[dt].indexOf('img') != -1 ? '' : '<img src="images/or.png" style="height: 100%;" align="left">') + labAddresses[dt] + '</td>';
    addrCntr++;
});
$('#addressRow').html(addrContent);

//files section
$('#table-data').find('#filesDiv').html('<b>Attached Files</b>: ');

record.files.forEach(function(itm) {
    $('#table-data').find('#filesDiv').append(itm.file_name + "<br>");
});

const printDate = new Date();
$('#printDate').html(printDate);
