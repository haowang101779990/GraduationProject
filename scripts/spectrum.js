

function Hamming(windowValues){
    for (var i = 0; i < windowValues.length; i++) {
        windowValues[i] =0.54 - 0.46 * Math.cos((Math.PI * 2 * i) / (windowValues.length - 1));
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
    
    var temp=[];
    temp[0]=frm[0];
    for(var i=1;i<frm.length;i++){
        temp[i]=frm[i]-alpha*frm[i-1];
        //console.log("frm"+[i]+":"+frm[i]);
    }
    
    return temp;
    

}



/**
 * 
 * @param {*} audio_buffer 
 * @param {*} windowType 
 * @param {int} frame_length_time  in ms
 * @param {} frame_total total frames to draw
 */

function spectrum(audio_buffer, windowType,specType,frame_start_time,frame_length_time, frame_total, dynamic_range, use_pps, draw_elp, draw_fm){




    var spectrum_canvas_group_div=document.getElementById("spectrum_canvas_group");
    if(spectrum_canvas_group_div){
        spectrum_canvas_group_div.remove();
        spectrum_canvas_group_div=null;
    }
    var spectrum_canvas_group_div=document.createElement('div');
    spectrum_canvas_group_div.id="spectrum_canvas_group";
    document.getElementById("spec_loader").appendChild(spectrum_canvas_group_div);

    

    
    var frame_length=Math.ceil(audio_buffer.sampleRate*frame_length_time/1000);
    var frame_start_index_user=Math.ceil(frame_start_time*audio_buffer.sampleRate);

    var windowValues=new Array(frame_length);

    switch(windowType){
        case 'Rectangular' : windowValues=Rectangular(windowValues);break;
        case 'Hamming' : windowValues=Hamming(windowValues);break;
        case 'Hann' : windowValues=Hann(windowValues);break;
    }

    

    
    

    var nsegs=1;
    while((((nsegs-1)*frame_length/2)+frame_length+frame_start_index_user)<audio_buffer.getChannelData(0).length){

        nsegs++;
    }
    console.log("nsegs:"+nsegs);

    var avg_lpc_error=new Object();
    avg_lpc_error.error_value=0;
    var frame_num=0;
    for(;frame_num<frame_total;frame_num++){
        
        if(frame_num+1>nsegs){
            break;
        }

        //alert(frame_num*frame_length/2+","+((frame_num*frame_length/2)+frame_length));
        var frame_start_index=frame_start_index_user+frame_num*frame_length/2;
        var frame_end_index=frame_start_index+frame_length;
        var PCMData_this_frame=audio_buffer.getChannelData(0).slice(frame_start_index,frame_end_index);
        //console.log("frame from index:"+frame_start_index+" to index: "+frame_end_index);
        

        var PCMArray=[];
        
        for(var i=0;i<PCMData_this_frame.length;i++){
            PCMArray.push(PCMData_this_frame[i]);

        }
        console.log(frame_num+"th Original:" + PCMArray)
        //console.log(use_pps)
        if(use_pps){
            PCMArray= Preemphasis(PCMArray,0.97)
            //show_array_data(PCMArray,"Pre emphasized");
        }

        for(var i=0;i<PCMArray.length;i++){
            PCMArray[i]*=windowValues[i];
        }
        console.log(frame_num+"th Windowed array:"+PCMArray);

        var time_interval=frame_length_time/(PCMArray.length-1);

        frame_padding(PCMArray);
        var PCMArray_spare=PCMArray.slice(0);

        //console.log("frame"+frame_num+" data for fft "+PCMArray);
        var freq_this_frame=FFT(PCMArray);
        /*
        for(var i=0;i<freq_this_frame.length;i++){
            console.log(freq_this_frame[i].show_complex_num());
        }*/

        
        
        var freq_dB=[];// N/2
        
        var duration=(PCMArray.length-1)*time_interval;
        if(specType=='Praat Power Spectrum Density'){     
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
                //freq_dB[i] = freq_this_frame[i].get_modulus_square();
            }
        }
        console.log(frame_num+"th freq_dB:"+freq_dB);

        title="Frame No."+frame_num;


        draw_spec(freq_dB,audio_buffer.sampleRate,frame_num,dynamic_range,PCMArray_spare,draw_elp,draw_fm,title,nsegs,specType,duration,avg_lpc_error);
        
        
        PCMArray=null;
        PCMArray_spare=null;
        freq_dB=null;
        delete PCMArray_spare;
        delete freq_dB;
        delete PCMArray;

        
    }
    console.log("Average lpc error across "+frame_num+" frames:"+avg_lpc_error.error_value/frame_num);
    
    return 0;


    

}
/**
 * draw for a frame, the frequency-domain data of the former N/2 is
 * in freq_mod_data
 * 
 * @param {*} freq_mod_data 
 * @param {*} sampleRate 
 * @param {*} frame_num 
 * @param {*} dynamic_range 
 * @param {*} data_this_frame 
 * @param {*} draw_elp 
 * @param {*} draw_fm 
 * @param {*} title plot title for this frame
 * @param {*} nsegs 
 * @param {*} specType 
 * @param {*} duration  for computing praat psd lpc
 */
