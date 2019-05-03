/*
create HTML elements

and

helpers
*/

function add_button(panel_div, btn_id, btn_panel_id, btn_value){
    var btn_div=document.createElement("div");
    btn_div.id=btn_id;
    panel_div.appendChild(btn_div);

    var panel_with_this_btn=document.createElement("div");
    panel_with_this_btn.id=btn_panel_id;
    panel_div.appendChild(panel_with_this_btn);

    
    btn_div.innerHTML+="<br/><hr/><br/>"
    btn_div.innerHTML+="<br><button id='"+ btn_id +"' class='feature_option'>"+ btn_value +"</button><br><br><br>";
   
    var this_btn=document.getElementById(btn_id);
    return {this_btn: this_btn,panel_with_this_btn: panel_with_this_btn};

}

function label_adder(parente,contents){
    var label=document.createElement("label");
    label.innerText=contents;
    parente.appendChild(label);
}






function getMax(data){

    var max_v=data[0];
    var i=0;
    for(i=0;i<data.length;i++){
        if(data[i]>max_v){
            max_v=data[i];
        }
    }
    return max_v;

}

function getMin(data){

    var min_v=data[0];
    var i=0;
    for(i=0;i<data.length;i++){
        if(data[i]<min_v){
            min_v=data[i];
        }
    }
    return min_v;

}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}



function draw_coord(c,ctx){

    // y=0
    ctx.beginPath();

    let mid_h=Math.ceil((c.height+1)/2);
    ctx.moveTo(0,mid_h);
    ctx.lineTo(i=c.width, mid_h);
    ctx.strokeStyle="red";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();

    //x=0
    ctx.beginPath();

    
    ctx.moveTo(0,0);
    ctx.lineTo(0,c.height);
    ctx.strokeStyle="red";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();

    
}

function draw_spec_coord(c,ctx,y_dB_zero,max_dB,d_range,left_padding){
    // y=0
    ctx.beginPath();

    
    ctx.moveTo(left_padding,c.height);
    ctx.lineTo(c.width, c.height);
    ctx.strokeStyle="red";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();

    //x=0
    ctx.beginPath();


    ctx.moveTo(left_padding,0);
    ctx.lineTo(left_padding,c.height);
    ctx.strokeStyle="red";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();


    //y_dB=0
    ctx.beginPath();


    ctx.moveTo(left_padding,y_dB_zero);
    ctx.lineTo(c.width,y_dB_zero);
    ctx.strokeStyle="blue";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();

    //y ruler
    ctx.beginPath();

    
    ctx.moveTo(left_padding,0);
    ctx.lineTo(left_padding+7, 0);
    ctx.strokeStyle="red";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();

    ctx.textBaseline="top";
    ctx.font="15px Arial";
    ctx.fillText(max_dB.toFixed(2)+" dB",0,0);  
    
    ctx.textBaseline="top";
    ctx.font="15px Arial";
    ctx.fillText((max_dB-d_range).toFixed(2)+" dB",0,c.height-15);  

    ctx.moveTo(c.width,c.height);
    ctx.lineTo(c.width, 0);
    ctx.strokeStyle="red";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();
    


}

