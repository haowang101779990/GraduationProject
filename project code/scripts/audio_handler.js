


function audio_parser(audio_file){
    
    //alert(audio_file.name);
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();



    var fr= new FileReader();
    fr.readAsArrayBuffer(audio_file);// read the file into array buffer  to  fr.result
    

    
    fr.onloadend=function(e){
        
        audioCtx.decodeAudioData(e.target.result, function(audio_buffer){
            
            //console.log(channelData);

            //-panel div
            //   -wf_panel : waveform btn, zoom ratio btn, zoom start btn, waveform
            //   -spctm panel:
            
            var panel_div = document.createElement("div");
            document.body.appendChild(panel_div);
            panel_div.id="panel_div";

           
            var wf_group=add_button(panel_div,"wf_btn","wf_panel","Generate Waveform ");
            wf_group.this_btn.onclick=function(){
              
                
                wf_group.panel_with_this_btn.innerHTML="";

                wf_group.panel_with_this_btn.innerHTML+="<br><label>Zoom Ratio:</label><input type='range' name='zoom_ratio' min='1' max='100' value='100' step='1' id='wf_zoomratio'/><br>"
                wf_group.panel_with_this_btn.innerHTML+="<br><label>Zoom Start(in sec):</label><input type='text' value='0' id='wf_zoomstart'/><br>"

                waveform(audio_buffer,1,0);

                var wf_zoomratio_range=document.getElementById("wf_zoomratio");
                var wf_zoomstart_input=document.getElementById("wf_zoomstart");
                wf_zoomratio_range.onchange=function(e){
                        var wf_canvas_div_now=document.getElementById("wf_canvas_div");
                        if(wf_canvas_div_now!=null){
                            wf_canvas_div_now.remove();
                        }
                        // var zoom_ratio=0.03;
                        //var zoom_start=0;
                        waveform(audio_buffer,e.target.value/100,wf_zoomstart_input.value);
                }
                wf_zoomstart_input.onchange=function(e){
                    var wf_canvas_div_now=document.getElementById("wf_canvas_div");
                    if(wf_canvas_div_now!=null){
                        wf_canvas_div_now.remove();
                    }
                    // var zoom_ratio=0.03;
                   
                    waveform(audio_buffer,wf_zoomratio_range.value/100,e.target.value);
                }

            } //btm-wf onclick


           var spectrum_group=add_button(panel_div,'spectrum_btn','spectrum_panel','Generate Spectrum')
           

            
            
            spectrum_group.this_btn.onclick=function(){
              

                spectrum_group.panel_with_this_btn.innerHTML="";
                
                /*
                -btn
                -panel with this btn
                    -ctrl panel
                    -spec loader
                        -loader divs
                        -canvas group div
                */

                var spec_ctrl_panel=document.createElement("div");
                spec_ctrl_panel.id="spec_ctrl_panel";
                spec_ctrl_panel.className="ctrl_panel";
                spectrum_group.panel_with_this_btn.appendChild(spec_ctrl_panel);

                var spec_loader_panel=document.createElement("div");
                spec_loader_panel.id="spec_loader";
                spec_loader_panel.style.width="100%";
                spec_loader_panel.style.position="relative";
                spec_loader_panel.style.overflow="auto";
                add_loader(spec_loader_panel);
                spectrum_group.panel_with_this_btn.appendChild(spec_loader_panel);

                var select_p=document.createElement("p");
                select_p.innerHTML+="<label class='textinputlabel'>Select Window Type : &nbsp</label>";
                
                        /*select window type*/ 
                        var windowTypeSelect = document.createElement("select");
                        windowTypeSelect.style="font-size:1.2em";
                        windowTypeSelect.id = "windowTypeSelect";
                        
                        

                        var windowTypes=['Rectangular','Hamming','Hann'];
                        for(var i=0;i<windowTypes.length;i++){
                            windowTypeSelect.options.add(new Option(windowTypes[i],windowTypes[i]));
                        }

                        select_p.appendChild(windowTypeSelect);

                spec_ctrl_panel.appendChild(select_p);


                var select_p_spectype=document.createElement("p");
                select_p_spectype.innerHTML+="<label class='textinputlabel'>Select Spectrum Type : &nbsp</label>";
                
                        /*select spectrum type*/ 
                        var SpectrumTypeSelect = document.createElement("select");
                        SpectrumTypeSelect.style="font-size:1.2em";
                        SpectrumTypeSelect.id = "SpectrumTypeSelect";
                        
                        

                        var SpectrumTypes=['Praat Power Spectrum Density','Periodic Diagram Welch','square of modulus 10lg'];
                        for(var i=0;i<SpectrumTypes.length;i++){
                            SpectrumTypeSelect.options.add(new Option(SpectrumTypes[i],SpectrumTypes[i]));
                        }

                        select_p_spectype.appendChild(SpectrumTypeSelect);

                spec_ctrl_panel.appendChild(select_p_spectype);

                var input_fs_p=document.createElement("p");
               
                
                        /*select window type*/ 
                        input_fs_p.innerHTML+="<label class='textinputlabel'>draw Frame start at (s) :</label>";
                        var framestartInput = document.createElement("input");
                        framestartInput.placeholder="draw Frame start at (s):";
                        framestartInput.type="text";
                        framestartInput.id = "frameStartInput";
                        framestartInput.value="0";

                input_fs_p.appendChild(framestartInput);
                spec_ctrl_panel.appendChild(input_fs_p);

                var input_fl_p=document.createElement("p");
                
                        /*select window type*/ 
                        input_fl_p.innerHTML+="<label class='textinputlabel'>Frame Length in ms :</label>";
                        var frameLengthInput = document.createElement("input");
                        frameLengthInput.type="text";
                        frameLengthInput.id = "frameLengthInput";
                        frameLengthInput.value="20";

                        input_fl_p.appendChild(frameLengthInput);

                spec_ctrl_panel.appendChild(input_fl_p);

                var input_fn_p=document.createElement("p");
                
                        /*frame number  */
                        input_fn_p.innerHTML+="<label class='textinputlabel'>The Number of frames to draw : </label>";
                        var frameNumInput = document.createElement("input");
                        frameNumInput.type="text";
                        frameNumInput.id ="frameNumInput";
                        frameNumInput.value="5";

                        input_fn_p.appendChild(frameNumInput);

                spec_ctrl_panel.appendChild(input_fn_p);


                var input_dr_p=document.createElement("p");
                
                        /*dynamic range dB*/ 
                        input_dr_p.innerHTML+="<label class='textinputlabel'>Dynamic Range : </label>";
                        var DRInput = document.createElement("input");
                        DRInput.type="text";
                        DRInput.id ="DRInput";
                        DRInput.value="60";

                        input_dr_p.appendChild(DRInput);

                spec_ctrl_panel.appendChild(input_dr_p);


                var preamphasis_check_p=document.createElement("div");
                
                        
                        var pps_checkbox = document.createElement("input");
                        pps_checkbox.type="checkbox";
                        pps_checkbox.id ="pps_checkbox";
                        pps_checkbox.value="true";
                        
                        preamphasis_check_p.appendChild(pps_checkbox);
                        label_adder(preamphasis_check_p,"pps_checkbox","Perform Preamphasis(a=0.97) ? ");


                spec_ctrl_panel.appendChild(preamphasis_check_p);

                var elp_check_p=document.createElement("div");
                
                        
                        var elp_checkbox = document.createElement("input");
                        elp_checkbox.type="checkbox";
                        elp_checkbox.id ="elp_checkbox";
                        elp_checkbox.value="true";
                        
                        elp_check_p.appendChild(elp_checkbox);
                        label_adder(elp_check_p,"elp_checkbox","draw ESTIMATED envelope?");
 

                spec_ctrl_panel.appendChild(elp_check_p);

                var fm_check_p=document.createElement("div");
                
                        
                        var fm_checkbox = document.createElement("input");
                        fm_checkbox.type="checkbox";
                        fm_checkbox.id ="fm_checkbox";
                        fm_checkbox.value="true";
                        
                        fm_check_p.appendChild(fm_checkbox);
                        label_adder(fm_check_p,"fm_checkbox","Visualise Formants?");
                        

                spec_ctrl_panel.appendChild(fm_check_p);


                var config_btn_p=document.createElement("p");
                
                        /*lodge config*/ 
                        
                        var config_btn = document.createElement("input");
                        config_btn.type="button";
                        config_btn.className="sub_feature_option";
                        config_btn.id ="spec_config_btn";
                        config_btn.value="Adjust";
                        config_btn_p.appendChild(config_btn);

                spec_ctrl_panel.appendChild(config_btn_p);

                

                
                openModal();
                
                spectrum(audio_buffer,'Rectangular','Praat Power Spectrum Density',0,20,5,60,false,false,false);

                closeModal();

                var spectra_time=[];


                config_btn.onclick=function(){

                    

                    
                    var start_draw = new Date().getTime();
                    
                    openModal();
                    spectrum(audio_buffer,windowTypeSelect.value,SpectrumTypeSelect.value,framestartInput.value,parseInt(frameLengthInput.value),parseInt(frameNumInput.value),parseInt(DRInput.value),pps_checkbox.checked,elp_checkbox.checked,fm_checkbox.checked);
                    setTimeout(closeModal,1500*parseInt(frameNumInput.value)/100);
                    var end_draw= new Date().getTime();
                    var time_cost=(end_draw-start_draw)/1000;
                    console.log("draw spectra time for the "+spectra_time.length+"th time:"+time_cost);
                    spectra_time.push(time_cost);
                    var time_sum=0;
                    for(var i=0;i<spectra_time.length;i++){
                        time_sum+=spectra_time[i];
                    }
                    var time_avg=time_sum/spectra_time.length;
                    console.log("draw spectra time average for "+spectra_time.length+" times:"+time_avg);
                    


                }
               
            }



            /*
            var sptg_group=add_button(panel_div,"sptg_btn","sptg_panel","Generate Spectrogram");
            sptg_group.this_btn.onclick=function(){
                //alert("Generate Spectrogram");
                
            }
            */
            

           

        });
    };
    //asyncly decode audio data in an array buffer

    
    
}






















