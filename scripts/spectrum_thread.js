


onmessage = function(e) {
        console.log('Worker spec thread: Message received from main script');
        /*
        var data=e.data.data_content;
        var spectra_time=data[0];
        var start_draw = new Date().getTime();
        spectrum(data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9],data[10]);
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
        */


 
        postMessage("2");


}

