webpackJsonp(["main"],{

/***/ "../../../../../src/$$_lazy_route_resource lazy recursive":
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"app/shakecast-admin/shakecast-admin.module": [
		"../../../../../src/app/shakecast-admin/shakecast-admin.module.ts"
	],
	"app/shakecast/shakecast.module": [
		"../../../../../src/app/shakecast/shakecast.module.ts"
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids)
		return Promise.reject(new Error("Cannot find module '" + req + "'."));
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(function() {
		return __webpack_require__(ids[0]);
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = "../../../../../src/$$_lazy_route_resource lazy recursive";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "../../../../../src/app/app.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "* {\n    font-family: Arial;\n    color: #444444;\n}\n\n.stick-to-top {\n    position: fixed;\n    top: 0;\n    width: 100%;\n    z-index: 500;\n}\n\nbody {\n    margin: 0;\n}\n\nhtml, body\n{\n    height: 100%;\n}\n\n/* For Tables */\n\n.my-table th, .my-table td {\n    text-align: left;\n    padding: 5px;\n    border-bottom: 1px solid #ddd;\n}\n\n.col-1 {\n    width: 8.33%;\n    display: inline-block;\n}\n\n.col-2 {\n    width: 16.66%;\n    display: inline-block;\n}\n\n.col-3 {\n    width: 25%;\n    display: inline-block;\n}\n\n.col-4 {\n    width: 33.33%;\n    display: inline-block;\n}\n\n.col-5 {\n    width: 41.66%;\n    display: inline-block;\n}\n\n.col-6 {\n    width: 50%;\n    display: inline-block;\n}\n\n.col-7 {\n    width: 58.33%;\n    display: inline-block;\n}\n\n.col-8 {\n    width: 66.66%;\n    display: inline-block;\n}\n\n.col-9 {\n    width: 75%;\n    display: inline-block;\n}\n\n.col-10 {\n    width: 83.33%;\n    display: inline-block;\n}\n\n.col-11 {\n    width: 91.66%;\n    display: inline-block;\n}\n\n.col-12 {\n    width: 100%;\n    display: inline-block;\n}\n\n.router-buffer {\n    width:100%;\n    height: 100px;\n}\n\n.button {\n    display: inline-block;\n    border: 3px solid #55aaee;\n    background: #ffffff;\n    margin: 5px;\n    padding: 5px;\n    cursor: pointer;\n    border-radius: 5px;\n    box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n}\n\n.button:hover {\n    background: #55aaee;\n    color: #ffffff;\n    box-shadow: 1px 1px 4px 2px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 4px 2px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 4px 2px rgba(0,0,0,0.3);\n}\n\n.the-view {\n    min-height: 100vh;\n}\n\n.shaking-table:hover th {\n  opacity: 1;\n}\n\n.marker-cluster-gray {\n    background: rgba(127,127,127,.7)\n}\n\n.marker-cluster-gray div {\n    background: rgba(127,127,127,.9)\n}\n\n.marker-cluster-green {\n    background: rgba(0,127,0,.7)\n}\n\n.marker-cluster-green div {\n    background: rgba(0,127,0,.9)\n}\n\n.marker-cluster-yellow {\n    background: rgba(255,215,0,.7)\n}\n\n.marker-cluster-yellow div {\n    background: rgba(255,215,0,.9)\n}\n\n.marker-cluster-orange {\n    background: rgba(255,165,0,.7)\n}\n\n.marker-cluster-orange div {\n    background: rgba(255,165,0,.9)\n}\n\n.marker-cluster-red {\n    background: rgba(255,0,0,.7)\n}\n\n.marker-cluster-red div {\n    background: rgba(255,0,0,.9)\n}\n\n.marker-cluster span {\n    color: white;\n    font-weight: bold;\n}\n\np a {\n    color: #55aaee\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<div *ngIf=\"router.url.indexOf('/shakecast') >= 0\">\n    <navbar></navbar>\n    <page-title></page-title>\n</div>\n<div class=\"router-buffer\">\n</div>\n\n<div class=\"the-view\">\n    <router-outlet></router-outlet>\n</div>\n\n<messaging></messaging>\n\n<simple-notifications [options]=\"options\"></simple-notifications>\n\n<screen-dimmer></screen-dimmer>\n\n<loading-comp></loading-comp>\n"

/***/ }),

/***/ "../../../../../src/app/app.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var user_service_1 = __webpack_require__("../../../../../src/app/login/user.service.ts");
var AppComponent = /** @class */ (function () {
    function AppComponent(userService, router) {
        this.userService = userService;
        this.router = router;
        this.options = {
            timeOut: 4000,
            lastOnBottom: true,
            clickToClose: true,
            maxLength: 0,
            maxStack: 7,
            showProgressBar: false,
            pauseOnHover: true
        };
        this.subscriptions = [];
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        // Skip to dashboard if user already logged in
        this.subscriptions.push(this.userService.checkLoggedIn().subscribe(function (data) {
            if (data.loggedIn === true) {
                _this.userService.isAdmin = data.isAdmin;
                _this.router.navigate(['/shakecast']);
            }
        }));
    };
    AppComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    AppComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app-root',
            template: __webpack_require__("../../../../../src/app/app.component.html"),
            styles: [__webpack_require__("../../../../../src/app/app.component.css")],
            encapsulation: core_1.ViewEncapsulation.None,
        }),
        __metadata("design:paramtypes", [user_service_1.UserService,
            router_1.Router])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;


/***/ }),

/***/ "../../../../../src/app/app.module.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var platform_browser_1 = __webpack_require__("../../../platform-browser/esm5/platform-browser.js");
var animations_1 = __webpack_require__("../../../platform-browser/esm5/animations.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
var http_2 = __webpack_require__("../../../common/esm5/http.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var app_component_1 = __webpack_require__("../../../../../src/app/app.component.ts");
var app_routing_1 = __webpack_require__("../../../../../src/app/app.routing.ts");
// top level modules
var login_module_1 = __webpack_require__("../../../../../src/app/login/login.module.ts");
var shakecast_module_1 = __webpack_require__("../../../../../src/app/shakecast/shakecast.module.ts");
var shakecast_admin_module_1 = __webpack_require__("../../../../../src/app/shakecast-admin/shakecast-admin.module.ts");
// navbar
var nav_component_1 = __webpack_require__("../../../../../src/app/nav/nav.component.ts");
// page title
var title_component_1 = __webpack_require__("../../../../../src/app/title/title.component.ts");
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var angular2_notifications_2 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
// General services used by multiple modules
var user_service_1 = __webpack_require__("../../../../../src/app/login/user.service.ts");
var earthquake_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake.service.ts");
var facility_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts");
var notification_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification.service.ts");
var shared_module_1 = __webpack_require__("../../../../../src/app/shared/shared.module.ts");
var map_service_1 = __webpack_require__("../../../../../src/app/shared/maps/map.service.ts");
var shakemap_service_1 = __webpack_require__("../../../../../src/app/shared/maps/shakemap.service.ts");
var screen_dimmer_service_1 = __webpack_require__("../../../../../src/app/shared/screen-dimmer/screen-dimmer.service.ts");
var group_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/group.service.ts");
var users_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/users.service.ts");
var time_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/config/time.service.ts");
var stick_to_top_service_1 = __webpack_require__("../../../../../src/app/shared/directives/stick-to-top.service.ts");
var messaging_component_1 = __webpack_require__("../../../../../src/app/messaging/messaging.component.ts");
var messages_service_1 = __webpack_require__("../../../../../src/app/shared/messages.service.ts");
var cookie_service_1 = __webpack_require__("../../../../../src/app/shared/cookie.service.ts");
var loading_service_1 = __webpack_require__("../../../../../src/app/loading/loading.service.ts");
var loading_component_1 = __webpack_require__("../../../../../src/app/loading/loading.component.ts");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                animations_1.BrowserAnimationsModule,
                angular2_notifications_1.SimpleNotificationsModule,
                app_routing_1.routing,
                http_2.HttpClientModule,
                http_1.JsonpModule,
                shakecast_module_1.ShakeCastModule,
                shakecast_admin_module_1.ShakeCastAdminModule,
                login_module_1.LoginModule,
                shared_module_1.SharedModule
            ],
            declarations: [
                app_component_1.AppComponent,
                nav_component_1.NavComponent,
                title_component_1.TitleComponent,
                messaging_component_1.MessagingComponent,
                loading_component_1.LoadingComponent
            ],
            providers: [
                app_routing_1.appRoutingProviders,
                user_service_1.UserService,
                earthquake_service_1.EarthquakeService,
                facility_service_1.FacilityService,
                map_service_1.MapService,
                shakemap_service_1.ShakemapService,
                stick_to_top_service_1.StickToTopService,
                screen_dimmer_service_1.ScreenDimmerService,
                notification_service_1.NotificationService,
                group_service_1.GroupService,
                users_service_1.UsersService,
                time_service_1.TimeService,
                title_service_1.TitleService,
                messages_service_1.MessagesService,
                cookie_service_1.CookieService,
                loading_service_1.LoadingService,
                angular2_notifications_2.NotificationsService
            ],
            bootstrap: [app_component_1.AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;


/***/ }),

/***/ "../../../../../src/app/app.routing.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var shakecast_routing_1 = __webpack_require__("../../../../../src/app/shakecast/shakecast.routing.ts");
var login_routing_1 = __webpack_require__("../../../../../src/app/login/login.routing.ts");
var shakecast_admin_routing_1 = __webpack_require__("../../../../../src/app/shakecast-admin/shakecast-admin.routing.ts");
var login_guard_1 = __webpack_require__("../../../../../src/app/auth/login.guard.ts");
var admin_guard_1 = __webpack_require__("../../../../../src/app/auth/admin.guard.ts");
var appRoutes = shakecast_routing_1.shakecastRoutes.concat(login_routing_1.loginRoutes, shakecast_admin_routing_1.shakecastAdminRoutes);
exports.appRoutingProviders = [
    login_guard_1.LoginGuard,
    admin_guard_1.AdminGuard
];
exports.routing = router_1.RouterModule.forRoot(appRoutes);


/***/ }),

/***/ "../../../../../src/app/auth/admin.guard.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var user_service_1 = __webpack_require__("../../../../../src/app/login/user.service.ts");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var AdminGuard = /** @class */ (function () {
    function AdminGuard(user, router, notService) {
        this.user = user;
        this.router = router;
        this.notService = notService;
    }
    AdminGuard.prototype.canActivate = function (route, state) {
        console.log('AdminGuard#canActivate called');
        if (this.user.isAdmin) {
            return true;
        }
        // not logged in so redirect to login page
        this.notService.error('Admin', 'Login as an admin to access this page', { setTimeout: 5000 });
    };
    AdminGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [user_service_1.UserService,
            router_1.Router,
            angular2_notifications_1.NotificationsService])
    ], AdminGuard);
    return AdminGuard;
}());
exports.AdminGuard = AdminGuard;


/***/ }),

/***/ "../../../../../src/app/auth/login.guard.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var user_service_1 = __webpack_require__("../../../../../src/app/login/user.service.ts");
var LoginGuard = /** @class */ (function () {
    function LoginGuard(user, router) {
        this.user = user;
        this.router = router;
    }
    LoginGuard.prototype.canActivate = function (route, state) {
        console.log('LoginGuard#canActivate called');
        if (this.user.loggedIn) {
            return true;
        }
        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    };
    LoginGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [user_service_1.UserService,
            router_1.Router])
    ], LoginGuard);
    return LoginGuard;
}());
exports.LoginGuard = LoginGuard;


/***/ }),

/***/ "../../../../../src/app/loading/loading.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".container {\n    position: fixed;\n    top: 50%;\n    left: 50%;\n    -webkit-transform: translateX(-50%) translateY(-50%);\n            transform: translateX(-50%) translateY(-50%);\n    text-align: center;\n}\n\n.spinning-icon {\n    height: 50px;\n    width: 50px;\n    border-radius: 50%;\n    position: relative;\n    border: 2px dashed white;\n    -webkit-transform: translateX(-50%);\n            transform: translateX(-50%);\n    -webkit-animation-name: spin;\n            animation-name: spin;\n    -webkit-animation-duration: 4000ms;\n            animation-duration: 4000ms;\n    -webkit-animation-iteration-count: infinite;\n            animation-iteration-count: infinite;\n    -webkit-animation-timing-function: linear;\n            animation-timing-function: linear;\n}\n\n.loading {\n    margin: 0;\n    text-align: center;\n    color: white;\n}\n\n.messages {\n    background: rgba(0,0,0,.4);\n    padding: 10px;\n    border-radius: 10px;\n}\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/loading/loading.component.html":
/***/ (function(module, exports) {

module.exports = "<div *ngIf=\"loadingService.loading.length > 0\" class=\"container\">\n\t<img class=\"spinning-icon\" src=\"/assets/sc_logo.png\">\n\t<div class=\"messages\">\n\t\t<div *ngFor=\"let data of loadingService.loading\">\n\t\t\t<h3 class=\"loading\">Loading {{ data }}...</h3>\n\t\t</div>\n\t</div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/loading/loading.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var loading_service_1 = __webpack_require__("../../../../../src/app/loading/loading.service.ts");
var LoadingComponent = /** @class */ (function () {
    function LoadingComponent(loadingService, ref) {
        this.loadingService = loadingService;
        this.ref = ref;
        this.subscriptions = [];
    }
    LoadingComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.loadingService.update.subscribe(function (update) {
            _this.ref.detectChanges();
        }));
    };
    LoadingComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    LoadingComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    LoadingComponent = __decorate([
        core_1.Component({
            selector: 'loading-comp',
            template: __webpack_require__("../../../../../src/app/loading/loading.component.html"),
            styles: [__webpack_require__("../../../../../src/app/loading/loading.component.css")]
        }),
        __metadata("design:paramtypes", [loading_service_1.LoadingService,
            core_1.ChangeDetectorRef])
    ], LoadingComponent);
    return LoadingComponent;
}());
exports.LoadingComponent = LoadingComponent;


/***/ }),

/***/ "../../../../../src/app/loading/loading.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var LoadingService = /** @class */ (function () {
    function LoadingService() {
        this.loading = [];
        this.update = new ReplaySubject_1.ReplaySubject(1);
    }
    LoadingService.prototype.add = function (name) {
        this.loading.push(name);
        this.update.next(name);
    };
    LoadingService.prototype.finish = function (name) {
        var new_loading = [];
        for (var idx in this.loading) {
            if (this.loading[idx] != name) {
                new_loading.push(this.loading[idx]);
            }
        }
        this.loading = new_loading;
        this.update.next('remove-' + name);
    };
    LoadingService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], LoadingService);
    return LoadingService;
}());
exports.LoadingService = LoadingService;


/***/ }),

/***/ "../../../../../src/app/login/login.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".login-title {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    padding: 10px;\n    text-align: center;\n    margin-top: 5%;\n}\n\n.login-title h1 {\n    color: #444444;\n    font-size: 85px;\n    font-family: Arial;\n    margin: 0px\n}\n\n.login-title * {\n    display: inline-block;\n}\n\n.login-title .sc-logo {\n    width: 80px;\n    height: auto;\n}\n\n.login-title .logo {\n    border-radius: 50%;\n}\n\n.login {\n    padding: 10px;\n    margin-left: 20px;\n}\n\ninput {\n    font-size: 24px;\n    padding: 5px;\n    margin: 5px;\n}\n\n.login-form {\n    width: 30%;\n    min-width: 300px;\n    margin-left: auto;\n    margin-right: auto;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    margin-top: 2%;\n    border-radius: 5px;\n    box-shadow: 1px 1px 15px 1px #55aaee;\n    -webkit-box-shadow: 1px 1px 15px 1px #55aaee;\n    -moz-box-shadow: 1px 1px 15px 1px #55aaee;\n    background: #ffffff;\n}\n\n.form-contents {\n    padding: 20px;\n}\n\n.button {\n    float: right;\n}\n\n.button-container {\n    margin-left: auto;\n    margin-right: auto;\n    text-align: center;\n}\n\n.usgs-logo-container {\n    position: fixed;\n    bottom: 0;\n    width: 100%;\n    z-index: -1;\n}\n\n.usgs-logo {\n    float: left;\n    padding: 10px;\n    opacity: .4;\n    margin-right: 5%;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/login/login.component.html":
/***/ (function(module, exports) {

module.exports = "\n<div class=\"login-title\">\n    \n    <div class=\"sc-logo\">\n        <img class=\"logo\" src=\"/static/sc_logo.png\">\n    </div>\n\n    <h1>ShakeCast</h1>\n\n</div>\n\n<form class=\"login-form\">\n    <div class=\"form-contents\">\n        <input type=\"text\" id=\"username\" name=\"username\"\n        placeholder=\"Username\" [(ngModel)]=\"user.username\"\n        required>\n\n        <input type=\"password\" id=\"password\" name=\"password\" \n        placeholder=\"Password\" [(ngModel)]=\"user.password\"\n        required>\n\n        <h2 class=\"button\" (click)=\"onSubmit(user.username, user.password)\">Login</h2>\n    </div>\n</form>\n\n<div class=\"usgs-logo-container\">\n    <img class=\"usgs-logo\" src=\"/static/USGS_logo.png\">\n</div>"

/***/ }),

/***/ "../../../../../src/app/login/login.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var user_service_1 = __webpack_require__("../../../../../src/app/login/user.service.ts");
var LoginComponent = /** @class */ (function () {
    function LoginComponent(userService, router, notService) {
        this.userService = userService;
        this.router = router;
        this.notService = notService;
        this.user = new user_service_1.User('', '');
    }
    LoginComponent.prototype.onSubmit = function (username, password) {
        var _this = this;
        this.userService.login(username, password).subscribe(function (result) {
            if (result.success) {
                _this.router.navigate(['/shakecast']);
                _this.notService.success('Login', 'Welcome, ' + _this.userService.username);
            }
            else {
                _this.notService.error('Login Failed', 'Invalid Username or Password');
            }
        });
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'login',
            template: __webpack_require__("../../../../../src/app/login/login.component.html"),
            styles: [__webpack_require__("../../../../../src/app/login/login.component.css")]
        }),
        __metadata("design:paramtypes", [user_service_1.UserService,
            router_1.Router,
            angular2_notifications_1.NotificationsService])
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;


/***/ }),

/***/ "../../../../../src/app/login/login.module.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var common_1 = __webpack_require__("../../../common/esm5/common.js");
var forms_1 = __webpack_require__("../../../forms/esm5/forms.js");
var login_component_1 = __webpack_require__("../../../../../src/app/login/login.component.ts");
//import { loginRouting } from './login.routing';
var LoginModule = /** @class */ (function () {
    function LoginModule() {
    }
    LoginModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
            ],
            declarations: [
                login_component_1.LoginComponent
            ],
            providers: []
        })
    ], LoginModule);
    return LoginModule;
}());
exports.LoginModule = LoginModule;


/***/ }),

/***/ "../../../../../src/app/login/login.routing.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var login_component_1 = __webpack_require__("../../../../../src/app/login/login.component.ts");
exports.loginRoutes = [
    {
        path: 'login',
        component: login_component_1.LoginComponent
    }
];


/***/ }),

/***/ "../../../../../src/app/login/user.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
// user.service.ts
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/map.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/catch.js");
var Observable_1 = __webpack_require__("../../../../rxjs/_esm5/Observable.js");
__webpack_require__("../../../../rxjs/_esm5/add/observable/of.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/do.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/delay.js");
var User = /** @class */ (function () {
    function User(username, password) {
        this.username = username;
        this.password = password;
    }
    return User;
}());
exports.User = User;
var UserService = /** @class */ (function () {
    function UserService(_http, router) {
        this._http = _http;
        this.router = router;
        this.loggedIn = false;
        this.isAdmin = false;
        this.username = '';
    }
    UserService.prototype.login = function (username, password) {
        var _this = this;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this._http.post('/api/login', JSON.stringify({ username: username,
            password: password }), { headers: headers })
            .map(function (res) { return res.json(); })
            .do(function (res) {
            if (res.success) {
                _this.loggedIn = true;
                _this.isAdmin = res.isAdmin;
                _this.username = username;
            }
        });
    };
    UserService.prototype.logout = function () {
        var _this = this;
        this._http.get('/logout').map(function (resp) { return resp.json; })
            .subscribe(function (resp) {
            _this.loggedIn = false;
            _this.router.navigate(['/login']);
        });
    };
    UserService.prototype.checkLoggedIn = function () {
        var _this = this;
        return this._http.get('/logged_in')
            .map(function (resp) { return resp.json(); })
            .do(function (resp) { return _this.loggedIn = resp.success; })
            .catch(this.handleError);
    };
    UserService.prototype.extractData = function (res) {
        var body = res.json();
        return body.data || {};
    };
    UserService.prototype.handleError = function (error) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        var errMsg = (error.message) ? error.message :
            error.status ? error.status + " - " + error.statusText : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable_1.Observable.throw(errMsg);
    };
    UserService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            router_1.Router])
    ], UserService);
    return UserService;
}());
exports.UserService = UserService;


/***/ }),

/***/ "../../../../../src/app/messaging/messaging.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var messages_service_1 = __webpack_require__("../../../../../src/app/shared/messages.service.ts");
var TimerObservable_1 = __webpack_require__("../../../../rxjs/_esm5/observable/TimerObservable.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var cookie_service_1 = __webpack_require__("../../../../../src/app/shared/cookie.service.ts");
var MessagingComponent = /** @class */ (function () {
    function MessagingComponent(notService, messService, cookieService, _router) {
        this.notService = notService;
        this.messService = messService;
        this.cookieService = cookieService;
        this._router = _router;
        this.subscriptions = [];
        this.messageTime = 0;
    }
    MessagingComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(TimerObservable_1.TimerObservable.create(0, 10000)
            .subscribe(function (data) {
            if (_this._router.url != '/login') {
                _this.messService.getMessages();
            }
        }));
        this.subscriptions.push(this.messService.messages.subscribe(function (messages) {
            var maxTime = 0;
            var messageTime = parseInt(_this.cookieService.getCookie('messageTime'));
            if (isNaN(messageTime)) {
                messageTime = 0;
            }
            for (var messTime in messages) {
                var numTime = parseInt(messTime);
                if (numTime > messageTime) {
                    // Print message
                    _this.makeNotification(messages[messTime]);
                    if (numTime > maxTime) {
                        maxTime = numTime;
                    }
                }
            }
            if (maxTime > 0) {
                _this.cookieService.setCookie('messageTime', maxTime.toString());
            }
        }));
    };
    MessagingComponent.prototype.makeNotification = function (message) {
        if (message['title'] && message['message']) {
            if (message['success'] === true) {
                this.notService.success(message['title'], message['message'], { timeOut: 0 });
            }
            else if (message['success'] === false) {
                this.notService.error(message['title'], message['message'], { timeOut: 0 });
            }
            else {
                this.notService.info(message['title'], message['message'], { timeOut: 0 });
            }
        }
    };
    MessagingComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    MessagingComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    MessagingComponent = __decorate([
        core_1.Component({
            selector: 'messaging',
            template: '',
        }),
        __metadata("design:paramtypes", [angular2_notifications_1.NotificationsService,
            messages_service_1.MessagesService,
            cookie_service_1.CookieService,
            router_1.Router])
    ], MessagingComponent);
    return MessagingComponent;
}());
exports.MessagingComponent = MessagingComponent;


/***/ }),

