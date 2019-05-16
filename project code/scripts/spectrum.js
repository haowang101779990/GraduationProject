

function Hamming(windowValues){
    for (var i = 0; i < windowValues.length; i++) {
        windowValues[i] =(0.54 - 0.46) * Math.cos((Math.PI * 2 * i) / (windowValues.length - 1));
    }
    return windowValues;
}

function Rectangular(windowValues){

    for (var i = 0; i < windowValues.length; i++) {
        windowValues[i] = 1;
    }
    return windowValues;
}

function Hann(windowValues){

    for (i = 0; i < windowValues.length; i++) {
        windowValues[i] = 0.5 * (1 - Math.cos((Math.PI * 2 * i) / (windowValues.length - 1)));
    }
    return windowValues;

}

function Preemphasis(frm,alpha){
    
    for(var i=1;i<frm.length;i++){
        frm[i]=frm[i]-alpha*frm[i-1];
    }

}

/**
 * 
 * @param {*} audio_buffer 
 * @param {*} windowType 
 * @param {int} frame_length_time  in ms
 * @param {} frame_total total frames to draw
 */

function spectrum(audio_buffer, windowType,specType,frame_length_time, frame_total, dynamic_range, use_pps, draw_elp, draw_fm){

    
    var frame_length=Math.ceil(audio_buffer.sampleRate*frame_length_time/1000);

    var windowValues=new Array(frame_length);

    switch(windowType){
        case 'Rectangular' : windowValues=Rectangular(windowValues);break;
        case 'Hamming' : windowValues=Hamming(windowValues);break;
        case 'Hann' : windowValues=Hann(windowValues);break;
    }

    var spectrum_canvas_group_div=document.getElementById("spectrum_canvas_group");
    if(spectrum_canvas_group_div){
        spectrum_canvas_group_div.remove();
    }
    var spectrum_canvas_group_div=document.createElement('div');
    spectrum_canvas_group_div.id="spectrum_canvas_group";
    spectrum_canvas_group_div.style.overflow="auto";
    document.getElementById("spectrum_panel").appendChild(spectrum_canvas_group_div);

    var nsegs=1;
    while((((nsegs-1)*frame_length/2)+frame_length)<audio_buffer.getChannelData(0).length){

        nsegs++;
    }
    console.log("nsegs:"+nsegs);
    for(var frame_num=0;frame_num<frame_total;frame_num++){
        
        if(frame_num+1>nsegs){
            break;
        }

        //alert(frame_num*frame_length/2+","+((frame_num*frame_length/2)+frame_length));
        var PCMData_this_frame=audio_buffer.getChannelData(0).slice(frame_num*frame_length/2,(frame_num*frame_length/2)+frame_length);
        

        var PCMArray=[];
        
        for(var i=0;i<PCMData_this_frame.length;i++){
            PCMArray.push(PCMData_this_frame[i]);

        }
        console.log("Original:" + PCMArray)
        console.log(use_pps)
        if(use_pps){
            Preemphasis(PCMArray,0.98)
            console.log("Preamphasised:" + PCMArray)
        }

        for(var i=0;i<PCMArray.length;i++){
            PCMArray[i]*=windowValues[i];
        }

        var time_interval=frame_length_time/(PCMArray.length-1);

        frame_padding(PCMArray);
        var PCMArray_spare=PCMArray.slice(0);

    // alert(typeof PCMArray);
        console.log("frame time data:"+PCMArray);
        
        //doing FFT
        var freq_this_frame=FFT(PCMArray);
        
        var freq_dB=[];// N/2
        
        if(specType=='Praat Power Spectrum Density'){
            var duration=(PCMArray.length-1)*time_interval;
            for(var i=0;i<freq_this_frame.length/2;i++){
                    freq_dB[i] = freq_this_frame[i].get_PSD(duration,audio_buffer.sampleRate/PCMArray.length);
            }
        }   
        else if(specType=='Periodic Diagram Welch'){
            
            for(var i=0;i<freq_this_frame.length/2;i++){
                    freq_dB[i] = freq_this_frame[i].PeriodDiagram(nsegs);
            }
        }
        else if(specType=='square of modulus 10lg'){
            for(var i=0;i<freq_this_frame.length/2;i++){
                freq_dB[i] = 10*log10(freq_this_frame[i].get_modulus_square());
            }
        }

        title="Frame No."+frame_num;

        draw_spec(freq_dB,audio_buffer.sampleRate,frame_num,dynamic_range,PCMArray_spare,draw_elp,draw_fm,title);
        


        
    }

    

}

