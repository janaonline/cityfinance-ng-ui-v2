import { HttpEventType } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChange,
} from "@angular/core";
import { ToWords } from "to-words";
import { SweetAlert } from "sweetalert/typings/core";
import { DataEntryService } from "../../../features/xvi-fc/services/data-entry.service";
import { environment } from "../../../../environments/environment";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';
const swal: SweetAlert = require("sweetalert");
import { FormsModule } from '@angular/forms';
import { ToStorageUrlPipe } from "../../../core/pipes/to-storage-url.pipe";
const toWords = new ToWords();

@Component({
  selector: "app-common-file-upload",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, FormsModule, ToStorageUrlPipe],
  templateUrl: "./common-file-upload.component.html",
  styleUrls: ["./common-file-upload.component.scss"],
})
export class CommonFileUploadComponent implements OnInit {
  constructor(private dataEntryService: DataEntryService) {
    this.userData = JSON.parse(localStorage.getItem("userData") || '{}');
  }
  //number to word
  // converter = require("number-to-words");
  userData;
  @Input()
  quesName!: string;
  @Input()
  quesType!: string;
  @Input() isDisabled: any;
  @Input()
  dataFromParentN!: { pdf: { file: null; url: null; name: null; error: null; progress: null; }; excel: { file: null; url: null; name: null; error: null; progress: null; }; status: string; rejectReason: string; };
  @Input() itemObj: any;
  @Output()
  getFileUploadResult = new EventEmitter();
  @Output()
  fillAmount = new EventEmitter();
  @Input()
  delFileType: any;
  showPdf = true;
  showExcel = true;
  data:any = {
    pdf: {
      file: null,
      url: null,
      name: null,
      error: null,
      progress: null,
    },
    excel: {
      file: null,
      url: null,
      name: null,
      error: null,
      progress: null,
    },

    status: "",
    rejectReason: "",
    // status: this.stateAction,
    //  rejectReason: this.rejectReason,
  };
  dataAuditor = {
    pdf: {
      file: null,
      url: null,
      name: null,
      error: null,
      progress: null,
    },
    status: "",
    rejectReason: "",
    // status: this.stateAction,
    //  rejectReason: this.rejectReason,
  };
  @Input()
  amountObj!: any;
  @Input()
  itemError!: boolean;
  @Input()
  compName!: string;
  amount1Type: any;
  amount2Type!: string;
  maxNumber = "999999999999999.99";
  pdfError = "Pdf not uploaded!";
  inputNumberError = "Fields can not be blank!";
  storageBaseUrl:string = environment?.STORAGE_BASEURL;