/***/ "../../../../../src/app/nav/nav.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".header {\n    background-color: #fff;\n    border-radius: 10px;\n    border: 5px solid #55aaee;\n    height: 40px;\n    position: fixed;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    vertical-align: middle;\n    -webkit-transition: top 0.2s ease-in-out;\n    transition: top 0.2s ease-in-out;\n    z-index: 1000;\n    width: 80%;\n    top:0;\n    margin-top: 5px;\n    min-width: 695px;\n    max-width: 1000px;\n    left: 50%;\n    -webkit-transform: translateX(-50%);\n            transform: translateX(-50%);\n    box-shadow: 0px 2px 3px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 0px 2px 3px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 0px 2px 3px 1px rgba(0,0,0,0.3);\n}\n\n.header-space {\n    width: 100%;\n    height: 40px;\n}\n\np {\n    display: inline-block;\n    margin-bottom: 0px;\n    margin-left: 35px;\n    margin-top: 0px;\n    position: absolute;\n    font-weight: bold;\n}\n\n.sc-logo {\n    display: inline-block;\n    border-radius: 50%;\n    margin-top: 0px;\n    margin-left: 10px;\n    height: 20px;\n    width: auto;\n}\n\n.cont {\n    position: relative;\n    width: 165px;\n    margin-left: auto;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n\n.nav-bar {\n    margin-left: 5px;\n}\n\n.link {\n    display: inline-block;\n    text-align: center;\n    border-bottom: 3px solid #eeeeee;\n    background: #eeeeee;\n    padding:5px;\n    margin-left:5px;\n    cursor: pointer;\n    box-shadow: 1px 1px 2px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 2px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 2px 1px rgba(0,0,0,0.3);\n}\n\n.link:hover {\n    border-bottom: 3px solid #55aaee;\n    box-shadow: 0px 0px 3px 1px rgba(0,0,0,0.4);\n    -webkit-box-shadow: 0px 0px 3px 1px rgba(0,0,0,0.4);\n    -moz-box-shadow: 0px 0px 3px 1px rgba(0,0,0,0.4);\n}\n\na {\n    text-decoration: none;\n    font-weight: bold;\n}\n\n.block-stack {\n    height: 40px;\n    margin-left: auto;\n}\n\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/nav/nav.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"header\" [@scrollChange]=\"scrollUp\" (mouseover)=\"setHover(true)\" (mouseleave)=\"setHover(false)\">\n    <div class=\"nav-bar\">\n        <div *ngIf=\"!(router.url.indexOf('/shakecast-admin') >= 0)\">\n            <div class=\"link\" (click)=\"changeRoute('/shakecast/dashboard')\">\n                <a routerLink=\"/shakecast/dashboard\">Dashboard</a>\n            </div>\n            <div class=\"link\" (click)=\"changeRoute('/shakecast/user-profile')\">\n                <a routerLink=\"/shakecast/user-profile\">User Profile</a>\n            </div>\n            <div class=\"link\" (click)=\"changeRoute('/shakecast-admin')\">\n                <a routerLink=\"/shakecast-admin\">Admin Panel</a>\n            </div>\n            <div class=\"link\" (click)=\"logout()\">\n                <a (click)=\"logout()\">Logout</a>\n            </div>\n        </div>\n        <div *ngIf=\"router.url.indexOf('/shakecast-admin') >= 0\">\n            <div class=\"link\" (click)=\"changeRoute('/shakecast-admin/facilities')\">\n                <a routerLink=\"/shakecast-admin/facilities\">Facilities</a>\n            </div>\n            <div class=\"link\" (click)=\"changeRoute('/shakecast-admin/users')\">\n                <a routerLink=\"/shakecast-admin/users\">Users and Groups</a>\n            </div>\n            <div class=\"link\" (click)=\"changeRoute('/shakecast-admin/scenarios')\">\n                <a routerLink=\"/shakecast-admin/scenarios\">Scenarios</a>\n            </div>\n            <div class=\"link\" (click)=\"changeRoute('/shakecast-admin/notifications')\">\n                <a routerLink=\"/shakecast-admin/notifications\">Notifications</a>\n            </div>\n            <div class=\"link\" (click)=\"changeRoute('/shakecast-admin/config')\">\n                <a routerLink=\"/shakecast-admin/config\">Settings</a>\n            </div>\n            <div class=\"link\" (click)=\"changeRoute('/shakecast')\">\n                <a routerLink=\"/shakecast\">Back to ShakeCast</a>\n            </div>\n            <div class=\"link\" (click)=\"logout()\">\n                <a (click)=\"logout()\">Logout</a>\n            </div>\n        </div>\n    </div>\n    <div class=\"cont\">\n        <!-- <img class=\"sc-logo\" src=\"/images/sc_logo.png\"> -->\n        <img class=\"block-stack\" src=\"/assets/block_stack2.png\">\n        <!-- <p>ShakeCast</p> -->\n    </div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/nav/nav.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var TimerObservable_1 = __webpack_require__("../../../../rxjs/_esm5/observable/TimerObservable.js");
var animations_1 = __webpack_require__("../../../../../src/app/shared/animations/animations.ts");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var user_service_1 = __webpack_require__("../../../../../src/app/login/user.service.ts");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var NavComponent = /** @class */ (function () {
    function NavComponent(userService, notService, router) {
        this.userService = userService;
        this.notService = notService;
        this.router = router;
        this.scrollUp = 'down';
        this.scrolled = document.querySelector('body').scrollTop;
        this.ignoreTime = 0;
        this.hovering = false;
    }
    NavComponent.prototype.ngOnInit = function () {
        var _this = this;
        TimerObservable_1.TimerObservable.create(0, 500)
            .subscribe(function (x) {
            if (!_this.hovering) {
                _this.ignoreTime += .5;
                if (_this.scrolled !== document.scrollingElement.scrollTop) {
                    if (_this.scrolled > (document.scrollingElement.scrollTop) ||
                        (document.scrollingElement.scrollTop === 0)) {
                        // show the element
                        if (_this.scrollUp === 'up') {
                            console.log('scroll up');
                            _this.scrollUp = 'down';
                            _this.ignoreTime = 0;
                        }
                    }
                    else if (_this.scrolled < document.scrollingElement.scrollTop) {
                        // hide the element
                        if (_this.scrollUp === 'down') {
                            console.log('scroll down');
                            _this.scrollUp = 'up';
                        }
                    }
                    _this.scrolled = document.scrollingElement.scrollTop;
                }
                console.log(_this.scrolled);
                // hide the header after 5 seconds of ignoreTime 
                // unless at the top of the page
                if ((_this.ignoreTime > 5) && (document.scrollingElement.scrollTop !== 0)) {
                    _this.scrollUp = 'up';
                }
            }
        });
    };
    NavComponent.prototype.setHover = function (boolIn) {
        this.hovering = boolIn;
        if (this.hovering) {
            this.scrollUp = 'down';
            this.ignoreTime = 0;
        }
    };
    NavComponent.prototype.changeRoute = function (url) {
        this.router.navigate([url]);
    };
    NavComponent.prototype.logout = function () {
        this.userService.logout();
        this.notService.success('Logout', 'success');
    };
    NavComponent = __decorate([
        core_1.Component({
            selector: 'navbar',
            template: __webpack_require__("../../../../../src/app/nav/nav.component.html"),
            styles: [__webpack_require__("../../../../../src/app/nav/nav.component.css")],
            animations: [animations_1.navAnimation]
        }),
        __metadata("design:paramtypes", [user_service_1.UserService,
            angular2_notifications_1.NotificationsService,
            router_1.Router])
    ], NavComponent);
    return NavComponent;
}());
exports.NavComponent = NavComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/config/config.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".settings {\n    position: relative;\n    z-index: 2;\n    background: #fff;\n}\n\n.section {\n    border-bottom: 20px dashed #efefef;\n    padding: 10px;\n    margin: 10px;\n}\n\n.item {\n    display: inline-block;\n    margin: 5px;\n    border: 2px solid #55aaee;\n    border-radius: 5px;\n    padding: 10px;\n    box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n}\n\n.item p {\n    display: inline-block;\n}\n\n.item label {\n    font-weight: bold\n}\n\n.item input {\n    font-size: 15px;\n}\n\nth {\n    text-align: right;\n}\n\n.spin-table td, .spin-table tr {\n    border-width: 0px;\n}\n\n.save, .reset {\n    display: inline-block;\n    margin-left: 10px;\n    margin-right: 10px;\n}\n\n.button:hover .fa {\n    color:white;\n}\n\n#db-str {\n    text-align: center;\n    margin: 2px;\n    font-style: italic;\n    color: rgba(0,0,0,.5);\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/config/config.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"settings\">\n    <div class=\"section\">\n        <h1 class=\"header\">\n            Server Settings\n        </h1>\n        <div class=\"item\">\n            <label for=\"server-name\">Rename your Server: </label>\n            <input id=\"server-name\" \n                            placeholder=\"ShakeCast\" \n                            [(ngModel)]=\"configs.Server.name\">\n        </div>\n\n        <div class=\"item\">\n            <label for=\"networks\">Networks to ignore: </label>\n            <input id=\"networks\" [(ngModel)]=\"configs.Services.ignore_nets\">\n        </div>\n\n        <div class=\"item\">\n            <label for=\"scPort\">ShakeCast Server Port: </label>\n            <input id=\"scPort\" [(ngModel)]=\"configs.port\">\n        </div>\n\n        <div class=\"item\">\n            <label for=\"scWebPort\">Web Server Port: </label>\n            <input id=\"scWebPort\" [(ngModel)]=\"configs.web_port\">\n        </div>\n\n        <div class=\"item\">\n            <label for=\"db\">Database: </label>\n            <select id=\"db\" [(ngModel)]=\"configs.DBConnection.type\">\n                <option *ngFor=\"let opt of dbOptions\" [value]=\"opt.value\">{{ opt.name }}</option>\n            </select>\n\n            <div *ngIf=\"configs.DBConnection.type == 'mysql'\">\n                <h3 id=\"db-str\">\n                    {{configs.DBConnection.username}}:{{'*'.repeat(configs.DBConnection.password.length)}}@{{configs.DBConnection.server}}/pycast\n                    </h3>\n                <input placeholder=\"Username\" type=\"text\" [(ngModel)]=\"configs.DBConnection.username\">\n                <input placeholder=\"Password\" type=\"password\" [(ngModel)]=\"configs.DBConnection.password\">\n                <input placeholder=\"Server\" type=\"text\" [(ngModel)]=\"configs.DBConnection.server\">\n            </div>\n        </div>\n\n        <div class=\"item\">\n            <label for=\"proxy\">Use a proxy: </label>\n            <input type=\"checkbox\" \n                        id=\"proxy\" \n                        [(ngModel)]=\"configs.Proxy.use\">\n\n            <div *ngIf=\"configs.Proxy.use\">\n                <input placeholder=\"Username\" type=\"text\" [(ngModel)]=\"configs.Proxy.username\">\n                <input placeholder=\"Password\" type=\"password\" [(ngModel)]=\"configs.Proxy.password\">\n                <input placeholder=\"Port\" type=\"text\" [(ngModel)]=\"configs.Proxy.port\">\n                <input placeholder=\"Server\" type=\"text\" [(ngModel)]=\"configs.Proxy.server\">\n            </div>\n        </div>\n\n        <div class=\"item\">\n            <label for=\"version\">Software Version: </label><p>{{ configs?.Server?.update?.software_version }}</p>\n            <div *ngIf=\"configs?.Server?.update?.software_version != configs?.Server?.update?.update_version\">\n                <p>Please update ShakeCast</p><h3 class=\"button\" (click)=\"updateService.updateShakecast()\">Update</h3>\n            </div>\n            <div *ngIf=\"configs?.Server?.update?.software_version == configs?.Server?.update?.update_version\">\n                <p>No software updates required</p>\n            </div>\n        </div>\n    </div>\n\n    <div class=\"section\">\n        <h1 class=\"header\">Clock Settings</h1>\n        <div class=\"item\">\n            <table>\n                <tr>\n                    <th>UTC time: </th>\n                    <td>{{ utcTime | date:'dd-M-yyyy H:mm'}}</td>\n                </tr>\n                <tr>\n                    <th>ShakeCast Time: <info [text]=\"'Change the ShakeCast Time for your notifications to\n                                                        use a different time zone than UTC'\"\n                                                [side]=\"'left'\"></info></th>\n                    <td>{{ offsetTime | date:'dd-M-yyyy H:mm'}}</td>\n                    <table class=\"spin-table\">\n                        <tr class=\"button spin\" (click)=\"hourUp()\"><th><i class=\"fa fa-chevron-up\"></i></th></tr>\n                        <tr class=\"button spin\" (click)=\"hourDown()\"><th><i class=\"fa fa-chevron-down\"></i></th></tr>\n                    </table>\n                </tr>\n                <tr>\n                    <th>Nighttime: <info [text]=\"'ShakeCast allows you to set a different minimum\n                                                    magnitude while you\\'re not at work. This way,\n                                                    you won\\'t be bothered by multiple small magnitude\n                                                    earthquakes while you\\'re at home. This Nighttime\n                                                    setting determines what time the minimum magnitude\n                                                    change goes into effect.'\"\n                                            [side]=\"'left'\"></info></th>\n                    <td>{{ configs.Services.nighttime }}:00</td>\n                    <table class=\"spin-table\">\n                        <tr class=\"button spin\" \n                            (click)=\"nighttimeUp()\"><th><i class=\"fa fa-chevron-up\"></i></th></tr>\n                        <tr class=\"button spin\" \n                            (click)=\"nighttimeDown()\"><th><i class=\"fa fa-chevron-down\"></i></th></tr>\n                    </table>\n                </tr>\n                <tr>\n                    <th>Morning: <info [text]=\"'ShakeCast allows you to set a different minimum\n                                                    magnitude while you\\'re not at work. This way,\n                                                    you won\\'t be bothered by multiple small magnitude\n                                                    earthquakes while you\\'re at home. This Morning\n                                                    setting determines what time the minimum magnitude\n                                                    switches back to normal. If there were any smaller\n                                                    earthquakes over night, you will receive notifications\n                                                    for them now.'\"\n                                            [side]=\"'left'\"></info></th>\n                    <td>{{ configs.Services.morning }}:00</td>\n                    <table class=\"spin-table\">\n                        <tr class=\"button spin\" \n                            (click)=\"morningUp()\"><th><i class=\"fa fa-chevron-up\"></i></th></tr>\n                        <tr class=\"button spin\" \n                            (click)=\"morningDown()\"><th><i class=\"fa fa-chevron-down\"></i></th></tr>\n                    </table>\n                </tr>\n                <tr>\n                    <th>Nighttime Min Magnitude: <info [text]=\"'ShakeCast allows you to set a different minimum\n                                                                    magnitude while you\\'re not at work. This way,\n                                                                    you won\\'t be bothered by multiple small magnitude\n                                                                    earthquakes while you\\'re at home. \n                                                                    You can set that minimum magnitude here. If you\n                                                                    do not wish to utilize this setting, set the\n                                                                    minimum magnitude to 0.'\"\n                                                            [side]=\"'left'\"></info></th>\n                    <td>{{ configs.Services.night_eq_mag_cutoff }}</td>\n                    <table class=\"spin-table\">\n                        <tr class=\"button spin\" \n                            (click)=\"configs.Services.night_eq_mag_cutoff = configs.Services.night_eq_mag_cutoff + 1\"><th><i class=\"fa fa-chevron-up\"></i></th></tr>\n                        <tr class=\"button spin\" \n                            (click)=\"configs.Services.night_eq_mag_cutoff = configs.Services.night_eq_mag_cutoff - 1\"><th><i class=\"fa fa-chevron-down\"></i></th></tr>\n                    </table>\n                <tr>\n                \n            </table>\n        </div>\n    </div>\n\n    <div class=\"section\">\n        <h1 class=\"header\">\n            SMTP\n        </h1>\n        <div class=\"item\">\n            <input placeholder=\"Username\" type=\"text\" [(ngModel)]=\"configs.SMTP.username\">\n            <input placeholder=\"Password\" type=\"password\" [(ngModel)]=\"configs.SMTP.password\">\n            <input placeholder=\"Security\" type=\"text\" [(ngModel)]=\"configs.SMTP.security\">\n            <input placeholder=\"Port\" type=\"text\" [(ngModel)]=\"configs.SMTP.port\">\n            <input placeholder=\"Server\" type=\"text\" [(ngModel)]=\"configs.SMTP.server\">\n        </div>\n    </div>\n</div>\n\n<h1 class=\"button save\" (click)=\"saveConfigs()\">Save</h1>\n<h1 class=\"button reset\" (click)=\"resetConfigs()\">Reset</h1>\n<h1 class=\"button\" (click)=\"confService.systemTest()\">Run a System Test</h1>\n"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/config/config.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var Observable_1 = __webpack_require__("../../../../rxjs/_esm5/Observable.js");
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var update_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/update/update.service.ts");
var config_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/config/config.service.ts");
var time_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/config/time.service.ts");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var ConfigComponent = /** @class */ (function () {
    function ConfigComponent(confService, timeService, notService, titleService, updateServer) {
        this.confService = confService;
        this.timeService = timeService;
        this.notService = notService;
        this.titleService = titleService;
        this.updateServer = updateServer;
        this.subscriptions = [];
        this.oldConfigs = {};
        this.configs = { "Logging": { "log_file": "", "log_level": "", "log_rotate": 0 }, "DBConnection": { "username": "", "retry_count": 0, "password": "", "type": "sqlite", "retry_interval": 0 }, "Notification": { "default_template_new_event": "", "default_template_inspection": "", "default_template_pdf": "" }, "SMTP": { "username": "", "from": "", "envelope_from": "", "server": "", "security": "", "password": "", "port": 0 }, "Server": { "software_version": "", "name": "", "DNS": "" }, "gmap_key": "", "Proxy": { "username": "", "use": false, "password": "", "port": 0, "server": "" }, "Services": { "use_geo_json": true, "ignore_nets": [], "new_eq_mag_cutoff": 0, "keep_eq_for": 0, "nighttime": 0, "check_new_int": 0, "night_eq_mag_cutoff": 0, "geo_json_web": "", "eq_req_products": [], "morning": 0, "archive_mag": 0, "geo_json_int": 0 }, "timezone": 0 };
        this.utcTime = null;
        this.offsetTime = null;
        this.enteringNet = false;
        this.newNet = '';
        this.dbOptions = [{ 'name': 'SQLite', 'value': 'sqlite' },
            { 'name': 'MySQL', 'value': 'mysql' }];
    }
    ConfigComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.titleService.title.next('Settings');
        this.subscriptions.push(this.confService.configs.subscribe(function (configs) {
            _this.configs = configs;
            _this.oldConfigs = JSON.parse(JSON.stringify(_this.configs));
            _this.offsetTime = _this.timeService.getOffsetTime(configs.timezone);
            _this.subscriptions.push(Observable_1.Observable.interval(500)
                .subscribe(function (x) {
                _this.utcTime = _this.timeService.getUTCTime();
                _this.offsetTime = _this.timeService.getOffsetTime(configs.timezone);
            }));
        }));
        this.confService.getConfigs();
        this.utcTime = this.timeService.getUTCTime();
    };
    ConfigComponent.prototype.hourUp = function () {
        this.configs.timezone += 1;
    };
    ConfigComponent.prototype.hourDown = function () {
        this.configs.timezone -= 1;
    };
    ConfigComponent.prototype.nighttimeUp = function () {
        this.configs.Services.nighttime += 1;
    };
    ConfigComponent.prototype.nighttimeDown = function () {
        this.configs.Services.nighttime -= 1;
    };
    ConfigComponent.prototype.morningUp = function () {
        this.configs.Services.morning += 1;
    };
    ConfigComponent.prototype.morningDown = function () {
        this.configs.Services.morning -= 1;
    };
    ConfigComponent.prototype.saveConfigs = function () {
        if (!_.isEqual(this.configs, this.oldConfigs)) {
            this.confService.saveConfigs(this.configs);
            this.oldConfigs = JSON.parse(JSON.stringify(this.configs));
        }
        else {
            this.notService.info('No Changes', 'These configs are already in place!');
        }
    };
    ConfigComponent.prototype.resetConfigs = function () {
        this.configs = JSON.parse(JSON.stringify(this.oldConfigs));
    };
    ConfigComponent.prototype.setTime = function () {
    };
    ConfigComponent.prototype.keyboardInput = function (event) {
        if (this.enteringNet === true) {
            if (event.keyCode === 13) {
                if (this.newNet !== '') {
                    this.configs.Services.ignore_nets.push(this.newNet);
                    this.newNet = '';
                    this.enteringNet = false;
                }
            }
        }
    };
    ConfigComponent.prototype.ngOnDestroy = function () { };
    __decorate([
        core_1.HostListener('window:keydown', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], ConfigComponent.prototype, "keyboardInput", null);
    ConfigComponent = __decorate([
        core_1.Component({
            selector: 'config',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/config/config.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/config/config.component.css")]
        }),
        __metadata("design:paramtypes", [config_service_1.ConfigService,
            time_service_1.TimeService,
            angular2_notifications_1.NotificationsService,
            title_service_1.TitleService,
            update_service_1.UpdateService])
    ], ConfigComponent);
    return ConfigComponent;
}());
exports.ConfigComponent = ConfigComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/config/config.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
var operators_1 = __webpack_require__("../../../../rxjs/_esm5/operators.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/catch.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var ConfigService = /** @class */ (function () {
    function ConfigService(_http, notService) {
        this._http = _http;
        this.notService = notService;
        this.loadingData = new ReplaySubject_1.ReplaySubject(1);
        this.configs = new ReplaySubject_1.ReplaySubject(1);
    }
    ConfigService.prototype.getConfigs = function () {
        var _this = this;
        this.loadingData.next(true);
        this._http.get('/admin/api/configs')
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            _this.configs.next(result);
            _this.loadingData.next(false);
        });
    };
    ConfigService.prototype.saveConfigs = function (newConfigs) {
        var _this = this;
        this._http.post('/admin/api/configs', JSON.stringify({ configs: newConfigs })).subscribe(function (result) {
            _this.notService.success('Success!', 'New Configurations Saved');
        });
    };
    ConfigService.prototype.systemTest = function () {
        var _this = this;
        this.notService.success('System Test', 'System test starting...');
        this._http.get('/admin/system-test')
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            if (!result) {
                _this.notService.error('System Test Failed', 'Unable to reach the ShakeCast server');
            }
            _this.loadingData.next(false);
        });
    };
    ConfigService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            angular2_notifications_1.NotificationsService])
    ], ConfigService);
    return ConfigService;
}());
exports.ConfigService = ConfigService;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/config/time.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var TimeService = /** @class */ (function () {
    function TimeService() {
    }
    TimeService.prototype.toUTCDate = function (date) {
        var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    };
    ;
    TimeService.prototype.getUTCTime = function () {
        var date = new Date();
        var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    };
    ;
    TimeService.prototype.getOffsetTime = function (hourOffset) {
        var date = new Date();
        var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours() + hourOffset, date.getUTCMinutes(), date.getUTCSeconds());
        return _utc;
    };
    TimeService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], TimeService);
    return TimeService;
}());
exports.TimeService = TimeService;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facilities.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".map-container {\n    width: 100%;\n    height: 100%;\n    top: 0;\n    position: fixed;\n}\n\n.fac-list {\n    height: 230px;\n    white-space: nowrap;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facilities.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"map-container\">\n    <my-map></my-map>\n</div>\n\n<div class=\"right-panel\" [@showRight]=\"showRight\">\n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleRight()\">\n            <span class=\"arrow-icon\" [hidden]=\"showRight=='shown'\"><i class=\"fa fa-chevron-left\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showRight=='hidden'\"><i class=\"fa fa-chevron-right\"></i></span>\n        </div>\n    </div>\n    <div class=\"panel-content\">\n            <h2 class=\"panel-title\">Facilities</h2>\n            \n            <div class=\"panel-scroll-container\">\n                <div class=\"inner-shadow\"></div>\n                <facility-list></facility-list>\n            </div>\n    </div>\n</div>\n\n<div class=\"left-panel\" [@showLeft]=\"showLeft\">\n\n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleLeft()\">\n            <span class=\"arrow-icon\" [hidden]=\"showLeft=='shown'\"><i class=\"fa fa-chevron-right\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showLeft=='hidden'\"><i class=\"fa fa-chevron-left\"></i></span>\n        </div>\n    </div>\n\n    <div class=\"panel-content\">\n        <facility-info></facility-info>\n    </div>\n</div>\n\n<div class=\"bottom-panel\" [@showBottom]=\"showBottom\">\n    \n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleBottom()\" style=\"width:0\">\n            <span class=\"arrow-icon\" [hidden]=\"showBottom=='shown'\"><i class=\"fa fa-chevron-up\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showBottom=='hidden'\"><i class=\"fa fa-chevron-down\"></i></span>\n        </div>\n    </div>\n    <div class=\"panel-content\">\n        <facility-filter></facility-filter>\n    </div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facilities.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var facility_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts");
var earthquake_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake.service.ts");
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var animations_1 = __webpack_require__("../../../../../src/app/shared/animations/animations.ts");
var FacilitiesComponent = /** @class */ (function () {
    function FacilitiesComponent(facService, titleService, eqService) {
        this.facService = facService;
        this.titleService = titleService;
        this.eqService = eqService;
        this.subscriptions = [];
        this.showBottom = 'hidden';
        this.showLeft = 'hidden';
        this.showRight = 'hidden';
        this.facList = [];
    }
    FacilitiesComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.titleService.title.next('Facilities');
        this.subscriptions.push(this.facService.facilityData.subscribe(function (facs) {
            if (facs.length > 0) {
                _this.facList = facs;
                _this.facService.plotFac(facs[0]);
            }
        }));
        this.eqService.configs['clearOnPlot'] = 'events';
        this.facService.getData();
        this.toggleRight();
    };
    FacilitiesComponent.prototype.ngAfterViewInit = function () {
        /*
        this.facService.clearMap()
        if (this.facList.length > 0) {
            this.facService.plotFac(this.facList[0]);
        }
        */
    };
    FacilitiesComponent.prototype.toggleLeft = function () {
        if (this.showLeft == 'hidden') {
            this.showLeft = 'shown';
        }
        else {
            this.showLeft = 'hidden';
        }
    };
    FacilitiesComponent.prototype.toggleRight = function () {
        if (this.showRight == 'hidden') {
            this.showRight = 'shown';
        }
        else {
            this.showRight = 'hidden';
        }
    };
    FacilitiesComponent.prototype.toggleBottom = function () {
        if (this.showBottom == 'hidden') {
            this.showBottom = 'shown';
        }
        else {
            this.showBottom = 'hidden';
        }
    };
    FacilitiesComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    FacilitiesComponent.prototype.ngOnDestroy = function () {
        this.facService.clearMap();
        this.facService.facilityData.next([]);
        this.endSubscriptions();
    };
    FacilitiesComponent = __decorate([
        core_1.Component({
            selector: 'facilities',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facilities.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facilities.component.css"), __webpack_require__("../../../../../src/app/shared/css/data-list.css"), __webpack_require__("../../../../../src/app/shared/css/panels.css")],
            animations: [animations_1.showLeft, animations_1.showRight, animations_1.showBottom]
        }),
        __metadata("design:paramtypes", [facility_service_1.FacilityService,
            title_service_1.TitleService,
            earthquake_service_1.EarthquakeService])
    ], FacilitiesComponent);
    return FacilitiesComponent;
}());
exports.FacilitiesComponent = FacilitiesComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".filter-form {\n    padding: 10px;\n}\n\nh2 {\n    text-align: left;\n    margin: 0 0 0 20px;\n    color: white;\n    padding: 5px;\n}\n\n.control {\n    padding: 20px 20px 0 20px;\n    text-align: center;\n}\n\n.buttons-container {\n    border: 2px solid #55aaee;\n    border-radius: 5px;\n    padding: 5px;\n}\n\n.form-container {\n    display: inline-block;\n    min-width: 300px;\n    text-align: center;\n}\n\n.form-container input {\n    height: 20px;\n    border-radius: 5px;\n    font-weight: bold;\n    text-align: center;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"control\">\n    <div class=\"buttons-container\">\n        <h3 class=\"button\" (click)=\"selectAll()\">Select All</h3>\n        <h3 class=\"button\" (click)=\"unselectAll()\">Unselect All</h3>\n        <h3 class=\"button\" (click)=\"deleteFacs()\">Delete Selected</h3>\n    </div>\n</div>\n<div class=\"filter-form\">\n    <div class=\"form-container\">\n        <input [(ngModel)]=\"filter.keywords\" placeholder=\"Keywords\">\n        <input [(ngModel)]=\"filter.latMin\" placeholder=\"Min Latitude\">\n        <input [(ngModel)]=\"filter.latMax\" placeholder=\"Max Latitude\">\n        <input [(ngModel)]=\"filter.lonMin\" placeholder=\"Min Longitude\">\n        <input [(ngModel)]=\"filter.lonMax\" placeholder=\"Max Longitude\">\n    </div>\n\n    <h3 class=\"button search\" (click)=\"search()\">Search</h3>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var facility_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts");
var screen_dimmer_service_1 = __webpack_require__("../../../../../src/app/shared/screen-dimmer/screen-dimmer.service.ts");
var FacilityFilter = /** @class */ (function () {
    function FacilityFilter(facService, sdService) {
        this.facService = facService;
        this.sdService = sdService;
        this.filter = {};
    }
    FacilityFilter.prototype.selectAll = function () {
        this.facService.selectAll();
    };
    FacilityFilter.prototype.unselectAll = function () {
        this.facService.unselectAll();
    };
    FacilityFilter.prototype.deleteFacs = function () {
        this.facService.deleteFacs();
    };
    FacilityFilter.prototype.search = function () {
        this.facService.getData(this.filter);
        this.hideFilter();
    };
    FacilityFilter.prototype.cancelFilter = function () {
        this.hideFilter();
    };
    FacilityFilter.prototype.showFilter = function () {
        this.sdService.dimScreen();
    };
    FacilityFilter.prototype.hideFilter = function () {
        this.sdService.undimScreen();
    };
    FacilityFilter = __decorate([
        core_1.Component({
            selector: 'facility-filter',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.css")]
        }),
        __metadata("design:paramtypes", [facility_service_1.FacilityService,
            screen_dimmer_service_1.ScreenDimmerService])
    ], FacilityFilter);
    return FacilityFilter;
}());
exports.FacilityFilter = FacilityFilter;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility-info/facility-info.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".header {\n    border-bottom: 5px solid #55aaee;\n    color: white;\n}\n\n.info-header {\n    color: white;\n    margin-bottom: 0;\n}\n\n.desc {\n    text-align: center;\n    background: #efefef;\n    padding: 10px;\n    margin: 10px;\n    font-weight: bold;\n    box-shadow: 1px 1px 2px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 2px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 2px 1px rgba(0,0,0,0.3);\n    overflow: scroll;\n    color: black;\n}\n\n.location {\n    color: white;\n    font-style: italic;\n\n}\n\n.colors-table th {\n    padding: 5px;\n    color:white;\n    border-radius: 5px;\n    margin: 3px;\n}\n\n.fragility h2 {\n    margin: 10px 0 5px 0;\n    color: white;\n}\n\n.fragility p {\n    color:white;\n    margin:0;\n}\n\n.type {\n    color: white;\n    margin: 0 0 20px 0;\n}\n\n/*\n\n.info-content {\n    height: 95%;\n    padding: 5px;\n    overflow: hidden;\n}\n\n.hide {\n    position: absolute;\n    bottom: 10px;\n    left: 10px;\n}\n\n.header {\n    border-bottom: 5px solid #AED8FA;\n}\n\n\n\n.fragility-title {\n    margin-bottom: 0;\n    text-align: center;\n}\n\n.fragility-table {\n    margin-top: 10px\n}\n\ntable {\n    width: 100%;\n}\n\n.colors-table {\n    padding-left: 1em;\n    padding-right: 1em;\n}\n\n.colors-table th {\n    padding: .5em;\n}\n\n.shaking-history-link {\n    display: flex;\n    align-items: center;\n    flex-direction: column;\n    cursor: pointer;\n    margin-top: 30%;\n    height: 4.5em;\n}\n\n.shaking-history-link h1 {\n    color:#55aaee;\n    margin-bottom: 2px;\n    text-shadow: 5px 5px 5px rgba(0,0,0,0.3);\n}\n.triangle {\n    color: #55aaee;\n    font-size: 100px;\n    transform: rotate(-90deg) translateX(500%);\n    text-shadow: -5px 5px 5px rgba(0,0,0,0.3);\n}\n\n.shaking-history-link:hover .triangle {\n    text-shadow: -5px 5px 5px rgba(0,0,0,0.5);\n}\n.shaking-history-link:hover h1 {\n    text-shadow: 5px 5px 5px rgba(0,0,0,0.5);\n}\n\n.shaking-history {\n    top: 100%;\n    position: relative;\n}\n\n.impact {\n    padding: 10px;\n    border: 1px solid rgba(0,0,0,.3);\n    border-radius: 5px;\n    margin-top: 10%;\n    box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n}\n\n.impact h2 {\n    margin-top:5px;\n    margin-bottom: 5px;\n}\n\n.impact-level {\n    position: relative;\n    padding: 10px;\n    margin-top: 0;\n    width: 75%;\n    margin-left: auto;\n    margin-right: auto;\n    text-align: center\n}\n\n.shaking-table {\n    width: 100%;\n}\n\n.shaking-table table th, .shaking-table table td {\n    padding: 5px;\n    text-align: center;\n}\n\n.shaking-table table {\n    border-right: 3px solid #AED8FA;\n}\n*/", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility-info/facility-info.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"fac-info\">\n    <div class=\"info-content\" *ngIf=\"facility\">\n        <div class=\"header\">\n            <h1 class=\"info-header\">{{ facility.name }}</h1>\n            <p class=\"type\">Type: {{ facility.facility_type }}</p>\n            <p class=\"desc\" *ngIf=\"facility.description\">{{ facility.description }}</p>\n            <p class=\"location\">{{ (facility.lat_max + facility.lat_min) / 2 }}, {{ (facility.lon_max + facility.lon_min) / 2 }}\n        </div>\n\n        <div class=\"fragility\">\n            <h2>Fagility</h2>\n            <p>Metric: {{ facility.metric }}</p>\n            <table class=\"colors-table\" style=\"width:100%;text-align:center\">\n                <tr>\n                    <th *ngIf=\"facility.green\" style=\"background-color:green;\">\n                        {{ facility.green }}\n                    </th>\n                    <th *ngIf=\"facility.yellow\" style=\"background-color:gold;\">\n                        {{ facility.yellow }}\n                    </th>\n                    <th *ngIf=\"facility.orange\" style=\"background-color:orange;\">\n                        {{ facility.orange }}\n                    </th>\n                    <th *ngIf=\"facility.red\" style=\"background-color:red;\">\n                        {{ facility.red }}\n                    </th>\n                </tr>\n            </table>\n        </div>\n\n        <div class=\"shaking\" *ngIf=\"eqService.current.length > 0\">\n            <h2 class=\"info-header\">Shaking History</h2>\n\n            <div class=\"eq-list\">\n                <earthquake-list></earthquake-list>\n            </div>\n        </div>\n    </div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility-info/facility-info.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var facility_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts");
var earthquake_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake.service.ts");
var FacilityInfoComponent = /** @class */ (function () {
    function FacilityInfoComponent(facService, eqService, _router) {
        this.facService = facService;
        this.eqService = eqService;
        this._router = _router;
        this.subscriptions = [];
        this.show = false;
        this.facility = null;
        this.facilityShaking = null;
        this.showFragilityInfo = false;
    }
    FacilityInfoComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.facService.showInfo.subscribe(function (facility) {
            if (facility) {
                _this.setFacility(facility);
            }
            else {
                _this.show = false;
            }
        }));
        this.subscriptions.push(this.facService.facilityInfo.subscribe(function (facility) {
            _this.facility = facility;
        }));
        this.subscriptions.push(this.eqService.plotting.subscribe(function (eq) {
            if (_this.facility) {
                _this.facService.getFacilityShaking(_this.facility, eq);
            }
        }));
        this.subscriptions.push(this.facService.facilityShaking.subscribe(function (shaking) {
            _this.facilityShaking = shaking;
        }));
    };
    FacilityInfoComponent.prototype.setFacility = function (facility) {
        this.facility = facility;
        this.eqService.getFacilityData(facility);
    };
    FacilityInfoComponent.prototype.hide = function () {
        this.facService.showInfo.next(null);
    };
    FacilityInfoComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    FacilityInfoComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    FacilityInfoComponent = __decorate([
        core_1.Component({
            selector: 'facility-info',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility-info/facility-info.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility-info/facility-info.component.css")]
        }),
        __metadata("design:paramtypes", [facility_service_1.FacilityService,
            earthquake_service_1.EarthquakeService,
            router_1.Router])
    ], FacilityInfoComponent);
    return FacilityInfoComponent;
}());
exports.FacilityInfoComponent = FacilityInfoComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility-list.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility-list.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"data-list-inner-container\">\n    <div *ngIf=\"!loadingData\">\n        <div *ngIf=\"facilityData.length > 0\">\n            <div class=\"data\" \n                    [@selected]=\"fac?.selected\" \n                    *ngFor=\"let fac of shownFacilityData\" \n                    (click)=\"clickFac(fac)\">\n                <div [@headerSelected]=\"fac?.selected\" class=\"data-header\" [style.border]=\"'5px solid ' + fac?.shaking?.alert_level\">\n                    <h3>{{ fac.name }}</h3>\n                </div>\n                <div class=\"data-body\">\n                    <div class=\"data-info-container\">\n                        <table class=\"container-table\">\n                            <tr>\n                                <th>Type: </th><td><p>{{ fac.facility_type }}</p></td>\n                            </tr>\n                            <tr>\n                                <th>Location: </th><td><p>{{ (fac.lat_max + fac.lat_min) / 2 }}, {{ (fac.lon_max + fac.lon_min) / 2 }}</p></td>\n                            </tr>\n                        </table>\n                        <div class=\"updated\">\n                            <p>Updated: {{ fac.updated * 1000 | date }}</p>\n                            <p>|</p>\n                            <p>{{ fac.updated_by }}</p>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"data load-more\">\n                <div class=\"load-more-button\" (click)=\"loadMore()\">\n                    <h1>Load More</h1>\n                </div>\n            </div>\n        </div>\n        <div *ngIf=\"facilityData.length == 0\">\n            <h1 class=\"data-list-no-data\">No Facilities</h1>\n\n            <h2 *ngIf=\"_router.url === '/shakecast-admin/facilities'\" \n                class=\"data-list-no-data\">\n                (Drag and drop XML files here to upload)\n            </h2>\n            \n        </div>\n    </div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility-list.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var animations_1 = __webpack_require__("../../../animations/esm5/animations.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var facility_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts");
var FacilityListComponent = /** @class */ (function () {
    function FacilityListComponent(facService, element, _router) {
        this.facService = facService;
        this.element = element;
        this._router = _router;
        this.loadingData = false;
        this.shownFacilityData = [];
        this.facilityData = [];
        this.lastShownFacIndex = 0;
        this.selectedFacs = [];
        this.filter = {};
        this.initPlot = false;
        this.didScroll = false;
        this.subscriptions = [];
    }
    FacilityListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.facService.facilityData.subscribe(function (facs) {
            _this.facilityData = facs;
            // only display the first 50 facs
            _this.shownFacilityData = _this.facilityData;
            if (_this.selectedFacs.length === 0) {
                // add a facility if the array is empty
                _this.facService.selectedFacs = _this.selectedFacs;
                _this.facService.hideFacInfo();
            }
            if ((_this.facilityData.length > 0) && (_this._router.url === '/shakecast-admin/facilities')) {
                if (!_this.selectedFacs) {
                    _this.selectedFacs.push(_this.facilityData[0]);
                    _this.facService.selectedFacs.push(_this.facilityData[0]);
                }
                _this.facService.setFacInfo(_this.facilityData[0]);
                _this.facilityData[0].selected = 'yes';
            }
        }));
        this.subscriptions.push(this.facService.facilityDataUpdate.subscribe(function (facs) {
            _this.facilityData = _this.facilityData.concat(facs);
            _this.shownFacilityData = _this.facilityData;
        }));
        this.subscriptions.push(this.facService.selection.subscribe(function (select) {
            if (select === 'all') {
                _this.selectAll();
            }
            else if (select === 'none') {
                _this.unselectAll();
            }
            else if (select === 'delete') {
            }
            _this.facService.selectedFacs = _this.selectedFacs;
        }));
        this.subscriptions.push(this.facService.loadingData.subscribe(function (loading) {
            _this.loadingData = loading;
        }));
    };
    FacilityListComponent.prototype.checkScroll = function () {
        console.log('check scroll position');
    };
    FacilityListComponent.prototype.setScrollEvent = function (e) {
        this.didScroll = true;
    };
    FacilityListComponent.prototype.clickFac = function (fac) {
        if (fac.selected === 'yes') {
            fac.selected = 'no';
        }
        else {
            fac.selected = 'yes';
        }
        if (fac.selected === 'yes') {
            // add it to the list
            this.facService.setFacInfo(fac);
            this.selectedFacs.push(fac);
            this.plotFac(fac);
        }
        else {
            // remove it from the list
            var index = _.findIndex(this.selectedFacs, { shakecast_id: fac.shakecast_id });
            this.selectedFacs.splice(index, 1);
            this.removeFac(fac);
        }
        this.facService.selectedFacs = this.selectedFacs;
    };
    FacilityListComponent.prototype.plotByIndex = function (index) {
        if (this.facilityData[index]) {
            this.clickFac(this.facilityData[index]);
        }
        else {
            this.initPlot = true;
        }
    };
    FacilityListComponent.prototype.selectAll = function () {
        this.unselectAll();
        for (var facID in this.facilityData) {
            var fac = this.facilityData[facID];
            fac.selected = 'yes';
            this.selectedFacs.push(fac);
            this.plotFac(fac);
        }
    };
    FacilityListComponent.prototype.unselectAll = function () {
        for (var facID in this.selectedFacs) {
            var fac = this.selectedFacs[facID];
            fac.selected = 'no';
            this.removeFac(fac);
        }
        this.selectedFacs = [];
        this.facService.selectedFacs = [];
    };
    FacilityListComponent.prototype.removeFac = function (fac) {
        this.facService.removeFac(fac);
    };
    FacilityListComponent.prototype.plotFac = function (fac) {
        this.facService.plotFac(fac);
    };
    FacilityListComponent.prototype.loadMore = function () {
        this.filter['count'] = this.facilityData.length;
        this.facService.updateData(this.filter);
    };
    FacilityListComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    FacilityListComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    FacilityListComponent = __decorate([
        core_1.Component({
            selector: 'facility-list',
            host: { '(window:scroll)': 'setScrollEvent($event)' },
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility-list.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility-list.component.css"), __webpack_require__("../../../../../src/app/shared/css/data-list.css")],
            animations: [
                animations_1.trigger('selected', [
                    animations_1.state('yes', animations_1.style({ transform: 'translateY(-10px)' })),
                    animations_1.state('no', animations_1.style({ transform: 'translateY(0px)' })),
                    animations_1.transition('* => *', animations_1.animate('100ms ease-in-out'))
                ]),
                animations_1.trigger('headerSelected', [
                    animations_1.state('yes', animations_1.style({ 'background-color': '#7af' })),
                    animations_1.state('no', animations_1.style({ 'background-color': '*' }))
                ])
            ]
        }),
        __metadata("design:paramtypes", [facility_service_1.FacilityService,
            core_1.ElementRef,
            router_1.Router])
    ], FacilityListComponent);
    return FacilityListComponent;
}());
exports.FacilityListComponent = FacilityListComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/map.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/catch.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var map_service_1 = __webpack_require__("../../../../../src/app/shared/maps/map.service.ts");
var loading_service_1 = __webpack_require__("../../../../../src/app/loading/loading.service.ts");
var FacilityService = /** @class */ (function () {
    function FacilityService(_http, mapService, _router, notService, loadingService) {
        this._http = _http;
        this.mapService = mapService;
        this._router = _router;
        this.notService = notService;
        this.loadingService = loadingService;
        this.loadingData = new ReplaySubject_1.ReplaySubject(1);
        this.facilityData = new ReplaySubject_1.ReplaySubject(1);
        this.facilityDataUpdate = new ReplaySubject_1.ReplaySubject(1);
        this.facilityInfo = new ReplaySubject_1.ReplaySubject(1);
        this.facilityShaking = new ReplaySubject_1.ReplaySubject(1);
        this.showInfo = new ReplaySubject_1.ReplaySubject(1);
        this.shakingData = new ReplaySubject_1.ReplaySubject(1);
        this.selectedFacs = [];
        this.selection = new ReplaySubject_1.ReplaySubject(1);
        this.filter = {};
        this.sub = null;
    }
    FacilityService.prototype.getData = function (filter) {
        var _this = this;
        if (filter === void 0) { filter = {}; }
        this.loadingService.add('Facilities');
        if (this.sub) {
            this.sub.unsubscribe();
        }
        var params = new http_1.URLSearchParams();
        params.set('filter', JSON.stringify(filter));
        this.sub = this._http.get('/api/facility-data', { search: params })
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            _this.selectedFacs = [];
            _this.shakingData.next(null);
            _this.facilityData.next(result.data);
            _this.loadingService.finish('Facilities');
        });
    };
    FacilityService.prototype.updateData = function (filter) {
        var _this = this;
        if (filter === void 0) { filter = {}; }
        var params = new http_1.URLSearchParams();
        params.set('filter', JSON.stringify(filter));
        this._http.get('/api/facility-data', { search: params })
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            _this.facilityDataUpdate.next(result.data);
        });
    };
    FacilityService.prototype.getShakeMapData = function (event) {
        var _this = this;
        /* get list of facilities affected by a specific event */
        this.loadingService.add('Facilities');
        if (this.sub) {
            this.sub.unsubscribe();
        }
        this.sub = this._http.get('/api/shakemaps/' + event.event_id + '/facilities')
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            if (_this._router.url == '/shakecast/dashboard') {
                _this.facilityData.next(result.facilities);
            }
            _this.shakingData.next(result.alert);
            //this.unselectAll();
            if (result.facilities.length > 0) {
                _this.mapService.plotFacs(result.facilities);
            }
            _this.loadingService.finish('Facilities');
        });
    };
    FacilityService.prototype.getFacilityShaking = function (facility, event) {
        /* Get shaking history for a specific event and facility */
        var _this = this;
        this.loadingService.add('Facilities');
        this._http.get('/api/facility-shaking/' + facility['shakecast_id'] + '/' + event['event_id'])
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            if (result.data) {
                _this.facilityShaking.next(result.data);
            }
            _this.loadingService.finish('Facilities');
        });
    };
    FacilityService.prototype.setFacInfo = function (fac) {
        this.showInfo.next(fac);
    };
    FacilityService.prototype.hideFacInfo = function () {
        this.showInfo.next(null);
    };
    FacilityService.prototype.selectAll = function () {
        this.selection.next('all');
    };
    FacilityService.prototype.unselectAll = function () {
        this.selection.next('none');
    };
    FacilityService.prototype.deleteFacs = function () {
        var _this = this;
        this.notService.success('Deleting Facilities', 'Deleting ' + this.selectedFacs.length + ' facilities');
        this.loadingData.next(true);
        var params = new http_1.URLSearchParams();
        params.set('inventory', JSON.stringify(this.selectedFacs));
        params.set('inventory_type', 'facility');
        this._http.delete('/api/delete/inventory', { search: params })
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            _this.getData();
            _this.loadingData.next(false);
        });
    };
    FacilityService.prototype.plotFac = function (fac) {
        this.facilityInfo.next(fac);
        this.mapService.plotFac(fac);
    };
    FacilityService.prototype.removeFac = function (fac) {
        this.mapService.removeFac(fac);
    };
    FacilityService.prototype.clearMap = function () {
        this.mapService.clearMap();
    };
    FacilityService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            map_service_1.MapService,
            router_1.Router,
            angular2_notifications_1.NotificationsService,
            loading_service_1.LoadingService])
    ], FacilityService);
    return FacilityService;
}());
exports.FacilityService = FacilityService;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/groups/group-list.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".title {\n    color: white;\n}\n\n.users {\n    width: 100%;\n    font-size: 16px;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/groups/group-list.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"data-list-inner-container\">\n    <div *ngIf=\"!loadingData\">\n        <div *ngIf=\"groupData.length > 0\">\n\n            <h3 class=\"title\">Subscribed to:</h3>\n            <div *ngIf=\"userGroupData.length > 0\">\n                <div class=\"data\" [@selected]=\"group.selected\" *ngFor=\"let group of userGroupData\" (click)=\"clickGroup(group)\">\n                    <div [@headerSelected]=\"group.selected\" class=\"data-header\">\n                        <h3>{{group.name}}</h3>\n                    </div>\n                    <div class=\"data-body\">\n                        <div class=\"data-info-container\">\n                            <table class=\"container-table\">\n                                <tr>\n                                    <table>\n                                        <th>Facility Type:</th><td>{{ group.facility_type }}</td>\n                                    </table>\n                                </tr>\n                                <tr>\n                                    <table>\n                                        <th>Geometry: </th><td>{{ group.lat_min }}, {{ group.lon_min }}<br>\n                                                                {{ group.lat_min}}, {{ group.lon_max }}<br>\n                                                            {{ group.lat_max }}, {{ group.lon_max }}<br>\n                                                            {{ group.lat_max }}, {{ group.lon_min }}<br>\n                                                            {{ group.lat_min }}, {{ group.lon_min }}  \n                                        </td>\n                                    </table>\n                                </tr>\n                                <tr>\n                                    <table>\n                                        <th>\n                                            Users: \n                                        </th>\n                                        <td>\n                                            <select>\n                                                <option *ngFor=\"let user of group['info']['users']\">\n                                                    {{ user.username }}\n                                                </option>\n                                            </select>\n                                        </td>\n                                    </table>\n                                </tr>\n                            </table>\n                            <div class=\"updated\">\n                                <p>Updated: {{ group.updated * 1000 | date }}</p>\n                                <p>|</p>\n                                <p>{{ group.updated_by }}</p>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div *ngIf=\"userGroupData.length === 0\">\n                <h3 class=\"title\">NONE</h3>\n            </div>\n\n            <div *ngIf=\"noUserGroupData.length > 0\">\n                <h3 class=\"title\">Not Subscribed to:</h3>\n                <div class=\"data\" [@selected]=\"group.selected\" *ngFor=\"let group of noUserGroupData\" (click)=\"clickGroup(group)\">\n                    <div [@headerSelected]=\"group.selected\" class=\"data-header\">\n                        <h3>{{group.name}}</h3>\n                    </div>\n                    <div class=\"data-body\">\n                        <div class=\"data-info-container\">\n                            <table class=\"container-table\">\n                                <tr>\n                                    <table>\n                                        <th>Facility Type:</th><td>{{ group.facility_type }}</td>\n                                    </table>\n                                </tr>\n                                <tr>\n                                    <table>\n                                        <th>Geometry: </th><td>{{ group.lat_min }}, {{ group.lon_min }}<br>\n                                                                {{ group.lat_min}}, {{ group.lon_max }}<br>\n                                                            {{ group.lat_max }}, {{ group.lon_max }}<br>\n                                                            {{ group.lat_max }}, {{ group.lon_min }}<br>\n                                                            {{ group.lat_min }}, {{ group.lon_min }}  \n                                        </td>\n                                    </table>\n                                </tr>\n                                <tr>\n                                    <table>\n                                        <th>\n                                            Users: \n                                        </th>\n                                        <td>\n                                            <select class=\"users\">\n                                                <option *ngFor=\"let user of group['info']['users']\">\n                                                    {{ user.username }}\n                                                </option>\n                                            </select>\n                                        </td>\n                                    </table>\n                                </tr>\n                            </table>\n                            <div class=\"delete\">\n                                <p class=\"button\" (click)=\"groupService.deleteGroups([group])\">Delete</p>\n                            </div>\n                            <div class=\"updated\">\n                                <p>Updated: {{ group.updated * 1000 | date }}</p>\n                                <p>|</p>\n                                <p>{{ group.updated_by }}</p>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            <div *ngIf=\"groupData.length > 0\">\n        </div>\n        <div *ngIf=\"groupData.length == 0\">\n            <h1 class=\"data-list-no-data\">No Groups</h1>\n\n            <h2 class=\"data-list-no-data\">\n                (Drag and drop XML files here to upload)\n            </h2>\n        </div>\n    </div>\n    <div *ngIf=\"loadingData\">\n        <p>loading...</p>\n    </div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/groups/group-list.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var group_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/group.service.ts");
var GroupListComponent = /** @class */ (function () {
    function GroupListComponent(groupService) {
        this.groupService = groupService;
        this.loadingData = false;
        this.groupData = [];
        this.userGroupData = [];
        this.noUserGroupData = [];
        this.filter = {};
        this.subscriptions = [];
        this._this = this;
    }
    GroupListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.groupService.groupData.subscribe(function (data) {
            _this.groupData = data;
            for (var group in _this.groupData) {
                _this.groupData[group].selected = false;
                _this.selected = _this.groupData[0];
                _this.selected['selected'] = true;
            }
        }));
        this.subscriptions.push(this.groupService.userGroupData.subscribe(function (data) {
            _this.userGroupData = data;
            for (var group in _this.userGroupData) {
                _this.userGroupData[group].selected = false;
                _this.selected = _this.userGroupData[0];
                _this.selected['selected'] = true;
            }
            // build non-user data
            _this.noUserGroupData = [];
            for (var group in _this.groupData) {
                if (!_.findWhere(_this.userGroupData, { 'name': _this.groupData[group]['name'] })) {
                    _this.noUserGroupData.push(_this.groupData[group]);
                }
            }
            _this.groupService.clearMap();
            if (_this.userGroupData.length > 0) {
                _this.groupService.plotGroup(_this.userGroupData[0]);
            }
        }));
        /*
                this.subscriptions.push(this.groupService.selection.subscribe(select => {
                    if (select === 'all') {
                        this.selectAll();
                    } else if (select === 'none') {
                        this.unselectAll();
                    } else if (select === 'delete') {
                    }
        
                    this.facService.selectedFacs = this.selectedFacs;
                }));
        */
        this.subscriptions.push(this.groupService.loadingData.subscribe(function (loading) {
            _this.loadingData = loading;
        }));
        this.groupService.getData(this.filter);
    };
    GroupListComponent.prototype.clickGroup = function (group) {
        this.selected['selected'] = false;
        group['selected'] = true;
        this.selected = group;
        this.groupService.current_group = group;
        this.groupService.clearMap();
        this.groupService.plotGroup(group);
    };
    GroupListComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    GroupListComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    GroupListComponent = __decorate([
        core_1.Component({
            selector: 'group-list',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/group-list.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/group-list.component.css"), __webpack_require__("../../../../../src/app/shared/css/data-list.css")],
            animations: [
                core_1.trigger('selected', [
                    core_1.state('true', core_1.style({ transform: 'translateY(-10px)' })),
                    core_1.state('false', core_1.style({ transform: 'translateY(0px)' })),
                    core_1.transition('true => false', core_1.animate('100ms ease-out')),
                    core_1.transition('false => true', core_1.animate('100ms ease-in'))
                ]),
                core_1.trigger('headerSelected', [
                    core_1.state('true', core_1.style({ 'background-color': '#7af' })),
                    core_1.state('false', core_1.style({ 'background-color': '#aaaaaa' })),
                    core_1.transition('true => false', core_1.animate('100ms ease-out')),
                    core_1.transition('false => true', core_1.animate('100ms ease-in'))
                ])
            ]
        }),
        __metadata("design:paramtypes", [group_service_1.GroupService])
    ], GroupListComponent);
    return GroupListComponent;
}());
exports.GroupListComponent = GroupListComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/groups/group.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/map.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/catch.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var map_service_1 = __webpack_require__("../../../../../src/app/shared/maps/map.service.ts");
var GroupService = /** @class */ (function () {
    function GroupService(_http, mapService) {
        this._http = _http;
        this.mapService = mapService;
        this.loadingData = new ReplaySubject_1.ReplaySubject(1);
        this.groupData = new ReplaySubject_1.ReplaySubject(1);
        this.userGroupData = new ReplaySubject_1.ReplaySubject(1);
        this.selection = new ReplaySubject_1.ReplaySubject(1);
        this.dataList = [];
        this.current_group = null;
        this.filter = {};
    }
    GroupService.prototype.getData = function (filter) {
        var _this = this;
        if (filter === void 0) { filter = {}; }
        this.loadingData.next(true);
        var params = new http_1.URLSearchParams();
        params.set('filter', JSON.stringify(filter));
        this._http.get('/api/groups', { search: params })
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            if (filter['user']) {
                _this.userGroupData.next(result);
            }
            else {
                _this.groupData.next(result);
            }
            _this.dataList = result;
            _this.current_group = result[0];
            _this.loadingData.next(false);
            if (_this.dataList.length > 0) {
                for (var group in _this.dataList) {
                    // this.mapService.plotGroup(this.dataList[group])
                }
            }
        });
    };
    GroupService.prototype.selectAll = function () {
        this.selection.next('all');
    };
    GroupService.prototype.unselectAll = function () {
        this.selection.next('none');
    };
    GroupService.prototype.deleteGroups = function (group) {
        var _this = this;
        this.loadingData.next(true);
        var params = new http_1.URLSearchParams();
        params.set('inventory', JSON.stringify(group));
        params.set('inventory_type', 'group');
        this._http.delete('/api/delete/inventory', { search: params })
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            _this.getData();
            _this.loadingData.next(false);
        });
    };
    GroupService.prototype.plotGroup = function (group) {
        this.mapService.plotGroup(group);
    };
    GroupService.prototype.clearMap = function () {
        this.mapService.clearMap();
    };
    GroupService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            map_service_1.MapService])
    ], GroupService);
    return GroupService;
}());
exports.GroupService = GroupService;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/groups/groups.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".map {\n    width: 100%;\n    height: 500px;\n}\n\n.map-container {\n    width: 100%;\n    height: 500px;\n    position: relative;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/groups/groups.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"map-container\">\n    <my-map class=\"map\" stickToTop></my-map>\n</div>\n\n<div class=\"data-list-outer-container\">\n    <group-list></group-list>\n</div>\n\n<h2 class=\"button\" (click)=\"deleteCurrentGroup()\">Delete Group</h2>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/groups/groups.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var group_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/group.service.ts");
var GroupsComponent = /** @class */ (function () {
    function GroupsComponent(groupService, titleService) {
        this.groupService = groupService;
        this.titleService = titleService;
    }
    GroupsComponent.prototype.ngOnInit = function () {
        this.titleService.title.next('Groups');
        //this.groupService.clearMap();
    };
    GroupsComponent.prototype.deleteCurrentGroup = function () {
        this.groupService.deleteGroups([this.groupService.current_group]);
    };
    GroupsComponent = __decorate([
        core_1.Component({
            selector: 'groups',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/groups.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/groups.component.css"), __webpack_require__("../../../../../src/app/shared/css/data-list.css")],
        }),
        __metadata("design:paramtypes", [group_service_1.GroupService,
            title_service_1.TitleService])
    ], GroupsComponent);
    return GroupsComponent;
}());
exports.GroupsComponent = GroupsComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/notifications/notification.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../common/esm5/http.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/catch.js");
var operators_1 = __webpack_require__("../../../../rxjs/_esm5/operators.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var NotificationHTMLService = /** @class */ (function () {
    function NotificationHTMLService(_http, notService) {
        this._http = _http;
        this.notService = notService;
        this.loadingData = new ReplaySubject_1.ReplaySubject(1);
        this.notification = new ReplaySubject_1.ReplaySubject(1);
        this.config = new ReplaySubject_1.ReplaySubject(1);
        this.tempNames = new ReplaySubject_1.ReplaySubject(1);
        this.imageNames = new ReplaySubject_1.ReplaySubject(1);
        this.name = new ReplaySubject_1.ReplaySubject(1);
    }
    NotificationHTMLService.prototype.getNotification = function (name, notType, config) {
        var _this = this;
        if (config === void 0) { config = null; }
        this.loadingData.next(true);
        var httpOptions = {
            headers: new http_1.HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        this._http.get('/api/notification-html/' + notType + '/' + name, httpOptions)
            .subscribe(function (result) {
            _this.name.next(name);
            _this.notification.next(result['_body']);
            _this.loadingData.next(false);
        });
    };
    NotificationHTMLService.prototype.getConfigs = function (notType, name) {
        var _this = this;
        this.loadingData.next(true);
        this._http.get('/api/notification-config/' + notType + '/' + name)
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            _this.config.next(result);
            _this.loadingData.next(false);
        });
    };
    NotificationHTMLService.prototype.getTemplateNames = function () {
        var _this = this;
        this.loadingData.next(true);
        this._http.get('/api/template-names')
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            _this.tempNames.next(result);
            _this.loadingData.next(false);
        });
    };
    NotificationHTMLService.prototype.newTemplate = function (name) {
        var _this = this;
        this._http.get('/admin/new-template/' + name)
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            if (result === true) {
                _this.notService.success('Template Created', 'Created ' + name + ' template');
                _this.getNotification(name, 'new_event');
                _this.getConfigs('new_event', name);
            }
            else {
                _this.notService.success('Template Creation Failed', 'Check application permissions');
            }
        });
    };
    NotificationHTMLService.prototype.saveConfigs = function (name, config) {
        var _this = this;
        this._http.post('/api/notification-config/' + config.type + '/' + name, JSON.stringify({ config: config })).subscribe(function (result) {
            _this.notService.success('Success!', 'New Configurations Saved');
        });
    };
    NotificationHTMLService.prototype.getImageNames = function () {
        var _this = this;
        this._http.get('/api/images/')
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            _this.imageNames.next(result);
        });
    };
    NotificationHTMLService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.HttpClient,
            angular2_notifications_1.NotificationsService])
    ], NotificationHTMLService);
    return NotificationHTMLService;
}());
exports.NotificationHTMLService = NotificationHTMLService;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/notifications/notifications.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".item input, .item select, .item textarea {\n    font-size: 15px;\n}\n\n.container {\n    width: 100%;\n    background: #fff;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n\n#notDropdown {\n    width: 200px;\n    margin-left: auto;\n    margin-right: auto;\n    position: relative;\n    height: 40px;\n    font-size: 20px;\n    text-align: center;\n}\n\n.column {\n    display: inline-block;\n    padding: 5px;\n}\n\n.not-column, .conf-column {\n    z-index: 2;\n    background: white;\n    margin: 5px;\n    border-radius: 10px;\n}\n\n.not-column {\n    width: 55%;\n    border: 2px solid #55aaee;\n}\n\n.conf-column {\n    width: 40%;\n}\n\n.conf-column h2 {\n    margin-top: 0;\n}\n\n.conf-content {\n    padding-top: 20px;\n    height: 100vh;\n    width: 40vw;\n    overflow-y: auto;\n}\n\n.item p, .item h3 {\n    display: inline-block;\n    margin: 5px;\n}\n\n.item .label {\n    font-weight: bolder;\n}\n\n.event-type {\n    cursor: pointer;\n    border: 3px solid #ffffff;\n    border-radius: 5px;\n    padding: 5px;\n}\n\n.event-type:hover {\n    background: #55aaee;\n    border-color: #55aaee;\n    color: #ffffff;\n}\n\n.event-type.selected {\n    border: 3px solid #55aaee;\n}\n\n.control-buttons {\n    margin: 20px;\n}\n\n.section {\n    border-bottom: 20px dashed #efefef;\n    padding: 10px;\n    margin: 10px;\n    text-align: center;\n}\n\n.item {\n    display: inline-block;\n    margin: 5px;\n    border: 2px solid #55aaee;\n    border-radius: 5px;\n    padding: 10px;\n    box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n}\n\n.item p {\n    display: inline-block;\n}\n\n.section label {\n    font-weight: bold\n}\n\n.section.last {\n    border: none;\n}\n\n#templateName {\n    width:100%\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/notifications/notifications.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"container\">\n    <div class=\"not-column column\">\n        <div class=\"notification\" #notificationContainer></div>\n    </div>\n\n    <div class=\"conf-column column\">\n        <div class=\"conf-content-container\">\n            <div class=\"conf-content\" stickToTop>\n                <div class=\"section\">\n                    <div class=\"item\" *ngIf=\"!enteringNew\">\n                        <label for=\"notDropdown\">Pick a template: </label>\n                        <select class=\"not-dropdown\" id=\"notDropdown\" \n                                                        [(ngModel)]=\"name\" \n                                                        (change)=\"getNotification(name, eventType)\">\n                            <option *ngFor=\"let eachName of tempNames\" [ngValue]=\"eachName\">{{ eachName }}</option>\n                        </select>\n                    </div>\n\n                    <div class=\"item\">\n                        <label for=\"newTemplate\" *ngIf=\"!enteringNew\">Or</label>\n                        <h3 class=\"button\" id=\"newTemplate\" *ngIf=\"!enteringNew\" (click)=\"enteringNew=true\">Create a New Template</h3>\n                        \n                        <label for=\"templateName\" *ngIf=\"enteringNew\">Creating New Template</label>\n                        <input class=\"template-name\" id=\"templateName\"\n                            *ngIf=\"enteringNew\" \n                            [(ngModel)]=\"newName\"\n                            placeholder=\"Give it a name, then hit enter\">\n                        <h3 class=\"button\"\n                            *ngIf=\"enteringNew\"\n                            (click)=\"enteringNew=False\">Cancel</h3>\n                    </div>\n\n                    <div class=\"item\">\n                        <h3 class=\"conf event-type button\" \n                                [ngClass]=\"{'selected': eventType=='new_event'}\"\n                                (click)=\"getNotification(name, 'new_event')\">\n                            New Event\n                        </h3>\n                        <h3 class=\"conf event-type button\"\n                                [ngClass]=\"{'selected': eventType=='inspection'}\"\n                                (click)=\"getNotification(name, 'inspection')\">\n                            Facilities\n                        </h3>\n                    </div>\n                </div>\n\n                <div class=\"section\">\n                    <h1 class=\"header\">Header</h1>\n                    <div class=\"item\"\n                                *ngIf=\"config.logo\" >\n                        <p class=\"label\">Logo: </p>\n                        <select [(ngModel)]=\"config.logo\">\n                            <option [value]=\"name\" *ngFor=\"let name of imageNames\">\n                                {{ name }}\n                            </option>\n                        </select>\n                    </div>\n                    <div class=\"item\">\n                        <p class=\"label\">Title:</p><input class=\"conf\" *ngIf=\"config\" [(ngModel)]=\"config.head_text\">\n                    </div>\n                    <div class=\"item\">\n                        <p class=\"label\">Body Color: </p><input class=\"conf\" *ngIf=\"config\" [(ngModel)]=\"config.body_color\">\n                    </div>\n                </div>\n\n                <div class=\"section\">\n                    <h1 class=\"header\">Label</h1>\n                    <div class=\"item\"\n                                *ngIf=\"config.section_head\" >\n                        <p class=\"label\">Background Color: </p>\n                        <input class=\"conf\" \n                                [(ngModel)]=\"config.section_head.back_color\">\n                    </div>\n                    <div class=\"item\"\n                                *ngIf=\"config.section_head\" >\n                        <p class=\"label\">Font Color: </p>\n                        <input class=\"conf\" \n                                [(ngModel)]=\"config.section_head.font_color\">\n                    </div>\n                </div>\n                \n                <div class=\"section\" *ngIf=\"config.intro\">\n                    <h1 class=\"header\">Introduction</h1>\n                    <div class=\"item\">\n                        <p class=\"label\">Font Color: </p>\n                        <input class=\"conf\" \n                                [(ngModel)]=\"config.intro.font_color\">\n                    </div>\n                    <div class=\"item\"\n                                *ngIf=\"config.intro\" >\n                        <p class=\"label\">Background Color: </p>\n                        <input class=\"conf\" \n                                [(ngModel)]=\"config.intro.back_color\">\n                    </div>\n                    <div class=\"item\"\n                                    *ngIf=\"config.intro\" >\n                        <p class=\"label\">Text: </p>\n                        <textarea\n                                    [(ngModel)]=\"config.intro.text\">\n                        </textarea>\n                    </div>\n                </div>\n\n                <div class=\"section\">\n                    <h1 class=\"header\">Table</h1>\n                    <div class=\"item\"\n                                *ngIf=\"config.section_head\" >\n                        <p class=\"label\">Title Color: </p>\n                        <input class=\"conf\" \n                                [(ngModel)]=\"config.second_head.font_color\">\n                    </div>\n                    <div *ngIf=\"eventType=='inspection'\">\n                        <label>Facility Content:</label>\n                            <div class=\"item\"\n                                *ngFor=\"let field of config.table_head\">\n                                \n                                <input type=\"checkbox\" [(ngModel)]=\"field.use\">\n                                <p>{{ field.val }}</p>\n\n                            </div>\n                    </div>\n                </div>\n                \n                <div class=\"section last\">\n                    <div class=\"item\">\n                        <p class=\"label\">Admin Email:</p><input class=\"conf\" *ngIf=\"config\" [(ngModel)]=\"config.admin_email\">\n                    </div>\n                </div>\n\n                <div class=\"control-buttons\">\n                    <h2 class=\"button\" (click)=\"saveConfigs()\">Save</h2>\n                    <h2 class=\"button\" (click)=\"reset()\">Reset</h2>\n                </div>\n\n            </div>\n        </div>\n    </div>\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/notifications/notifications.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var notification_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/notifications/notification.service.ts");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var Observable_1 = __webpack_require__("../../../../rxjs/_esm5/Observable.js");
var NotificationsComponent = /** @class */ (function () {
    function NotificationsComponent(titleService, notHTMLService, notService) {
        this.titleService = titleService;
        this.notHTMLService = notHTMLService;
        this.notService = notService;
        this.subscriptions = [];
        this.notification = '';
        this.name = 'default';
        this.tempNames = [];
        this.config = {};
        this.oldConfig = {};
        this.previewConfig = {};
        this.eventType = 'new_event';
        this.enteringNew = false;
        this.newName = '';
        this.imageNames = [];
    }
    NotificationsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.titleService.title.next('Notifications');
        this.subscriptions.push(this.notHTMLService.notification.subscribe(function (html) {
            _this.notContainer.nativeElement.innerHTML = html;
        }));
        this.subscriptions.push(this.notHTMLService.config.subscribe(function (config) {
            _this.config = config;
            _this.oldConfig = JSON.parse(JSON.stringify(config));
            _this.previewConfig = JSON.parse(JSON.stringify(config));
        }));
        this.subscriptions.push(this.notHTMLService.tempNames.subscribe(function (names) {
            _this.tempNames = names;
        }));
        this.subscriptions.push(this.notHTMLService.name.subscribe(function (name) {
            _this.name = name;
        }));
        this.subscriptions.push(Observable_1.Observable.interval(3000).subscribe(function (x) {
            _this.preview(_this.name, _this.eventType, _this.config);
        }));
        this.subscriptions.push(this.notHTMLService.imageNames.subscribe(function (names) {
            _this.imageNames = names;
        }));
        this.notHTMLService.getNotification(this.name, this.eventType);
        this.notHTMLService.getConfigs('new_event', this.name);
        this.notHTMLService.getTemplateNames();
        this.notHTMLService.getImageNames();
    };
    NotificationsComponent.prototype.getNotification = function (name, eventType, config) {
        if (config === void 0) { config = null; }
        this.eventType = eventType;
        this.name = name;
        this.notHTMLService.getNotification(name, eventType, config);
        this.notHTMLService.getConfigs(eventType, name);
    };
    NotificationsComponent.prototype.preview = function (name, eventType, config) {
        if (config === void 0) { config = null; }
        if (!_.isEqual(this.config, this.previewConfig)) {
            this.notHTMLService.getNotification(name, eventType, config);
            this.previewConfig = JSON.parse(JSON.stringify(this.config));
        }
    };
    NotificationsComponent.prototype.saveConfigs = function () {
        if (!_.isEqual(this.config, this.oldConfig)) {
            this.notHTMLService.saveConfigs(this.name, this.config);
            this.oldConfig = JSON.parse(JSON.stringify(this.config));
        }
        else {
            this.notService.info('No Changes', 'These configs are already in place!');
        }
    };
    NotificationsComponent.prototype.reset = function () {
        this.config = JSON.parse(JSON.stringify(this.oldConfig));
    };
    NotificationsComponent.prototype.keyboardInput = function (event) {
        if (this.enteringNew === true) {
            if (event.keyCode === 13) {
                if (this.newName !== '') {
                    // remove unwanted characters
                    var cleanName = this.newName.replace(/[^\w]/gi, '');
                    this.notHTMLService.newTemplate(cleanName);
                    this.enteringNew = false;
                    this.newName = '';
                    this.notHTMLService.getTemplateNames();
                }
            }
        }
        else {
            if (event.keyCode === 13) {
                this.preview(this.name, this.eventType, this.config);
            }
        }
    };
    __decorate([
        core_1.ViewChild('notificationContainer'),
        __metadata("design:type", core_1.ElementRef)
    ], NotificationsComponent.prototype, "notContainer", void 0);
    __decorate([
        core_1.HostListener('window:keydown', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], NotificationsComponent.prototype, "keyboardInput", null);
    NotificationsComponent = __decorate([
        core_1.Component({
            selector: 'notifications',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/notifications/notifications.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/notifications/notifications.component.css")]
        }),
        __metadata("design:paramtypes", [title_service_1.TitleService,
            notification_service_1.NotificationHTMLService,
            angular2_notifications_1.NotificationsService])
    ], NotificationsComponent);
    return NotificationsComponent;
}());
exports.NotificationsComponent = NotificationsComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/scenarios/scenario-search/scenario-search.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".title, label, p, th {\n    color: white\n}\n\n.title {\n    text-align: center;\n}\n\ninput, select, th {\n    font-size: 15px;\n}\n\n.date input {\n    width: 6em;\n}\n\n.section {\n    border-bottom: 5px dashed #55aaee;\n    padding: 5px;\n    margin: 5px;\n}\n\n.item {\n    display: inline-block;\n    margin: 5px;\n    border: 2px solid #55aaee;\n    border-radius: 5px;\n    padding: 10px;\n    box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n}\n\n#to {\n    display: inline-block;\n    font-size: 15px;\n}\n\n.event-type {\n    border: 3px solid #ffffff;\n}\n\n.event-type.selected, .event-type:hover {\n    border: 3px solid #55aaee;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/scenarios/scenario-search/scenario-search.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"scenario-search\">\n    <h1 class=\"title\">From the Web</h1>\n    <div class=\"section\">\n\n        <div class=\"item\">\n            <h3 class=\"event-type button\" \n                    [ngClass]=\"{'selected': filter.scenariosOnly==true}\"\n                    (click)=\"filter.scenariosOnly=true\">\n                Scenarios\n            </h3>\n            <h3 class=\"event-type button\"\n                    [ngClass]=\"{'selected': filter.scenariosOnly==false}\"\n                    (click)=\"filter.scenariosOnly=false\">\n                Real Events\n            </h3>\n            <info [text]=\"'Searching for Scenarios will allow you to look for\n                            ShakeMaps representing hypothetical earthquakes. Searching\n                            for Real Events will only yield results for ShakeMaps\n                            generated by real earthquake data. Both can be\n                            downloaded and run as ShakeCast scenarios.'\"\n                [side]=\"'left'\"></info>\n        </div>\n        \n    </div>\n\n    <div class=\"section\">\n        <h2 class=\"title\">Event ID: </h2>\n        <div class=\"item\">\n            <input [(ngModel)]=\"filter.eventid\" placeholder=\"Any\">\n        </div>\n    </div>\n\n    <div class=\"section date\">\n        <h2 class=\"title\">Date Range</h2>\n        <div class=\"item\">\n            <input [(ngModel)]=\"filter.starttime\" placeholder=\"Start Date (yyyy-mm-dd)\">\n        </div>\n        <p id=\"to\">to</p>\n        <div class=\"item\">\n            <input [(ngModel)]=\"filter.endtime\" placeholder=\"End Date (yyyy-mm-dd)\">\n        </div>\n    </div>\n\n    <div class=\"section\">\n        <h2 class=\"title\">Minimum Magnitude: </h2>\n        <div class=\"item\">\n            <select [(ngModel)]=\"filter.minmagnitude\">\n                <option *ngFor=\"let mag of [3,4,5,6,7,8,9]\" [value]=\"mag\">{{ mag }}</option>\n            </select>\n        </div>\n    </div>\n\n\n\n    <div class=\"section\">\n        <h2 class=\"title\">Bounding Location</h2>\n        <div class=\"item\">\n            <table class=\"pos-table\">\n                <tr>\n                    <th>Minimum Latitude:</th>\n                    <td><select [(ngModel)]=\"filter.minlatitude\">\n                    <option *ngFor=\"let lat of lats\" [value]=\"lat\">{{ lat }}</option>\n                </select></td>\n                </tr>\n                \n                <tr>\n                    <th>Maximum Latitude:</th>\n                    <td><select [(ngModel)]=\"filter.maxlatitude\">\n                    <option *ngFor=\"let lat of lats\" [value]=\"lat\">{{ lat }}</option>\n                </select></td>\n                </tr>\n                \n                <tr>\n                    <th>Minimum Longitude:</th>\n                    <td><select [(ngModel)]=\"filter.minlongitude\">\n                    <option *ngFor=\"let lon of lons\" [value]=\"lon\">{{ lon }}</option>\n                </select></td>\n                </tr>\n                \n                <tr>\n                    <th>Maximum Longitude:</th>\n                    <td><select [(ngModel)]=\"filter.maxlongitude\">\n                    <option *ngFor=\"let lon of lons\" [value]=\"lon\">{{ lon }}</option>\n                </select></td>\n                </tr>\n            \n            </table>\n        </div>\n    </div>\n\n    <h2 class=\"search button\" (click)=\"eqService.getDataFromWeb(filter)\">Search</h2>\n\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/scenarios/scenario-search/scenario-search.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var earthquake_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake.service.ts");
var ScenarioSearchComponent = /** @class */ (function () {
    function ScenarioSearchComponent(eqService) {
        this.eqService = eqService;
        this.subscriptions = [];
        this.show = 'hide';
        this.facilityShaking = null;
        this.showFragilityInfo = false;
        this.lats = [];
        this.lons = [];
        this.filter = { starttime: '2005-01-01',
            endtime: '',
            eventid: null,
            minmagnitude: 7,
            minlatitude: -90,
            maxlatitude: 90,
            minlongitude: -180,
            maxlongitude: 180,
            scenariosOnly: false };
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth();
        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        this.filter['endtime'] = [date.getFullYear(),
            month, day].join('-');
    }
    ScenarioSearchComponent.prototype.ngOnInit = function () {
        var _this = this;
        // generate lats and lons
        for (var i = -180; i <= 180; i += 5) {
            this.lons.push(i);
            if ((i >= -90) && (i <= 90)) {
                this.lats.push(i);
            }
        }
        this.subscriptions.push(this.eqService.showScenarioSearch.subscribe(function (show) {
            if (show === true) {
                _this.show = 'show';
            }
            else {
                _this.show = 'hide';
            }
        }));
    };
    ScenarioSearchComponent.prototype.showInfo = function () {
    };
    ScenarioSearchComponent.prototype.hide = function () {
        this.show = 'hide';
        //this.eqService.showScenarioSearch.next(false);
    };
    ScenarioSearchComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    ScenarioSearchComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    ScenarioSearchComponent = __decorate([
        core_1.Component({
            selector: 'scenario-search',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/scenarios/scenario-search/scenario-search.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/scenarios/scenario-search/scenario-search.component.css")],
            animations: [
                core_1.trigger('show', [
                    core_1.state('hide', core_1.style({ left: '100%' })),
                    core_1.state('show', core_1.style({ left: '55%' })),
                    core_1.transition('* => *', core_1.animate('500ms ease-in-out'))
                ])
            ]
        }),
        __metadata("design:paramtypes", [earthquake_service_1.EarthquakeService])
    ], ScenarioSearchComponent);
    return ScenarioSearchComponent;
}());
exports.ScenarioSearchComponent = ScenarioSearchComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/scenarios/scenarios.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".map-container {\n    width: 100%;\n    height: 100%;\n    top: 0;\n    position: fixed;\n}\n\n.control {\n    padding: 10px;\n    text-align: center;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/scenarios/scenarios.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"map-container\">\n    <my-map class=\"map\"></my-map>\n</div>\n\n<div class=\"right-panel\" [@showRight]=\"showRight\">\n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleRight()\">\n            <span class=\"arrow-icon\" [hidden]=\"showRight=='shown'\"><i class=\"fa fa-chevron-left\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showRight=='hidden'\"><i class=\"fa fa-chevron-right\"></i></span>\n        </div>\n    </div>\n    <div class=\"panel-content\">\n            <h1 class=\"panel-title\">Scenarios</h1>\n            <div class=\"panel-scroll-container\">\n                <div class=\"inner-shadow\"></div>\n                <earthquake-list></earthquake-list>\n            </div>\n    </div>\n</div>\n\n<div class=\"left-panel\" [@showLeft]=\"showLeft\">\n    \n    <div class=\"panel-content\">\n            <div class=\"panel-scroll-container\">\n                <scenario-search></scenario-search>\n            </div>\n    </div>\n</div>\n\n<div class=\"bottom-panel\" [@showBottom]=\"showBottom\">\n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleBottom()\" style=\"width:0\">\n            <span class=\"arrow-icon\" [hidden]=\"showBottom=='shown'\"><i class=\"fa fa-chevron-up\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showBottom=='hidden'\"><i class=\"fa fa-chevron-down\"></i></span>\n        </div>\n    </div>\n    <div class=\"control\">\n        <div *ngIf=\"!searchShown\">\n            <h3 class=\"button\" (click)=\"getMore()\">Download More from the Web</h3>\n            <!--\n            <h3 class=\"button\" (click)=\"getMore()\">Search your Earthquake Database</h3>\n            -->\n            <h3 class=\"button\" (click)=\"eqService.runScenario(eqService.selected.event_id)\">Run Scenario</h3>\n            <h3 class=\"button\" (click)=\"deleteScenario()\">Delete Selected</h3>\n        </div>\n        <div *ngIf=\"searchShown\">\n            <h3 class=\"button\" (click)=\"eqService.downloadScenario(eqService.selected.event_id, eqService.selected.scenario)\">Download Selected</h3>\n            <h3 class=\"button\" (click)=\"userScenarios()\">Back</h3>\n        </div>\n    </div>\n\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/scenarios/scenarios.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var earthquake_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake.service.ts");
var facility_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts");
var animations_1 = __webpack_require__("../../../../../src/app/shared/animations/animations.ts");
var ScenariosComponent = /** @class */ (function () {
    function ScenariosComponent(titleService, eqService, facService) {
        this.titleService = titleService;
        this.eqService = eqService;
        this.facService = facService;
        this.subscriptions = [];
        this.searchShown = false;
        this.showBottom = 'hidden';
        this.showLeft = 'hidden';
        this.showRight = 'hidden';
    }
    ScenariosComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.titleService.title.next('Scenarios');
        this.subscriptions.push(this.eqService.earthquakeData.subscribe(function (eqs) {
            _this.eqService.plotEq(eqs[0]);
        }));
        this.subscriptions.push(this.eqService.showScenarioSearch.subscribe(function (show) {
            _this.searchShown = show;
        }));
        this.eqService.getData({ 'scenario': true });
        this.eqService.showScenarioSearch.next(false);
        this.toggleBottom();
        this.toggleRight();
    };
    ScenariosComponent.prototype.getMore = function () {
        this.eqService.showScenarioSearch.next(true);
        this.eqService.earthquakeData.next([]);
        this.showLeft = 'shown';
    };
    ScenariosComponent.prototype.userScenarios = function () {
        this.eqService.showScenarioSearch.next(false);
        this.eqService.getData({ 'scenario': true });
        this.showLeft = 'hidden';
    };
    ScenariosComponent.prototype.deleteScenario = function () {
        this.eqService.deleteScenario(this.eqService.selected.event_id);
    };
    ScenariosComponent.prototype.toggleLeft = function () {
        if (this.showLeft == 'hidden') {
            this.showLeft = 'shown';
        }
        else {
            this.showLeft = 'hidden';
        }
    };
    ScenariosComponent.prototype.toggleRight = function () {
        if (this.showRight == 'hidden') {
            this.showRight = 'shown';
        }
        else {
            this.showRight = 'hidden';
        }
    };
    ScenariosComponent.prototype.toggleBottom = function () {
        if (this.showBottom == 'hidden') {
            this.showBottom = 'shown';
        }
        else {
            this.showBottom = 'hidden';
        }
    };
    ScenariosComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
        // clear map
        this.eqService.clearData();
    };
    ScenariosComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    ScenariosComponent = __decorate([
        core_1.Component({
            selector: 'scenarios',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/scenarios/scenarios.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/scenarios/scenarios.component.css"), __webpack_require__("../../../../../src/app/shared/css/data-list.css"), __webpack_require__("../../../../../src/app/shared/css/panels.css")],
            animations: [animations_1.showLeft, animations_1.showRight, animations_1.showBottom]
        }),
        __metadata("design:paramtypes", [title_service_1.TitleService,
            earthquake_service_1.EarthquakeService,
            facility_service_1.FacilityService])
    ], ScenariosComponent);
    return ScenariosComponent;
}());
exports.ScenariosComponent = ScenariosComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/users/user-list.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".users-container {\n    white-space: nowrap;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/users/user-list.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"data-list-inner-container\">\n    <div *ngIf=\"!loadingData\">\n        <div *ngIf=\"dataList.length > 0\">\n            <div class=\"data\" \n                    [@selected]=\"data.selected\" \n                    *ngFor=\"let data of dataList\" \n                    (click)=\"clickData(data)\"\n                    (dblclick)=\"editUser(data)\">\n                <div [@headerSelected]=\"data.selected\" class=\"data-header\">\n                    <h3 *ngIf=\"data.full_name\"> {{ data.full_name }} </h3>\n                    <h3 *ngIf=\"!data.full_name\"> {{ data.username }} </h3>\n                </div>\n                <div class=\"data-body\">\n                    <div class=\"data-info-container\">\n                        <table class=\"container-table\">\n                            <tr>\n                                <th>Username: </th>\n                                <td *ngIf=\"!data?.editing\">{{ data.username }}</td>\n                                <td *ngIf=\"data?.editing\">\n                                    <input [(ngModel)]=\"data.username\">\n                                </td>\n                            </tr>\n                            <tr>\n                                <th>Email: </th>\n                                <td *ngIf=\"!data?.editing\">{{ data.email }}</td>\n                                <td *ngIf=\"data?.editing\">\n                                    <input [(ngModel)]=\"data.email\">\n                                </td>\n                            </tr>\n                        </table>\n                        <h3 *ngIf=\"data.user_type == 'ADMIN'\">\n                            Admin\n                        </h3>\n                        <div class=\"delete\">\n                            <p class=\"button\" (click)=\"userService.deleteUsers([data])\">Delete</p>\n                        </div>\n                        <div class=\"updated\">\n                            <p>Updated: {{ data.updated * 1000 | date }}</p>\n                            <p>|</p>\n                            <p>{{ data.updated_by }}</p>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div *ngIf=\"dataList.length == 0\">\n            \n            <h1 class=\"data-list-no-data\">No Users</h1>\n            \n            <h2 class=\"data-list-no-data\">\n                (Drag and drop XML files here to upload)\n            </h2>\n\n        </div>\n    </div>\n    <div *ngIf=\"loadingData\">\n        <p>loading...</p>\n    </div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/users/user-list.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var users_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/users.service.ts");
var group_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/group.service.ts");
var UserListComponent = /** @class */ (function () {
    function UserListComponent(userService, groupService) {
        this.userService = userService;
        this.groupService = groupService;
        this.loadingData = false;
        this.dataList = [];
        this.oldData = [];
        this.filter = {};
        this.selected = null;
        this.editing = null;
        this.subscriptions = [];
    }
    UserListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.userService.userData.subscribe(function (data) {
            _this.dataList = data;
            for (var user in _this.dataList) {
                _this.dataList[user]['selected'] = false;
            }
            _this.selected = _this.dataList[0];
            _this.selected['selected'] = true;
            _this.oldData = JSON.parse(JSON.stringify(_this.dataList));
            _this.clickData(_this.dataList[0]);
        }));
        this.subscriptions.push(this.userService.loadingData.subscribe(function (loading) {
            _this.loadingData = loading;
        }));
        this.subscriptions.push(this.userService.saveUsersFromList.subscribe(function (saveUsers) {
            if ((saveUsers === true) && (!_.isEqual(_this.dataList, _this.oldData))) {
                _this.oldData = JSON.parse(JSON.stringify(_this.dataList));
                _this.saveUsers();
                _this.userService.saveUsersFromList.next(false);
            }
        }));
        this.userService.getData();
    };
    UserListComponent.prototype.clickData = function (data) {
        this.selected['selected'] = false;
        data.selected = true;
        this.selected = data;
        this.userService.current_user = data;
        this.groupService.getData({ 'user': data.username });
    };
    UserListComponent.prototype.editUser = function (user) {
        if (this.editing) {
            this.editing['editing'] = false;
        }
        this.editing = user;
        this.editing['editing'] = true;
    };
    UserListComponent.prototype.saveUsers = function () {
        this.userService.saveUsers(this.dataList);
    };
    UserListComponent.prototype.keyboardInput = function (event) {
        if (event.keyCode === 13) {
            this.editing['editing'] = false;
        }
    };
    UserListComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    UserListComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    __decorate([
        core_1.HostListener('window:keydown', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], UserListComponent.prototype, "keyboardInput", null);
    UserListComponent = __decorate([
        core_1.Component({
            selector: 'user-list',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/user-list.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shared/css/data-list.css"), __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/user-list.component.css")],
            animations: [
                core_1.trigger('selected', [
                    core_1.state('true', core_1.style({ transform: 'translateY(-10px)' })),
                    core_1.state('false', core_1.style({ transform: 'translateY(0px)' })),
                    core_1.transition('true => false', core_1.animate('100ms ease-out')),
                    core_1.transition('false => true', core_1.animate('100ms ease-in'))
                ]),
                core_1.trigger('headerSelected', [
                    core_1.state('true', core_1.style({ 'background-color': '#7af' })),
                    core_1.state('false', core_1.style({ 'background-color': '#aaaaaa' })),
                    core_1.transition('true => false', core_1.animate('100ms ease-out')),
                    core_1.transition('false => true', core_1.animate('100ms ease-in'))
                ])
            ]
        }),
        __metadata("design:paramtypes", [users_service_1.UsersService,
            group_service_1.GroupService])
    ], UserListComponent);
    return UserListComponent;
}());
exports.UserListComponent = UserListComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/users/users.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".map-container {\n    width: 100%;\n    height: 100%;\n    top: 0;\n    position: fixed;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/users/users.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"map-container\">\n    <my-map class=\"map\"></my-map>\n</div>\n\n<div class=\"left-panel\" [@showLeft]=\"showLeft\">\n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleLeft()\">\n            <span class=\"arrow-icon\" [hidden]=\"showLeft=='shown'\"><i class=\"fa fa-chevron-right\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showLeft=='hidden'\"><i class=\"fa fa-chevron-left\"></i></span>\n        </div>\n    </div>\n    <div class=\"panel-content\">\n\n        <h2 class=\"panel-title\">Users</h2>\n\n        <div class=\"panel-scroll-container\">\n            <div class=\"inner-shadow\"></div>\n            <user-list></user-list>\n        </div>\n    </div>\n\n    <h2 class=\"button\" (click)=\"deleteCurrentUser()\">Delete User</h2>\n    <h2 class=\"button\" (click)=\"saveUsers()\">Save Data</h2>\n</div>\n\n<div class=\"right-panel\" [@showRight]=\"showRight\">\n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleRight()\">\n            <span class=\"arrow-icon\" [hidden]=\"showRight=='shown'\"><i class=\"fa fa-chevron-left\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showRight=='hidden'\"><i class=\"fa fa-chevron-right\"></i></span>\n        </div>\n    </div>\n    <div class=\"panel-content\">\n            <h2 class=\"panel-title\">Groups</h2>\n            \n            <div class=\"panel-scroll-container\">\n                <div class=\"inner-shadow\"></div>\n                <group-list></group-list>\n            </div>\n    </div>\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/users/users.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var group_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/group.service.ts");
//mport { FacilityListComponent } from './facility-list.component'
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var users_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/users.service.ts");
var map_service_1 = __webpack_require__("../../../../../src/app/shared/maps/map.service.ts");
var animations_1 = __webpack_require__("../../../../../src/app/shared/animations/animations.ts");
var UsersComponent = /** @class */ (function () {
    function UsersComponent(groupService, titleService, usersService, mapService) {
        this.groupService = groupService;
        this.titleService = titleService;
        this.usersService = usersService;
        this.mapService = mapService;
        this.subscriptions = [];
        this.groupData = [];
        this.showLeft = 'shown';
        this.showRight = 'shown';
        this.showBottom = 'hidden';
    }
    UsersComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.titleService.title.next('Users and Groups');
        this.subscriptions.push(this.groupService.groupData.subscribe(function (data) {
            _this.groupData = data;
            _this.groupService.clearMap();
        }));
    };
    UsersComponent.prototype.deleteCurrentUser = function () {
        this.usersService.deleteUsers([this.usersService.current_user]);
    };
    UsersComponent.prototype.saveUsers = function () {
        this.usersService.saveUsersFromList.next(true);
    };
    UsersComponent.prototype.toggleLeft = function () {
        if (this.showLeft == 'hidden') {
            this.showLeft = 'shown';
        }
        else {
            this.showLeft = 'hidden';
        }
    };
    UsersComponent.prototype.toggleRight = function () {
        if (this.showRight == 'hidden') {
            this.showRight = 'shown';
        }
        else {
            this.showRight = 'hidden';
        }
    };
    UsersComponent.prototype.toggleBottom = function () {
        if (this.showBottom == 'hidden') {
            this.showBottom = 'shown';
        }
        else {
            this.showBottom = 'hidden';
        }
    };
    UsersComponent = __decorate([
        core_1.Component({
            selector: 'users',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/users.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/pages/users/users.component.css"), __webpack_require__("../../../../../src/app/shared/css/data-list.css"), __webpack_require__("../../../../../src/app/shared/css/panels.css")],
            animations: [animations_1.showLeft, animations_1.showRight, animations_1.showBottom]
        }),
        __metadata("design:paramtypes", [group_service_1.GroupService,
            title_service_1.TitleService,
            users_service_1.UsersService,
            map_service_1.MapService])
    ], UsersComponent);
    return UsersComponent;
}());
exports.UsersComponent = UsersComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/pages/users/users.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/map.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/catch.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var map_service_1 = __webpack_require__("../../../../../src/app/shared/maps/map.service.ts");
var UsersService = /** @class */ (function () {
    function UsersService(_http, mapService, notService) {
        this._http = _http;
        this.mapService = mapService;
        this.notService = notService;
        this.loadingData = new ReplaySubject_1.ReplaySubject(1);
        this.userData = new ReplaySubject_1.ReplaySubject(1);
        this.selection = new ReplaySubject_1.ReplaySubject(1);
        this.saveUsersFromList = new ReplaySubject_1.ReplaySubject(1);
        this.current_user = null;
        this.filter = {};
    }
    UsersService.prototype.getData = function (filter) {
        var _this = this;
        if (filter === void 0) { filter = {}; }
        this.loadingData.next(true);
        var params = new http_1.URLSearchParams();
        params.set('filter', JSON.stringify(filter));
        this._http.get('/api/users', { search: params })
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            _this.userData.next(result);
            _this.current_user = result[0];
            _this.loadingData.next(false);
        });
    };
    UsersService.prototype.getCurrentUser = function () {
        var _this = this;
        this._http.get('/api/users/current')
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            _this.userData.next([result]);
            _this.loadingData.next(false);
        });
    };
    UsersService.prototype.selectAll = function () {
        this.selection.next('all');
    };
    UsersService.prototype.unselectAll = function () {
        this.selection.next('none');
    };
    UsersService.prototype.saveUsers = function (users) {
        var _this = this;
        var headers = new http_1.Headers();
        this.notService.success('User Info', 'Saving your changes...');
        headers.append('Content-Type', 'application/json');
        this._http.post('/api/users', JSON.stringify({ users: users }), { headers: headers })
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            //this.getData();
            _this.loadingData.next(false);
        });
    };
    UsersService.prototype.deleteUsers = function (users) {
        var _this = this;
        this.notService.success('Delete User', 'Deleting ' + users.length + ' user');
        this.loadingData.next(true);
        var params = new http_1.URLSearchParams();
        params.set('inventory', JSON.stringify(users));
        params.set('inventory_type', 'user');
        this._http.delete('/api/delete/inventory', { search: params })
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            _this.getData();
            _this.loadingData.next(false);
        });
    };
    UsersService.prototype.plotUser = function (user) {
        this.mapService.plotUser(user);
    };
    UsersService.prototype.clearMap = function () {
        this.mapService.clearMap();
    };
    UsersService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            map_service_1.MapService,
            angular2_notifications_1.NotificationsService])
    ], UsersService);
    return UsersService;
}());
exports.UsersService = UsersService;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/shakecast-admin.component.html":
/***/ (function(module, exports) {

module.exports = "<div ng2FileDrop (fileOver)=\"showUpload()\">\n    <update></update>\n    <router-outlet></router-outlet>\n    <upload></upload>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/shakecast-admin.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var upload_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/upload/upload.service.ts");
var animations_1 = __webpack_require__("../../../../../src/app/shared/animations/animations.ts");
var ShakeCastAdminComponent = /** @class */ (function () {
    /*
    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('style.display')   display = 'block';
    @HostBinding('style.position')  position = 'static';
*/
    function ShakeCastAdminComponent(uploadService) {
        this.uploadService = uploadService;
    }
    ShakeCastAdminComponent.prototype.showUpload = function () {
        this.uploadService.showUpload();
    };
    ShakeCastAdminComponent = __decorate([
        core_1.Component({
            selector: 'shakecast-admin',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/shakecast-admin.component.html"),
            animations: [animations_1.fadeAnimation]
        }),
        __metadata("design:paramtypes", [upload_service_1.UploadService])
    ], ShakeCastAdminComponent);
    return ShakeCastAdminComponent;
}());
exports.ShakeCastAdminComponent = ShakeCastAdminComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/shakecast-admin.module.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var forms_1 = __webpack_require__("../../../forms/esm5/forms.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
var shakecast_admin_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/shakecast-admin.component.ts");
var shakecast_admin_routing_1 = __webpack_require__("../../../../../src/app/shakecast-admin/shakecast-admin.routing.ts");
var facilities_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facilities.component.ts");
var facility_filter_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility-filter/facility-filter.component.ts");
var groups_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/groups.component.ts");
var group_list_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/group-list.component.ts");
var users_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/users.component.ts");
var user_list_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/user-list.component.ts");
var config_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/config/config.component.ts");
var config_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/config/config.service.ts");
var upload_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/upload/upload.component.ts");
var upload_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/upload/upload.service.ts");
var notifications_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/notifications/notifications.component.ts");
var notification_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/notifications/notification.service.ts");
var update_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/update/update.component.ts");
var update_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/update/update.service.ts");
var scenarios_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/scenarios/scenarios.component.ts");
var scenario_search_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/scenarios/scenario-search/scenario-search.component.ts");
var shared_module_1 = __webpack_require__("../../../../../src/app/shared/shared.module.ts");
var ShakeCastAdminModule = /** @class */ (function () {
    function ShakeCastAdminModule() {
    }
    ShakeCastAdminModule = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                shakecast_admin_routing_1.routing,
                http_1.HttpModule,
                http_1.JsonpModule,
                shared_module_1.SharedModule
            ],
            declarations: [
                shakecast_admin_component_1.ShakeCastAdminComponent,
                facilities_component_1.FacilitiesComponent,
                facility_filter_component_1.FacilityFilter,
                groups_component_1.GroupsComponent,
                group_list_component_1.GroupListComponent,
                users_component_1.UsersComponent,
                user_list_component_1.UserListComponent,
                config_component_1.ConfigComponent,
                upload_component_1.UploadComponent,
                notifications_component_1.NotificationsComponent,
                update_component_1.UpdateComponent,
                scenarios_component_1.ScenariosComponent,
                scenario_search_component_1.ScenarioSearchComponent
            ],
            providers: [
                config_service_1.ConfigService,
                upload_service_1.UploadService,
                notification_service_1.NotificationHTMLService,
                update_service_1.UpdateService
            ]
        })
    ], ShakeCastAdminModule);
    return ShakeCastAdminModule;
}());
exports.ShakeCastAdminModule = ShakeCastAdminModule;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/shakecast-admin.routing.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var shakecast_admin_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/shakecast-admin.component.ts");
var facilities_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facilities.component.ts");
var groups_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/groups/groups.component.ts");
var users_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/users.component.ts");
var config_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/config/config.component.ts");
var scenarios_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/scenarios/scenarios.component.ts");
var notifications_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/notifications/notifications.component.ts");
var login_guard_1 = __webpack_require__("../../../../../src/app/auth/login.guard.ts");
var admin_guard_1 = __webpack_require__("../../../../../src/app/auth/admin.guard.ts");
var appRoutes = [
    {
        path: '',
        component: shakecast_admin_component_1.ShakeCastAdminComponent,
        canActivate: [login_guard_1.LoginGuard, admin_guard_1.AdminGuard],
        children: [
            {
                path: 'facilities',
                component: facilities_component_1.FacilitiesComponent
            },
            {
                path: 'groups',
                component: groups_component_1.GroupsComponent
            },
            {
                path: 'users',
                component: users_component_1.UsersComponent
            },
            {
                path: 'scenarios',
                component: scenarios_component_1.ScenariosComponent
            },
            {
                path: 'notifications',
                component: notifications_component_1.NotificationsComponent
            },
            {
                path: 'config',
                component: config_component_1.ConfigComponent
            },
            {
                path: '',
                redirectTo: 'facilities',
                pathMatch: 'full'
            }
        ]
    }
];
exports.shakecastAdminRoutes = [
    {
        path: 'shakecast-admin',
        loadChildren: 'app/shakecast-admin/shakecast-admin.module#ShakeCastAdminModule'
    }
];
exports.routing = router_1.RouterModule.forChild(appRoutes);


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/update/update.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".update-container {\n    width: 100%;\n    bottom: 0;\n    position: fixed;\n    background: #ff6161;\n    z-index: 3;\n}\n\n.update-container h3 {\n    display: inline-block;\n    margin-right: 30px;\n    margin-left: 10px;\n    color: #ffffff;\n}\n\n.update {\n    font-weight: bold;\n}\n\n.close-button {\n    margin: 3px;\n    padding: 5px;\n    float: right;\n    font-weight: bold;\n    right: 0;\n    color: #ffffff;\n    cursor: pointer;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/update/update.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"update-container\" *ngIf=\"info?.required\">\n    <h3>ShakeCast requires a software update</h3>\n    <p class=\"button update\" (click)=\"update()\">Update ShakeCast</p>\n    <h2 class=\"close-button\" (click)=\"close()\">X</h2>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/update/update.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var update_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/update/update.service.ts");
var UpdateComponent = /** @class */ (function () {
    function UpdateComponent(updateService) {
        this.updateService = updateService;
        this.subscriptions = [];
        this.info = null;
    }
    UpdateComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.updateService.info.subscribe(function (info) {
            _this.info = info;
        }));
        this.updateService.getData();
    };
    UpdateComponent.prototype.update = function () {
        this.info['required'] = false;
        this.updateService.updateShakecast();
    };
    UpdateComponent.prototype.close = function () {
        this.info['required'] = false;
    };
    UpdateComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    UpdateComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    UpdateComponent = __decorate([
        core_1.Component({
            selector: 'update',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/update/update.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/update/update.component.css")]
        }),
        __metadata("design:paramtypes", [update_service_1.UpdateService])
    ], UpdateComponent);
    return UpdateComponent;
}());
exports.UpdateComponent = UpdateComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/update/update.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var http_1 = __webpack_require__("../../../common/esm5/http.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var operators_1 = __webpack_require__("../../../../rxjs/_esm5/operators.js");
var UpdateService = /** @class */ (function () {
    function UpdateService(_http, notService) {
        this._http = _http;
        this.notService = notService;
        this.info = new ReplaySubject_1.ReplaySubject(1);
    }
    UpdateService.prototype.getData = function () {
        var _this = this;
        this._http.get('/api/software-update')
            .subscribe(function (result) {
            _this.info.next(result);
        });
    };
    UpdateService.prototype.updateShakecast = function () {
        var _this = this;
        this._http.post('/api/software-update', {})
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            _this.info.next(result);
            if (result['required'] == false) {
                _this.notService.success('Software Update', 'Update Complete');
            }
            else {
                _this.notService.alert('Software Update', 'Update Failed');
            }
        });
    };
    UpdateService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.HttpClient,
            angular2_notifications_1.NotificationsService])
    ], UpdateService);
    return UpdateService;
}());
exports.UpdateService = UpdateService;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/upload/upload.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".upload-window {\n    width: 80%;\n    margin-left: 10%;\n    max-height: 800px;\n    top: -600px;\n    position: fixed;\n    overflow-y: scroll;\n    z-index: 2000;\n}\n\n.upload-title {\n    color: #ffffff;\n    font-size: 72px;\n    text-align: center;\n    margin-bottom: 10px;\n    margin-top: 0px;\n}\n\n.show-upload-window {\n    top: 300px;\n}\n\n.file-info {\n    margin-top: 5px;\n}\n\n.drop-zone { \n    border: dotted 5px #fff;\n    width: 80%;\n    height: 300px;\n    margin-left: auto;\n    margin-right: auto;\n    text-align: center;\n    border-radius: 5px;\n    overflow: scroll;\n}\n\n.drop-zone p, .drop-zone h2 {\n    color: #fff;\n}\n\n.file-over { \n    border-color: #55aaee;\n    color: #55aaee;\n}\n\n/* Default class applied to drop zones on over */\n\n.done {\n    color:#fff;\n    text-align: center;\n    background: #55aaee;\n    cursor: pointer;\n    width: 30%;\n    margin-left:auto;\n    margin-right:auto;\n    border-radius: 5px;\n}\n\n.done:hover {\n    color: #55aaee;\n    background: #fff;\n}\n\n.button {\n    background: #55aaee;;\n    border-radius: 5px;\n    display: inline-block;\n    margin: 5px;\n    cursor: pointer;\n}\n\n.button .button-text {\n    color: #fff;\n}\n\n.button:hover {\n    background: #fff;\n}\n\n.button:hover .button-text {\n    color: #55aaee;\n}\n\ntd {\n    color: #ffffff;\n    font-weight: bolder;\n}\n\ntable, tr, td {\n    border: none;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/upload/upload.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"upload-window\" [@showUpload]=\"show\">\n    <h1 class=\"upload-title\">Upload</h1>\n    <div class=\"content\">\n        <div ng2FileDrop\n                [ngClass]=\"{'file-over': hasBaseDropZoneOver}\"\n                (fileOver)=\"fileOverBase($event)\"\n                [uploader]=\"uploader\"\n                class=\"drop-zone\">\n            <h2>Drag and Drop!</h2>\n            <p>\n                Facility, Notification Group, User XML files, and images can be dropped here \n                <info [text]=\"'These XML files are generally generated through\n                                the use of the <a \n                                href=ftp://ftpext.cr.usgs.gov/pub/cr/co/golden/shakecast/ShakeCast_Workbook/ShakeCastInventory.xlsm>ShakeCast Inventory Workbook</a>. Get some more info from our <a href=http://usgs.github.io/shakecast/inventory_workbook target=_blank>online documentation</a>. \n                                <br><br>\n                                Uploaded images can be used as a logo in your ShakeCast notifications'\"\n                        [side]=\"'right'\">\n                </info>\n            </p>\n\n            <div class=\"file-info\">\n                <div *ngIf=\"uploader.queue.length>0\">\n                    <table class=\"table\">\n\n                        <tbody>\n                            \n                            <tr *ngFor=\"let item of uploader.queue\">\n                                <td>{{ item?.file?.name }}</td>\n                                <td nowrap>{{ item?.file?.size/1024/1024 | number:'.2' }} MB</td>\n                                <td>\n                                    \n                                </td>\n                                <td class=\"text-center\">\n                                    <span *ngIf=\"item.isSuccess\"><i class=\"glyphicon glyphicon-ok\"></i></span>\n                                    <span *ngIf=\"item.isCancel\"><i class=\"glyphicon glyphicon-ban-circle\"></i></span>\n                                    <span *ngIf=\"item.isError\"><i class=\"glyphicon glyphicon-remove\"></i></span>\n                                </td>\n                                <td nowrap>\n                                    <div class=\"button\"\n                                            (click)=\"upload(item)\">\n                                        <h3 class=\"button-text\">Upload</h3>\n                                    </div>\n                                    <div class=\"button\"\n                                            (click)=\"item.remove()\">\n                                        <h3 class=\"button-text\">Remove</h3>\n                                    </div>\n                                </td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </div>             \n                <div *ngIf=\"uploader.queue.length===0\" class=\"no-files\">\n                    <h2>No Files to Upload</h2>\n                </div>\n            </div>\n        </div>\n\n    </div>\n\n    <h1 class=\"done\" (click)=\"hideUpload()\">Done</h1>\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/shakecast-admin/upload/upload.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var ng2_file_upload_1 = __webpack_require__("../../../../ng2-file-upload/index.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var upload_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/upload/upload.service.ts");
var screen_dimmer_service_1 = __webpack_require__("../../../../../src/app/shared/screen-dimmer/screen-dimmer.service.ts");
var UploadComponent = /** @class */ (function () {
    function UploadComponent(uploadService, screenDimmer, notService) {
        this.uploadService = uploadService;
        this.screenDimmer = screenDimmer;
        this.notService = notService;
        this.uploader = new ng2_file_upload_1.FileUploader({ url: '/admin/upload/' });
        this.hasBaseDropZoneOver = false;
        this.hasAnotherDropZoneOver = false;
        this.show = 'no';
        this.subscriptions = [];
    }
    UploadComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.uploadService.show.subscribe(function (show) {
            if (show === true) {
                _this.showUpload();
            }
            else {
                _this.hideUpload();
            }
        }));
        this.uploader.onCompleteItem = function (item, response, status, headers) {
            if (status === 200) {
                _this.notService.success('File Upload', 'Success!');
            }
            else {
                _this.notService.error('File Upload', 'Error');
            }
        };
    };
    UploadComponent.prototype.showUpload = function () {
        this.show = 'yes';
        this.screenDimmer.dimScreen();
    };
    UploadComponent.prototype.hideUpload = function () {
        this.show = 'no';
        this.screenDimmer.undimScreen();
    };
    UploadComponent.prototype.uploadAll = function (e) {
        e.preventDefault();
        this.uploader.uploadAll();
        this.uploader.clearQueue();
    };
    UploadComponent.prototype.upload = function (item) {
        this.notService.success('File Upload', 'Starting...');
        item.upload();
    };
    UploadComponent.prototype.fileOverBase = function (e) {
        this.hasBaseDropZoneOver = e;
    };
    UploadComponent.prototype.fileOverAnother = function (e) {
        this.hasAnotherDropZoneOver = e;
    };
    UploadComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    UploadComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    UploadComponent = __decorate([
        core_1.Component({
            selector: 'upload',
            template: __webpack_require__("../../../../../src/app/shakecast-admin/upload/upload.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast-admin/upload/upload.component.css")],
            animations: [
                core_1.trigger('showUpload', [
                    core_1.state('no', core_1.style({ top: '-800px' })),
                    core_1.state('yes', core_1.style({ top: '60px' })),
                    core_1.transition('* => *', core_1.animate('100ms ease-out'))
                ])
            ]
        }),
        __metadata("design:paramtypes", [upload_service_1.UploadService,
            screen_dimmer_service_1.ScreenDimmerService,
            angular2_notifications_1.NotificationsService])
    ], UploadComponent);
    return UploadComponent;
}());
exports.UploadComponent = UploadComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast-admin/upload/upload.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var UploadService = /** @class */ (function () {
    function UploadService() {
        this.show = new ReplaySubject_1.ReplaySubject(1);
    }
    UploadService.prototype.showUpload = function () {
        this.show.next(true);
    };
    UploadService.prototype.hideUpload = function () {
        this.show.next(false);
    };
    UploadService.prototype.clearQueue = function () {
    };
    UploadService = __decorate([
        core_1.Injectable()
    ], UploadService);
    return UploadService;
}());
exports.UploadService = UploadService;


