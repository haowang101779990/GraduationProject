


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


           var spectrum_group=add_button(panel_div,'spectrum_btn','spectrum_panel','Generate Spectrum for this frame')
           

            
            
            spectrum_group.this_btn.onclick=function(){
               //alert("Generate Spectrum")

                spectrum_group.panel_with_this_btn.innerHTML="";
                
                

                var spec_ctrl_panel=document.createElement("div");
                spectrum_group.panel_with_this_btn.appendChild(spec_ctrl_panel);

                var select_p=document.createElement("p");
                select_p.innerHTML+="<label>Select Window Type: &nbsp</label>";
                
                        /*select window type*/ 
                        var windowTypeSelect = document.createElement("select");
                        windowTypeSelect.style="font-size:1.5em";
                        windowTypeSelect.id = "windowTypeSelect";
                        
                        

                        var windowTypes=['Rectangular','Hamming','Hann'];
                        for(var i=0;i<windowTypes.length;i++){
                            windowTypeSelect.options.add(new Option(windowTypes[i],windowTypes[i]));
                        }

                        select_p.appendChild(windowTypeSelect);

                spec_ctrl_panel.appendChild(select_p);


                var select_p_spectype=document.createElement("p");
                select_p_spectype.innerHTML+="<label>Select Spectrum Type: &nbsp</label>";
                
                        /*select spectrum type*/ 
                        var SpectrumTypeSelect = document.createElement("select");
                        SpectrumTypeSelect.style="font-size:1.5em";
                        SpectrumTypeSelect.id = "SpectrumTypeSelect";
                        
                        

                        var SpectrumTypes=['Power Spectrum Density (lg)','Energy (lg)'];
                        for(var i=0;i<SpectrumTypes.length;i++){
                            SpectrumTypeSelect.options.add(new Option(SpectrumTypes[i],SpectrumTypes[i]));
                        }

                        select_p_spectype.appendChild(SpectrumTypeSelect);

                spec_ctrl_panel.appendChild(select_p_spectype);



                var input_fl_p=document.createElement("p");
                
                        /*select window type*/ 
                        input_fl_p.innerHTML+="Frame Length in ms :";
                        var frameLengthInput = document.createElement("input");
                        frameLengthInput.id = "frameLengthInput";
                        frameLengthInput.value="20";

                        input_fl_p.appendChild(frameLengthInput);

                spec_ctrl_panel.appendChild(input_fl_p);

                var input_fn_p=document.createElement("p");
                
                        /*frame number  */
                        input_fn_p.innerHTML+="The Number of frames to draw : ";
                        var frameNumInput = document.createElement("input");
                        frameNumInput.id ="frameNumInput";
                        frameNumInput.value="5";

                        input_fn_p.appendChild(frameNumInput);

                spec_ctrl_panel.appendChild(input_fn_p);


                var input_dr_p=document.createElement("p");
                
                        /*dynamic range dB*/ 
                        input_dr_p.innerHTML+="Dynamic Range : ";
                        var DRInput = document.createElement("input");
                        DRInput.id ="DRInput";
                        DRInput.value="60";

                        input_dr_p.appendChild(DRInput);

                spec_ctrl_panel.appendChild(input_dr_p);


                var preamphasis_check_p=document.createElement("p");
                
                        
                        var pps_checkbox = document.createElement("input");
                        pps_checkbox.type="checkbox";
                        pps_checkbox.id ="pps_checkbox";
                        pps_checkbox.value="true";
                        preamphasis_check_p.appendChild(pps_checkbox);
                        label_adder(preamphasis_check_p,"Perform Preamphasis(a=0.98) ? :");
                        
                        

                spec_ctrl_panel.appendChild(preamphasis_check_p);


                var config_btn_p=document.createElement("p");
                
                        /*lodge config*/ 
                        
                        var config_btn = document.createElement("input");
                        config_btn.type="button";
                        config_btn.className="sub_feature_option";
                        config_btn.id ="config_btn";
                        config_btn.value="Adjust";
                        config_btn_p.appendChild(config_btn);

                spec_ctrl_panel.appendChild(config_btn_p);

                


                spectrum(audio_buffer,'Rectangular','Power Spectrum Density (lg)',20,5,60,false);

                config_btn.onclick=function(){
                    console.log(windowTypeSelect.value+","+frameLengthInput.value+","+frameNumInput.value+","+DRInput.value+","+pps_checkbox.checked);
                    spectrum(audio_buffer,windowTypeSelect.value,SpectrumTypeSelect.value,parseInt(frameLengthInput.value),parseInt(frameNumInput.value),parseInt(DRInput.value),pps_checkbox.checked);
                }
               
            }




            var sptg_group=add_button(panel_div,"sptg_btn","sptg_panel","Generate Spectrogram");
            sptg_group.this_btn.onclick=function(){
                //alert("Generate Spectrogram");
                
            }
            

           

        });
    };
    //asyncly decode audio data in an array buffer

    
    
}






















