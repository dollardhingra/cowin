var dateField = document.getElementById('date');
var age18 = document.getElementById('18+');
var date = document.getElementById('date');
var results = document.getElementById('results');
var state = document.getElementById('state');

var DISTRICT = $("input[type='radio'][name='district']:checked").val();

var states = {
    "Andaman and Nicobar Islands": 1,
    "Andhra Pradesh": 2,
    "Arunachal Pradesh": 3,
    "Assam": 4,
    "Bihar": 5,
    "Chandigarh": 6,
    "Chhattisgarh": 7,
    "Dadra and Nagar Haveli": 8,
    "Daman and Diu": 37,
    "Delhi": 9,
    "Goa": 10,
    "Gujarat": 11,
    "Haryana": 12,
    "Himachal Pradesh": 13,
    "Jammu and Kashmir": 14,
    "Jharkhand": 15,
    "Karnataka": 16,
    "Kerala": 17,
    "Ladakh": 18,
    "Lakshadweep": 19,
    "Madhya Pradesh": 20,
    "Maharashtra": 21,
    "Manipur": 22,
    "Meghalaya": 23,
    "Mizoram": 24,
    "Nagaland": 25,
    "Odisha": 26,
    "Puducherry": 27,
    "Punjab": 28,
    "Rajasthan": 29,
    "Sikkim": 30,
    "Tamil Nadu": 31,
    "Telangana": 32,
    "Tripura": 33,
    "Uttar Pradesh": 34,
    "Uttarakhand": 35,
    "West Bengal": 36
}
var districts = {};

function getDate() {
    const d = dateField.value;
    return d.split('-').reverse().join('-')
}

function getAge() {
    return age18.checked ? 18 : 45;
}

function setStates() {
    for (const s in states) {
        var opt = document.createElement('option');
        opt.value = states[s]
        opt.text = s
        state.appendChild(opt)
    }
}

function setDistricts(d = null) {
    var req = new XMLHttpRequest();
    const url = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state.value}`
    req.open('GET', url, true);
    req.responseType = 'json';
    req.onload = function () {
        var status = req.status;
        if (status === 200) {
            clearDistricts();
            districts = req.response.districts;
            for (const d of districts) {
                addDistricts(d)
            }
        }
    };
    req.send();
}

function clearDistricts() {
    $("#div_radios").empty()
}

function addDistricts(d = null) {
    $('#div_radios').append('<input class="btn-check" onclick="onDistrictSelect(this);" type="radio" id="'+d.district_id+'" name="district" value="'+d.district_id+'"><label style="margin: 2px;" class="btn btn-sm btn-outline-primary" for="'+d.district_id+'">'+d.district_name+'</label>');
}


function get(callback) {
    var req = new XMLHttpRequest();
    const district_id = DISTRICT;
    const date = getDate();
    const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${date}`;
    req.open('GET', url, true);
    req.responseType = 'json';
    req.onload = function () {
        var status = req.status;
        if (status === 200)
            callback(null, req.response);
        else
            callback(status, req.response);
    };
    req.send();
}

function check() {
    if (state.value === "-" || DISTRICT === undefined) {
        alert("Select State/District.");
        return
    }
    get((err, res) => {
        if (err) return alert(`Error: ${err}`)
        const date = getDate();
        const age = getAge();
        let count = 0;
        const available = res.centers.filter(center => {
            count += center.sessions[0].min_age_limit === age;
            return center.sessions.some(s => (s.available_capacity > 0 && s.min_age_limit === age))
        });
        const template = center => `
            <div class="p-1" style="border: 1px solid black">
                <b>${center.name}, Pincode: ${center.pincode}</b><br>
                ${center.sessions.filter(s => s.available_capacity > 0).map(s => s.date + ': ' + s.available_capacity).join('<br>')}<br>
            </div>
        `;

        if (available.length === 0) {
            results.innerHTML = `<div id="result_msg" class="alert alert-danger">Found ${count} centers listed for ${age}+ age group in your district</div>`
            results.innerHTML += `<div>All ${age}+ vaccine centers are fully booked<br>Please keep checking for updates</div>`
        } else {
            results.innerHTML = `<div id="result_msg" class="alert alert-success">Found <b>${count} centers</b> listed for ${age}+ age group in your district, out of which <b>${available.length} centers</b> have available slots, head over to the <b><a href="https://selfregistration.cowin.gov.in/" target="_blank">official CoWIN website</a></b> to book the slot</div>`
            results.innerHTML += available.map(c => template(c)).join(' ')
        }
        document.getElementById("result_msg").scrollIntoView();
    })
}

state.onchange = () => {
    localStorage.setItem('state', state.value)
    setDistricts()
}


window.onload = () => {
    const s = localStorage.getItem('state')
    const d = localStorage.getItem('district')
    setStates();
    if (s) {
        state.value = s;
        setDistricts(d);
    }
    date.valueAsDate = new Date();

}

function onDistrictSelect(district_id){
    DISTRICT = district_id.value;
    check();
}