/***/ }),

/***/ "../../../../../src/app/shakecast/pages/dashboard/dashboard.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".outer-dash-container {\n    height: 100vh;\n}\n\n.map-container {\n    width: 100%;\n    height: 100%;\n    top: 0;\n    position: fixed;\n}\n\n.not-container {\n    padding: 10px;\n}\n\n.content-container {\n    text-align: center;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/dashboard/dashboard.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"map-container\">\n    <my-map class=\"map\"></my-map>\n</div>\n\n<div class=\"right-panel\" [@showRight]=\"showRight\">\n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleRight()\">\n            <span class=\"arrow-icon\" [hidden]=\"showRight=='shown'\"><i class=\"fa fa-chevron-left\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showRight=='hidden'\"><i class=\"fa fa-chevron-right\"></i></span>\n        </div>\n    </div>\n    <div class=\"panel-content\">\n            <h1 class=\"panel-title\">{{ earthquakeData.length }} Recent Earthquakes</h1>\n            \n            <div class=\"panel-scroll-container\">\n                <div class=\"inner-shadow\"></div>\n                <earthquake-list></earthquake-list>\n            </div>\n    </div>\n</div>\n\n<div class=\"left-panel\" [@showLeft]=\"showLeft\">\n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleLeft()\">\n            <span class=\"arrow-icon\" [hidden]=\"showLeft=='shown'\"><i class=\"fa fa-chevron-right\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showLeft=='hidden'\"><i class=\"fa fa-chevron-left\"></i></span>\n        </div>\n    </div>\n    <div class=\"panel-content\">\n        <h1 class=\"panel-title\">Notifications:  <info [text]=\"'A list of notifications sent to specific groups for\n                                                                this event. Double check your notification group settings \n                                                                if you should have received a notification for this event, \n                                                                but did not.'\"\n                                                                [side]=\"'left'\"></info></h1>\n\n        <div class=\"not-container\">\n            <div class=\"not-dash\">\n                <notification-dash></notification-dash>\n            </div>\n        </div>\n        <div *ngIf=\"facilityData.length > 0\">\n            <h2 class=\"panel-title\">{{ facilityData.length }} Facilities Affected</h2>\n        </div>\n        <div class=\"panel-scroll-container\">\n            <div class=\"inner-shadow\"></div>\n            <facility-list></facility-list>\n        </div>\n    </div>\n</div>\n\n<div class=\"bottom-panel\" [@showBottom]=\"showBottom\">\n    <div class=\"toggle\">\n        <div class=\"toggle-click\" (click)=\"toggleBottom()\" style=\"width:0\">\n            <span class=\"arrow-icon\" [hidden]=\"showBottom=='shown'\"><i class=\"fa fa-chevron-up\"></i></span>\n            <span class=\"arrow-icon\" [hidden]=\"showBottom=='hidden'\"><i class=\"fa fa-chevron-down\"></i></span>\n        </div>\n    </div>\n\n    <div class=\"content-container\">\n        <eq-filter class=\"eq-filter\"></eq-filter>\n    </div>\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/dashboard/dashboard.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var earthquake_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake.service.ts");
var facility_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts");
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var TimerObservable_1 = __webpack_require__("../../../../rxjs/_esm5/observable/TimerObservable.js");
var animations_1 = __webpack_require__("../../../../../src/app/shared/animations/animations.ts");
var DashboardComponent = /** @class */ (function () {
    function DashboardComponent(eqService, facService, titleService) {
        this.eqService = eqService;
        this.facService = facService;
        this.titleService = titleService;
        this.facilityData = [];
        this.earthquakeData = [];
        this.subscriptions = [];
        this.showBottom = 'shown';
        this.showLeft = 'hidden';
        this.showRight = 'shown';
    }
    DashboardComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.titleService.title.next('Dashboard');
        if (this.facService.sub) {
            this.facService.sub.unsubscribe();
        }
        this.subscriptions.push(this.facService.facilityData.subscribe(function (facs) {
            _this.facilityData = facs;
        }));
        this.subscriptions.push(TimerObservable_1.TimerObservable.create(0, 60000)
            .subscribe(function (x) {
            _this.eqService.getData(_this.eqService.filter);
        }));
        this.eqService.filter['timeframe'] = 'day';
        this.eqService.filter['shakemap'] = true;
        this.eqService.filter['scenario'] = false;
        this.eqService.getData(this.eqService.filter);
    };
    DashboardComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.subscriptions.push(this.eqService.earthquakeData.subscribe(function (eqs) {
            _this.earthquakeData = eqs;
            if (eqs.length > 0) {
                _this.eqService.plotEq(eqs[0]);
                _this.showRight = 'shown';
            }
            else {
                _this.eqService.clearData();
            }
        }));
    };
    DashboardComponent.prototype.toggleLeft = function () {
        if (this.showLeft == 'hidden') {
            this.showLeft = 'shown';
        }
        else {
            this.showLeft = 'hidden';
        }
    };
    DashboardComponent.prototype.toggleRight = function () {
        if (this.showRight == 'hidden') {
            this.showRight = 'shown';
        }
        else {
            this.showRight = 'hidden';
        }
    };
    DashboardComponent.prototype.toggleBottom = function () {
        if (this.showBottom == 'hidden') {
            this.showBottom = 'shown';
        }
        else {
            this.showBottom = 'hidden';
        }
    };
    DashboardComponent.prototype.ngOnDestroy = function () {
        this.eqService.earthquakeData.next([]);
        this.eqService.clearData();
        this.endSubscriptions();
    };
    DashboardComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    DashboardComponent = __decorate([
        core_1.Component({
            selector: 'dashboard',
            template: __webpack_require__("../../../../../src/app/shakecast/pages/dashboard/dashboard.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast/pages/dashboard/dashboard.component.css"), __webpack_require__("../../../../../src/app/shared/css/panels.css")],
            animations: [animations_1.showLeft, animations_1.showRight, animations_1.showBottom]
        }),
        __metadata("design:paramtypes", [earthquake_service_1.EarthquakeService,
            facility_service_1.FacilityService,
            title_service_1.TitleService])
    ], DashboardComponent);
    return DashboardComponent;
}());
exports.DashboardComponent = DashboardComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification-dash.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "p {\n    margin-left: 15px;\n}\n\n* {\n    color: white;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification-dash.component.html":
/***/ (function(module, exports) {

module.exports = "<div *ngIf=\"notifications.length > 0\">\n    <div *ngIf=\"newEventGroups != ''\">\n        <h3>New Event:</h3><p>{{ newEventGroups }}</p>\n    </div>\n    <div *ngIf=\"inspGroups != ''\">\n        <h3>Inspection:</h3><p>{{ inspGroups }}</p>\n    </div>\n</div>\n\n<div *ngIf=\"notifications.length == 0\">\n    \n    <h1 class=\"data-list-no-data\">No Notifications</h1>\n\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification-dash.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var notification_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification.service.ts");
var NotificationDashComponent = /** @class */ (function () {
    function NotificationDashComponent(notService) {
        this.notService = notService;
        this.notifications = [];
        this.newEventGroups = '';
        this.inspGroups = '';
        this.subscriptions = [];
    }
    NotificationDashComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.notService.notifications.subscribe(function (nots) {
            _this.notifications = nots;
            _this.inspGroups = '';
            _this.newEventGroups = '';
            for (var not in nots) {
                if (nots[not]['notification_type'] == 'NEW_EVENT') {
                    if (_this.newEventGroups === '') {
                        _this.newEventGroups += nots[not]['group_name'];
                    }
                    else {
                        _this.newEventGroups += ',' + nots[not]['group_name'];
                    }
                }
                else {
                    if (_this.inspGroups === '') {
                        _this.inspGroups += nots[not]['group_name'];
                    }
                    else {
                        _this.inspGroups += ',' + nots[not]['group_name'];
                    }
                }
            }
        }));
    };
    NotificationDashComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    NotificationDashComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    NotificationDashComponent = __decorate([
        core_1.Component({
            selector: 'notification-dash',
            template: __webpack_require__("../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification-dash.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification-dash.component.css"), __webpack_require__("../../../../../src/app/shared/css/data-list.css")]
        }),
        __metadata("design:paramtypes", [notification_service_1.NotificationService])
    ], NotificationDashComponent);
    return NotificationDashComponent;
}());
exports.NotificationDashComponent = NotificationDashComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
var operators_1 = __webpack_require__("../../../../rxjs/_esm5/operators.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/catch.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var NotificationService = /** @class */ (function () {
    function NotificationService(_http) {
        this._http = _http;
        this.notifications = new ReplaySubject_1.ReplaySubject(1);
    }
    NotificationService.prototype.getNotifications = function (eq) {
        var _this = this;
        if (eq) {
            var params = new http_1.URLSearchParams();
            this._http.get('/api/notifications/' + eq.event_id + '/')
                .pipe(operators_1.map(function (result) { return result.json(); }))
                .subscribe(function (result) {
                _this.notifications.next(result);
            });
        }
    };
    NotificationService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], NotificationService);
    return NotificationService;
}());
exports.NotificationService = NotificationService;