  ngOnInit(): void {
    // debugger;
    console.log("isDisabled", this.isDisabled);

    if (this.quesName == "Auditor Report" || this.quesName == 'Supporting Document :') {
      this.showExcel = false;
    } else {
      this.showExcel = true;
    }
    console.log("this.dataFromParent", this.dataFromParentN);

    if (this.dataFromParentN) {
      this.data = this.dataFromParentN;
      //   //  this.stateAction = this.data?.status;
      //   //  this.rejectReason = this.data?.rejectReason;
    }
    if (
      this.quesType == "input" &&
      (!this.amountObj?.value|| this.amountObj?.value != null)
    ) {
      this.amountKeyUp("onLoad");
    }
  }
  ngOnChanges(changes: SimpleChange) {
    // console.log("chnages", changes);
    // console.log("chnages isDisabled", this.isDisabled);
    if (this.delFileType) {
      this.clearFile(this.delFileType, "onLoad");
    }
    if (this.dataFromParentN) {
      this.data = this.dataFromParentN;
     // console.log("changes..........", this.dataFromParentN);
    }
  }
  zeroError = false;
  amountKeyUp(type: string) {
    //  this.amount1Type = this.converter.toWords(this.amountObj?.value);
    if(this.amountObj.value === '0' || this.amountObj.value === '0'){
      this.amountObj.value = '';
      this.zeroError = true;
      setTimeout(()=>{
        this.zeroError = false;
      }, 1000)
      return
    }
    this.zeroError = false;
    if (this.amountObj.value && this.amountObj.value != "") {
      if (this.amountObj.value < 999999999999999.99) {
        this.amount2Type = toWords.convert(Number(this.amountObj?.value), {
          currency: true,
          doNotAddOnly: true,
        });
        // this.amountObj.value = parseFloat(this.amountObj.value);
        this.itemError = false;
        if (type == "click") this.amountObj.error = false;
      } else if (this.amountObj.value > 999999999999999.99) {
        this.amountObj.error = true;
        if (type == "click") this.itemError = false;
      }
    } else {
      this.amount2Type = "";
      if (type == "click") this.itemError = true;
    }

    this.fillAmount.emit(this.amountObj);
    if (this.compName == "AnnualAccount" && type == "click" && this.userData?.role == 'ULB')
      sessionStorage.setItem("changeInAnnualAcc", "true");
  }
  async fileChangeEvent(event: any, fileType: string) {
    let isfileValid =  this.dataEntryService.checkSpcialCharInFileName(event.target.files);
    if(isfileValid == false){
      swal("Error","File name has special characters ~`!#$%^&*+=[]\\\';,/{}|\":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n", 'error');
       return;
    }
    console.log(fileType, event);
    console.log("aaa", event.target.files[0].size);
    let files;
    let fileSize = event?.target?.files[0]?.size / 1048576; //size in mb
    console.log("aaa", fileSize);
    if (fileSize < 20) {
      if (typeof event != "boolean") files = event.target.files[0];
      else files = this.data[fileType].file;
      let fileExtension = files.name.split(".").pop();
      console.log(fileExtension, fileType);
      if (fileType == "excel") {
        if (fileExtension == "xls" || fileExtension == "xlsx") {
          this.uploadFile(files, files.name, files.type, fileType);
        } else {
          return swal("Error", "Only Excel File can be Uploaded.", "error");
        }
      } else if (fileType == "pdf") {
        if (fileExtension == "pdf") {
          this.uploadFile(files, files.name, files.type, fileType);
        } else {
          console.log("error type", event);
          swal("Error", "Only PDF File can be Uploaded.", "error");
          return;
        }
      } else {
        return;
      }
    } else {
      swal("File Limit Error", "Maximum 20 mb file can be allowed.", "error");
      return;
    }
  }
  Year = JSON.parse(localStorage.getItem("Years") || '{}');
  uploadFile(file: File, name: string, type: string, fileType: string | number) {
    console.log("this.data", this.data);
    let ulbId = this.userData?.ulbCode;
    let formName = 'annual_accounts';
    let folderName = `${this.userData?.role}/2022-23/${formName}/${ulbId}`
    if(this.userData?.role != 'ULB'){
      formName = 'annual_accounts';
      ulbId = sessionStorage.getItem('ulbCode');
      folderName = `${this.userData?.role}/2022-23/supporting_douments/${formName}/${ulbId}`
    }else {
      folderName = `${this.userData?.role}/2022-23/${formName}/${ulbId}`
    }
    // if (!ulbId) {
    //  // ulbId = localStorage.getItem("ulb_id");
    //   let formName = 'annual_accounts'
    //  }
    this.data[fileType].progress = 20;

    this.dataEntryService.newGetURLForFileUpload(name, type, folderName).subscribe(
      (s3Response) => {
        this.data[fileType].progress = 50;
        const res = s3Response.data[0];
        this.data[fileType].name = name;
        this.uploadFileToS3(
          file,
          res["url"],
          res["path"],
          name,
          fileType
        );
      },
      (err) => {
        console.log(err);
        this.data[fileType].file = file;
        this.data[fileType].error = true;
      }
    );
  }

  private uploadFileToS3(
    file: File,
    s3URL: string,
    fileAlias: string,
    name: any,
    fileType: string | number
  ) {
    this.data[fileType].progress = 60;
    this.dataEntryService.uploadFileToS3(file, s3URL).subscribe(
      (res) => {
        this.data[fileType].progress = 70;
        if (res.type === HttpEventType.Response) {
          this.data[fileType].progress = 100;
          this.data[fileType].file = file;
          this.data[fileType].url = fileAlias;
          if (this.compName == "AnnualAccount" && this.userData?.role == 'ULB')
            sessionStorage.setItem("changeInAnnualAcc", "true");
          this.getFileUploadResult.emit(this.data);
        }
      },
      (err) => {
        this.data[fileType].file = file;
        this.data[fileType].error = true;
      }
    );
  }
  clearFile(fileType: string | number, type: string) {
    if (this.isDisabled) {
      return;
    }
    for (const key in this.data[fileType]) {
      this.data[fileType][key] = null;
    }
    this.getFileUploadResult.emit(this.data);
    if (type == "click" && this.userData?.role == 'ULB') {
      sessionStorage.setItem("changeInAnnualAcc", "true");
    }
  }
}
