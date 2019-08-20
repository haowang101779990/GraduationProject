# Drawing Audio Spectrum and Formants extraction by LPC on webs

## Get a glimpse of this project

This project aims at drawing the following features for an input 
audio wav file:

 - A sacalable time-domain waveform  
 - Custom frequency-domain spectra frame by frame 
 - Visualize the envelope and extract formants on the spectra 
   through Levinson-Durbin LPC computation.

## Get your hands dirty with it! 

1. clone the project 

```
  git clone https://github.com/haowang101779990/GraduationProject.git
```

2. In the cloned directory, open index.html in Chrome/Firefox of recent versions.

### Audio File input
   
I've put some wav. file already in ./sound_files. Just drag of them into the
input block

<p align="center">
<img src="./imgs/1.gif"/> <br />
Drag your input audio file
</p>

### Draw time-domain waveform :

<p align="center">
<img src="./imgs/2.gif"/> <br />
</p>

### Draw frequency-domain features: spectrum. envelope. formants.

<p align="center">
<img src="./imgs/3.gif"/> <br />
</p>