/***/ }),

/***/ "../../../../../src/app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".form-container {\n    padding: 5px;\n    display: inline-block;\n    min-width: 300px;\n    text-align: center;\n}\n\n.form-container input {\n    height: 20px;\n    border-radius: 5px;\n    font-weight: bold;\n    text-align: center;\n}\n\n.form-container label {\n    color: white;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"form-container\">\n    <input type=\"checkbox\" [(ngModel)]=\"eqService.filter.shakemap\">\n    <label>Events with ShakeMaps</label>\n    <div *ngIf=\"eqService.filter.shakemap\">\n        <input type=\"checkbox\" [(ngModel)]=\"eqService.filter.facilities\">\n        <label>Events with affected facilities</label>\n    </div>\n\n    <br>\n    <input type=\"radio\" \n            name=\"timeframe\" \n            [(ngModel)]=\"eqService.filter.timeframe\" \n            value=\"day\">\n    <label>Day</label>\n    <input type=\"radio\" \n            name=\"timeframe\" \n            [(ngModel)]=\"eqService.filter.timeframe\" \n            value=\"week\">\n    <label>Week</label>\n    <input type=\"radio\" \n            name=\"timeframe\" \n            [(ngModel)]=\"eqService.filter.timeframe\" \n            value=\"month\">\n    <label>Month</label>\n    <input type=\"radio\" \n            name=\"timeframe\" \n            [(ngModel)]=\"eqService.filter.timeframe\" \n            value=\"all\">\n    <label>All time</label>\n\n    <div class=\"input-container\">\n        <input [(ngModel)]=\"eqService.filter.latMin\" placeholder=\"Min Latitude\">\n        <input [(ngModel)]=\"eqService.filter.latMax\" placeholder=\"Max Latitude\">\n        <input [(ngModel)]=\"eqService.filter.lonMin\" placeholder=\"Min Longitude\">\n        <input [(ngModel)]=\"eqService.filter.lonMax\" placeholder=\"Max Longitude\">\n    </div>\n\n    <h2 class=\"button\" (click)=\"eqService.getData(eqService.filter)\">Search</h2>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var earthquake_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake.service.ts");
var EarthquakeFilter = /** @class */ (function () {
    function EarthquakeFilter(eqService) {
        this.eqService = eqService;
    }
    EarthquakeFilter = __decorate([
        core_1.Component({
            selector: 'eq-filter',
            template: __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.css")],
        }),
        __metadata("design:paramtypes", [earthquake_service_1.EarthquakeService])
    ], EarthquakeFilter);
    return EarthquakeFilter;
}());
exports.EarthquakeFilter = EarthquakeFilter;


