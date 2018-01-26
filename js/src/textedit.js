
var textDomElements = {
    wrapper: undefined,
    inputDiv: undefined,
    button: undefined
};


var _onCompleteCallback;

function showTextBox(mouseCoords, onCompleteCallback){
    //move a contenteditable div to the coordinates specified

    
    textDomElements.wrapper.style.padding = TEXT_EDIT_STYLING.padding + 'px';
    textDomElements.wrapper.style.borderWidth = TEXT_EDIT_STYLING.borderWidth + 'px';
    textDomElements.inputDiv.style.fontSize = TEXT_EDIT_STYLING.fontSize + 'px';
    
    textDomElements.wrapper.style.display = 'block';
    
    textDomElements.wrapper.style.left = mouseCoords.x + 'px';
    textDomElements.wrapper.style.top = mouseCoords.y + 'px';


    textDomElements.inputDiv.innerText = '';
    textDomElements.inputDiv.contentEditable = true;


    _onCompleteCallback = onCompleteCallback;


    textDomElements.inputDiv.focus();
}

function onTextboxButtonClick(){
    textDomElements.inputDiv.contentEditable = false;

    if(typeof _onCompleteCallback === 'function'){
        var wrapperRect = textDomElements.wrapper.getBoundingClientRect();

        var inputRect = textDomElements.inputDiv.getBoundingClientRect();

        var text = textDomElements.inputDiv.innerText;
        _onCompleteCallback(text, wrapperRect.width, wrapperRect.height);

        //hide the box now

        textDomElements.wrapper.style.display = 'none';
    }
}


function selectDomElements(){
    textDomElements.wrapper = document.querySelector('#text-input-wrapper');
    textDomElements.inputDiv = document.querySelector('#text-input');
    textDomElements.button = document.querySelector('#text-input-done');
}
function addEventListeners(){
    textDomElements.button.addEventListener('click', onTextboxButtonClick);
}

function init(){
    selectDomElements();
    addEventListeners();
}

init();