import {Component} from '@angular/core';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {ActionSheetController, LoadingController, NavController, Platform, ToastController} from '@ionic/angular';
import {File} from '@ionic-native/file/ngx';
import {FilePath} from '@ionic-native/file-path/ngx';

declare var cordova: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
 // currentImage: any;

  constructor(public navCtrl: NavController, public camera: Camera,
              public file: File, private filePath: FilePath, public actionSheetCtrl: ActionSheetController,
              public toastCtrl: ToastController, public platform: Platform, public loadingCtrl: LoadingController) { }
  lastImage: string = null;

// Create a new name for the image
 static createFileName() {
  const d = new Date(),
      n = d.getTime();
   return n + '.jpg';
}

/*
  takePicture() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      this.currentImage = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      // Handle error
      console.log('Camera issue:' + err);
    });
  }*/

  async presentActionSheet() {
   const actionSheet = await  this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
   actionSheet.present();
  }
  takePicture(sourceType) {
    // Create options for the Camera Dialog
    const options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
            .then(filePath => {
              const correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
              const currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
              console.log(correctPath);
              console.log(currentName);
              console.log(imagePath);
              this.copyFileToLocalDir(correctPath, currentName, HomePage.createFileName());
            });
      } else {
        const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, HomePage.createFileName());
      }
    }, (err) => {
      this.presentToast('Error while selecting image.');
    });
  }

// Copy the image to a local folder
 copyFileToLocalDir(namePath, currentName, newFileName) {
  this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
    this.lastImage = newFileName;
  }, error => {
    this.presentToast('Error while storing file.');
  });
}
async presentToast(text) {
  const toast = await this.toastCtrl.create({
    message: text,
    duration: 3000,
    position: 'top'
  });
  toast.present();
}

// Always get the accurate path to your apps folder
pathForImage(img) {
  if (img === null) {
    return '';
  } else {
    return cordova.file.dataDirectory + img;
  }
}
}