/***/ }),

/***/ "../../../../../src/app/shakecast/pages/earthquakes/earthquake-list.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/earthquakes/earthquake-list.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"data-list-inner-container\">\n    <div class=\"data-list\">\n        <div *ngIf=\"earthquakeData.length > 0\">\n            <div class=\"data\" [@selected]=\"eq?.selected\" *ngFor=\"let eq of earthquakeData\" (click)=\"plotEq(eq)\">\n                <div class=\"data-header\" [@headerSelected]=\"eq.selected\">\n                    <h3>{{eq.event_id}}</h3>\n                </div>\n                <div class=\"data-body\">\n                    <div class=\"data-info-container\">\n                        <table>\n                            <tr>\n                                <th>Magnitude: </th><td><p>{{eq.magnitude}}</p></td>\n                            </tr>\n                            <tr>\n                                <th>Location: </th><td><p>{{eq.lat}}, {{eq.lon}}</p></td>\n                            </tr>\n                            <tr>\n                                <th>Time: </th><td>{{ eq.time * 1000 | date:'HH:mm - d/M/y' }}</td>\n                            </tr>\n                        </table>\n                        <p class=\"place\">{{eq.place}}</p>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div *ngIf=\"earthquakeData.length == 0\" class=\"data-list-no-data-container\">\n            <h1 class=\"data-list-no-data\">No Earthquake Data</h1>\n        </div>\n    </div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/earthquakes/earthquake-list.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var animations_1 = __webpack_require__("../../../animations/esm5/animations.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var earthquake_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake.service.ts");
var EarthquakeListComponent = /** @class */ (function () {
    function EarthquakeListComponent(eqService, _router) {
        this.eqService = eqService;
        this._router = _router;
        this.earthquakeData = [];
        this.pulledRight = false;
        this.dataLoading = false;
        this.moreData = false;
        this.selected = null;
        this.filter = {
            shakemap: false,
            facilities: false
        };
        this.subscriptions = [];
    }
    EarthquakeListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.eqService.earthquakeData.subscribe(function (eqs) {
            _this.earthquakeData = eqs;
            if ((eqs.length > 0) &&
                (_this._router.url != '/shakecast-admin/facilities')) {
                _this.selectEq(eqs[0]);
            }
        }));
        this.subscriptions.push(this.eqService.dataLoading.subscribe(function (loading) {
            _this.dataLoading = loading;
        }));
    };
    EarthquakeListComponent.prototype.plotEq = function (eq) {
        this.eqService.mapService.clearMap();
        this.eqService.plotEq(eq);
        this.selectEq(eq);
    };
    EarthquakeListComponent.prototype.selectEq = function (eq) {
        if (this.selected) {
            this.selected['selected'] = 'false';
        }
        eq['selected'] = 'true';
        this.selected = eq;
        this.eqService.selected = eq;
    };
    EarthquakeListComponent.prototype.ngOnDestroy = function () {
        this.earthquakeData = [];
        this.eqService.current = [];
        this.endSubscriptions();
    };
    EarthquakeListComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    EarthquakeListComponent = __decorate([
        core_1.Component({
            selector: 'earthquake-list',
            template: __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake-list.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake-list.component.css"), __webpack_require__("../../../../../src/app/shared/css/data-list.css")],
            animations: [
                animations_1.trigger('selected', [
                    animations_1.state('true', animations_1.style({ transform: 'translateY(-10px)' })),
                    animations_1.state('false', animations_1.style({ transform: 'translateY(0px)' })),
                    animations_1.transition('* => *', animations_1.animate('200ms ease-out'))
                ]),
                animations_1.trigger('headerSelected', [
                    animations_1.state('true', animations_1.style({ 'background-color': '#7af' })),
                    animations_1.state('false', animations_1.style({ 'background-color': '*' }))
                ])
            ]
        }),
        __metadata("design:paramtypes", [earthquake_service_1.EarthquakeService,
            router_1.Router])
    ], EarthquakeListComponent);
    return EarthquakeListComponent;
}());
exports.EarthquakeListComponent = EarthquakeListComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast/pages/earthquakes/earthquake.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../common/esm5/http.js");
var operators_1 = __webpack_require__("../../../../rxjs/_esm5/operators.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/catch.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var map_service_1 = __webpack_require__("../../../../../src/app/shared/maps/map.service.ts");
var notification_service_1 = __webpack_require__("../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification.service.ts");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var facility_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts");
var loading_service_1 = __webpack_require__("../../../../../src/app/loading/loading.service.ts");
var _ = __webpack_require__("../../../../underscore/underscore.js");
var EarthquakeService = /** @class */ (function () {
    function EarthquakeService(_http, notService, mapService, facService, _router, toastService, loadingService) {
        this._http = _http;
        this.notService = notService;
        this.mapService = mapService;
        this.facService = facService;
        this._router = _router;
        this.toastService = toastService;
        this.loadingService = loadingService;
        this.earthquakeData = new ReplaySubject_1.ReplaySubject(1);
        this.dataLoading = new ReplaySubject_1.ReplaySubject(1);
        this.plotting = new ReplaySubject_1.ReplaySubject(1);
        this.showScenarioSearch = new ReplaySubject_1.ReplaySubject(1);
        this.current = [];
        this.filter = {
            shakemap: true,
            facilities: false,
            timeframe: 'week'
        };
        this.configs = { clearOnPlot: 'all' };
        this.selected = null;
    }
    EarthquakeService.prototype.getData = function (filter) {
        var _this = this;
        if (filter === void 0) { filter = {}; }
        if (this.facService.sub) {
            this.facService.sub.unsubscribe();
        }
        if (this.filter) {
            this.filter = filter;
        }
        this.dataLoading.next(true);
        var httpOptions = {
            headers: new http_1.HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        httpOptions['headers'].set('filter', JSON.stringify(filter));
        this._http.get('/api/earthquake-data', httpOptions)
            .subscribe(function (result) {
            // build event_id arrays
            var current_events = [];
            var new_events = [];
            for (var event_idx in _this.current) {
                current_events.push(_this.current[event_idx]['event_id']);
            }
            for (var event_idx in result.data) {
                new_events.push(result.data[event_idx]['event_id']);
            }
            if (result.data.length > 0) {
                if ((!_.isEqual(current_events, new_events)) || (_this._router.url != '/shakecast/dashboard')) {
                    _this.current = result.data;
                    _this.earthquakeData.next(result.data);
                }
            }
            else {
                _this.current = [];
                _this.earthquakeData.next([]);
            }
            _this.dataLoading.next(false);
        }, function (err) {
            _this.toastService.alert('Event Error', 'Unable to retreive some event information');
        });
    };
    EarthquakeService.prototype.clearData = function () {
        this.mapService.clearMap();
    };
    EarthquakeService.prototype.getDataFromWeb = function (filter) {
        var _this = this;
        if (filter === void 0) { filter = {}; }
        if (this.facService.sub) {
            this.facService.sub.unsubscribe();
        }
        this.loadingService.add('Scenarios');
        var scenario = filter['scenariosOnly'];
        var usgs;
        if (scenario) {
            usgs = 'https://earthquake.usgs.gov/fdsnws/scenario/1/query';
        }
        else {
            usgs = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
        }
        //delete filter['scenariosOnly'];
        filter['format'] = 'geojson';
        // get params from filter
        if (!filter['starttime']) {
            filter['starttime'] = '2005-01-01';
        }
        if (!filter['minmagnitude']) {
            filter['minmagnitude'] = '6';
        }
        // only get events with shakemaps
        if (!scenario) {
            filter['producttype'] = 'shakemap';
        }
        else {
            filter['producttype'] = 'shakemap-scenario';
        }
        var httpOptions = {
            headers: new http_1.HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        for (var search in filter) {
            if (search != 'scenariosOnly') {
                httpOptions['headers'].set(search, filter[search]);
            }
        }
        this._http.get(usgs, httpOptions)
            .subscribe(function (result) {
            // convert from geoJSON to sc conventions
            var data = [];
            if (result.hasOwnProperty('features')) {
                data = _this.geoJsonToSc(result['features']);
            }
            else {
                data = _this.geoJsonToSc([result]);
            }
            for (var eq in data) {
                data[eq]['scenario'] = scenario;
            }
            _this.earthquakeData.next(data);
            _this.loadingService.finish('Scenarios');
        }, function (error) {
            _this.earthquakeData.next([]);
            _this.loadingService.finish('Scenarios');
        });
    };
    EarthquakeService.prototype.downloadScenario = function (scenario_id, scenario) {
        var _this = this;
        if (scenario === void 0) { scenario = false; }
        var httpOptions = {
            headers: new http_1.HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        httpOptions['headers'].set('scenario', JSON.stringify(scenario));
        this._http.get('/api/scenario-download/' + scenario_id, httpOptions)
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            _this.toastService.success('Scenario: ' + scenario_id, 'Download starting...');
        });
    };
    EarthquakeService.prototype.deleteScenario = function (scenario_id) {
        var _this = this;
        this._http.delete('/api/scenario-delete/' + scenario_id)
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            _this.toastService.success('Delete Scenario: ' + scenario_id, 'Deleting... This may take a moment');
        });
    };
    EarthquakeService.prototype.runScenario = function (scenario_id) {
        var _this = this;
        this._http.post('/api/scenario-run/' + scenario_id, {})
            .pipe(operators_1.map(function (result) { return result.json(); }))
            .subscribe(function (result) {
            _this.toastService.success('Run Scenario: ' + scenario_id, 'Running Scenario... This may take a moment');
        });
    };
    EarthquakeService.prototype.getFacilityData = function (facility) {
        var _this = this;
        this._http.get('/api/earthquake-data/facility/' + facility['shakecast_id'])
            .subscribe(function (result) {
            _this.earthquakeData.next(result.data);
            _this.current = result.data;
        });
    };
    EarthquakeService.prototype.plotEq = function (eq) {
        if (eq) {
            // get relevant notification info... this should really be up to the page...
            this.notService.getNotifications(eq);
            //this.plotting.next(eq);
            // plots the eq with the relevant config to clear all data or notification
            // this could probably be done better...
            this.mapService.plotEq(eq, this.configs['clearOnPlot']);
            // get relevant facility info and plot it
            this.facService.getShakeMapData(eq);
        }
        else {
            this.clearData();
        }
    };
    EarthquakeService.prototype.geoJsonToSc = function (geoJson) {
        /*
        Change field names from geoJson events to what we would
        Expect from the ShakeCast database
        */
        for (var eq_id in geoJson) {
            var eq = geoJson[eq_id];
            geoJson[eq_id]['shakecast_id'] = null;
            geoJson[eq_id]['event_id'] = eq['id'];
            geoJson[eq_id]['magnitude'] = eq['properties']['mag'];
            geoJson[eq_id]['lon'] = eq['geometry']['coordinates'][0];
            geoJson[eq_id]['lat'] = eq['geometry']['coordinates'][1];
            geoJson[eq_id]['depth'] = eq['geometry']['coordinates'][2];
            geoJson[eq_id]['place'] = eq['properties']['place'];
            if (eq['properties']['types'].indexOf('shakemap') > 0) {
                geoJson[eq_id]['shakemaps'] = 1;
            }
            else {
                geoJson[eq_id]['shakemaps'] = 0;
            }
        }
        return geoJson;
    };
    EarthquakeService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.HttpClient,
            notification_service_1.NotificationService,
            map_service_1.MapService,
            facility_service_1.FacilityService,
            router_1.Router,
            angular2_notifications_1.NotificationsService,
            loading_service_1.LoadingService])
    ], EarthquakeService);
    return EarthquakeService;
}());
exports.EarthquakeService = EarthquakeService;