function draw_spec(freq_mod_data,sampleRate,frame_num,dynamic_range,data_this_frame,draw_elp,draw_fm,title,nsegs,specType,duration,avg_lpc_error){
    /*
    freq mod data length:N/2
    */
    //show_array_data(freq_mod_data,"spectrum data: ");
    let old_canvas_div=document.getElementById("spec_canvas_div_"+frame_num);
    if(old_canvas_div){
        old_canvas_div.remove();
        old_canvas_div=null;
    }

    
    var canvas_div=document.createElement('div');
    canvas_div.className="spec_canvas_div";
    canvas_div.id="spec_canvas_div_"+frame_num;
    canvas_div.style.overflow="auto";
    
	
    document.getElementById("spectrum_canvas_group").appendChild(canvas_div);
    

    var c = document.createElement("canvas");
    var left_padding=100;
    var right_padding=80;
	c.width=freq_mod_data.length+left_padding+right_padding;
    var bottom_padding=30;
    var top_padding=50;
    c.height=500+bottom_padding+top_padding;/*actual height is divisible by 10 , make sure. */
    
    var y_dB_per_pixel=dynamic_range/(c.height-bottom_padding-top_padding);
    var ctx = c.getContext("2d");
    

    
    


	canvas_div.appendChild(c);
	

    var max_mod=getMax(freq_mod_data);
    
    var y_dB_zero=Math.ceil(max_mod/y_dB_per_pixel);
	//console.log(max_mod);

    
    /*

    coord and envelop from lpc
    */
    
    draw_spec_coord(c,ctx,y_dB_zero,max_mod,dynamic_range,left_padding,right_padding,top_padding,bottom_padding,sampleRate/2,title);
    if(draw_fm||draw_elp){
        var formants_and_bdw=LPC_spectrum_evlp(ctx,c,left_padding,top_padding,bottom_padding,data_this_frame,sampleRate,draw_elp,draw_fm,nsegs,dynamic_range,max_mod,specType,duration);
        var ase=0;
        for(var i=0;i<freq_mod_data.length;i++){
            ase+=Math.abs(freq_mod_data[i]-formants_and_bdw.lpc_result[i]);
        }
        ase/=freq_mod_data.length;
        avg_lpc_error.error_value+=ase;
    
    }
    //console.log(y_dB_zero);
    
    var last_draw_at_y=y_dB_zero;
	for(var i=0;i<freq_mod_data.length;i++){

        var distance=max_mod-freq_mod_data[i];

        draw_at_y = Math.floor(distance/y_dB_per_pixel)+top_padding;
        if(draw_at_y>c.height-bottom_padding){
            draw_at_y=c.height-bottom_padding-1;
        }
		//console.log(i+" "+freq_mod_data[i]);

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
    

    
    
    

    var spec_cursor_infor=document.createElement("div");

        
    
    canvas_div.appendChild(spec_cursor_infor);

    c.onclick=function(e){
        spec_cursor_infor.innerHTML="";
        var spec_cursor_infor_table=document.createElement("table");
        spec_cursor_infor_table.className="cursor_infor_table";
            
            two_cols_tr(spec_cursor_infor_table,"Current Frequency",0);
            two_cols_tr(spec_cursor_infor_table,"Current Spectral Value",0);
            
        spec_cursor_infor.appendChild(spec_cursor_infor_table);

        let pos=getMousePos(c,e);
        let freq_offset=pos.x-left_padding;
        if(freq_offset<0){
            freq_offset=0;
        }
        console.log("freq_offset:"+freq_offset);

        //cursor_info.innerHTML="<span class='key'>Current Freq: </span>" +(sampleRate*freq_offset/(freq_mod_data.length*2)).toFixed(2)+" Hz ";
        //cursor_info.innerHTML+="<span class='key'><br>Current Spectrum Value: </span>" +freq_mod_data[Math.floor(freq_offset)].toFixed(2)+" dB ";
        
        let tds=spec_cursor_infor.querySelectorAll("td");

        tds[0].innerHTML=(sampleRate*freq_offset/(freq_mod_data.length*2)).toFixed(2)+" Hz ";
        tds[1].innerHTML=freq_mod_data[Math.floor(freq_offset)].toFixed(2)+" dB ";
        
        //cursor_info.innerHTML+="<br><span class='key'>Formants in this frame: </span><br>" ;
        if(draw_fm||draw_elp){
            var fnum=(formants_and_bdw.peaks.length>=7)?7:formants_and_bdw.peaks.length;
            var formant_table=document.createElement("table");
            var ft_cap=document.createElement("caption");
            ft_cap.innerHTML="Formants in this frame"
            formant_table.appendChild(ft_cap);
            for(var i=0;i<fnum;i++){
                var this_tr=document.createElement("tr");
                this_tr.innerHTML+="<th>F<sub>"+i+"</sub></th><td>"+formants_and_bdw.formants[i].toFixed(2)+"</td>";
                this_tr.innerHTML+="<th>Bandwidth<sub>"+i+"</sub></th><td>"+formants_and_bdw.bandwidth[i].toFixed(2)+"</td>";
                formant_table.appendChild(this_tr);
            }
            var ase_tr=document.createElement("tr");
            ase_tr.innerHTML+="<th colspan='2'>Average Predictive Error of LPC in this frame:  </th>";
            ase_tr.innerHTML+="<td colspan='2'>" + ase.toFixed(2) + "</td>";
            formant_table.appendChild(ase_tr);

            

            spec_cursor_infor.appendChild(formant_table);
        }
        
        
    }



}


function LPC_spectrum_evlp(ctx,c,left_padding,top_padding,bottom_padding,data,fs,draw_elp,draw_fm,nsegs,dr,max_mod,specType,duration){
    
    //var p=48;
    var p=48;
    var lpc_result=LPC_to_evlp(data,p);
    var f_bin=fs/data.length;
    
    var formants_and_b=getPeaks_and_bdw(lpc_result,f_bin);
    formants_and_b.lpc_result=lpc_result;

    var formants=formants_and_b.peaks;
    //console.log("draw_fm:"+draw_fm);
    if(draw_fm){
        
        var counter=1;
        for(var i=0;i<formants.length&&counter<=7;i++,counter++){
            
            ctx.beginPath();
            //console.log("formants i:"+formants[i]);
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

        console.log("raw lpc raw:"+lpc_result);

        if(specType=='Periodic Diagram Welch'){
            for(var i=0;i<lpc_result.length/2;i++){
                lpc_result[i]=10*log10(lpc_result[i]/nsegs);
            }
        }else if(specType=='Praat Power Spectrum Density'){
            for(var i=0;i<lpc_result.length/2;i++){
                var psd=2*(lpc_result[i])*f_bin/duration;
	            lpc_result[i]=10*log10(psd/4e-10);
            }
        }else if(specType=='square of modulus 10lg'){
            
            for(var i=0;i<lpc_result.length/2;i++){
                lpc_result[i]=10*log10(lpc_result[i]);
            }
        }
        console.log(lpc_result);
        
        lpc_result=lpc_result.slice(0,lpc_result.length/2+1);
        //console.log("lpc_result:  "+lpc_result);
        //style 1:whole shape
        var style=2;
        if(style==1){
                var max_lpc=getMax(lpc_result);
                var min_lpc=getMin(lpc_result);
                var lpc_bin=(max_lpc-min_lpc)/(c.height-bottom_padding-top_padding);
                var last_draw_at_y=0;


                for(var i=0;i<lpc_result.length;i++){

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
        //style 2:real value in dynamic range, close to spectrum
        if(style==2){
            var max_lpc=getMax(lpc_result);
            var y_dB_per_pixel=dr/(c.height-bottom_padding-top_padding);
            if(max_mod>max_lpc){
                var max_lpc_y=Math.floor((max_mod-max_lpc)/y_dB_per_pixel);
            }else{
                var max_lpc_y=0;
            }
            for(var i=0;i<lpc_result.length;i++){

                var distance=max_lpc-lpc_result[i];
        
                draw_at_y = Math.floor(distance/y_dB_per_pixel)+top_padding+max_lpc_y;
                if(draw_at_y>c.height-bottom_padding){
                    draw_at_y=c.height-bottom_padding-1;
                }
        
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
    }

    //console.log("formants:" +formants);
    return formants_and_b;
    

}

function getPeaks_and_bdw(data,bin){
    var peaks=[];
    var fi=[];
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
            //console.log("a:"+a+",b:"+b+",c:"+c+",P:"+P+",bin:"+bin);
            var this_fi=((-1*b)/2*a+i)*bin;
            fi.push(this_fi);
            var B=-1/a*bin*(Math.sqrt(b*b-4*a*(c-0.5*P)))
            //console.log("Bandwidth:"+B);
            bandwidth.push(B);
        }
    }
    return {peaks:peaks,formants:fi,bandwidth:bandwidth};
}



function spectrogram(audio_buffer){

    //1. generate frames


}