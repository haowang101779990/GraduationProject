function cepstrum(frame_freq_data_complex,audioSampleRate,zoom_ratio,zoom_start,frame_num){
    /*
    zoom_ratio: in  80%= 0.8
    zoom_start: in seconds
    */
   
    // console.log(audio_buffer.getChannelData(0));
    for(var i=0;i<frame_freq_data_complex.length;i++){
        frame_freq_data_complex[i]=Math.log(frame_freq_data_complex[i].get_modulus());

    }
    var cepstrum_data=IFFT(frame_freq_data_complex);
    for(var i=0;i<cepstrum_data.length;i++){
        cepstrum_data[i]=cepstrum_data[i].re;
    }
    var audioDuration=(cepstrum_data.length-1)/audioSampleRate ;
    var Max=getMax(cepstrum_data);
    var Min=getMin(cepstrum_data);
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
   var ceps_canvas_div=document.createElement('div');
   ceps_canvas_div.id="cepstrum_canvas_div";
   ceps_canvas_div.style.overflow="auto";

   
   // canvas ctx
   var c = document.createElement("canvas");
   c.width=2000;
   c.height=300;
   var ctx = c.getContext("2d");
  

    ceps_canvas_div.appendChild(c);

    
   
    
    
    

    //clear existing things
    ctx.clearRect(0, 0, c.width, c.height);

    draw_coord(c,ctx);
    
    /*

    zoom ratio will shorten the displayed audio duration to fit the canvas
    thus the displayed cepstrum_data will be shortened

    */

    var displayed_duration=(audioDuration-zoom_start) * zoom_ratio;
    var zoom_start_pos=Math.ceil((zoom_start/audioDuration)*cepstrum_data.length); // however the zoom start point should in whole audio file context
    var cepstrum_data_to_draw=cepstrum_data.slice(zoom_start_pos, zoom_start_pos+zoom_ratio*cepstrum_data.length);
    console.log(cepstrum_data_to_draw);
    
    

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
        
        let range_this_pixel=cepstrum_data_to_draw.slice(SamplesPerPixel*i,SamplesPerPixel*(i+1));
        
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


    var cursor_info=document.createElement("p");
    cursor_info.innerHTML+="Current Value :";
    ceps_canvas_div.appendChild(cursor_info);

    /*
    click, display the amplitude
    */
    c.onclick=function(e){
        let pos=getMousePos(c,e);
        let time_offset=(pos.x/c.width)*displayed_duration;
        let time=zoom_start/1+time_offset;
        let index_offset=Math.ceil((pos.x/c.width)*pixel_values.length);

        console.log(time);
        cursor_info.innerHTML="Current time and sound amplitude : " +time+","+pixel_values[index_offset];
    }



    
    

    
    
    
    /*
    a button to remove the current canvas
    */
    var ceps_clear_btn=document.createElement('input');
    ceps_clear_btn.type="button";
    ceps_clear_btn.value="Clear this graph";
    ceps_clear_btn.onclick=function(){
        document.getElementById("ceps_panel").innerHTML="";
    }
    ceps_canvas_div.appendChild( ceps_clear_btn );

    var ceps_infor=document.createElement('p');
    ceps_infor.innerHTML=
    "zoom ratio:" + zoom_ratio + "<br>" +
    "min amplitude:"+Min+ "<br>" +
    "max amplitude:"+Max+ "<br>" +
    "Sampling Rate:" + audioSampleRate + "<br>" + 
    "Displayed Duration:"+displayed_duration + " From sec:"+ zoom_start;

    ceps_canvas_div.appendChild(ceps_infor);



    document.getElementById("cepstrum_div_"+frame_num).appendChild(ceps_canvas_div);
   
   
}