/***/ }),

/***/ "../../../../../src/app/shakecast/pages/user-profile/user-profile.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "h1 {\n    font-size: 50px;\n    text-align: center;\n}\n\n.info {\n    width: 30%;\n    min-width: 300px;\n    margin-left: auto;\n    margin-right: auto;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    margin-top: 2%;\n    border-radius: 5px;\n    box-shadow: 1px 1px 15px 1px #55aaee;\n    -webkit-box-shadow: 1px 1px 15px 1px #55aaee;\n    -moz-box-shadow: 1px 1px 15px 1px #55aaee;\n    background: #ffffff;\n}\n\n.info input {\n    font-size: 16px;\n    padding: 5px;\n    margin: 5px;\n}\n\ninfo label {\n    font-size: 16px;\n    font-weight: bold;\n}\n\n.button {\n    left: 50%;\n    position: relative;\n    -webkit-transform: translateX(-50%) translateY(50%);\n            transform: translateX(-50%) translateY(50%);\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/user-profile/user-profile.component.html":
/***/ (function(module, exports) {

module.exports = "<div *ngIf=\"user\">\n    <h1>{{ user.username }}</h1>\n\n    <div class=\"info\">\n        <input placeholder=\"New Password\" type=\"password\" [(ngModel)]=\"user.password\">\n        <input placeholder=\"Email\" [(ngModel)]=\"user.email\">\n    </div>\n\n    <h3 class=\"button\" (click)=\"usersService.saveUsers([user])\">Save User Info</h3>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shakecast/pages/user-profile/user-profile.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var users_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/users/users.service.ts");
var UserProfileComponent = /** @class */ (function () {
    function UserProfileComponent(usersService, titleService) {
        this.usersService = usersService;
        this.titleService = titleService;
        this.user = null;
        this.subscriptions = [];
    }
    UserProfileComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.titleService.title.next('User Profile');
        this.subscriptions.push(this.usersService.userData.subscribe(function (users) {
            _this.user = users[0];
        }));
        this.usersService.getCurrentUser();
    };
    UserProfileComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    UserProfileComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    UserProfileComponent = __decorate([
        core_1.Component({
            selector: 'user-profile',
            template: __webpack_require__("../../../../../src/app/shakecast/pages/user-profile/user-profile.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shakecast/pages/user-profile/user-profile.component.css")]
        }),
        __metadata("design:paramtypes", [users_service_1.UsersService,
            title_service_1.TitleService])
    ], UserProfileComponent);
    return UserProfileComponent;
}());
exports.UserProfileComponent = UserProfileComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast/shakecast.component.html":
/***/ (function(module, exports) {

module.exports = "<div style=\"display:inline\">\n    <router-outlet></router-outlet>\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/shakecast/shakecast.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var animations_1 = __webpack_require__("../../../../../src/app/shared/animations/animations.ts");
var ShakeCastComponent = /** @class */ (function () {
    function ShakeCastComponent() {
    }
    ShakeCastComponent = __decorate([
        core_1.Component({
            selector: 'shakecast',
            template: __webpack_require__("../../../../../src/app/shakecast/shakecast.component.html"),
            animations: [animations_1.fadeAnimation]
        })
    ], ShakeCastComponent);
    return ShakeCastComponent;
}());
exports.ShakeCastComponent = ShakeCastComponent;


/***/ }),

/***/ "../../../../../src/app/shakecast/shakecast.module.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var common_1 = __webpack_require__("../../../common/esm5/common.js");
var forms_1 = __webpack_require__("../../../forms/esm5/forms.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
var shakecast_component_1 = __webpack_require__("../../../../../src/app/shakecast/shakecast.component.ts");
var shakecast_routing_1 = __webpack_require__("../../../../../src/app/shakecast/shakecast.routing.ts");
var dashboard_component_1 = __webpack_require__("../../../../../src/app/shakecast/pages/dashboard/dashboard.component.ts");
var notification_dash_component_1 = __webpack_require__("../../../../../src/app/shakecast/pages/dashboard/notification-dash/notification-dash.component.ts");
var earthquake_filter_component_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake-filter/earthquake-filter.component.ts");
var user_profile_component_1 = __webpack_require__("../../../../../src/app/shakecast/pages/user-profile/user-profile.component.ts");
var shared_module_1 = __webpack_require__("../../../../../src/app/shared/shared.module.ts");
var ShakeCastModule = /** @class */ (function () {
    function ShakeCastModule() {
    }
    ShakeCastModule = __decorate([
        core_1.NgModule({
            imports: [
                forms_1.FormsModule,
                common_1.CommonModule,
                shakecast_routing_1.routing,
                http_1.HttpModule,
                http_1.JsonpModule,
                shared_module_1.SharedModule
            ],
            declarations: [
                shakecast_component_1.ShakeCastComponent,
                dashboard_component_1.DashboardComponent,
                notification_dash_component_1.NotificationDashComponent,
                earthquake_filter_component_1.EarthquakeFilter,
                user_profile_component_1.UserProfileComponent
            ],
            providers: []
        })
    ], ShakeCastModule);
    return ShakeCastModule;
}());
exports.ShakeCastModule = ShakeCastModule;


/***/ }),

