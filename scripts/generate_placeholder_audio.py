"""Generate original synthetic placeholder MP3s; not game audio or field recordings."""
import io, wave, subprocess, sys
from pathlib import Path
import numpy as np
# Requires numpy and imageio-ffmpeg installed in the Python environment.
import imageio_ffmpeg
root=Path(__file__).resolve().parents[1]/'assets/audio'
sr=22050
rng=np.random.default_rng(6806)
def render(file,duration,kind):
 t=np.arange(int(sr*duration))/sr
 fade=np.minimum(np.minimum(t/.08,(duration-t)/.15),1).clip(0,1)
 if kind=='night':
  a=.10*np.sin(2*np.pi*55*t)+.05*np.sin(2*np.pi*82.41*t)+.022*rng.normal(size=len(t)); a*=.7+.3*np.sin(2*np.pi*.12*t)
 elif kind=='nature':
  noise=rng.normal(size=len(t)); a=.025*np.convolve(noise,np.ones(180)/180,mode='same')+.025*np.sin(2*np.pi*2800*t)*(np.sin(2*np.pi*4*t)>0)*(.55+.45*np.sin(2*np.pi*.13*t))
 elif kind=='engine':
  phase=2*np.pi*(42*t+18*t*t); a=.08*np.sin(phase)+.035*np.sin(phase*2)+.018*rng.normal(size=len(t)); a*=np.exp(-t*.45)
 elif kind=='whoosh':
  a=.12*rng.normal(size=len(t))*np.sin(np.pi*t/duration)**2
 elif kind=='metal':
  a=(.13*np.sin(2*np.pi*950*t)+.07*np.sin(2*np.pi*1870*t))*np.exp(-12*t)+.06*rng.normal(size=len(t))*np.exp(-35*t)
 elif kind=='correct':
  f=np.where(t<duration/2,523.25,783.99); a=.1*np.sin(2*np.pi*f*t)+.04*np.sin(4*np.pi*f*t)
 elif kind=='jason':
  a=.11*np.sin(2*np.pi*73.42*t)+.05*np.sin(2*np.pi*110*t)+.04*np.sin(2*np.pi*146.83*t); a*=.65+.35*np.sin(2*np.pi*.5*t)
 elif kind=='lucia':
  a=.09*np.sin(2*np.pi*220*t)+.045*np.sin(2*np.pi*261.63*t)+.035*np.sin(2*np.pi*329.63*t); a*=.65+.35*np.sin(2*np.pi*.35*t)
 else:
  f=750 if kind=='hover' else 420
  a=.12*np.sin(2*np.pi*(f*t+300*t*t))*np.exp(-8*t)
 a=np.clip(a*fade,-.95,.95); pcm=(a*32767).astype('<i2').tobytes()
 b=io.BytesIO()
 with wave.open(b,'wb') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm)
 path=root/file;path.parent.mkdir(parents=True,exist_ok=True)
 result=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-f','wav','-i','pipe:0','-codec:a','libmp3lame','-b:a','128k','-y',str(path)],input=b.getvalue(),capture_output=True)
 if result.returncode: raise RuntimeError(result.stderr.decode())
 print(path.name, path.stat().st_size)
for file,duration,kind in [('ambiances/homepage_ambiance_vicecity_night_01.mp3',12,'night')]:render(file,duration,kind)
