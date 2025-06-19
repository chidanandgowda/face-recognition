Steps to run locally:
1. Click on Code and download the ZIP folder
2. Create two new folders in static called `uploads` and `user-images`
   The folder structure should look like
   -face-recognition  
       -static  
           -uploads  
           -user-images  
           -script.js  
       -templates   
           -login.html  
       -app.py  
       -README.md  
4. Add your images in static/user-images
5. Open Terminal or Command Prompt and run `pip install mediapipe opencv-python flask deepface numpy`
6. cd to the folder face-recognition and run `python app.py` in the terminal
7. Click on the link starting with localhost://