/***/ "../../../../../src/app/shakecast/shakecast.routing.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var shakecast_component_1 = __webpack_require__("../../../../../src/app/shakecast/shakecast.component.ts");
var dashboard_component_1 = __webpack_require__("../../../../../src/app/shakecast/pages/dashboard/dashboard.component.ts");
var user_profile_component_1 = __webpack_require__("../../../../../src/app/shakecast/pages/user-profile/user-profile.component.ts");
var login_guard_1 = __webpack_require__("../../../../../src/app/auth/login.guard.ts");
var appRoutes = [
    {
        path: '',
        component: shakecast_component_1.ShakeCastComponent,
        canActivate: [login_guard_1.LoginGuard],
        children: [
            {
                path: 'dashboard',
                component: dashboard_component_1.DashboardComponent
            },
            {
                path: 'user-profile',
                component: user_profile_component_1.UserProfileComponent
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];
exports.shakecastRoutes = [
    {
        path: '',
        redirectTo: '/shakecast',
        pathMatch: 'full'
    },
    {
        path: 'shakecast',
        loadChildren: 'app/shakecast/shakecast.module#ShakeCastModule'
    }
];
exports.routing = router_1.RouterModule.forChild(appRoutes);


/***/ }),

/***/ "../../../../../src/app/shared/animations/animations.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var animations_1 = __webpack_require__("../../../animations/esm5/animations.js");
// Component transition animations
exports.fadeAnimation = animations_1.trigger('routeAnimation', [
    animations_1.state('*', animations_1.style({ opacity: 1 })),
    animations_1.transition('void => *', [
        animations_1.style({ opacity: 0 }),
        animations_1.animate(500)
    ]),
    animations_1.transition('* => void', animations_1.animate(500, animations_1.style({ opacity: 0 })))
]);
exports.navAnimation = animations_1.trigger('scrollChange', [
    animations_1.state('up', animations_1.style({ top: '-60px' })),
    animations_1.state('down', animations_1.style({ top: 0 })),
    animations_1.transition('* => *', [
        animations_1.animate('250ms ease-in-out')
    ])
]);
exports.showLeft = animations_1.trigger('showLeft', [
    animations_1.state('hidden', animations_1.style({ transform: 'translateX(0%)' })),
    animations_1.state('shown', animations_1.style({ transform: 'translateX(100%)' })),
    animations_1.transition('* => *', [
        animations_1.animate('250ms ease-in-out')
    ])
]);
exports.showRight = animations_1.trigger('showRight', [
    animations_1.state('hidden', animations_1.style({ transform: 'translateX(0%)' })),
    animations_1.state('shown', animations_1.style({ transform: 'translateX(-100%)' })),
    animations_1.transition('* => *', [
        animations_1.animate('250ms ease-in-out')
    ])
]);
exports.showBottom = animations_1.trigger('showBottom', [
    animations_1.state('hidden', animations_1.style({ transform: 'translateY(0%)' })),
    animations_1.state('shown', animations_1.style({ transform: 'translateY(-100%)' })),
    animations_1.transition('* => *', [
        animations_1.animate('250ms ease-in-out')
    ])
]);


/***/ }),

/***/ "../../../../../src/app/shared/cookie.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var CookieService = /** @class */ (function () {
    function CookieService() {
    }
    CookieService.prototype.setCookie = function (cname, cvalue, exdays) {
        if (exdays === void 0) { exdays = 1; }
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    };
    CookieService.prototype.getCookie = function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };
    CookieService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], CookieService);
    return CookieService;
}());
exports.CookieService = CookieService;


/***/ }),

/***/ "../../../../../src/app/shared/css/data-list.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".data-list-outer-container {\n    height: 100%;\n    width: 100%;\n    position: relative;\n    overflow: visible;\n}\n\n.data-list-inner-container {\n    overflow: scroll;\n}\n\n.data-list {\n    height: 100%;\n    width: 100%;\n}\n\n.data {\n    margin-top: 20px;\n    background: #fff;\n    width: 20%;\n    min-width: 280px;\n    display: inline-block;\n    min-height: 200px;\n    margin-left: 5px;\n    margin-right: 5px;\n    border-width: 1px; \n    border-radius: 5px;\n    border-style: solid;\n    border-color:#aaaaaa;\n    vertical-align: top;\n    cursor: pointer;\n    -webkit-transform: translateX(0%) translateY(0%);\n            transform: translateX(0%) translateY(0%);\n    -webkit-transition: -webkit-transform .1s ease-in-out;\n    transition: -webkit-transform .1s ease-in-out;\n    transition: transform .1s ease-in-out;\n    transition: transform .1s ease-in-out, -webkit-transform .1s ease-in-out;\n    box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 5px 1px rgba(0,0,0,0.3);\n}\n\n.data.selected {\n    margin-top: 10px;\n    box-shadow: 1px 1px 5px 2px rgba(0,0,0,0.4);\n    -webkit-box-shadow: 1px 1px 5px 2px rgba(0,0,0,0.4);\n    -moz-box-shadow: 1px 1px 5px 2px rgba(0,0,0,0.4);\n}\n\n.data-list-no-data {\n    color: white;\n    text-align: center;\n    width: 100%;\n    text-align: center;\n}\n\n.data-list-no-data-container {\n    height: 100%;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n\n/* header */\n\n.data-header {\n    min-height: 40px;\n    border-radius: 4px;\n    background-color: #aaaaaa;\n    overflow-x: scroll;\n}\n\n.data:hover .data-header {\n    background-color: #cccccc\n}\n\n.data-header h3 {\n    margin-top: 0;\n    margin-bottom: 0;\n    text-align: center;\n    padding: 5px;\n}\n\n/* body */\n\n.data-info-container {\n    margin: 5px;\n    text-align: center;\n    overflow: scroll;\n}\n\n.data p {\n    white-space: normal;\n    text-align: center;\n}\n\n.data th, .data td {\n    text-align: left;\n    border-bottom: 1px solid #ddd;\n    padding: 5px;\n}\n\n.data td p {\n    padding: 0px;\n    margin: 0px;\n}\n\n.data table {\n    width: 95%;\n}\n\n.data .container-table {\n    margin-bottom: 20px;\n}\n\n.updated {\n    position: absolute;\n    bottom: 0;\n}\n\n.updated p {\n    font-size: 10px;\n    display: inline-block;\n    margin-left: 5px;\n}\n\n.data .delete {\n    float: right;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shared/css/panels.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".right-panel, .left-panel, .bottom-panel {\n    position: fixed;\n    background: rgba(50,50,50,0.6);\n    overflow: visible;\n    z-index: 2;\n}\n\n.toggle {\n    position: absolute;\n}\n\n.right-panel .toggle {\n    left: 0;\n    -webkit-transform: translateX(-100%);\n            transform: translateX(-100%)\n}\n\n.left-panel .toggle {\n    right: 0;\n    -webkit-transform: translateX(100%);\n            transform: translateX(100%)\n}\n\n.left-panel .toggle, .right-panel .toggle {\n    height: 100%;\n    width: 0;\n}\n\n.bottom-panel .toggle {\n    width: 100%;\n    height: 0;\n    top: 0;\n    -webkit-transform: translateY(-100%);\n            transform: translateY(-100%);\n    text-align: center;\n}\n\n.toggle-click {\n    position: relative;\n    cursor: pointer;\n    border-radius: 50%;\n}\n\n.left-panel .toggle-click, .right-panel .toggle-click {\n    top: 50%;\n}\n\n.right-panel .toggle-click {\n    -webkit-transform: translateY(-50%) translateX(-50%) rotate(-135deg);\n            transform: translateY(-50%) translateX(-50%) rotate(-135deg);\n    border-top: 25px solid rgba(50,50,50,.6);\n    border-right: 25px solid rgba(50,50,50,.6);\n    border-bottom: 25px solid transparent;\n    border-left: 25px solid transparent;\n}\n\n.left-panel .toggle-click {\n    -webkit-transform: translateY(-50%) translateX(-50%) rotate(45deg);\n            transform: translateY(-50%) translateX(-50%) rotate(45deg);\n    border-top: 25px solid rgba(50,50,50,.6);\n    border-right: 25px solid rgba(50,50,50,.6);\n    border-bottom: 25px solid transparent;\n    border-left: 25px solid transparent;\n}\n\n.bottom-panel .toggle-click {\n    left: 50%;\n    -webkit-transform: translateX(-50%) translateY(-50%) rotate(-45deg);\n            transform: translateX(-50%) translateY(-50%) rotate(-45deg);\n    border-top: 25px solid rgba(50,50,50,.6);\n    border-right: 25px solid rgba(50,50,50,.6);    \n    border-bottom: 25px solid transparent;\n    border-left: 25px solid transparent;\n}\n\n.right-panel .toggle-click .arrow-icon {\n    position: absolute;\n    -webkit-transform: translateY(-100%) translateX(15%)  rotate(135deg);\n            transform: translateY(-100%) translateX(15%)  rotate(135deg);\n}\n\n.left-panel .toggle-click .arrow-icon {\n    position: absolute;\n    -webkit-transform: translateY(-100%) translateX(30%) rotate(-45deg);\n            transform: translateY(-100%) translateX(30%) rotate(-45deg);\n}\n\n.bottom-panel .toggle-click .arrow-icon {\n    position: absolute;\n    -webkit-transform: translateX(107%) translateY(-100%) rotate(45deg);\n            transform: translateX(107%) translateY(-100%) rotate(45deg);\n    right: 50%;\n}\n\n.arrow-icon:before {\n    content:'';\n    height: 100%;\n    display: inline-block;\n    vertical-align: middle;\n}\n\n.arrow-icon span {\n    display:inline-block;\n    vertical-align: middle;\n}\n\n.fa {\n    color:white;\n}\n\n.toggle-click:hover {\n    border-top: 25px solid rgba(80,150,255,.7) !important;\n    border-right: 25px solid rgba(80,150,255,.7) !important;\n}\n\n.right-panel, .left-panel {\n    height: 100%;\n    width: 25%;\n    top: 0;\n}\n\n.right-panel {\n    left: 100%;\n}\n\n.left-panel {\n    left: -25%;\n}\n\n.bottom-panel {\n    top: 100%;\n    width: 50%;\n    left: 25%;\n}\n\n.panel-title {\n    text-align: center;\n    font-size: 72;\n    color: white;\n    margin: 5px;\n}\n\n.panel-scroll-container {\n    height: 90%;\n    border-radius: 5px;\n    overflow: scroll;\n}\n\n.inner-shadow {\n    position: absolute;\n    /*\n    height: 90%;\n    width: 100%;\n    */\n    top: 0;\n    bottom: 0;\n    right: 0;\n    box-shadow: inset 0px 0px 40px 0px #000;\n    -moz-box-shadow: inset 0px 0px 40px 0px #000;\n    -webkit-box-shadow: inset 0px 0px 40px 0px #000;\n    pointer-events: none;\n    border-radius: 5px;\n}\n\n.panel-content {\n    padding: 2.5%;\n    height: 100%;\n    text-align: center;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shared/directives/stick-to-top.directive.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var Observable_1 = __webpack_require__("../../../../rxjs/_esm5/Observable.js");
var stick_to_top_service_1 = __webpack_require__("../../../../../src/app/shared/directives/stick-to-top.service.ts");
var StickToTopDirective = /** @class */ (function () {
    function StickToTopDirective(el, sttService) {
        this.el = el;
        this.sttService = sttService;
        this.scrolled = document.querySelector('body').scrollTop;
        this.stuck = false;
        this.stuckTop = 0;
        this.top = 0;
        this.height = 0;
        this.init = true;
        this.didScroll = false;
        this.top = el.nativeElement.offsetTop;
    }
    StickToTopDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.checkLock();
        Observable_1.Observable.interval(10)
            .subscribe(function (x) {
            if (_this.didScroll) {
                _this.didScroll = false;
                _this.checkLock();
            }
        });
    };
    StickToTopDirective.prototype.setDidScroll = function (e) {
        this.didScroll = true;
    };
    StickToTopDirective.prototype.checkLock = function (event) {
        if (event === void 0) { event = null; }
        if (this.init) {
            this.init = false;
            this.height = this.el.nativeElement.parentElement.offsetHeight;
        }
        this.scrolled = document.querySelector('body').scrollTop;
        if (this.stuck) {
            if (this.el.nativeElement.parentElement.getBoundingClientRect().top + this.height >=
                this.sttService.stackHeight) {
                //console.log('Unstick it')
                this.stuckTop = this.top;
                this.sttService.stackHeight -= this.height;
                this.stuck = false;
            }
        }
        else if (this.sttService.stackHeight >=
            this.el.nativeElement.parentElement.getBoundingClientRect().top) {
            if (!this.stuck) {
                //console.log('Stick it')
                this.stuckTop = this.sttService.stackHeight;
                this.sttService.stackHeight += this.height;
                this.stuck = true;
            }
        }
    };
    StickToTopDirective.prototype.ngOnDestroy = function () {
        if (this.stuck) {
            this.sttService.stackHeight -= this.height;
        }
    };
    StickToTopDirective = __decorate([
        core_1.Directive({
            selector: '[stickToTop]',
            host: { '[class.stick-to-top]': 'stuck',
                '[style.top.px]': 'stuckTop',
                '(window:scroll)': 'setDidScroll($event)' }
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            stick_to_top_service_1.StickToTopService])
    ], StickToTopDirective);
    return StickToTopDirective;
}());
exports.StickToTopDirective = StickToTopDirective;


/***/ }),

/***/ "../../../../../src/app/shared/directives/stick-to-top.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var StickToTopService = /** @class */ (function () {
    function StickToTopService() {
        this.stackHeight = 0;
    }
    StickToTopService = __decorate([
        core_1.Injectable()
    ], StickToTopService);
    return StickToTopService;
}());
exports.StickToTopService = StickToTopService;


/***/ }),

/***/ "../../../../../src/app/shared/earthquake-blurb/earthquake-blurb.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "th, td {\n    text-align: left;\n    padding: 5px;\n    border-bottom: 1px solid #ddd;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shared/earthquake-blurb/earthquake-blurb.component.html":
/***/ (function(module, exports) {

module.exports = "<table class=\"table\">    \n    <tr>\n        <th>ID:</th>\n        <td>{{ eq.event_id }}</td>\n    </tr>\n    <tr> \n        <th>Magnitude:</th>\n        <td>{{ eq.magnitude }}</td>\n    </tr>\n    <tr>\n        <th>Depth:</th>\n        <td>{{ eq.depth }}</td>\n    </tr>\n    <tr>\n        <th>Latitude:</th>\n        <td>{{ eq.lat }}</td>\n    </tr>\n    <tr>\n        <th>Longitude:</th>\n        <td>{{ eq.lon }}</td>\n    </tr>\n    <tr>\n        <th>Description:</th>\n        <td>{{ eq.place }}</td>\n    </tr>\n</table>"

/***/ }),

/***/ "../../../../../src/app/shared/earthquake-blurb/earthquake-blurb.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var EarthquakeBlurbComponent = /** @class */ (function () {
    function EarthquakeBlurbComponent() {
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], EarthquakeBlurbComponent.prototype, "eq", void 0);
    EarthquakeBlurbComponent = __decorate([
        core_1.Component({
            selector: 'earthquake-blurb',
            template: __webpack_require__("../../../../../src/app/shared/earthquake-blurb/earthquake-blurb.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shared/earthquake-blurb/earthquake-blurb.component.css")]
        })
    ], EarthquakeBlurbComponent);
    return EarthquakeBlurbComponent;
}());
exports.EarthquakeBlurbComponent = EarthquakeBlurbComponent;


/***/ }),

/***/ "../../../../../src/app/shared/info/info.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".container {\n    display: inline-block;\n}\n\n.info-click {\n    cursor: pointer;\n    margin-left: 5px;\n}\n\n.fa-question-circle {\n    color: #55aaee;\n}\n\n.info-container {\n    position: absolute;\n    display: inline-block;\n    max-width: 300px;\n    min-width: 200px;\n}\n\n.info {    \n    z-index: 3;\n    display: inline-block;\n    position: absolute;\n    border: 1px solid #444444;\n    box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n    -webkit-box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n    -moz-box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n}\n\n.info p {\n    font-size: 14px;\n    font-weight: bold;\n    text-align: center;\n}\n\n.triangle-left, .triangle-right {\n    position: relative;\n    padding: 5px;\n    margin-top: 15px;\n    background: white;\n    border-radius: 10px;\n}\n\n.triangle-right {\n    -webkit-transform: translateX(-100%);\n            transform: translateX(-100%);\n}\n\n.triangle-left.top, .triangle-right.top {\n    background: white\n}\n\n.triangle-left.top:after, .triangle-right.top:after, .triangle-left.top:before, .triangle-right.top:before {\n    content: \"\";\n    position: absolute;\n    border-style: solid;\n    display: block;\n    width: 0;\n    top: -15px;\n    bottom: auto;\n}\n\n.triangle-left.top:after {\n    left: 10px;\n    border-width: 15px 0 0 10px;\n}\n\n.triangle-left.top:before {\n    left: 9px;\n    top: -17px;\n    border-width: 16px 0 0 12px;\n}\n\n.triangle-right.top:after {\n    left: 92%;\n    margin-left: 1px;\n    border-width: 15px 10px 0 0;\n}\n\n.triangle-right.top:before {\n    left: 92%;\n    top: -18px;\n    border-width: 17px 12px 0 0;\n}\n\n.triangle-left.top:after, .triangle-right.top:after {\n    border-color: transparent white;\n}\n\n.triangle-left.top:before, .triangle-right.top:before {\n    border-color: transparent #444444;\n}\n\n#close {\n    float: right;\n    margin: 0;\n    cursor: pointer;\n}\n\np {\n    font-size: .4em;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shared/info/info.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"container\">\n    <div class=\"info-click\" (click)=\"showInfo='yes'\">\n        <i class=\"fa fa-question-circle\" aria-hidden=\"true\"></i>\n    </div>\n\n    <div class=\"info-container\" *ngIf=\"showInfo=='yes'\">\n        <div class=\"info top\"\n                [class.triangle-left]=\"side=='left'\"\n                [class.triangle-right]=\"side=='right'\">\n            <i class=\"fa fa-times\" id=\"close\" aria-hidden=\"true\" (click)=\"showInfo='no'\"></i>\n            <p [innerHtml]=\"text\"></p>\n        </div>\n    </div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shared/info/info.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var InfoComponent = /** @class */ (function () {
    function InfoComponent() {
        this.showInfo = 'no';
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], InfoComponent.prototype, "text", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], InfoComponent.prototype, "side", void 0);
    InfoComponent = __decorate([
        core_1.Component({
            selector: 'info',
            template: __webpack_require__("../../../../../src/app/shared/info/info.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shared/info/info.component.css")]
        })
    ], InfoComponent);
    return InfoComponent;
}());
exports.InfoComponent = InfoComponent;


/***/ }),

/***/ "../../../../../src/app/shared/maps/map.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "#map {\n  height: 100%;\n}\n\n#shaking {    \n    position: fixed;\n    bottom: 50px;\n    z-index: 1000;\n    width: 100%;\n}\n\n.shaking-table {\n  width: 90%;\n  margin-left: 5%;\n  position: relative;\n  z-index: 1000;\n}\n\n.shaking-table th {\n  color: white;\n  padding-left: 5px;\n  padding-right: 5px;\n  border-radius: 5px;\n  opacity: .5;\n  box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n  -webkit-box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n  -moz-box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.3);\n}\n\n.shaking-table:hover th {\n  opacity: 1;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shared/maps/map.component.html":
/***/ (function(module, exports) {

module.exports = "<div id=\"map\"></div>\n<div id=\"shaking\" *ngIf=\"totalShaking > 0\">\n    <table class=\"shaking-table\">\n        <tr>\n            <th style=\"background-color:red\" [style.width]=\"((shakingData?.red/totalShaking * 90) + 1) + '%'\">\n                {{ shakingData?.red }}\n            </th>\n            <th style=\"background-color:orange\" [style.width]=\"((shakingData?.orange/totalShaking * 90) + 1) + '%'\">\n                {{ shakingData?.orange }}\n            </th>\n            <th style=\"background-color:gold\" [style.width]=\"((shakingData?.yellow/totalShaking * 90) + 1) + '%'\"> \n                {{ shakingData?.yellow }}\n            </th>\n            <th style=\"background-color:green;\" [style.width]=\"((shakingData?.green/totalShaking * 90) + 1) + '%'\">\n                {{ shakingData?.green }}\n            </th>\n            <th style=\"background-color:gray;\" [style.width]=\"((shakingData?.gray/totalShaking * 90) + 1) + '%'\">\n                {{ shakingData?.gray }}\n            </th>\n        </tr>\n    </table>\n</div>"

/***/ }),

