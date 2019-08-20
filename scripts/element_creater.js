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

function label_adder(parente,forwhom,contents){
    var label=document.createElement("label");
    label.className="checkbox_label";
    label.htmlFor=forwhom;
    label.innerText=contents;
    parente.appendChild(label);
}

function two_cols_tr(ptable,th,td){
    var tr1=document.createElement("tr");
    tr1.innerHTML+="<th>"+th+"</th>"+"<td>"+td+"</td>";
    ptable.appendChild(tr1);
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

function Round(a){
    a= Math.floor(a*100)/100;
    return a;
}

function draw_spec_coord(c,ctx,y_dB_zero,max_dB,d_range,left_padding,right_padding,top_padding,bottom_padding,f_max,title){
    var actual_height=c.height-bottom_padding-top_padding;
    var graph_bottom=c.height-bottom_padding;
    var actual_width=c.width-left_padding-right_padding;
    var graph_rightest=c.width-right_padding;

    // y=0 (mathmatic coord)
    ctx.beginPath();

    
    ctx.moveTo(left_padding,graph_bottom);
    ctx.lineTo(c.width-right_padding, graph_bottom);
    ctx.strokeStyle="grey";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();

    // top y line
    ctx.beginPath();

    
    ctx.moveTo(left_padding,top_padding);
    ctx.lineTo(graph_rightest, top_padding);
    ctx.strokeStyle="grey";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();

    //x=0
    ctx.beginPath();


    ctx.moveTo(left_padding,top_padding);
    ctx.lineTo(left_padding,graph_bottom);
    ctx.strokeStyle="grey";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();




    //x right line
    ctx.moveTo(graph_rightest,top_padding);
    ctx.lineTo(graph_rightest,graph_bottom);
    ctx.strokeStyle="grey";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();


    // y ruler
    var counter_y=0;
    for(var i=top_padding;i<=actual_height+top_padding;){
        var db_bin=actual_height/10;
        var db_bin_value=d_range/10;

        ctx.beginPath(); 
        ctx.moveTo(left_padding,i);
        ctx.lineTo(left_padding-12, i);
        ctx.strokeStyle="grey";
        ctx.globalCompositeOperation="source-over";
        ctx.stroke(); 
        ctx.closePath();

        ctx.beginPath(); 
        ctx.moveTo(left_padding,i);
        ctx.lineTo(graph_rightest, i);
        ctx.strokeStyle="#D8D8D8";
        ctx.globalCompositeOperation="source-over";
        ctx.stroke(); 
        ctx.closePath();

        ctx.textBaseline="top";
        ctx.font="15px Arial";
        ctx.fillText((max_dB-counter_y*db_bin_value).toFixed(2)+" dB",left_padding-80,i); 
        counter_y++;
        i+=db_bin; 

    }

    

    //x ruler
    ctx.beginPath(); 
    ctx.moveTo(c.width-right_padding,actual_height);
    ctx.lineTo(c.width-right_padding,actual_height+12);
    ctx.strokeStyle="grey";
    ctx.globalCompositeOperation="source-over";
    ctx.stroke(); 
    ctx.closePath();

    ctx.textBaseline="top";
    ctx.font="15px Arial";
    ctx.fillText((f_max/1000).toFixed(2)+" kHz",graph_rightest-20,graph_bottom+13); 
    

    var counter=0;
    var scale_num=actual_width/64;
    for(var i=left_padding;i<left_padding+actual_width;){
        var coord_bin=64;
        var coord_bin_freq=f_max/scale_num/1000;
        
        

        ctx.beginPath(); 
        ctx.moveTo(i,graph_bottom);
        ctx.lineTo(i,graph_bottom+12);
        ctx.strokeStyle="grey";
        ctx.globalCompositeOperation="source-over";
        ctx.stroke(); 
        ctx.closePath();

        ctx.beginPath(); 
        ctx.moveTo(i,graph_bottom);
        ctx.lineTo(i,top_padding);
        ctx.strokeStyle="#D8D8D8";
        ctx.globalCompositeOperation="source-over";
        ctx.stroke(); 
        ctx.closePath();
        
        ctx.textBaseline="top";
        ctx.font="15px Arial";
        ctx.fillText((coord_bin_freq*counter).toFixed(2),i-15,graph_bottom+13);
        i+=coord_bin;
        counter++; 
    }
    

    //title
    ctx.textBaseline="top";
    ctx.textAlign="center";
    ctx.font="bolder 20px Arial ";
    ctx.fillText(title,Math.ceil(left_padding+actual_width/2),top_padding-25);
    
    



}

function add_loader(parent){
    /*
    <div id="fade">
                
    </div>
    <div id="modal">
            <img id="loader" src="./styles/loading.gif" />
    </div>
        */
    var fade = document.createElement("div");
    fade.id="fade";

    var modal = document.createElement("div");
    modal.id="modal";

    var img = document.createElement("img");
    img.id="loader";
    img.src="./styles/loading.gif";
    modal.appendChild(img);

    parent.appendChild(fade);
    parent.appendChild(modal);


    
}


function openModal() {
    //console.log("open modal called");
    document.getElementById('modal').style.display = 'block';
    document.getElementById('fade').style.display = 'block';
    
}

function closeModal() {
    //console.log("close modal called");
    document.getElementById('modal').style.display = 'none';
    document.getElementById('fade').style.display = 'none';
}