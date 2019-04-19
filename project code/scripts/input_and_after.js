

function create_option_panel(audio_file){
    

    /*play the audio */
    var audio_ele_div=document.createElement("div");
    audio_ele_div.class="audio_input_div"
    audio_ele_div.id="audio_input_div_0"

    var audio_ele=document.createElement("audio");
    audio_ele.id="audio_input_0";
    //create a temporary url for the file dropped
    //and then use it as the src of audio element

    audio_ele.src= window.URL.createObjectURL(audio_file);
    audio_ele.crossOrigin = "anonymous";




    audio_ele.controls="controls";



    audio_ele_div.appendChild(audio_ele);
    document.body.appendChild(audio_ele_div);
    
    
    audio_parser(audio_file);
    
    

}


window.onload=function(){

    let input_div=document.getElementById("input_div_0");


    //drag over
    input_div.addEventListener("dragover", function(event) {
        event.preventDefault();
        input_div.style.backgroundColor="#156584";
    }, false);


    // on dropping
    input_div.addEventListener("drop", function(event) {
        
        event.preventDefault();

        //change style
        input_div.style.backgroundColor="#1e85ae";

        //get files dropped
        var dt = event.dataTransfer;
        var files = dt.files;

        

        //clear_input_div
        input_div.remove();

        

        create_option_panel(files[0]);


    }, false);

    //on leaving
    input_div.addEventListener("leave", function(event) {
        event.preventDefault();
        input_div.style.backgroundColor="#1e85ae";
    }, false);


}






