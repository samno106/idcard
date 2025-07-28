//-----------  Calculate age by dob---------------//
// 1. declear variables
var dob = document.getElementById("id_dob");
var ageResult = document.getElementById("ageResult");
var ageLabel = document.querySelector('label[for="ageResult"]');
// 2. triger dob input date
dob.addEventListener("change", (e)=>calculateAge(e.target.value));
// 3. create function for calculate age by dob
function calculateAge(dob){
    
    //declar var
    const birthDate = new Date(dob);
    const today = new Date();

    //start calculate
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate()
      // Adjust age if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    //set value to input
    ageResult.value = age;
    //check age allowed
    if(!checkAgeAllow(age)){
        toggleCssClass(ageResult, ["text-red-500" ],"add")
        toggleCssClass(ageLabel, ["text-red-500"], "add")
    }else{
        toggleCssClass(ageResult, ["text-red-500" ],"remove")
        toggleCssClass(ageLabel, ["text-red-500"], "remove")
    }

}

// create function to check age allow
function checkAgeAllow(age){
    if (age >=18){
        return true;
    }
    return false;
}

//------------validate phone number formate --------------//
// 1. declear variables
var phoneNumber = document.getElementById("id_phone_number");
var phoneNumberLabel = document.querySelector('label[for="id_phone_number"]');
// 2. triger phone number input
phoneNumber.addEventListener("change", (e)=>formatPhoneNumber(e.target.value))

// 3. create function to check format phone number
function formatPhoneNumber(phone){

    //declare result
    let isvalid = true;
    let result = phone;
    // Remove non-digit characters
    let digits = phone.replace(/\D/g, '');

    // Convert leading '0' to '+855' if needed
    if (digits.startsWith('0')) {
        digits = '855' + digits.slice(1);
    }

    // Remove leading country code if already formatted with +
    if (digits.startsWith('855')) {
        const prefix = digits.slice(3, 5); 
        const middle = digits.slice(5, 8);
        const last = digits.slice(8);

        result = `+855 ${prefix} ${middle} ${last}`;
    }

    const normalized = digits.startsWith('855') ? '0' + digits.slice(3) : digits;

    
    
    if (!/^0\d{8}$/.test(normalized)) {
        isvalid = false;
      }

    //validate phone 
    if(!isvalid){
        toggleCssClass(phoneNumber,["text-red-500"], "add");
        toggleCssClass(phoneNumberLabel,["text-red-500"], "add");
    }else{
        toggleCssClass(phoneNumber,["text-red-500"], "remove");
        toggleCssClass(phoneNumberLabel,["text-red-500", "remove"]);
    }

    phoneNumber.value = result;

}


//------- worker information ------------------//
//1. declaer var
var zon = document.getElementById("id_zone");
var building = document.getElementById("id_building");
var floor = document.getElementById("id_floor");
//2. disabled select on window load and trigger select
window.addEventListener('DOMContentLoaded', function(){
    toggleAttr(building,"disabled","add");
    toggleAttr(floor, "disabled", "add")
});

// on zon trigger
zon.addEventListener('change', (e)=>onUpdateBuilding(e.target.value))
// on building trigger
building.addEventListener('change', (e)=>onUpdateFloor(e.target.value))

//3. create functio for trigger
function onUpdateBuilding(zoneId){
   
    // Use AJAX to get fresh building data to ensure consistency
    fetch('/zone/ajax/get-buildings-by-zone/?zone_id=' + zoneId)
    .then(response => response.json())
    .then(data => {

        building.innerHTML = '<option value="">Select Building</option>';
        
        if (data.buildings && data.buildings.length > 0) {

            data.buildings.forEach(build => {
                const option = document.createElement('option');
                option.value = build.id;
                option.textContent = build.name;
                if (option.text === "{{ worker.building.name}}") {
                    option.selected = true;
                    updateFloorOptions(option.value);
                }
                building.appendChild(option);
            });

            toggleAttr(building, "disabled", "remove")

            

        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No buildings available for this zone';
            option.disabled = true;
            building.appendChild(option);
            toggleAttr(building, "disabled", "add")
            toggleAttr(floor, "disabled", "add")
        }
    })
    .catch(error => {
        console.error('Error fetching buildings:', error);
        // Fallback to static data if AJAX fails
       
    });

}