/***/ "../../../../../src/app/shared/maps/map.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var router_1 = __webpack_require__("../../../router/esm5/router.js");
var shakemap_service_1 = __webpack_require__("../../../../../src/app/shared/maps/shakemap.service.ts");
var map_service_1 = __webpack_require__("../../../../../src/app/shared/maps/map.service.ts");
var facility_service_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility.service.ts");
var loading_service_1 = __webpack_require__("../../../../../src/app/loading/loading.service.ts");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var L = __webpack_require__("../../../../leaflet/dist/leaflet-src.js");
var _ = __webpack_require__("../../../../underscore/underscore.js");
//L.MakiMarkers.accessToken = //'pk.eyJ1IjoiZHNsb3NreSIsImEiOiJjaXR1aHJnY3EwMDFoMnRxZWVtcm9laWJmIn0.1C3GE0kHPGOpbVV9kTxBlQ'
var MapComponent = /** @class */ (function () {
    function MapComponent(mapService, smService, facService, notService, _router, loadingService, changeDetector) {
        this.mapService = mapService;
        this.smService = smService;
        this.facService = facService;
        this.notService = notService;
        this._router = _router;
        this.loadingService = loadingService;
        this.changeDetector = changeDetector;
        this.markers = {};
        this.overlays = [];
        this.eventMarkers = [];
        this.facilityMarkers = {};
        this.center = {};
        this.mapKey = null;
        this.markerLayer = L.featureGroup();
        this.eventMarker = L.marker();
        this.eventLayer = L.featureGroup();
        this.overlayLayer = L.layerGroup();
        /*
        private facilityCluster: any = L.markerClusterGroup({
                                        iconCreateFunction: this.createFacCluster
                                        });
                                        */
        this.facilityCluster = L.featureGroup();
        this.facilityLayer = L.featureGroup();
        this.facMarker = L.marker();
        this.groupLayers = L.featureGroup();
        this.subscriptions = [];
        this.epicIcon = L.icon({ iconUrl: 'assets/epicenter.png',
            iconSize: [45, 45],
            shadowSize: [50, 64],
            popupAnchor: [1, -25] // point from which the popup should open relative to the iconAnchor
        });
        this.shakingData = null;
        this.totalShaking = 0;
        //public greyIcon: any = L.MakiMarkers.icon({color: "#808080", size: "m"});
        //public greenIcon: any = L.MakiMarkers.icon({color: "#008000", size: "m"});
        //public yellowIcon: any = L.MakiMarkers.icon({color: "#FFD700", size: "m"});
        //public orangeIcon: any = L.MakiMarkers.icon({color: "#FFA500", size: "m"});
        //public redIcon: any = L.MakiMarkers.icon({color: "#FF0000", size: "m"});
        this.impactIcons = {
            gray: L.icon({ color: "#808080", size: "m" }),
            green: L.icon({ color: "#008000", size: "m" }),
            yellow: L.icon({ color: "#FFD700", size: "m" }),
            orange: L.icon({ color: "#FFA500", size: "m" }),
            red: L.icon({ color: "#FF0000", size: "m" })
        };
    }
    MapComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.mapService.getMapKey().subscribe(function (key) {
            _this.mapKey = key;
            _this.initMap();
        }));
    };
    MapComponent.prototype.initMap = function () {
        var _this = this;
        var this_ = this;
        this.map = L.map('map', {
            scrollWheelZoom: false
        }).setView([51.505, -0.09], 8);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + this.mapKey, {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery � <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(this.map);
        // eslint-disable-next-line  
        delete L.Icon.Default.prototype._getIconUrl;
        // eslint-disable-next-line  
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: __webpack_require__("../../../../leaflet/dist/images/marker-icon-2x.png"),
            iconUrl: __webpack_require__("../../../../leaflet/dist/images/marker-icon.png"),
            shadowUrl: __webpack_require__("../../../../leaflet/dist/images/marker-shadow.png")
        });
        var layers = {
            'Facility': this.facilityLayer,
            'Event': this.eventLayer
        };
        L.control.layers(null, layers).addTo(this.map);
        // subscribe to earthquake markers
        this.subscriptions.push(this.mapService.eqMarkers.subscribe(function (eqData) {
            if (eqData) {
                if (eqData['clear']) {
                    if (eqData['clear'] == 'all') {
                        // clear all layers
                        _this.clearLayers();
                    }
                    else if (eqData['clear'] == 'events') {
                        _this.clearEventLayers();
                    }
                }
                for (var mark in eqData['events']) {
                    _this.plotEventMarker(eqData['events'][mark]);
                }
            }
        }));
        // subscribe to center
        this.subscriptions.push(this.mapService.center.subscribe(function (center) {
            _this.center = center;
            if (center['type'] === 'facility') {
                _this.map.setView([center['lat'], center['lon']]);
            }
            else {
                _this.map.setView([center['lat'] + .5, center['lon']], 8);
            }
        }));
        // subscribe to facility markers
        this.subscriptions.push(this.mapService.facMarkers.subscribe(function (markers) {
            _this.loadingService.add('Facility Markers');
            var silent = (markers.length > 1);
            for (var mark in markers) {
                _this.plotFacMarker(markers[mark], silent);
            }
            if (silent === false) {
                _this.map.setView([markers[0]['lat'] + .5, markers[0]['lon']]);
            }
            _this.loadingService.finish('Facility Markers');
        }));
        // subscribe to REMOVING facility markers
        this.subscriptions.push(this.mapService.removeFacMarkers.subscribe(function (fac) {
            _this.removeFacMarker(fac);
        }));
        // subscribe to group poly
        this.subscriptions.push(this.mapService.groupPoly.subscribe(function (groupPoly) {
            _this.plotGroup(groupPoly);
        }));
        // subscribe to clearing the map
        this.subscriptions.push(this.mapService.clearMapNotify.subscribe(function (notification) {
            _this.clearLayers();
            // stop fetching facilities if this is still working...
            // if (this.facService.sub) {
            //     this.facService.sub.unsubscribe();
            // }
        }));
        // subscribe to facility data to create a total shaking div
        this.subscriptions.push(this.facService.shakingData.subscribe(function (shaking) {
            _this.shakingData = shaking;
            if (shaking) {
                _this.totalShaking = shaking['gray'] +
                    shaking['green'] +
                    shaking['yellow'] +
                    shaking['orange'] +
                    shaking['red'];
            }
            else {
                _this.totalShaking = 0;
            }
        }));
    };
    //////////////////////////////////////////////////////////////
    //////////////////// Earthquake Functions ////////////////////
    MapComponent.prototype.plotEventMarker = function (event) {
        // create event marker and plot it
        this.eventMarker = this.createEventMarker(event);
        this.eventMarker.addTo(this.eventLayer);
        this.eventLayer.addTo(this.map);
        this.eventMarker.bindPopup(this.eventMarker.popupContent).openPopup();
        this.eventMarkers.push(this.eventMarker);
        // plot shakemap if available
        this.plotShakemap(event);
    };
    MapComponent.prototype.createEventMarker = function (event) {
        var marker = L.marker([event.lat, event.lon], { icon: this.epicIcon });
        marker['popupContent'] = "<table class=\"my-table\">    \n                                <tr>\n                                    <th>ID:</th>\n                                    <td>" + event.event_id + "</td>\n                                </tr>\n                                <tr> \n                                    <th>Magnitude:</th>\n                                    <td>" + event.magnitude + "</td>\n                                </tr>\n                                <tr>\n                                    <th>Depth:</th>\n                                    <td>" + event.depth + "</td>\n                                </tr>\n                                <tr>\n                                    <th>Latitude:</th>\n                                    <td>" + event.lat + "</td>\n                                </tr>\n                                <tr>\n                                    <th>Longitude:</th>\n                                    <td>" + event.lon + "</td>\n                                </tr>\n                                <tr>\n                                    <th>Description:</th>\n                                    <td>" + event.place + "</td>\n                                </tr>\n                            </table>";
        return marker;
    };
    MapComponent.prototype.plotLastEvent = function () {
        if (this.eventMarkers.length > 0) {
            var marker = this.eventMarkers[this.eventMarkers.length - 1];
            this.map.setView(marker.getLatLng());
            marker.openPopup();
        }
    };
    MapComponent.prototype.plotShakemap = function (event) {
        var _this = this;
        this.smService.shakemapCheck(event).subscribe(function (result) {
            if (result.length > 0) {
                _this.loadingService.add('ShakeMap');
                _this.changeDetector.detectChanges();
                // plot shakemaps
                var sm = result[0];
                var imageUrl = 'api/shakemaps/' + sm.shakemap_id + '/overlay';
                var imageBounds = [[sm.lat_min, sm.lon_min], [sm.lat_max, sm.lon_max]];
                try {
                    if (_this.eventLayer.hasLayer(_this.overlayLayer)) {
                        _this.eventLayer.removeLayer(_this.overlayLayer);
                    }
                    _this.overlayLayer = L.imageOverlay(imageUrl, imageBounds, { opacity: .6 });
                    _this.overlayLayer.addTo(_this.eventLayer);
                    if (_this.map.hasLayer(_this.eventLayer)) {
                        _this.eventLayer.addTo(_this.map);
                        _this.map.fitBounds(_this.eventLayer.getBounds());
                    }
                }
                catch (e) {
                    _this.notService.alert('Shakemap Error', 'Unable to retreive shakemap');
                }
                _this.loadingService.finish('ShakeMap');
                _this.changeDetector.detectChanges();
            }
        });
    };
    //////////////////////////////////////////////////////////////
    ///////////////////// Facility Functions /////////////////////
    MapComponent.prototype.plotFacMarker = function (fac, silent) {
        if (silent === void 0) { silent = false; }
        // create event marker and plot it
        var marker = this.createFacMarker(fac);
        var existingMarker = this.facilityMarkers[fac.shakecast_id.toString()];
        // Check if the marker already exists
        if (_.isEqual(this.facMarker, marker)) {
            //this.facMarker.openPopup();
        }
        else if (existingMarker) {
            if (this.facilityLayer.hasLayer(this.facMarker)) {
                this.facilityLayer.removeLayer(this.facMarker);
                this.facilityCluster.addLayer(this.facMarker);
                this.facilityCluster.addTo(this.facilityLayer);
                this.facilityLayer.addTo(this.map);
            }
            this.facMarker = existingMarker;
            this.facilityCluster.removeLayer(this.facMarker);
            this.facMarker.addTo(this.facilityLayer);
            this.facilityLayer.addTo(this.map);
            marker.bindPopup(marker.popupContent);
            //marker.openPopup();
        }
        else {
            if (this.facilityLayer.hasLayer(this.facMarker)) {
                this.facilityLayer.removeLayer(this.facMarker);
                this.facilityCluster.addLayer(this.facMarker);
                this.facilityCluster.addTo(this.facilityLayer);
                this.facilityLayer.addTo(this.map);
            }
            this.facMarker = marker;
            this.facilityMarkers[fac.shakecast_id.toString()] = marker;
            this.facMarker.addTo(this.facilityLayer);
            this.facilityLayer.addTo(this.map);
            marker.bindPopup(marker.popupContent);
            //marker.openPopup();
        }
        if (silent === false) {
            this.facMarker.openPopup();
        }
    };
    MapComponent.prototype.createFacMarker = function (fac) {
        var alert = 'grey';
        if ((fac['shaking']) && (fac['shaking']['alert_level'] !== 'gray')) {
            alert = fac['shaking']['alert_level'];
        }
        //var marker = L.marker([fac.lat, fac.lon], {icon: this.impactIcons[alert]});
        var marker = L.marker([fac.lat, fac.lon]);
        var desc = '';
        if (fac.html) {
            marker['popupContent'] = fac.html;
        }
        else {
            if (fac.description) {
                desc = fac.description;
            }
            else {
                desc = 'No Description';
            }
            var colorTable = "\n            <table class=\"colors-table\" style=\"width:100%;text-align:center\">\n                <tr>\n                    <th>Fragility</th>\n                </tr>\n                <tr>\n                    <td>\n                    <table style=\"width:100%\">\n                        <tr>\n                    ";
            if (fac['green'] > 0) {
                colorTable += "<th style=\"background-color:green;padding:2px;color:white\">\n                            " + fac['metric'] + ': ' + fac['green'] + " \n                        </th>";
            }
            if (fac['yellow'] > 0) {
                colorTable += "<th style=\"background-color:gold;padding:2px;color:white\">\n                            " + fac['metric'] + ': ' + fac['yellow'] + " \n                        </th>";
            }
            if (fac['orange'] > 0) {
                colorTable += "<th style=\"background-color:orange;padding:2px;color:white\">\n                            " + fac['metric'] + ': ' + fac['orange'] + " \n                        </th>";
            }
            if (fac['red'] > 0) {
                colorTable += "<th style=\"background-color:red;padding:2px;color:white\">\n                            " + fac['metric'] + ': ' + fac['red'] + " \n                        </th>";
            }
            colorTable += "</td>\n                        </tr>\n                    </table>\n                </tr>\n            </table>";
            marker['popupContent'] = "<table style=\"text-align:center;\">\n                                        <tr>\n                                            <th>" + fac.name + " </th>\n                                        </tr>\n                                        <tr>\n                                            <td style=\"font-style:italic;\">" +
                desc + "\n                                            </td>\n                                        </tr>\n                                        <tr>\n                                            <table class=\"fragility-table\">\n                                                <tr>\n                                                    " + colorTable + "\n                                                </tr>\n                                            </table>\n                                        </tr>\n                                    </table>";
        }
        if (fac['shaking']) {
            var shakingColor = fac['shaking']['alert_level'];
            if (shakingColor == 'yellow') {
                shakingColor = 'gold';
            }
            marker['popupContent'] += "<table style=\"border-top:2px solid #444444;width:100%;\">\n                                            <tr>\n                                                <table style=\"width:90%;margin-left:5%;border-bottom:2px solid #dedede;padding-bottom:0\">\n                                                    <tr>\n                                                        <th style=\"text-align:center\">Alert Level</th>\n                                                    </tr>\n                                                </table>\n                                            </tr>\n                                            <tr>\n                                                <table style=\"width:100%;text-align:center;\">\n                                                    <tr style=\"background:" + shakingColor + "\">\n                                                        <th style=\"text-align:center;color:white\">" + fac['shaking']['metric'] + ": " + fac['shaking'][fac['shaking']['metric'].toLowerCase()] + "</th>\n                                                    </tr>\n                                                </table>\n                                            </tr>\n                                        </table>";
        }
        marker['facility'] = fac;
        return marker;
    };
    MapComponent.prototype.removeFacMarker = function (fac) {
        var marker = this.facilityMarkers[fac.shakecast_id.toString()];
        if (this.facilityLayer.hasLayer(marker)) {
            this.facilityLayer.removeLayer(marker);
        }
        else if (this.facilityCluster.hasLayer(marker)) {
            this.facilityCluster.removeLayer(marker);
        }
        delete this.facilityMarkers[fac.shakecast_id.toString()];
        if (this._router.url == '/shakecast/dashboard') {
            if (Object.keys(this.facilityMarkers).length == 0) {
                this.plotLastEvent();
            }
        }
    };
    MapComponent.prototype.plotGroup = function (group) {
        var groupLayer = new L.GeoJSON(group);
        var popupStr = '';
        popupStr += "\n            <table \"colors-table\" style=\"\">\n                <tr>\n                    <th><h1 style=\"text-align:center\"> " + group['name'] + "</h1></th>\n                </tr>\n                <tr>\n                    <th>\n                        <h3 style=\"margin:0;border-bottom:2px #444444 solid\">Facilities: </h3>\n                    </th>\n                </tr>\n                <tr>\n                    <td>\n                        <table>";
        for (var fac_type in group['info']['facilities']) {
            if (group['info']['facilities'].hasOwnProperty(fac_type)) {
                popupStr += "\n                                <tr>\n                                    <th>" + fac_type + ": </th>\n                                    <td>" + group['info']['facilities'][fac_type] + "</td>\n                                </tr>";
            }
        }
        popupStr += "</table>\n                    </td>\n                </tr>\n                <tr>\n                    <th><h3 style=\"margin:0;border-bottom:2px #444444 solid\">Notification Preferences: </h3></th>\n                </tr>\n            ";
        if (group['info']['new_event'] > 0) {
            popupStr += "\n                <tr>\n                    <td>\n                        <table>\n                            <th>New Events with Minimum Magnitude: </th>\n                            <td>" + group['info']['new_event'] + "</td>\n                        </table>\n                    </td>\n                </tr>\n            ";
        }
        if (group['info']['inspection'].length > 0) {
            popupStr += "\n                <tr>\n                    <th style=\"text-align:center\">Facility Alert Levels</th>\n                </tr>\n                <tr>\n                    <td>\n                        <table style=\"width:100%;text-align:center\">\n            ";
            for (var i in group['info']['inspection']) {
                var color = group['info']['inspection'][i];
                if (color == 'yellow') {
                    color = 'gold';
                }
                popupStr += '<th style="color:white;padding:3px;border-radius:5px;background:' +
                    color +
                    '">' + group['info']['inspection'][i] + '</th>';
            }
            popupStr += '</tr></td></table>';
        }
        if (group['info']['scenario'].length > 0) {
            popupStr += "\n                <tr>\n                    <th style=\"text-align:center\">Scenario Alert Levels</th>\n                </tr>\n                <tr>\n                    <td>\n                        <table style=\"width:100%;text-align:center\">\n            ";
            for (var i in group['info']['scenario']) {
                var color = group['info']['scenario'][i];
                if (color == 'yellow') {
                    color = 'gold';
                }
                popupStr += '<th style="color:white;padding:3px;border-radius:5px;background:' +
                    color +
                    '">' + group['info']['scenario'][i] + '</th>';
            }
            popupStr += '</tr></td></table>';
        }
        popupStr += "<tr>\n                        <table>\n                            <th>Template: </th>\n                            <td>" + group['info']['template'] + "</td>\n                        </table>\n                    </tr>\n                </table>";
        groupLayer.bindPopup(popupStr);
        this.groupLayers.addLayer(groupLayer);
        this.map.addLayer(this.groupLayers);
        this.map.fitBounds(this.groupLayers.getBounds());
        groupLayer.openPopup();
    };
    MapComponent.prototype.clearEventLayers = function () {
        if (this.eventLayer.hasLayer(this.eventMarker)) {
            this.eventLayer.removeLayer(this.eventMarker);
        }
        if (this.eventLayer.hasLayer(this.overlayLayer)) {
            this.eventLayer.removeLayer(this.overlayLayer);
            this.overlayLayer = L.imageOverlay();
        }
    };
    MapComponent.prototype.clearLayers = function () {
        /*
        Clear all layers besides basemaps
        */
        this.clearEventLayers();
        if (this.map.hasLayer(this.markerLayer)) {
            this.map.removeLayer(this.markerLayer);
            this.markerLayer = L.featureGroup();
        }
        if (this.facilityLayer.hasLayer(this.facilityCluster)) {
            this.facilityLayer.removeLayer(this.facilityCluster);
            /*
            this.facilityCluster = L.markerClusterGroup({
                                        iconCreateFunction: this.createFacCluster
                                    });

                                    */
            this.facilityCluster = L.featureGroup();
        }
        if (this.facilityLayer.hasLayer(this.facMarker)) {
            this.facilityLayer.removeLayer(this.facMarker);
            this.facMarker = L.marker();
        }
        if (this.map.hasLayer(this.groupLayers)) {
            this.map.removeLayer(this.groupLayers);
            this.groupLayers = L.featureGroup();
        }
        this.eventMarkers = [];
        this.facilityMarkers = [];
        this.totalShaking = 0;
    };
    MapComponent.prototype.createFacCluster = function (cluster) {
        var childCount = cluster.getChildCount();
        var facs = cluster.getAllChildMarkers();
        var c = ' marker-cluster-';
        if (childCount < 10) {
            c += 'small';
        }
        else if (childCount < 100) {
            c += 'medium';
        }
        else {
            c += 'large';
        }
        var color_c = '';
        if (facs[0]['facility']['shaking']) {
            var shaking = 'gray';
            for (var fac_id in facs) {
                if ((!_.contains(['green', 'yellow', 'orange', 'red'], shaking)) &&
                    (_.contains(['green', 'yellow', 'orange', 'red'], facs[fac_id]['facility']['shaking']['alert_level']))) {
                    shaking = facs[fac_id]['facility']['shaking']['alert_level'];
                }
                else if ((!_.contains(['yellow', 'orange', 'red'], shaking)) &&
                    (_.contains(['yellow', 'orange', 'red'], facs[fac_id]['facility']['shaking']['alert_level']))) {
                    shaking = facs[fac_id]['facility']['shaking']['alert_level'];
                }
                else if ((!_.contains(['orange', 'red'], shaking)) &&
                    (_.contains(['orange', 'red'], facs[fac_id]['facility']['shaking']['alert_level']))) {
                    shaking = facs[fac_id]['facility']['shaking']['alert_level'];
                }
                else if ((!_.contains(['red'], shaking)) &&
                    (_.contains(['red'], facs[fac_id]['facility']['shaking']['alert_level']))) {
                    shaking = facs[fac_id]['facility']['shaking']['alert_level'];
                }
            }
            color_c = 'marker-cluster-' + shaking;
        }
        else {
            color_c = 'marker-cluster-green';
        }
        return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c + ' ' + color_c, iconSize: new L.Point(40, 40) });
    };
    MapComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    MapComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    MapComponent = __decorate([
        core_1.Component({
            selector: 'my-map',
            template: __webpack_require__("../../../../../src/app/shared/maps/map.component.html"),
            styles: [__webpack_require__("../../../../../src/app/shared/maps/map.component.css")]
        }),
        __metadata("design:paramtypes", [map_service_1.MapService,
            shakemap_service_1.ShakemapService,
            facility_service_1.FacilityService,
            angular2_notifications_1.NotificationsService,
            router_1.Router,
            loading_service_1.LoadingService,
            core_1.ChangeDetectorRef])
    ], MapComponent);
    return MapComponent;
}());
exports.MapComponent = MapComponent;


/***/ }),

/***/ "../../../../../src/app/shared/maps/map.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
var operators_1 = __webpack_require__("../../../../rxjs/_esm5/operators.js");
var MapService = /** @class */ (function () {
    function MapService(_http) {
        this._http = _http;
        this.eqMarkers = new ReplaySubject_1.ReplaySubject(1);
        this.facMarkers = new ReplaySubject_1.ReplaySubject(1);
        this.groupPoly = new ReplaySubject_1.ReplaySubject(1);
        this.removeFacMarkers = new ReplaySubject_1.ReplaySubject(1);
        this.clearMapNotify = new ReplaySubject_1.ReplaySubject(1);
        this.center = new ReplaySubject_1.ReplaySubject(1);
    }
    MapService.prototype.plotEq = function (eq, clear) {
        if (clear === void 0) { clear = null; }
        var eqMarker = this.makeMarker(eq);
        eqMarker['type'] = 'earthquake';
        eqMarker['zoom'] = 8;
        eqMarker['draggable'] = false;
        this.eqMarkers.next({ events: [eqMarker], clear: clear });
        this.center.next(eqMarker);
    };
    MapService.prototype.plotFac = function (fac, clear) {
        if (clear === void 0) { clear = false; }
        var marker = this.makeMarker(fac);
        marker['type'] = 'facility';
        marker['zoom'] = 8;
        marker['draggable'] = false;
        // adjust for facilities having only max/min lat/lon
        marker.lat = (marker['lat_min'] + marker['lat_max']) / 2;
        marker.lon = (marker['lon_min'] + marker['lon_max']) / 2;
        this.facMarkers.next([marker]);
        this.center.next(marker);
    };
    MapService.prototype.plotFacs = function (facs, clear) {
        if (clear === void 0) { clear = true; }
        var markers = Array(facs.length);
        for (var fac_id in facs) {
            var fac = facs[fac_id];
            var marker = this.makeMarker(fac);
            marker['type'] = 'facility';
            marker['zoom'] = 8;
            marker['draggable'] = false;
            // adjust for facilities having only max/min lat/lon
            marker.lat = (marker['lat_min'] + marker['lat_max']) / 2;
            marker.lon = (marker['lon_min'] + marker['lon_max']) / 2;
            markers[fac_id] = marker;
        }
        this.facMarkers.next(markers);
    };
    MapService.prototype.printFacSummary = function (summary) {
    };
    MapService.prototype.plotGroup = function (group, clear) {
        if (clear === void 0) { clear = false; }
        var groupPoly = this.makePoly(group);
        this.groupPoly.next(groupPoly);
    };
    MapService.prototype.plotUser = function (user, clear) {
        if (clear === void 0) { clear = false; }
    };
    MapService.prototype.setCenter = function (marker) {
        this.center.next(marker);
    };
    MapService.prototype.removeFac = function (fac) {
        this.removeFacMarkers.next(fac);
    };
    MapService.prototype.clearMarkers = function () {
        this.eqMarkers.next([]);
    };
    MapService.prototype.makeMarker = function (notMarker) {
        var marker = {
            type: '',
            lat: 0,
            lon: 0,
            draggable: false
        };
        for (var prop in notMarker) {
            marker[prop] = notMarker[prop];
        }
        return marker;
    };
    MapService.prototype.makePoly = function (notPoly) {
        var poly = {
            type: '',
            properties: {},
            geometry: {}
        };
        poly.type = 'Feature';
        poly['name'] = notPoly.name;
        poly['info'] = notPoly.info;
        poly['popupContent'] = notPoly.name;
        poly.geometry['type'] = 'Polygon';
        poly.geometry['coordinates'] = [[[notPoly.lon_min, notPoly.lat_min],
                [notPoly.lon_max, notPoly.lat_min],
                [notPoly.lon_max, notPoly.lat_max],
                [notPoly.lon_min, notPoly.lat_max]]];
        return poly;
    };
    MapService.prototype.clearMap = function () {
        this.clearMapNotify.next(true);
    };
    MapService.prototype.getMapKey = function () {
        return this._http.get('/api/map-key')
            .pipe(operators_1.map(function (result) { return result.json(); }));
    };
    MapService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], MapService);
    return MapService;
}());
exports.MapService = MapService;


/***/ }),

/***/ "../../../../../src/app/shared/maps/shakemap.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/map.js");
var ShakemapService = /** @class */ (function () {
    function ShakemapService(_http) {
        this._http = _http;
    }
    ShakemapService.prototype.shakemapCheck = function (eq) {
        return this._http.get('/api/shakemaps/' + eq.event_id)
            .map(function (result) { return result.json(); });
    };
    ShakemapService.prototype.getFacilities = function (sm) {
        return this._http.get('/api/shakemaps/' + sm.shakemap_id + '/facilities')
            .map(function (result) { return result.json(); });
    };
    ShakemapService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], ShakemapService);
    return ShakemapService;
}());
exports.ShakemapService = ShakemapService;


/***/ }),

/***/ "../../../../../src/app/shared/messages.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var http_1 = __webpack_require__("../../../http/esm5/http.js");
__webpack_require__("../../../../rxjs/_esm5/add/operator/map.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var angular2_notifications_1 = __webpack_require__("../../../../angular2-notifications/angular2-notifications.umd.js");
var MessagesService = /** @class */ (function () {
    function MessagesService(_http, notService) {
        this._http = _http;
        this.notService = notService;
        this.messages = new ReplaySubject_1.ReplaySubject(1);
    }
    MessagesService.prototype.getMessages = function () {
        var _this = this;
        this._http.get('/api/messages')
            .map(function (result) { return result.json(); })
            .subscribe(function (result) {
            _this.messages.next(result);
        });
    };
    MessagesService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http,
            angular2_notifications_1.NotificationsService])
    ], MessagesService);
    return MessagesService;
}());
exports.MessagesService = MessagesService;


/***/ }),

/***/ "../../../../../src/app/shared/screen-dimmer/screen-dimmer.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".screen-dimmer {\n    width: 100%;\n    height: 100%;\n    opacity: 0;\n    position: fixed;\n    top: 0;\n    z-index: -1;\n    background: #222222;\n    -webkit-transition: opacity .5s ease-in-out;\n    transition: opacity .5s ease-in-out;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/shared/screen-dimmer/screen-dimmer.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var animations_1 = __webpack_require__("../../../animations/esm5/animations.js");
var screen_dimmer_service_1 = __webpack_require__("../../../../../src/app/shared/screen-dimmer/screen-dimmer.service.ts");
var ScreenDimmerComponent = /** @class */ (function () {
    function ScreenDimmerComponent(sdService) {
        this.sdService = sdService;
        this.subscriptions = [];
        this.dimmerOn = 'no';
    }
    ScreenDimmerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.sdService.dim.subscribe(function (dim) {
            if (dim === true) {
                _this.dimmerOn = 'yes';
            }
            else {
                _this.dimmerOn = 'no';
            }
        }));
    };
    ScreenDimmerComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    ScreenDimmerComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    ScreenDimmerComponent = __decorate([
        core_1.Component({
            selector: 'screen-dimmer',
            template: '<div class="screen-dimmer" [@dimmerOn]="dimmerOn"></div>',
            styles: [__webpack_require__("../../../../../src/app/shared/screen-dimmer/screen-dimmer.component.css")],
            animations: [
                animations_1.trigger('dimmerOn', [
                    animations_1.state('no', animations_1.style({ opacity: 0, zIndex: -1 })),
                    animations_1.state('yes', animations_1.style({ opacity: .6, zIndex: 999 })),
                    animations_1.transition('* => *', animations_1.animate('100ms ease-out'))
                ])
            ]
        }),
        __metadata("design:paramtypes", [screen_dimmer_service_1.ScreenDimmerService])
    ], ScreenDimmerComponent);
    return ScreenDimmerComponent;
}());
exports.ScreenDimmerComponent = ScreenDimmerComponent;


/***/ }),

/***/ "../../../../../src/app/shared/screen-dimmer/screen-dimmer.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var ScreenDimmerService = /** @class */ (function () {
    function ScreenDimmerService() {
        this.dim = new ReplaySubject_1.ReplaySubject(1);
    }
    ScreenDimmerService.prototype.dimScreen = function () {
        this.dim.next(true);
    };
    ScreenDimmerService.prototype.undimScreen = function () {
        this.dim.next(false);
    };
    ScreenDimmerService = __decorate([
        core_1.Injectable()
    ], ScreenDimmerService);
    return ScreenDimmerService;
}());
exports.ScreenDimmerService = ScreenDimmerService;


/***/ }),

/***/ "../../../../../src/app/shared/shared.module.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var common_1 = __webpack_require__("../../../common/esm5/common.js");
var forms_1 = __webpack_require__("../../../forms/esm5/forms.js");
// Map service and component
var map_component_1 = __webpack_require__("../../../../../src/app/shared/maps/map.component.ts");
// Facility List
var facility_list_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility-list.component.ts");
var facility_info_component_1 = __webpack_require__("../../../../../src/app/shakecast-admin/pages/facilities/facility-info/facility-info.component.ts");
// Earthquake List
var earthquake_list_component_1 = __webpack_require__("../../../../../src/app/shakecast/pages/earthquakes/earthquake-list.component.ts");
// Earthquake Blurb
var earthquake_blurb_component_1 = __webpack_require__("../../../../../src/app/shared/earthquake-blurb/earthquake-blurb.component.ts");
// ng2-file-upload
var ng2_file_upload_1 = __webpack_require__("../../../../ng2-file-upload/index.js");
// scroll behavior
var stick_to_top_directive_1 = __webpack_require__("../../../../../src/app/shared/directives/stick-to-top.directive.ts");
// screen dimmer
var screen_dimmer_component_1 = __webpack_require__("../../../../../src/app/shared/screen-dimmer/screen-dimmer.component.ts");
// in-app documentation
var info_component_1 = __webpack_require__("../../../../../src/app/shared/info/info.component.ts");
var SharedModule = /** @class */ (function () {
    function SharedModule() {
    }
    SharedModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
            ],
            declarations: [map_component_1.MapComponent,
                stick_to_top_directive_1.StickToTopDirective,
                earthquake_blurb_component_1.EarthquakeBlurbComponent,
                screen_dimmer_component_1.ScreenDimmerComponent,
                earthquake_list_component_1.EarthquakeListComponent,
                facility_list_component_1.FacilityListComponent,
                facility_info_component_1.FacilityInfoComponent,
                ng2_file_upload_1.FileSelectDirective,
                ng2_file_upload_1.FileDropDirective,
                info_component_1.InfoComponent],
            providers: [],
            exports: [map_component_1.MapComponent,
                earthquake_blurb_component_1.EarthquakeBlurbComponent,
                facility_list_component_1.FacilityListComponent,
                facility_info_component_1.FacilityInfoComponent,
                earthquake_list_component_1.EarthquakeListComponent,
                common_1.CommonModule,
                forms_1.FormsModule,
                stick_to_top_directive_1.StickToTopDirective,
                screen_dimmer_component_1.ScreenDimmerComponent,
                ng2_file_upload_1.FileSelectDirective,
                ng2_file_upload_1.FileDropDirective,
                info_component_1.InfoComponent]
        })
    ], SharedModule);
    return SharedModule;
}());
exports.SharedModule = SharedModule;


/***/ }),

/***/ "../../../../../src/app/title/title.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".title {\n    display: inline-block;\n    font-size: 45px;\n    position: fixed;\n    top: 0;\n    left: 5%;\n    margin-top: 20px;\n    color: #46a;\n    z-index: 1;\n}\n\nimg {\n    height: 30px;\n    display: inline-block;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/title/title.component.html":
/***/ (function(module, exports) {

module.exports = "<h3 class=\"title\"><img src=\"/assets/block_stack_trans.png\">{{ title }}</h3>"

/***/ }),

/***/ "../../../../../src/app/title/title.component.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var title_service_1 = __webpack_require__("../../../../../src/app/title/title.service.ts");
var TitleComponent = /** @class */ (function () {
    function TitleComponent(titleService, cdr) {
        this.titleService = titleService;
        this.cdr = cdr;
        this.subscriptions = [];
        this.title = '';
    }
    TitleComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscriptions.push(this.titleService.title.subscribe(function (title) {
            _this.title = title;
            _this.cdr.detectChanges();
        }));
    };
    TitleComponent.prototype.ngOnDestroy = function () {
        this.endSubscriptions();
    };
    TitleComponent.prototype.endSubscriptions = function () {
        for (var sub in this.subscriptions) {
            this.subscriptions[sub].unsubscribe();
        }
    };
    TitleComponent = __decorate([
        core_1.Component({
            selector: 'page-title',
            template: __webpack_require__("../../../../../src/app/title/title.component.html"),
            styles: [__webpack_require__("../../../../../src/app/title/title.component.css")]
        }),
        __metadata("design:paramtypes", [title_service_1.TitleService,
            core_1.ChangeDetectorRef])
    ], TitleComponent);
    return TitleComponent;
}());
exports.TitleComponent = TitleComponent;


/***/ }),

/***/ "../../../../../src/app/title/title.service.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var ReplaySubject_1 = __webpack_require__("../../../../rxjs/_esm5/ReplaySubject.js");
var TitleService = /** @class */ (function () {
    function TitleService() {
        this.title = new ReplaySubject_1.ReplaySubject(1);
    }
    TitleService = __decorate([
        core_1.Injectable()
    ], TitleService);
    return TitleService;
}());
exports.TitleService = TitleService;


/***/ }),

/***/ "../../../../../src/environments/environment.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = {
    production: false
};


/***/ }),

/***/ "../../../../../src/main.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__("../../../core/esm5/core.js");
var platform_browser_dynamic_1 = __webpack_require__("../../../platform-browser-dynamic/esm5/platform-browser-dynamic.js");
var app_module_1 = __webpack_require__("../../../../../src/app/app.module.ts");
var environment_1 = __webpack_require__("../../../../../src/environments/environment.ts");
if (environment_1.environment.production) {
    core_1.enableProdMode();
}
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule)
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("../../../../../src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map