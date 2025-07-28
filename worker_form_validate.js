

//--------------validate worker infomation---------------------//
var workerForm = document.getElementById("workerForm");
var first_name = document.getElementById("id_first_name");
var photoError = document.getElementById("photo-error")


workerForm.addEventListener('submit', (e)=>onFormSubmit(e));

function onFormSubmit(e){
    
    if(!workerForm.checkValidity()){

        e.preventDefault();

        workerForm.reportValidity();

        const requiredInputs = workerForm.querySelectorAll('[required]');

        requiredInputs.forEach(input => {

            if(input.type === 'select-one' && input.value === ''){
                setErrorStyle(input, 'Please select an option.');
            } else if (input.value.trim() === '') {
                setErrorStyle(input, 'This field is required.');
            } else {
                clearErrorStyle(input);
            }
        });

        console.log('Form is invalid. Please fill in all required fields.');


    }
   


}

function setErrorStyle(element, message) {
    element.style.borderColor = 'red'; // Example: Red border
    element.style.boxShadow = '0 0 5px rgba(255, 0, 0, 0.5)'; // Example: Red shadow
    
    if(element.getAttribute('name') == 'photo'){
        photoError.classList.remove("hidden");
        photoError.textContent = message
     
    }


    // Add an error message label
    let errorLabel = document.getElementById(element.id + '-error');
    if (!errorLabel) {
        errorLabel = document.createElement('span');
        errorLabel.id = element.id + '-error';
        element.parentNode.insertBefore(errorLabel, element.nextSibling);
    }
    errorLabel.textContent = message;
    errorLabel.style.color = 'red';
    errorLabel.style.fontSize = '0.8em';
}

function clearErrorStyle(element) {
    element.style.borderColor = ''; // Remove border color
    element.style.boxShadow = ''; // Remove shadow

    // Remove error message label if exists
    const errorLabel = document.getElementById(element.id + '-error');
    if (errorLabel) {
        errorLabel.remove();
    }
}

var fieldPhtoto = document.getElementById("id_photo")
fieldPhtoto.addEventListener('change', (e)=>vaidateImageType(e, "Image type not allowed"))

function vaidateImageType(e, message){

    const allowedImageTypes = ['jpeg', 'jpg','png', 'gif', 'bmp'];
    const selectedFile = e.target.files[0];
    const extArr = selectedFile.name.split('.')
    const extention = extArr[extArr.length - 1]
    console.log(extention)

    if (allowedImageTypes.includes(extention)) {
        console.log('Allowed image type.');
        photoError.classList.add("hidden");
        photoError.textContent = ""
    } else {
        console.log('Disallowed image type.');
        photoError.classList.remove("hidden");
        photoError.textContent = message
    }
}
