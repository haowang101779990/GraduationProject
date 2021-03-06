


/**
 * 
 * @param {Array} s signal data
 * @param {int} p  lpc degree p
 * @returns {lpc coefficient} 
 */
function rota(s,p){
    
    var Rp=[];
    for(var i=0;i<=p;i++){
        Rp[i]=0;
    }
    var N=s.length;

    // autocorrelation
    //console.log("s in rota::"+s);
    for(var i=0;i<=p;i++){
        
        for(var n=0;n<N-i;n++){
            Rp[i]+=s[n+i]*s[n]/N;
        }
        //console.log("Rp-in: "+Rp);
    }
    //console.log("Rp: "+Rp);
    var Ep;
    var k;
    var zeros=[]
    var a=[];
    for(var i=0;i<p+1;i++){
        zeros.push(0);
    }
    Ep=zeros.slice(0);
    k=zeros.slice(0);
    for(var i=0;i<p+1;i++){
        a.push(zeros.slice(0));
    }
    //console.log("Ep - initial: "+Ep);
    //console.log("k - initial: "+k);
    //console.log("a - initial:"+a);




    //i=1
    Ep[0]=Rp[0];
    k[1]=Rp[1]/Rp[0];
    a[1][1]=k[1];
    Ep[1]=(1-k[1]*k[1])*Ep[0];

    //console.log("Ep - i=1: "+Ep);
    //console.log("k - i=1:  "+k);
    //console.log("a - i=1:  "+a);

    if(p>1){
        for(var i=2;i<=p;i++){
            var sum=0;
            for(var j=1;j<i;j++){
                sum+=a[j][i-1]*Rp[i-j];
            }
            //console.log("Rp[i]:  "+Rp[i]+"  sum:"+sum+"  Ep[i-1]:"+Ep[i-1]);
            k[i]=(Rp[i]-sum)/Ep[i-1];
            //console.log("k - i="+i+":  "+k);
            a[i][i]=k[i];
            Ep[i]=(1-k[i]*k[i])*Ep[i-1];
            for(var j=1;j<i;j++){
                a[j][i]=a[j][i-1]-k[i]*a[i-j][i-1];
            }

            //console.log("Ep - i="+i+":  "+Ep);
            
            //console.log("a - i="+i+":  "+a);


        }
    }

    var ar=[1];
    for(var ii=1;ii<=p;ii++){
        ar[ii]=-a[ii][p];
    }

    /*
    epsilon=Rp[0];
    
    for(var i=1;i<=p;i++){
        epsilon+=ar[i]*Rp[i];
    }
    epsilon/=N;

    epsilonsub=Rp[0];
    
    for(var i=1;i<=p;i++){
        epsilonsub-=ar[i]*Rp[i];
    }
    epsilonsub/=N;
    */
    
    //console.log("epsilon:"+epsilon);
    console.log("Ep:"+Ep[p]);//levinson error ,tested in matlab, same

    var G=Math.sqrt(Ep[p]);

    

    return {ar: ar, G: G};

}

function LPC_to_evlp(signal,p){
    //console.log("signal:"+signal);
    var N=signal.length;
    var lpc_coef=rota(signal,p);
    

    show_array_data(lpc_coef.ar,"ar:\n");
    console.log("Gain:"+lpc_coef.G);
    //var lpc_ar_freq=FFT(lpc_coef.ar);
    var result=[];

   
   for(var k=0;k<N;k++){
        result[k]=0;
   }

   for(var i=0;i<lpc_coef.ar.length;i++){
         result[i]=lpc_coef.ar[i];  
    }
    console.log("arguments result padded:"+result);
    var fft_result=FFT(result);
    console.log(fft_result);
    var result_mod=[];

    for(var k=0;k<N/2;k++){

        result_mod.push(fft_result[k].get_modulus());
        
        fft_result[k]=lpc_coef.G/fft_result[k].get_modulus_square();
    }
    console.log("result_mod:"+result_mod);
    


    return fft_result;

}

function show_array_data(data,show_str){

    var show_lines=Math.ceil(data.length/9);
    var line_counter=0;
    for(var i=0;i<data.length;i++){
        if(i%9==0){

            
            line_counter++;
            if(line_counter==show_lines){
                show_str+="\n\n\n"+(i+1)+"th~"+data.length+"th :\n\n";
            }else{
                show_str+="\n\n\n"+(i+1)+"th~"+(i+9)+"th :\n\n";
            }
        }
        

        show_str+=(data[i]).toFixed(4)+"      ";
        
    }
    console.log(show_str);
}