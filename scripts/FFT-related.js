function ComplexNumber(re, im) 
{
	this.re = re;
	this.im = im || 0.0;
}

ComplexNumber.prototype.add = function(other, result)
{
	result.re = this.re + other.re;
	result.im = this.im + other.im;
	return result;
}
ComplexNumber.prototype.add_on = function(other)
{
	this.re = this.re + other.re;
	this.im = this.im + other.im;
}


ComplexNumber.prototype.sub = function(other, result)
{
	result.re = this.re - other.re;
	result.im = this.im - other.im;
	return result;
}


ComplexNumber.prototype.complex_exp = function(result)
{
	/*
	  e^jw=cos(w)+j sin(w)
	*/
	var er = Math.exp(this.re);
	result.re = er * Math.cos(this.im);
	result.im = er * Math.sin(this.im);
	return result;
}

ComplexNumber.prototype.multiply = function(other, result)
{
	//cache re in case result === this
	var r = this.re * other.re - this.im * other.im;
	result.im = this.re * other.im + this.im * other.re;
	result.re = r;
	return result;
}

ComplexNumber.prototype.show_complex_num = function()
{
	var cstr="";
	if( this.re == 0 ){
		cstr='j'+this.im.toString();
	}
	else if( this.im < 0 ){
		cstr=this.re.toString()+this.im.toString()+'j';
	}
	else if(this.im > 0 ){
		cstr=this.re.toString()+'+'+this.im.toString()+'j';
	}else{
		cstr=this.re;
	}
	//console.log(cstr);
	return cstr;
}

ComplexNumber.prototype.get_modulus_square=function()
{
	return this.re * this.re + this.im * this.im;
}
ComplexNumber.prototype.get_modulus=function()
{
	return Math.sqrt(this.re * this.re + this.im * this.im);
}
ComplexNumber.prototype.get_value_in_dB_normalised=function(N)
{	
	//normalized bin magnitude
	//	var norm_bin_mag=2*this.get_modulus()/N;
	//  return 20.0*(Math.log(norm_bin_mag)/Math.log(10));
	return	10*(Math.log(4*this.get_modulus_square()/(N*N))/Math.log(10));
}
ComplexNumber.prototype.PeriodDiagram=function(N)
{	

	return	10*log10(this.get_modulus_square()/N);

}


ComplexNumber.prototype.get_PSD=function(time,f_bin){
	//one-sided power spectral density
	//http://www.fon.hum.uva.nl/praat/manual/power_spectral_density.html
	//var Pref=2e-5;
  var psd=(2*(this.get_modulus_square()))*f_bin/time;
	var praat_dB=10*log10(psd/4e-10);
	return praat_dB;
}


function log10(value){
	return Math.log(value)/Math.log(10.0);
}


function FFT(frame_data){

	
	//console.log(frame_data);
	//console.log(frame_data);
	/*
	frame_data.length= 2^r 
	*/
	var N = frame_data.length;
	if( N <= 1 )
		return frame_data;
 
	/*


					 ----- 0,2,4,... , 2i and i= 0,1,2,...,N/2 
     frame_data[N]--- 
	 				 ----- 1,3,5,... , 2i+1  and i=0,1,2,... ,N/2-1
	*/

	var half_N = N / 2;
	var even = [];
	var odd = [];
	even.length = half_N;
	odd.length = half_N;
	for(var i = 0; i < half_N; ++i)
	{
		even[i] = frame_data[i*2];
		odd[i] = frame_data[i*2+1];
	}
	even = FFT(even);
	odd = FFT(odd);
 
	
	
	/*

	 0- 2/N
	 2/N +1 - N-1
	*/
	var a = -2*Math.PI;

	for(var m = 0; m < half_N; ++m)
	{
		if(!(even[m] instanceof ComplexNumber))
			even[m] = new ComplexNumber(even[m], 0);
		if(!(odd[m] instanceof ComplexNumber))
			odd[m] = new ComplexNumber(odd[m], 0);
		var p = m/N;
		var t = new ComplexNumber(0, a * p); // 0-j2k*pi/N
		t.complex_exp(t).multiply(odd[m], t);// e^ -j2k*pi/N  . multiply(odd[m]) e.t.  odd[m] * W_N^m=>t
 		frame_data[m] = even[m].add(t, odd[m]); // even[k]+t => odd[k] 
		frame_data[m + half_N] = even[m].sub(t, even[m]);// even[k]-t => even[k]
	}
	return frame_data;
}


function IFFT(amplitudes)
{
	var N = amplitudes.length;
	var pre_coef = 1 / N;
 
	//conjugate if imaginary part is not 0
	for(var i = 0 ; i < N; ++i)
		if(amplitudes[i] instanceof ComplexNumber)
			amplitudes[i].im = -amplitudes[i].im;
 
	//apply fourier transform
	amplitudes = FFT(amplitudes)
 
	for(var i = 0 ; i < N; ++i)
	{
		//conjugate again
		amplitudes[i].im = -amplitudes[i].im;
		//scale
		amplitudes[i].re *= pre_coef;
		amplitudes[i].im *= pre_coef;
	}
	return amplitudes;
}



function frame_padding(frame){
	 /* pad frame to make it have length= 2^r */
	 
 	 if( frame.length & (frame.length - 1) == 0 && frame.length!=1){
		  return frame;
		}else if(frame.length==1){

			frame.push(0);

		}else{
		  //var num=0
		  while(frame.length & (frame.length - 1) ){
			    //console.log(frame.length & (frame.length - 1) );
					frame.push(0);		
				//	num++;
		  }
		  
	  }
	  return frame;
	  
}