function draw_spec(freq_mod_data,sampleRate,frame_num,dynamic_range,data_this_frame,draw_elp,draw_fm,title){
    /*
    freq mod data length:N/2
    */
    let old_canvas_div=document.getElementById("spec_canvas_div_"+frame_num);
    if(old_canvas_div){
        old_canvas_div.remove();
    }

    console.log(freq_mod_data);
    var canvas_div=document.createElement('div');
    canvas_div.id="spec_canvas_div_"+frame_num;
    canvas_div.style.overflow="auto";
    
	
	document.getElementById("spectrum_canvas_group").appendChild(canvas_div);

    var c = document.createElement("canvas");
    var left_padding=90;
    var right_padding=80;
	c.width=freq_mod_data.length+left_padding+right_padding;
    var bottom_padding=30;
    var top_padding=40;
    c.height=500+bottom_padding+top_padding;/*actual height is divisible by 10 , make sure. */
    
    var y_dB_per_pixel=dynamic_range/(c.height-bottom_padding-top_padding);
    var ctx = c.getContext("2d");
    

    
    


	canvas_div.appendChild(c);
	

    var max_mod=getMax(freq_mod_data);
    
    var y_dB_zero=Math.ceil(max_mod/y_dB_per_pixel);
	console.log(max_mod);

    
    /*

    coord and envelop from lpc
    */

    draw_spec_coord(c,ctx,y_dB_zero,max_mod,dynamic_range,left_padding,right_padding,top_padding,bottom_padding,sampleRate/2,title);
    if(draw_fm||draw_elp){
        var formants_and_bdw=LPC_spectrum_evlp(ctx,c,left_padding,top_padding,bottom_padding,data_this_frame,sampleRate,draw_elp,draw_fm);
    }
    console.log(y_dB_zero);
    
    var last_draw_at_y=y_dB_zero;
	for(var i=0;i<freq_mod_data.length;i++){

        var distance=max_mod-freq_mod_data[i];

        draw_at_y = Math.floor(distance/y_dB_per_pixel)+top_padding;
        if(draw_at_y>c.height-bottom_padding){
            draw_at_y=c.height-bottom_padding-1;
        }
		console.log(i+" "+freq_mod_data[i]);

		ctx.beginPath();
        ctx.strokeStyle="black";
        if(i>0){
            ctx.moveTo(i-1+left_padding, last_draw_at_y);
            ctx.lineTo(i+left_padding, draw_at_y);
            ctx.stroke(); 
        }
        ctx.moveTo(i+left_padding, draw_at_y);
        ctx.lineTo(i+left_padding, draw_at_y+1);
        ctx.stroke(); 

        last_draw_at_y=draw_at_y;
    }
    


    var cursor_info=document.createElement("p");
    cursor_info.innerHTML+="Current Freq :";
    canvas_div.appendChild(cursor_info);

    c.onclick=function(e){
        let pos=getMousePos(c,e);
        let freq_offset=pos.x-left_padding;
        console.log("freq_offset:"+freq_offset);
        cursor_info.innerHTML="Current Freq: " +(sampleRate*freq_offset/(freq_mod_data.length*2)).toFixed(2)+" Hz ";
        cursor_info.innerHTML+="<br>Current Spectrum Value: " +freq_mod_data[Math.floor(freq_offset)].toFixed(2)+" dB ";
        cursor_info.innerHTML+="<br>Formants in this frame: <br>" ;
        var fnum=(formants_and_bdw.peaks.length>=5)?5:formants_and_bdw.peaks.length;
        for(var i=0;i<fnum;i++){
            cursor_info.innerHTML+="F"+i+":"+formants_and_bdw.peaks[i].toFixed(2)+"      "+"Bandwidth "+i+":"+formants_and_bdw.bandwidth[i].toFixed(2)+"<br>";
        }
    }



}


function LPC_spectrum_evlp(ctx,c,left_padding,top_padding,bottom_padding,data,fs,draw_elp,draw_fm){
    
    var p=40;
    var lpc_result=LPC_to_evlp(data,p);
    
    
    var formants_and_b=getPeaks_and_bdw(lpc_result,fs/data.length);
    var formants=formants_and_b.peaks;
    console.log("draw_fm:"+draw_fm);
    if(draw_fm){
        
        var counter=1;
        for(var i=0;i<formants.length&&counter<=5;i++,counter++){
            
            ctx.beginPath();
            console.log("formants i:"+formants[i]);
            ctx.moveTo(formants[i]+left_padding,c.height-bottom_padding);
            ctx.lineTo(formants[i]+left_padding,top_padding);
            ctx.strokeStyle="red";
            ctx.globalCompositeOperation="source-over";
            ctx.stroke(); 

            ctx.closePath();
            


            formants[i]=(formants[i]/data.length)*fs;
        }
    }

    if(draw_elp){
        for(var i=0;i<lpc_result.length;i++){
            lpc_result[i]=10*log10(lpc_result[i]);
        }
        console.log("lpc_result:  "+lpc_result);
        var max_lpc=getMax(lpc_result);
        var min_lpc=getMin(lpc_result);
        var lpc_bin=(max_lpc-min_lpc)/(c.height-bottom_padding-top_padding);
        var last_draw_at_y=0;


        for(var i=0;i<lpc_result.length/2;i++){

                draw_at_y=(max_lpc-lpc_result[i])/lpc_bin+top_padding;

                ctx.beginPath();
                ctx.strokeStyle="blue";
                if(i>0){
                    ctx.moveTo(i-1+left_padding, last_draw_at_y);
                    ctx.lineTo(i+left_padding, draw_at_y);
                    ctx.stroke(); 
                }
                ctx.moveTo(i+left_padding, draw_at_y);
                ctx.lineTo(i+left_padding, draw_at_y+1);
                ctx.stroke(); 


                last_draw_at_y=draw_at_y;
                
        }
    }

    console.log("formants:" +formants);
    return formants_and_b;
    

}

function getPeaks_and_bdw(data,bin){
    var peaks=[];
    var bandwidth=[];
    for(var i=2;i<data.length/2-1;i++){
        if(i==0)
            continue;
        if(data[i-2]<data[i-1]&&data[i-1]<data[i]&&data[i]>data[i+1]){
            peaks.push(i);
            var a=(data[i-1]+data[i+1]-2*data[i])/2;
            var b=(data[i+1]-data[i-1])/2;
            var c=data[i];
            var P=-(b*b)/(4*a)+c;
            console.log("a:"+a+",b:"+b+",c:"+c+",P:"+P+",bin:"+bin);
            var B=-1/a*bin*(Math.sqrt(b*b-4*a*(c-0.5*P)))
            console.log("Bandwidth:"+B);
            bandwidth.push(B);
        }
    }
    return {peaks:peaks,bandwidth:bandwidth};
}



function spectrogram(audio_buffer){

    //1. generate frames


}