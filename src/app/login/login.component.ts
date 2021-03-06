import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, AuthenticationService } from '@/_services';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            user_email: ['', Validators.required],
            user_password: ['', Validators.required]
        });

        // var cmd = 'curl -H "Authorization: OAuth eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IldlbGNvbWVAMTIzIiwibmFtZSI6IkRpbXBhbCBTaW5naCIsImlhdCI6MTYzOTQwMTY4Mn0.heW-UDQBUS-pB04d18ty7x5-XUUC2RbXcvL5R1nf6CXF42xNsTXX8ROF4LyuJzB-wzvdxp_F0-R-3oaUA_O6YQ" http://www.example.com';

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.user_email.value, this.f.user_password.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.loading = false;
                    if(data) {
                        this.router.navigate([this.returnUrl]);
                    } else {
                        this.alertService.error('Invalid Credentials');
                    }
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