function onUpdateFloor(buildingId){

    floor.innerHTML = '<option value="">Loading floors...</option>';

    fetch('/zone/ajax/get-floors-by-building/?building_id='+buildingId)
    .then(response => response.json())
    .then(data => {

        floor.innerHTML = '<option value="">Select Floor</option>';

        if (data.floors && data.floors.length > 0) {

            data.floors.forEach(flr => {
                const option = document.createElement('option');
                option.value = flr.id;
                option.textContent = flr.name;
                if (option.value === "{{ worker.floor.id}}") {
                    option.selected = true;
                }

                floor.appendChild(option);
            });

            toggleAttr(floor, "disabled", "remove")

        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No floors available for this building';
            option.disabled = true;
            floor.appendChild(option);
            floor.disabled = true;
           
        }
    })
    .catch(error => {
        console.error('Error fetching floors:', error);
        floor.innerHTML = '<option value="">Error loading floors</option>';
        floor.disabled = true;
    });
    console.log("BuildingId ID=> ",buildingId)
}




//disable 
function displayUploadImagePreview(e){

    if(isScanning == false){
        //set loading
	extractLoading.style.display = "block";
    toggleCssClass(textLoading, ["hidden"], "remove")

    let file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    let url = window.URL.createObjectURL(file);
    documentImage.src= url;
    documentImage.style.display = "block";
    documentImageIcon.style.display="none";

    //call passport OCR API to extract data
    fetch('/zone/workers/ocr/image/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // image doc
        documentImage.src = url;
        documentImageIcon.style.display = "none";
        documentImage.style.display = "block";

        console.log("My Data =>", data)
        //set loading
        extractLoading.style.display = "none";
        toggleCssClass(textLoading, ["hidden"], "add")

        //doc no
        docNo.value = data.data[12].toString();

        //doc type
        docType.value = data.data[25].toString().toLowerCase();
        console.log("docType", docType.value)

        //issue authority
        docIssueAuthority.value = data.data[4].toString();

        //issues date
        docIssueDate.value = formatToMMDDYYYY(data.data[17].toString());
        // issueDateError.innerHTML = formatToMMDDYYYY(data.data[17].toString());

        //expired date
        docExpiryDate.value = formatToMMDDYYYY(data.data[19].toString());
        // expiryDateLabelError.innerHTML = formatToMMDDYYYY(data.data[19].toString());
        //check expiry date
        var expiryDate = new Date(docExpiryDate.value);
        var today = new Date();
        if(expiryDate < today){

            docExpiryDate.value =null;
            docExpiryDate.style.color = "red";
            docExpiryDate.style.fontWeight = "bold";
            docExpiryDate.style.border = "1px solid red";
            docExpiryDate.style.textAlign = "left";
            expiryDateLabelError.innerHTML = " ( Expiry date is expired ) ";
            expiredDateError.classList.remove("hidden");
            btnCreateWorker.setAttribute("disabled", "disabled");
            btnCreateWorker.classList.add("disabled");
            return;
        }else{
            docExpiryDate.value = text["Date of Expiry"];
            expiryDateLabelError.innerHTML = "";
            expiredDateError.classList.add("hidden");
            btnCreateWorker.setAttribute("disabled");
            btnCreateWorker.classList.remove("disabled");
        }

        

    })
    .catch(error => {
        console.log("error", error)
        //set loading
        extractLoading.style.display = "none";
    });

    return;

    }
    
    let file = e.target.files[0];
    let url = window.URL.createObjectURL(file);
    documentImage.src= url;
    documentImage.style.display = "block";
    documentImageIcon.style.display="none";
}








//create dynamic css classes 
function toggleCssClass(elm, className, option){
    if(option==="add"){
        return elm.classList.add(...className);
    }else{
        return elm.classList.remove(...className);
    }
    
}

//create dynamic css classes 
function toggleCssStyle(elm, style){
   return elm.style=style;
}
//create dynamic attribute
function toggleAttr(elm, attr, option){
    if(option ==="add"){
        return elm.setAttribute(attr,attr)
    }else{
        return elm.removeAttribute(attr)
    }
}
