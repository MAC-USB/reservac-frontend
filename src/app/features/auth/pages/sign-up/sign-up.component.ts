import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { NavigationExtras, Router } from "@angular/router";
import { LoadingBarService } from "@ngx-loading-bar/core";
import { VerifyUSBIdentityResponse } from "../../models/verifyUsbIdentityResponse";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "dialog-errorSignUp",
  templateUrl: "dialog-errorSignUp.html",
})
export class DialogSignUp {
  constructor(public dialogRef: MatDialogRef<DialogSignUp>) {}

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.close();
  }
}

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.css"],
})
export class SignUpComponent implements OnInit {
  public form: FormGroup;
  public error: boolean;
  public identityResponse: VerifyUSBIdentityResponse;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private LoadingBar: LoadingBarService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // console.log("y yo tambien");
    this.error = false;

    this.form = this.formBuilder.group({
      //usbId: [null, [Validators.required, Validators.pattern("[0-9][0-9]-[0-9]{5}"), Validators.maxLength(8), Validators.minLength(8)]],
      usbId: [null, [Validators.required]],
      clave: [null, [Validators.required]],
      check: false,
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.LoadingBar.start();
      let usbId = this.form.value.usbId;
      let pwd = this.form.value.clave;
      this.authService.verifyUsbIdentity(usbId, pwd).subscribe(
        (identityResponse) => {
          this.LoadingBar.complete();
          this.identityResponse = identityResponse;
          localStorage.setItem("tokenSignUp", this.identityResponse.token);
          const navigationExtras: NavigationExtras = {
            state: {
              example: [
                this.identityResponse.name,
                this.identityResponse.usbId,
                this.identityResponse.userType,
              ],
            },
          };
          this.router.navigate(
            ["auth/signup/verify-password"],
            navigationExtras
          );
        },
        (error) => {
          this.LoadingBar.complete();
          const dialogRef = this.dialog.open(DialogSignUp);
        }
      );
    }
  }
}
