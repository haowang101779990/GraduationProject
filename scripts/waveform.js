function waveform(audio_buffer,zoom_ratio,zoom_start){
    /*
    zoom_ratio: in  80%= 0.8
    zoom_start: in seconds
    */
    console.clear();
    // console.log(audio_buffer.getChannelData(0));
    var PCMData=audio_buffer.getChannelData(0);
    var audioDuration=audio_buffer.duration;
    var audioSampleRate=audio_buffer.sampleRate;
    var Max=getMax(PCMData);
    var Min=getMin(PCMData);
    console.log("min:"+Min);
    console.log("max:"+Max);
    console.log("Duration:" + audioDuration);
    console.log("Sampling Rate:"+ audioSampleRate);

    /*
     -div :auto, that makes canvas scrollable if it overflows
        -canvas
        -p : cursor infor
        -p : wf infor
    */
   var wf_canvas_div=document.createElement('div');
   wf_canvas_div.id="wf_canvas_div";
   wf_canvas_div.style.overflow="auto";

   
   // canvas ctx
   var c = document.createElement("canvas");
   c.width=2000;
   c.height=300;
   var ctx = c.getContext("2d");
  

    wf_canvas_div.appendChild(c);

    
   
    
    
    

    //clear existing things
    ctx.clearRect(0, 0, c.width, c.height);

    draw_coord(c,ctx);
    
    /*

    zoom ratio will shorten the displayed audio duration to fit the canvas
    thus the displayed PCMData will be shortened

    */

    var displayed_duration=(audioDuration-zoom_start) * zoom_ratio;
    var zoom_start_pos=Math.ceil((zoom_start/audioDuration)*PCMData.length); // however the zoom start point should in whole audio file context
    var PCMData_to_draw=PCMData.slice(zoom_start_pos, zoom_start_pos+zoom_ratio*PCMData.length);
    console.log(PCMData_to_draw);
    
    

    console.log("Displayed Duration sec:"+displayed_duration+" From sec:"+ zoom_start);


    /*

      calculate samples per pixel and will compress them as [min, max] strokes
      in the drawer loop

    */

    var total_samples= displayed_duration*audioSampleRate;
    var SamplesPerPixel_float=(total_samples)/c.width;
    console.log("SamplesPerPixel_raw:"+SamplesPerPixel_float);
    var SamplesPerPixel=Math.ceil(SamplesPerPixel_float);
    console.log("SamplesPerPixel:"+SamplesPerPixel);


    var pixel_values=[];
    
    var last_minPixel=0;

    for(var i=0;i<c.width;i++){
        
        let range_this_pixel=PCMData_to_draw.slice(SamplesPerPixel*i,SamplesPerPixel*(i+1));
        
        //console.log(range_this_pixel);
        var local_min=getMin(range_this_pixel);
        var local_max=getMax(range_this_pixel);

        //for drawing, I need to get its symmetric one based on axis x=0
        local_min=0-local_min;
        local_max=0-local_max;

        //console.log("pixel "+i+" range:"+ local_max);

        pixel_values.push(0-local_max);


        let drawHeight=c.height/2;

        let minPixel=local_min*drawHeight+drawHeight;
        
        let maxPixel=local_max*drawHeight+drawHeight;

        if(minPixel==maxPixel){
            maxPixel+=1;
        }

        
        ctx.beginPath();
        ctx.strokeStyle="black";
        ctx.moveTo(i, minPixel);
        ctx.lineTo(i, maxPixel);
        ctx.stroke(); 

        //smooth the gap
        if(i!=0){
            ctx.beginPath();
            ctx.strokeStyle="black";
            ctx.moveTo(i-1, last_maxPixel);
            ctx.lineTo(i, minPixel);
            ctx.stroke(); 
            ctx.closePath();
        }

        last_maxPixel=maxPixel;
        

        

        

    }

    wf_canvas_div.appendChild(document.createElement("p"));
    
    var cursor_infor=document.createElement("div");
    var cursor_infor_table=document.createElement("table");
    cursor_infor_table.className="cursor_infor_table";
        
        two_cols_tr(cursor_infor_table,"Current Time",0);
        two_cols_tr(cursor_infor_table,"Current Amplitude",0);
        
    cursor_infor.appendChild(cursor_infor_table);
    wf_canvas_div.appendChild(cursor_infor);

    /*
    click, display the amplitude
    */
    c.onclick=function(e){
        let pos=getMousePos(c,e);
        let time_offset=(pos.x/c.width)*displayed_duration;
        let time=zoom_start/1+time_offset;
        let index_offset=Math.ceil((pos.x/c.width)*pixel_values.length);

        let tds=cursor_infor_table.querySelectorAll("td");

        tds[0].innerHTML=time.toFixed(2);
        tds[1].innerHTML=pixel_values[index_offset].toFixed(2);
    }



    wf_canvas_div.appendChild(document.createElement("p"));
    
    var wf_infor=document.createElement('div');
    var wf_infor_table=document.createElement("table");
    
        
        two_cols_tr(wf_infor_table,"zoom ratio",zoom_ratio);
        two_cols_tr(wf_infor_table,"min amplitude",Min);
        two_cols_tr(wf_infor_table,"max amplitude",Max);
        two_cols_tr(wf_infor_table,"Sampling Rate",audioSampleRate);
        two_cols_tr(wf_infor_table,"Displayed Duration",displayed_duration+" From sec:"+ zoom_start)

    wf_infor.appendChild(wf_infor_table);
    wf_canvas_div.appendChild(wf_infor);
    
    
    
    /*
    a button to remove the current canvas
    */
    var wf_clear_btn_p=document.createElement("p");
    var wf_clear_btn=document.createElement('input');
    wf_clear_btn.type="button";
    wf_clear_btn.className="sub_feature_option";
    wf_clear_btn.value="Clear this graph";
    wf_clear_btn.onclick=function(){
        document.getElementById("wf_panel").innerHTML="";
    }
    wf_clear_btn_p.appendChild(wf_clear_btn);
    wf_canvas_div.appendChild( wf_clear_btn_p);

    



    document.getElementById("wf_panel").appendChild(wf_canvas_div);
   
   
}
