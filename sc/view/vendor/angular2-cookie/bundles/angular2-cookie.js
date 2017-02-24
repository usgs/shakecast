System.register("@angular/common/src/location/hash_location_strategy.js", ["@angular/core", "../facade/lang", "./location", "./location_strategy", "./platform_location"], function($__export) {
  "use strict";
  var __extends,
      Inject,
      Injectable,
      Optional,
      isPresent,
      Location,
      APP_BASE_HREF,
      LocationStrategy,
      PlatformLocation,
      HashLocationStrategy;
  function HashLocationStrategy_tsickle_Closure_declarations() {
    HashLocationStrategy.decorators;
    HashLocationStrategy.ctorParameters;
    HashLocationStrategy.prototype._baseHref;
    HashLocationStrategy.prototype._platformLocation;
  }
  return {
    setters: [function($__m) {
      Inject = $__m.Inject;
      Injectable = $__m.Injectable;
      Optional = $__m.Optional;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      Location = $__m.Location;
    }, function($__m) {
      APP_BASE_HREF = $__m.APP_BASE_HREF;
      LocationStrategy = $__m.LocationStrategy;
    }, function($__m) {
      PlatformLocation = $__m.PlatformLocation;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      HashLocationStrategy = (function(_super) {
        __extends(HashLocationStrategy, _super);
        function HashLocationStrategy(_platformLocation, _baseHref) {
          _super.call(this);
          this._platformLocation = _platformLocation;
          this._baseHref = '';
          if (isPresent(_baseHref)) {
            this._baseHref = _baseHref;
          }
        }
        HashLocationStrategy.prototype.onPopState = function(fn) {
          this._platformLocation.onPopState(fn);
          this._platformLocation.onHashChange(fn);
        };
        HashLocationStrategy.prototype.getBaseHref = function() {
          return this._baseHref;
        };
        HashLocationStrategy.prototype.path = function(includeHash) {
          if (includeHash === void 0) {
            includeHash = false;
          }
          var path = this._platformLocation.hash;
          if (!isPresent(path))
            path = '#';
          return path.length > 0 ? path.substring(1) : path;
        };
        HashLocationStrategy.prototype.prepareExternalUrl = function(internal) {
          var url = Location.joinWithSlash(this._baseHref, internal);
          return url.length > 0 ? ('#' + url) : url;
        };
        HashLocationStrategy.prototype.pushState = function(state, title, path, queryParams) {
          var url = this.prepareExternalUrl(path + Location.normalizeQueryParams(queryParams));
          if (url.length == 0) {
            url = this._platformLocation.pathname;
          }
          this._platformLocation.pushState(state, title, url);
        };
        HashLocationStrategy.prototype.replaceState = function(state, title, path, queryParams) {
          var url = this.prepareExternalUrl(path + Location.normalizeQueryParams(queryParams));
          if (url.length == 0) {
            url = this._platformLocation.pathname;
          }
          this._platformLocation.replaceState(state, title, url);
        };
        HashLocationStrategy.prototype.forward = function() {
          this._platformLocation.forward();
        };
        HashLocationStrategy.prototype.back = function() {
          this._platformLocation.back();
        };
        HashLocationStrategy.decorators = [{type: Injectable}];
        HashLocationStrategy.ctorParameters = function() {
          return [{type: PlatformLocation}, {
            type: undefined,
            decorators: [{type: Optional}, {
              type: Inject,
              args: [APP_BASE_HREF]
            }]
          }];
        };
        return HashLocationStrategy;
      }(LocationStrategy));
      $__export("HashLocationStrategy", HashLocationStrategy);
    }
  };
});

System.register("@angular/common/src/location/platform_location.js", [], function($__export) {
  "use strict";
  var PlatformLocation;
  return {
    setters: [],
    execute: function() {
      PlatformLocation = (function() {
        function PlatformLocation() {}
        PlatformLocation.prototype.getBaseHrefFromDOM = function() {};
        PlatformLocation.prototype.onPopState = function(fn) {};
        PlatformLocation.prototype.onHashChange = function(fn) {};
        Object.defineProperty(PlatformLocation.prototype, "pathname", {
          get: function() {
            return null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(PlatformLocation.prototype, "search", {
          get: function() {
            return null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(PlatformLocation.prototype, "hash", {
          get: function() {
            return null;
          },
          enumerable: true,
          configurable: true
        });
        PlatformLocation.prototype.replaceState = function(state, title, url) {};
        PlatformLocation.prototype.pushState = function(state, title, url) {};
        PlatformLocation.prototype.forward = function() {};
        PlatformLocation.prototype.back = function() {};
        return PlatformLocation;
      }());
      $__export("PlatformLocation", PlatformLocation);
    }
  };
});

System.register("@angular/common/src/location/path_location_strategy.js", ["@angular/core", "../facade/lang", "./location", "./location_strategy", "./platform_location"], function($__export) {
  "use strict";
  var __extends,
      Inject,
      Injectable,
      Optional,
      isBlank,
      Location,
      APP_BASE_HREF,
      LocationStrategy,
      PlatformLocation,
      PathLocationStrategy;
  function PathLocationStrategy_tsickle_Closure_declarations() {
    PathLocationStrategy.decorators;
    PathLocationStrategy.ctorParameters;
    PathLocationStrategy.prototype._baseHref;
    PathLocationStrategy.prototype._platformLocation;
  }
  return {
    setters: [function($__m) {
      Inject = $__m.Inject;
      Injectable = $__m.Injectable;
      Optional = $__m.Optional;
    }, function($__m) {
      isBlank = $__m.isBlank;
    }, function($__m) {
      Location = $__m.Location;
    }, function($__m) {
      APP_BASE_HREF = $__m.APP_BASE_HREF;
      LocationStrategy = $__m.LocationStrategy;
    }, function($__m) {
      PlatformLocation = $__m.PlatformLocation;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      PathLocationStrategy = (function(_super) {
        __extends(PathLocationStrategy, _super);
        function PathLocationStrategy(_platformLocation, href) {
          _super.call(this);
          this._platformLocation = _platformLocation;
          if (isBlank(href)) {
            href = this._platformLocation.getBaseHrefFromDOM();
          }
          if (isBlank(href)) {
            throw new Error("No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.");
          }
          this._baseHref = href;
        }
        PathLocationStrategy.prototype.onPopState = function(fn) {
          this._platformLocation.onPopState(fn);
          this._platformLocation.onHashChange(fn);
        };
        PathLocationStrategy.prototype.getBaseHref = function() {
          return this._baseHref;
        };
        PathLocationStrategy.prototype.prepareExternalUrl = function(internal) {
          return Location.joinWithSlash(this._baseHref, internal);
        };
        PathLocationStrategy.prototype.path = function(includeHash) {
          if (includeHash === void 0) {
            includeHash = false;
          }
          var pathname = this._platformLocation.pathname + Location.normalizeQueryParams(this._platformLocation.search);
          var hash = this._platformLocation.hash;
          return hash && includeHash ? "" + pathname + hash : pathname;
        };
        PathLocationStrategy.prototype.pushState = function(state, title, url, queryParams) {
          var externalUrl = this.prepareExternalUrl(url + Location.normalizeQueryParams(queryParams));
          this._platformLocation.pushState(state, title, externalUrl);
        };
        PathLocationStrategy.prototype.replaceState = function(state, title, url, queryParams) {
          var externalUrl = this.prepareExternalUrl(url + Location.normalizeQueryParams(queryParams));
          this._platformLocation.replaceState(state, title, externalUrl);
        };
        PathLocationStrategy.prototype.forward = function() {
          this._platformLocation.forward();
        };
        PathLocationStrategy.prototype.back = function() {
          this._platformLocation.back();
        };
        PathLocationStrategy.decorators = [{type: Injectable}];
        PathLocationStrategy.ctorParameters = function() {
          return [{type: PlatformLocation}, {
            type: undefined,
            decorators: [{type: Optional}, {
              type: Inject,
              args: [APP_BASE_HREF]
            }]
          }];
        };
        return PathLocationStrategy;
      }(LocationStrategy));
      $__export("PathLocationStrategy", PathLocationStrategy);
    }
  };
});

System.register("@angular/common/src/location/location_strategy.js", ["@angular/core"], function($__export) {
  "use strict";
  var OpaqueToken,
      LocationStrategy,
      APP_BASE_HREF;
  return {
    setters: [function($__m) {
      OpaqueToken = $__m.OpaqueToken;
    }],
    execute: function() {
      LocationStrategy = (function() {
        function LocationStrategy() {}
        LocationStrategy.prototype.path = function(includeHash) {};
        LocationStrategy.prototype.prepareExternalUrl = function(internal) {};
        LocationStrategy.prototype.pushState = function(state, title, url, queryParams) {};
        LocationStrategy.prototype.replaceState = function(state, title, url, queryParams) {};
        LocationStrategy.prototype.forward = function() {};
        LocationStrategy.prototype.back = function() {};
        LocationStrategy.prototype.onPopState = function(fn) {};
        LocationStrategy.prototype.getBaseHref = function() {};
        return LocationStrategy;
      }());
      $__export("LocationStrategy", LocationStrategy);
      APP_BASE_HREF = new OpaqueToken('appBaseHref');
      $__export("APP_BASE_HREF", APP_BASE_HREF);
    }
  };
});

System.register("@angular/common/src/location/location.js", ["@angular/core", "./location_strategy"], function($__export) {
  "use strict";
  var EventEmitter,
      Injectable,
      LocationStrategy,
      Location;
  function Location_tsickle_Closure_declarations() {
    Location.decorators;
    Location.ctorParameters;
    Location.prototype._subject;
    Location.prototype._baseHref;
    Location.prototype._platformStrategy;
  }
  function _stripBaseHref(baseHref, url) {
    return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
  }
  function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
  }
  return {
    setters: [function($__m) {
      EventEmitter = $__m.EventEmitter;
      Injectable = $__m.Injectable;
    }, function($__m) {
      LocationStrategy = $__m.LocationStrategy;
    }],
    execute: function() {
      Location = (function() {
        function Location(platformStrategy) {
          var _this = this;
          this._subject = new EventEmitter();
          this._platformStrategy = platformStrategy;
          var browserBaseHref = this._platformStrategy.getBaseHref();
          this._baseHref = Location.stripTrailingSlash(_stripIndexHtml(browserBaseHref));
          this._platformStrategy.onPopState(function(ev) {
            _this._subject.emit({
              'url': _this.path(true),
              'pop': true,
              'type': ev.type
            });
          });
        }
        Location.prototype.path = function(includeHash) {
          if (includeHash === void 0) {
            includeHash = false;
          }
          return this.normalize(this._platformStrategy.path(includeHash));
        };
        Location.prototype.isCurrentPathEqualTo = function(path, query) {
          if (query === void 0) {
            query = '';
          }
          return this.path() == this.normalize(path + Location.normalizeQueryParams(query));
        };
        Location.prototype.normalize = function(url) {
          return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
        };
        Location.prototype.prepareExternalUrl = function(url) {
          if (url && url[0] !== '/') {
            url = '/' + url;
          }
          return this._platformStrategy.prepareExternalUrl(url);
        };
        Location.prototype.go = function(path, query) {
          if (query === void 0) {
            query = '';
          }
          this._platformStrategy.pushState(null, '', path, query);
        };
        Location.prototype.replaceState = function(path, query) {
          if (query === void 0) {
            query = '';
          }
          this._platformStrategy.replaceState(null, '', path, query);
        };
        Location.prototype.forward = function() {
          this._platformStrategy.forward();
        };
        Location.prototype.back = function() {
          this._platformStrategy.back();
        };
        Location.prototype.subscribe = function(onNext, onThrow, onReturn) {
          if (onThrow === void 0) {
            onThrow = null;
          }
          if (onReturn === void 0) {
            onReturn = null;
          }
          return this._subject.subscribe({
            next: onNext,
            error: onThrow,
            complete: onReturn
          });
        };
        Location.normalizeQueryParams = function(params) {
          return params && params[0] !== '?' ? '?' + params : params;
        };
        Location.joinWithSlash = function(start, end) {
          if (start.length == 0) {
            return end;
          }
          if (end.length == 0) {
            return start;
          }
          var slashes = 0;
          if (start.endsWith('/')) {
            slashes++;
          }
          if (end.startsWith('/')) {
            slashes++;
          }
          if (slashes == 2) {
            return start + end.substring(1);
          }
          if (slashes == 1) {
            return start + end;
          }
          return start + '/' + end;
        };
        Location.stripTrailingSlash = function(url) {
          return url.replace(/\/$/, '');
        };
        Location.decorators = [{type: Injectable}];
        Location.ctorParameters = function() {
          return [{type: LocationStrategy}];
        };
        return Location;
      }());
      $__export("Location", Location);
    }
  };
});

System.register("@angular/common/src/location/index.js", ["./platform_location", "./location_strategy", "./hash_location_strategy", "./path_location_strategy", "./location"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({PlatformLocation: $__m.PlatformLocation});
    }, function($__m) {
      $__export({
        LocationStrategy: $__m.LocationStrategy,
        APP_BASE_HREF: $__m.APP_BASE_HREF
      });
    }, function($__m) {
      $__export({HashLocationStrategy: $__m.HashLocationStrategy});
    }, function($__m) {
      $__export({PathLocationStrategy: $__m.PathLocationStrategy});
    }, function($__m) {
      $__export({Location: $__m.Location});
    }],
    execute: function() {}
  };
});

System.register("@angular/common/src/common_module.js", ["@angular/core", "./directives/index", "./localization", "./pipes/index"], function($__export) {
  "use strict";
  var NgModule,
      COMMON_DIRECTIVES,
      NgLocaleLocalization,
      NgLocalization,
      COMMON_PIPES,
      CommonModule;
  function CommonModule_tsickle_Closure_declarations() {
    CommonModule.decorators;
    CommonModule.ctorParameters;
  }
  return {
    setters: [function($__m) {
      NgModule = $__m.NgModule;
    }, function($__m) {
      COMMON_DIRECTIVES = $__m.COMMON_DIRECTIVES;
    }, function($__m) {
      NgLocaleLocalization = $__m.NgLocaleLocalization;
      NgLocalization = $__m.NgLocalization;
    }, function($__m) {
      COMMON_PIPES = $__m.COMMON_PIPES;
    }],
    execute: function() {
      CommonModule = (function() {
        function CommonModule() {}
        CommonModule.decorators = [{
          type: NgModule,
          args: [{
            declarations: [COMMON_DIRECTIVES, COMMON_PIPES],
            exports: [COMMON_DIRECTIVES, COMMON_PIPES],
            providers: [{
              provide: NgLocalization,
              useClass: NgLocaleLocalization
            }]
          }]
        }];
        CommonModule.ctorParameters = function() {
          return [];
        };
        return CommonModule;
      }());
      $__export("CommonModule", CommonModule);
    }
  };
});

System.register("@angular/common/src/facade/collection.js", ["./lang"], function($__export) {
  "use strict";
  var getSymbolIterator,
      isJsObject,
      StringMapWrapper,
      ListWrapper;
  function isListLikeIterable(obj) {
    if (!isJsObject(obj))
      return false;
    return Array.isArray(obj) || (!(obj instanceof Map) && getSymbolIterator() in obj);
  }
  function areIterablesEqual(a, b, comparator) {
    var iterator1 = a[getSymbolIterator()]();
    var iterator2 = b[getSymbolIterator()]();
    while (true) {
      var item1 = iterator1.next();
      var item2 = iterator2.next();
      if (item1.done && item2.done)
        return true;
      if (item1.done || item2.done)
        return false;
      if (!comparator(item1.value, item2.value))
        return false;
    }
  }
  function iterateListLike(obj, fn) {
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        fn(obj[i]);
      }
    } else {
      var iterator = obj[getSymbolIterator()]();
      var item = void 0;
      while (!((item = iterator.next()).done)) {
        fn(item.value);
      }
    }
  }
  $__export("isListLikeIterable", isListLikeIterable);
  $__export("areIterablesEqual", areIterablesEqual);
  $__export("iterateListLike", iterateListLike);
  return {
    setters: [function($__m) {
      getSymbolIterator = $__m.getSymbolIterator;
      isJsObject = $__m.isJsObject;
    }],
    execute: function() {
      StringMapWrapper = (function() {
        function StringMapWrapper() {}
        StringMapWrapper.merge = function(m1, m2) {
          var m = {};
          for (var _i = 0,
              _a = Object.keys(m1); _i < _a.length; _i++) {
            var k = _a[_i];
            m[k] = m1[k];
          }
          for (var _b = 0,
              _c = Object.keys(m2); _b < _c.length; _b++) {
            var k = _c[_b];
            m[k] = m2[k];
          }
          return m;
        };
        StringMapWrapper.equals = function(m1, m2) {
          var k1 = Object.keys(m1);
          var k2 = Object.keys(m2);
          if (k1.length != k2.length) {
            return false;
          }
          for (var i = 0; i < k1.length; i++) {
            var key = k1[i];
            if (m1[key] !== m2[key]) {
              return false;
            }
          }
          return true;
        };
        return StringMapWrapper;
      }());
      $__export("StringMapWrapper", StringMapWrapper);
      ListWrapper = (function() {
        function ListWrapper() {}
        ListWrapper.findLast = function(arr, condition) {
          for (var i = arr.length - 1; i >= 0; i--) {
            if (condition(arr[i])) {
              return arr[i];
            }
          }
          return null;
        };
        ListWrapper.removeAll = function(list, items) {
          for (var i = 0; i < items.length; ++i) {
            var index = list.indexOf(items[i]);
            if (index > -1) {
              list.splice(index, 1);
            }
          }
        };
        ListWrapper.remove = function(list, el) {
          var index = list.indexOf(el);
          if (index > -1) {
            list.splice(index, 1);
            return true;
          }
          return false;
        };
        ListWrapper.equals = function(a, b) {
          if (a.length != b.length)
            return false;
          for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i])
              return false;
          }
          return true;
        };
        ListWrapper.flatten = function(list) {
          return list.reduce(function(flat, item) {
            var flatItem = Array.isArray(item) ? ListWrapper.flatten(item) : item;
            return ((flat)).concat(flatItem);
          }, []);
        };
        return ListWrapper;
      }());
      $__export("ListWrapper", ListWrapper);
    }
  };
});

System.register("@angular/common/src/directives/ng_class.js", ["@angular/core", "../facade/collection", "../facade/lang"], function($__export) {
  "use strict";
  var Directive,
      ElementRef,
      Input,
      IterableDiffers,
      KeyValueDiffers,
      Renderer,
      isListLikeIterable,
      isPresent,
      stringify,
      NgClass;
  function NgClass_tsickle_Closure_declarations() {
    NgClass.decorators;
    NgClass.ctorParameters;
    NgClass.propDecorators;
    NgClass.prototype._iterableDiffer;
    NgClass.prototype._keyValueDiffer;
    NgClass.prototype._initialClasses;
    NgClass.prototype._rawClass;
    NgClass.prototype._iterableDiffers;
    NgClass.prototype._keyValueDiffers;
    NgClass.prototype._ngEl;
    NgClass.prototype._renderer;
  }
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      ElementRef = $__m.ElementRef;
      Input = $__m.Input;
      IterableDiffers = $__m.IterableDiffers;
      KeyValueDiffers = $__m.KeyValueDiffers;
      Renderer = $__m.Renderer;
    }, function($__m) {
      isListLikeIterable = $__m.isListLikeIterable;
    }, function($__m) {
      isPresent = $__m.isPresent;
      stringify = $__m.stringify;
    }],
    execute: function() {
      NgClass = (function() {
        function NgClass(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
          this._iterableDiffers = _iterableDiffers;
          this._keyValueDiffers = _keyValueDiffers;
          this._ngEl = _ngEl;
          this._renderer = _renderer;
          this._initialClasses = [];
        }
        Object.defineProperty(NgClass.prototype, "klass", {
          set: function(v) {
            this._applyInitialClasses(true);
            this._initialClasses = typeof v === 'string' ? v.split(/\s+/) : [];
            this._applyInitialClasses(false);
            this._applyClasses(this._rawClass, false);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgClass.prototype, "ngClass", {
          set: function(v) {
            this._cleanupClasses(this._rawClass);
            this._iterableDiffer = null;
            this._keyValueDiffer = null;
            this._rawClass = typeof v === 'string' ? v.split(/\s+/) : v;
            if (this._rawClass) {
              if (isListLikeIterable(this._rawClass)) {
                this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create(null);
              } else {
                this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create(null);
              }
            }
          },
          enumerable: true,
          configurable: true
        });
        NgClass.prototype.ngDoCheck = function() {
          if (this._iterableDiffer) {
            var changes = this._iterableDiffer.diff(this._rawClass);
            if (changes) {
              this._applyIterableChanges(changes);
            }
          } else if (this._keyValueDiffer) {
            var changes = this._keyValueDiffer.diff(this._rawClass);
            if (changes) {
              this._applyKeyValueChanges(changes);
            }
          }
        };
        NgClass.prototype._cleanupClasses = function(rawClassVal) {
          this._applyClasses(rawClassVal, true);
          this._applyInitialClasses(false);
        };
        NgClass.prototype._applyKeyValueChanges = function(changes) {
          var _this = this;
          changes.forEachAddedItem(function(record) {
            return _this._toggleClass(record.key, record.currentValue);
          });
          changes.forEachChangedItem(function(record) {
            return _this._toggleClass(record.key, record.currentValue);
          });
          changes.forEachRemovedItem(function(record) {
            if (record.previousValue) {
              _this._toggleClass(record.key, false);
            }
          });
        };
        NgClass.prototype._applyIterableChanges = function(changes) {
          var _this = this;
          changes.forEachAddedItem(function(record) {
            if (typeof record.item === 'string') {
              _this._toggleClass(record.item, true);
            } else {
              throw new Error("NgClass can only toggle CSS classes expressed as strings, got " + stringify(record.item));
            }
          });
          changes.forEachRemovedItem(function(record) {
            return _this._toggleClass(record.item, false);
          });
        };
        NgClass.prototype._applyInitialClasses = function(isCleanup) {
          var _this = this;
          this._initialClasses.forEach(function(klass) {
            return _this._toggleClass(klass, !isCleanup);
          });
        };
        NgClass.prototype._applyClasses = function(rawClassVal, isCleanup) {
          var _this = this;
          if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
              ((rawClassVal)).forEach(function(klass) {
                return _this._toggleClass(klass, !isCleanup);
              });
            } else {
              Object.keys(rawClassVal).forEach(function(klass) {
                if (isPresent(rawClassVal[klass]))
                  _this._toggleClass(klass, !isCleanup);
              });
            }
          }
        };
        NgClass.prototype._toggleClass = function(klass, enabled) {
          var _this = this;
          klass = klass.trim();
          if (klass) {
            klass.split(/\s+/g).forEach(function(klass) {
              _this._renderer.setElementClass(_this._ngEl.nativeElement, klass, enabled);
            });
          }
        };
        NgClass.decorators = [{
          type: Directive,
          args: [{selector: '[ngClass]'}]
        }];
        NgClass.ctorParameters = function() {
          return [{type: IterableDiffers}, {type: KeyValueDiffers}, {type: ElementRef}, {type: Renderer}];
        };
        NgClass.propDecorators = {
          'klass': [{
            type: Input,
            args: ['class']
          }],
          'ngClass': [{type: Input}]
        };
        return NgClass;
      }());
      $__export("NgClass", NgClass);
    }
  };
});

System.register("@angular/common/src/directives/ng_for.js", ["@angular/core", "../facade/lang"], function($__export) {
  "use strict";
  var ChangeDetectorRef,
      Directive,
      Input,
      IterableDiffers,
      TemplateRef,
      ViewContainerRef,
      getTypeNameForDebugging,
      NgForRow,
      NgFor,
      RecordViewTuple;
  function NgForRow_tsickle_Closure_declarations() {
    NgForRow.prototype.$implicit;
    NgForRow.prototype.index;
    NgForRow.prototype.count;
  }
  function NgFor_tsickle_Closure_declarations() {
    NgFor.decorators;
    NgFor.ctorParameters;
    NgFor.propDecorators;
    NgFor.prototype.ngForOf;
    NgFor.prototype.ngForTrackBy;
    NgFor.prototype._differ;
    NgFor.prototype._viewContainer;
    NgFor.prototype._template;
    NgFor.prototype._differs;
    NgFor.prototype._cdr;
  }
  function RecordViewTuple_tsickle_Closure_declarations() {
    RecordViewTuple.prototype.record;
    RecordViewTuple.prototype.view;
  }
  return {
    setters: [function($__m) {
      ChangeDetectorRef = $__m.ChangeDetectorRef;
      Directive = $__m.Directive;
      Input = $__m.Input;
      IterableDiffers = $__m.IterableDiffers;
      TemplateRef = $__m.TemplateRef;
      ViewContainerRef = $__m.ViewContainerRef;
    }, function($__m) {
      getTypeNameForDebugging = $__m.getTypeNameForDebugging;
    }],
    execute: function() {
      NgForRow = (function() {
        function NgForRow($implicit, index, count) {
          this.$implicit = $implicit;
          this.index = index;
          this.count = count;
        }
        Object.defineProperty(NgForRow.prototype, "first", {
          get: function() {
            return this.index === 0;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgForRow.prototype, "last", {
          get: function() {
            return this.index === this.count - 1;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgForRow.prototype, "even", {
          get: function() {
            return this.index % 2 === 0;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgForRow.prototype, "odd", {
          get: function() {
            return !this.even;
          },
          enumerable: true,
          configurable: true
        });
        return NgForRow;
      }());
      $__export("NgForRow", NgForRow);
      NgFor = (function() {
        function NgFor(_viewContainer, _template, _differs, _cdr) {
          this._viewContainer = _viewContainer;
          this._template = _template;
          this._differs = _differs;
          this._cdr = _cdr;
          this._differ = null;
        }
        Object.defineProperty(NgFor.prototype, "ngForTemplate", {
          set: function(value) {
            if (value) {
              this._template = value;
            }
          },
          enumerable: true,
          configurable: true
        });
        NgFor.prototype.ngOnChanges = function(changes) {
          if ('ngForOf' in changes) {
            var value = changes['ngForOf'].currentValue;
            if (!this._differ && value) {
              try {
                this._differ = this._differs.find(value).create(this._cdr, this.ngForTrackBy);
              } catch (e) {
                throw new Error("Cannot find a differ supporting object '" + value + "' of type '" + getTypeNameForDebugging(value) + "'. NgFor only supports binding to Iterables such as Arrays.");
              }
            }
          }
        };
        NgFor.prototype.ngDoCheck = function() {
          if (this._differ) {
            var changes = this._differ.diff(this.ngForOf);
            if (changes)
              this._applyChanges(changes);
          }
        };
        NgFor.prototype._applyChanges = function(changes) {
          var _this = this;
          var insertTuples = [];
          changes.forEachOperation(function(item, adjustedPreviousIndex, currentIndex) {
            if (item.previousIndex == null) {
              var view = _this._viewContainer.createEmbeddedView(_this._template, new NgForRow(null, null, null), currentIndex);
              var tuple = new RecordViewTuple(item, view);
              insertTuples.push(tuple);
            } else if (currentIndex == null) {
              _this._viewContainer.remove(adjustedPreviousIndex);
            } else {
              var view = _this._viewContainer.get(adjustedPreviousIndex);
              _this._viewContainer.move(view, currentIndex);
              var tuple = new RecordViewTuple(item, (view));
              insertTuples.push(tuple);
            }
          });
          for (var i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
          }
          for (var i = 0,
              ilen = this._viewContainer.length; i < ilen; i++) {
            var viewRef = (this._viewContainer.get(i));
            viewRef.context.index = i;
            viewRef.context.count = ilen;
          }
          changes.forEachIdentityChange(function(record) {
            var viewRef = (_this._viewContainer.get(record.currentIndex));
            viewRef.context.$implicit = record.item;
          });
        };
        NgFor.prototype._perViewChange = function(view, record) {
          view.context.$implicit = record.item;
        };
        NgFor.decorators = [{
          type: Directive,
          args: [{selector: '[ngFor][ngForOf]'}]
        }];
        NgFor.ctorParameters = function() {
          return [{type: ViewContainerRef}, {type: TemplateRef}, {type: IterableDiffers}, {type: ChangeDetectorRef}];
        };
        NgFor.propDecorators = {
          'ngForOf': [{type: Input}],
          'ngForTrackBy': [{type: Input}],
          'ngForTemplate': [{type: Input}]
        };
        return NgFor;
      }());
      $__export("NgFor", NgFor);
      RecordViewTuple = (function() {
        function RecordViewTuple(record, view) {
          this.record = record;
          this.view = view;
        }
        return RecordViewTuple;
      }());
    }
  };
});

System.register("@angular/common/src/directives/ng_if.js", ["@angular/core"], function($__export) {
  "use strict";
  var Directive,
      Input,
      TemplateRef,
      ViewContainerRef,
      NgIf;
  function NgIf_tsickle_Closure_declarations() {
    NgIf.decorators;
    NgIf.ctorParameters;
    NgIf.propDecorators;
    NgIf.prototype._hasView;
    NgIf.prototype._viewContainer;
    NgIf.prototype._template;
  }
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      Input = $__m.Input;
      TemplateRef = $__m.TemplateRef;
      ViewContainerRef = $__m.ViewContainerRef;
    }],
    execute: function() {
      NgIf = (function() {
        function NgIf(_viewContainer, _template) {
          this._viewContainer = _viewContainer;
          this._template = _template;
          this._hasView = false;
        }
        Object.defineProperty(NgIf.prototype, "ngIf", {
          set: function(condition) {
            if (condition && !this._hasView) {
              this._hasView = true;
              this._viewContainer.createEmbeddedView(this._template);
            } else if (!condition && this._hasView) {
              this._hasView = false;
              this._viewContainer.clear();
            }
          },
          enumerable: true,
          configurable: true
        });
        NgIf.decorators = [{
          type: Directive,
          args: [{selector: '[ngIf]'}]
        }];
        NgIf.ctorParameters = function() {
          return [{type: ViewContainerRef}, {type: TemplateRef}];
        };
        NgIf.propDecorators = {'ngIf': [{type: Input}]};
        return NgIf;
      }());
      $__export("NgIf", NgIf);
    }
  };
});

System.register("@angular/common/src/directives/ng_plural.js", ["@angular/core", "../localization", "./ng_switch"], function($__export) {
  "use strict";
  var Attribute,
      Directive,
      Host,
      Input,
      TemplateRef,
      ViewContainerRef,
      NgLocalization,
      getPluralCategory,
      SwitchView,
      NgPlural,
      NgPluralCase;
  function NgPlural_tsickle_Closure_declarations() {
    NgPlural.decorators;
    NgPlural.ctorParameters;
    NgPlural.propDecorators;
    NgPlural.prototype._switchValue;
    NgPlural.prototype._activeView;
    NgPlural.prototype._caseViews;
    NgPlural.prototype._localization;
  }
  function NgPluralCase_tsickle_Closure_declarations() {
    NgPluralCase.decorators;
    NgPluralCase.ctorParameters;
    NgPluralCase.prototype.value;
  }
  return {
    setters: [function($__m) {
      Attribute = $__m.Attribute;
      Directive = $__m.Directive;
      Host = $__m.Host;
      Input = $__m.Input;
      TemplateRef = $__m.TemplateRef;
      ViewContainerRef = $__m.ViewContainerRef;
    }, function($__m) {
      NgLocalization = $__m.NgLocalization;
      getPluralCategory = $__m.getPluralCategory;
    }, function($__m) {
      SwitchView = $__m.SwitchView;
    }],
    execute: function() {
      NgPlural = (function() {
        function NgPlural(_localization) {
          this._localization = _localization;
          this._caseViews = {};
        }
        Object.defineProperty(NgPlural.prototype, "ngPlural", {
          set: function(value) {
            this._switchValue = value;
            this._updateView();
          },
          enumerable: true,
          configurable: true
        });
        NgPlural.prototype.addCase = function(value, switchView) {
          this._caseViews[value] = switchView;
        };
        NgPlural.prototype._updateView = function() {
          this._clearViews();
          var cases = Object.keys(this._caseViews);
          var key = getPluralCategory(this._switchValue, cases, this._localization);
          this._activateView(this._caseViews[key]);
        };
        NgPlural.prototype._clearViews = function() {
          if (this._activeView)
            this._activeView.destroy();
        };
        NgPlural.prototype._activateView = function(view) {
          if (view) {
            this._activeView = view;
            this._activeView.create();
          }
        };
        NgPlural.decorators = [{
          type: Directive,
          args: [{selector: '[ngPlural]'}]
        }];
        NgPlural.ctorParameters = function() {
          return [{type: NgLocalization}];
        };
        NgPlural.propDecorators = {'ngPlural': [{type: Input}]};
        return NgPlural;
      }());
      $__export("NgPlural", NgPlural);
      NgPluralCase = (function() {
        function NgPluralCase(value, template, viewContainer, ngPlural) {
          this.value = value;
          ngPlural.addCase(value, new SwitchView(viewContainer, template));
        }
        NgPluralCase.decorators = [{
          type: Directive,
          args: [{selector: '[ngPluralCase]'}]
        }];
        NgPluralCase.ctorParameters = function() {
          return [{
            type: undefined,
            decorators: [{
              type: Attribute,
              args: ['ngPluralCase']
            }]
          }, {type: TemplateRef}, {type: ViewContainerRef}, {
            type: NgPlural,
            decorators: [{type: Host}]
          }];
        };
        return NgPluralCase;
      }());
      $__export("NgPluralCase", NgPluralCase);
    }
  };
});

System.register("@angular/common/src/directives/ng_style.js", ["@angular/core"], function($__export) {
  "use strict";
  var Directive,
      ElementRef,
      Input,
      KeyValueDiffers,
      Renderer,
      NgStyle;
  function NgStyle_tsickle_Closure_declarations() {
    NgStyle.decorators;
    NgStyle.ctorParameters;
    NgStyle.propDecorators;
    NgStyle.prototype._ngStyle;
    NgStyle.prototype._differ;
    NgStyle.prototype._differs;
    NgStyle.prototype._ngEl;
    NgStyle.prototype._renderer;
  }
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      ElementRef = $__m.ElementRef;
      Input = $__m.Input;
      KeyValueDiffers = $__m.KeyValueDiffers;
      Renderer = $__m.Renderer;
    }],
    execute: function() {
      NgStyle = (function() {
        function NgStyle(_differs, _ngEl, _renderer) {
          this._differs = _differs;
          this._ngEl = _ngEl;
          this._renderer = _renderer;
        }
        Object.defineProperty(NgStyle.prototype, "ngStyle", {
          set: function(v) {
            this._ngStyle = v;
            if (!this._differ && v) {
              this._differ = this._differs.find(v).create(null);
            }
          },
          enumerable: true,
          configurable: true
        });
        NgStyle.prototype.ngDoCheck = function() {
          if (this._differ) {
            var changes = this._differ.diff(this._ngStyle);
            if (changes) {
              this._applyChanges(changes);
            }
          }
        };
        NgStyle.prototype._applyChanges = function(changes) {
          var _this = this;
          changes.forEachRemovedItem(function(record) {
            return _this._setStyle(record.key, null);
          });
          changes.forEachAddedItem(function(record) {
            return _this._setStyle(record.key, record.currentValue);
          });
          changes.forEachChangedItem(function(record) {
            return _this._setStyle(record.key, record.currentValue);
          });
        };
        NgStyle.prototype._setStyle = function(nameAndUnit, value) {
          var _a = nameAndUnit.split('.'),
              name = _a[0],
              unit = _a[1];
          value = value && unit ? "" + value + unit : value;
          this._renderer.setElementStyle(this._ngEl.nativeElement, name, value);
        };
        NgStyle.decorators = [{
          type: Directive,
          args: [{selector: '[ngStyle]'}]
        }];
        NgStyle.ctorParameters = function() {
          return [{type: KeyValueDiffers}, {type: ElementRef}, {type: Renderer}];
        };
        NgStyle.propDecorators = {'ngStyle': [{type: Input}]};
        return NgStyle;
      }());
      $__export("NgStyle", NgStyle);
    }
  };
});

System.register("@angular/common/src/directives/ng_switch.js", ["@angular/core"], function($__export) {
  "use strict";
  var Directive,
      Host,
      Input,
      TemplateRef,
      ViewContainerRef,
      SwitchView,
      NgSwitch,
      NgSwitchCase,
      NgSwitchDefault;
  function SwitchView_tsickle_Closure_declarations() {
    SwitchView.prototype._created;
    SwitchView.prototype._viewContainerRef;
    SwitchView.prototype._templateRef;
  }
  function NgSwitch_tsickle_Closure_declarations() {
    NgSwitch.decorators;
    NgSwitch.ctorParameters;
    NgSwitch.propDecorators;
    NgSwitch.prototype._defaultViews;
    NgSwitch.prototype._defaultUsed;
    NgSwitch.prototype._caseCount;
    NgSwitch.prototype._lastCaseCheckIndex;
    NgSwitch.prototype._lastCasesMatched;
    NgSwitch.prototype._ngSwitch;
  }
  function NgSwitchCase_tsickle_Closure_declarations() {
    NgSwitchCase.decorators;
    NgSwitchCase.ctorParameters;
    NgSwitchCase.propDecorators;
    NgSwitchCase.prototype._view;
    NgSwitchCase.prototype.ngSwitchCase;
    NgSwitchCase.prototype.ngSwitch;
  }
  function NgSwitchDefault_tsickle_Closure_declarations() {
    NgSwitchDefault.decorators;
    NgSwitchDefault.ctorParameters;
  }
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      Host = $__m.Host;
      Input = $__m.Input;
      TemplateRef = $__m.TemplateRef;
      ViewContainerRef = $__m.ViewContainerRef;
    }],
    execute: function() {
      SwitchView = (function() {
        function SwitchView(_viewContainerRef, _templateRef) {
          this._viewContainerRef = _viewContainerRef;
          this._templateRef = _templateRef;
          this._created = false;
        }
        SwitchView.prototype.create = function() {
          this._created = true;
          this._viewContainerRef.createEmbeddedView(this._templateRef);
        };
        SwitchView.prototype.destroy = function() {
          this._created = false;
          this._viewContainerRef.clear();
        };
        SwitchView.prototype.enforceState = function(created) {
          if (created && !this._created) {
            this.create();
          } else if (!created && this._created) {
            this.destroy();
          }
        };
        return SwitchView;
      }());
      $__export("SwitchView", SwitchView);
      NgSwitch = (function() {
        function NgSwitch() {
          this._defaultUsed = false;
          this._caseCount = 0;
          this._lastCaseCheckIndex = 0;
          this._lastCasesMatched = false;
        }
        Object.defineProperty(NgSwitch.prototype, "ngSwitch", {
          set: function(newValue) {
            this._ngSwitch = newValue;
            if (this._caseCount === 0) {
              this._updateDefaultCases(true);
            }
          },
          enumerable: true,
          configurable: true
        });
        NgSwitch.prototype._addCase = function() {
          return this._caseCount++;
        };
        NgSwitch.prototype._addDefault = function(view) {
          if (!this._defaultViews) {
            this._defaultViews = [];
          }
          this._defaultViews.push(view);
        };
        NgSwitch.prototype._matchCase = function(value) {
          var matched = value == this._ngSwitch;
          this._lastCasesMatched = this._lastCasesMatched || matched;
          this._lastCaseCheckIndex++;
          if (this._lastCaseCheckIndex === this._caseCount) {
            this._updateDefaultCases(!this._lastCasesMatched);
            this._lastCaseCheckIndex = 0;
            this._lastCasesMatched = false;
          }
          return matched;
        };
        NgSwitch.prototype._updateDefaultCases = function(useDefault) {
          if (this._defaultViews && useDefault !== this._defaultUsed) {
            this._defaultUsed = useDefault;
            for (var i = 0; i < this._defaultViews.length; i++) {
              var defaultView = this._defaultViews[i];
              defaultView.enforceState(useDefault);
            }
          }
        };
        NgSwitch.decorators = [{
          type: Directive,
          args: [{selector: '[ngSwitch]'}]
        }];
        NgSwitch.ctorParameters = function() {
          return [];
        };
        NgSwitch.propDecorators = {'ngSwitch': [{type: Input}]};
        return NgSwitch;
      }());
      $__export("NgSwitch", NgSwitch);
      NgSwitchCase = (function() {
        function NgSwitchCase(viewContainer, templateRef, ngSwitch) {
          this.ngSwitch = ngSwitch;
          ngSwitch._addCase();
          this._view = new SwitchView(viewContainer, templateRef);
        }
        NgSwitchCase.prototype.ngDoCheck = function() {
          this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase));
        };
        NgSwitchCase.decorators = [{
          type: Directive,
          args: [{selector: '[ngSwitchCase]'}]
        }];
        NgSwitchCase.ctorParameters = function() {
          return [{type: ViewContainerRef}, {type: TemplateRef}, {
            type: NgSwitch,
            decorators: [{type: Host}]
          }];
        };
        NgSwitchCase.propDecorators = {'ngSwitchCase': [{type: Input}]};
        return NgSwitchCase;
      }());
      $__export("NgSwitchCase", NgSwitchCase);
      NgSwitchDefault = (function() {
        function NgSwitchDefault(viewContainer, templateRef, ngSwitch) {
          ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
        }
        NgSwitchDefault.decorators = [{
          type: Directive,
          args: [{selector: '[ngSwitchDefault]'}]
        }];
        NgSwitchDefault.ctorParameters = function() {
          return [{type: ViewContainerRef}, {type: TemplateRef}, {
            type: NgSwitch,
            decorators: [{type: Host}]
          }];
        };
        return NgSwitchDefault;
      }());
      $__export("NgSwitchDefault", NgSwitchDefault);
    }
  };
});

System.register("@angular/common/src/directives/ng_template_outlet.js", ["@angular/core"], function($__export) {
  "use strict";
  var Directive,
      Input,
      ViewContainerRef,
      NgTemplateOutlet;
  function NgTemplateOutlet_tsickle_Closure_declarations() {
    NgTemplateOutlet.decorators;
    NgTemplateOutlet.ctorParameters;
    NgTemplateOutlet.propDecorators;
    NgTemplateOutlet.prototype._viewRef;
    NgTemplateOutlet.prototype._context;
    NgTemplateOutlet.prototype._templateRef;
    NgTemplateOutlet.prototype._viewContainerRef;
  }
  return {
    setters: [function($__m) {
      Directive = $__m.Directive;
      Input = $__m.Input;
      ViewContainerRef = $__m.ViewContainerRef;
    }],
    execute: function() {
      NgTemplateOutlet = (function() {
        function NgTemplateOutlet(_viewContainerRef) {
          this._viewContainerRef = _viewContainerRef;
        }
        Object.defineProperty(NgTemplateOutlet.prototype, "ngOutletContext", {
          set: function(context) {
            this._context = context;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgTemplateOutlet.prototype, "ngTemplateOutlet", {
          set: function(templateRef) {
            this._templateRef = templateRef;
          },
          enumerable: true,
          configurable: true
        });
        NgTemplateOutlet.prototype.ngOnChanges = function(changes) {
          if (this._viewRef) {
            this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._viewRef));
          }
          if (this._templateRef) {
            this._viewRef = this._viewContainerRef.createEmbeddedView(this._templateRef, this._context);
          }
        };
        NgTemplateOutlet.decorators = [{
          type: Directive,
          args: [{selector: '[ngTemplateOutlet]'}]
        }];
        NgTemplateOutlet.ctorParameters = function() {
          return [{type: ViewContainerRef}];
        };
        NgTemplateOutlet.propDecorators = {
          'ngOutletContext': [{type: Input}],
          'ngTemplateOutlet': [{type: Input}]
        };
        return NgTemplateOutlet;
      }());
      $__export("NgTemplateOutlet", NgTemplateOutlet);
    }
  };
});

System.register("@angular/common/src/directives/index.js", ["./ng_class", "./ng_for", "./ng_if", "./ng_plural", "./ng_style", "./ng_switch", "./ng_template_outlet"], function($__export) {
  "use strict";
  var NgClass,
      NgFor,
      NgIf,
      NgPlural,
      NgPluralCase,
      NgStyle,
      NgSwitch,
      NgSwitchCase,
      NgSwitchDefault,
      NgTemplateOutlet,
      COMMON_DIRECTIVES;
  return {
    setters: [function($__m) {
      NgClass = $__m.NgClass;
    }, function($__m) {
      NgFor = $__m.NgFor;
    }, function($__m) {
      NgIf = $__m.NgIf;
    }, function($__m) {
      NgPlural = $__m.NgPlural;
      NgPluralCase = $__m.NgPluralCase;
    }, function($__m) {
      NgStyle = $__m.NgStyle;
    }, function($__m) {
      NgSwitch = $__m.NgSwitch;
      NgSwitchCase = $__m.NgSwitchCase;
      NgSwitchDefault = $__m.NgSwitchDefault;
    }, function($__m) {
      NgTemplateOutlet = $__m.NgTemplateOutlet;
    }],
    execute: function() {
      $__export("NgClass", NgClass), $__export("NgFor", NgFor), $__export("NgIf", NgIf), $__export("NgPlural", NgPlural), $__export("NgPluralCase", NgPluralCase), $__export("NgStyle", NgStyle), $__export("NgSwitch", NgSwitch), $__export("NgSwitchCase", NgSwitchCase), $__export("NgSwitchDefault", NgSwitchDefault), $__export("NgTemplateOutlet", NgTemplateOutlet);
      COMMON_DIRECTIVES = [NgClass, NgFor, NgIf, NgTemplateOutlet, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgPlural, NgPluralCase];
      $__export("COMMON_DIRECTIVES", COMMON_DIRECTIVES);
    }
  };
});

System.register("@angular/common/src/private_import_core.js", ["@angular/core"], function($__export) {
  "use strict";
  var r,
      isPromise;
  return {
    setters: [function($__m) {
      r = $__m.__core_private__;
    }],
    execute: function() {
      isPromise = r.isPromise;
      $__export("isPromise", isPromise);
    }
  };
});

System.register("@angular/common/src/pipes/async_pipe.js", ["@angular/core", "../private_import_core", "./invalid_pipe_argument_error"], function($__export) {
  "use strict";
  var ChangeDetectorRef,
      Pipe,
      WrappedValue,
      isPromise,
      InvalidPipeArgumentError,
      ObservableStrategy,
      PromiseStrategy,
      _promiseStrategy,
      _observableStrategy,
      AsyncPipe;
  function AsyncPipe_tsickle_Closure_declarations() {
    AsyncPipe.decorators;
    AsyncPipe.ctorParameters;
    AsyncPipe.prototype._latestValue;
    AsyncPipe.prototype._latestReturnedValue;
    AsyncPipe.prototype._subscription;
    AsyncPipe.prototype._obj;
    AsyncPipe.prototype._strategy;
    AsyncPipe.prototype._ref;
  }
  return {
    setters: [function($__m) {
      ChangeDetectorRef = $__m.ChangeDetectorRef;
      Pipe = $__m.Pipe;
      WrappedValue = $__m.WrappedValue;
    }, function($__m) {
      isPromise = $__m.isPromise;
    }, function($__m) {
      InvalidPipeArgumentError = $__m.InvalidPipeArgumentError;
    }],
    execute: function() {
      ObservableStrategy = (function() {
        function ObservableStrategy() {}
        ObservableStrategy.prototype.createSubscription = function(async, updateLatestValue) {
          return async.subscribe({
            next: updateLatestValue,
            error: function(e) {
              throw e;
            }
          });
        };
        ObservableStrategy.prototype.dispose = function(subscription) {
          subscription.unsubscribe();
        };
        ObservableStrategy.prototype.onDestroy = function(subscription) {
          subscription.unsubscribe();
        };
        return ObservableStrategy;
      }());
      PromiseStrategy = (function() {
        function PromiseStrategy() {}
        PromiseStrategy.prototype.createSubscription = function(async, updateLatestValue) {
          return async.then(updateLatestValue, function(e) {
            throw e;
          });
        };
        PromiseStrategy.prototype.dispose = function(subscription) {};
        PromiseStrategy.prototype.onDestroy = function(subscription) {};
        return PromiseStrategy;
      }());
      _promiseStrategy = new PromiseStrategy();
      _observableStrategy = new ObservableStrategy();
      AsyncPipe = (function() {
        function AsyncPipe(_ref) {
          this._ref = _ref;
          this._latestValue = null;
          this._latestReturnedValue = null;
          this._subscription = null;
          this._obj = null;
          this._strategy = null;
        }
        AsyncPipe.prototype.ngOnDestroy = function() {
          if (this._subscription) {
            this._dispose();
          }
        };
        AsyncPipe.prototype.transform = function(obj) {
          if (!this._obj) {
            if (obj) {
              this._subscribe(obj);
            }
            this._latestReturnedValue = this._latestValue;
            return this._latestValue;
          }
          if (obj !== this._obj) {
            this._dispose();
            return this.transform(obj);
          }
          if (this._latestValue === this._latestReturnedValue) {
            return this._latestReturnedValue;
          }
          this._latestReturnedValue = this._latestValue;
          return WrappedValue.wrap(this._latestValue);
        };
        AsyncPipe.prototype._subscribe = function(obj) {
          var _this = this;
          this._obj = obj;
          this._strategy = this._selectStrategy(obj);
          this._subscription = this._strategy.createSubscription(obj, function(value) {
            return _this._updateLatestValue(obj, value);
          });
        };
        AsyncPipe.prototype._selectStrategy = function(obj) {
          if (isPromise(obj)) {
            return _promiseStrategy;
          }
          if (((obj)).subscribe) {
            return _observableStrategy;
          }
          throw new InvalidPipeArgumentError(AsyncPipe, obj);
        };
        AsyncPipe.prototype._dispose = function() {
          this._strategy.dispose(this._subscription);
          this._latestValue = null;
          this._latestReturnedValue = null;
          this._subscription = null;
          this._obj = null;
        };
        AsyncPipe.prototype._updateLatestValue = function(async, value) {
          if (async === this._obj) {
            this._latestValue = value;
            this._ref.markForCheck();
          }
        };
        AsyncPipe.decorators = [{
          type: Pipe,
          args: [{
            name: 'async',
            pure: false
          }]
        }];
        AsyncPipe.ctorParameters = function() {
          return [{type: ChangeDetectorRef}];
        };
        return AsyncPipe;
      }());
      $__export("AsyncPipe", AsyncPipe);
    }
  };
});

System.register("@angular/common/src/pipes/date_pipe.js", ["@angular/core", "../facade/lang", "./intl", "./invalid_pipe_argument_error"], function($__export) {
  "use strict";
  var Inject,
      LOCALE_ID,
      Pipe,
      NumberWrapper,
      isDate,
      DateFormatter,
      InvalidPipeArgumentError,
      DatePipe;
  function DatePipe_tsickle_Closure_declarations() {
    DatePipe._ALIASES;
    DatePipe.decorators;
    DatePipe.ctorParameters;
    DatePipe.prototype._locale;
  }
  function isBlank(obj) {
    return obj == null || obj === '';
  }
  return {
    setters: [function($__m) {
      Inject = $__m.Inject;
      LOCALE_ID = $__m.LOCALE_ID;
      Pipe = $__m.Pipe;
    }, function($__m) {
      NumberWrapper = $__m.NumberWrapper;
      isDate = $__m.isDate;
    }, function($__m) {
      DateFormatter = $__m.DateFormatter;
    }, function($__m) {
      InvalidPipeArgumentError = $__m.InvalidPipeArgumentError;
    }],
    execute: function() {
      DatePipe = (function() {
        function DatePipe(_locale) {
          this._locale = _locale;
        }
        DatePipe.prototype.transform = function(value, pattern) {
          if (pattern === void 0) {
            pattern = 'mediumDate';
          }
          var date;
          if (isBlank(value))
            return null;
          if (typeof value === 'string') {
            value = value.trim();
          }
          if (isDate(value)) {
            date = value;
          } else if (NumberWrapper.isNumeric(value)) {
            date = new Date(parseFloat(value));
          } else if (typeof value === 'string' && /^(\d{4}-\d{1,2}-\d{1,2})$/.test(value)) {
            var _a = value.split('-').map(function(val) {
              return parseInt(val, 10);
            }),
                y = _a[0],
                m = _a[1],
                d = _a[2];
            date = new Date(y, m - 1, d);
          } else {
            date = new Date(value);
          }
          if (!isDate(date)) {
            throw new InvalidPipeArgumentError(DatePipe, value);
          }
          return DateFormatter.format(date, this._locale, DatePipe._ALIASES[pattern] || pattern);
        };
        DatePipe._ALIASES = {
          'medium': 'yMMMdjms',
          'short': 'yMdjm',
          'fullDate': 'yMMMMEEEEd',
          'longDate': 'yMMMMd',
          'mediumDate': 'yMMMd',
          'shortDate': 'yMd',
          'mediumTime': 'jms',
          'shortTime': 'jm'
        };
        DatePipe.decorators = [{
          type: Pipe,
          args: [{
            name: 'date',
            pure: true
          }]
        }];
        DatePipe.ctorParameters = function() {
          return [{
            type: undefined,
            decorators: [{
              type: Inject,
              args: [LOCALE_ID]
            }]
          }];
        };
        return DatePipe;
      }());
      $__export("DatePipe", DatePipe);
    }
  };
});

System.register("@angular/common/src/localization.js", ["@angular/core"], function($__export) {
  "use strict";
  var __extends,
      Inject,
      Injectable,
      LOCALE_ID,
      NgLocalization,
      NgLocaleLocalization,
      Plural;
  function getPluralCategory(value, cases, ngLocalization) {
    var key = "=" + value;
    if (cases.indexOf(key) > -1) {
      return key;
    }
    key = ngLocalization.getPluralCategory(value);
    if (cases.indexOf(key) > -1) {
      return key;
    }
    if (cases.indexOf('other') > -1) {
      return 'other';
    }
    throw new Error("No plural message found for value \"" + value + "\"");
  }
  function NgLocaleLocalization_tsickle_Closure_declarations() {
    NgLocaleLocalization.decorators;
    NgLocaleLocalization.ctorParameters;
    NgLocaleLocalization.prototype._locale;
  }
  function getPluralCase(locale, nLike) {
    if (typeof nLike === 'string') {
      nLike = parseInt((nLike), 10);
    }
    var n = (nLike);
    var nDecimal = n.toString().replace(/^[^.]*\.?/, '');
    var i = Math.floor(Math.abs(n));
    var v = nDecimal.length;
    var f = parseInt(nDecimal, 10);
    var t = parseInt(n.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;
    var lang = locale.split('-')[0].toLowerCase();
    switch (lang) {
      case 'af':
      case 'asa':
      case 'az':
      case 'bem':
      case 'bez':
      case 'bg':
      case 'brx':
      case 'ce':
      case 'cgg':
      case 'chr':
      case 'ckb':
      case 'ee':
      case 'el':
      case 'eo':
      case 'es':
      case 'eu':
      case 'fo':
      case 'fur':
      case 'gsw':
      case 'ha':
      case 'haw':
      case 'hu':
      case 'jgo':
      case 'jmc':
      case 'ka':
      case 'kk':
      case 'kkj':
      case 'kl':
      case 'ks':
      case 'ksb':
      case 'ky':
      case 'lb':
      case 'lg':
      case 'mas':
      case 'mgo':
      case 'ml':
      case 'mn':
      case 'nb':
      case 'nd':
      case 'ne':
      case 'nn':
      case 'nnh':
      case 'nyn':
      case 'om':
      case 'or':
      case 'os':
      case 'ps':
      case 'rm':
      case 'rof':
      case 'rwk':
      case 'saq':
      case 'seh':
      case 'sn':
      case 'so':
      case 'sq':
      case 'ta':
      case 'te':
      case 'teo':
      case 'tk':
      case 'tr':
      case 'ug':
      case 'uz':
      case 'vo':
      case 'vun':
      case 'wae':
      case 'xog':
        if (n === 1)
          return Plural.One;
        return Plural.Other;
      case 'agq':
      case 'bas':
      case 'cu':
      case 'dav':
      case 'dje':
      case 'dua':
      case 'dyo':
      case 'ebu':
      case 'ewo':
      case 'guz':
      case 'kam':
      case 'khq':
      case 'ki':
      case 'kln':
      case 'kok':
      case 'ksf':
      case 'lrc':
      case 'lu':
      case 'luo':
      case 'luy':
      case 'mer':
      case 'mfe':
      case 'mgh':
      case 'mua':
      case 'mzn':
      case 'nmg':
      case 'nus':
      case 'qu':
      case 'rn':
      case 'rw':
      case 'sbp':
      case 'twq':
      case 'vai':
      case 'yav':
      case 'yue':
      case 'zgh':
      case 'ak':
      case 'ln':
      case 'mg':
      case 'pa':
      case 'ti':
        if (n === Math.floor(n) && n >= 0 && n <= 1)
          return Plural.One;
        return Plural.Other;
      case 'am':
      case 'as':
      case 'bn':
      case 'fa':
      case 'gu':
      case 'hi':
      case 'kn':
      case 'mr':
      case 'zu':
        if (i === 0 || n === 1)
          return Plural.One;
        return Plural.Other;
      case 'ar':
        if (n === 0)
          return Plural.Zero;
        if (n === 1)
          return Plural.One;
        if (n === 2)
          return Plural.Two;
        if (n % 100 === Math.floor(n % 100) && n % 100 >= 3 && n % 100 <= 10)
          return Plural.Few;
        if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 99)
          return Plural.Many;
        return Plural.Other;
      case 'ast':
      case 'ca':
      case 'de':
      case 'en':
      case 'et':
      case 'fi':
      case 'fy':
      case 'gl':
      case 'it':
      case 'nl':
      case 'sv':
      case 'sw':
      case 'ur':
      case 'yi':
        if (i === 1 && v === 0)
          return Plural.One;
        return Plural.Other;
      case 'be':
        if (n % 10 === 1 && !(n % 100 === 11))
          return Plural.One;
        if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14))
          return Plural.Few;
        if (n % 10 === 0 || n % 10 === Math.floor(n % 10) && n % 10 >= 5 && n % 10 <= 9 || n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 14)
          return Plural.Many;
        return Plural.Other;
      case 'br':
        if (n % 10 === 1 && !(n % 100 === 11 || n % 100 === 71 || n % 100 === 91))
          return Plural.One;
        if (n % 10 === 2 && !(n % 100 === 12 || n % 100 === 72 || n % 100 === 92))
          return Plural.Two;
        if (n % 10 === Math.floor(n % 10) && (n % 10 >= 3 && n % 10 <= 4 || n % 10 === 9) && !(n % 100 >= 10 && n % 100 <= 19 || n % 100 >= 70 && n % 100 <= 79 || n % 100 >= 90 && n % 100 <= 99))
          return Plural.Few;
        if (!(n === 0) && n % 1e6 === 0)
          return Plural.Many;
        return Plural.Other;
      case 'bs':
      case 'hr':
      case 'sr':
        if (v === 0 && i % 10 === 1 && !(i % 100 === 11) || f % 10 === 1 && !(f % 100 === 11))
          return Plural.One;
        if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 && !(i % 100 >= 12 && i % 100 <= 14) || f % 10 === Math.floor(f % 10) && f % 10 >= 2 && f % 10 <= 4 && !(f % 100 >= 12 && f % 100 <= 14))
          return Plural.Few;
        return Plural.Other;
      case 'cs':
      case 'sk':
        if (i === 1 && v === 0)
          return Plural.One;
        if (i === Math.floor(i) && i >= 2 && i <= 4 && v === 0)
          return Plural.Few;
        if (!(v === 0))
          return Plural.Many;
        return Plural.Other;
      case 'cy':
        if (n === 0)
          return Plural.Zero;
        if (n === 1)
          return Plural.One;
        if (n === 2)
          return Plural.Two;
        if (n === 3)
          return Plural.Few;
        if (n === 6)
          return Plural.Many;
        return Plural.Other;
      case 'da':
        if (n === 1 || !(t === 0) && (i === 0 || i === 1))
          return Plural.One;
        return Plural.Other;
      case 'dsb':
      case 'hsb':
        if (v === 0 && i % 100 === 1 || f % 100 === 1)
          return Plural.One;
        if (v === 0 && i % 100 === 2 || f % 100 === 2)
          return Plural.Two;
        if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 || f % 100 === Math.floor(f % 100) && f % 100 >= 3 && f % 100 <= 4)
          return Plural.Few;
        return Plural.Other;
      case 'ff':
      case 'fr':
      case 'hy':
      case 'kab':
        if (i === 0 || i === 1)
          return Plural.One;
        return Plural.Other;
      case 'fil':
        if (v === 0 && (i === 1 || i === 2 || i === 3) || v === 0 && !(i % 10 === 4 || i % 10 === 6 || i % 10 === 9) || !(v === 0) && !(f % 10 === 4 || f % 10 === 6 || f % 10 === 9))
          return Plural.One;
        return Plural.Other;
      case 'ga':
        if (n === 1)
          return Plural.One;
        if (n === 2)
          return Plural.Two;
        if (n === Math.floor(n) && n >= 3 && n <= 6)
          return Plural.Few;
        if (n === Math.floor(n) && n >= 7 && n <= 10)
          return Plural.Many;
        return Plural.Other;
      case 'gd':
        if (n === 1 || n === 11)
          return Plural.One;
        if (n === 2 || n === 12)
          return Plural.Two;
        if (n === Math.floor(n) && (n >= 3 && n <= 10 || n >= 13 && n <= 19))
          return Plural.Few;
        return Plural.Other;
      case 'gv':
        if (v === 0 && i % 10 === 1)
          return Plural.One;
        if (v === 0 && i % 10 === 2)
          return Plural.Two;
        if (v === 0 && (i % 100 === 0 || i % 100 === 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80))
          return Plural.Few;
        if (!(v === 0))
          return Plural.Many;
        return Plural.Other;
      case 'he':
        if (i === 1 && v === 0)
          return Plural.One;
        if (i === 2 && v === 0)
          return Plural.Two;
        if (v === 0 && !(n >= 0 && n <= 10) && n % 10 === 0)
          return Plural.Many;
        return Plural.Other;
      case 'is':
        if (t === 0 && i % 10 === 1 && !(i % 100 === 11) || !(t === 0))
          return Plural.One;
        return Plural.Other;
      case 'ksh':
        if (n === 0)
          return Plural.Zero;
        if (n === 1)
          return Plural.One;
        return Plural.Other;
      case 'kw':
      case 'naq':
      case 'se':
      case 'smn':
        if (n === 1)
          return Plural.One;
        if (n === 2)
          return Plural.Two;
        return Plural.Other;
      case 'lag':
        if (n === 0)
          return Plural.Zero;
        if ((i === 0 || i === 1) && !(n === 0))
          return Plural.One;
        return Plural.Other;
      case 'lt':
        if (n % 10 === 1 && !(n % 100 >= 11 && n % 100 <= 19))
          return Plural.One;
        if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 9 && !(n % 100 >= 11 && n % 100 <= 19))
          return Plural.Few;
        if (!(f === 0))
          return Plural.Many;
        return Plural.Other;
      case 'lv':
      case 'prg':
        if (n % 10 === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19 || v === 2 && f % 100 === Math.floor(f % 100) && f % 100 >= 11 && f % 100 <= 19)
          return Plural.Zero;
        if (n % 10 === 1 && !(n % 100 === 11) || v === 2 && f % 10 === 1 && !(f % 100 === 11) || !(v === 2) && f % 10 === 1)
          return Plural.One;
        return Plural.Other;
      case 'mk':
        if (v === 0 && i % 10 === 1 || f % 10 === 1)
          return Plural.One;
        return Plural.Other;
      case 'mt':
        if (n === 1)
          return Plural.One;
        if (n === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 2 && n % 100 <= 10)
          return Plural.Few;
        if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19)
          return Plural.Many;
        return Plural.Other;
      case 'pl':
        if (i === 1 && v === 0)
          return Plural.One;
        if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 && !(i % 100 >= 12 && i % 100 <= 14))
          return Plural.Few;
        if (v === 0 && !(i === 1) && i % 10 === Math.floor(i % 10) && i % 10 >= 0 && i % 10 <= 1 || v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 || v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 12 && i % 100 <= 14)
          return Plural.Many;
        return Plural.Other;
      case 'pt':
        if (n === Math.floor(n) && n >= 0 && n <= 2 && !(n === 2))
          return Plural.One;
        return Plural.Other;
      case 'ro':
        if (i === 1 && v === 0)
          return Plural.One;
        if (!(v === 0) || n === 0 || !(n === 1) && n % 100 === Math.floor(n % 100) && n % 100 >= 1 && n % 100 <= 19)
          return Plural.Few;
        return Plural.Other;
      case 'ru':
      case 'uk':
        if (v === 0 && i % 10 === 1 && !(i % 100 === 11))
          return Plural.One;
        if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 && !(i % 100 >= 12 && i % 100 <= 14))
          return Plural.Few;
        if (v === 0 && i % 10 === 0 || v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 || v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 11 && i % 100 <= 14)
          return Plural.Many;
        return Plural.Other;
      case 'shi':
        if (i === 0 || n === 1)
          return Plural.One;
        if (n === Math.floor(n) && n >= 2 && n <= 10)
          return Plural.Few;
        return Plural.Other;
      case 'si':
        if (n === 0 || n === 1 || i === 0 && f === 1)
          return Plural.One;
        return Plural.Other;
      case 'sl':
        if (v === 0 && i % 100 === 1)
          return Plural.One;
        if (v === 0 && i % 100 === 2)
          return Plural.Two;
        if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 || !(v === 0))
          return Plural.Few;
        return Plural.Other;
      case 'tzm':
        if (n === Math.floor(n) && n >= 0 && n <= 1 || n === Math.floor(n) && n >= 11 && n <= 99)
          return Plural.One;
        return Plural.Other;
      default:
        return Plural.Other;
    }
  }
  $__export("getPluralCategory", getPluralCategory);
  $__export("getPluralCase", getPluralCase);
  return {
    setters: [function($__m) {
      Inject = $__m.Inject;
      Injectable = $__m.Injectable;
      LOCALE_ID = $__m.LOCALE_ID;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      NgLocalization = (function() {
        function NgLocalization() {}
        NgLocalization.prototype.getPluralCategory = function(value) {};
        return NgLocalization;
      }());
      $__export("NgLocalization", NgLocalization);
      NgLocaleLocalization = (function(_super) {
        __extends(NgLocaleLocalization, _super);
        function NgLocaleLocalization(_locale) {
          _super.call(this);
          this._locale = _locale;
        }
        NgLocaleLocalization.prototype.getPluralCategory = function(value) {
          var plural = getPluralCase(this._locale, value);
          switch (plural) {
            case Plural.Zero:
              return 'zero';
            case Plural.One:
              return 'one';
            case Plural.Two:
              return 'two';
            case Plural.Few:
              return 'few';
            case Plural.Many:
              return 'many';
            default:
              return 'other';
          }
        };
        NgLocaleLocalization.decorators = [{type: Injectable}];
        NgLocaleLocalization.ctorParameters = function() {
          return [{
            type: undefined,
            decorators: [{
              type: Inject,
              args: [LOCALE_ID]
            }]
          }];
        };
        return NgLocaleLocalization;
      }(NgLocalization));
      $__export("NgLocaleLocalization", NgLocaleLocalization);
      Plural = {};
      $__export("Plural", Plural);
      Plural.Zero = 0;
      Plural.One = 1;
      Plural.Two = 2;
      Plural.Few = 3;
      Plural.Many = 4;
      Plural.Other = 5;
      Plural[Plural.Zero] = "Zero";
      Plural[Plural.One] = "One";
      Plural[Plural.Two] = "Two";
      Plural[Plural.Few] = "Few";
      Plural[Plural.Many] = "Many";
      Plural[Plural.Other] = "Other";
    }
  };
});

System.register("@angular/common/src/pipes/i18n_plural_pipe.js", ["@angular/core", "../facade/lang", "../localization", "./invalid_pipe_argument_error"], function($__export) {
  "use strict";
  var Pipe,
      isBlank,
      NgLocalization,
      getPluralCategory,
      InvalidPipeArgumentError,
      _INTERPOLATION_REGEXP,
      I18nPluralPipe;
  function I18nPluralPipe_tsickle_Closure_declarations() {
    I18nPluralPipe.decorators;
    I18nPluralPipe.ctorParameters;
    I18nPluralPipe.prototype._localization;
  }
  return {
    setters: [function($__m) {
      Pipe = $__m.Pipe;
    }, function($__m) {
      isBlank = $__m.isBlank;
    }, function($__m) {
      NgLocalization = $__m.NgLocalization;
      getPluralCategory = $__m.getPluralCategory;
    }, function($__m) {
      InvalidPipeArgumentError = $__m.InvalidPipeArgumentError;
    }],
    execute: function() {
      _INTERPOLATION_REGEXP = /#/g;
      I18nPluralPipe = (function() {
        function I18nPluralPipe(_localization) {
          this._localization = _localization;
        }
        I18nPluralPipe.prototype.transform = function(value, pluralMap) {
          if (isBlank(value))
            return '';
          if ((typeof pluralMap === 'undefined' ? 'undefined' : $traceurRuntime.typeof(pluralMap)) !== 'object' || pluralMap === null) {
            throw new InvalidPipeArgumentError(I18nPluralPipe, pluralMap);
          }
          var key = getPluralCategory(value, Object.keys(pluralMap), this._localization);
          return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
        };
        I18nPluralPipe.decorators = [{
          type: Pipe,
          args: [{
            name: 'i18nPlural',
            pure: true
          }]
        }];
        I18nPluralPipe.ctorParameters = function() {
          return [{type: NgLocalization}];
        };
        return I18nPluralPipe;
      }());
      $__export("I18nPluralPipe", I18nPluralPipe);
    }
  };
});

System.register("@angular/common/src/pipes/i18n_select_pipe.js", ["@angular/core", "./invalid_pipe_argument_error"], function($__export) {
  "use strict";
  var Pipe,
      InvalidPipeArgumentError,
      I18nSelectPipe;
  function I18nSelectPipe_tsickle_Closure_declarations() {
    I18nSelectPipe.decorators;
    I18nSelectPipe.ctorParameters;
  }
  return {
    setters: [function($__m) {
      Pipe = $__m.Pipe;
    }, function($__m) {
      InvalidPipeArgumentError = $__m.InvalidPipeArgumentError;
    }],
    execute: function() {
      I18nSelectPipe = (function() {
        function I18nSelectPipe() {}
        I18nSelectPipe.prototype.transform = function(value, mapping) {
          if (value == null)
            return '';
          if ((typeof mapping === 'undefined' ? 'undefined' : $traceurRuntime.typeof(mapping)) !== 'object' || typeof value !== 'string') {
            throw new InvalidPipeArgumentError(I18nSelectPipe, mapping);
          }
          if (mapping.hasOwnProperty(value)) {
            return mapping[value];
          }
          if (mapping.hasOwnProperty('other')) {
            return mapping['other'];
          }
          return '';
        };
        I18nSelectPipe.decorators = [{
          type: Pipe,
          args: [{
            name: 'i18nSelect',
            pure: true
          }]
        }];
        I18nSelectPipe.ctorParameters = function() {
          return [];
        };
        return I18nSelectPipe;
      }());
      $__export("I18nSelectPipe", I18nSelectPipe);
    }
  };
});

System.register("@angular/common/src/pipes/json_pipe.js", ["@angular/core"], function($__export) {
  "use strict";
  var Pipe,
      JsonPipe;
  function JsonPipe_tsickle_Closure_declarations() {
    JsonPipe.decorators;
    JsonPipe.ctorParameters;
  }
  return {
    setters: [function($__m) {
      Pipe = $__m.Pipe;
    }],
    execute: function() {
      JsonPipe = (function() {
        function JsonPipe() {}
        JsonPipe.prototype.transform = function(value) {
          return JSON.stringify(value, null, 2);
        };
        JsonPipe.decorators = [{
          type: Pipe,
          args: [{
            name: 'json',
            pure: false
          }]
        }];
        JsonPipe.ctorParameters = function() {
          return [];
        };
        return JsonPipe;
      }());
      $__export("JsonPipe", JsonPipe);
    }
  };
});

System.register("@angular/common/src/pipes/lowercase_pipe.js", ["@angular/core", "../facade/lang", "./invalid_pipe_argument_error"], function($__export) {
  "use strict";
  var Pipe,
      isBlank,
      InvalidPipeArgumentError,
      LowerCasePipe;
  function LowerCasePipe_tsickle_Closure_declarations() {
    LowerCasePipe.decorators;
    LowerCasePipe.ctorParameters;
  }
  return {
    setters: [function($__m) {
      Pipe = $__m.Pipe;
    }, function($__m) {
      isBlank = $__m.isBlank;
    }, function($__m) {
      InvalidPipeArgumentError = $__m.InvalidPipeArgumentError;
    }],
    execute: function() {
      LowerCasePipe = (function() {
        function LowerCasePipe() {}
        LowerCasePipe.prototype.transform = function(value) {
          if (isBlank(value))
            return value;
          if (typeof value !== 'string') {
            throw new InvalidPipeArgumentError(LowerCasePipe, value);
          }
          return value.toLowerCase();
        };
        LowerCasePipe.decorators = [{
          type: Pipe,
          args: [{name: 'lowercase'}]
        }];
        LowerCasePipe.ctorParameters = function() {
          return [];
        };
        return LowerCasePipe;
      }());
      $__export("LowerCasePipe", LowerCasePipe);
    }
  };
});

System.register("@angular/common/src/pipes/intl.js", [], function($__export) {
  "use strict";
  var NumberFormatStyle,
      NumberFormatter,
      DATE_FORMATS_SPLIT,
      PATTERN_ALIASES,
      DATE_FORMATS,
      DATE_FORMATTER_CACHE,
      DateFormatter;
  function digitModifier(inner) {
    return function(date, locale) {
      var result = inner(date, locale);
      return result.length == 1 ? '0' + result : result;
    };
  }
  function hourClockExtractor(inner) {
    return function(date, locale) {
      return inner(date, locale).split(' ')[1];
    };
  }
  function hourExtractor(inner) {
    return function(date, locale) {
      return inner(date, locale).split(' ')[0];
    };
  }
  function intlDateFormat(date, locale, options) {
    return new Intl.DateTimeFormat(locale, options).format(date).replace(/[\u200e\u200f]/g, '');
  }
  function timeZoneGetter(timezone) {
    var options = {
      hour: '2-digit',
      hour12: false,
      timeZoneName: timezone
    };
    return function(date, locale) {
      var result = intlDateFormat(date, locale, options);
      return result ? result.substring(3) : '';
    };
  }
  function hour12Modify(options, value) {
    options.hour12 = value;
    return options;
  }
  function digitCondition(prop, len) {
    var result = {};
    result[prop] = len === 2 ? '2-digit' : 'numeric';
    return result;
  }
  function nameCondition(prop, len) {
    var result = {};
    if (len < 4) {
      result[prop] = len > 1 ? 'short' : 'narrow';
    } else {
      result[prop] = 'long';
    }
    return result;
  }
  function combine(options) {
    return (_a = ((Object))).assign.apply(_a, [{}].concat(options));
    var _a;
  }
  function datePartGetterFactory(ret) {
    return function(date, locale) {
      return intlDateFormat(date, locale, ret);
    };
  }
  function dateFormatter(format, date, locale) {
    var fn = PATTERN_ALIASES[format];
    if (fn)
      return fn(date, locale);
    var cacheKey = format;
    var parts = DATE_FORMATTER_CACHE.get(cacheKey);
    if (!parts) {
      parts = [];
      var match = void 0;
      DATE_FORMATS_SPLIT.exec(format);
      while (format) {
        match = DATE_FORMATS_SPLIT.exec(format);
        if (match) {
          parts = parts.concat(match.slice(1));
          format = parts.pop();
        } else {
          parts.push(format);
          format = null;
        }
      }
      DATE_FORMATTER_CACHE.set(cacheKey, parts);
    }
    return parts.reduce(function(text, part) {
      var fn = DATE_FORMATS[part];
      return text + (fn ? fn(date, locale) : partToTime(part));
    }, '');
  }
  function partToTime(part) {
    return part === '\'\'' ? '\'' : part.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
  }
  return {
    setters: [],
    execute: function() {
      NumberFormatStyle = {};
      $__export("NumberFormatStyle", NumberFormatStyle);
      NumberFormatStyle.Decimal = 0;
      NumberFormatStyle.Percent = 1;
      NumberFormatStyle.Currency = 2;
      NumberFormatStyle[NumberFormatStyle.Decimal] = "Decimal";
      NumberFormatStyle[NumberFormatStyle.Percent] = "Percent";
      NumberFormatStyle[NumberFormatStyle.Currency] = "Currency";
      NumberFormatter = (function() {
        function NumberFormatter() {}
        NumberFormatter.format = function(num, locale, style, _a) {
          var _b = _a === void 0 ? {} : _a,
              minimumIntegerDigits = _b.minimumIntegerDigits,
              minimumFractionDigits = _b.minimumFractionDigits,
              maximumFractionDigits = _b.maximumFractionDigits,
              currency = _b.currency,
              _c = _b.currencyAsSymbol,
              currencyAsSymbol = _c === void 0 ? false : _c;
          var options = {
            minimumIntegerDigits: minimumIntegerDigits,
            minimumFractionDigits: minimumFractionDigits,
            maximumFractionDigits: maximumFractionDigits,
            style: NumberFormatStyle[style].toLowerCase()
          };
          if (style == NumberFormatStyle.Currency) {
            options.currency = currency;
            options.currencyDisplay = currencyAsSymbol ? 'symbol' : 'code';
          }
          return new Intl.NumberFormat(locale, options).format(num);
        };
        return NumberFormatter;
      }());
      $__export("NumberFormatter", NumberFormatter);
      DATE_FORMATS_SPLIT = /((?:[^yMLdHhmsazZEwGjJ']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|L+|d+|H+|h+|J+|j+|m+|s+|a|z|Z|G+|w+))(.*)/;
      PATTERN_ALIASES = {
        'yMMMdjms': datePartGetterFactory(combine([digitCondition('year', 1), nameCondition('month', 3), digitCondition('day', 1), digitCondition('hour', 1), digitCondition('minute', 1), digitCondition('second', 1)])),
        'yMdjm': datePartGetterFactory(combine([digitCondition('year', 1), digitCondition('month', 1), digitCondition('day', 1), digitCondition('hour', 1), digitCondition('minute', 1)])),
        'yMMMMEEEEd': datePartGetterFactory(combine([digitCondition('year', 1), nameCondition('month', 4), nameCondition('weekday', 4), digitCondition('day', 1)])),
        'yMMMMd': datePartGetterFactory(combine([digitCondition('year', 1), nameCondition('month', 4), digitCondition('day', 1)])),
        'yMMMd': datePartGetterFactory(combine([digitCondition('year', 1), nameCondition('month', 3), digitCondition('day', 1)])),
        'yMd': datePartGetterFactory(combine([digitCondition('year', 1), digitCondition('month', 1), digitCondition('day', 1)])),
        'jms': datePartGetterFactory(combine([digitCondition('hour', 1), digitCondition('second', 1), digitCondition('minute', 1)])),
        'jm': datePartGetterFactory(combine([digitCondition('hour', 1), digitCondition('minute', 1)]))
      };
      DATE_FORMATS = {
        'yyyy': datePartGetterFactory(digitCondition('year', 4)),
        'yy': datePartGetterFactory(digitCondition('year', 2)),
        'y': datePartGetterFactory(digitCondition('year', 1)),
        'MMMM': datePartGetterFactory(nameCondition('month', 4)),
        'MMM': datePartGetterFactory(nameCondition('month', 3)),
        'MM': datePartGetterFactory(digitCondition('month', 2)),
        'M': datePartGetterFactory(digitCondition('month', 1)),
        'LLLL': datePartGetterFactory(nameCondition('month', 4)),
        'L': datePartGetterFactory(nameCondition('month', 1)),
        'dd': datePartGetterFactory(digitCondition('day', 2)),
        'd': datePartGetterFactory(digitCondition('day', 1)),
        'HH': digitModifier(hourExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 2), false)))),
        'H': hourExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 1), false))),
        'hh': digitModifier(hourExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 2), true)))),
        'h': hourExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 1), true))),
        'jj': datePartGetterFactory(digitCondition('hour', 2)),
        'j': datePartGetterFactory(digitCondition('hour', 1)),
        'mm': digitModifier(datePartGetterFactory(digitCondition('minute', 2))),
        'm': datePartGetterFactory(digitCondition('minute', 1)),
        'ss': digitModifier(datePartGetterFactory(digitCondition('second', 2))),
        's': datePartGetterFactory(digitCondition('second', 1)),
        'sss': datePartGetterFactory(digitCondition('second', 3)),
        'EEEE': datePartGetterFactory(nameCondition('weekday', 4)),
        'EEE': datePartGetterFactory(nameCondition('weekday', 3)),
        'EE': datePartGetterFactory(nameCondition('weekday', 2)),
        'E': datePartGetterFactory(nameCondition('weekday', 1)),
        'a': hourClockExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 1), true))),
        'Z': timeZoneGetter('short'),
        'z': timeZoneGetter('long'),
        'ww': datePartGetterFactory({}),
        'w': datePartGetterFactory({}),
        'G': datePartGetterFactory(nameCondition('era', 1)),
        'GG': datePartGetterFactory(nameCondition('era', 2)),
        'GGG': datePartGetterFactory(nameCondition('era', 3)),
        'GGGG': datePartGetterFactory(nameCondition('era', 4))
      };
      DATE_FORMATTER_CACHE = new Map();
      DateFormatter = (function() {
        function DateFormatter() {}
        DateFormatter.format = function(date, locale, pattern) {
          return dateFormatter(pattern, date, locale);
        };
        return DateFormatter;
      }());
      $__export("DateFormatter", DateFormatter);
    }
  };
});

System.register("@angular/common/src/pipes/number_pipe.js", ["@angular/core", "../facade/lang", "./intl", "./invalid_pipe_argument_error"], function($__export) {
  "use strict";
  var Inject,
      LOCALE_ID,
      Pipe,
      NumberWrapper,
      isBlank,
      isPresent,
      NumberFormatStyle,
      NumberFormatter,
      InvalidPipeArgumentError,
      _NUMBER_FORMAT_REGEXP,
      DecimalPipe,
      PercentPipe,
      CurrencyPipe;
  function formatNumber(pipe, locale, value, style, digits, currency, currencyAsSymbol) {
    if (currency === void 0) {
      currency = null;
    }
    if (currencyAsSymbol === void 0) {
      currencyAsSymbol = false;
    }
    if (isBlank(value))
      return null;
    value = typeof value === 'string' && NumberWrapper.isNumeric(value) ? +value : value;
    if (typeof value !== 'number') {
      throw new InvalidPipeArgumentError(pipe, value);
    }
    var minInt;
    var minFraction;
    var maxFraction;
    if (style !== NumberFormatStyle.Currency) {
      minInt = 1;
      minFraction = 0;
      maxFraction = 3;
    }
    if (digits) {
      var parts = digits.match(_NUMBER_FORMAT_REGEXP);
      if (parts === null) {
        throw new Error(digits + " is not a valid digit info for number pipes");
      }
      if (isPresent(parts[1])) {
        minInt = NumberWrapper.parseIntAutoRadix(parts[1]);
      }
      if (isPresent(parts[3])) {
        minFraction = NumberWrapper.parseIntAutoRadix(parts[3]);
      }
      if (isPresent(parts[5])) {
        maxFraction = NumberWrapper.parseIntAutoRadix(parts[5]);
      }
    }
    return NumberFormatter.format((value), locale, style, {
      minimumIntegerDigits: minInt,
      minimumFractionDigits: minFraction,
      maximumFractionDigits: maxFraction,
      currency: currency,
      currencyAsSymbol: currencyAsSymbol
    });
  }
  function DecimalPipe_tsickle_Closure_declarations() {
    DecimalPipe.decorators;
    DecimalPipe.ctorParameters;
    DecimalPipe.prototype._locale;
  }
  function PercentPipe_tsickle_Closure_declarations() {
    PercentPipe.decorators;
    PercentPipe.ctorParameters;
    PercentPipe.prototype._locale;
  }
  function CurrencyPipe_tsickle_Closure_declarations() {
    CurrencyPipe.decorators;
    CurrencyPipe.ctorParameters;
    CurrencyPipe.prototype._locale;
  }
  return {
    setters: [function($__m) {
      Inject = $__m.Inject;
      LOCALE_ID = $__m.LOCALE_ID;
      Pipe = $__m.Pipe;
    }, function($__m) {
      NumberWrapper = $__m.NumberWrapper;
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
    }, function($__m) {
      NumberFormatStyle = $__m.NumberFormatStyle;
      NumberFormatter = $__m.NumberFormatter;
    }, function($__m) {
      InvalidPipeArgumentError = $__m.InvalidPipeArgumentError;
    }],
    execute: function() {
      _NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
      DecimalPipe = (function() {
        function DecimalPipe(_locale) {
          this._locale = _locale;
        }
        DecimalPipe.prototype.transform = function(value, digits) {
          if (digits === void 0) {
            digits = null;
          }
          return formatNumber(DecimalPipe, this._locale, value, NumberFormatStyle.Decimal, digits);
        };
        DecimalPipe.decorators = [{
          type: Pipe,
          args: [{name: 'number'}]
        }];
        DecimalPipe.ctorParameters = function() {
          return [{
            type: undefined,
            decorators: [{
              type: Inject,
              args: [LOCALE_ID]
            }]
          }];
        };
        return DecimalPipe;
      }());
      $__export("DecimalPipe", DecimalPipe);
      PercentPipe = (function() {
        function PercentPipe(_locale) {
          this._locale = _locale;
        }
        PercentPipe.prototype.transform = function(value, digits) {
          if (digits === void 0) {
            digits = null;
          }
          return formatNumber(PercentPipe, this._locale, value, NumberFormatStyle.Percent, digits);
        };
        PercentPipe.decorators = [{
          type: Pipe,
          args: [{name: 'percent'}]
        }];
        PercentPipe.ctorParameters = function() {
          return [{
            type: undefined,
            decorators: [{
              type: Inject,
              args: [LOCALE_ID]
            }]
          }];
        };
        return PercentPipe;
      }());
      $__export("PercentPipe", PercentPipe);
      CurrencyPipe = (function() {
        function CurrencyPipe(_locale) {
          this._locale = _locale;
        }
        CurrencyPipe.prototype.transform = function(value, currencyCode, symbolDisplay, digits) {
          if (currencyCode === void 0) {
            currencyCode = 'USD';
          }
          if (symbolDisplay === void 0) {
            symbolDisplay = false;
          }
          if (digits === void 0) {
            digits = null;
          }
          return formatNumber(CurrencyPipe, this._locale, value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
        };
        CurrencyPipe.decorators = [{
          type: Pipe,
          args: [{name: 'currency'}]
        }];
        CurrencyPipe.ctorParameters = function() {
          return [{
            type: undefined,
            decorators: [{
              type: Inject,
              args: [LOCALE_ID]
            }]
          }];
        };
        return CurrencyPipe;
      }());
      $__export("CurrencyPipe", CurrencyPipe);
    }
  };
});

System.register("@angular/common/src/pipes/slice_pipe.js", ["@angular/core", "../facade/lang", "./invalid_pipe_argument_error"], function($__export) {
  "use strict";
  var Pipe,
      isBlank,
      InvalidPipeArgumentError,
      SlicePipe;
  function SlicePipe_tsickle_Closure_declarations() {
    SlicePipe.decorators;
    SlicePipe.ctorParameters;
  }
  return {
    setters: [function($__m) {
      Pipe = $__m.Pipe;
    }, function($__m) {
      isBlank = $__m.isBlank;
    }, function($__m) {
      InvalidPipeArgumentError = $__m.InvalidPipeArgumentError;
    }],
    execute: function() {
      SlicePipe = (function() {
        function SlicePipe() {}
        SlicePipe.prototype.transform = function(value, start, end) {
          if (isBlank(value))
            return value;
          if (!this.supports(value)) {
            throw new InvalidPipeArgumentError(SlicePipe, value);
          }
          return value.slice(start, end);
        };
        SlicePipe.prototype.supports = function(obj) {
          return typeof obj === 'string' || Array.isArray(obj);
        };
        SlicePipe.decorators = [{
          type: Pipe,
          args: [{
            name: 'slice',
            pure: false
          }]
        }];
        SlicePipe.ctorParameters = function() {
          return [];
        };
        return SlicePipe;
      }());
      $__export("SlicePipe", SlicePipe);
    }
  };
});

System.register("@angular/common/src/facade/errors.js", [], function($__export) {
  "use strict";
  var __extends,
      BaseError,
      WrappedError;
  function unimplemented() {
    throw new Error('unimplemented');
  }
  function BaseError_tsickle_Closure_declarations() {
    BaseError.prototype._nativeError;
  }
  function WrappedError_tsickle_Closure_declarations() {
    WrappedError.prototype.originalError;
  }
  $__export("unimplemented", unimplemented);
  return {
    setters: [],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      BaseError = (function(_super) {
        __extends(BaseError, _super);
        function BaseError(message) {
          _super.call(this, message);
          var nativeError = new Error(message);
          this._nativeError = nativeError;
        }
        Object.defineProperty(BaseError.prototype, "message", {
          get: function() {
            return this._nativeError.message;
          },
          set: function(message) {
            this._nativeError.message = message;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(BaseError.prototype, "name", {
          get: function() {
            return this._nativeError.name;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(BaseError.prototype, "stack", {
          get: function() {
            return ((this._nativeError)).stack;
          },
          set: function(value) {
            ((this._nativeError)).stack = value;
          },
          enumerable: true,
          configurable: true
        });
        BaseError.prototype.toString = function() {
          return this._nativeError.toString();
        };
        return BaseError;
      }(Error));
      $__export("BaseError", BaseError);
      WrappedError = (function(_super) {
        __extends(WrappedError, _super);
        function WrappedError(message, error) {
          _super.call(this, message + " caused by: " + (error instanceof Error ? error.message : error));
          this.originalError = error;
        }
        Object.defineProperty(WrappedError.prototype, "stack", {
          get: function() {
            return (((this.originalError instanceof Error ? this.originalError : this._nativeError))).stack;
          },
          enumerable: true,
          configurable: true
        });
        return WrappedError;
      }(BaseError));
      $__export("WrappedError", WrappedError);
    }
  };
});

System.register("@angular/common/src/facade/lang.js", [], function($__export) {
  "use strict";
  var globalScope,
      _global,
      STRING_MAP_PROTO,
      NumberWrapper,
      _symbolIterator;
  function scheduleMicroTask(fn) {
    Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
  }
  function getTypeNameForDebugging(type) {
    return type['name'] || (typeof type === 'undefined' ? 'undefined' : $traceurRuntime.typeof(type));
  }
  function isPresent(obj) {
    return obj != null;
  }
  function isBlank(obj) {
    return obj == null;
  }
  function isStrictStringMap(obj) {
    return (typeof obj === 'undefined' ? 'undefined' : $traceurRuntime.typeof(obj)) === 'object' && obj !== null && Object.getPrototypeOf(obj) === STRING_MAP_PROTO;
  }
  function isDate(obj) {
    return obj instanceof Date && !isNaN(obj.valueOf());
  }
  function stringify(token) {
    if (typeof token === 'string') {
      return token;
    }
    if (token == null) {
      return '' + token;
    }
    if (token.overriddenName) {
      return "" + token.overriddenName;
    }
    if (token.name) {
      return "" + token.name;
    }
    var res = token.toString();
    var newLineIndex = res.indexOf('\n');
    return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
  }
  function looseIdentical(a, b) {
    return a === b || typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);
  }
  function isJsObject(o) {
    return o !== null && (typeof o === 'function' || (typeof o === 'undefined' ? 'undefined' : $traceurRuntime.typeof(o)) === 'object');
  }
  function print(obj) {
    console.log(obj);
  }
  function warn(obj) {
    console.warn(obj);
  }
  function setValueOnPath(global, path, value) {
    var parts = path.split('.');
    var obj = global;
    while (parts.length > 1) {
      var name_1 = parts.shift();
      if (obj.hasOwnProperty(name_1) && obj[name_1] != null) {
        obj = obj[name_1];
      } else {
        obj = obj[name_1] = {};
      }
    }
    if (obj === undefined || obj === null) {
      obj = {};
    }
    obj[parts.shift()] = value;
  }
  function getSymbolIterator() {
    if (!_symbolIterator) {
      if (((globalScope)).Symbol && Symbol.iterator) {
        _symbolIterator = Symbol.iterator;
      } else {
        var keys = Object.getOwnPropertyNames(Map.prototype);
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (key !== 'entries' && key !== 'size' && ((Map)).prototype[key] === Map.prototype['entries']) {
            _symbolIterator = key;
          }
        }
      }
    }
    return _symbolIterator;
  }
  function isPrimitive(obj) {
    return !isJsObject(obj);
  }
  function escapeRegExp(s) {
    return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }
  $__export("scheduleMicroTask", scheduleMicroTask);
  $__export("getTypeNameForDebugging", getTypeNameForDebugging);
  $__export("isPresent", isPresent);
  $__export("isBlank", isBlank);
  $__export("isStrictStringMap", isStrictStringMap);
  $__export("isDate", isDate);
  $__export("stringify", stringify);
  $__export("looseIdentical", looseIdentical);
  $__export("isJsObject", isJsObject);
  $__export("print", print);
  $__export("warn", warn);
  $__export("setValueOnPath", setValueOnPath);
  $__export("getSymbolIterator", getSymbolIterator);
  $__export("isPrimitive", isPrimitive);
  $__export("escapeRegExp", escapeRegExp);
  return {
    setters: [],
    execute: function() {
      if (typeof window === 'undefined') {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
          globalScope = (self);
        } else {
          globalScope = (global);
        }
      } else {
        globalScope = (window);
      }
      _global = globalScope;
      $__export("global", _global);
      _global.assert = function assert(condition) {};
      STRING_MAP_PROTO = Object.getPrototypeOf({});
      NumberWrapper = (function() {
        function NumberWrapper() {}
        NumberWrapper.parseIntAutoRadix = function(text) {
          var result = parseInt(text);
          if (isNaN(result)) {
            throw new Error('Invalid integer literal when parsing ' + text);
          }
          return result;
        };
        NumberWrapper.isNumeric = function(value) {
          return !isNaN(value - parseFloat(value));
        };
        return NumberWrapper;
      }());
      $__export("NumberWrapper", NumberWrapper);
      _symbolIterator = null;
    }
  };
});

System.register("@angular/common/src/pipes/invalid_pipe_argument_error.js", ["../facade/errors", "../facade/lang"], function($__export) {
  "use strict";
  var __extends,
      BaseError,
      stringify,
      InvalidPipeArgumentError;
  return {
    setters: [function($__m) {
      BaseError = $__m.BaseError;
    }, function($__m) {
      stringify = $__m.stringify;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      InvalidPipeArgumentError = (function(_super) {
        __extends(InvalidPipeArgumentError, _super);
        function InvalidPipeArgumentError(type, value) {
          _super.call(this, "Invalid argument '" + value + "' for pipe '" + stringify(type) + "'");
        }
        return InvalidPipeArgumentError;
      }(BaseError));
      $__export("InvalidPipeArgumentError", InvalidPipeArgumentError);
    }
  };
});

System.register("@angular/common/src/pipes/uppercase_pipe.js", ["@angular/core", "../facade/lang", "./invalid_pipe_argument_error"], function($__export) {
  "use strict";
  var Pipe,
      isBlank,
      InvalidPipeArgumentError,
      UpperCasePipe;
  function UpperCasePipe_tsickle_Closure_declarations() {
    UpperCasePipe.decorators;
    UpperCasePipe.ctorParameters;
  }
  return {
    setters: [function($__m) {
      Pipe = $__m.Pipe;
    }, function($__m) {
      isBlank = $__m.isBlank;
    }, function($__m) {
      InvalidPipeArgumentError = $__m.InvalidPipeArgumentError;
    }],
    execute: function() {
      UpperCasePipe = (function() {
        function UpperCasePipe() {}
        UpperCasePipe.prototype.transform = function(value) {
          if (isBlank(value))
            return value;
          if (typeof value !== 'string') {
            throw new InvalidPipeArgumentError(UpperCasePipe, value);
          }
          return value.toUpperCase();
        };
        UpperCasePipe.decorators = [{
          type: Pipe,
          args: [{name: 'uppercase'}]
        }];
        UpperCasePipe.ctorParameters = function() {
          return [];
        };
        return UpperCasePipe;
      }());
      $__export("UpperCasePipe", UpperCasePipe);
    }
  };
});

System.register("@angular/common/src/pipes/index.js", ["./async_pipe", "./date_pipe", "./i18n_plural_pipe", "./i18n_select_pipe", "./json_pipe", "./lowercase_pipe", "./number_pipe", "./slice_pipe", "./uppercase_pipe"], function($__export) {
  "use strict";
  var AsyncPipe,
      DatePipe,
      I18nPluralPipe,
      I18nSelectPipe,
      JsonPipe,
      LowerCasePipe,
      CurrencyPipe,
      DecimalPipe,
      PercentPipe,
      SlicePipe,
      UpperCasePipe,
      COMMON_PIPES;
  return {
    setters: [function($__m) {
      AsyncPipe = $__m.AsyncPipe;
    }, function($__m) {
      DatePipe = $__m.DatePipe;
    }, function($__m) {
      I18nPluralPipe = $__m.I18nPluralPipe;
    }, function($__m) {
      I18nSelectPipe = $__m.I18nSelectPipe;
    }, function($__m) {
      JsonPipe = $__m.JsonPipe;
    }, function($__m) {
      LowerCasePipe = $__m.LowerCasePipe;
    }, function($__m) {
      CurrencyPipe = $__m.CurrencyPipe;
      DecimalPipe = $__m.DecimalPipe;
      PercentPipe = $__m.PercentPipe;
    }, function($__m) {
      SlicePipe = $__m.SlicePipe;
    }, function($__m) {
      UpperCasePipe = $__m.UpperCasePipe;
    }],
    execute: function() {
      $__export("AsyncPipe", AsyncPipe), $__export("CurrencyPipe", CurrencyPipe), $__export("DatePipe", DatePipe), $__export("DecimalPipe", DecimalPipe), $__export("I18nPluralPipe", I18nPluralPipe), $__export("I18nSelectPipe", I18nSelectPipe), $__export("JsonPipe", JsonPipe), $__export("LowerCasePipe", LowerCasePipe), $__export("PercentPipe", PercentPipe), $__export("SlicePipe", SlicePipe), $__export("UpperCasePipe", UpperCasePipe);
      COMMON_PIPES = [AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, CurrencyPipe, DatePipe, I18nPluralPipe, I18nSelectPipe];
      $__export("COMMON_PIPES", COMMON_PIPES);
    }
  };
});

System.register("@angular/common/src/version.js", ["@angular/core"], function($__export) {
  "use strict";
  var Version,
      VERSION;
  return {
    setters: [function($__m) {
      Version = $__m.Version;
    }],
    execute: function() {
      VERSION = new Version('2.3.1');
      $__export("VERSION", VERSION);
    }
  };
});

System.register("@angular/common/src/common.js", ["./location/index", "./localization", "./common_module", "./directives/index", "./pipes/index", "./version", "@angular/core"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({
        PlatformLocation: $__m.PlatformLocation,
        LocationStrategy: $__m.LocationStrategy,
        APP_BASE_HREF: $__m.APP_BASE_HREF,
        HashLocationStrategy: $__m.HashLocationStrategy,
        PathLocationStrategy: $__m.PathLocationStrategy,
        Location: $__m.Location
      });
    }, function($__m) {
      $__export({NgLocalization: $__m.NgLocalization});
    }, function($__m) {
      $__export({CommonModule: $__m.CommonModule});
    }, function($__m) {
      $__export({
        NgClass: $__m.NgClass,
        NgFor: $__m.NgFor,
        NgIf: $__m.NgIf,
        NgPlural: $__m.NgPlural,
        NgPluralCase: $__m.NgPluralCase,
        NgStyle: $__m.NgStyle,
        NgSwitch: $__m.NgSwitch,
        NgSwitchCase: $__m.NgSwitchCase,
        NgSwitchDefault: $__m.NgSwitchDefault,
        NgTemplateOutlet: $__m.NgTemplateOutlet
      });
    }, function($__m) {
      $__export({
        AsyncPipe: $__m.AsyncPipe,
        DatePipe: $__m.DatePipe,
        I18nPluralPipe: $__m.I18nPluralPipe,
        I18nSelectPipe: $__m.I18nSelectPipe,
        JsonPipe: $__m.JsonPipe,
        LowerCasePipe: $__m.LowerCasePipe,
        CurrencyPipe: $__m.CurrencyPipe,
        DecimalPipe: $__m.DecimalPipe,
        PercentPipe: $__m.PercentPipe,
        SlicePipe: $__m.SlicePipe,
        UpperCasePipe: $__m.UpperCasePipe
      });
    }, function($__m) {
      $__export({VERSION: $__m.VERSION});
    }, function($__m) {
      $__export({Version: $__m.Version});
    }],
    execute: function() {}
  };
});

System.register("@angular/common/index.js", ["./src/common"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({
        NgLocalization: $__m.NgLocalization,
        CommonModule: $__m.CommonModule,
        NgClass: $__m.NgClass,
        NgFor: $__m.NgFor,
        NgIf: $__m.NgIf,
        NgPlural: $__m.NgPlural,
        NgPluralCase: $__m.NgPluralCase,
        NgStyle: $__m.NgStyle,
        NgSwitch: $__m.NgSwitch,
        NgSwitchCase: $__m.NgSwitchCase,
        NgSwitchDefault: $__m.NgSwitchDefault,
        NgTemplateOutlet: $__m.NgTemplateOutlet,
        AsyncPipe: $__m.AsyncPipe,
        DatePipe: $__m.DatePipe,
        I18nPluralPipe: $__m.I18nPluralPipe,
        I18nSelectPipe: $__m.I18nSelectPipe,
        JsonPipe: $__m.JsonPipe,
        LowerCasePipe: $__m.LowerCasePipe,
        CurrencyPipe: $__m.CurrencyPipe,
        DecimalPipe: $__m.DecimalPipe,
        PercentPipe: $__m.PercentPipe,
        SlicePipe: $__m.SlicePipe,
        UpperCasePipe: $__m.UpperCasePipe,
        VERSION: $__m.VERSION,
        Version: $__m.Version,
        PlatformLocation: $__m.PlatformLocation,
        LocationStrategy: $__m.LocationStrategy,
        APP_BASE_HREF: $__m.APP_BASE_HREF,
        HashLocationStrategy: $__m.HashLocationStrategy,
        PathLocationStrategy: $__m.PathLocationStrategy,
        Location: $__m.Location
      });
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/util.js", ["./util/decorators"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({Class: $__m.Class});
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/zone.js", ["./zone/ng_zone"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({NgZone: $__m.NgZone});
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/render.js", ["./render/api"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({
        RenderComponentType: $__m.RenderComponentType,
        Renderer: $__m.Renderer,
        RootRenderer: $__m.RootRenderer
      });
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/linker/query_list.js", ["../facade/async", "../facade/collection", "../facade/lang"], function($__export) {
  "use strict";
  var EventEmitter,
      ListWrapper,
      getSymbolIterator,
      QueryList;
  function QueryList_tsickle_Closure_declarations() {
    QueryList.prototype._dirty;
    QueryList.prototype._results;
    QueryList.prototype._emitter;
  }
  return {
    setters: [function($__m) {
      EventEmitter = $__m.EventEmitter;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      getSymbolIterator = $__m.getSymbolIterator;
    }],
    execute: function() {
      QueryList = (function() {
        function QueryList() {
          this._dirty = true;
          this._results = [];
          this._emitter = new EventEmitter();
        }
        Object.defineProperty(QueryList.prototype, "changes", {
          get: function() {
            return this._emitter;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(QueryList.prototype, "length", {
          get: function() {
            return this._results.length;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(QueryList.prototype, "first", {
          get: function() {
            return this._results[0];
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(QueryList.prototype, "last", {
          get: function() {
            return this._results[this.length - 1];
          },
          enumerable: true,
          configurable: true
        });
        QueryList.prototype.map = function(fn) {
          return this._results.map(fn);
        };
        QueryList.prototype.filter = function(fn) {
          return this._results.filter(fn);
        };
        QueryList.prototype.find = function(fn) {
          return this._results.find(fn);
        };
        QueryList.prototype.reduce = function(fn, init) {
          return this._results.reduce(fn, init);
        };
        QueryList.prototype.forEach = function(fn) {
          this._results.forEach(fn);
        };
        QueryList.prototype.some = function(fn) {
          return this._results.some(fn);
        };
        QueryList.prototype.toArray = function() {
          return this._results.slice();
        };
        QueryList.prototype[getSymbolIterator()] = function() {
          return ((this._results))[getSymbolIterator()]();
        };
        QueryList.prototype.toString = function() {
          return this._results.toString();
        };
        QueryList.prototype.reset = function(res) {
          this._results = ListWrapper.flatten(res);
          this._dirty = false;
        };
        QueryList.prototype.notifyOnChanges = function() {
          this._emitter.emit(this);
        };
        QueryList.prototype.setDirty = function() {
          this._dirty = true;
        };
        Object.defineProperty(QueryList.prototype, "dirty", {
          get: function() {
            return this._dirty;
          },
          enumerable: true,
          configurable: true
        });
        return QueryList;
      }());
      $__export("QueryList", QueryList);
    }
  };
});

System.register("@angular/core/src/linker/system_js_ng_module_factory_loader.js", ["../di", "./compiler"], function($__export) {
  "use strict";
  var Injectable,
      Optional,
      Compiler,
      _SEPARATOR,
      FACTORY_CLASS_SUFFIX,
      SystemJsNgModuleLoaderConfig,
      DEFAULT_CONFIG,
      SystemJsNgModuleLoader;
  function SystemJsNgModuleLoaderConfig_tsickle_Closure_declarations() {
    SystemJsNgModuleLoaderConfig.prototype.factoryPathPrefix;
    SystemJsNgModuleLoaderConfig.prototype.factoryPathSuffix;
  }
  function SystemJsNgModuleLoader_tsickle_Closure_declarations() {
    SystemJsNgModuleLoader.decorators;
    SystemJsNgModuleLoader.ctorParameters;
    SystemJsNgModuleLoader.prototype._config;
    SystemJsNgModuleLoader.prototype._compiler;
  }
  function checkNotEmpty(value, modulePath, exportName) {
    if (!value) {
      throw new Error("Cannot find '" + exportName + "' in '" + modulePath + "'");
    }
    return value;
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
      Optional = $__m.Optional;
    }, function($__m) {
      Compiler = $__m.Compiler;
    }],
    execute: function() {
      _SEPARATOR = '#';
      FACTORY_CLASS_SUFFIX = 'NgFactory';
      SystemJsNgModuleLoaderConfig = (function() {
        function SystemJsNgModuleLoaderConfig() {}
        return SystemJsNgModuleLoaderConfig;
      }());
      $__export("SystemJsNgModuleLoaderConfig", SystemJsNgModuleLoaderConfig);
      DEFAULT_CONFIG = {
        factoryPathPrefix: '',
        factoryPathSuffix: '.ngfactory'
      };
      SystemJsNgModuleLoader = (function() {
        function SystemJsNgModuleLoader(_compiler, config) {
          this._compiler = _compiler;
          this._config = config || DEFAULT_CONFIG;
        }
        SystemJsNgModuleLoader.prototype.load = function(path) {
          var offlineMode = this._compiler instanceof Compiler;
          return offlineMode ? this.loadFactory(path) : this.loadAndCompile(path);
        };
        SystemJsNgModuleLoader.prototype.loadAndCompile = function(path) {
          var _this = this;
          var _a = path.split(_SEPARATOR),
              module = _a[0],
              exportName = _a[1];
          if (exportName === undefined) {
            exportName = 'default';
          }
          return System.import(module).then(function(module) {
            return module[exportName];
          }).then(function(type) {
            return checkNotEmpty(type, module, exportName);
          }).then(function(type) {
            return _this._compiler.compileModuleAsync(type);
          });
        };
        SystemJsNgModuleLoader.prototype.loadFactory = function(path) {
          var _a = path.split(_SEPARATOR),
              module = _a[0],
              exportName = _a[1];
          var factoryClassSuffix = FACTORY_CLASS_SUFFIX;
          if (exportName === undefined) {
            exportName = 'default';
            factoryClassSuffix = '';
          }
          return System.import(this._config.factoryPathPrefix + module + this._config.factoryPathSuffix).then(function(module) {
            return module[exportName + factoryClassSuffix];
          }).then(function(factory) {
            return checkNotEmpty(factory, module, exportName);
          });
        };
        SystemJsNgModuleLoader.decorators = [{type: Injectable}];
        SystemJsNgModuleLoader.ctorParameters = function() {
          return [{type: Compiler}, {
            type: SystemJsNgModuleLoaderConfig,
            decorators: [{type: Optional}]
          }];
        };
        return SystemJsNgModuleLoader;
      }());
      $__export("SystemJsNgModuleLoader", SystemJsNgModuleLoader);
    }
  };
});

System.register("@angular/core/src/linker.js", ["./linker/compiler", "./linker/component_factory", "./linker/component_factory_resolver", "./linker/element_ref", "./linker/ng_module_factory", "./linker/ng_module_factory_loader", "./linker/query_list", "./linker/system_js_ng_module_factory_loader", "./linker/template_ref", "./linker/view_container_ref", "./linker/view_ref"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({
        COMPILER_OPTIONS: $__m.COMPILER_OPTIONS,
        Compiler: $__m.Compiler,
        CompilerFactory: $__m.CompilerFactory,
        ModuleWithComponentFactories: $__m.ModuleWithComponentFactories
      });
    }, function($__m) {
      $__export({
        ComponentFactory: $__m.ComponentFactory,
        ComponentRef: $__m.ComponentRef
      });
    }, function($__m) {
      $__export({ComponentFactoryResolver: $__m.ComponentFactoryResolver});
    }, function($__m) {
      $__export({ElementRef: $__m.ElementRef});
    }, function($__m) {
      $__export({
        NgModuleFactory: $__m.NgModuleFactory,
        NgModuleRef: $__m.NgModuleRef
      });
    }, function($__m) {
      $__export({
        NgModuleFactoryLoader: $__m.NgModuleFactoryLoader,
        getModuleFactory: $__m.getModuleFactory
      });
    }, function($__m) {
      $__export({QueryList: $__m.QueryList});
    }, function($__m) {
      $__export({
        SystemJsNgModuleLoader: $__m.SystemJsNgModuleLoader,
        SystemJsNgModuleLoaderConfig: $__m.SystemJsNgModuleLoaderConfig
      });
    }, function($__m) {
      $__export({TemplateRef: $__m.TemplateRef});
    }, function($__m) {
      $__export({ViewContainerRef: $__m.ViewContainerRef});
    }, function($__m) {
      $__export({
        EmbeddedViewRef: $__m.EmbeddedViewRef,
        ViewRef: $__m.ViewRef
      });
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/change_detection.js", ["./change_detection/change_detection"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({
        ChangeDetectionStrategy: $__m.ChangeDetectionStrategy,
        ChangeDetectorRef: $__m.ChangeDetectorRef,
        CollectionChangeRecord: $__m.CollectionChangeRecord,
        DefaultIterableDiffer: $__m.DefaultIterableDiffer,
        IterableDiffers: $__m.IterableDiffers,
        KeyValueChangeRecord: $__m.KeyValueChangeRecord,
        KeyValueDiffers: $__m.KeyValueDiffers,
        SimpleChange: $__m.SimpleChange,
        WrappedValue: $__m.WrappedValue
      });
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/platform_core_providers.js", ["./application_ref", "./console", "./reflection/reflection", "./reflection/reflector_reader", "./testability/testability"], function($__export) {
  "use strict";
  var PlatformRef,
      PlatformRef_,
      createPlatformFactory,
      Console,
      Reflector,
      reflector,
      ReflectorReader,
      TestabilityRegistry,
      _CORE_PLATFORM_PROVIDERS,
      platformCore;
  function _reflector() {
    return reflector;
  }
  return {
    setters: [function($__m) {
      PlatformRef = $__m.PlatformRef;
      PlatformRef_ = $__m.PlatformRef_;
      createPlatformFactory = $__m.createPlatformFactory;
    }, function($__m) {
      Console = $__m.Console;
    }, function($__m) {
      Reflector = $__m.Reflector;
      reflector = $__m.reflector;
    }, function($__m) {
      ReflectorReader = $__m.ReflectorReader;
    }, function($__m) {
      TestabilityRegistry = $__m.TestabilityRegistry;
    }],
    execute: function() {
      _CORE_PLATFORM_PROVIDERS = [PlatformRef_, {
        provide: PlatformRef,
        useExisting: PlatformRef_
      }, {
        provide: Reflector,
        useFactory: _reflector,
        deps: []
      }, {
        provide: ReflectorReader,
        useExisting: Reflector
      }, TestabilityRegistry, Console];
      platformCore = createPlatformFactory(null, 'core', _CORE_PLATFORM_PROVIDERS);
      $__export("platformCore", platformCore);
    }
  };
});

System.register("@angular/core/src/application_init.js", ["../src/util/lang", "./di"], function($__export) {
  "use strict";
  var isPromise,
      Inject,
      Injectable,
      OpaqueToken,
      Optional,
      APP_INITIALIZER,
      ApplicationInitStatus;
  function ApplicationInitStatus_tsickle_Closure_declarations() {
    ApplicationInitStatus.decorators;
    ApplicationInitStatus.ctorParameters;
    ApplicationInitStatus.prototype._donePromise;
    ApplicationInitStatus.prototype._done;
  }
  return {
    setters: [function($__m) {
      isPromise = $__m.isPromise;
    }, function($__m) {
      Inject = $__m.Inject;
      Injectable = $__m.Injectable;
      OpaqueToken = $__m.OpaqueToken;
      Optional = $__m.Optional;
    }],
    execute: function() {
      APP_INITIALIZER = new OpaqueToken('Application Initializer');
      $__export("APP_INITIALIZER", APP_INITIALIZER);
      ApplicationInitStatus = (function() {
        function ApplicationInitStatus(appInits) {
          var _this = this;
          this._done = false;
          var asyncInitPromises = [];
          if (appInits) {
            for (var i = 0; i < appInits.length; i++) {
              var initResult = appInits[i]();
              if (isPromise(initResult)) {
                asyncInitPromises.push(initResult);
              }
            }
          }
          this._donePromise = Promise.all(asyncInitPromises).then(function() {
            _this._done = true;
          });
          if (asyncInitPromises.length === 0) {
            this._done = true;
          }
        }
        Object.defineProperty(ApplicationInitStatus.prototype, "done", {
          get: function() {
            return this._done;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ApplicationInitStatus.prototype, "donePromise", {
          get: function() {
            return this._donePromise;
          },
          enumerable: true,
          configurable: true
        });
        ApplicationInitStatus.decorators = [{type: Injectable}];
        ApplicationInitStatus.ctorParameters = function() {
          return [{
            type: Array,
            decorators: [{
              type: Inject,
              args: [APP_INITIALIZER]
            }, {type: Optional}]
          }];
        };
        return ApplicationInitStatus;
      }());
      $__export("ApplicationInitStatus", ApplicationInitStatus);
    }
  };
});

System.register("@angular/core/src/testability/testability.js", ["../di", "../facade/lang", "../zone/ng_zone"], function($__export) {
  "use strict";
  var Injectable,
      scheduleMicroTask,
      NgZone,
      Testability,
      TestabilityRegistry,
      _NoopGetTestability,
      _testabilityGetter;
  function Testability_tsickle_Closure_declarations() {
    Testability.decorators;
    Testability.ctorParameters;
    Testability.prototype._pendingCount;
    Testability.prototype._isZoneStable;
    Testability.prototype._didWork;
    Testability.prototype._callbacks;
    Testability.prototype._ngZone;
  }
  function TestabilityRegistry_tsickle_Closure_declarations() {
    TestabilityRegistry.decorators;
    TestabilityRegistry.ctorParameters;
    TestabilityRegistry.prototype._applications;
  }
  function setTestabilityGetter(getter) {
    _testabilityGetter = getter;
  }
  $__export("setTestabilityGetter", setTestabilityGetter);
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      scheduleMicroTask = $__m.scheduleMicroTask;
    }, function($__m) {
      NgZone = $__m.NgZone;
    }],
    execute: function() {
      Testability = (function() {
        function Testability(_ngZone) {
          this._ngZone = _ngZone;
          this._pendingCount = 0;
          this._isZoneStable = true;
          this._didWork = false;
          this._callbacks = [];
          this._watchAngularEvents();
        }
        Testability.prototype._watchAngularEvents = function() {
          var _this = this;
          this._ngZone.onUnstable.subscribe({next: function() {
              _this._didWork = true;
              _this._isZoneStable = false;
            }});
          this._ngZone.runOutsideAngular(function() {
            _this._ngZone.onStable.subscribe({next: function() {
                NgZone.assertNotInAngularZone();
                scheduleMicroTask(function() {
                  _this._isZoneStable = true;
                  _this._runCallbacksIfReady();
                });
              }});
          });
        };
        Testability.prototype.increasePendingRequestCount = function() {
          this._pendingCount += 1;
          this._didWork = true;
          return this._pendingCount;
        };
        Testability.prototype.decreasePendingRequestCount = function() {
          this._pendingCount -= 1;
          if (this._pendingCount < 0) {
            throw new Error('pending async requests below zero');
          }
          this._runCallbacksIfReady();
          return this._pendingCount;
        };
        Testability.prototype.isStable = function() {
          return this._isZoneStable && this._pendingCount == 0 && !this._ngZone.hasPendingMacrotasks;
        };
        Testability.prototype._runCallbacksIfReady = function() {
          var _this = this;
          if (this.isStable()) {
            scheduleMicroTask(function() {
              while (_this._callbacks.length !== 0) {
                (_this._callbacks.pop())(_this._didWork);
              }
              _this._didWork = false;
            });
          } else {
            this._didWork = true;
          }
        };
        Testability.prototype.whenStable = function(callback) {
          this._callbacks.push(callback);
          this._runCallbacksIfReady();
        };
        Testability.prototype.getPendingRequestCount = function() {
          return this._pendingCount;
        };
        Testability.prototype.findBindings = function(using, provider, exactMatch) {
          return [];
        };
        Testability.prototype.findProviders = function(using, provider, exactMatch) {
          return [];
        };
        Testability.decorators = [{type: Injectable}];
        Testability.ctorParameters = function() {
          return [{type: NgZone}];
        };
        return Testability;
      }());
      $__export("Testability", Testability);
      TestabilityRegistry = (function() {
        function TestabilityRegistry() {
          this._applications = new Map();
          _testabilityGetter.addToWindow(this);
        }
        TestabilityRegistry.prototype.registerApplication = function(token, testability) {
          this._applications.set(token, testability);
        };
        TestabilityRegistry.prototype.getTestability = function(elem) {
          return this._applications.get(elem);
        };
        TestabilityRegistry.prototype.getAllTestabilities = function() {
          return Array.from(this._applications.values());
        };
        TestabilityRegistry.prototype.getAllRootElements = function() {
          return Array.from(this._applications.keys());
        };
        TestabilityRegistry.prototype.findTestabilityInTree = function(elem, findInAncestors) {
          if (findInAncestors === void 0) {
            findInAncestors = true;
          }
          return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
        };
        TestabilityRegistry.decorators = [{type: Injectable}];
        TestabilityRegistry.ctorParameters = function() {
          return [];
        };
        return TestabilityRegistry;
      }());
      $__export("TestabilityRegistry", TestabilityRegistry);
      _NoopGetTestability = (function() {
        function _NoopGetTestability() {}
        _NoopGetTestability.prototype.addToWindow = function(registry) {};
        _NoopGetTestability.prototype.findTestabilityInTree = function(registry, elem, findInAncestors) {
          return null;
        };
        return _NoopGetTestability;
      }());
      _testabilityGetter = new _NoopGetTestability();
    }
  };
});

System.register("@angular/core/src/application_ref.js", ["../src/error_handler", "../src/facade/collection", "../src/facade/errors", "../src/facade/lang", "../src/util/lang", "./application_init", "./application_tokens", "./console", "./di", "./linker/compiler", "./linker/component_factory", "./linker/component_factory_resolver", "./profile/profile", "./testability/testability", "./zone/ng_zone"], function($__export) {
  "use strict";
  var __extends,
      ErrorHandler,
      ListWrapper,
      unimplemented,
      stringify,
      isPromise,
      ApplicationInitStatus,
      APP_BOOTSTRAP_LISTENER,
      PLATFORM_INITIALIZER,
      Console,
      Injectable,
      Injector,
      OpaqueToken,
      Optional,
      ReflectiveInjector,
      CompilerFactory,
      ComponentFactory,
      ComponentFactoryResolver,
      wtfCreateScope,
      wtfLeave,
      Testability,
      TestabilityRegistry,
      NgZone,
      _devMode,
      _runModeLocked,
      _platform,
      NgProbeToken,
      PlatformRef,
      PlatformRef_,
      ApplicationRef,
      ApplicationRef_;
  function enableProdMode() {
    if (_runModeLocked) {
      throw new Error('Cannot enable prod mode after platform setup.');
    }
    _devMode = false;
  }
  function isDevMode() {
    _runModeLocked = true;
    return _devMode;
  }
  function NgProbeToken_tsickle_Closure_declarations() {
    NgProbeToken.prototype.name;
    NgProbeToken.prototype.token;
  }
  function createPlatform(injector) {
    if (_platform && !_platform.destroyed) {
      throw new Error('There can be only one platform. Destroy the previous one to create a new one.');
    }
    _platform = injector.get(PlatformRef);
    var inits = (injector.get(PLATFORM_INITIALIZER, null));
    if (inits)
      inits.forEach(function(init) {
        return init();
      });
    return _platform;
  }
  function createPlatformFactory(parentPlaformFactory, name, providers) {
    if (providers === void 0) {
      providers = [];
    }
    var marker = new OpaqueToken("Platform: " + name);
    return function(extraProviders) {
      if (extraProviders === void 0) {
        extraProviders = [];
      }
      if (!getPlatform()) {
        if (parentPlaformFactory) {
          parentPlaformFactory(providers.concat(extraProviders).concat({
            provide: marker,
            useValue: true
          }));
        } else {
          createPlatform(ReflectiveInjector.resolveAndCreate(providers.concat(extraProviders).concat({
            provide: marker,
            useValue: true
          })));
        }
      }
      return assertPlatform(marker);
    };
  }
  function assertPlatform(requiredToken) {
    var platform = getPlatform();
    if (!platform) {
      throw new Error('No platform exists!');
    }
    if (!platform.injector.get(requiredToken, null)) {
      throw new Error('A platform with a different configuration has been created. Please destroy it first.');
    }
    return platform;
  }
  function destroyPlatform() {
    if (_platform && !_platform.destroyed) {
      _platform.destroy();
    }
  }
  function getPlatform() {
    return _platform && !_platform.destroyed ? _platform : null;
  }
  function _callAndReportToErrorHandler(errorHandler, callback) {
    try {
      var result = callback();
      if (isPromise(result)) {
        return result.catch(function(e) {
          errorHandler.handleError(e);
          throw e;
        });
      }
      return result;
    } catch (e) {
      errorHandler.handleError(e);
      throw e;
    }
  }
  function PlatformRef__tsickle_Closure_declarations() {
    PlatformRef_.decorators;
    PlatformRef_.ctorParameters;
    PlatformRef_.prototype._modules;
    PlatformRef_.prototype._destroyListeners;
    PlatformRef_.prototype._destroyed;
    PlatformRef_.prototype._injector;
  }
  function ApplicationRef__tsickle_Closure_declarations() {
    ApplicationRef_._tickScope;
    ApplicationRef_.decorators;
    ApplicationRef_.ctorParameters;
    ApplicationRef_.prototype._bootstrapListeners;
    ApplicationRef_.prototype._rootComponents;
    ApplicationRef_.prototype._rootComponentTypes;
    ApplicationRef_.prototype._views;
    ApplicationRef_.prototype._runningTick;
    ApplicationRef_.prototype._enforceNoNewChanges;
    ApplicationRef_.prototype._zone;
    ApplicationRef_.prototype._console;
    ApplicationRef_.prototype._injector;
    ApplicationRef_.prototype._exceptionHandler;
    ApplicationRef_.prototype._componentFactoryResolver;
    ApplicationRef_.prototype._initStatus;
    ApplicationRef_.prototype._testabilityRegistry;
    ApplicationRef_.prototype._testability;
  }
  $__export("enableProdMode", enableProdMode);
  $__export("isDevMode", isDevMode);
  $__export("createPlatform", createPlatform);
  $__export("createPlatformFactory", createPlatformFactory);
  $__export("assertPlatform", assertPlatform);
  $__export("destroyPlatform", destroyPlatform);
  $__export("getPlatform", getPlatform);
  return {
    setters: [function($__m) {
      ErrorHandler = $__m.ErrorHandler;
    }, function($__m) {
      ListWrapper = $__m.ListWrapper;
    }, function($__m) {
      unimplemented = $__m.unimplemented;
    }, function($__m) {
      stringify = $__m.stringify;
    }, function($__m) {
      isPromise = $__m.isPromise;
    }, function($__m) {
      ApplicationInitStatus = $__m.ApplicationInitStatus;
    }, function($__m) {
      APP_BOOTSTRAP_LISTENER = $__m.APP_BOOTSTRAP_LISTENER;
      PLATFORM_INITIALIZER = $__m.PLATFORM_INITIALIZER;
    }, function($__m) {
      Console = $__m.Console;
    }, function($__m) {
      Injectable = $__m.Injectable;
      Injector = $__m.Injector;
      OpaqueToken = $__m.OpaqueToken;
      Optional = $__m.Optional;
      ReflectiveInjector = $__m.ReflectiveInjector;
    }, function($__m) {
      CompilerFactory = $__m.CompilerFactory;
    }, function($__m) {
      ComponentFactory = $__m.ComponentFactory;
    }, function($__m) {
      ComponentFactoryResolver = $__m.ComponentFactoryResolver;
    }, function($__m) {
      wtfCreateScope = $__m.wtfCreateScope;
      wtfLeave = $__m.wtfLeave;
    }, function($__m) {
      Testability = $__m.Testability;
      TestabilityRegistry = $__m.TestabilityRegistry;
    }, function($__m) {
      NgZone = $__m.NgZone;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      _devMode = true;
      _runModeLocked = false;
      NgProbeToken = (function() {
        function NgProbeToken(name, token) {
          this.name = name;
          this.token = token;
        }
        return NgProbeToken;
      }());
      $__export("NgProbeToken", NgProbeToken);
      PlatformRef = (function() {
        function PlatformRef() {}
        PlatformRef.prototype.bootstrapModuleFactory = function(moduleFactory) {
          throw unimplemented();
        };
        PlatformRef.prototype.bootstrapModule = function(moduleType, compilerOptions) {
          if (compilerOptions === void 0) {
            compilerOptions = [];
          }
          throw unimplemented();
        };
        PlatformRef.prototype.onDestroy = function(callback) {};
        Object.defineProperty(PlatformRef.prototype, "injector", {
          get: function() {
            throw unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        ;
        PlatformRef.prototype.destroy = function() {};
        Object.defineProperty(PlatformRef.prototype, "destroyed", {
          get: function() {
            throw unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        return PlatformRef;
      }());
      $__export("PlatformRef", PlatformRef);
      PlatformRef_ = (function(_super) {
        __extends(PlatformRef_, _super);
        function PlatformRef_(_injector) {
          _super.call(this);
          this._injector = _injector;
          this._modules = [];
          this._destroyListeners = [];
          this._destroyed = false;
        }
        PlatformRef_.prototype.onDestroy = function(callback) {
          this._destroyListeners.push(callback);
        };
        Object.defineProperty(PlatformRef_.prototype, "injector", {
          get: function() {
            return this._injector;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(PlatformRef_.prototype, "destroyed", {
          get: function() {
            return this._destroyed;
          },
          enumerable: true,
          configurable: true
        });
        PlatformRef_.prototype.destroy = function() {
          if (this._destroyed) {
            throw new Error('The platform has already been destroyed!');
          }
          this._modules.slice().forEach(function(module) {
            return module.destroy();
          });
          this._destroyListeners.forEach(function(listener) {
            return listener();
          });
          this._destroyed = true;
        };
        PlatformRef_.prototype.bootstrapModuleFactory = function(moduleFactory) {
          return this._bootstrapModuleFactoryWithZone(moduleFactory, null);
        };
        PlatformRef_.prototype._bootstrapModuleFactoryWithZone = function(moduleFactory, ngZone) {
          var _this = this;
          if (!ngZone)
            ngZone = new NgZone({enableLongStackTrace: isDevMode()});
          return ngZone.run(function() {
            var ngZoneInjector = ReflectiveInjector.resolveAndCreate([{
              provide: NgZone,
              useValue: ngZone
            }], _this.injector);
            var moduleRef = (moduleFactory.create(ngZoneInjector));
            var exceptionHandler = moduleRef.injector.get(ErrorHandler, null);
            if (!exceptionHandler) {
              throw new Error('No ErrorHandler. Is platform module (BrowserModule) included?');
            }
            moduleRef.onDestroy(function() {
              return ListWrapper.remove(_this._modules, moduleRef);
            });
            ngZone.onError.subscribe({next: function(error) {
                exceptionHandler.handleError(error);
              }});
            return _callAndReportToErrorHandler(exceptionHandler, function() {
              var initStatus = moduleRef.injector.get(ApplicationInitStatus);
              return initStatus.donePromise.then(function() {
                _this._moduleDoBootstrap(moduleRef);
                return moduleRef;
              });
            });
          });
        };
        PlatformRef_.prototype.bootstrapModule = function(moduleType, compilerOptions) {
          if (compilerOptions === void 0) {
            compilerOptions = [];
          }
          return this._bootstrapModuleWithZone(moduleType, compilerOptions, null);
        };
        PlatformRef_.prototype._bootstrapModuleWithZone = function(moduleType, compilerOptions, ngZone, componentFactoryCallback) {
          var _this = this;
          if (compilerOptions === void 0) {
            compilerOptions = [];
          }
          var compilerFactory = this.injector.get(CompilerFactory);
          var compiler = compilerFactory.createCompiler(Array.isArray(compilerOptions) ? compilerOptions : [compilerOptions]);
          if (componentFactoryCallback) {
            return compiler.compileModuleAndAllComponentsAsync(moduleType).then(function(_a) {
              var ngModuleFactory = _a.ngModuleFactory,
                  componentFactories = _a.componentFactories;
              componentFactoryCallback(componentFactories);
              return _this._bootstrapModuleFactoryWithZone(ngModuleFactory, ngZone);
            });
          }
          return compiler.compileModuleAsync(moduleType).then(function(moduleFactory) {
            return _this._bootstrapModuleFactoryWithZone(moduleFactory, ngZone);
          });
        };
        PlatformRef_.prototype._moduleDoBootstrap = function(moduleRef) {
          var appRef = moduleRef.injector.get(ApplicationRef);
          if (moduleRef.bootstrapFactories.length > 0) {
            moduleRef.bootstrapFactories.forEach(function(compFactory) {
              return appRef.bootstrap(compFactory);
            });
          } else if (moduleRef.instance.ngDoBootstrap) {
            moduleRef.instance.ngDoBootstrap(appRef);
          } else {
            throw new Error(("The module " + stringify(moduleRef.instance.constructor) + " was bootstrapped, but it does not declare \"@NgModule.bootstrap\" components nor a \"ngDoBootstrap\" method. ") + "Please define one of these.");
          }
        };
        PlatformRef_.decorators = [{type: Injectable}];
        PlatformRef_.ctorParameters = function() {
          return [{type: Injector}];
        };
        return PlatformRef_;
      }(PlatformRef));
      $__export("PlatformRef_", PlatformRef_);
      ApplicationRef = (function() {
        function ApplicationRef() {}
        ApplicationRef.prototype.bootstrap = function(componentFactory) {};
        ApplicationRef.prototype.tick = function() {};
        Object.defineProperty(ApplicationRef.prototype, "componentTypes", {
          get: function() {
            return (unimplemented());
          },
          enumerable: true,
          configurable: true
        });
        ;
        Object.defineProperty(ApplicationRef.prototype, "components", {
          get: function() {
            return (unimplemented());
          },
          enumerable: true,
          configurable: true
        });
        ;
        ApplicationRef.prototype.attachView = function(view) {
          unimplemented();
        };
        ApplicationRef.prototype.detachView = function(view) {
          unimplemented();
        };
        Object.defineProperty(ApplicationRef.prototype, "viewCount", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        return ApplicationRef;
      }());
      $__export("ApplicationRef", ApplicationRef);
      ApplicationRef_ = (function(_super) {
        __extends(ApplicationRef_, _super);
        function ApplicationRef_(_zone, _console, _injector, _exceptionHandler, _componentFactoryResolver, _initStatus, _testabilityRegistry, _testability) {
          var _this = this;
          _super.call(this);
          this._zone = _zone;
          this._console = _console;
          this._injector = _injector;
          this._exceptionHandler = _exceptionHandler;
          this._componentFactoryResolver = _componentFactoryResolver;
          this._initStatus = _initStatus;
          this._testabilityRegistry = _testabilityRegistry;
          this._testability = _testability;
          this._bootstrapListeners = [];
          this._rootComponents = [];
          this._rootComponentTypes = [];
          this._views = [];
          this._runningTick = false;
          this._enforceNoNewChanges = false;
          this._enforceNoNewChanges = isDevMode();
          this._zone.onMicrotaskEmpty.subscribe({next: function() {
              _this._zone.run(function() {
                _this.tick();
              });
            }});
        }
        ApplicationRef_.prototype.attachView = function(viewRef) {
          var view = ((viewRef)).internalView;
          this._views.push(view);
          view.attachToAppRef(this);
        };
        ApplicationRef_.prototype.detachView = function(viewRef) {
          var view = ((viewRef)).internalView;
          ListWrapper.remove(this._views, view);
          view.detach();
        };
        ApplicationRef_.prototype.bootstrap = function(componentOrFactory) {
          var _this = this;
          if (!this._initStatus.done) {
            throw new Error('Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module.');
          }
          var componentFactory;
          if (componentOrFactory instanceof ComponentFactory) {
            componentFactory = componentOrFactory;
          } else {
            componentFactory = this._componentFactoryResolver.resolveComponentFactory(componentOrFactory);
          }
          this._rootComponentTypes.push(componentFactory.componentType);
          var compRef = componentFactory.create(this._injector, [], componentFactory.selector);
          compRef.onDestroy(function() {
            _this._unloadComponent(compRef);
          });
          var testability = compRef.injector.get(Testability, null);
          if (testability) {
            compRef.injector.get(TestabilityRegistry).registerApplication(compRef.location.nativeElement, testability);
          }
          this._loadComponent(compRef);
          if (isDevMode()) {
            this._console.log("Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.");
          }
          return compRef;
        };
        ApplicationRef_.prototype._loadComponent = function(componentRef) {
          this.attachView(componentRef.hostView);
          this.tick();
          this._rootComponents.push(componentRef);
          var listeners = (this._injector.get(APP_BOOTSTRAP_LISTENER, []).concat(this._bootstrapListeners));
          listeners.forEach(function(listener) {
            return listener(componentRef);
          });
        };
        ApplicationRef_.prototype._unloadComponent = function(componentRef) {
          this.detachView(componentRef.hostView);
          ListWrapper.remove(this._rootComponents, componentRef);
        };
        ApplicationRef_.prototype.tick = function() {
          if (this._runningTick) {
            throw new Error('ApplicationRef.tick is called recursively');
          }
          var scope = ApplicationRef_._tickScope();
          try {
            this._runningTick = true;
            this._views.forEach(function(view) {
              return view.ref.detectChanges();
            });
            if (this._enforceNoNewChanges) {
              this._views.forEach(function(view) {
                return view.ref.checkNoChanges();
              });
            }
          } finally {
            this._runningTick = false;
            wtfLeave(scope);
          }
        };
        ApplicationRef_.prototype.ngOnDestroy = function() {
          this._views.slice().forEach(function(view) {
            return view.destroy();
          });
        };
        Object.defineProperty(ApplicationRef_.prototype, "viewCount", {
          get: function() {
            return this._views.length;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ApplicationRef_.prototype, "componentTypes", {
          get: function() {
            return this._rootComponentTypes;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ApplicationRef_.prototype, "components", {
          get: function() {
            return this._rootComponents;
          },
          enumerable: true,
          configurable: true
        });
        ApplicationRef_._tickScope = wtfCreateScope('ApplicationRef#tick()');
        ApplicationRef_.decorators = [{type: Injectable}];
        ApplicationRef_.ctorParameters = function() {
          return [{type: NgZone}, {type: Console}, {type: Injector}, {type: ErrorHandler}, {type: ComponentFactoryResolver}, {type: ApplicationInitStatus}, {
            type: TestabilityRegistry,
            decorators: [{type: Optional}]
          }, {
            type: Testability,
            decorators: [{type: Optional}]
          }];
        };
        return ApplicationRef_;
      }(ApplicationRef));
      $__export("ApplicationRef_", ApplicationRef_);
    }
  };
});

System.register("@angular/core/src/i18n/tokens.js", ["../di/opaque_token"], function($__export) {
  "use strict";
  var OpaqueToken,
      LOCALE_ID,
      TRANSLATIONS,
      TRANSLATIONS_FORMAT;
  return {
    setters: [function($__m) {
      OpaqueToken = $__m.OpaqueToken;
    }],
    execute: function() {
      LOCALE_ID = new OpaqueToken('LocaleId');
      $__export("LOCALE_ID", LOCALE_ID);
      TRANSLATIONS = new OpaqueToken('Translations');
      $__export("TRANSLATIONS", TRANSLATIONS);
      TRANSLATIONS_FORMAT = new OpaqueToken('TranslationsFormat');
      $__export("TRANSLATIONS_FORMAT", TRANSLATIONS_FORMAT);
    }
  };
});

System.register("@angular/core/src/metadata/di.js", ["../di/opaque_token", "../util/decorators"], function($__export) {
  "use strict";
  var OpaqueToken,
      makeParamDecorator,
      makePropDecorator,
      ANALYZE_FOR_ENTRY_COMPONENTS,
      Attribute,
      Query,
      ContentChildren,
      ContentChild,
      ViewChildren,
      ViewChild;
  return {
    setters: [function($__m) {
      OpaqueToken = $__m.OpaqueToken;
    }, function($__m) {
      makeParamDecorator = $__m.makeParamDecorator;
      makePropDecorator = $__m.makePropDecorator;
    }],
    execute: function() {
      ANALYZE_FOR_ENTRY_COMPONENTS = new OpaqueToken('AnalyzeForEntryComponents');
      $__export("ANALYZE_FOR_ENTRY_COMPONENTS", ANALYZE_FOR_ENTRY_COMPONENTS);
      Attribute = makeParamDecorator('Attribute', [['attributeName', undefined]]);
      $__export("Attribute", Attribute);
      Query = (function() {
        function Query() {}
        return Query;
      }());
      $__export("Query", Query);
      ContentChildren = (makePropDecorator('ContentChildren', [['selector', undefined], {
        first: false,
        isViewQuery: false,
        descendants: false,
        read: undefined
      }], Query));
      $__export("ContentChildren", ContentChildren);
      ContentChild = makePropDecorator('ContentChild', [['selector', undefined], {
        first: true,
        isViewQuery: false,
        descendants: true,
        read: undefined
      }], Query);
      $__export("ContentChild", ContentChild);
      ViewChildren = makePropDecorator('ViewChildren', [['selector', undefined], {
        first: false,
        isViewQuery: true,
        descendants: true,
        read: undefined
      }], Query);
      $__export("ViewChildren", ViewChildren);
      ViewChild = makePropDecorator('ViewChild', [['selector', undefined], {
        first: true,
        isViewQuery: true,
        descendants: true,
        read: undefined
      }], Query);
      $__export("ViewChild", ViewChild);
    }
  };
});

System.register("@angular/core/src/metadata/directives.js", ["../change_detection/constants", "../util/decorators"], function($__export) {
  "use strict";
  var ChangeDetectionStrategy,
      makeDecorator,
      makePropDecorator,
      Directive,
      Component,
      Pipe,
      Input,
      Output,
      HostBinding,
      HostListener;
  return {
    setters: [function($__m) {
      ChangeDetectionStrategy = $__m.ChangeDetectionStrategy;
    }, function($__m) {
      makeDecorator = $__m.makeDecorator;
      makePropDecorator = $__m.makePropDecorator;
    }],
    execute: function() {
      Directive = (makeDecorator('Directive', {
        selector: undefined,
        inputs: undefined,
        outputs: undefined,
        host: undefined,
        providers: undefined,
        exportAs: undefined,
        queries: undefined
      }));
      $__export("Directive", Directive);
      Component = (makeDecorator('Component', {
        selector: undefined,
        inputs: undefined,
        outputs: undefined,
        host: undefined,
        exportAs: undefined,
        moduleId: undefined,
        providers: undefined,
        viewProviders: undefined,
        changeDetection: ChangeDetectionStrategy.Default,
        queries: undefined,
        templateUrl: undefined,
        template: undefined,
        styleUrls: undefined,
        styles: undefined,
        animations: undefined,
        encapsulation: undefined,
        interpolation: undefined,
        entryComponents: undefined
      }, Directive));
      $__export("Component", Component);
      Pipe = (makeDecorator('Pipe', {
        name: undefined,
        pure: true
      }));
      $__export("Pipe", Pipe);
      Input = makePropDecorator('Input', [['bindingPropertyName', undefined]]);
      $__export("Input", Input);
      Output = makePropDecorator('Output', [['bindingPropertyName', undefined]]);
      $__export("Output", Output);
      HostBinding = makePropDecorator('HostBinding', [['hostPropertyName', undefined]]);
      $__export("HostBinding", HostBinding);
      HostListener = makePropDecorator('HostListener', [['eventName', undefined], ['args', []]]);
      $__export("HostListener", HostListener);
    }
  };
});

System.register("@angular/core/src/metadata/ng_module.js", ["../util/decorators"], function($__export) {
  "use strict";
  var makeDecorator,
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA,
      NgModule;
  return {
    setters: [function($__m) {
      makeDecorator = $__m.makeDecorator;
    }],
    execute: function() {
      CUSTOM_ELEMENTS_SCHEMA = {name: 'custom-elements'};
      $__export("CUSTOM_ELEMENTS_SCHEMA", CUSTOM_ELEMENTS_SCHEMA);
      NO_ERRORS_SCHEMA = {name: 'no-errors-schema'};
      $__export("NO_ERRORS_SCHEMA", NO_ERRORS_SCHEMA);
      NgModule = (makeDecorator('NgModule', {
        providers: undefined,
        declarations: undefined,
        imports: undefined,
        exports: undefined,
        entryComponents: undefined,
        bootstrap: undefined,
        schemas: undefined,
        id: undefined
      }));
      $__export("NgModule", NgModule);
    }
  };
});

System.register("@angular/core/src/metadata.js", ["./metadata/di", "./metadata/directives", "./metadata/lifecycle_hooks", "./metadata/ng_module", "./metadata/view"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({
        ANALYZE_FOR_ENTRY_COMPONENTS: $__m.ANALYZE_FOR_ENTRY_COMPONENTS,
        Attribute: $__m.Attribute,
        ContentChild: $__m.ContentChild,
        ContentChildren: $__m.ContentChildren,
        Query: $__m.Query,
        ViewChild: $__m.ViewChild,
        ViewChildren: $__m.ViewChildren
      });
    }, function($__m) {
      $__export({
        Component: $__m.Component,
        Directive: $__m.Directive,
        HostBinding: $__m.HostBinding,
        HostListener: $__m.HostListener,
        Input: $__m.Input,
        Output: $__m.Output,
        Pipe: $__m.Pipe
      });
    }, function($__m) {
      $__export({
        AfterContentChecked: $__m.AfterContentChecked,
        AfterContentInit: $__m.AfterContentInit,
        AfterViewChecked: $__m.AfterViewChecked,
        AfterViewInit: $__m.AfterViewInit,
        DoCheck: $__m.DoCheck,
        OnChanges: $__m.OnChanges,
        OnDestroy: $__m.OnDestroy,
        OnInit: $__m.OnInit
      });
    }, function($__m) {
      $__export({
        CUSTOM_ELEMENTS_SCHEMA: $__m.CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA: $__m.NO_ERRORS_SCHEMA,
        NgModule: $__m.NgModule
      });
    }, function($__m) {
      $__export({ViewEncapsulation: $__m.ViewEncapsulation});
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/application_module.js", ["./animation/animation_queue", "./application_init", "./application_ref", "./application_tokens", "./change_detection/change_detection", "./i18n/tokens", "./linker/compiler", "./linker/view_utils", "./metadata"], function($__export) {
  "use strict";
  var AnimationQueue,
      ApplicationInitStatus,
      ApplicationRef,
      ApplicationRef_,
      APP_ID_RANDOM_PROVIDER,
      IterableDiffers,
      KeyValueDiffers,
      defaultIterableDiffers,
      defaultKeyValueDiffers,
      LOCALE_ID,
      Compiler,
      ViewUtils,
      NgModule,
      ApplicationModule;
  function _iterableDiffersFactory() {
    return defaultIterableDiffers;
  }
  function _keyValueDiffersFactory() {
    return defaultKeyValueDiffers;
  }
  function ApplicationModule_tsickle_Closure_declarations() {
    ApplicationModule.decorators;
    ApplicationModule.ctorParameters;
  }
  $__export("_iterableDiffersFactory", _iterableDiffersFactory);
  $__export("_keyValueDiffersFactory", _keyValueDiffersFactory);
  return {
    setters: [function($__m) {
      AnimationQueue = $__m.AnimationQueue;
    }, function($__m) {
      ApplicationInitStatus = $__m.ApplicationInitStatus;
    }, function($__m) {
      ApplicationRef = $__m.ApplicationRef;
      ApplicationRef_ = $__m.ApplicationRef_;
    }, function($__m) {
      APP_ID_RANDOM_PROVIDER = $__m.APP_ID_RANDOM_PROVIDER;
    }, function($__m) {
      IterableDiffers = $__m.IterableDiffers;
      KeyValueDiffers = $__m.KeyValueDiffers;
      defaultIterableDiffers = $__m.defaultIterableDiffers;
      defaultKeyValueDiffers = $__m.defaultKeyValueDiffers;
    }, function($__m) {
      LOCALE_ID = $__m.LOCALE_ID;
    }, function($__m) {
      Compiler = $__m.Compiler;
    }, function($__m) {
      ViewUtils = $__m.ViewUtils;
    }, function($__m) {
      NgModule = $__m.NgModule;
    }],
    execute: function() {
      ApplicationModule = (function() {
        function ApplicationModule() {}
        ApplicationModule.decorators = [{
          type: NgModule,
          args: [{providers: [ApplicationRef_, {
              provide: ApplicationRef,
              useExisting: ApplicationRef_
            }, ApplicationInitStatus, Compiler, APP_ID_RANDOM_PROVIDER, ViewUtils, AnimationQueue, {
              provide: IterableDiffers,
              useFactory: _iterableDiffersFactory
            }, {
              provide: KeyValueDiffers,
              useFactory: _keyValueDiffersFactory
            }, {
              provide: LOCALE_ID,
              useValue: 'en-US'
            }]}]
        }];
        ApplicationModule.ctorParameters = function() {
          return [];
        };
        return ApplicationModule;
      }());
      $__export("ApplicationModule", ApplicationModule);
    }
  };
});

System.register("@angular/core/src/error_handler.js", [], function($__export) {
  "use strict";
  var ErrorHandler;
  function ErrorHandler_tsickle_Closure_declarations() {
    ErrorHandler.prototype._console;
    ErrorHandler.prototype.rethrowError;
  }
  return {
    setters: [],
    execute: function() {
      ErrorHandler = (function() {
        function ErrorHandler(rethrowError) {
          if (rethrowError === void 0) {
            rethrowError = true;
          }
          this._console = console;
          this.rethrowError = rethrowError;
        }
        ErrorHandler.prototype.handleError = function(error) {
          var originalError = this._findOriginalError(error);
          var originalStack = this._findOriginalStack(error);
          var context = this._findContext(error);
          this._console.error("EXCEPTION: " + this._extractMessage(error));
          if (originalError) {
            this._console.error("ORIGINAL EXCEPTION: " + this._extractMessage(originalError));
          }
          if (originalStack) {
            this._console.error('ORIGINAL STACKTRACE:');
            this._console.error(originalStack);
          }
          if (context) {
            this._console.error('ERROR CONTEXT:');
            this._console.error(context);
          }
          if (this.rethrowError)
            throw error;
        };
        ErrorHandler.prototype._extractMessage = function(error) {
          return error instanceof Error ? error.message : error.toString();
        };
        ErrorHandler.prototype._findContext = function(error) {
          if (error) {
            return error.context ? error.context : this._findContext(((error)).originalError);
          }
          return null;
        };
        ErrorHandler.prototype._findOriginalError = function(error) {
          var e = ((error)).originalError;
          while (e && ((e)).originalError) {
            e = ((e)).originalError;
          }
          return e;
        };
        ErrorHandler.prototype._findOriginalStack = function(error) {
          if (!(error instanceof Error))
            return null;
          var e = error;
          var stack = e.stack;
          while (e instanceof Error && ((e)).originalError) {
            e = ((e)).originalError;
            if (e instanceof Error && e.stack) {
              stack = e.stack;
            }
          }
          return stack;
        };
        return ErrorHandler;
      }());
      $__export("ErrorHandler", ErrorHandler);
    }
  };
});

System.register("@angular/core/src/animation/animation_keyframe.js", [], function($__export) {
  "use strict";
  var AnimationKeyframe;
  function AnimationKeyframe_tsickle_Closure_declarations() {
    AnimationKeyframe.prototype.offset;
    AnimationKeyframe.prototype.styles;
  }
  return {
    setters: [],
    execute: function() {
      AnimationKeyframe = (function() {
        function AnimationKeyframe(offset, styles) {
          this.offset = offset;
          this.styles = styles;
        }
        return AnimationKeyframe;
      }());
      $__export("AnimationKeyframe", AnimationKeyframe);
    }
  };
});

System.register("@angular/core/src/animation/animation_constants.js", [], function($__export) {
  "use strict";
  var FILL_STYLE_FLAG,
      ANY_STATE,
      DEFAULT_STATE,
      EMPTY_STATE;
  return {
    setters: [],
    execute: function() {
      FILL_STYLE_FLAG = 'true';
      $__export("FILL_STYLE_FLAG", FILL_STYLE_FLAG);
      ANY_STATE = '*';
      $__export("ANY_STATE", ANY_STATE);
      DEFAULT_STATE = '*';
      $__export("DEFAULT_STATE", DEFAULT_STATE);
      EMPTY_STATE = 'void';
      $__export("EMPTY_STATE", EMPTY_STATE);
    }
  };
});

System.register("@angular/core/src/animation/animation_style_util.js", ["../facade/collection", "../facade/lang", "./animation_constants", "./metadata"], function($__export) {
  "use strict";
  var StringMapWrapper,
      isPresent,
      FILL_STYLE_FLAG,
      AUTO_STYLE;
  function prepareFinalAnimationStyles(previousStyles, newStyles, nullValue) {
    if (nullValue === void 0) {
      nullValue = null;
    }
    var finalStyles = {};
    Object.keys(newStyles).forEach(function(prop) {
      var value = newStyles[prop];
      finalStyles[prop] = value == AUTO_STYLE ? nullValue : value.toString();
    });
    Object.keys(previousStyles).forEach(function(prop) {
      if (!isPresent(finalStyles[prop])) {
        finalStyles[prop] = nullValue;
      }
    });
    return finalStyles;
  }
  function balanceAnimationKeyframes(collectedStyles, finalStateStyles, keyframes) {
    var limit = keyframes.length - 1;
    var firstKeyframe = keyframes[0];
    var flatenedFirstKeyframeStyles = flattenStyles(firstKeyframe.styles.styles);
    var extraFirstKeyframeStyles = {};
    var hasExtraFirstStyles = false;
    Object.keys(collectedStyles).forEach(function(prop) {
      var value = (collectedStyles[prop]);
      if (!flatenedFirstKeyframeStyles[prop]) {
        flatenedFirstKeyframeStyles[prop] = value;
        extraFirstKeyframeStyles[prop] = value;
        hasExtraFirstStyles = true;
      }
    });
    var keyframeCollectedStyles = StringMapWrapper.merge({}, flatenedFirstKeyframeStyles);
    var finalKeyframe = keyframes[limit];
    finalKeyframe.styles.styles.unshift(finalStateStyles);
    var flatenedFinalKeyframeStyles = flattenStyles(finalKeyframe.styles.styles);
    var extraFinalKeyframeStyles = {};
    var hasExtraFinalStyles = false;
    Object.keys(keyframeCollectedStyles).forEach(function(prop) {
      if (!isPresent(flatenedFinalKeyframeStyles[prop])) {
        extraFinalKeyframeStyles[prop] = AUTO_STYLE;
        hasExtraFinalStyles = true;
      }
    });
    if (hasExtraFinalStyles) {
      finalKeyframe.styles.styles.push(extraFinalKeyframeStyles);
    }
    Object.keys(flatenedFinalKeyframeStyles).forEach(function(prop) {
      if (!isPresent(flatenedFirstKeyframeStyles[prop])) {
        extraFirstKeyframeStyles[prop] = AUTO_STYLE;
        hasExtraFirstStyles = true;
      }
    });
    if (hasExtraFirstStyles) {
      firstKeyframe.styles.styles.push(extraFirstKeyframeStyles);
    }
    collectAndResolveStyles(collectedStyles, [finalStateStyles]);
    return keyframes;
  }
  function clearStyles(styles) {
    var finalStyles = {};
    Object.keys(styles).forEach(function(key) {
      finalStyles[key] = null;
    });
    return finalStyles;
  }
  function collectAndResolveStyles(collection, styles) {
    return styles.map(function(entry) {
      var stylesObj = {};
      Object.keys(entry).forEach(function(prop) {
        var value = entry[prop];
        if (value == FILL_STYLE_FLAG) {
          value = collection[prop];
          if (!isPresent(value)) {
            value = AUTO_STYLE;
          }
        }
        collection[prop] = value;
        stylesObj[prop] = value;
      });
      return stylesObj;
    });
  }
  function renderStyles(element, renderer, styles) {
    Object.keys(styles).forEach(function(prop) {
      renderer.setElementStyle(element, prop, styles[prop]);
    });
  }
  function flattenStyles(styles) {
    var finalStyles = {};
    styles.forEach(function(entry) {
      Object.keys(entry).forEach(function(prop) {
        finalStyles[prop] = (entry[prop]);
      });
    });
    return finalStyles;
  }
  $__export("prepareFinalAnimationStyles", prepareFinalAnimationStyles);
  $__export("balanceAnimationKeyframes", balanceAnimationKeyframes);
  $__export("clearStyles", clearStyles);
  $__export("collectAndResolveStyles", collectAndResolveStyles);
  $__export("renderStyles", renderStyles);
  $__export("flattenStyles", flattenStyles);
  return {
    setters: [function($__m) {
      StringMapWrapper = $__m.StringMapWrapper;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      FILL_STYLE_FLAG = $__m.FILL_STYLE_FLAG;
    }, function($__m) {
      AUTO_STYLE = $__m.AUTO_STYLE;
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/animation/animation_styles.js", [], function($__export) {
  "use strict";
  var AnimationStyles;
  function AnimationStyles_tsickle_Closure_declarations() {
    AnimationStyles.prototype.styles;
  }
  return {
    setters: [],
    execute: function() {
      AnimationStyles = (function() {
        function AnimationStyles(styles) {
          this.styles = styles;
        }
        return AnimationStyles;
      }());
      $__export("AnimationStyles", AnimationStyles);
    }
  };
});

System.register("@angular/core/src/animation/animation_transition.js", ["./animation_transition_event"], function($__export) {
  "use strict";
  var AnimationTransitionEvent,
      AnimationTransition;
  function AnimationTransition_tsickle_Closure_declarations() {
    AnimationTransition.prototype._player;
    AnimationTransition.prototype._fromState;
    AnimationTransition.prototype._toState;
    AnimationTransition.prototype._totalTime;
  }
  return {
    setters: [function($__m) {
      AnimationTransitionEvent = $__m.AnimationTransitionEvent;
    }],
    execute: function() {
      AnimationTransition = (function() {
        function AnimationTransition(_player, _fromState, _toState, _totalTime) {
          this._player = _player;
          this._fromState = _fromState;
          this._toState = _toState;
          this._totalTime = _totalTime;
        }
        AnimationTransition.prototype._createEvent = function(phaseName) {
          return new AnimationTransitionEvent({
            fromState: this._fromState,
            toState: this._toState,
            totalTime: this._totalTime,
            phaseName: phaseName
          });
        };
        AnimationTransition.prototype.onStart = function(callback) {
          var _this = this;
          var fn = (Zone.current.wrap(function() {
            return callback(_this._createEvent('start'));
          }, 'player.onStart'));
          this._player.onStart(fn);
        };
        AnimationTransition.prototype.onDone = function(callback) {
          var _this = this;
          var fn = (Zone.current.wrap(function() {
            return callback(_this._createEvent('done'));
          }, 'player.onDone'));
          this._player.onDone(fn);
        };
        return AnimationTransition;
      }());
      $__export("AnimationTransition", AnimationTransition);
    }
  };
});

System.register("@angular/core/src/application_tokens.js", ["./di"], function($__export) {
  "use strict";
  var OpaqueToken,
      APP_ID,
      APP_ID_RANDOM_PROVIDER,
      PLATFORM_INITIALIZER,
      APP_BOOTSTRAP_LISTENER,
      PACKAGE_ROOT_URL;
  function _appIdRandomProviderFactory() {
    return "" + _randomChar() + _randomChar() + _randomChar();
  }
  function _randomChar() {
    return String.fromCharCode(97 + Math.floor(Math.random() * 25));
  }
  $__export("_appIdRandomProviderFactory", _appIdRandomProviderFactory);
  return {
    setters: [function($__m) {
      OpaqueToken = $__m.OpaqueToken;
    }],
    execute: function() {
      APP_ID = new OpaqueToken('AppId');
      $__export("APP_ID", APP_ID);
      APP_ID_RANDOM_PROVIDER = {
        provide: APP_ID,
        useFactory: _appIdRandomProviderFactory,
        deps: ([])
      };
      $__export("APP_ID_RANDOM_PROVIDER", APP_ID_RANDOM_PROVIDER);
      PLATFORM_INITIALIZER = new OpaqueToken('Platform Initializer');
      $__export("PLATFORM_INITIALIZER", PLATFORM_INITIALIZER);
      APP_BOOTSTRAP_LISTENER = new OpaqueToken('appBootstrapListener');
      $__export("APP_BOOTSTRAP_LISTENER", APP_BOOTSTRAP_LISTENER);
      PACKAGE_ROOT_URL = new OpaqueToken('Application Packages Root URL');
      $__export("PACKAGE_ROOT_URL", PACKAGE_ROOT_URL);
    }
  };
});

System.register("@angular/core/src/console.js", ["./di", "./facade/lang"], function($__export) {
  "use strict";
  var Injectable,
      print,
      warn,
      Console;
  function Console_tsickle_Closure_declarations() {
    Console.decorators;
    Console.ctorParameters;
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      print = $__m.print;
      warn = $__m.warn;
    }],
    execute: function() {
      Console = (function() {
        function Console() {}
        Console.prototype.log = function(message) {
          print(message);
        };
        Console.prototype.warn = function(message) {
          warn(message);
        };
        Console.decorators = [{type: Injectable}];
        Console.ctorParameters = function() {
          return [];
        };
        return Console;
      }());
      $__export("Console", Console);
    }
  };
});

System.register("@angular/core/src/debug/debug_node.js", [], function($__export) {
  "use strict";
  var __extends,
      EventListener,
      DebugNode,
      DebugElement,
      _nativeNodeToDebugNode;
  function EventListener_tsickle_Closure_declarations() {
    EventListener.prototype.name;
    EventListener.prototype.callback;
  }
  function DebugNode_tsickle_Closure_declarations() {
    DebugNode.prototype.nativeNode;
    DebugNode.prototype.listeners;
    DebugNode.prototype.parent;
    DebugNode.prototype._debugInfo;
  }
  function DebugElement_tsickle_Closure_declarations() {
    DebugElement.prototype.name;
    DebugElement.prototype.properties;
    DebugElement.prototype.attributes;
    DebugElement.prototype.classes;
    DebugElement.prototype.styles;
    DebugElement.prototype.childNodes;
    DebugElement.prototype.nativeElement;
  }
  function asNativeElements(debugEls) {
    return debugEls.map(function(el) {
      return el.nativeElement;
    });
  }
  function _queryElementChildren(element, predicate, matches) {
    element.childNodes.forEach(function(node) {
      if (node instanceof DebugElement) {
        if (predicate(node)) {
          matches.push(node);
        }
        _queryElementChildren(node, predicate, matches);
      }
    });
  }
  function _queryNodeChildren(parentNode, predicate, matches) {
    if (parentNode instanceof DebugElement) {
      parentNode.childNodes.forEach(function(node) {
        if (predicate(node)) {
          matches.push(node);
        }
        if (node instanceof DebugElement) {
          _queryNodeChildren(node, predicate, matches);
        }
      });
    }
  }
  function getDebugNode(nativeNode) {
    return _nativeNodeToDebugNode.get(nativeNode);
  }
  function getAllDebugNodes() {
    return Array.from(_nativeNodeToDebugNode.values());
  }
  function indexDebugNode(node) {
    _nativeNodeToDebugNode.set(node.nativeNode, node);
  }
  function removeDebugNodeFromIndex(node) {
    _nativeNodeToDebugNode.delete(node.nativeNode);
  }
  $__export("asNativeElements", asNativeElements);
  $__export("getDebugNode", getDebugNode);
  $__export("getAllDebugNodes", getAllDebugNodes);
  $__export("indexDebugNode", indexDebugNode);
  $__export("removeDebugNodeFromIndex", removeDebugNodeFromIndex);
  return {
    setters: [],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      EventListener = (function() {
        function EventListener(name, callback) {
          this.name = name;
          this.callback = callback;
        }
        ;
        return EventListener;
      }());
      $__export("EventListener", EventListener);
      DebugNode = (function() {
        function DebugNode(nativeNode, parent, _debugInfo) {
          this._debugInfo = _debugInfo;
          this.nativeNode = nativeNode;
          if (parent && parent instanceof DebugElement) {
            parent.addChild(this);
          } else {
            this.parent = null;
          }
          this.listeners = [];
        }
        Object.defineProperty(DebugNode.prototype, "injector", {
          get: function() {
            return this._debugInfo ? this._debugInfo.injector : null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "componentInstance", {
          get: function() {
            return this._debugInfo ? this._debugInfo.component : null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "context", {
          get: function() {
            return this._debugInfo ? this._debugInfo.context : null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "references", {
          get: function() {
            return this._debugInfo ? this._debugInfo.references : null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "providerTokens", {
          get: function() {
            return this._debugInfo ? this._debugInfo.providerTokens : null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "source", {
          get: function() {
            return this._debugInfo ? this._debugInfo.source : null;
          },
          enumerable: true,
          configurable: true
        });
        return DebugNode;
      }());
      $__export("DebugNode", DebugNode);
      DebugElement = (function(_super) {
        __extends(DebugElement, _super);
        function DebugElement(nativeNode, parent, _debugInfo) {
          _super.call(this, nativeNode, parent, _debugInfo);
          this.properties = {};
          this.attributes = {};
          this.classes = {};
          this.styles = {};
          this.childNodes = [];
          this.nativeElement = nativeNode;
        }
        DebugElement.prototype.addChild = function(child) {
          if (child) {
            this.childNodes.push(child);
            child.parent = this;
          }
        };
        DebugElement.prototype.removeChild = function(child) {
          var childIndex = this.childNodes.indexOf(child);
          if (childIndex !== -1) {
            child.parent = null;
            this.childNodes.splice(childIndex, 1);
          }
        };
        DebugElement.prototype.insertChildrenAfter = function(child, newChildren) {
          var siblingIndex = this.childNodes.indexOf(child);
          if (siblingIndex !== -1) {
            var previousChildren = this.childNodes.slice(0, siblingIndex + 1);
            var nextChildren = this.childNodes.slice(siblingIndex + 1);
            this.childNodes = previousChildren.concat(newChildren, nextChildren);
            for (var i = 0; i < newChildren.length; ++i) {
              var newChild = newChildren[i];
              if (newChild.parent) {
                newChild.parent.removeChild(newChild);
              }
              newChild.parent = this;
            }
          }
        };
        DebugElement.prototype.query = function(predicate) {
          var results = this.queryAll(predicate);
          return results[0] || null;
        };
        DebugElement.prototype.queryAll = function(predicate) {
          var matches = [];
          _queryElementChildren(this, predicate, matches);
          return matches;
        };
        DebugElement.prototype.queryAllNodes = function(predicate) {
          var matches = [];
          _queryNodeChildren(this, predicate, matches);
          return matches;
        };
        Object.defineProperty(DebugElement.prototype, "children", {
          get: function() {
            return (this.childNodes.filter(function(node) {
              return node instanceof DebugElement;
            }));
          },
          enumerable: true,
          configurable: true
        });
        DebugElement.prototype.triggerEventHandler = function(eventName, eventObj) {
          this.listeners.forEach(function(listener) {
            if (listener.name == eventName) {
              listener.callback(eventObj);
            }
          });
        };
        return DebugElement;
      }(DebugNode));
      $__export("DebugElement", DebugElement);
      _nativeNodeToDebugNode = new Map();
    }
  };
});

System.register("@angular/core/src/debug/debug_renderer.js", ["../facade/lang", "./debug_node"], function($__export) {
  "use strict";
  var isPresent,
      DebugElement,
      DebugNode,
      EventListener,
      getDebugNode,
      indexDebugNode,
      removeDebugNodeFromIndex,
      DebugDomRootRenderer,
      DebugDomRenderer;
  function DebugDomRootRenderer_tsickle_Closure_declarations() {
    DebugDomRootRenderer.prototype._delegate;
  }
  function DebugDomRenderer_tsickle_Closure_declarations() {
    DebugDomRenderer.prototype._delegate;
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      DebugElement = $__m.DebugElement;
      DebugNode = $__m.DebugNode;
      EventListener = $__m.EventListener;
      getDebugNode = $__m.getDebugNode;
      indexDebugNode = $__m.indexDebugNode;
      removeDebugNodeFromIndex = $__m.removeDebugNodeFromIndex;
    }],
    execute: function() {
      DebugDomRootRenderer = (function() {
        function DebugDomRootRenderer(_delegate) {
          this._delegate = _delegate;
        }
        DebugDomRootRenderer.prototype.renderComponent = function(componentProto) {
          return new DebugDomRenderer(this._delegate.renderComponent(componentProto));
        };
        return DebugDomRootRenderer;
      }());
      $__export("DebugDomRootRenderer", DebugDomRootRenderer);
      DebugDomRenderer = (function() {
        function DebugDomRenderer(_delegate) {
          this._delegate = _delegate;
        }
        DebugDomRenderer.prototype.selectRootElement = function(selectorOrNode, debugInfo) {
          var nativeEl = this._delegate.selectRootElement(selectorOrNode, debugInfo);
          var debugEl = new DebugElement(nativeEl, null, debugInfo);
          indexDebugNode(debugEl);
          return nativeEl;
        };
        DebugDomRenderer.prototype.createElement = function(parentElement, name, debugInfo) {
          var nativeEl = this._delegate.createElement(parentElement, name, debugInfo);
          var debugEl = new DebugElement(nativeEl, getDebugNode(parentElement), debugInfo);
          debugEl.name = name;
          indexDebugNode(debugEl);
          return nativeEl;
        };
        DebugDomRenderer.prototype.createViewRoot = function(hostElement) {
          return this._delegate.createViewRoot(hostElement);
        };
        DebugDomRenderer.prototype.createTemplateAnchor = function(parentElement, debugInfo) {
          var comment = this._delegate.createTemplateAnchor(parentElement, debugInfo);
          var debugEl = new DebugNode(comment, getDebugNode(parentElement), debugInfo);
          indexDebugNode(debugEl);
          return comment;
        };
        DebugDomRenderer.prototype.createText = function(parentElement, value, debugInfo) {
          var text = this._delegate.createText(parentElement, value, debugInfo);
          var debugEl = new DebugNode(text, getDebugNode(parentElement), debugInfo);
          indexDebugNode(debugEl);
          return text;
        };
        DebugDomRenderer.prototype.projectNodes = function(parentElement, nodes) {
          var debugParent = getDebugNode(parentElement);
          if (isPresent(debugParent) && debugParent instanceof DebugElement) {
            var debugElement_1 = debugParent;
            nodes.forEach(function(node) {
              debugElement_1.addChild(getDebugNode(node));
            });
          }
          this._delegate.projectNodes(parentElement, nodes);
        };
        DebugDomRenderer.prototype.attachViewAfter = function(node, viewRootNodes) {
          var debugNode = getDebugNode(node);
          if (isPresent(debugNode)) {
            var debugParent = debugNode.parent;
            if (viewRootNodes.length > 0 && isPresent(debugParent)) {
              var debugViewRootNodes_1 = [];
              viewRootNodes.forEach(function(rootNode) {
                return debugViewRootNodes_1.push(getDebugNode(rootNode));
              });
              debugParent.insertChildrenAfter(debugNode, debugViewRootNodes_1);
            }
          }
          this._delegate.attachViewAfter(node, viewRootNodes);
        };
        DebugDomRenderer.prototype.detachView = function(viewRootNodes) {
          viewRootNodes.forEach(function(node) {
            var debugNode = getDebugNode(node);
            if (isPresent(debugNode) && isPresent(debugNode.parent)) {
              debugNode.parent.removeChild(debugNode);
            }
          });
          this._delegate.detachView(viewRootNodes);
        };
        DebugDomRenderer.prototype.destroyView = function(hostElement, viewAllNodes) {
          viewAllNodes = viewAllNodes || [];
          viewAllNodes.forEach(function(node) {
            removeDebugNodeFromIndex(getDebugNode(node));
          });
          this._delegate.destroyView(hostElement, viewAllNodes);
        };
        DebugDomRenderer.prototype.listen = function(renderElement, name, callback) {
          var debugEl = getDebugNode(renderElement);
          if (isPresent(debugEl)) {
            debugEl.listeners.push(new EventListener(name, callback));
          }
          return this._delegate.listen(renderElement, name, callback);
        };
        DebugDomRenderer.prototype.listenGlobal = function(target, name, callback) {
          return this._delegate.listenGlobal(target, name, callback);
        };
        DebugDomRenderer.prototype.setElementProperty = function(renderElement, propertyName, propertyValue) {
          var debugEl = getDebugNode(renderElement);
          if (isPresent(debugEl) && debugEl instanceof DebugElement) {
            debugEl.properties[propertyName] = propertyValue;
          }
          this._delegate.setElementProperty(renderElement, propertyName, propertyValue);
        };
        DebugDomRenderer.prototype.setElementAttribute = function(renderElement, attributeName, attributeValue) {
          var debugEl = getDebugNode(renderElement);
          if (isPresent(debugEl) && debugEl instanceof DebugElement) {
            debugEl.attributes[attributeName] = attributeValue;
          }
          this._delegate.setElementAttribute(renderElement, attributeName, attributeValue);
        };
        DebugDomRenderer.prototype.setBindingDebugInfo = function(renderElement, propertyName, propertyValue) {
          this._delegate.setBindingDebugInfo(renderElement, propertyName, propertyValue);
        };
        DebugDomRenderer.prototype.setElementClass = function(renderElement, className, isAdd) {
          var debugEl = getDebugNode(renderElement);
          if (isPresent(debugEl) && debugEl instanceof DebugElement) {
            debugEl.classes[className] = isAdd;
          }
          this._delegate.setElementClass(renderElement, className, isAdd);
        };
        DebugDomRenderer.prototype.setElementStyle = function(renderElement, styleName, styleValue) {
          var debugEl = getDebugNode(renderElement);
          if (isPresent(debugEl) && debugEl instanceof DebugElement) {
            debugEl.styles[styleName] = styleValue;
          }
          this._delegate.setElementStyle(renderElement, styleName, styleValue);
        };
        DebugDomRenderer.prototype.invokeElementMethod = function(renderElement, methodName, args) {
          this._delegate.invokeElementMethod(renderElement, methodName, args);
        };
        DebugDomRenderer.prototype.setText = function(renderNode, text) {
          this._delegate.setText(renderNode, text);
        };
        DebugDomRenderer.prototype.animate = function(element, startingStyles, keyframes, duration, delay, easing, previousPlayers) {
          if (previousPlayers === void 0) {
            previousPlayers = [];
          }
          return this._delegate.animate(element, startingStyles, keyframes, duration, delay, easing, previousPlayers);
        };
        return DebugDomRenderer;
      }());
      $__export("DebugDomRenderer", DebugDomRenderer);
    }
  };
});

System.register("@angular/core/src/linker/compiler.js", ["../di", "../facade/errors", "../facade/lang"], function($__export) {
  "use strict";
  var __extends,
      OpaqueToken,
      BaseError,
      stringify,
      ComponentStillLoadingError,
      ModuleWithComponentFactories,
      Compiler,
      COMPILER_OPTIONS,
      CompilerFactory;
  function ComponentStillLoadingError_tsickle_Closure_declarations() {
    ComponentStillLoadingError.prototype.compType;
  }
  function ModuleWithComponentFactories_tsickle_Closure_declarations() {
    ModuleWithComponentFactories.prototype.ngModuleFactory;
    ModuleWithComponentFactories.prototype.componentFactories;
  }
  function _throwError() {
    throw new Error("Runtime compiler is not loaded");
  }
  return {
    setters: [function($__m) {
      OpaqueToken = $__m.OpaqueToken;
    }, function($__m) {
      BaseError = $__m.BaseError;
    }, function($__m) {
      stringify = $__m.stringify;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      ComponentStillLoadingError = (function(_super) {
        __extends(ComponentStillLoadingError, _super);
        function ComponentStillLoadingError(compType) {
          _super.call(this, "Can't compile synchronously as " + stringify(compType) + " is still being loaded!");
          this.compType = compType;
        }
        return ComponentStillLoadingError;
      }(BaseError));
      $__export("ComponentStillLoadingError", ComponentStillLoadingError);
      ModuleWithComponentFactories = (function() {
        function ModuleWithComponentFactories(ngModuleFactory, componentFactories) {
          this.ngModuleFactory = ngModuleFactory;
          this.componentFactories = componentFactories;
        }
        return ModuleWithComponentFactories;
      }());
      $__export("ModuleWithComponentFactories", ModuleWithComponentFactories);
      Compiler = (function() {
        function Compiler() {}
        Compiler.prototype.compileModuleSync = function(moduleType) {
          throw _throwError();
        };
        Compiler.prototype.compileModuleAsync = function(moduleType) {
          throw _throwError();
        };
        Compiler.prototype.compileModuleAndAllComponentsSync = function(moduleType) {
          throw _throwError();
        };
        Compiler.prototype.compileModuleAndAllComponentsAsync = function(moduleType) {
          throw _throwError();
        };
        Compiler.prototype.getNgContentSelectors = function(component) {
          throw _throwError();
        };
        Compiler.prototype.clearCache = function() {};
        Compiler.prototype.clearCacheFor = function(type) {};
        return Compiler;
      }());
      $__export("Compiler", Compiler);
      COMPILER_OPTIONS = new OpaqueToken('compilerOptions');
      $__export("COMPILER_OPTIONS", COMPILER_OPTIONS);
      CompilerFactory = (function() {
        function CompilerFactory() {}
        CompilerFactory.prototype.createCompiler = function(options) {};
        return CompilerFactory;
      }());
      $__export("CompilerFactory", CompilerFactory);
    }
  };
});

System.register("@angular/core/src/linker/component_factory.js", ["../facade/errors", "./element_ref", "./view_utils"], function($__export) {
  "use strict";
  var __extends,
      unimplemented,
      ElementRef,
      ViewUtils,
      ComponentRef,
      ComponentRef_,
      EMPTY_CONTEXT,
      ComponentFactory;
  function ComponentRef__tsickle_Closure_declarations() {
    ComponentRef_.prototype._index;
    ComponentRef_.prototype._parentView;
    ComponentRef_.prototype._nativeElement;
    ComponentRef_.prototype._component;
  }
  function ComponentFactory_tsickle_Closure_declarations() {
    ComponentFactory.prototype.selector;
    ComponentFactory.prototype._viewClass;
    ComponentFactory.prototype._componentType;
  }
  return {
    setters: [function($__m) {
      unimplemented = $__m.unimplemented;
    }, function($__m) {
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      ViewUtils = $__m.ViewUtils;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      ComponentRef = (function() {
        function ComponentRef() {}
        Object.defineProperty(ComponentRef.prototype, "location", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ComponentRef.prototype, "injector", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ComponentRef.prototype, "instance", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        ;
        Object.defineProperty(ComponentRef.prototype, "hostView", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        ;
        Object.defineProperty(ComponentRef.prototype, "changeDetectorRef", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ComponentRef.prototype, "componentType", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        ComponentRef.prototype.destroy = function() {};
        ComponentRef.prototype.onDestroy = function(callback) {};
        return ComponentRef;
      }());
      $__export("ComponentRef", ComponentRef);
      ComponentRef_ = (function(_super) {
        __extends(ComponentRef_, _super);
        function ComponentRef_(_index, _parentView, _nativeElement, _component) {
          _super.call(this);
          this._index = _index;
          this._parentView = _parentView;
          this._nativeElement = _nativeElement;
          this._component = _component;
        }
        Object.defineProperty(ComponentRef_.prototype, "location", {
          get: function() {
            return new ElementRef(this._nativeElement);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ComponentRef_.prototype, "injector", {
          get: function() {
            return this._parentView.injector(this._index);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ComponentRef_.prototype, "instance", {
          get: function() {
            return this._component;
          },
          enumerable: true,
          configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_.prototype, "hostView", {
          get: function() {
            return this._parentView.ref;
          },
          enumerable: true,
          configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_.prototype, "changeDetectorRef", {
          get: function() {
            return this._parentView.ref;
          },
          enumerable: true,
          configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_.prototype, "componentType", {
          get: function() {
            return (this._component.constructor);
          },
          enumerable: true,
          configurable: true
        });
        ComponentRef_.prototype.destroy = function() {
          this._parentView.detachAndDestroy();
        };
        ComponentRef_.prototype.onDestroy = function(callback) {
          this.hostView.onDestroy(callback);
        };
        return ComponentRef_;
      }(ComponentRef));
      $__export("ComponentRef_", ComponentRef_);
      EMPTY_CONTEXT = new Object();
      ComponentFactory = (function() {
        function ComponentFactory(selector, _viewClass, _componentType) {
          this.selector = selector;
          this._viewClass = _viewClass;
          this._componentType = _componentType;
        }
        Object.defineProperty(ComponentFactory.prototype, "componentType", {
          get: function() {
            return this._componentType;
          },
          enumerable: true,
          configurable: true
        });
        ComponentFactory.prototype.create = function(injector, projectableNodes, rootSelectorOrNode) {
          if (projectableNodes === void 0) {
            projectableNodes = null;
          }
          if (rootSelectorOrNode === void 0) {
            rootSelectorOrNode = null;
          }
          var vu = injector.get(ViewUtils);
          if (!projectableNodes) {
            projectableNodes = [];
          }
          var hostView = new this._viewClass(vu, null, null, null);
          return hostView.createHostView(rootSelectorOrNode, injector, projectableNodes);
        };
        return ComponentFactory;
      }());
      $__export("ComponentFactory", ComponentFactory);
    }
  };
});

System.register("@angular/core/src/linker/component_factory_resolver.js", ["../facade/errors", "../facade/lang"], function($__export) {
  "use strict";
  var __extends,
      BaseError,
      stringify,
      NoComponentFactoryError,
      _NullComponentFactoryResolver,
      ComponentFactoryResolver,
      CodegenComponentFactoryResolver;
  function NoComponentFactoryError_tsickle_Closure_declarations() {
    NoComponentFactoryError.prototype.component;
  }
  function ComponentFactoryResolver_tsickle_Closure_declarations() {
    ComponentFactoryResolver.NULL;
  }
  function CodegenComponentFactoryResolver_tsickle_Closure_declarations() {
    CodegenComponentFactoryResolver.prototype._factories;
    CodegenComponentFactoryResolver.prototype._parent;
  }
  return {
    setters: [function($__m) {
      BaseError = $__m.BaseError;
    }, function($__m) {
      stringify = $__m.stringify;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      NoComponentFactoryError = (function(_super) {
        __extends(NoComponentFactoryError, _super);
        function NoComponentFactoryError(component) {
          _super.call(this, "No component factory found for " + stringify(component));
          this.component = component;
        }
        return NoComponentFactoryError;
      }(BaseError));
      $__export("NoComponentFactoryError", NoComponentFactoryError);
      _NullComponentFactoryResolver = (function() {
        function _NullComponentFactoryResolver() {}
        _NullComponentFactoryResolver.prototype.resolveComponentFactory = function(component) {
          throw new NoComponentFactoryError(component);
        };
        return _NullComponentFactoryResolver;
      }());
      ComponentFactoryResolver = (function() {
        function ComponentFactoryResolver() {}
        ComponentFactoryResolver.prototype.resolveComponentFactory = function(component) {};
        ComponentFactoryResolver.NULL = new _NullComponentFactoryResolver();
        return ComponentFactoryResolver;
      }());
      $__export("ComponentFactoryResolver", ComponentFactoryResolver);
      CodegenComponentFactoryResolver = (function() {
        function CodegenComponentFactoryResolver(factories, _parent) {
          this._parent = _parent;
          this._factories = new Map();
          for (var i = 0; i < factories.length; i++) {
            var factory = factories[i];
            this._factories.set(factory.componentType, factory);
          }
        }
        CodegenComponentFactoryResolver.prototype.resolveComponentFactory = function(component) {
          var result = this._factories.get(component);
          if (!result) {
            result = this._parent.resolveComponentFactory(component);
          }
          return result;
        };
        return CodegenComponentFactoryResolver;
      }());
      $__export("CodegenComponentFactoryResolver", CodegenComponentFactoryResolver);
    }
  };
});

System.register("@angular/core/src/linker/ng_module_factory.js", ["../di/injector", "../facade/errors", "../facade/lang", "./component_factory_resolver"], function($__export) {
  "use strict";
  var __extends,
      Injector,
      THROW_IF_NOT_FOUND,
      unimplemented,
      stringify,
      CodegenComponentFactoryResolver,
      ComponentFactoryResolver,
      NgModuleRef,
      NgModuleFactory,
      _UNDEFINED,
      NgModuleInjector;
  function NgModuleFactory_tsickle_Closure_declarations() {
    NgModuleFactory.prototype._injectorClass;
    NgModuleFactory.prototype._moduleType;
  }
  function NgModuleInjector_tsickle_Closure_declarations() {
    NgModuleInjector.prototype._destroyListeners;
    NgModuleInjector.prototype._destroyed;
    NgModuleInjector.prototype.instance;
    NgModuleInjector.prototype.parent;
    NgModuleInjector.prototype.bootstrapFactories;
  }
  return {
    setters: [function($__m) {
      Injector = $__m.Injector;
      THROW_IF_NOT_FOUND = $__m.THROW_IF_NOT_FOUND;
    }, function($__m) {
      unimplemented = $__m.unimplemented;
    }, function($__m) {
      stringify = $__m.stringify;
    }, function($__m) {
      CodegenComponentFactoryResolver = $__m.CodegenComponentFactoryResolver;
      ComponentFactoryResolver = $__m.ComponentFactoryResolver;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      NgModuleRef = (function() {
        function NgModuleRef() {}
        Object.defineProperty(NgModuleRef.prototype, "injector", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgModuleRef.prototype, "componentFactoryResolver", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgModuleRef.prototype, "instance", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        NgModuleRef.prototype.destroy = function() {};
        NgModuleRef.prototype.onDestroy = function(callback) {};
        return NgModuleRef;
      }());
      $__export("NgModuleRef", NgModuleRef);
      NgModuleFactory = (function() {
        function NgModuleFactory(_injectorClass, _moduleType) {
          this._injectorClass = _injectorClass;
          this._moduleType = _moduleType;
        }
        Object.defineProperty(NgModuleFactory.prototype, "moduleType", {
          get: function() {
            return this._moduleType;
          },
          enumerable: true,
          configurable: true
        });
        NgModuleFactory.prototype.create = function(parentInjector) {
          if (!parentInjector) {
            parentInjector = Injector.NULL;
          }
          var instance = new this._injectorClass(parentInjector);
          instance.create();
          return instance;
        };
        return NgModuleFactory;
      }());
      $__export("NgModuleFactory", NgModuleFactory);
      _UNDEFINED = new Object();
      NgModuleInjector = (function(_super) {
        __extends(NgModuleInjector, _super);
        function NgModuleInjector(parent, factories, bootstrapFactories) {
          _super.call(this, factories, parent.get(ComponentFactoryResolver, ComponentFactoryResolver.NULL));
          this.parent = parent;
          this.bootstrapFactories = bootstrapFactories;
          this._destroyListeners = [];
          this._destroyed = false;
        }
        NgModuleInjector.prototype.create = function() {
          this.instance = this.createInternal();
        };
        NgModuleInjector.prototype.createInternal = function() {};
        NgModuleInjector.prototype.get = function(token, notFoundValue) {
          if (notFoundValue === void 0) {
            notFoundValue = THROW_IF_NOT_FOUND;
          }
          if (token === Injector || token === ComponentFactoryResolver) {
            return this;
          }
          var result = this.getInternal(token, _UNDEFINED);
          return result === _UNDEFINED ? this.parent.get(token, notFoundValue) : result;
        };
        NgModuleInjector.prototype.getInternal = function(token, notFoundValue) {};
        Object.defineProperty(NgModuleInjector.prototype, "injector", {
          get: function() {
            return this;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgModuleInjector.prototype, "componentFactoryResolver", {
          get: function() {
            return this;
          },
          enumerable: true,
          configurable: true
        });
        NgModuleInjector.prototype.destroy = function() {
          if (this._destroyed) {
            throw new Error("The ng module " + stringify(this.instance.constructor) + " has already been destroyed.");
          }
          this._destroyed = true;
          this.destroyInternal();
          this._destroyListeners.forEach(function(listener) {
            return listener();
          });
        };
        NgModuleInjector.prototype.onDestroy = function(callback) {
          this._destroyListeners.push(callback);
        };
        NgModuleInjector.prototype.destroyInternal = function() {};
        return NgModuleInjector;
      }(CodegenComponentFactoryResolver));
      $__export("NgModuleInjector", NgModuleInjector);
    }
  };
});

System.register("@angular/core/src/linker/ng_module_factory_loader.js", [], function($__export) {
  "use strict";
  var NgModuleFactoryLoader,
      moduleFactories;
  function registerModuleFactory(id, factory) {
    var existing = moduleFactories.get(id);
    if (existing) {
      throw new Error("Duplicate module registered for " + id + " - " + existing.moduleType.name + " vs " + factory.moduleType.name);
    }
    moduleFactories.set(id, factory);
  }
  function clearModulesForTest() {
    moduleFactories = new Map();
  }
  function getModuleFactory(id) {
    var factory = moduleFactories.get(id);
    if (!factory)
      throw new Error("No module with ID " + id + " loaded");
    return factory;
  }
  $__export("registerModuleFactory", registerModuleFactory);
  $__export("clearModulesForTest", clearModulesForTest);
  $__export("getModuleFactory", getModuleFactory);
  return {
    setters: [],
    execute: function() {
      NgModuleFactoryLoader = (function() {
        function NgModuleFactoryLoader() {}
        NgModuleFactoryLoader.prototype.load = function(path) {};
        return NgModuleFactoryLoader;
      }());
      $__export("NgModuleFactoryLoader", NgModuleFactoryLoader);
      moduleFactories = new Map();
    }
  };
});

System.register("@angular/core/src/linker/template_ref.js", ["./element_ref"], function($__export) {
  "use strict";
  var __extends,
      ElementRef,
      TemplateRef,
      TemplateRef_;
  function TemplateRef__tsickle_Closure_declarations() {
    TemplateRef_.prototype._parentView;
    TemplateRef_.prototype._nodeIndex;
    TemplateRef_.prototype._nativeElement;
  }
  return {
    setters: [function($__m) {
      ElementRef = $__m.ElementRef;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      TemplateRef = (function() {
        function TemplateRef() {}
        Object.defineProperty(TemplateRef.prototype, "elementRef", {
          get: function() {
            return null;
          },
          enumerable: true,
          configurable: true
        });
        TemplateRef.prototype.createEmbeddedView = function(context) {};
        return TemplateRef;
      }());
      $__export("TemplateRef", TemplateRef);
      TemplateRef_ = (function(_super) {
        __extends(TemplateRef_, _super);
        function TemplateRef_(_parentView, _nodeIndex, _nativeElement) {
          _super.call(this);
          this._parentView = _parentView;
          this._nodeIndex = _nodeIndex;
          this._nativeElement = _nativeElement;
        }
        TemplateRef_.prototype.createEmbeddedView = function(context) {
          var view = this._parentView.createEmbeddedViewInternal(this._nodeIndex);
          view.create(context || ({}));
          return view.ref;
        };
        Object.defineProperty(TemplateRef_.prototype, "elementRef", {
          get: function() {
            return new ElementRef(this._nativeElement);
          },
          enumerable: true,
          configurable: true
        });
        return TemplateRef_;
      }(TemplateRef));
      $__export("TemplateRef_", TemplateRef_);
    }
  };
});

System.register("@angular/core/src/animation/animation_group_player.js", ["../facade/lang"], function($__export) {
  "use strict";
  var isPresent,
      scheduleMicroTask,
      AnimationGroupPlayer;
  function AnimationGroupPlayer_tsickle_Closure_declarations() {
    AnimationGroupPlayer.prototype._onDoneFns;
    AnimationGroupPlayer.prototype._onStartFns;
    AnimationGroupPlayer.prototype._finished;
    AnimationGroupPlayer.prototype._started;
    AnimationGroupPlayer.prototype._destroyed;
    AnimationGroupPlayer.prototype.parentPlayer;
    AnimationGroupPlayer.prototype._players;
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      scheduleMicroTask = $__m.scheduleMicroTask;
    }],
    execute: function() {
      AnimationGroupPlayer = (function() {
        function AnimationGroupPlayer(_players) {
          var _this = this;
          this._players = _players;
          this._onDoneFns = [];
          this._onStartFns = [];
          this._finished = false;
          this._started = false;
          this._destroyed = false;
          this.parentPlayer = null;
          var count = 0;
          var total = this._players.length;
          if (total == 0) {
            scheduleMicroTask(function() {
              return _this._onFinish();
            });
          } else {
            this._players.forEach(function(player) {
              player.parentPlayer = _this;
              player.onDone(function() {
                if (++count >= total) {
                  _this._onFinish();
                }
              });
            });
          }
        }
        AnimationGroupPlayer.prototype._onFinish = function() {
          if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(function(fn) {
              return fn();
            });
            this._onDoneFns = [];
          }
        };
        AnimationGroupPlayer.prototype.init = function() {
          this._players.forEach(function(player) {
            return player.init();
          });
        };
        AnimationGroupPlayer.prototype.onStart = function(fn) {
          this._onStartFns.push(fn);
        };
        AnimationGroupPlayer.prototype.onDone = function(fn) {
          this._onDoneFns.push(fn);
        };
        AnimationGroupPlayer.prototype.hasStarted = function() {
          return this._started;
        };
        AnimationGroupPlayer.prototype.play = function() {
          if (!isPresent(this.parentPlayer)) {
            this.init();
          }
          if (!this.hasStarted()) {
            this._onStartFns.forEach(function(fn) {
              return fn();
            });
            this._onStartFns = [];
            this._started = true;
          }
          this._players.forEach(function(player) {
            return player.play();
          });
        };
        AnimationGroupPlayer.prototype.pause = function() {
          this._players.forEach(function(player) {
            return player.pause();
          });
        };
        AnimationGroupPlayer.prototype.restart = function() {
          this._players.forEach(function(player) {
            return player.restart();
          });
        };
        AnimationGroupPlayer.prototype.finish = function() {
          this._onFinish();
          this._players.forEach(function(player) {
            return player.finish();
          });
        };
        AnimationGroupPlayer.prototype.destroy = function() {
          if (!this._destroyed) {
            this._onFinish();
            this._players.forEach(function(player) {
              return player.destroy();
            });
            this._destroyed = true;
          }
        };
        AnimationGroupPlayer.prototype.reset = function() {
          this._players.forEach(function(player) {
            return player.reset();
          });
          this._destroyed = false;
          this._finished = false;
          this._started = false;
        };
        AnimationGroupPlayer.prototype.setPosition = function(p) {
          this._players.forEach(function(player) {
            player.setPosition(p);
          });
        };
        AnimationGroupPlayer.prototype.getPosition = function() {
          var min = 0;
          this._players.forEach(function(player) {
            var p = player.getPosition();
            min = Math.min(p, min);
          });
          return min;
        };
        Object.defineProperty(AnimationGroupPlayer.prototype, "players", {
          get: function() {
            return this._players;
          },
          enumerable: true,
          configurable: true
        });
        return AnimationGroupPlayer;
      }());
      $__export("AnimationGroupPlayer", AnimationGroupPlayer);
    }
  };
});

System.register("@angular/core/src/animation/animation_sequence_player.js", ["../facade/lang", "./animation_player"], function($__export) {
  "use strict";
  var isPresent,
      scheduleMicroTask,
      NoOpAnimationPlayer,
      AnimationSequencePlayer;
  function AnimationSequencePlayer_tsickle_Closure_declarations() {
    AnimationSequencePlayer.prototype._currentIndex;
    AnimationSequencePlayer.prototype._activePlayer;
    AnimationSequencePlayer.prototype._onDoneFns;
    AnimationSequencePlayer.prototype._onStartFns;
    AnimationSequencePlayer.prototype._finished;
    AnimationSequencePlayer.prototype._started;
    AnimationSequencePlayer.prototype._destroyed;
    AnimationSequencePlayer.prototype.parentPlayer;
    AnimationSequencePlayer.prototype._players;
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
      scheduleMicroTask = $__m.scheduleMicroTask;
    }, function($__m) {
      NoOpAnimationPlayer = $__m.NoOpAnimationPlayer;
    }],
    execute: function() {
      AnimationSequencePlayer = (function() {
        function AnimationSequencePlayer(_players) {
          var _this = this;
          this._players = _players;
          this._currentIndex = 0;
          this._onDoneFns = [];
          this._onStartFns = [];
          this._finished = false;
          this._started = false;
          this._destroyed = false;
          this.parentPlayer = null;
          this._players.forEach(function(player) {
            player.parentPlayer = _this;
          });
          this._onNext(false);
        }
        AnimationSequencePlayer.prototype._onNext = function(start) {
          var _this = this;
          if (this._finished)
            return;
          if (this._players.length == 0) {
            this._activePlayer = new NoOpAnimationPlayer();
            scheduleMicroTask(function() {
              return _this._onFinish();
            });
          } else if (this._currentIndex >= this._players.length) {
            this._activePlayer = new NoOpAnimationPlayer();
            this._onFinish();
          } else {
            var player = this._players[this._currentIndex++];
            player.onDone(function() {
              return _this._onNext(true);
            });
            this._activePlayer = player;
            if (start) {
              player.play();
            }
          }
        };
        AnimationSequencePlayer.prototype._onFinish = function() {
          if (!this._finished) {
            this._finished = true;
            this._onDoneFns.forEach(function(fn) {
              return fn();
            });
            this._onDoneFns = [];
          }
        };
        AnimationSequencePlayer.prototype.init = function() {
          this._players.forEach(function(player) {
            return player.init();
          });
        };
        AnimationSequencePlayer.prototype.onStart = function(fn) {
          this._onStartFns.push(fn);
        };
        AnimationSequencePlayer.prototype.onDone = function(fn) {
          this._onDoneFns.push(fn);
        };
        AnimationSequencePlayer.prototype.hasStarted = function() {
          return this._started;
        };
        AnimationSequencePlayer.prototype.play = function() {
          if (!isPresent(this.parentPlayer)) {
            this.init();
          }
          if (!this.hasStarted()) {
            this._onStartFns.forEach(function(fn) {
              return fn();
            });
            this._onStartFns = [];
            this._started = true;
          }
          this._activePlayer.play();
        };
        AnimationSequencePlayer.prototype.pause = function() {
          this._activePlayer.pause();
        };
        AnimationSequencePlayer.prototype.restart = function() {
          this.reset();
          if (this._players.length > 0) {
            this._players[0].restart();
          }
        };
        AnimationSequencePlayer.prototype.reset = function() {
          this._players.forEach(function(player) {
            return player.reset();
          });
          this._destroyed = false;
          this._finished = false;
          this._started = false;
        };
        AnimationSequencePlayer.prototype.finish = function() {
          this._onFinish();
          this._players.forEach(function(player) {
            return player.finish();
          });
        };
        AnimationSequencePlayer.prototype.destroy = function() {
          if (!this._destroyed) {
            this._onFinish();
            this._players.forEach(function(player) {
              return player.destroy();
            });
            this._destroyed = true;
            this._activePlayer = new NoOpAnimationPlayer();
          }
        };
        AnimationSequencePlayer.prototype.setPosition = function(p) {
          this._players[0].setPosition(p);
        };
        AnimationSequencePlayer.prototype.getPosition = function() {
          return this._players[0].getPosition();
        };
        Object.defineProperty(AnimationSequencePlayer.prototype, "players", {
          get: function() {
            return this._players;
          },
          enumerable: true,
          configurable: true
        });
        return AnimationSequencePlayer;
      }());
      $__export("AnimationSequencePlayer", AnimationSequencePlayer);
    }
  };
});

System.register("@angular/core/src/animation/view_animation_map.js", ["../facade/lang"], function($__export) {
  "use strict";
  var isPresent,
      ViewAnimationMap;
  function ViewAnimationMap_tsickle_Closure_declarations() {
    ViewAnimationMap.prototype._map;
    ViewAnimationMap.prototype._allPlayers;
  }
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      ViewAnimationMap = (function() {
        function ViewAnimationMap() {
          this._map = new Map();
          this._allPlayers = [];
        }
        ViewAnimationMap.prototype.find = function(element, animationName) {
          var playersByAnimation = this._map.get(element);
          if (isPresent(playersByAnimation)) {
            return playersByAnimation[animationName];
          }
        };
        ViewAnimationMap.prototype.findAllPlayersByElement = function(element) {
          var el = this._map.get(element);
          return el ? Object.keys(el).map(function(k) {
            return el[k];
          }) : [];
        };
        ViewAnimationMap.prototype.set = function(element, animationName, player) {
          var playersByAnimation = this._map.get(element);
          if (!isPresent(playersByAnimation)) {
            playersByAnimation = {};
          }
          var existingEntry = playersByAnimation[animationName];
          if (isPresent(existingEntry)) {
            this.remove(element, animationName);
          }
          playersByAnimation[animationName] = player;
          this._allPlayers.push(player);
          this._map.set(element, playersByAnimation);
        };
        ViewAnimationMap.prototype.getAllPlayers = function() {
          return this._allPlayers;
        };
        ViewAnimationMap.prototype.remove = function(element, animationName, targetPlayer) {
          if (targetPlayer === void 0) {
            targetPlayer = null;
          }
          var playersByAnimation = this._map.get(element);
          if (playersByAnimation) {
            var player = playersByAnimation[animationName];
            if (!targetPlayer || player === targetPlayer) {
              delete playersByAnimation[animationName];
              var index = this._allPlayers.indexOf(player);
              this._allPlayers.splice(index, 1);
              if (Object.keys(playersByAnimation).length === 0) {
                this._map.delete(element);
              }
            }
          }
        };
        return ViewAnimationMap;
      }());
      $__export("ViewAnimationMap", ViewAnimationMap);
    }
  };
});

System.register("@angular/core/src/linker/animation_view_context.js", ["../animation/animation_group_player", "../animation/animation_sequence_player", "../animation/view_animation_map"], function($__export) {
  "use strict";
  var AnimationGroupPlayer,
      AnimationSequencePlayer,
      ViewAnimationMap,
      AnimationViewContext;
  function AnimationViewContext_tsickle_Closure_declarations() {
    AnimationViewContext.prototype._players;
    AnimationViewContext.prototype._animationQueue;
  }
  function _recursePlayers(player, collectedPlayers) {
    if ((player instanceof AnimationGroupPlayer) || (player instanceof AnimationSequencePlayer)) {
      player.players.forEach(function(player) {
        return _recursePlayers(player, collectedPlayers);
      });
    } else {
      collectedPlayers.push(player);
    }
  }
  return {
    setters: [function($__m) {
      AnimationGroupPlayer = $__m.AnimationGroupPlayer;
    }, function($__m) {
      AnimationSequencePlayer = $__m.AnimationSequencePlayer;
    }, function($__m) {
      ViewAnimationMap = $__m.ViewAnimationMap;
    }],
    execute: function() {
      AnimationViewContext = (function() {
        function AnimationViewContext(_animationQueue) {
          this._animationQueue = _animationQueue;
          this._players = new ViewAnimationMap();
        }
        AnimationViewContext.prototype.onAllActiveAnimationsDone = function(callback) {
          var activeAnimationPlayers = this._players.getAllPlayers();
          if (activeAnimationPlayers.length) {
            new AnimationGroupPlayer(activeAnimationPlayers).onDone(function() {
              return callback();
            });
          } else {
            callback();
          }
        };
        AnimationViewContext.prototype.queueAnimation = function(element, animationName, player) {
          var _this = this;
          this._animationQueue.enqueue(player);
          this._players.set(element, animationName, player);
          player.onDone(function() {
            return _this._players.remove(element, animationName, player);
          });
        };
        AnimationViewContext.prototype.getAnimationPlayers = function(element, animationName) {
          if (animationName === void 0) {
            animationName = null;
          }
          var players = [];
          if (animationName) {
            var currentPlayer = this._players.find(element, animationName);
            if (currentPlayer) {
              _recursePlayers(currentPlayer, players);
            }
          } else {
            this._players.findAllPlayersByElement(element).forEach(function(player) {
              return _recursePlayers(player, players);
            });
          }
          return players;
        };
        return AnimationViewContext;
      }());
      $__export("AnimationViewContext", AnimationViewContext);
    }
  };
});

System.register("@angular/core/src/linker/debug_context.js", ["../facade/lang", "./view_type"], function($__export) {
  "use strict";
  var isBlank,
      isPresent,
      ViewType,
      StaticNodeDebugInfo,
      DebugContext;
  function StaticNodeDebugInfo_tsickle_Closure_declarations() {
    StaticNodeDebugInfo.prototype.providerTokens;
    StaticNodeDebugInfo.prototype.componentToken;
    StaticNodeDebugInfo.prototype.refTokens;
  }
  function DebugContext_tsickle_Closure_declarations() {
    DebugContext.prototype._view;
    DebugContext.prototype._nodeIndex;
    DebugContext.prototype._tplRow;
    DebugContext.prototype._tplCol;
  }
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
      isPresent = $__m.isPresent;
    }, function($__m) {
      ViewType = $__m.ViewType;
    }],
    execute: function() {
      StaticNodeDebugInfo = (function() {
        function StaticNodeDebugInfo(providerTokens, componentToken, refTokens) {
          this.providerTokens = providerTokens;
          this.componentToken = componentToken;
          this.refTokens = refTokens;
        }
        return StaticNodeDebugInfo;
      }());
      $__export("StaticNodeDebugInfo", StaticNodeDebugInfo);
      DebugContext = (function() {
        function DebugContext(_view, _nodeIndex, _tplRow, _tplCol) {
          this._view = _view;
          this._nodeIndex = _nodeIndex;
          this._tplRow = _tplRow;
          this._tplCol = _tplCol;
        }
        Object.defineProperty(DebugContext.prototype, "_staticNodeInfo", {
          get: function() {
            return isPresent(this._nodeIndex) ? this._view.staticNodeDebugInfos[this._nodeIndex] : null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "context", {
          get: function() {
            return this._view.context;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "component", {
          get: function() {
            var staticNodeInfo = this._staticNodeInfo;
            if (isPresent(staticNodeInfo) && isPresent(staticNodeInfo.componentToken)) {
              return this.injector.get(staticNodeInfo.componentToken);
            }
            return null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "componentRenderElement", {
          get: function() {
            var componentView = this._view;
            while (isPresent(componentView.parentView) && componentView.type !== ViewType.COMPONENT) {
              componentView = (componentView.parentView);
            }
            return componentView.parentElement;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "injector", {
          get: function() {
            return this._view.injector(this._nodeIndex);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "renderNode", {
          get: function() {
            if (isPresent(this._nodeIndex) && this._view.allNodes) {
              return this._view.allNodes[this._nodeIndex];
            } else {
              return null;
            }
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "providerTokens", {
          get: function() {
            var staticNodeInfo = this._staticNodeInfo;
            return isPresent(staticNodeInfo) ? staticNodeInfo.providerTokens : null;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "source", {
          get: function() {
            return this._view.componentType.templateUrl + ":" + this._tplRow + ":" + this._tplCol;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "references", {
          get: function() {
            var _this = this;
            var varValues = {};
            var staticNodeInfo = this._staticNodeInfo;
            if (isPresent(staticNodeInfo)) {
              var refs_1 = staticNodeInfo.refTokens;
              Object.keys(refs_1).forEach(function(refName) {
                var refToken = refs_1[refName];
                var varValue;
                if (isBlank(refToken)) {
                  varValue = _this._view.allNodes ? _this._view.allNodes[_this._nodeIndex] : null;
                } else {
                  varValue = _this._view.injectorGet(refToken, _this._nodeIndex, null);
                }
                varValues[refName] = varValue;
              });
            }
            return varValues;
          },
          enumerable: true,
          configurable: true
        });
        return DebugContext;
      }());
      $__export("DebugContext", DebugContext);
    }
  };
});

System.register("@angular/core/src/linker/element_injector.js", ["../di/injector"], function($__export) {
  "use strict";
  var __extends,
      Injector,
      THROW_IF_NOT_FOUND,
      ElementInjector;
  function ElementInjector_tsickle_Closure_declarations() {
    ElementInjector.prototype._view;
    ElementInjector.prototype._nodeIndex;
  }
  return {
    setters: [function($__m) {
      Injector = $__m.Injector;
      THROW_IF_NOT_FOUND = $__m.THROW_IF_NOT_FOUND;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      ElementInjector = (function(_super) {
        __extends(ElementInjector, _super);
        function ElementInjector(_view, _nodeIndex) {
          _super.call(this);
          this._view = _view;
          this._nodeIndex = _nodeIndex;
        }
        ElementInjector.prototype.get = function(token, notFoundValue) {
          if (notFoundValue === void 0) {
            notFoundValue = THROW_IF_NOT_FOUND;
          }
          return this._view.injectorGet(token, this._nodeIndex, notFoundValue);
        };
        return ElementInjector;
      }(Injector));
      $__export("ElementInjector", ElementInjector);
    }
  };
});

System.register("@angular/core/src/linker/view_ref.js", ["../change_detection/change_detector_ref", "../change_detection/constants", "../facade/errors"], function($__export) {
  "use strict";
  var __extends,
      ChangeDetectorRef,
      ChangeDetectorStatus,
      unimplemented,
      ViewRef,
      EmbeddedViewRef,
      ViewRef_;
  function ViewRef__tsickle_Closure_declarations() {
    ViewRef_.prototype._originalMode;
    ViewRef_.prototype._view;
    ViewRef_.prototype.animationQueue;
  }
  return {
    setters: [function($__m) {
      ChangeDetectorRef = $__m.ChangeDetectorRef;
    }, function($__m) {
      ChangeDetectorStatus = $__m.ChangeDetectorStatus;
    }, function($__m) {
      unimplemented = $__m.unimplemented;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      ViewRef = (function(_super) {
        __extends(ViewRef, _super);
        function ViewRef() {
          _super.apply(this, arguments);
        }
        ViewRef.prototype.destroy = function() {};
        Object.defineProperty(ViewRef.prototype, "destroyed", {
          get: function() {
            return (unimplemented());
          },
          enumerable: true,
          configurable: true
        });
        ViewRef.prototype.onDestroy = function(callback) {};
        return ViewRef;
      }(ChangeDetectorRef));
      $__export("ViewRef", ViewRef);
      EmbeddedViewRef = (function(_super) {
        __extends(EmbeddedViewRef, _super);
        function EmbeddedViewRef() {
          _super.apply(this, arguments);
        }
        Object.defineProperty(EmbeddedViewRef.prototype, "context", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(EmbeddedViewRef.prototype, "rootNodes", {
          get: function() {
            return (unimplemented());
          },
          enumerable: true,
          configurable: true
        });
        ;
        return EmbeddedViewRef;
      }(ViewRef));
      $__export("EmbeddedViewRef", EmbeddedViewRef);
      ViewRef_ = (function() {
        function ViewRef_(_view, animationQueue) {
          this._view = _view;
          this.animationQueue = animationQueue;
          this._view = _view;
          this._originalMode = this._view.cdMode;
        }
        Object.defineProperty(ViewRef_.prototype, "internalView", {
          get: function() {
            return this._view;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewRef_.prototype, "rootNodes", {
          get: function() {
            return this._view.flatRootNodes;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewRef_.prototype, "context", {
          get: function() {
            return this._view.context;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewRef_.prototype, "destroyed", {
          get: function() {
            return this._view.destroyed;
          },
          enumerable: true,
          configurable: true
        });
        ViewRef_.prototype.markForCheck = function() {
          this._view.markPathToRootAsCheckOnce();
        };
        ViewRef_.prototype.detach = function() {
          this._view.cdMode = ChangeDetectorStatus.Detached;
        };
        ViewRef_.prototype.detectChanges = function() {
          this._view.detectChanges(false);
          this.animationQueue.flush();
        };
        ViewRef_.prototype.checkNoChanges = function() {
          this._view.detectChanges(true);
        };
        ViewRef_.prototype.reattach = function() {
          this._view.cdMode = this._originalMode;
          this.markForCheck();
        };
        ViewRef_.prototype.onDestroy = function(callback) {
          if (!this._view.disposables) {
            this._view.disposables = [];
          }
          this._view.disposables.push(callback);
        };
        ViewRef_.prototype.destroy = function() {
          this._view.detachAndDestroy();
        };
        return ViewRef_;
      }());
      $__export("ViewRef_", ViewRef_);
    }
  };
});

System.register("@angular/core/src/linker/view.js", ["../change_detection/change_detection", "../di/injector", "../facade/lang", "../profile/profile", "./animation_view_context", "./debug_context", "./element_injector", "./errors", "./view_ref", "./view_type", "./view_utils"], function($__export) {
  "use strict";
  var __extends,
      ChangeDetectorStatus,
      THROW_IF_NOT_FOUND,
      isPresent,
      wtfCreateScope,
      wtfLeave,
      AnimationViewContext,
      DebugContext,
      ElementInjector,
      ExpressionChangedAfterItHasBeenCheckedError,
      ViewDestroyedError,
      ViewWrappedError,
      ViewRef_,
      ViewType,
      addToArray,
      _scope_check,
      EMPTY_CONTEXT,
      UNDEFINED,
      AppView,
      DebugAppView;
  function AppView_tsickle_Closure_declarations() {
    AppView.prototype.ref;
    AppView.prototype.lastRootNode;
    AppView.prototype.allNodes;
    AppView.prototype.disposables;
    AppView.prototype.viewContainer;
    AppView.prototype.appRef;
    AppView.prototype.numberOfChecks;
    AppView.prototype.renderer;
    AppView.prototype._hasExternalHostElement;
    AppView.prototype._hostInjector;
    AppView.prototype._hostProjectableNodes;
    AppView.prototype._animationContext;
    AppView.prototype._directRenderer;
    AppView.prototype.context;
    AppView.prototype.clazz;
    AppView.prototype.componentType;
    AppView.prototype.type;
    AppView.prototype.viewUtils;
    AppView.prototype.parentView;
    AppView.prototype.parentIndex;
    AppView.prototype.parentElement;
    AppView.prototype.cdMode;
    AppView.prototype.declaredViewContainer;
  }
  function DebugAppView_tsickle_Closure_declarations() {
    DebugAppView.prototype._currentDebugContext;
    DebugAppView.prototype.staticNodeDebugInfos;
  }
  return {
    setters: [function($__m) {
      ChangeDetectorStatus = $__m.ChangeDetectorStatus;
    }, function($__m) {
      THROW_IF_NOT_FOUND = $__m.THROW_IF_NOT_FOUND;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      wtfCreateScope = $__m.wtfCreateScope;
      wtfLeave = $__m.wtfLeave;
    }, function($__m) {
      AnimationViewContext = $__m.AnimationViewContext;
    }, function($__m) {
      DebugContext = $__m.DebugContext;
    }, function($__m) {
      ElementInjector = $__m.ElementInjector;
    }, function($__m) {
      ExpressionChangedAfterItHasBeenCheckedError = $__m.ExpressionChangedAfterItHasBeenCheckedError;
      ViewDestroyedError = $__m.ViewDestroyedError;
      ViewWrappedError = $__m.ViewWrappedError;
    }, function($__m) {
      ViewRef_ = $__m.ViewRef_;
    }, function($__m) {
      ViewType = $__m.ViewType;
    }, function($__m) {
      addToArray = $__m.addToArray;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      _scope_check = wtfCreateScope("AppView#check(ascii id)");
      EMPTY_CONTEXT = new Object();
      UNDEFINED = new Object();
      AppView = (function() {
        function AppView(clazz, componentType, type, viewUtils, parentView, parentIndex, parentElement, cdMode, declaredViewContainer) {
          if (declaredViewContainer === void 0) {
            declaredViewContainer = null;
          }
          this.clazz = clazz;
          this.componentType = componentType;
          this.type = type;
          this.viewUtils = viewUtils;
          this.parentView = parentView;
          this.parentIndex = parentIndex;
          this.parentElement = parentElement;
          this.cdMode = cdMode;
          this.declaredViewContainer = declaredViewContainer;
          this.numberOfChecks = 0;
          this.ref = new ViewRef_(this, viewUtils.animationQueue);
          if (type === ViewType.COMPONENT || type === ViewType.HOST) {
            this.renderer = viewUtils.renderComponent(componentType);
          } else {
            this.renderer = parentView.renderer;
          }
          this._directRenderer = this.renderer.directRenderer;
        }
        Object.defineProperty(AppView.prototype, "animationContext", {
          get: function() {
            if (!this._animationContext) {
              this._animationContext = new AnimationViewContext(this.viewUtils.animationQueue);
            }
            return this._animationContext;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(AppView.prototype, "destroyed", {
          get: function() {
            return this.cdMode === ChangeDetectorStatus.Destroyed;
          },
          enumerable: true,
          configurable: true
        });
        AppView.prototype.create = function(context) {
          this.context = context;
          return this.createInternal(null);
        };
        AppView.prototype.createHostView = function(rootSelectorOrNode, hostInjector, projectableNodes) {
          this.context = (EMPTY_CONTEXT);
          this._hasExternalHostElement = isPresent(rootSelectorOrNode);
          this._hostInjector = hostInjector;
          this._hostProjectableNodes = projectableNodes;
          return this.createInternal(rootSelectorOrNode);
        };
        AppView.prototype.createInternal = function(rootSelectorOrNode) {
          return null;
        };
        AppView.prototype.createEmbeddedViewInternal = function(templateNodeIndex) {
          return null;
        };
        AppView.prototype.init = function(lastRootNode, allNodes, disposables) {
          this.lastRootNode = lastRootNode;
          this.allNodes = allNodes;
          this.disposables = disposables;
          if (this.type === ViewType.COMPONENT) {
            this.dirtyParentQueriesInternal();
          }
        };
        AppView.prototype.injectorGet = function(token, nodeIndex, notFoundValue) {
          if (notFoundValue === void 0) {
            notFoundValue = THROW_IF_NOT_FOUND;
          }
          var result = UNDEFINED;
          var view = this;
          while (result === UNDEFINED) {
            if (isPresent(nodeIndex)) {
              result = view.injectorGetInternal(token, nodeIndex, UNDEFINED);
            }
            if (result === UNDEFINED && view.type === ViewType.HOST) {
              result = view._hostInjector.get(token, notFoundValue);
            }
            nodeIndex = view.parentIndex;
            view = view.parentView;
          }
          return result;
        };
        AppView.prototype.injectorGetInternal = function(token, nodeIndex, notFoundResult) {
          return notFoundResult;
        };
        AppView.prototype.injector = function(nodeIndex) {
          return new ElementInjector(this, nodeIndex);
        };
        AppView.prototype.detachAndDestroy = function() {
          if (this.viewContainer) {
            this.viewContainer.detachView(this.viewContainer.nestedViews.indexOf(this));
          } else if (this.appRef) {
            this.appRef.detachView(this.ref);
          } else if (this._hasExternalHostElement) {
            this.detach();
          }
          this.destroy();
        };
        AppView.prototype.destroy = function() {
          var _this = this;
          if (this.cdMode === ChangeDetectorStatus.Destroyed) {
            return;
          }
          var hostElement = this.type === ViewType.COMPONENT ? this.parentElement : null;
          if (this.disposables) {
            for (var i = 0; i < this.disposables.length; i++) {
              this.disposables[i]();
            }
          }
          this.destroyInternal();
          this.dirtyParentQueriesInternal();
          if (this._animationContext) {
            this._animationContext.onAllActiveAnimationsDone(function() {
              return _this.renderer.destroyView(hostElement, _this.allNodes);
            });
          } else {
            this.renderer.destroyView(hostElement, this.allNodes);
          }
          this.cdMode = ChangeDetectorStatus.Destroyed;
        };
        AppView.prototype.destroyInternal = function() {};
        AppView.prototype.detachInternal = function() {};
        AppView.prototype.detach = function() {
          var _this = this;
          this.detachInternal();
          if (this._animationContext) {
            this._animationContext.onAllActiveAnimationsDone(function() {
              return _this._renderDetach();
            });
          } else {
            this._renderDetach();
          }
          if (this.declaredViewContainer && this.declaredViewContainer !== this.viewContainer && this.declaredViewContainer.projectedViews) {
            var projectedViews = this.declaredViewContainer.projectedViews;
            var index = projectedViews.indexOf(this);
            if (index >= projectedViews.length - 1) {
              projectedViews.pop();
            } else {
              projectedViews.splice(index, 1);
            }
          }
          this.appRef = null;
          this.viewContainer = null;
          this.dirtyParentQueriesInternal();
        };
        AppView.prototype._renderDetach = function() {
          if (this._directRenderer) {
            this.visitRootNodesInternal(this._directRenderer.remove, null);
          } else {
            this.renderer.detachView(this.flatRootNodes);
          }
        };
        AppView.prototype.attachToAppRef = function(appRef) {
          if (this.viewContainer) {
            throw new Error('This view is already attached to a ViewContainer!');
          }
          this.appRef = appRef;
          this.dirtyParentQueriesInternal();
        };
        AppView.prototype.attachAfter = function(viewContainer, prevView) {
          if (this.appRef) {
            throw new Error('This view is already attached directly to the ApplicationRef!');
          }
          this._renderAttach(viewContainer, prevView);
          this.viewContainer = viewContainer;
          if (this.declaredViewContainer && this.declaredViewContainer !== viewContainer) {
            if (!this.declaredViewContainer.projectedViews) {
              this.declaredViewContainer.projectedViews = [];
            }
            this.declaredViewContainer.projectedViews.push(this);
          }
          this.dirtyParentQueriesInternal();
        };
        AppView.prototype.moveAfter = function(viewContainer, prevView) {
          this._renderAttach(viewContainer, prevView);
          this.dirtyParentQueriesInternal();
        };
        AppView.prototype._renderAttach = function(viewContainer, prevView) {
          var prevNode = prevView ? prevView.lastRootNode : viewContainer.nativeElement;
          if (this._directRenderer) {
            var nextSibling = this._directRenderer.nextSibling(prevNode);
            if (nextSibling) {
              this.visitRootNodesInternal(this._directRenderer.insertBefore, nextSibling);
            } else {
              var parentElement = this._directRenderer.parentElement(prevNode);
              if (parentElement) {
                this.visitRootNodesInternal(this._directRenderer.appendChild, parentElement);
              }
            }
          } else {
            this.renderer.attachViewAfter(prevNode, this.flatRootNodes);
          }
        };
        Object.defineProperty(AppView.prototype, "changeDetectorRef", {
          get: function() {
            return this.ref;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(AppView.prototype, "flatRootNodes", {
          get: function() {
            var nodes = [];
            this.visitRootNodesInternal(addToArray, nodes);
            return nodes;
          },
          enumerable: true,
          configurable: true
        });
        AppView.prototype.projectNodes = function(parentElement, ngContentIndex) {
          if (this._directRenderer) {
            this.visitProjectedNodes(ngContentIndex, this._directRenderer.appendChild, parentElement);
          } else {
            var nodes = [];
            this.visitProjectedNodes(ngContentIndex, addToArray, nodes);
            this.renderer.projectNodes(parentElement, nodes);
          }
        };
        AppView.prototype.visitProjectedNodes = function(ngContentIndex, cb, c) {
          switch (this.type) {
            case ViewType.EMBEDDED:
              this.parentView.visitProjectedNodes(ngContentIndex, cb, c);
              break;
            case ViewType.COMPONENT:
              if (this.parentView.type === ViewType.HOST) {
                var nodes = this.parentView._hostProjectableNodes[ngContentIndex] || [];
                for (var i = 0; i < nodes.length; i++) {
                  cb(nodes[i], c);
                }
              } else {
                this.parentView.visitProjectableNodesInternal(this.parentIndex, ngContentIndex, cb, c);
              }
              break;
          }
        };
        AppView.prototype.visitRootNodesInternal = function(cb, c) {};
        AppView.prototype.visitProjectableNodesInternal = function(nodeIndex, ngContentIndex, cb, c) {};
        AppView.prototype.dirtyParentQueriesInternal = function() {};
        AppView.prototype.internalDetectChanges = function(throwOnChange) {
          if (this.cdMode !== ChangeDetectorStatus.Detached) {
            this.detectChanges(throwOnChange);
          }
        };
        AppView.prototype.detectChanges = function(throwOnChange) {
          var s = _scope_check(this.clazz);
          if (this.cdMode === ChangeDetectorStatus.Checked || this.cdMode === ChangeDetectorStatus.Errored)
            return;
          if (this.cdMode === ChangeDetectorStatus.Destroyed) {
            this.throwDestroyedError('detectChanges');
          }
          this.detectChangesInternal(throwOnChange);
          if (this.cdMode === ChangeDetectorStatus.CheckOnce)
            this.cdMode = ChangeDetectorStatus.Checked;
          this.numberOfChecks++;
          wtfLeave(s);
        };
        AppView.prototype.detectChangesInternal = function(throwOnChange) {};
        AppView.prototype.markAsCheckOnce = function() {
          this.cdMode = ChangeDetectorStatus.CheckOnce;
        };
        AppView.prototype.markPathToRootAsCheckOnce = function() {
          var c = this;
          while (isPresent(c) && c.cdMode !== ChangeDetectorStatus.Detached) {
            if (c.cdMode === ChangeDetectorStatus.Checked) {
              c.cdMode = ChangeDetectorStatus.CheckOnce;
            }
            if (c.type === ViewType.COMPONENT) {
              c = c.parentView;
            } else {
              c = c.viewContainer ? c.viewContainer.parentView : null;
            }
          }
        };
        AppView.prototype.eventHandler = function(cb) {
          return cb;
        };
        AppView.prototype.throwDestroyedError = function(details) {
          throw new ViewDestroyedError(details);
        };
        return AppView;
      }());
      $__export("AppView", AppView);
      DebugAppView = (function(_super) {
        __extends(DebugAppView, _super);
        function DebugAppView(clazz, componentType, type, viewUtils, parentView, parentIndex, parentNode, cdMode, staticNodeDebugInfos, declaredViewContainer) {
          if (declaredViewContainer === void 0) {
            declaredViewContainer = null;
          }
          _super.call(this, clazz, componentType, type, viewUtils, parentView, parentIndex, parentNode, cdMode, declaredViewContainer);
          this.staticNodeDebugInfos = staticNodeDebugInfos;
          this._currentDebugContext = null;
        }
        DebugAppView.prototype.create = function(context) {
          this._resetDebug();
          try {
            return _super.prototype.create.call(this, context);
          } catch (e) {
            this._rethrowWithContext(e);
            throw e;
          }
        };
        DebugAppView.prototype.createHostView = function(rootSelectorOrNode, injector, projectableNodes) {
          if (projectableNodes === void 0) {
            projectableNodes = null;
          }
          this._resetDebug();
          try {
            return _super.prototype.createHostView.call(this, rootSelectorOrNode, injector, projectableNodes);
          } catch (e) {
            this._rethrowWithContext(e);
            throw e;
          }
        };
        DebugAppView.prototype.injectorGet = function(token, nodeIndex, notFoundResult) {
          this._resetDebug();
          try {
            return _super.prototype.injectorGet.call(this, token, nodeIndex, notFoundResult);
          } catch (e) {
            this._rethrowWithContext(e);
            throw e;
          }
        };
        DebugAppView.prototype.detach = function() {
          this._resetDebug();
          try {
            _super.prototype.detach.call(this);
          } catch (e) {
            this._rethrowWithContext(e);
            throw e;
          }
        };
        DebugAppView.prototype.destroy = function() {
          this._resetDebug();
          try {
            _super.prototype.destroy.call(this);
          } catch (e) {
            this._rethrowWithContext(e);
            throw e;
          }
        };
        DebugAppView.prototype.detectChanges = function(throwOnChange) {
          this._resetDebug();
          try {
            _super.prototype.detectChanges.call(this, throwOnChange);
          } catch (e) {
            this._rethrowWithContext(e);
            throw e;
          }
        };
        DebugAppView.prototype._resetDebug = function() {
          this._currentDebugContext = null;
        };
        DebugAppView.prototype.debug = function(nodeIndex, rowNum, colNum) {
          return this._currentDebugContext = new DebugContext(this, nodeIndex, rowNum, colNum);
        };
        DebugAppView.prototype._rethrowWithContext = function(e) {
          if (!(e instanceof ViewWrappedError)) {
            if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedError)) {
              this.cdMode = ChangeDetectorStatus.Errored;
            }
            if (isPresent(this._currentDebugContext)) {
              throw new ViewWrappedError(e, this._currentDebugContext);
            }
          }
        };
        DebugAppView.prototype.eventHandler = function(cb) {
          var _this = this;
          var superHandler = _super.prototype.eventHandler.call(this, cb);
          return function(eventName, event) {
            _this._resetDebug();
            try {
              return superHandler.call(_this, eventName, event);
            } catch (e) {
              _this._rethrowWithContext(e);
              throw e;
            }
          };
        };
        return DebugAppView;
      }(AppView));
      $__export("DebugAppView", DebugAppView);
    }
  };
});

System.register("@angular/core/src/linker/element_ref.js", [], function($__export) {
  "use strict";
  var ElementRef;
  function ElementRef_tsickle_Closure_declarations() {
    ElementRef.prototype.nativeElement;
  }
  return {
    setters: [],
    execute: function() {
      ElementRef = (function() {
        function ElementRef(nativeElement) {
          this.nativeElement = nativeElement;
        }
        return ElementRef;
      }());
      $__export("ElementRef", ElementRef);
    }
  };
});

System.register("@angular/core/src/profile/wtf_impl.js", ["../facade/lang"], function($__export) {
  "use strict";
  var global,
      trace,
      events;
  function detectWTF() {
    var wtf = ((global))['wtf'];
    if (wtf) {
      trace = wtf['trace'];
      if (trace) {
        events = trace['events'];
        return true;
      }
    }
    return false;
  }
  function createScope(signature, flags) {
    if (flags === void 0) {
      flags = null;
    }
    return events.createScope(signature, flags);
  }
  function leave(scope, returnValue) {
    trace.leaveScope(scope, returnValue);
    return returnValue;
  }
  function startTimeRange(rangeType, action) {
    return trace.beginTimeRange(rangeType, action);
  }
  function endTimeRange(range) {
    trace.endTimeRange(range);
  }
  $__export("detectWTF", detectWTF);
  $__export("createScope", createScope);
  $__export("leave", leave);
  $__export("startTimeRange", startTimeRange);
  $__export("endTimeRange", endTimeRange);
  return {
    setters: [function($__m) {
      global = $__m.global;
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/profile/profile.js", ["./wtf_impl"], function($__export) {
  "use strict";
  var createScope,
      detectWTF,
      endTimeRange,
      leave,
      startTimeRange,
      wtfEnabled,
      wtfCreateScope,
      wtfLeave,
      wtfStartTimeRange,
      wtfEndTimeRange;
  function noopScope(arg0, arg1) {
    return null;
  }
  return {
    setters: [function($__m) {
      createScope = $__m.createScope;
      detectWTF = $__m.detectWTF;
      endTimeRange = $__m.endTimeRange;
      leave = $__m.leave;
      startTimeRange = $__m.startTimeRange;
    }],
    execute: function() {
      wtfEnabled = detectWTF();
      $__export("wtfEnabled", wtfEnabled);
      wtfCreateScope = wtfEnabled ? createScope : function(signature, flags) {
        return noopScope;
      };
      $__export("wtfCreateScope", wtfCreateScope);
      wtfLeave = wtfEnabled ? leave : function(s, r) {
        return r;
      };
      $__export("wtfLeave", wtfLeave);
      wtfStartTimeRange = wtfEnabled ? startTimeRange : function(rangeType, action) {
        return null;
      };
      $__export("wtfStartTimeRange", wtfStartTimeRange);
      wtfEndTimeRange = wtfEnabled ? endTimeRange : function(r) {
        return null;
      };
      $__export("wtfEndTimeRange", wtfEndTimeRange);
    }
  };
});

System.register("@angular/core/src/linker/view_container_ref.js", ["../facade/errors", "../facade/lang", "../profile/profile"], function($__export) {
  "use strict";
  var unimplemented,
      isPresent,
      wtfCreateScope,
      wtfLeave,
      ViewContainerRef,
      ViewContainerRef_;
  function ViewContainerRef__tsickle_Closure_declarations() {
    ViewContainerRef_.prototype._createComponentInContainerScope;
    ViewContainerRef_.prototype._insertScope;
    ViewContainerRef_.prototype._removeScope;
    ViewContainerRef_.prototype._detachScope;
    ViewContainerRef_.prototype._element;
  }
  return {
    setters: [function($__m) {
      unimplemented = $__m.unimplemented;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }, function($__m) {
      wtfCreateScope = $__m.wtfCreateScope;
      wtfLeave = $__m.wtfLeave;
    }],
    execute: function() {
      ViewContainerRef = (function() {
        function ViewContainerRef() {}
        Object.defineProperty(ViewContainerRef.prototype, "element", {
          get: function() {
            return (unimplemented());
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewContainerRef.prototype, "injector", {
          get: function() {
            return (unimplemented());
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewContainerRef.prototype, "parentInjector", {
          get: function() {
            return (unimplemented());
          },
          enumerable: true,
          configurable: true
        });
        ViewContainerRef.prototype.clear = function() {};
        ViewContainerRef.prototype.get = function(index) {};
        Object.defineProperty(ViewContainerRef.prototype, "length", {
          get: function() {
            return (unimplemented());
          },
          enumerable: true,
          configurable: true
        });
        ;
        ViewContainerRef.prototype.createEmbeddedView = function(templateRef, context, index) {};
        ViewContainerRef.prototype.createComponent = function(componentFactory, index, injector, projectableNodes) {};
        ViewContainerRef.prototype.insert = function(viewRef, index) {};
        ViewContainerRef.prototype.move = function(viewRef, currentIndex) {};
        ViewContainerRef.prototype.indexOf = function(viewRef) {};
        ViewContainerRef.prototype.remove = function(index) {};
        ViewContainerRef.prototype.detach = function(index) {};
        return ViewContainerRef;
      }());
      $__export("ViewContainerRef", ViewContainerRef);
      ViewContainerRef_ = (function() {
        function ViewContainerRef_(_element) {
          this._element = _element;
          this._createComponentInContainerScope = wtfCreateScope('ViewContainerRef#createComponent()');
          this._insertScope = wtfCreateScope('ViewContainerRef#insert()');
          this._removeScope = wtfCreateScope('ViewContainerRef#remove()');
          this._detachScope = wtfCreateScope('ViewContainerRef#detach()');
        }
        ViewContainerRef_.prototype.get = function(index) {
          return this._element.nestedViews[index].ref;
        };
        Object.defineProperty(ViewContainerRef_.prototype, "length", {
          get: function() {
            var views = this._element.nestedViews;
            return isPresent(views) ? views.length : 0;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewContainerRef_.prototype, "element", {
          get: function() {
            return this._element.elementRef;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewContainerRef_.prototype, "injector", {
          get: function() {
            return this._element.injector;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewContainerRef_.prototype, "parentInjector", {
          get: function() {
            return this._element.parentInjector;
          },
          enumerable: true,
          configurable: true
        });
        ViewContainerRef_.prototype.createEmbeddedView = function(templateRef, context, index) {
          if (context === void 0) {
            context = null;
          }
          if (index === void 0) {
            index = -1;
          }
          var viewRef = templateRef.createEmbeddedView(context);
          this.insert(viewRef, index);
          return viewRef;
        };
        ViewContainerRef_.prototype.createComponent = function(componentFactory, index, injector, projectableNodes) {
          if (index === void 0) {
            index = -1;
          }
          if (injector === void 0) {
            injector = null;
          }
          if (projectableNodes === void 0) {
            projectableNodes = null;
          }
          var s = this._createComponentInContainerScope();
          var contextInjector = injector || this._element.parentInjector;
          var componentRef = componentFactory.create(contextInjector, projectableNodes);
          this.insert(componentRef.hostView, index);
          return wtfLeave(s, componentRef);
        };
        ViewContainerRef_.prototype.insert = function(viewRef, index) {
          if (index === void 0) {
            index = -1;
          }
          var s = this._insertScope();
          if (index == -1)
            index = this.length;
          var viewRef_ = (viewRef);
          this._element.attachView(viewRef_.internalView, index);
          return wtfLeave(s, viewRef_);
        };
        ViewContainerRef_.prototype.move = function(viewRef, currentIndex) {
          var s = this._insertScope();
          if (currentIndex == -1)
            return;
          var viewRef_ = (viewRef);
          this._element.moveView(viewRef_.internalView, currentIndex);
          return wtfLeave(s, viewRef_);
        };
        ViewContainerRef_.prototype.indexOf = function(viewRef) {
          return this._element.nestedViews.indexOf(((viewRef)).internalView);
        };
        ViewContainerRef_.prototype.remove = function(index) {
          if (index === void 0) {
            index = -1;
          }
          var s = this._removeScope();
          if (index == -1)
            index = this.length - 1;
          var view = this._element.detachView(index);
          view.destroy();
          wtfLeave(s);
        };
        ViewContainerRef_.prototype.detach = function(index) {
          if (index === void 0) {
            index = -1;
          }
          var s = this._detachScope();
          if (index == -1)
            index = this.length - 1;
          var view = this._element.detachView(index);
          return wtfLeave(s, view.ref);
        };
        ViewContainerRef_.prototype.clear = function() {
          for (var i = this.length - 1; i >= 0; i--) {
            this.remove(i);
          }
        };
        return ViewContainerRef_;
      }());
      $__export("ViewContainerRef_", ViewContainerRef_);
    }
  };
});

System.register("@angular/core/src/linker/view_container.js", ["./element_ref", "./view_container_ref", "./view_type"], function($__export) {
  "use strict";
  var ElementRef,
      ViewContainerRef_,
      ViewType,
      ViewContainer;
  function ViewContainer_tsickle_Closure_declarations() {
    ViewContainer.prototype.nestedViews;
    ViewContainer.prototype.projectedViews;
    ViewContainer.prototype.index;
    ViewContainer.prototype.parentIndex;
    ViewContainer.prototype.parentView;
    ViewContainer.prototype.nativeElement;
  }
  return {
    setters: [function($__m) {
      ElementRef = $__m.ElementRef;
    }, function($__m) {
      ViewContainerRef_ = $__m.ViewContainerRef_;
    }, function($__m) {
      ViewType = $__m.ViewType;
    }],
    execute: function() {
      ViewContainer = (function() {
        function ViewContainer(index, parentIndex, parentView, nativeElement) {
          this.index = index;
          this.parentIndex = parentIndex;
          this.parentView = parentView;
          this.nativeElement = nativeElement;
        }
        Object.defineProperty(ViewContainer.prototype, "elementRef", {
          get: function() {
            return new ElementRef(this.nativeElement);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewContainer.prototype, "vcRef", {
          get: function() {
            return new ViewContainerRef_(this);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewContainer.prototype, "parentInjector", {
          get: function() {
            return this.parentView.injector(this.parentIndex);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ViewContainer.prototype, "injector", {
          get: function() {
            return this.parentView.injector(this.index);
          },
          enumerable: true,
          configurable: true
        });
        ViewContainer.prototype.detectChangesInNestedViews = function(throwOnChange) {
          if (this.nestedViews) {
            for (var i = 0; i < this.nestedViews.length; i++) {
              this.nestedViews[i].detectChanges(throwOnChange);
            }
          }
        };
        ViewContainer.prototype.destroyNestedViews = function() {
          if (this.nestedViews) {
            for (var i = 0; i < this.nestedViews.length; i++) {
              this.nestedViews[i].destroy();
            }
          }
        };
        ViewContainer.prototype.visitNestedViewRootNodes = function(cb, c) {
          if (this.nestedViews) {
            for (var i = 0; i < this.nestedViews.length; i++) {
              this.nestedViews[i].visitRootNodesInternal(cb, c);
            }
          }
        };
        ViewContainer.prototype.mapNestedViews = function(nestedViewClass, callback) {
          var result = [];
          if (this.nestedViews) {
            for (var i = 0; i < this.nestedViews.length; i++) {
              var nestedView = this.nestedViews[i];
              if (nestedView.clazz === nestedViewClass) {
                result.push(callback(nestedView));
              }
            }
          }
          if (this.projectedViews) {
            for (var i = 0; i < this.projectedViews.length; i++) {
              var projectedView = this.projectedViews[i];
              if (projectedView.clazz === nestedViewClass) {
                result.push(callback(projectedView));
              }
            }
          }
          return result;
        };
        ViewContainer.prototype.moveView = function(view, currentIndex) {
          var previousIndex = this.nestedViews.indexOf(view);
          if (view.type === ViewType.COMPONENT) {
            throw new Error("Component views can't be moved!");
          }
          var nestedViews = this.nestedViews;
          if (nestedViews == null) {
            nestedViews = [];
            this.nestedViews = nestedViews;
          }
          nestedViews.splice(previousIndex, 1);
          nestedViews.splice(currentIndex, 0, view);
          var prevView = currentIndex > 0 ? nestedViews[currentIndex - 1] : null;
          view.moveAfter(this, prevView);
        };
        ViewContainer.prototype.attachView = function(view, viewIndex) {
          if (view.type === ViewType.COMPONENT) {
            throw new Error("Component views can't be moved!");
          }
          var nestedViews = this.nestedViews;
          if (nestedViews == null) {
            nestedViews = [];
            this.nestedViews = nestedViews;
          }
          if (viewIndex >= nestedViews.length) {
            nestedViews.push(view);
          } else {
            nestedViews.splice(viewIndex, 0, view);
          }
          var prevView = viewIndex > 0 ? nestedViews[viewIndex - 1] : null;
          view.attachAfter(this, prevView);
        };
        ViewContainer.prototype.detachView = function(viewIndex) {
          var view = this.nestedViews[viewIndex];
          if (viewIndex >= this.nestedViews.length - 1) {
            this.nestedViews.pop();
          } else {
            this.nestedViews.splice(viewIndex, 1);
          }
          if (view.type === ViewType.COMPONENT) {
            throw new Error("Component views can't be moved!");
          }
          view.detach();
          return view;
        };
        return ViewContainer;
      }());
      $__export("ViewContainer", ViewContainer);
    }
  };
});

System.register("@angular/core/src/linker/view_type.js", [], function($__export) {
  "use strict";
  var ViewType;
  return {
    setters: [],
    execute: function() {
      ViewType = {};
      $__export("ViewType", ViewType);
      ViewType.HOST = 0;
      ViewType.COMPONENT = 1;
      ViewType.EMBEDDED = 2;
      ViewType[ViewType.HOST] = "HOST";
      ViewType[ViewType.COMPONENT] = "COMPONENT";
      ViewType[ViewType.EMBEDDED] = "EMBEDDED";
    }
  };
});

System.registerDynamic('rxjs/util/ObjectUnsubscribedError.js', [], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __extends = this && this.__extends || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * An error thrown when an action is invalid because the object has been
     * unsubscribed.
     *
     * @see {@link Subject}
     * @see {@link BehaviorSubject}
     *
     * @class ObjectUnsubscribedError
     */
    var ObjectUnsubscribedError = function (_super) {
        __extends(ObjectUnsubscribedError, _super);
        function ObjectUnsubscribedError() {
            var err = _super.call(this, 'object unsubscribed');
            this.name = err.name = 'ObjectUnsubscribedError';
            this.stack = err.stack;
            this.message = err.message;
        }
        return ObjectUnsubscribedError;
    }(Error);
    exports.ObjectUnsubscribedError = ObjectUnsubscribedError;
    

    return module.exports;
});
System.registerDynamic("rxjs/SubjectSubscription.js", ["./Subscription"], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __extends = this && this.__extends || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Subscription_1 = $__require("./Subscription");
    /**
     * We need this JSDoc comment for affecting ESDoc.
     * @ignore
     * @extends {Ignored}
     */
    var SubjectSubscription = function (_super) {
        __extends(SubjectSubscription, _super);
        function SubjectSubscription(subject, subscriber) {
            _super.call(this);
            this.subject = subject;
            this.subscriber = subscriber;
            this.closed = false;
        }
        SubjectSubscription.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.closed = true;
            var subject = this.subject;
            var observers = subject.observers;
            this.subject = null;
            if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
                return;
            }
            var subscriberIndex = observers.indexOf(this.subscriber);
            if (subscriberIndex !== -1) {
                observers.splice(subscriberIndex, 1);
            }
        };
        return SubjectSubscription;
    }(Subscription_1.Subscription);
    exports.SubjectSubscription = SubjectSubscription;
    

    return module.exports;
});
System.registerDynamic('rxjs/Subject.js', ['./Observable', './Subscriber', './Subscription', './util/ObjectUnsubscribedError', './SubjectSubscription', './symbol/rxSubscriber'], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __extends = this && this.__extends || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Observable_1 = $__require('./Observable');
    var Subscriber_1 = $__require('./Subscriber');
    var Subscription_1 = $__require('./Subscription');
    var ObjectUnsubscribedError_1 = $__require('./util/ObjectUnsubscribedError');
    var SubjectSubscription_1 = $__require('./SubjectSubscription');
    var rxSubscriber_1 = $__require('./symbol/rxSubscriber');
    /**
     * @class SubjectSubscriber<T>
     */
    var SubjectSubscriber = function (_super) {
        __extends(SubjectSubscriber, _super);
        function SubjectSubscriber(destination) {
            _super.call(this, destination);
            this.destination = destination;
        }
        return SubjectSubscriber;
    }(Subscriber_1.Subscriber);
    exports.SubjectSubscriber = SubjectSubscriber;
    /**
     * @class Subject<T>
     */
    var Subject = function (_super) {
        __extends(Subject, _super);
        function Subject() {
            _super.call(this);
            this.observers = [];
            this.closed = false;
            this.isStopped = false;
            this.hasError = false;
            this.thrownError = null;
        }
        Subject.prototype[rxSubscriber_1.$$rxSubscriber] = function () {
            return new SubjectSubscriber(this);
        };
        Subject.prototype.lift = function (operator) {
            var subject = new AnonymousSubject(this, this);
            subject.operator = operator;
            return subject;
        };
        Subject.prototype.next = function (value) {
            if (this.closed) {
                throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
            }
            if (!this.isStopped) {
                var observers = this.observers;
                var len = observers.length;
                var copy = observers.slice();
                for (var i = 0; i < len; i++) {
                    copy[i].next(value);
                }
            }
        };
        Subject.prototype.error = function (err) {
            if (this.closed) {
                throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
            }
            this.hasError = true;
            this.thrownError = err;
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].error(err);
            }
            this.observers.length = 0;
        };
        Subject.prototype.complete = function () {
            if (this.closed) {
                throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
            }
            this.isStopped = true;
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].complete();
            }
            this.observers.length = 0;
        };
        Subject.prototype.unsubscribe = function () {
            this.isStopped = true;
            this.closed = true;
            this.observers = null;
        };
        Subject.prototype._subscribe = function (subscriber) {
            if (this.closed) {
                throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
            } else if (this.hasError) {
                subscriber.error(this.thrownError);
                return Subscription_1.Subscription.EMPTY;
            } else if (this.isStopped) {
                subscriber.complete();
                return Subscription_1.Subscription.EMPTY;
            } else {
                this.observers.push(subscriber);
                return new SubjectSubscription_1.SubjectSubscription(this, subscriber);
            }
        };
        Subject.prototype.asObservable = function () {
            var observable = new Observable_1.Observable();
            observable.source = this;
            return observable;
        };
        Subject.create = function (destination, source) {
            return new AnonymousSubject(destination, source);
        };
        return Subject;
    }(Observable_1.Observable);
    exports.Subject = Subject;
    /**
     * @class AnonymousSubject<T>
     */
    var AnonymousSubject = function (_super) {
        __extends(AnonymousSubject, _super);
        function AnonymousSubject(destination, source) {
            _super.call(this);
            this.destination = destination;
            this.source = source;
        }
        AnonymousSubject.prototype.next = function (value) {
            var destination = this.destination;
            if (destination && destination.next) {
                destination.next(value);
            }
        };
        AnonymousSubject.prototype.error = function (err) {
            var destination = this.destination;
            if (destination && destination.error) {
                this.destination.error(err);
            }
        };
        AnonymousSubject.prototype.complete = function () {
            var destination = this.destination;
            if (destination && destination.complete) {
                this.destination.complete();
            }
        };
        AnonymousSubject.prototype._subscribe = function (subscriber) {
            var source = this.source;
            if (source) {
                return this.source.subscribe(subscriber);
            } else {
                return Subscription_1.Subscription.EMPTY;
            }
        };
        return AnonymousSubject;
    }(Subject);
    exports.AnonymousSubject = AnonymousSubject;
    

    return module.exports;
});
System.registerDynamic("rxjs/util/isArray.js", [], true, function ($__require, exports, module) {
  "use strict";

  var define,
      global = this || self,
      GLOBAL = global;
  exports.isArray = Array.isArray || function (x) {
    return x && typeof x.length === 'number';
  };
  

  return module.exports;
});
System.registerDynamic("rxjs/util/isObject.js", [], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    function isObject(x) {
        return x != null && typeof x === 'object';
    }
    exports.isObject = isObject;
    

    return module.exports;
});
System.registerDynamic("rxjs/util/isFunction.js", [], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    function isFunction(x) {
        return typeof x === 'function';
    }
    exports.isFunction = isFunction;
    

    return module.exports;
});
System.registerDynamic("rxjs/util/tryCatch.js", ["./errorObject"], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var errorObject_1 = $__require("./errorObject");
    var tryCatchTarget;
    function tryCatcher() {
        try {
            return tryCatchTarget.apply(this, arguments);
        } catch (e) {
            errorObject_1.errorObject.e = e;
            return errorObject_1.errorObject;
        }
    }
    function tryCatch(fn) {
        tryCatchTarget = fn;
        return tryCatcher;
    }
    exports.tryCatch = tryCatch;
    ;
    

    return module.exports;
});
System.registerDynamic("rxjs/util/errorObject.js", [], true, function ($__require, exports, module) {
  "use strict";
  // typeof any so that it we don't have to cast when comparing a result to the error object

  var define,
      global = this || self,
      GLOBAL = global;
  exports.errorObject = { e: {} };
  

  return module.exports;
});
System.registerDynamic("rxjs/util/UnsubscriptionError.js", [], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __extends = this && this.__extends || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * An error thrown when one or more errors have occurred during the
     * `unsubscribe` of a {@link Subscription}.
     */
    var UnsubscriptionError = function (_super) {
        __extends(UnsubscriptionError, _super);
        function UnsubscriptionError(errors) {
            _super.call(this);
            this.errors = errors;
            var err = Error.call(this, errors ? errors.length + " errors occurred during unsubscription:\n  " + errors.map(function (err, i) {
                return i + 1 + ") " + err.toString();
            }).join('\n  ') : '');
            this.name = err.name = 'UnsubscriptionError';
            this.stack = err.stack;
            this.message = err.message;
        }
        return UnsubscriptionError;
    }(Error);
    exports.UnsubscriptionError = UnsubscriptionError;
    

    return module.exports;
});
System.registerDynamic('rxjs/Subscription.js', ['./util/isArray', './util/isObject', './util/isFunction', './util/tryCatch', './util/errorObject', './util/UnsubscriptionError'], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var isArray_1 = $__require('./util/isArray');
    var isObject_1 = $__require('./util/isObject');
    var isFunction_1 = $__require('./util/isFunction');
    var tryCatch_1 = $__require('./util/tryCatch');
    var errorObject_1 = $__require('./util/errorObject');
    var UnsubscriptionError_1 = $__require('./util/UnsubscriptionError');
    /**
     * Represents a disposable resource, such as the execution of an Observable. A
     * Subscription has one important method, `unsubscribe`, that takes no argument
     * and just disposes the resource held by the subscription.
     *
     * Additionally, subscriptions may be grouped together through the `add()`
     * method, which will attach a child Subscription to the current Subscription.
     * When a Subscription is unsubscribed, all its children (and its grandchildren)
     * will be unsubscribed as well.
     *
     * @class Subscription
     */
    var Subscription = function () {
        /**
         * @param {function(): void} [unsubscribe] A function describing how to
         * perform the disposal of resources when the `unsubscribe` method is called.
         */
        function Subscription(unsubscribe) {
            /**
             * A flag to indicate whether this Subscription has already been unsubscribed.
             * @type {boolean}
             */
            this.closed = false;
            if (unsubscribe) {
                this._unsubscribe = unsubscribe;
            }
        }
        /**
         * Disposes the resources held by the subscription. May, for instance, cancel
         * an ongoing Observable execution or cancel any other type of work that
         * started when the Subscription was created.
         * @return {void}
         */
        Subscription.prototype.unsubscribe = function () {
            var hasErrors = false;
            var errors;
            if (this.closed) {
                return;
            }
            this.closed = true;
            var _a = this,
                _unsubscribe = _a._unsubscribe,
                _subscriptions = _a._subscriptions;
            this._subscriptions = null;
            if (isFunction_1.isFunction(_unsubscribe)) {
                var trial = tryCatch_1.tryCatch(_unsubscribe).call(this);
                if (trial === errorObject_1.errorObject) {
                    hasErrors = true;
                    (errors = errors || []).push(errorObject_1.errorObject.e);
                }
            }
            if (isArray_1.isArray(_subscriptions)) {
                var index = -1;
                var len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject_1.isObject(sub)) {
                        var trial = tryCatch_1.tryCatch(sub.unsubscribe).call(sub);
                        if (trial === errorObject_1.errorObject) {
                            hasErrors = true;
                            errors = errors || [];
                            var err = errorObject_1.errorObject.e;
                            if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
                                errors = errors.concat(err.errors);
                            } else {
                                errors.push(err);
                            }
                        }
                    }
                }
            }
            if (hasErrors) {
                throw new UnsubscriptionError_1.UnsubscriptionError(errors);
            }
        };
        /**
         * Adds a tear down to be called during the unsubscribe() of this
         * Subscription.
         *
         * If the tear down being added is a subscription that is already
         * unsubscribed, is the same reference `add` is being called on, or is
         * `Subscription.EMPTY`, it will not be added.
         *
         * If this subscription is already in an `closed` state, the passed
         * tear down logic will be executed immediately.
         *
         * @param {TeardownLogic} teardown The additional logic to execute on
         * teardown.
         * @return {Subscription} Returns the Subscription used or created to be
         * added to the inner subscriptions list. This Subscription can be used with
         * `remove()` to remove the passed teardown logic from the inner subscriptions
         * list.
         */
        Subscription.prototype.add = function (teardown) {
            if (!teardown || teardown === Subscription.EMPTY) {
                return Subscription.EMPTY;
            }
            if (teardown === this) {
                return this;
            }
            var sub = teardown;
            switch (typeof teardown) {
                case 'function':
                    sub = new Subscription(teardown);
                case 'object':
                    if (sub.closed || typeof sub.unsubscribe !== 'function') {
                        break;
                    } else if (this.closed) {
                        sub.unsubscribe();
                    } else {
                        (this._subscriptions || (this._subscriptions = [])).push(sub);
                    }
                    break;
                default:
                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
            }
            return sub;
        };
        /**
         * Removes a Subscription from the internal list of subscriptions that will
         * unsubscribe during the unsubscribe process of this Subscription.
         * @param {Subscription} subscription The subscription to remove.
         * @return {void}
         */
        Subscription.prototype.remove = function (subscription) {
            // HACK: This might be redundant because of the logic in `add()`
            if (subscription == null || subscription === this || subscription === Subscription.EMPTY) {
                return;
            }
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        Subscription.EMPTY = function (empty) {
            empty.closed = true;
            return empty;
        }(new Subscription());
        return Subscription;
    }();
    exports.Subscription = Subscription;
    

    return module.exports;
});
System.registerDynamic('rxjs/Subscriber.js', ['./util/isFunction', './Subscription', './Observer', './symbol/rxSubscriber'], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __extends = this && this.__extends || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var isFunction_1 = $__require('./util/isFunction');
    var Subscription_1 = $__require('./Subscription');
    var Observer_1 = $__require('./Observer');
    var rxSubscriber_1 = $__require('./symbol/rxSubscriber');
    /**
     * Implements the {@link Observer} interface and extends the
     * {@link Subscription} class. While the {@link Observer} is the public API for
     * consuming the values of an {@link Observable}, all Observers get converted to
     * a Subscriber, in order to provide Subscription-like capabilities such as
     * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
     * implementing operators, but it is rarely used as a public API.
     *
     * @class Subscriber<T>
     */
    var Subscriber = function (_super) {
        __extends(Subscriber, _super);
        /**
         * @param {Observer|function(value: T): void} [destinationOrNext] A partially
         * defined Observer or a `next` callback function.
         * @param {function(e: ?any): void} [error] The `error` callback of an
         * Observer.
         * @param {function(): void} [complete] The `complete` callback of an
         * Observer.
         */
        function Subscriber(destinationOrNext, error, complete) {
            _super.call(this);
            this.syncErrorValue = null;
            this.syncErrorThrown = false;
            this.syncErrorThrowable = false;
            this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    this.destination = Observer_1.empty;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        this.destination = Observer_1.empty;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (destinationOrNext instanceof Subscriber) {
                            this.destination = destinationOrNext;
                            this.destination.add(this);
                        } else {
                            this.syncErrorThrowable = true;
                            this.destination = new SafeSubscriber(this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    this.syncErrorThrowable = true;
                    this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
                    break;
            }
        }
        Subscriber.prototype[rxSubscriber_1.$$rxSubscriber] = function () {
            return this;
        };
        /**
         * A static factory for a Subscriber, given a (potentially partial) definition
         * of an Observer.
         * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
         * @param {function(e: ?any): void} [error] The `error` callback of an
         * Observer.
         * @param {function(): void} [complete] The `complete` callback of an
         * Observer.
         * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
         * Observer represented by the given arguments.
         */
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        /**
         * The {@link Observer} callback to receive notifications of type `next` from
         * the Observable, with a value. The Observable may call this method 0 or more
         * times.
         * @param {T} [value] The `next` value.
         * @return {void}
         */
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        /**
         * The {@link Observer} callback to receive notifications of type `error` from
         * the Observable, with an attached {@link Error}. Notifies the Observer that
         * the Observable has experienced an error condition.
         * @param {any} [err] The `error` exception.
         * @return {void}
         */
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        /**
         * The {@link Observer} callback to receive a valueless notification of type
         * `complete` from the Observable. Notifies the Observer that the Observable
         * has finished sending push-based notifications.
         * @return {void}
         */
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        return Subscriber;
    }(Subscription_1.Subscription);
    exports.Subscriber = Subscriber;
    /**
     * We need this JSDoc comment for affecting ESDoc.
     * @ignore
     * @extends {Ignored}
     */
    var SafeSubscriber = function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(_parent, observerOrNext, error, complete) {
            _super.call(this);
            this._parent = _parent;
            var next;
            var context = this;
            if (isFunction_1.isFunction(observerOrNext)) {
                next = observerOrNext;
            } else if (observerOrNext) {
                context = observerOrNext;
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (isFunction_1.isFunction(context.unsubscribe)) {
                    this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = this.unsubscribe.bind(this);
            }
            this._context = context;
            this._next = next;
            this._error = error;
            this._complete = complete;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parent = this._parent;
                if (!_parent.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                } else if (this.__tryOrSetError(_parent, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parent = this._parent;
                if (this._error) {
                    if (!_parent.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    } else {
                        this.__tryOrSetError(_parent, this._error, err);
                        this.unsubscribe();
                    }
                } else if (!_parent.syncErrorThrowable) {
                    this.unsubscribe();
                    throw err;
                } else {
                    _parent.syncErrorValue = err;
                    _parent.syncErrorThrown = true;
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            if (!this.isStopped) {
                var _parent = this._parent;
                if (this._complete) {
                    if (!_parent.syncErrorThrowable) {
                        this.__tryOrUnsub(this._complete);
                        this.unsubscribe();
                    } else {
                        this.__tryOrSetError(_parent, this._complete);
                        this.unsubscribe();
                    }
                } else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            } catch (err) {
                this.unsubscribe();
                throw err;
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            try {
                fn.call(this._context, value);
            } catch (err) {
                parent.syncErrorValue = err;
                parent.syncErrorThrown = true;
                return true;
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parent = this._parent;
            this._context = null;
            this._parent = null;
            _parent.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber);
    

    return module.exports;
});
System.registerDynamic('rxjs/symbol/rxSubscriber.js', ['../util/root'], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var root_1 = $__require('../util/root');
    var Symbol = root_1.root.Symbol;
    exports.$$rxSubscriber = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol.for('rxSubscriber') : '@@rxSubscriber';
    

    return module.exports;
});
System.registerDynamic("rxjs/Observer.js", [], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    exports.empty = {
        closed: true,
        next: function (value) {},
        error: function (err) {
            throw err;
        },
        complete: function () {}
    };
    

    return module.exports;
});
System.registerDynamic('rxjs/util/toSubscriber.js', ['../Subscriber', '../symbol/rxSubscriber', '../Observer'], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var Subscriber_1 = $__require('../Subscriber');
    var rxSubscriber_1 = $__require('../symbol/rxSubscriber');
    var Observer_1 = $__require('../Observer');
    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver) {
            if (nextOrObserver instanceof Subscriber_1.Subscriber) {
                return nextOrObserver;
            }
            if (nextOrObserver[rxSubscriber_1.$$rxSubscriber]) {
                return nextOrObserver[rxSubscriber_1.$$rxSubscriber]();
            }
        }
        if (!nextOrObserver && !error && !complete) {
            return new Subscriber_1.Subscriber(Observer_1.empty);
        }
        return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
    }
    exports.toSubscriber = toSubscriber;
    

    return module.exports;
});
System.registerDynamic('rxjs/util/root.js', [], true, function ($__require, exports, module) {
    "use strict";
    /**
     * window: browser in DOM main thread
     * self: browser in WebWorker
     * global: Node.js/other
     */

    var define,
        global = this || self,
        GLOBAL = global;
    exports.root = typeof window == 'object' && window.window === window && window || typeof self == 'object' && self.self === self && self || typeof global == 'object' && global.global === global && global;
    if (!exports.root) {
        throw new Error('RxJS could not find any global context (window, self, global)');
    }
    

    return module.exports;
});
System.registerDynamic('rxjs/symbol/observable.js', ['../util/root'], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var root_1 = $__require('../util/root');
    function getSymbolObservable(context) {
        var $$observable;
        var Symbol = context.Symbol;
        if (typeof Symbol === 'function') {
            if (Symbol.observable) {
                $$observable = Symbol.observable;
            } else {
                $$observable = Symbol('observable');
                Symbol.observable = $$observable;
            }
        } else {
            $$observable = '@@observable';
        }
        return $$observable;
    }
    exports.getSymbolObservable = getSymbolObservable;
    exports.$$observable = getSymbolObservable(root_1.root);
    

    return module.exports;
});
System.registerDynamic('rxjs/Observable.js', ['./util/root', './util/toSubscriber', './symbol/observable'], true, function ($__require, exports, module) {
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var root_1 = $__require('./util/root');
    var toSubscriber_1 = $__require('./util/toSubscriber');
    var observable_1 = $__require('./symbol/observable');
    /**
     * A representation of any set of values over any amount of time. This the most basic building block
     * of RxJS.
     *
     * @class Observable<T>
     */
    var Observable = function () {
        /**
         * @constructor
         * @param {Function} subscribe the function that is  called when the Observable is
         * initially subscribed to. This function is given a Subscriber, to which new values
         * can be `next`ed, or an `error` method can be called to raise an error, or
         * `complete` can be called to notify of a successful completion.
         */
        function Observable(subscribe) {
            this._isScalar = false;
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        /**
         * Creates a new Observable, with this Observable as the source, and the passed
         * operator defined as the new observable's operator.
         * @method lift
         * @param {Operator} operator the operator defining the operation to take on the observable
         * @return {Observable} a new observable with the Operator applied
         */
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var operator = this.operator;
            var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
            if (operator) {
                operator.call(sink, this.source);
            } else {
                sink.add(this._subscribe(sink));
            }
            if (sink.syncErrorThrowable) {
                sink.syncErrorThrowable = false;
                if (sink.syncErrorThrown) {
                    throw sink.syncErrorValue;
                }
            }
            return sink;
        };
        /**
         * @method forEach
         * @param {Function} next a handler for each value emitted by the observable
         * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
         * @return {Promise} a promise that either resolves on observable completion or
         *  rejects with the handled error
         */
        Observable.prototype.forEach = function (next, PromiseCtor) {
            var _this = this;
            if (!PromiseCtor) {
                if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
                    PromiseCtor = root_1.root.Rx.config.Promise;
                } else if (root_1.root.Promise) {
                    PromiseCtor = root_1.root.Promise;
                }
            }
            if (!PromiseCtor) {
                throw new Error('no Promise impl found');
            }
            return new PromiseCtor(function (resolve, reject) {
                var subscription = _this.subscribe(function (value) {
                    if (subscription) {
                        // if there is a subscription, then we can surmise
                        // the next handling is asynchronous. Any errors thrown
                        // need to be rejected explicitly and unsubscribe must be
                        // called manually
                        try {
                            next(value);
                        } catch (err) {
                            reject(err);
                            subscription.unsubscribe();
                        }
                    } else {
                        // if there is NO subscription, then we're getting a nexted
                        // value synchronously during subscription. We can just call it.
                        // If it errors, Observable's `subscribe` will ensure the
                        // unsubscription logic is called, then synchronously rethrow the error.
                        // After that, Promise will trap the error and send it
                        // down the rejection path.
                        next(value);
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            return this.source.subscribe(subscriber);
        };
        /**
         * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
         * @method Symbol.observable
         * @return {Observable} this instance of the observable
         */
        Observable.prototype[observable_1.$$observable] = function () {
            return this;
        };
        // HACK: Since TypeScript inherits static properties too, we have to
        // fight against TypeScript here so Subject can have a different static create signature
        /**
         * Creates a new cold Observable by calling the Observable constructor
         * @static true
         * @owner Observable
         * @method create
         * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
         * @return {Observable} a new cold observable
         */
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }();
    exports.Observable = Observable;
    

    return module.exports;
});
System.register("@angular/core/src/facade/async.js", ["rxjs/Subject", "rxjs/Observable"], function($__export) {
  "use strict";
  var __extends,
      Subject,
      EventEmitter;
  function EventEmitter_tsickle_Closure_declarations() {
    EventEmitter.prototype.__isAsync;
  }
  return {
    setters: [function($__m) {
      Subject = $__m.Subject;
      $__export({Subject: $__m.Subject});
    }, function($__m) {
      $__export({Observable: $__m.Observable});
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      EventEmitter = (function(_super) {
        __extends(EventEmitter, _super);
        function EventEmitter(isAsync) {
          if (isAsync === void 0) {
            isAsync = false;
          }
          _super.call(this);
          this.__isAsync = isAsync;
        }
        EventEmitter.prototype.emit = function(value) {
          _super.prototype.next.call(this, value);
        };
        EventEmitter.prototype.subscribe = function(generatorOrNext, error, complete) {
          var schedulerFn;
          var errorFn = function(err) {
            return null;
          };
          var completeFn = function() {
            return null;
          };
          if (generatorOrNext && (typeof generatorOrNext === 'undefined' ? 'undefined' : $traceurRuntime.typeof(generatorOrNext)) === 'object') {
            schedulerFn = this.__isAsync ? function(value) {
              setTimeout(function() {
                return generatorOrNext.next(value);
              });
            } : function(value) {
              generatorOrNext.next(value);
            };
            if (generatorOrNext.error) {
              errorFn = this.__isAsync ? function(err) {
                setTimeout(function() {
                  return generatorOrNext.error(err);
                });
              } : function(err) {
                generatorOrNext.error(err);
              };
            }
            if (generatorOrNext.complete) {
              completeFn = this.__isAsync ? function() {
                setTimeout(function() {
                  return generatorOrNext.complete();
                });
              } : function() {
                generatorOrNext.complete();
              };
            }
          } else {
            schedulerFn = this.__isAsync ? function(value) {
              setTimeout(function() {
                return generatorOrNext(value);
              });
            } : function(value) {
              generatorOrNext(value);
            };
            if (error) {
              errorFn = this.__isAsync ? function(err) {
                setTimeout(function() {
                  return error(err);
                });
              } : function(err) {
                error(err);
              };
            }
            if (complete) {
              completeFn = this.__isAsync ? function() {
                setTimeout(function() {
                  return complete();
                });
              } : function() {
                complete();
              };
            }
          }
          return _super.prototype.subscribe.call(this, schedulerFn, errorFn, completeFn);
        };
        return EventEmitter;
      }(Subject));
      $__export("EventEmitter", EventEmitter);
    }
  };
});

System.register("@angular/core/src/zone/ng_zone.js", ["../facade/async"], function($__export) {
  "use strict";
  var EventEmitter,
      NgZone;
  function NgZone_tsickle_Closure_declarations() {
    NgZone.prototype.outer;
    NgZone.prototype.inner;
    NgZone.prototype._hasPendingMicrotasks;
    NgZone.prototype._hasPendingMacrotasks;
    NgZone.prototype._isStable;
    NgZone.prototype._nesting;
    NgZone.prototype._onUnstable;
    NgZone.prototype._onMicrotaskEmpty;
    NgZone.prototype._onStable;
    NgZone.prototype._onErrorEvents;
  }
  return {
    setters: [function($__m) {
      EventEmitter = $__m.EventEmitter;
    }],
    execute: function() {
      NgZone = (function() {
        function NgZone(_a) {
          var _b = _a.enableLongStackTrace,
              enableLongStackTrace = _b === void 0 ? false : _b;
          this._hasPendingMicrotasks = false;
          this._hasPendingMacrotasks = false;
          this._isStable = true;
          this._nesting = 0;
          this._onUnstable = new EventEmitter(false);
          this._onMicrotaskEmpty = new EventEmitter(false);
          this._onStable = new EventEmitter(false);
          this._onErrorEvents = new EventEmitter(false);
          if (typeof Zone == 'undefined') {
            throw new Error('Angular requires Zone.js prolyfill.');
          }
          Zone.assertZonePatched();
          this.outer = this.inner = Zone.current;
          if (Zone['wtfZoneSpec']) {
            this.inner = this.inner.fork(Zone['wtfZoneSpec']);
          }
          if (enableLongStackTrace && Zone['longStackTraceZoneSpec']) {
            this.inner = this.inner.fork(Zone['longStackTraceZoneSpec']);
          }
          this.forkInnerZoneWithAngularBehavior();
        }
        NgZone.isInAngularZone = function() {
          return Zone.current.get('isAngularZone') === true;
        };
        NgZone.assertInAngularZone = function() {
          if (!NgZone.isInAngularZone()) {
            throw new Error('Expected to be in Angular Zone, but it is not!');
          }
        };
        NgZone.assertNotInAngularZone = function() {
          if (NgZone.isInAngularZone()) {
            throw new Error('Expected to not be in Angular Zone, but it is!');
          }
        };
        NgZone.prototype.run = function(fn) {
          return this.inner.run(fn);
        };
        NgZone.prototype.runGuarded = function(fn) {
          return this.inner.runGuarded(fn);
        };
        NgZone.prototype.runOutsideAngular = function(fn) {
          return this.outer.run(fn);
        };
        Object.defineProperty(NgZone.prototype, "onUnstable", {
          get: function() {
            return this._onUnstable;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgZone.prototype, "onMicrotaskEmpty", {
          get: function() {
            return this._onMicrotaskEmpty;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgZone.prototype, "onStable", {
          get: function() {
            return this._onStable;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgZone.prototype, "onError", {
          get: function() {
            return this._onErrorEvents;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgZone.prototype, "isStable", {
          get: function() {
            return this._isStable;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgZone.prototype, "hasPendingMicrotasks", {
          get: function() {
            return this._hasPendingMicrotasks;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(NgZone.prototype, "hasPendingMacrotasks", {
          get: function() {
            return this._hasPendingMacrotasks;
          },
          enumerable: true,
          configurable: true
        });
        NgZone.prototype.checkStable = function() {
          var _this = this;
          if (this._nesting == 0 && !this._hasPendingMicrotasks && !this._isStable) {
            try {
              this._nesting++;
              this._onMicrotaskEmpty.emit(null);
            } finally {
              this._nesting--;
              if (!this._hasPendingMicrotasks) {
                try {
                  this.runOutsideAngular(function() {
                    return _this._onStable.emit(null);
                  });
                } finally {
                  this._isStable = true;
                }
              }
            }
          }
        };
        NgZone.prototype.forkInnerZoneWithAngularBehavior = function() {
          var _this = this;
          this.inner = this.inner.fork({
            name: 'angular',
            properties: ({'isAngularZone': true}),
            onInvokeTask: function(delegate, current, target, task, applyThis, applyArgs) {
              try {
                _this.onEnter();
                return delegate.invokeTask(target, task, applyThis, applyArgs);
              } finally {
                _this.onLeave();
              }
            },
            onInvoke: function(delegate, current, target, callback, applyThis, applyArgs, source) {
              try {
                _this.onEnter();
                return delegate.invoke(target, callback, applyThis, applyArgs, source);
              } finally {
                _this.onLeave();
              }
            },
            onHasTask: function(delegate, current, target, hasTaskState) {
              delegate.hasTask(target, hasTaskState);
              if (current === target) {
                if (hasTaskState.change == 'microTask') {
                  _this.setHasMicrotask(hasTaskState.microTask);
                } else if (hasTaskState.change == 'macroTask') {
                  _this.setHasMacrotask(hasTaskState.macroTask);
                }
              }
            },
            onHandleError: function(delegate, current, target, error) {
              delegate.handleError(target, error);
              _this.triggerError(error);
              return false;
            }
          });
        };
        NgZone.prototype.onEnter = function() {
          this._nesting++;
          if (this._isStable) {
            this._isStable = false;
            this._onUnstable.emit(null);
          }
        };
        NgZone.prototype.onLeave = function() {
          this._nesting--;
          this.checkStable();
        };
        NgZone.prototype.setHasMicrotask = function(hasMicrotasks) {
          this._hasPendingMicrotasks = hasMicrotasks;
          this.checkStable();
        };
        NgZone.prototype.setHasMacrotask = function(hasMacrotasks) {
          this._hasPendingMacrotasks = hasMacrotasks;
        };
        NgZone.prototype.triggerError = function(error) {
          this._onErrorEvents.emit(error);
        };
        return NgZone;
      }());
      $__export("NgZone", NgZone);
    }
  };
});

System.register("@angular/core/src/animation/animation_queue.js", ["../di/metadata", "../zone/ng_zone"], function($__export) {
  "use strict";
  var Injectable,
      NgZone,
      AnimationQueue;
  function AnimationQueue_tsickle_Closure_declarations() {
    AnimationQueue.decorators;
    AnimationQueue.ctorParameters;
    AnimationQueue.prototype.entries;
    AnimationQueue.prototype._zone;
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      NgZone = $__m.NgZone;
    }],
    execute: function() {
      AnimationQueue = (function() {
        function AnimationQueue(_zone) {
          this._zone = _zone;
          this.entries = [];
        }
        AnimationQueue.prototype.enqueue = function(player) {
          this.entries.push(player);
        };
        AnimationQueue.prototype.flush = function() {
          var _this = this;
          if (this.entries.length) {
            this._zone.runOutsideAngular(function() {
              Promise.resolve(null).then(function() {
                return _this._triggerAnimations();
              });
            });
          }
        };
        AnimationQueue.prototype._triggerAnimations = function() {
          NgZone.assertNotInAngularZone();
          while (this.entries.length) {
            var player = this.entries.shift();
            if (!player.hasStarted()) {
              player.play();
            }
          }
        };
        AnimationQueue.decorators = [{type: Injectable}];
        AnimationQueue.ctorParameters = function() {
          return [{type: NgZone}];
        };
        return AnimationQueue;
      }());
      $__export("AnimationQueue", AnimationQueue);
    }
  };
});

System.register("@angular/core/src/change_detection/differs/default_iterable_differ.js", ["../../facade/collection", "../../facade/lang"], function($__export) {
  "use strict";
  var isListLikeIterable,
      iterateListLike,
      isBlank,
      looseIdentical,
      stringify,
      DefaultIterableDifferFactory,
      trackByIdentity,
      DefaultIterableDiffer,
      CollectionChangeRecord,
      _DuplicateItemRecordList,
      _DuplicateMap;
  function DefaultIterableDiffer_tsickle_Closure_declarations() {
    DefaultIterableDiffer.prototype._length;
    DefaultIterableDiffer.prototype._collection;
    DefaultIterableDiffer.prototype._linkedRecords;
    DefaultIterableDiffer.prototype._unlinkedRecords;
    DefaultIterableDiffer.prototype._previousItHead;
    DefaultIterableDiffer.prototype._itHead;
    DefaultIterableDiffer.prototype._itTail;
    DefaultIterableDiffer.prototype._additionsHead;
    DefaultIterableDiffer.prototype._additionsTail;
    DefaultIterableDiffer.prototype._movesHead;
    DefaultIterableDiffer.prototype._movesTail;
    DefaultIterableDiffer.prototype._removalsHead;
    DefaultIterableDiffer.prototype._removalsTail;
    DefaultIterableDiffer.prototype._identityChangesHead;
    DefaultIterableDiffer.prototype._identityChangesTail;
    DefaultIterableDiffer.prototype._trackByFn;
  }
  function CollectionChangeRecord_tsickle_Closure_declarations() {
    CollectionChangeRecord.prototype.currentIndex;
    CollectionChangeRecord.prototype.previousIndex;
    CollectionChangeRecord.prototype._nextPrevious;
    CollectionChangeRecord.prototype._prev;
    CollectionChangeRecord.prototype._next;
    CollectionChangeRecord.prototype._prevDup;
    CollectionChangeRecord.prototype._nextDup;
    CollectionChangeRecord.prototype._prevRemoved;
    CollectionChangeRecord.prototype._nextRemoved;
    CollectionChangeRecord.prototype._nextAdded;
    CollectionChangeRecord.prototype._nextMoved;
    CollectionChangeRecord.prototype._nextIdentityChange;
    CollectionChangeRecord.prototype.item;
    CollectionChangeRecord.prototype.trackById;
  }
  function _DuplicateItemRecordList_tsickle_Closure_declarations() {
    _DuplicateItemRecordList.prototype._head;
    _DuplicateItemRecordList.prototype._tail;
  }
  function _DuplicateMap_tsickle_Closure_declarations() {
    _DuplicateMap.prototype.map;
  }
  function getPreviousIndex(item, addRemoveOffset, moveOffsets) {
    var previousIndex = item.previousIndex;
    if (previousIndex === null)
      return previousIndex;
    var moveOffset = 0;
    if (moveOffsets && previousIndex < moveOffsets.length) {
      moveOffset = moveOffsets[previousIndex];
    }
    return previousIndex + addRemoveOffset + moveOffset;
  }
  return {
    setters: [function($__m) {
      isListLikeIterable = $__m.isListLikeIterable;
      iterateListLike = $__m.iterateListLike;
    }, function($__m) {
      isBlank = $__m.isBlank;
      looseIdentical = $__m.looseIdentical;
      stringify = $__m.stringify;
    }],
    execute: function() {
      DefaultIterableDifferFactory = (function() {
        function DefaultIterableDifferFactory() {}
        DefaultIterableDifferFactory.prototype.supports = function(obj) {
          return isListLikeIterable(obj);
        };
        DefaultIterableDifferFactory.prototype.create = function(cdRef, trackByFn) {
          return new DefaultIterableDiffer(trackByFn);
        };
        return DefaultIterableDifferFactory;
      }());
      $__export("DefaultIterableDifferFactory", DefaultIterableDifferFactory);
      trackByIdentity = function(index, item) {
        return item;
      };
      DefaultIterableDiffer = (function() {
        function DefaultIterableDiffer(_trackByFn) {
          this._trackByFn = _trackByFn;
          this._length = null;
          this._collection = null;
          this._linkedRecords = null;
          this._unlinkedRecords = null;
          this._previousItHead = null;
          this._itHead = null;
          this._itTail = null;
          this._additionsHead = null;
          this._additionsTail = null;
          this._movesHead = null;
          this._movesTail = null;
          this._removalsHead = null;
          this._removalsTail = null;
          this._identityChangesHead = null;
          this._identityChangesTail = null;
          this._trackByFn = this._trackByFn || trackByIdentity;
        }
        Object.defineProperty(DefaultIterableDiffer.prototype, "collection", {
          get: function() {
            return this._collection;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(DefaultIterableDiffer.prototype, "length", {
          get: function() {
            return this._length;
          },
          enumerable: true,
          configurable: true
        });
        DefaultIterableDiffer.prototype.forEachItem = function(fn) {
          var record;
          for (record = this._itHead; record !== null; record = record._next) {
            fn(record);
          }
        };
        DefaultIterableDiffer.prototype.forEachOperation = function(fn) {
          var nextIt = this._itHead;
          var nextRemove = this._removalsHead;
          var addRemoveOffset = 0;
          var moveOffsets = null;
          while (nextIt || nextRemove) {
            var record = !nextRemove || nextIt && nextIt.currentIndex < getPreviousIndex(nextRemove, addRemoveOffset, moveOffsets) ? nextIt : nextRemove;
            var adjPreviousIndex = getPreviousIndex(record, addRemoveOffset, moveOffsets);
            var currentIndex = record.currentIndex;
            if (record === nextRemove) {
              addRemoveOffset--;
              nextRemove = nextRemove._nextRemoved;
            } else {
              nextIt = nextIt._next;
              if (record.previousIndex == null) {
                addRemoveOffset++;
              } else {
                if (!moveOffsets)
                  moveOffsets = [];
                var localMovePreviousIndex = adjPreviousIndex - addRemoveOffset;
                var localCurrentIndex = currentIndex - addRemoveOffset;
                if (localMovePreviousIndex != localCurrentIndex) {
                  for (var i = 0; i < localMovePreviousIndex; i++) {
                    var offset = i < moveOffsets.length ? moveOffsets[i] : (moveOffsets[i] = 0);
                    var index = offset + i;
                    if (localCurrentIndex <= index && index < localMovePreviousIndex) {
                      moveOffsets[i] = offset + 1;
                    }
                  }
                  var previousIndex = record.previousIndex;
                  moveOffsets[previousIndex] = localCurrentIndex - localMovePreviousIndex;
                }
              }
            }
            if (adjPreviousIndex !== currentIndex) {
              fn(record, adjPreviousIndex, currentIndex);
            }
          }
        };
        DefaultIterableDiffer.prototype.forEachPreviousItem = function(fn) {
          var record;
          for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
            fn(record);
          }
        };
        DefaultIterableDiffer.prototype.forEachAddedItem = function(fn) {
          var record;
          for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            fn(record);
          }
        };
        DefaultIterableDiffer.prototype.forEachMovedItem = function(fn) {
          var record;
          for (record = this._movesHead; record !== null; record = record._nextMoved) {
            fn(record);
          }
        };
        DefaultIterableDiffer.prototype.forEachRemovedItem = function(fn) {
          var record;
          for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            fn(record);
          }
        };
        DefaultIterableDiffer.prototype.forEachIdentityChange = function(fn) {
          var record;
          for (record = this._identityChangesHead; record !== null; record = record._nextIdentityChange) {
            fn(record);
          }
        };
        DefaultIterableDiffer.prototype.diff = function(collection) {
          if (isBlank(collection))
            collection = [];
          if (!isListLikeIterable(collection)) {
            throw new Error("Error trying to diff '" + collection + "'");
          }
          if (this.check(collection)) {
            return this;
          } else {
            return null;
          }
        };
        DefaultIterableDiffer.prototype.onDestroy = function() {};
        DefaultIterableDiffer.prototype.check = function(collection) {
          var _this = this;
          this._reset();
          var record = this._itHead;
          var mayBeDirty = false;
          var index;
          var item;
          var itemTrackBy;
          if (Array.isArray(collection)) {
            var list = collection;
            this._length = collection.length;
            for (var index_1 = 0; index_1 < this._length; index_1++) {
              item = list[index_1];
              itemTrackBy = this._trackByFn(index_1, item);
              if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                record = this._mismatch(record, item, itemTrackBy, index_1);
                mayBeDirty = true;
              } else {
                if (mayBeDirty) {
                  record = this._verifyReinsertion(record, item, itemTrackBy, index_1);
                }
                if (!looseIdentical(record.item, item))
                  this._addIdentityChange(record, item);
              }
              record = record._next;
            }
          } else {
            index = 0;
            iterateListLike(collection, function(item) {
              itemTrackBy = _this._trackByFn(index, item);
              if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                record = _this._mismatch(record, item, itemTrackBy, index);
                mayBeDirty = true;
              } else {
                if (mayBeDirty) {
                  record = _this._verifyReinsertion(record, item, itemTrackBy, index);
                }
                if (!looseIdentical(record.item, item))
                  _this._addIdentityChange(record, item);
              }
              record = record._next;
              index++;
            });
            this._length = index;
          }
          this._truncate(record);
          this._collection = collection;
          return this.isDirty;
        };
        Object.defineProperty(DefaultIterableDiffer.prototype, "isDirty", {
          get: function() {
            return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null || this._identityChangesHead !== null;
          },
          enumerable: true,
          configurable: true
        });
        DefaultIterableDiffer.prototype._reset = function() {
          if (this.isDirty) {
            var record = void 0;
            var nextRecord = void 0;
            for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
              record._nextPrevious = record._next;
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
              record.previousIndex = record.currentIndex;
            }
            this._additionsHead = this._additionsTail = null;
            for (record = this._movesHead; record !== null; record = nextRecord) {
              record.previousIndex = record.currentIndex;
              nextRecord = record._nextMoved;
            }
            this._movesHead = this._movesTail = null;
            this._removalsHead = this._removalsTail = null;
            this._identityChangesHead = this._identityChangesTail = null;
          }
        };
        DefaultIterableDiffer.prototype._mismatch = function(record, item, itemTrackBy, index) {
          var previousRecord;
          if (record === null) {
            previousRecord = this._itTail;
          } else {
            previousRecord = record._prev;
            this._remove(record);
          }
          record = this._linkedRecords === null ? null : this._linkedRecords.get(itemTrackBy, index);
          if (record !== null) {
            if (!looseIdentical(record.item, item))
              this._addIdentityChange(record, item);
            this._moveAfter(record, previousRecord, index);
          } else {
            record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy);
            if (record !== null) {
              if (!looseIdentical(record.item, item))
                this._addIdentityChange(record, item);
              this._reinsertAfter(record, previousRecord, index);
            } else {
              record = this._addAfter(new CollectionChangeRecord(item, itemTrackBy), previousRecord, index);
            }
          }
          return record;
        };
        DefaultIterableDiffer.prototype._verifyReinsertion = function(record, item, itemTrackBy, index) {
          var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy);
          if (reinsertRecord !== null) {
            record = this._reinsertAfter(reinsertRecord, record._prev, index);
          } else if (record.currentIndex != index) {
            record.currentIndex = index;
            this._addToMoves(record, index);
          }
          return record;
        };
        DefaultIterableDiffer.prototype._truncate = function(record) {
          while (record !== null) {
            var nextRecord = record._next;
            this._addToRemovals(this._unlink(record));
            record = nextRecord;
          }
          if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.clear();
          }
          if (this._additionsTail !== null) {
            this._additionsTail._nextAdded = null;
          }
          if (this._movesTail !== null) {
            this._movesTail._nextMoved = null;
          }
          if (this._itTail !== null) {
            this._itTail._next = null;
          }
          if (this._removalsTail !== null) {
            this._removalsTail._nextRemoved = null;
          }
          if (this._identityChangesTail !== null) {
            this._identityChangesTail._nextIdentityChange = null;
          }
        };
        DefaultIterableDiffer.prototype._reinsertAfter = function(record, prevRecord, index) {
          if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.remove(record);
          }
          var prev = record._prevRemoved;
          var next = record._nextRemoved;
          if (prev === null) {
            this._removalsHead = next;
          } else {
            prev._nextRemoved = next;
          }
          if (next === null) {
            this._removalsTail = prev;
          } else {
            next._prevRemoved = prev;
          }
          this._insertAfter(record, prevRecord, index);
          this._addToMoves(record, index);
          return record;
        };
        DefaultIterableDiffer.prototype._moveAfter = function(record, prevRecord, index) {
          this._unlink(record);
          this._insertAfter(record, prevRecord, index);
          this._addToMoves(record, index);
          return record;
        };
        DefaultIterableDiffer.prototype._addAfter = function(record, prevRecord, index) {
          this._insertAfter(record, prevRecord, index);
          if (this._additionsTail === null) {
            this._additionsTail = this._additionsHead = record;
          } else {
            this._additionsTail = this._additionsTail._nextAdded = record;
          }
          return record;
        };
        DefaultIterableDiffer.prototype._insertAfter = function(record, prevRecord, index) {
          var next = prevRecord === null ? this._itHead : prevRecord._next;
          record._next = next;
          record._prev = prevRecord;
          if (next === null) {
            this._itTail = record;
          } else {
            next._prev = record;
          }
          if (prevRecord === null) {
            this._itHead = record;
          } else {
            prevRecord._next = record;
          }
          if (this._linkedRecords === null) {
            this._linkedRecords = new _DuplicateMap();
          }
          this._linkedRecords.put(record);
          record.currentIndex = index;
          return record;
        };
        DefaultIterableDiffer.prototype._remove = function(record) {
          return this._addToRemovals(this._unlink(record));
        };
        DefaultIterableDiffer.prototype._unlink = function(record) {
          if (this._linkedRecords !== null) {
            this._linkedRecords.remove(record);
          }
          var prev = record._prev;
          var next = record._next;
          if (prev === null) {
            this._itHead = next;
          } else {
            prev._next = next;
          }
          if (next === null) {
            this._itTail = prev;
          } else {
            next._prev = prev;
          }
          return record;
        };
        DefaultIterableDiffer.prototype._addToMoves = function(record, toIndex) {
          if (record.previousIndex === toIndex) {
            return record;
          }
          if (this._movesTail === null) {
            this._movesTail = this._movesHead = record;
          } else {
            this._movesTail = this._movesTail._nextMoved = record;
          }
          return record;
        };
        DefaultIterableDiffer.prototype._addToRemovals = function(record) {
          if (this._unlinkedRecords === null) {
            this._unlinkedRecords = new _DuplicateMap();
          }
          this._unlinkedRecords.put(record);
          record.currentIndex = null;
          record._nextRemoved = null;
          if (this._removalsTail === null) {
            this._removalsTail = this._removalsHead = record;
            record._prevRemoved = null;
          } else {
            record._prevRemoved = this._removalsTail;
            this._removalsTail = this._removalsTail._nextRemoved = record;
          }
          return record;
        };
        DefaultIterableDiffer.prototype._addIdentityChange = function(record, item) {
          record.item = item;
          if (this._identityChangesTail === null) {
            this._identityChangesTail = this._identityChangesHead = record;
          } else {
            this._identityChangesTail = this._identityChangesTail._nextIdentityChange = record;
          }
          return record;
        };
        DefaultIterableDiffer.prototype.toString = function() {
          var list = [];
          this.forEachItem(function(record) {
            return list.push(record);
          });
          var previous = [];
          this.forEachPreviousItem(function(record) {
            return previous.push(record);
          });
          var additions = [];
          this.forEachAddedItem(function(record) {
            return additions.push(record);
          });
          var moves = [];
          this.forEachMovedItem(function(record) {
            return moves.push(record);
          });
          var removals = [];
          this.forEachRemovedItem(function(record) {
            return removals.push(record);
          });
          var identityChanges = [];
          this.forEachIdentityChange(function(record) {
            return identityChanges.push(record);
          });
          return 'collection: ' + list.join(', ') + '\n' + 'previous: ' + previous.join(', ') + '\n' + 'additions: ' + additions.join(', ') + '\n' + 'moves: ' + moves.join(', ') + '\n' + 'removals: ' + removals.join(', ') + '\n' + 'identityChanges: ' + identityChanges.join(', ') + '\n';
        };
        return DefaultIterableDiffer;
      }());
      $__export("DefaultIterableDiffer", DefaultIterableDiffer);
      CollectionChangeRecord = (function() {
        function CollectionChangeRecord(item, trackById) {
          this.item = item;
          this.trackById = trackById;
          this.currentIndex = null;
          this.previousIndex = null;
          this._nextPrevious = null;
          this._prev = null;
          this._next = null;
          this._prevDup = null;
          this._nextDup = null;
          this._prevRemoved = null;
          this._nextRemoved = null;
          this._nextAdded = null;
          this._nextMoved = null;
          this._nextIdentityChange = null;
        }
        CollectionChangeRecord.prototype.toString = function() {
          return this.previousIndex === this.currentIndex ? stringify(this.item) : stringify(this.item) + '[' + stringify(this.previousIndex) + '->' + stringify(this.currentIndex) + ']';
        };
        return CollectionChangeRecord;
      }());
      $__export("CollectionChangeRecord", CollectionChangeRecord);
      _DuplicateItemRecordList = (function() {
        function _DuplicateItemRecordList() {
          this._head = null;
          this._tail = null;
        }
        _DuplicateItemRecordList.prototype.add = function(record) {
          if (this._head === null) {
            this._head = this._tail = record;
            record._nextDup = null;
            record._prevDup = null;
          } else {
            this._tail._nextDup = record;
            record._prevDup = this._tail;
            record._nextDup = null;
            this._tail = record;
          }
        };
        _DuplicateItemRecordList.prototype.get = function(trackById, afterIndex) {
          var record;
          for (record = this._head; record !== null; record = record._nextDup) {
            if ((afterIndex === null || afterIndex < record.currentIndex) && looseIdentical(record.trackById, trackById)) {
              return record;
            }
          }
          return null;
        };
        _DuplicateItemRecordList.prototype.remove = function(record) {
          var prev = record._prevDup;
          var next = record._nextDup;
          if (prev === null) {
            this._head = next;
          } else {
            prev._nextDup = next;
          }
          if (next === null) {
            this._tail = prev;
          } else {
            next._prevDup = prev;
          }
          return this._head === null;
        };
        return _DuplicateItemRecordList;
      }());
      _DuplicateMap = (function() {
        function _DuplicateMap() {
          this.map = new Map();
        }
        _DuplicateMap.prototype.put = function(record) {
          var key = record.trackById;
          var duplicates = this.map.get(key);
          if (!duplicates) {
            duplicates = new _DuplicateItemRecordList();
            this.map.set(key, duplicates);
          }
          duplicates.add(record);
        };
        _DuplicateMap.prototype.get = function(trackById, afterIndex) {
          if (afterIndex === void 0) {
            afterIndex = null;
          }
          var key = trackById;
          var recordList = this.map.get(key);
          return recordList ? recordList.get(trackById, afterIndex) : null;
        };
        _DuplicateMap.prototype.remove = function(record) {
          var key = record.trackById;
          var recordList = this.map.get(key);
          if (recordList.remove(record)) {
            this.map.delete(key);
          }
          return record;
        };
        Object.defineProperty(_DuplicateMap.prototype, "isEmpty", {
          get: function() {
            return this.map.size === 0;
          },
          enumerable: true,
          configurable: true
        });
        _DuplicateMap.prototype.clear = function() {
          this.map.clear();
        };
        _DuplicateMap.prototype.toString = function() {
          return '_DuplicateMap(' + stringify(this.map) + ')';
        };
        return _DuplicateMap;
      }());
    }
  };
});

System.register("@angular/core/src/change_detection/differs/default_keyvalue_differ.js", ["../../facade/lang"], function($__export) {
  "use strict";
  var isJsObject,
      looseIdentical,
      stringify,
      DefaultKeyValueDifferFactory,
      DefaultKeyValueDiffer,
      KeyValueChangeRecord;
  function DefaultKeyValueDiffer_tsickle_Closure_declarations() {
    DefaultKeyValueDiffer.prototype._records;
    DefaultKeyValueDiffer.prototype._mapHead;
    DefaultKeyValueDiffer.prototype._previousMapHead;
    DefaultKeyValueDiffer.prototype._changesHead;
    DefaultKeyValueDiffer.prototype._changesTail;
    DefaultKeyValueDiffer.prototype._additionsHead;
    DefaultKeyValueDiffer.prototype._additionsTail;
    DefaultKeyValueDiffer.prototype._removalsHead;
    DefaultKeyValueDiffer.prototype._removalsTail;
  }
  function KeyValueChangeRecord_tsickle_Closure_declarations() {
    KeyValueChangeRecord.prototype.previousValue;
    KeyValueChangeRecord.prototype.currentValue;
    KeyValueChangeRecord.prototype._nextPrevious;
    KeyValueChangeRecord.prototype._next;
    KeyValueChangeRecord.prototype._nextAdded;
    KeyValueChangeRecord.prototype._nextRemoved;
    KeyValueChangeRecord.prototype._prevRemoved;
    KeyValueChangeRecord.prototype._nextChanged;
    KeyValueChangeRecord.prototype.key;
  }
  return {
    setters: [function($__m) {
      isJsObject = $__m.isJsObject;
      looseIdentical = $__m.looseIdentical;
      stringify = $__m.stringify;
    }],
    execute: function() {
      DefaultKeyValueDifferFactory = (function() {
        function DefaultKeyValueDifferFactory() {}
        DefaultKeyValueDifferFactory.prototype.supports = function(obj) {
          return obj instanceof Map || isJsObject(obj);
        };
        DefaultKeyValueDifferFactory.prototype.create = function(cdRef) {
          return new DefaultKeyValueDiffer();
        };
        return DefaultKeyValueDifferFactory;
      }());
      $__export("DefaultKeyValueDifferFactory", DefaultKeyValueDifferFactory);
      DefaultKeyValueDiffer = (function() {
        function DefaultKeyValueDiffer() {
          this._records = new Map();
          this._mapHead = null;
          this._previousMapHead = null;
          this._changesHead = null;
          this._changesTail = null;
          this._additionsHead = null;
          this._additionsTail = null;
          this._removalsHead = null;
          this._removalsTail = null;
        }
        Object.defineProperty(DefaultKeyValueDiffer.prototype, "isDirty", {
          get: function() {
            return this._additionsHead !== null || this._changesHead !== null || this._removalsHead !== null;
          },
          enumerable: true,
          configurable: true
        });
        DefaultKeyValueDiffer.prototype.forEachItem = function(fn) {
          var record;
          for (record = this._mapHead; record !== null; record = record._next) {
            fn(record);
          }
        };
        DefaultKeyValueDiffer.prototype.forEachPreviousItem = function(fn) {
          var record;
          for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
            fn(record);
          }
        };
        DefaultKeyValueDiffer.prototype.forEachChangedItem = function(fn) {
          var record;
          for (record = this._changesHead; record !== null; record = record._nextChanged) {
            fn(record);
          }
        };
        DefaultKeyValueDiffer.prototype.forEachAddedItem = function(fn) {
          var record;
          for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            fn(record);
          }
        };
        DefaultKeyValueDiffer.prototype.forEachRemovedItem = function(fn) {
          var record;
          for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            fn(record);
          }
        };
        DefaultKeyValueDiffer.prototype.diff = function(map) {
          if (!map) {
            map = new Map();
          } else if (!(map instanceof Map || isJsObject(map))) {
            throw new Error("Error trying to diff '" + map + "'");
          }
          return this.check(map) ? this : null;
        };
        DefaultKeyValueDiffer.prototype.onDestroy = function() {};
        DefaultKeyValueDiffer.prototype.check = function(map) {
          var _this = this;
          this._reset();
          var records = this._records;
          var oldSeqRecord = this._mapHead;
          var lastOldSeqRecord = null;
          var lastNewSeqRecord = null;
          var seqChanged = false;
          this._forEach(map, function(value, key) {
            var newSeqRecord;
            if (oldSeqRecord && key === oldSeqRecord.key) {
              newSeqRecord = oldSeqRecord;
              _this._maybeAddToChanges(newSeqRecord, value);
            } else {
              seqChanged = true;
              if (oldSeqRecord !== null) {
                _this._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
                _this._addToRemovals(oldSeqRecord);
              }
              if (records.has(key)) {
                newSeqRecord = records.get(key);
                _this._maybeAddToChanges(newSeqRecord, value);
              } else {
                newSeqRecord = new KeyValueChangeRecord(key);
                records.set(key, newSeqRecord);
                newSeqRecord.currentValue = value;
                _this._addToAdditions(newSeqRecord);
              }
            }
            if (seqChanged) {
              if (_this._isInRemovals(newSeqRecord)) {
                _this._removeFromRemovals(newSeqRecord);
              }
              if (lastNewSeqRecord == null) {
                _this._mapHead = newSeqRecord;
              } else {
                lastNewSeqRecord._next = newSeqRecord;
              }
            }
            lastOldSeqRecord = oldSeqRecord;
            lastNewSeqRecord = newSeqRecord;
            oldSeqRecord = oldSeqRecord && oldSeqRecord._next;
          });
          this._truncate(lastOldSeqRecord, oldSeqRecord);
          return this.isDirty;
        };
        DefaultKeyValueDiffer.prototype._reset = function() {
          if (this.isDirty) {
            var record = void 0;
            for (record = this._previousMapHead = this._mapHead; record !== null; record = record._next) {
              record._nextPrevious = record._next;
            }
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
              record.previousValue = record.currentValue;
            }
            for (record = this._additionsHead; record != null; record = record._nextAdded) {
              record.previousValue = record.currentValue;
            }
            this._changesHead = this._changesTail = null;
            this._additionsHead = this._additionsTail = null;
            this._removalsHead = this._removalsTail = null;
          }
        };
        DefaultKeyValueDiffer.prototype._truncate = function(lastRecord, record) {
          while (record !== null) {
            if (lastRecord === null) {
              this._mapHead = null;
            } else {
              lastRecord._next = null;
            }
            var nextRecord = record._next;
            this._addToRemovals(record);
            lastRecord = record;
            record = nextRecord;
          }
          for (var rec = this._removalsHead; rec !== null; rec = rec._nextRemoved) {
            rec.previousValue = rec.currentValue;
            rec.currentValue = null;
            this._records.delete(rec.key);
          }
        };
        DefaultKeyValueDiffer.prototype._maybeAddToChanges = function(record, newValue) {
          if (!looseIdentical(newValue, record.currentValue)) {
            record.previousValue = record.currentValue;
            record.currentValue = newValue;
            this._addToChanges(record);
          }
        };
        DefaultKeyValueDiffer.prototype._isInRemovals = function(record) {
          return record === this._removalsHead || record._nextRemoved !== null || record._prevRemoved !== null;
        };
        DefaultKeyValueDiffer.prototype._addToRemovals = function(record) {
          if (this._removalsHead === null) {
            this._removalsHead = this._removalsTail = record;
          } else {
            this._removalsTail._nextRemoved = record;
            record._prevRemoved = this._removalsTail;
            this._removalsTail = record;
          }
        };
        DefaultKeyValueDiffer.prototype._removeFromSeq = function(prev, record) {
          var next = record._next;
          if (prev === null) {
            this._mapHead = next;
          } else {
            prev._next = next;
          }
          record._next = null;
        };
        DefaultKeyValueDiffer.prototype._removeFromRemovals = function(record) {
          var prev = record._prevRemoved;
          var next = record._nextRemoved;
          if (prev === null) {
            this._removalsHead = next;
          } else {
            prev._nextRemoved = next;
          }
          if (next === null) {
            this._removalsTail = prev;
          } else {
            next._prevRemoved = prev;
          }
          record._prevRemoved = record._nextRemoved = null;
        };
        DefaultKeyValueDiffer.prototype._addToAdditions = function(record) {
          if (this._additionsHead === null) {
            this._additionsHead = this._additionsTail = record;
          } else {
            this._additionsTail._nextAdded = record;
            this._additionsTail = record;
          }
        };
        DefaultKeyValueDiffer.prototype._addToChanges = function(record) {
          if (this._changesHead === null) {
            this._changesHead = this._changesTail = record;
          } else {
            this._changesTail._nextChanged = record;
            this._changesTail = record;
          }
        };
        DefaultKeyValueDiffer.prototype.toString = function() {
          var items = [];
          var previous = [];
          var changes = [];
          var additions = [];
          var removals = [];
          var record;
          for (record = this._mapHead; record !== null; record = record._next) {
            items.push(stringify(record));
          }
          for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
            previous.push(stringify(record));
          }
          for (record = this._changesHead; record !== null; record = record._nextChanged) {
            changes.push(stringify(record));
          }
          for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            additions.push(stringify(record));
          }
          for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            removals.push(stringify(record));
          }
          return 'map: ' + items.join(', ') + '\n' + 'previous: ' + previous.join(', ') + '\n' + 'additions: ' + additions.join(', ') + '\n' + 'changes: ' + changes.join(', ') + '\n' + 'removals: ' + removals.join(', ') + '\n';
        };
        DefaultKeyValueDiffer.prototype._forEach = function(obj, fn) {
          if (obj instanceof Map) {
            obj.forEach(fn);
          } else {
            Object.keys(obj).forEach(function(k) {
              return fn(obj[k], k);
            });
          }
        };
        return DefaultKeyValueDiffer;
      }());
      $__export("DefaultKeyValueDiffer", DefaultKeyValueDiffer);
      KeyValueChangeRecord = (function() {
        function KeyValueChangeRecord(key) {
          this.key = key;
          this.previousValue = null;
          this.currentValue = null;
          this._nextPrevious = null;
          this._next = null;
          this._nextAdded = null;
          this._nextRemoved = null;
          this._prevRemoved = null;
          this._nextChanged = null;
        }
        KeyValueChangeRecord.prototype.toString = function() {
          return looseIdentical(this.previousValue, this.currentValue) ? stringify(this.key) : (stringify(this.key) + '[' + stringify(this.previousValue) + '->' + stringify(this.currentValue) + ']');
        };
        return KeyValueChangeRecord;
      }());
      $__export("KeyValueChangeRecord", KeyValueChangeRecord);
    }
  };
});

System.register("@angular/core/src/change_detection/differs/iterable_differs.js", ["../../di", "../../facade/lang"], function($__export) {
  "use strict";
  var Optional,
      SkipSelf,
      getTypeNameForDebugging,
      isPresent,
      IterableDiffers;
  function IterableDiffers_tsickle_Closure_declarations() {
    IterableDiffers.prototype.factories;
  }
  return {
    setters: [function($__m) {
      Optional = $__m.Optional;
      SkipSelf = $__m.SkipSelf;
    }, function($__m) {
      getTypeNameForDebugging = $__m.getTypeNameForDebugging;
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      IterableDiffers = (function() {
        function IterableDiffers(factories) {
          this.factories = factories;
        }
        IterableDiffers.create = function(factories, parent) {
          if (isPresent(parent)) {
            var copied = parent.factories.slice();
            factories = factories.concat(copied);
            return new IterableDiffers(factories);
          } else {
            return new IterableDiffers(factories);
          }
        };
        IterableDiffers.extend = function(factories) {
          return {
            provide: IterableDiffers,
            useFactory: function(parent) {
              if (!parent) {
                throw new Error('Cannot extend IterableDiffers without a parent injector');
              }
              return IterableDiffers.create(factories, parent);
            },
            deps: [[IterableDiffers, new SkipSelf(), new Optional()]]
          };
        };
        IterableDiffers.prototype.find = function(iterable) {
          var factory = this.factories.find(function(f) {
            return f.supports(iterable);
          });
          if (isPresent(factory)) {
            return factory;
          } else {
            throw new Error("Cannot find a differ supporting object '" + iterable + "' of type '" + getTypeNameForDebugging(iterable) + "'");
          }
        };
        return IterableDiffers;
      }());
      $__export("IterableDiffers", IterableDiffers);
    }
  };
});

System.register("@angular/core/src/change_detection/differs/keyvalue_differs.js", ["../../di", "../../facade/lang"], function($__export) {
  "use strict";
  var Optional,
      SkipSelf,
      isPresent,
      KeyValueDiffers;
  function KeyValueDiffers_tsickle_Closure_declarations() {
    KeyValueDiffers.prototype.factories;
  }
  return {
    setters: [function($__m) {
      Optional = $__m.Optional;
      SkipSelf = $__m.SkipSelf;
    }, function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      KeyValueDiffers = (function() {
        function KeyValueDiffers(factories) {
          this.factories = factories;
        }
        KeyValueDiffers.create = function(factories, parent) {
          if (isPresent(parent)) {
            var copied = parent.factories.slice();
            factories = factories.concat(copied);
            return new KeyValueDiffers(factories);
          } else {
            return new KeyValueDiffers(factories);
          }
        };
        KeyValueDiffers.extend = function(factories) {
          return {
            provide: KeyValueDiffers,
            useFactory: function(parent) {
              if (!parent) {
                throw new Error('Cannot extend KeyValueDiffers without a parent injector');
              }
              return KeyValueDiffers.create(factories, parent);
            },
            deps: [[KeyValueDiffers, new SkipSelf(), new Optional()]]
          };
        };
        KeyValueDiffers.prototype.find = function(kv) {
          var factory = this.factories.find(function(f) {
            return f.supports(kv);
          });
          if (isPresent(factory)) {
            return factory;
          } else {
            throw new Error("Cannot find a differ supporting object '" + kv + "'");
          }
        };
        return KeyValueDiffers;
      }());
      $__export("KeyValueDiffers", KeyValueDiffers);
    }
  };
});

System.register("@angular/core/src/change_detection/change_detector_ref.js", [], function($__export) {
  "use strict";
  var ChangeDetectorRef;
  return {
    setters: [],
    execute: function() {
      ChangeDetectorRef = (function() {
        function ChangeDetectorRef() {}
        ChangeDetectorRef.prototype.markForCheck = function() {};
        ChangeDetectorRef.prototype.detach = function() {};
        ChangeDetectorRef.prototype.detectChanges = function() {};
        ChangeDetectorRef.prototype.checkNoChanges = function() {};
        ChangeDetectorRef.prototype.reattach = function() {};
        return ChangeDetectorRef;
      }());
      $__export("ChangeDetectorRef", ChangeDetectorRef);
    }
  };
});

System.register("@angular/core/src/change_detection/constants.js", ["../facade/lang"], function($__export) {
  "use strict";
  var isBlank,
      ChangeDetectionStrategy,
      ChangeDetectorStatus;
  function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return isBlank(changeDetectionStrategy) || changeDetectionStrategy === ChangeDetectionStrategy.Default;
  }
  $__export("isDefaultChangeDetectionStrategy", isDefaultChangeDetectionStrategy);
  return {
    setters: [function($__m) {
      isBlank = $__m.isBlank;
    }],
    execute: function() {
      ChangeDetectionStrategy = {};
      $__export("ChangeDetectionStrategy", ChangeDetectionStrategy);
      ChangeDetectionStrategy.OnPush = 0;
      ChangeDetectionStrategy.Default = 1;
      ChangeDetectionStrategy[ChangeDetectionStrategy.OnPush] = "OnPush";
      ChangeDetectionStrategy[ChangeDetectionStrategy.Default] = "Default";
      ChangeDetectorStatus = {};
      $__export("ChangeDetectorStatus", ChangeDetectorStatus);
      ChangeDetectorStatus.CheckOnce = 0;
      ChangeDetectorStatus.Checked = 1;
      ChangeDetectorStatus.CheckAlways = 2;
      ChangeDetectorStatus.Detached = 3;
      ChangeDetectorStatus.Errored = 4;
      ChangeDetectorStatus.Destroyed = 5;
      ChangeDetectorStatus[ChangeDetectorStatus.CheckOnce] = "CheckOnce";
      ChangeDetectorStatus[ChangeDetectorStatus.Checked] = "Checked";
      ChangeDetectorStatus[ChangeDetectorStatus.CheckAlways] = "CheckAlways";
      ChangeDetectorStatus[ChangeDetectorStatus.Detached] = "Detached";
      ChangeDetectorStatus[ChangeDetectorStatus.Errored] = "Errored";
      ChangeDetectorStatus[ChangeDetectorStatus.Destroyed] = "Destroyed";
    }
  };
});

System.register("@angular/core/src/change_detection/change_detection.js", ["./differs/default_iterable_differ", "./differs/default_keyvalue_differ", "./differs/iterable_differs", "./differs/keyvalue_differs", "./change_detection_util", "./change_detector_ref", "./constants"], function($__export) {
  "use strict";
  var DefaultIterableDifferFactory,
      DefaultKeyValueDifferFactory,
      IterableDiffers,
      KeyValueDiffers,
      keyValDiff,
      iterableDiff,
      defaultIterableDiffers,
      defaultKeyValueDiffers;
  return {
    setters: [function($__m) {
      DefaultIterableDifferFactory = $__m.DefaultIterableDifferFactory;
      $__export({
        CollectionChangeRecord: $__m.CollectionChangeRecord,
        DefaultIterableDifferFactory: $__m.DefaultIterableDifferFactory,
        DefaultIterableDiffer: $__m.DefaultIterableDiffer
      });
    }, function($__m) {
      DefaultKeyValueDifferFactory = $__m.DefaultKeyValueDifferFactory;
      $__export({
        DefaultKeyValueDifferFactory: $__m.DefaultKeyValueDifferFactory,
        KeyValueChangeRecord: $__m.KeyValueChangeRecord
      });
    }, function($__m) {
      IterableDiffers = $__m.IterableDiffers;
      $__export({IterableDiffers: $__m.IterableDiffers});
    }, function($__m) {
      KeyValueDiffers = $__m.KeyValueDiffers;
      $__export({KeyValueDiffers: $__m.KeyValueDiffers});
    }, function($__m) {
      $__export({
        SimpleChange: $__m.SimpleChange,
        UNINITIALIZED: $__m.UNINITIALIZED,
        ValueUnwrapper: $__m.ValueUnwrapper,
        WrappedValue: $__m.WrappedValue,
        devModeEqual: $__m.devModeEqual,
        looseIdentical: $__m.looseIdentical
      });
    }, function($__m) {
      $__export({ChangeDetectorRef: $__m.ChangeDetectorRef});
    }, function($__m) {
      $__export({
        ChangeDetectionStrategy: $__m.ChangeDetectionStrategy,
        ChangeDetectorStatus: $__m.ChangeDetectorStatus,
        isDefaultChangeDetectionStrategy: $__m.isDefaultChangeDetectionStrategy
      });
    }],
    execute: function() {
      keyValDiff = [new DefaultKeyValueDifferFactory()];
      $__export("keyValDiff", keyValDiff);
      iterableDiff = [new DefaultIterableDifferFactory()];
      $__export("iterableDiff", iterableDiff);
      defaultIterableDiffers = new IterableDiffers(iterableDiff);
      $__export("defaultIterableDiffers", defaultIterableDiffers);
      defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
      $__export("defaultKeyValueDiffers", defaultKeyValueDiffers);
    }
  };
});

System.register("@angular/core/src/di/injector.js", ["../facade/errors", "../facade/lang"], function($__export) {
  "use strict";
  var unimplemented,
      stringify,
      _THROW_IF_NOT_FOUND,
      THROW_IF_NOT_FOUND,
      _NullInjector,
      Injector;
  function Injector_tsickle_Closure_declarations() {
    Injector.THROW_IF_NOT_FOUND;
    Injector.NULL;
  }
  return {
    setters: [function($__m) {
      unimplemented = $__m.unimplemented;
    }, function($__m) {
      stringify = $__m.stringify;
    }],
    execute: function() {
      _THROW_IF_NOT_FOUND = new Object();
      THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
      $__export("THROW_IF_NOT_FOUND", THROW_IF_NOT_FOUND);
      _NullInjector = (function() {
        function _NullInjector() {}
        _NullInjector.prototype.get = function(token, notFoundValue) {
          if (notFoundValue === void 0) {
            notFoundValue = _THROW_IF_NOT_FOUND;
          }
          if (notFoundValue === _THROW_IF_NOT_FOUND) {
            throw new Error("No provider for " + stringify(token) + "!");
          }
          return notFoundValue;
        };
        return _NullInjector;
      }());
      Injector = (function() {
        function Injector() {}
        Injector.prototype.get = function(token, notFoundValue) {
          return unimplemented();
        };
        Injector.THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
        Injector.NULL = new _NullInjector();
        return Injector;
      }());
      $__export("Injector", Injector);
    }
  };
});

System.register("@angular/core/src/di/reflective_injector.js", ["../facade/errors", "./injector", "./metadata", "./reflective_errors", "./reflective_key", "./reflective_provider"], function($__export) {
  "use strict";
  var unimplemented,
      Injector,
      THROW_IF_NOT_FOUND,
      Self,
      SkipSelf,
      AbstractProviderError,
      CyclicDependencyError,
      InstantiationError,
      NoProviderError,
      OutOfBoundsError,
      ReflectiveKey,
      resolveReflectiveProviders,
      _MAX_CONSTRUCTION_COUNTER,
      UNDEFINED,
      ReflectiveProtoInjectorInlineStrategy,
      ReflectiveProtoInjectorDynamicStrategy,
      ReflectiveProtoInjector,
      ReflectiveInjectorInlineStrategy,
      ReflectiveInjectorDynamicStrategy,
      ReflectiveInjector,
      ReflectiveInjector_,
      INJECTOR_KEY;
  function ReflectiveProtoInjectorInlineStrategy_tsickle_Closure_declarations() {
    ReflectiveProtoInjectorInlineStrategy.prototype.provider0;
    ReflectiveProtoInjectorInlineStrategy.prototype.provider1;
    ReflectiveProtoInjectorInlineStrategy.prototype.provider2;
    ReflectiveProtoInjectorInlineStrategy.prototype.provider3;
    ReflectiveProtoInjectorInlineStrategy.prototype.provider4;
    ReflectiveProtoInjectorInlineStrategy.prototype.provider5;
    ReflectiveProtoInjectorInlineStrategy.prototype.provider6;
    ReflectiveProtoInjectorInlineStrategy.prototype.provider7;
    ReflectiveProtoInjectorInlineStrategy.prototype.provider8;
    ReflectiveProtoInjectorInlineStrategy.prototype.provider9;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId0;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId1;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId2;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId3;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId4;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId5;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId6;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId7;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId8;
    ReflectiveProtoInjectorInlineStrategy.prototype.keyId9;
  }
  function ReflectiveProtoInjectorDynamicStrategy_tsickle_Closure_declarations() {
    ReflectiveProtoInjectorDynamicStrategy.prototype.keyIds;
    ReflectiveProtoInjectorDynamicStrategy.prototype.providers;
  }
  function ReflectiveProtoInjector_tsickle_Closure_declarations() {
    ReflectiveProtoInjector.prototype._strategy;
    ReflectiveProtoInjector.prototype.numberOfProviders;
  }
  function ReflectiveInjectorInlineStrategy_tsickle_Closure_declarations() {
    ReflectiveInjectorInlineStrategy.prototype.obj0;
    ReflectiveInjectorInlineStrategy.prototype.obj1;
    ReflectiveInjectorInlineStrategy.prototype.obj2;
    ReflectiveInjectorInlineStrategy.prototype.obj3;
    ReflectiveInjectorInlineStrategy.prototype.obj4;
    ReflectiveInjectorInlineStrategy.prototype.obj5;
    ReflectiveInjectorInlineStrategy.prototype.obj6;
    ReflectiveInjectorInlineStrategy.prototype.obj7;
    ReflectiveInjectorInlineStrategy.prototype.obj8;
    ReflectiveInjectorInlineStrategy.prototype.obj9;
    ReflectiveInjectorInlineStrategy.prototype.injector;
    ReflectiveInjectorInlineStrategy.prototype.protoStrategy;
  }
  function ReflectiveInjectorDynamicStrategy_tsickle_Closure_declarations() {
    ReflectiveInjectorDynamicStrategy.prototype.objs;
    ReflectiveInjectorDynamicStrategy.prototype.protoStrategy;
    ReflectiveInjectorDynamicStrategy.prototype.injector;
  }
  function ReflectiveInjector__tsickle_Closure_declarations() {
    ReflectiveInjector_.prototype._strategy;
    ReflectiveInjector_.prototype._constructionCounter;
    ReflectiveInjector_.prototype._proto;
    ReflectiveInjector_.prototype._parent;
  }
  function _mapProviders(injector, fn) {
    var res = new Array(injector._proto.numberOfProviders);
    for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
      res[i] = fn(injector._proto.getProviderAtIndex(i));
    }
    return res;
  }
  return {
    setters: [function($__m) {
      unimplemented = $__m.unimplemented;
    }, function($__m) {
      Injector = $__m.Injector;
      THROW_IF_NOT_FOUND = $__m.THROW_IF_NOT_FOUND;
    }, function($__m) {
      Self = $__m.Self;
      SkipSelf = $__m.SkipSelf;
    }, function($__m) {
      AbstractProviderError = $__m.AbstractProviderError;
      CyclicDependencyError = $__m.CyclicDependencyError;
      InstantiationError = $__m.InstantiationError;
      NoProviderError = $__m.NoProviderError;
      OutOfBoundsError = $__m.OutOfBoundsError;
    }, function($__m) {
      ReflectiveKey = $__m.ReflectiveKey;
    }, function($__m) {
      resolveReflectiveProviders = $__m.resolveReflectiveProviders;
    }],
    execute: function() {
      _MAX_CONSTRUCTION_COUNTER = 10;
      UNDEFINED = new Object();
      ReflectiveProtoInjectorInlineStrategy = (function() {
        function ReflectiveProtoInjectorInlineStrategy(protoEI, providers) {
          this.provider0 = null;
          this.provider1 = null;
          this.provider2 = null;
          this.provider3 = null;
          this.provider4 = null;
          this.provider5 = null;
          this.provider6 = null;
          this.provider7 = null;
          this.provider8 = null;
          this.provider9 = null;
          this.keyId0 = null;
          this.keyId1 = null;
          this.keyId2 = null;
          this.keyId3 = null;
          this.keyId4 = null;
          this.keyId5 = null;
          this.keyId6 = null;
          this.keyId7 = null;
          this.keyId8 = null;
          this.keyId9 = null;
          var length = providers.length;
          if (length > 0) {
            this.provider0 = providers[0];
            this.keyId0 = providers[0].key.id;
          }
          if (length > 1) {
            this.provider1 = providers[1];
            this.keyId1 = providers[1].key.id;
          }
          if (length > 2) {
            this.provider2 = providers[2];
            this.keyId2 = providers[2].key.id;
          }
          if (length > 3) {
            this.provider3 = providers[3];
            this.keyId3 = providers[3].key.id;
          }
          if (length > 4) {
            this.provider4 = providers[4];
            this.keyId4 = providers[4].key.id;
          }
          if (length > 5) {
            this.provider5 = providers[5];
            this.keyId5 = providers[5].key.id;
          }
          if (length > 6) {
            this.provider6 = providers[6];
            this.keyId6 = providers[6].key.id;
          }
          if (length > 7) {
            this.provider7 = providers[7];
            this.keyId7 = providers[7].key.id;
          }
          if (length > 8) {
            this.provider8 = providers[8];
            this.keyId8 = providers[8].key.id;
          }
          if (length > 9) {
            this.provider9 = providers[9];
            this.keyId9 = providers[9].key.id;
          }
        }
        ReflectiveProtoInjectorInlineStrategy.prototype.getProviderAtIndex = function(index) {
          if (index == 0)
            return this.provider0;
          if (index == 1)
            return this.provider1;
          if (index == 2)
            return this.provider2;
          if (index == 3)
            return this.provider3;
          if (index == 4)
            return this.provider4;
          if (index == 5)
            return this.provider5;
          if (index == 6)
            return this.provider6;
          if (index == 7)
            return this.provider7;
          if (index == 8)
            return this.provider8;
          if (index == 9)
            return this.provider9;
          throw new OutOfBoundsError(index);
        };
        ReflectiveProtoInjectorInlineStrategy.prototype.createInjectorStrategy = function(injector) {
          return new ReflectiveInjectorInlineStrategy(injector, this);
        };
        return ReflectiveProtoInjectorInlineStrategy;
      }());
      $__export("ReflectiveProtoInjectorInlineStrategy", ReflectiveProtoInjectorInlineStrategy);
      ReflectiveProtoInjectorDynamicStrategy = (function() {
        function ReflectiveProtoInjectorDynamicStrategy(protoInj, providers) {
          this.providers = providers;
          var len = providers.length;
          this.keyIds = new Array(len);
          for (var i = 0; i < len; i++) {
            this.keyIds[i] = providers[i].key.id;
          }
        }
        ReflectiveProtoInjectorDynamicStrategy.prototype.getProviderAtIndex = function(index) {
          if (index < 0 || index >= this.providers.length) {
            throw new OutOfBoundsError(index);
          }
          return this.providers[index];
        };
        ReflectiveProtoInjectorDynamicStrategy.prototype.createInjectorStrategy = function(ei) {
          return new ReflectiveInjectorDynamicStrategy(this, ei);
        };
        return ReflectiveProtoInjectorDynamicStrategy;
      }());
      $__export("ReflectiveProtoInjectorDynamicStrategy", ReflectiveProtoInjectorDynamicStrategy);
      ReflectiveProtoInjector = (function() {
        function ReflectiveProtoInjector(providers) {
          this.numberOfProviders = providers.length;
          this._strategy = providers.length > _MAX_CONSTRUCTION_COUNTER ? new ReflectiveProtoInjectorDynamicStrategy(this, providers) : new ReflectiveProtoInjectorInlineStrategy(this, providers);
        }
        ReflectiveProtoInjector.fromResolvedProviders = function(providers) {
          return new ReflectiveProtoInjector(providers);
        };
        ReflectiveProtoInjector.prototype.getProviderAtIndex = function(index) {
          return this._strategy.getProviderAtIndex(index);
        };
        return ReflectiveProtoInjector;
      }());
      $__export("ReflectiveProtoInjector", ReflectiveProtoInjector);
      ReflectiveInjectorInlineStrategy = (function() {
        function ReflectiveInjectorInlineStrategy(injector, protoStrategy) {
          this.injector = injector;
          this.protoStrategy = protoStrategy;
          this.obj0 = UNDEFINED;
          this.obj1 = UNDEFINED;
          this.obj2 = UNDEFINED;
          this.obj3 = UNDEFINED;
          this.obj4 = UNDEFINED;
          this.obj5 = UNDEFINED;
          this.obj6 = UNDEFINED;
          this.obj7 = UNDEFINED;
          this.obj8 = UNDEFINED;
          this.obj9 = UNDEFINED;
        }
        ReflectiveInjectorInlineStrategy.prototype.resetConstructionCounter = function() {
          this.injector._constructionCounter = 0;
        };
        ReflectiveInjectorInlineStrategy.prototype.instantiateProvider = function(provider) {
          return this.injector._new(provider);
        };
        ReflectiveInjectorInlineStrategy.prototype.getObjByKeyId = function(keyId) {
          var p = this.protoStrategy;
          var inj = this.injector;
          if (p.keyId0 === keyId) {
            if (this.obj0 === UNDEFINED) {
              this.obj0 = inj._new(p.provider0);
            }
            return this.obj0;
          }
          if (p.keyId1 === keyId) {
            if (this.obj1 === UNDEFINED) {
              this.obj1 = inj._new(p.provider1);
            }
            return this.obj1;
          }
          if (p.keyId2 === keyId) {
            if (this.obj2 === UNDEFINED) {
              this.obj2 = inj._new(p.provider2);
            }
            return this.obj2;
          }
          if (p.keyId3 === keyId) {
            if (this.obj3 === UNDEFINED) {
              this.obj3 = inj._new(p.provider3);
            }
            return this.obj3;
          }
          if (p.keyId4 === keyId) {
            if (this.obj4 === UNDEFINED) {
              this.obj4 = inj._new(p.provider4);
            }
            return this.obj4;
          }
          if (p.keyId5 === keyId) {
            if (this.obj5 === UNDEFINED) {
              this.obj5 = inj._new(p.provider5);
            }
            return this.obj5;
          }
          if (p.keyId6 === keyId) {
            if (this.obj6 === UNDEFINED) {
              this.obj6 = inj._new(p.provider6);
            }
            return this.obj6;
          }
          if (p.keyId7 === keyId) {
            if (this.obj7 === UNDEFINED) {
              this.obj7 = inj._new(p.provider7);
            }
            return this.obj7;
          }
          if (p.keyId8 === keyId) {
            if (this.obj8 === UNDEFINED) {
              this.obj8 = inj._new(p.provider8);
            }
            return this.obj8;
          }
          if (p.keyId9 === keyId) {
            if (this.obj9 === UNDEFINED) {
              this.obj9 = inj._new(p.provider9);
            }
            return this.obj9;
          }
          return UNDEFINED;
        };
        ReflectiveInjectorInlineStrategy.prototype.getObjAtIndex = function(index) {
          if (index == 0)
            return this.obj0;
          if (index == 1)
            return this.obj1;
          if (index == 2)
            return this.obj2;
          if (index == 3)
            return this.obj3;
          if (index == 4)
            return this.obj4;
          if (index == 5)
            return this.obj5;
          if (index == 6)
            return this.obj6;
          if (index == 7)
            return this.obj7;
          if (index == 8)
            return this.obj8;
          if (index == 9)
            return this.obj9;
          throw new OutOfBoundsError(index);
        };
        ReflectiveInjectorInlineStrategy.prototype.getMaxNumberOfObjects = function() {
          return _MAX_CONSTRUCTION_COUNTER;
        };
        return ReflectiveInjectorInlineStrategy;
      }());
      $__export("ReflectiveInjectorInlineStrategy", ReflectiveInjectorInlineStrategy);
      ReflectiveInjectorDynamicStrategy = (function() {
        function ReflectiveInjectorDynamicStrategy(protoStrategy, injector) {
          this.protoStrategy = protoStrategy;
          this.injector = injector;
          this.objs = new Array(protoStrategy.providers.length).fill(UNDEFINED);
        }
        ReflectiveInjectorDynamicStrategy.prototype.resetConstructionCounter = function() {
          this.injector._constructionCounter = 0;
        };
        ReflectiveInjectorDynamicStrategy.prototype.instantiateProvider = function(provider) {
          return this.injector._new(provider);
        };
        ReflectiveInjectorDynamicStrategy.prototype.getObjByKeyId = function(keyId) {
          var p = this.protoStrategy;
          for (var i = 0; i < p.keyIds.length; i++) {
            if (p.keyIds[i] === keyId) {
              if (this.objs[i] === UNDEFINED) {
                this.objs[i] = this.injector._new(p.providers[i]);
              }
              return this.objs[i];
            }
          }
          return UNDEFINED;
        };
        ReflectiveInjectorDynamicStrategy.prototype.getObjAtIndex = function(index) {
          if (index < 0 || index >= this.objs.length) {
            throw new OutOfBoundsError(index);
          }
          return this.objs[index];
        };
        ReflectiveInjectorDynamicStrategy.prototype.getMaxNumberOfObjects = function() {
          return this.objs.length;
        };
        return ReflectiveInjectorDynamicStrategy;
      }());
      $__export("ReflectiveInjectorDynamicStrategy", ReflectiveInjectorDynamicStrategy);
      ReflectiveInjector = (function() {
        function ReflectiveInjector() {}
        ReflectiveInjector.resolve = function(providers) {
          return resolveReflectiveProviders(providers);
        };
        ReflectiveInjector.resolveAndCreate = function(providers, parent) {
          if (parent === void 0) {
            parent = null;
          }
          var ResolvedReflectiveProviders = ReflectiveInjector.resolve(providers);
          return ReflectiveInjector.fromResolvedProviders(ResolvedReflectiveProviders, parent);
        };
        ReflectiveInjector.fromResolvedProviders = function(providers, parent) {
          if (parent === void 0) {
            parent = null;
          }
          return new ReflectiveInjector_(ReflectiveProtoInjector.fromResolvedProviders(providers), parent);
        };
        Object.defineProperty(ReflectiveInjector.prototype, "parent", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        ReflectiveInjector.prototype.resolveAndCreateChild = function(providers) {
          return unimplemented();
        };
        ReflectiveInjector.prototype.createChildFromResolved = function(providers) {
          return unimplemented();
        };
        ReflectiveInjector.prototype.resolveAndInstantiate = function(provider) {
          return unimplemented();
        };
        ReflectiveInjector.prototype.instantiateResolved = function(provider) {
          return unimplemented();
        };
        ReflectiveInjector.prototype.get = function(token, notFoundValue) {};
        return ReflectiveInjector;
      }());
      $__export("ReflectiveInjector", ReflectiveInjector);
      ReflectiveInjector_ = (function() {
        function ReflectiveInjector_(_proto, _parent) {
          if (_parent === void 0) {
            _parent = null;
          }
          this._constructionCounter = 0;
          this._proto = _proto;
          this._parent = _parent;
          this._strategy = _proto._strategy.createInjectorStrategy(this);
        }
        ReflectiveInjector_.prototype.get = function(token, notFoundValue) {
          if (notFoundValue === void 0) {
            notFoundValue = THROW_IF_NOT_FOUND;
          }
          return this._getByKey(ReflectiveKey.get(token), null, null, notFoundValue);
        };
        ReflectiveInjector_.prototype.getAt = function(index) {
          return this._strategy.getObjAtIndex(index);
        };
        Object.defineProperty(ReflectiveInjector_.prototype, "parent", {
          get: function() {
            return this._parent;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ReflectiveInjector_.prototype, "internalStrategy", {
          get: function() {
            return this._strategy;
          },
          enumerable: true,
          configurable: true
        });
        ReflectiveInjector_.prototype.resolveAndCreateChild = function(providers) {
          var ResolvedReflectiveProviders = ReflectiveInjector.resolve(providers);
          return this.createChildFromResolved(ResolvedReflectiveProviders);
        };
        ReflectiveInjector_.prototype.createChildFromResolved = function(providers) {
          var proto = new ReflectiveProtoInjector(providers);
          var inj = new ReflectiveInjector_(proto);
          inj._parent = this;
          return inj;
        };
        ReflectiveInjector_.prototype.resolveAndInstantiate = function(provider) {
          return this.instantiateResolved(ReflectiveInjector.resolve([provider])[0]);
        };
        ReflectiveInjector_.prototype.instantiateResolved = function(provider) {
          return this._instantiateProvider(provider);
        };
        ReflectiveInjector_.prototype._new = function(provider) {
          if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
            throw new CyclicDependencyError(this, provider.key);
          }
          return this._instantiateProvider(provider);
        };
        ReflectiveInjector_.prototype._instantiateProvider = function(provider) {
          if (provider.multiProvider) {
            var res = new Array(provider.resolvedFactories.length);
            for (var i = 0; i < provider.resolvedFactories.length; ++i) {
              res[i] = this._instantiate(provider, provider.resolvedFactories[i]);
            }
            return res;
          } else {
            return this._instantiate(provider, provider.resolvedFactories[0]);
          }
        };
        ReflectiveInjector_.prototype._instantiate = function(provider, ResolvedReflectiveFactory) {
          var factory = ResolvedReflectiveFactory.factory;
          var deps = ResolvedReflectiveFactory.dependencies;
          var length = deps.length;
          var d0;
          var d1;
          var d2;
          var d3;
          var d4;
          var d5;
          var d6;
          var d7;
          var d8;
          var d9;
          var d10;
          var d11;
          var d12;
          var d13;
          var d14;
          var d15;
          var d16;
          var d17;
          var d18;
          var d19;
          try {
            d0 = length > 0 ? this._getByReflectiveDependency(provider, deps[0]) : null;
            d1 = length > 1 ? this._getByReflectiveDependency(provider, deps[1]) : null;
            d2 = length > 2 ? this._getByReflectiveDependency(provider, deps[2]) : null;
            d3 = length > 3 ? this._getByReflectiveDependency(provider, deps[3]) : null;
            d4 = length > 4 ? this._getByReflectiveDependency(provider, deps[4]) : null;
            d5 = length > 5 ? this._getByReflectiveDependency(provider, deps[5]) : null;
            d6 = length > 6 ? this._getByReflectiveDependency(provider, deps[6]) : null;
            d7 = length > 7 ? this._getByReflectiveDependency(provider, deps[7]) : null;
            d8 = length > 8 ? this._getByReflectiveDependency(provider, deps[8]) : null;
            d9 = length > 9 ? this._getByReflectiveDependency(provider, deps[9]) : null;
            d10 = length > 10 ? this._getByReflectiveDependency(provider, deps[10]) : null;
            d11 = length > 11 ? this._getByReflectiveDependency(provider, deps[11]) : null;
            d12 = length > 12 ? this._getByReflectiveDependency(provider, deps[12]) : null;
            d13 = length > 13 ? this._getByReflectiveDependency(provider, deps[13]) : null;
            d14 = length > 14 ? this._getByReflectiveDependency(provider, deps[14]) : null;
            d15 = length > 15 ? this._getByReflectiveDependency(provider, deps[15]) : null;
            d16 = length > 16 ? this._getByReflectiveDependency(provider, deps[16]) : null;
            d17 = length > 17 ? this._getByReflectiveDependency(provider, deps[17]) : null;
            d18 = length > 18 ? this._getByReflectiveDependency(provider, deps[18]) : null;
            d19 = length > 19 ? this._getByReflectiveDependency(provider, deps[19]) : null;
          } catch (e) {
            if (e instanceof AbstractProviderError || e instanceof InstantiationError) {
              e.addKey(this, provider.key);
            }
            throw e;
          }
          var obj;
          try {
            switch (length) {
              case 0:
                obj = factory();
                break;
              case 1:
                obj = factory(d0);
                break;
              case 2:
                obj = factory(d0, d1);
                break;
              case 3:
                obj = factory(d0, d1, d2);
                break;
              case 4:
                obj = factory(d0, d1, d2, d3);
                break;
              case 5:
                obj = factory(d0, d1, d2, d3, d4);
                break;
              case 6:
                obj = factory(d0, d1, d2, d3, d4, d5);
                break;
              case 7:
                obj = factory(d0, d1, d2, d3, d4, d5, d6);
                break;
              case 8:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                break;
              case 9:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                break;
              case 10:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                break;
              case 11:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
                break;
              case 12:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
                break;
              case 13:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
                break;
              case 14:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
                break;
              case 15:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
                break;
              case 16:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
                break;
              case 17:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
                break;
              case 18:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
                break;
              case 19:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
                break;
              case 20:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
                break;
              default:
                throw new Error("Cannot instantiate '" + provider.key.displayName + "' because it has more than 20 dependencies");
            }
          } catch (e) {
            throw new InstantiationError(this, e, e.stack, provider.key);
          }
          return obj;
        };
        ReflectiveInjector_.prototype._getByReflectiveDependency = function(provider, dep) {
          return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional ? null : THROW_IF_NOT_FOUND);
        };
        ReflectiveInjector_.prototype._getByKey = function(key, lowerBoundVisibility, upperBoundVisibility, notFoundValue) {
          if (key === INJECTOR_KEY) {
            return this;
          }
          if (upperBoundVisibility instanceof Self) {
            return this._getByKeySelf(key, notFoundValue);
          } else {
            return this._getByKeyDefault(key, notFoundValue, lowerBoundVisibility);
          }
        };
        ReflectiveInjector_.prototype._throwOrNull = function(key, notFoundValue) {
          if (notFoundValue !== THROW_IF_NOT_FOUND) {
            return notFoundValue;
          } else {
            throw new NoProviderError(this, key);
          }
        };
        ReflectiveInjector_.prototype._getByKeySelf = function(key, notFoundValue) {
          var obj = this._strategy.getObjByKeyId(key.id);
          return (obj !== UNDEFINED) ? obj : this._throwOrNull(key, notFoundValue);
        };
        ReflectiveInjector_.prototype._getByKeyDefault = function(key, notFoundValue, lowerBoundVisibility) {
          var inj;
          if (lowerBoundVisibility instanceof SkipSelf) {
            inj = this._parent;
          } else {
            inj = this;
          }
          while (inj instanceof ReflectiveInjector_) {
            var inj_ = (inj);
            var obj = inj_._strategy.getObjByKeyId(key.id);
            if (obj !== UNDEFINED)
              return obj;
            inj = inj_._parent;
          }
          if (inj !== null) {
            return inj.get(key.token, notFoundValue);
          } else {
            return this._throwOrNull(key, notFoundValue);
          }
        };
        Object.defineProperty(ReflectiveInjector_.prototype, "displayName", {
          get: function() {
            var providers = _mapProviders(this, function(b) {
              return ' "' + b.key.displayName + '" ';
            }).join(', ');
            return "ReflectiveInjector(providers: [" + providers + "])";
          },
          enumerable: true,
          configurable: true
        });
        ReflectiveInjector_.prototype.toString = function() {
          return this.displayName;
        };
        return ReflectiveInjector_;
      }());
      $__export("ReflectiveInjector_", ReflectiveInjector_);
      INJECTOR_KEY = ReflectiveKey.get(Injector);
    }
  };
});

System.register("@angular/core/src/di/reflective_errors.js", ["../facade/errors", "../facade/lang"], function($__export) {
  "use strict";
  var __extends,
      BaseError,
      WrappedError,
      stringify,
      AbstractProviderError,
      NoProviderError,
      CyclicDependencyError,
      InstantiationError,
      InvalidProviderError,
      NoAnnotationError,
      OutOfBoundsError,
      MixingMultiProvidersWithRegularProvidersError;
  function findFirstClosedCycle(keys) {
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
      if (res.indexOf(keys[i]) > -1) {
        res.push(keys[i]);
        return res;
      }
      res.push(keys[i]);
    }
    return res;
  }
  function constructResolvingPath(keys) {
    if (keys.length > 1) {
      var reversed = findFirstClosedCycle(keys.slice().reverse());
      var tokenStrs = reversed.map(function(k) {
        return stringify(k.token);
      });
      return ' (' + tokenStrs.join(' -> ') + ')';
    }
    return '';
  }
  function AbstractProviderError_tsickle_Closure_declarations() {
    AbstractProviderError.prototype.message;
    AbstractProviderError.prototype.keys;
    AbstractProviderError.prototype.injectors;
    AbstractProviderError.prototype.constructResolvingMessage;
  }
  function InstantiationError_tsickle_Closure_declarations() {
    InstantiationError.prototype.keys;
    InstantiationError.prototype.injectors;
  }
  return {
    setters: [function($__m) {
      BaseError = $__m.BaseError;
      WrappedError = $__m.WrappedError;
    }, function($__m) {
      stringify = $__m.stringify;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      AbstractProviderError = (function(_super) {
        __extends(AbstractProviderError, _super);
        function AbstractProviderError(injector, key, constructResolvingMessage) {
          _super.call(this, 'DI Error');
          this.keys = [key];
          this.injectors = [injector];
          this.constructResolvingMessage = constructResolvingMessage;
          this.message = this.constructResolvingMessage(this.keys);
        }
        AbstractProviderError.prototype.addKey = function(injector, key) {
          this.injectors.push(injector);
          this.keys.push(key);
          this.message = this.constructResolvingMessage(this.keys);
        };
        return AbstractProviderError;
      }(BaseError));
      $__export("AbstractProviderError", AbstractProviderError);
      NoProviderError = (function(_super) {
        __extends(NoProviderError, _super);
        function NoProviderError(injector, key) {
          _super.call(this, injector, key, function(keys) {
            var first = stringify(keys[0].token);
            return "No provider for " + first + "!" + constructResolvingPath(keys);
          });
        }
        return NoProviderError;
      }(AbstractProviderError));
      $__export("NoProviderError", NoProviderError);
      CyclicDependencyError = (function(_super) {
        __extends(CyclicDependencyError, _super);
        function CyclicDependencyError(injector, key) {
          _super.call(this, injector, key, function(keys) {
            return "Cannot instantiate cyclic dependency!" + constructResolvingPath(keys);
          });
        }
        return CyclicDependencyError;
      }(AbstractProviderError));
      $__export("CyclicDependencyError", CyclicDependencyError);
      InstantiationError = (function(_super) {
        __extends(InstantiationError, _super);
        function InstantiationError(injector, originalException, originalStack, key) {
          _super.call(this, 'DI Error', originalException);
          this.keys = [key];
          this.injectors = [injector];
        }
        InstantiationError.prototype.addKey = function(injector, key) {
          this.injectors.push(injector);
          this.keys.push(key);
        };
        Object.defineProperty(InstantiationError.prototype, "message", {
          get: function() {
            var first = stringify(this.keys[0].token);
            return this.originalError.message + ": Error during instantiation of " + first + "!" + constructResolvingPath(this.keys) + ".";
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(InstantiationError.prototype, "causeKey", {
          get: function() {
            return this.keys[0];
          },
          enumerable: true,
          configurable: true
        });
        return InstantiationError;
      }(WrappedError));
      $__export("InstantiationError", InstantiationError);
      InvalidProviderError = (function(_super) {
        __extends(InvalidProviderError, _super);
        function InvalidProviderError(provider) {
          _super.call(this, "Invalid provider - only instances of Provider and Type are allowed, got: " + provider);
        }
        return InvalidProviderError;
      }(BaseError));
      $__export("InvalidProviderError", InvalidProviderError);
      NoAnnotationError = (function(_super) {
        __extends(NoAnnotationError, _super);
        function NoAnnotationError(typeOrFunc, params) {
          _super.call(this, NoAnnotationError._genMessage(typeOrFunc, params));
        }
        NoAnnotationError._genMessage = function(typeOrFunc, params) {
          var signature = [];
          for (var i = 0,
              ii = params.length; i < ii; i++) {
            var parameter = params[i];
            if (!parameter || parameter.length == 0) {
              signature.push('?');
            } else {
              signature.push(parameter.map(stringify).join(' '));
            }
          }
          return 'Cannot resolve all parameters for \'' + stringify(typeOrFunc) + '\'(' + signature.join(', ') + '). ' + 'Make sure that all the parameters are decorated with Inject or have valid type annotations and that \'' + stringify(typeOrFunc) + '\' is decorated with Injectable.';
        };
        return NoAnnotationError;
      }(BaseError));
      $__export("NoAnnotationError", NoAnnotationError);
      OutOfBoundsError = (function(_super) {
        __extends(OutOfBoundsError, _super);
        function OutOfBoundsError(index) {
          _super.call(this, "Index " + index + " is out-of-bounds.");
        }
        return OutOfBoundsError;
      }(BaseError));
      $__export("OutOfBoundsError", OutOfBoundsError);
      MixingMultiProvidersWithRegularProvidersError = (function(_super) {
        __extends(MixingMultiProvidersWithRegularProvidersError, _super);
        function MixingMultiProvidersWithRegularProvidersError(provider1, provider2) {
          _super.call(this, 'Cannot mix multi providers and regular providers, got: ' + provider1.toString() + ' ' + provider2.toString());
        }
        return MixingMultiProvidersWithRegularProvidersError;
      }(BaseError));
      $__export("MixingMultiProvidersWithRegularProvidersError", MixingMultiProvidersWithRegularProvidersError);
    }
  };
});

System.register("@angular/core/src/di/reflective_provider.js", ["../reflection/reflection", "../type", "./forward_ref", "./metadata", "./reflective_errors", "./reflective_key"], function($__export) {
  "use strict";
  var reflector,
      Type,
      resolveForwardRef,
      Host,
      Inject,
      Optional,
      Self,
      SkipSelf,
      InvalidProviderError,
      MixingMultiProvidersWithRegularProvidersError,
      NoAnnotationError,
      ReflectiveKey,
      ReflectiveDependency,
      _EMPTY_LIST,
      ResolvedReflectiveProvider_,
      ResolvedReflectiveFactory;
  function ReflectiveDependency_tsickle_Closure_declarations() {
    ReflectiveDependency.prototype.key;
    ReflectiveDependency.prototype.optional;
    ReflectiveDependency.prototype.lowerBoundVisibility;
    ReflectiveDependency.prototype.upperBoundVisibility;
    ReflectiveDependency.prototype.properties;
  }
  function ResolvedReflectiveProvider__tsickle_Closure_declarations() {
    ResolvedReflectiveProvider_.prototype.key;
    ResolvedReflectiveProvider_.prototype.resolvedFactories;
    ResolvedReflectiveProvider_.prototype.multiProvider;
  }
  function ResolvedReflectiveFactory_tsickle_Closure_declarations() {
    ResolvedReflectiveFactory.prototype.factory;
    ResolvedReflectiveFactory.prototype.dependencies;
  }
  function resolveReflectiveFactory(provider) {
    var factoryFn;
    var resolvedDeps;
    if (provider.useClass) {
      var useClass = resolveForwardRef(provider.useClass);
      factoryFn = reflector.factory(useClass);
      resolvedDeps = _dependenciesFor(useClass);
    } else if (provider.useExisting) {
      factoryFn = function(aliasInstance) {
        return aliasInstance;
      };
      resolvedDeps = [ReflectiveDependency.fromKey(ReflectiveKey.get(provider.useExisting))];
    } else if (provider.useFactory) {
      factoryFn = provider.useFactory;
      resolvedDeps = constructDependencies(provider.useFactory, provider.deps);
    } else {
      factoryFn = function() {
        return provider.useValue;
      };
      resolvedDeps = _EMPTY_LIST;
    }
    return new ResolvedReflectiveFactory(factoryFn, resolvedDeps);
  }
  function resolveReflectiveProvider(provider) {
    return new ResolvedReflectiveProvider_(ReflectiveKey.get(provider.provide), [resolveReflectiveFactory(provider)], provider.multi);
  }
  function resolveReflectiveProviders(providers) {
    var normalized = _normalizeProviders(providers, []);
    var resolved = normalized.map(resolveReflectiveProvider);
    var resolvedProviderMap = mergeResolvedReflectiveProviders(resolved, new Map());
    return Array.from(resolvedProviderMap.values());
  }
  function mergeResolvedReflectiveProviders(providers, normalizedProvidersMap) {
    for (var i = 0; i < providers.length; i++) {
      var provider = providers[i];
      var existing = normalizedProvidersMap.get(provider.key.id);
      if (existing) {
        if (provider.multiProvider !== existing.multiProvider) {
          throw new MixingMultiProvidersWithRegularProvidersError(existing, provider);
        }
        if (provider.multiProvider) {
          for (var j = 0; j < provider.resolvedFactories.length; j++) {
            existing.resolvedFactories.push(provider.resolvedFactories[j]);
          }
        } else {
          normalizedProvidersMap.set(provider.key.id, provider);
        }
      } else {
        var resolvedProvider = void 0;
        if (provider.multiProvider) {
          resolvedProvider = new ResolvedReflectiveProvider_(provider.key, provider.resolvedFactories.slice(), provider.multiProvider);
        } else {
          resolvedProvider = provider;
        }
        normalizedProvidersMap.set(provider.key.id, resolvedProvider);
      }
    }
    return normalizedProvidersMap;
  }
  function _normalizeProviders(providers, res) {
    providers.forEach(function(b) {
      if (b instanceof Type) {
        res.push({
          provide: b,
          useClass: b
        });
      } else if (b && (typeof b === 'undefined' ? 'undefined' : $traceurRuntime.typeof(b)) == 'object' && ((b)).provide !== undefined) {
        res.push((b));
      } else if (b instanceof Array) {
        _normalizeProviders(b, res);
      } else {
        throw new InvalidProviderError(b);
      }
    });
    return res;
  }
  function constructDependencies(typeOrFunc, dependencies) {
    if (!dependencies) {
      return _dependenciesFor(typeOrFunc);
    } else {
      var params_1 = dependencies.map(function(t) {
        return [t];
      });
      return dependencies.map(function(t) {
        return _extractToken(typeOrFunc, t, params_1);
      });
    }
  }
  function _dependenciesFor(typeOrFunc) {
    var params = reflector.parameters(typeOrFunc);
    if (!params)
      return [];
    if (params.some(function(p) {
      return p == null;
    })) {
      throw new NoAnnotationError(typeOrFunc, params);
    }
    return params.map(function(p) {
      return _extractToken(typeOrFunc, p, params);
    });
  }
  function _extractToken(typeOrFunc, metadata, params) {
    var depProps = [];
    var token = null;
    var optional = false;
    if (!Array.isArray(metadata)) {
      if (metadata instanceof Inject) {
        return _createDependency(metadata.token, optional, null, null, depProps);
      } else {
        return _createDependency(metadata, optional, null, null, depProps);
      }
    }
    var lowerBoundVisibility = null;
    var upperBoundVisibility = null;
    for (var i = 0; i < metadata.length; ++i) {
      var paramMetadata = metadata[i];
      if (paramMetadata instanceof Type) {
        token = paramMetadata;
      } else if (paramMetadata instanceof Inject) {
        token = paramMetadata.token;
      } else if (paramMetadata instanceof Optional) {
        optional = true;
      } else if (paramMetadata instanceof Self) {
        upperBoundVisibility = paramMetadata;
      } else if (paramMetadata instanceof Host) {
        upperBoundVisibility = paramMetadata;
      } else if (paramMetadata instanceof SkipSelf) {
        lowerBoundVisibility = paramMetadata;
      }
    }
    token = resolveForwardRef(token);
    if (token != null) {
      return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
    } else {
      throw new NoAnnotationError(typeOrFunc, params);
    }
  }
  function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps) {
    return new ReflectiveDependency(ReflectiveKey.get(token), optional, lowerBoundVisibility, upperBoundVisibility, depProps);
  }
  $__export("resolveReflectiveProviders", resolveReflectiveProviders);
  $__export("mergeResolvedReflectiveProviders", mergeResolvedReflectiveProviders);
  $__export("constructDependencies", constructDependencies);
  return {
    setters: [function($__m) {
      reflector = $__m.reflector;
    }, function($__m) {
      Type = $__m.Type;
    }, function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
    }, function($__m) {
      Host = $__m.Host;
      Inject = $__m.Inject;
      Optional = $__m.Optional;
      Self = $__m.Self;
      SkipSelf = $__m.SkipSelf;
    }, function($__m) {
      InvalidProviderError = $__m.InvalidProviderError;
      MixingMultiProvidersWithRegularProvidersError = $__m.MixingMultiProvidersWithRegularProvidersError;
      NoAnnotationError = $__m.NoAnnotationError;
    }, function($__m) {
      ReflectiveKey = $__m.ReflectiveKey;
    }],
    execute: function() {
      ReflectiveDependency = (function() {
        function ReflectiveDependency(key, optional, lowerBoundVisibility, upperBoundVisibility, properties) {
          this.key = key;
          this.optional = optional;
          this.lowerBoundVisibility = lowerBoundVisibility;
          this.upperBoundVisibility = upperBoundVisibility;
          this.properties = properties;
        }
        ReflectiveDependency.fromKey = function(key) {
          return new ReflectiveDependency(key, false, null, null, []);
        };
        return ReflectiveDependency;
      }());
      $__export("ReflectiveDependency", ReflectiveDependency);
      _EMPTY_LIST = [];
      ResolvedReflectiveProvider_ = (function() {
        function ResolvedReflectiveProvider_(key, resolvedFactories, multiProvider) {
          this.key = key;
          this.resolvedFactories = resolvedFactories;
          this.multiProvider = multiProvider;
        }
        Object.defineProperty(ResolvedReflectiveProvider_.prototype, "resolvedFactory", {
          get: function() {
            return this.resolvedFactories[0];
          },
          enumerable: true,
          configurable: true
        });
        return ResolvedReflectiveProvider_;
      }());
      $__export("ResolvedReflectiveProvider_", ResolvedReflectiveProvider_);
      ResolvedReflectiveFactory = (function() {
        function ResolvedReflectiveFactory(factory, dependencies) {
          this.factory = factory;
          this.dependencies = dependencies;
        }
        return ResolvedReflectiveFactory;
      }());
      $__export("ResolvedReflectiveFactory", ResolvedReflectiveFactory);
    }
  };
});

System.register("@angular/core/src/di/forward_ref.js", ["../facade/lang"], function($__export) {
  "use strict";
  var stringify;
  function forwardRef(forwardRefFn) {
    ((forwardRefFn)).__forward_ref__ = forwardRef;
    ((forwardRefFn)).toString = function() {
      return stringify(this());
    };
    return (((forwardRefFn)));
  }
  function resolveForwardRef(type) {
    if (typeof type === 'function' && type.hasOwnProperty('__forward_ref__') && type.__forward_ref__ === forwardRef) {
      return ((type))();
    } else {
      return type;
    }
  }
  $__export("forwardRef", forwardRef);
  $__export("resolveForwardRef", resolveForwardRef);
  return {
    setters: [function($__m) {
      stringify = $__m.stringify;
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/di/reflective_key.js", ["../facade/lang", "./forward_ref"], function($__export) {
  "use strict";
  var stringify,
      resolveForwardRef,
      ReflectiveKey,
      KeyRegistry,
      _globalKeyRegistry;
  function ReflectiveKey_tsickle_Closure_declarations() {
    ReflectiveKey.prototype.token;
    ReflectiveKey.prototype.id;
  }
  function KeyRegistry_tsickle_Closure_declarations() {
    KeyRegistry.prototype._allKeys;
  }
  return {
    setters: [function($__m) {
      stringify = $__m.stringify;
    }, function($__m) {
      resolveForwardRef = $__m.resolveForwardRef;
    }],
    execute: function() {
      ReflectiveKey = (function() {
        function ReflectiveKey(token, id) {
          this.token = token;
          this.id = id;
          if (!token) {
            throw new Error('Token must be defined!');
          }
        }
        Object.defineProperty(ReflectiveKey.prototype, "displayName", {
          get: function() {
            return stringify(this.token);
          },
          enumerable: true,
          configurable: true
        });
        ReflectiveKey.get = function(token) {
          return _globalKeyRegistry.get(resolveForwardRef(token));
        };
        Object.defineProperty(ReflectiveKey, "numberOfKeys", {
          get: function() {
            return _globalKeyRegistry.numberOfKeys;
          },
          enumerable: true,
          configurable: true
        });
        return ReflectiveKey;
      }());
      $__export("ReflectiveKey", ReflectiveKey);
      KeyRegistry = (function() {
        function KeyRegistry() {
          this._allKeys = new Map();
        }
        KeyRegistry.prototype.get = function(token) {
          if (token instanceof ReflectiveKey)
            return token;
          if (this._allKeys.has(token)) {
            return this._allKeys.get(token);
          }
          var newKey = new ReflectiveKey(token, ReflectiveKey.numberOfKeys);
          this._allKeys.set(token, newKey);
          return newKey;
        };
        Object.defineProperty(KeyRegistry.prototype, "numberOfKeys", {
          get: function() {
            return this._allKeys.size;
          },
          enumerable: true,
          configurable: true
        });
        return KeyRegistry;
      }());
      $__export("KeyRegistry", KeyRegistry);
      _globalKeyRegistry = new KeyRegistry();
    }
  };
});

System.register("@angular/core/src/di/metadata.js", ["../util/decorators"], function($__export) {
  "use strict";
  var makeDecorator,
      makeParamDecorator,
      Inject,
      Optional,
      Injectable,
      Self,
      SkipSelf,
      Host;
  return {
    setters: [function($__m) {
      makeDecorator = $__m.makeDecorator;
      makeParamDecorator = $__m.makeParamDecorator;
    }],
    execute: function() {
      Inject = makeParamDecorator('Inject', [['token', undefined]]);
      $__export("Inject", Inject);
      Optional = makeParamDecorator('Optional', []);
      $__export("Optional", Optional);
      Injectable = (makeDecorator('Injectable', []));
      $__export("Injectable", Injectable);
      Self = makeParamDecorator('Self', []);
      $__export("Self", Self);
      SkipSelf = makeParamDecorator('SkipSelf', []);
      $__export("SkipSelf", SkipSelf);
      Host = makeParamDecorator('Host', []);
      $__export("Host", Host);
    }
  };
});

System.register("@angular/core/src/di/opaque_token.js", ["./metadata"], function($__export) {
  "use strict";
  var Injectable,
      OpaqueToken;
  function OpaqueToken_tsickle_Closure_declarations() {
    OpaqueToken.decorators;
    OpaqueToken.ctorParameters;
    OpaqueToken.prototype._desc;
  }
  return {
    setters: [function($__m) {
      Injectable = $__m.Injectable;
    }],
    execute: function() {
      OpaqueToken = (function() {
        function OpaqueToken(_desc) {
          this._desc = _desc;
        }
        OpaqueToken.prototype.toString = function() {
          return "Token " + this._desc;
        };
        OpaqueToken.decorators = [{type: Injectable}];
        OpaqueToken.ctorParameters = function() {
          return [null];
        };
        return OpaqueToken;
      }());
      $__export("OpaqueToken", OpaqueToken);
    }
  };
});

System.register("@angular/core/src/di.js", ["./di/metadata", "./di/forward_ref", "./di/injector", "./di/reflective_injector", "./di/reflective_provider", "./di/reflective_key", "./di/opaque_token"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({
        Inject: $__m.Inject,
        Optional: $__m.Optional,
        Injectable: $__m.Injectable,
        Self: $__m.Self,
        SkipSelf: $__m.SkipSelf,
        Host: $__m.Host
      });
    }, function($__m) {
      $__export({
        forwardRef: $__m.forwardRef,
        resolveForwardRef: $__m.resolveForwardRef
      });
    }, function($__m) {
      $__export({Injector: $__m.Injector});
    }, function($__m) {
      $__export({ReflectiveInjector: $__m.ReflectiveInjector});
    }, function($__m) {
      $__export({ResolvedReflectiveFactory: $__m.ResolvedReflectiveFactory});
    }, function($__m) {
      $__export({ReflectiveKey: $__m.ReflectiveKey});
    }, function($__m) {
      $__export({OpaqueToken: $__m.OpaqueToken});
    }],
    execute: function() {}
  };
});

System.register("@angular/core/src/version.js", [], function($__export) {
  "use strict";
  var Version,
      VERSION;
  function Version_tsickle_Closure_declarations() {
    Version.prototype.full;
  }
  return {
    setters: [],
    execute: function() {
      Version = (function() {
        function Version(full) {
          this.full = full;
        }
        Object.defineProperty(Version.prototype, "major", {
          get: function() {
            return this.full.split('.')[0];
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Version.prototype, "minor", {
          get: function() {
            return this.full.split('.')[1];
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Version.prototype, "patch", {
          get: function() {
            return this.full.split('.').slice(2).join('.');
          },
          enumerable: true,
          configurable: true
        });
        return Version;
      }());
      $__export("Version", Version);
      VERSION = new Version('2.3.1');
      $__export("VERSION", VERSION);
    }
  };
});

System.register("@angular/core/src/facade/collection.js", ["./lang"], function($__export) {
  "use strict";
  var getSymbolIterator,
      isJsObject,
      StringMapWrapper,
      ListWrapper;
  function isListLikeIterable(obj) {
    if (!isJsObject(obj))
      return false;
    return Array.isArray(obj) || (!(obj instanceof Map) && getSymbolIterator() in obj);
  }
  function areIterablesEqual(a, b, comparator) {
    var iterator1 = a[getSymbolIterator()]();
    var iterator2 = b[getSymbolIterator()]();
    while (true) {
      var item1 = iterator1.next();
      var item2 = iterator2.next();
      if (item1.done && item2.done)
        return true;
      if (item1.done || item2.done)
        return false;
      if (!comparator(item1.value, item2.value))
        return false;
    }
  }
  function iterateListLike(obj, fn) {
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        fn(obj[i]);
      }
    } else {
      var iterator = obj[getSymbolIterator()]();
      var item = void 0;
      while (!((item = iterator.next()).done)) {
        fn(item.value);
      }
    }
  }
  $__export("isListLikeIterable", isListLikeIterable);
  $__export("areIterablesEqual", areIterablesEqual);
  $__export("iterateListLike", iterateListLike);
  return {
    setters: [function($__m) {
      getSymbolIterator = $__m.getSymbolIterator;
      isJsObject = $__m.isJsObject;
    }],
    execute: function() {
      StringMapWrapper = (function() {
        function StringMapWrapper() {}
        StringMapWrapper.merge = function(m1, m2) {
          var m = {};
          for (var _i = 0,
              _a = Object.keys(m1); _i < _a.length; _i++) {
            var k = _a[_i];
            m[k] = m1[k];
          }
          for (var _b = 0,
              _c = Object.keys(m2); _b < _c.length; _b++) {
            var k = _c[_b];
            m[k] = m2[k];
          }
          return m;
        };
        StringMapWrapper.equals = function(m1, m2) {
          var k1 = Object.keys(m1);
          var k2 = Object.keys(m2);
          if (k1.length != k2.length) {
            return false;
          }
          for (var i = 0; i < k1.length; i++) {
            var key = k1[i];
            if (m1[key] !== m2[key]) {
              return false;
            }
          }
          return true;
        };
        return StringMapWrapper;
      }());
      $__export("StringMapWrapper", StringMapWrapper);
      ListWrapper = (function() {
        function ListWrapper() {}
        ListWrapper.findLast = function(arr, condition) {
          for (var i = arr.length - 1; i >= 0; i--) {
            if (condition(arr[i])) {
              return arr[i];
            }
          }
          return null;
        };
        ListWrapper.removeAll = function(list, items) {
          for (var i = 0; i < items.length; ++i) {
            var index = list.indexOf(items[i]);
            if (index > -1) {
              list.splice(index, 1);
            }
          }
        };
        ListWrapper.remove = function(list, el) {
          var index = list.indexOf(el);
          if (index > -1) {
            list.splice(index, 1);
            return true;
          }
          return false;
        };
        ListWrapper.equals = function(a, b) {
          if (a.length != b.length)
            return false;
          for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i])
              return false;
          }
          return true;
        };
        ListWrapper.flatten = function(list) {
          return list.reduce(function(flat, item) {
            var flatItem = Array.isArray(item) ? ListWrapper.flatten(item) : item;
            return ((flat)).concat(flatItem);
          }, []);
        };
        return ListWrapper;
      }());
      $__export("ListWrapper", ListWrapper);
    }
  };
});

System.register("@angular/core/src/change_detection/change_detection_util.js", ["../facade/collection", "../facade/lang"], function($__export) {
  "use strict";
  var areIterablesEqual,
      isListLikeIterable,
      isPrimitive,
      looseIdentical,
      UNINITIALIZED,
      WrappedValue,
      ValueUnwrapper,
      SimpleChange;
  function devModeEqual(a, b) {
    if (isListLikeIterable(a) && isListLikeIterable(b)) {
      return areIterablesEqual(a, b, devModeEqual);
    } else if (!isListLikeIterable(a) && !isPrimitive(a) && !isListLikeIterable(b) && !isPrimitive(b)) {
      return true;
    } else {
      return looseIdentical(a, b);
    }
  }
  function WrappedValue_tsickle_Closure_declarations() {
    WrappedValue.prototype.wrapped;
  }
  function ValueUnwrapper_tsickle_Closure_declarations() {
    ValueUnwrapper.prototype.hasWrappedValue;
  }
  function SimpleChange_tsickle_Closure_declarations() {
    SimpleChange.prototype.previousValue;
    SimpleChange.prototype.currentValue;
  }
  $__export("devModeEqual", devModeEqual);
  return {
    setters: [function($__m) {
      areIterablesEqual = $__m.areIterablesEqual;
      isListLikeIterable = $__m.isListLikeIterable;
    }, function($__m) {
      isPrimitive = $__m.isPrimitive;
      looseIdentical = $__m.looseIdentical;
      $__export({looseIdentical: $__m.looseIdentical});
    }],
    execute: function() {
      UNINITIALIZED = {toString: function() {
          return 'CD_INIT_VALUE';
        }};
      $__export("UNINITIALIZED", UNINITIALIZED);
      WrappedValue = (function() {
        function WrappedValue(wrapped) {
          this.wrapped = wrapped;
        }
        WrappedValue.wrap = function(value) {
          return new WrappedValue(value);
        };
        return WrappedValue;
      }());
      $__export("WrappedValue", WrappedValue);
      ValueUnwrapper = (function() {
        function ValueUnwrapper() {
          this.hasWrappedValue = false;
        }
        ValueUnwrapper.prototype.unwrap = function(value) {
          if (value instanceof WrappedValue) {
            this.hasWrappedValue = true;
            return value.wrapped;
          }
          return value;
        };
        ValueUnwrapper.prototype.reset = function() {
          this.hasWrappedValue = false;
        };
        return ValueUnwrapper;
      }());
      $__export("ValueUnwrapper", ValueUnwrapper);
      SimpleChange = (function() {
        function SimpleChange(previousValue, currentValue) {
          this.previousValue = previousValue;
          this.currentValue = currentValue;
        }
        SimpleChange.prototype.isFirstChange = function() {
          return this.previousValue === UNINITIALIZED;
        };
        return SimpleChange;
      }());
      $__export("SimpleChange", SimpleChange);
    }
  };
});

System.register("@angular/core/src/linker/errors.js", ["../change_detection/change_detection_util", "../facade/errors"], function($__export) {
  "use strict";
  var __extends,
      UNINITIALIZED,
      BaseError,
      WrappedError,
      ExpressionChangedAfterItHasBeenCheckedError,
      ViewWrappedError,
      ViewDestroyedError;
  function ViewWrappedError_tsickle_Closure_declarations() {
    ViewWrappedError.prototype.context;
  }
  return {
    setters: [function($__m) {
      UNINITIALIZED = $__m.UNINITIALIZED;
    }, function($__m) {
      BaseError = $__m.BaseError;
      WrappedError = $__m.WrappedError;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      ExpressionChangedAfterItHasBeenCheckedError = (function(_super) {
        __extends(ExpressionChangedAfterItHasBeenCheckedError, _super);
        function ExpressionChangedAfterItHasBeenCheckedError(oldValue, currValue) {
          var msg = "Expression has changed after it was checked. Previous value: '" + oldValue + "'. Current value: '" + currValue + "'.";
          if (oldValue === UNINITIALIZED) {
            msg += " It seems like the view has been created after its parent and its children have been dirty checked." + " Has it been created in a change detection hook ?";
          }
          _super.call(this, msg);
        }
        return ExpressionChangedAfterItHasBeenCheckedError;
      }(BaseError));
      $__export("ExpressionChangedAfterItHasBeenCheckedError", ExpressionChangedAfterItHasBeenCheckedError);
      ViewWrappedError = (function(_super) {
        __extends(ViewWrappedError, _super);
        function ViewWrappedError(originalError, context) {
          _super.call(this, "Error in " + context.source, originalError);
          this.context = context;
        }
        return ViewWrappedError;
      }(WrappedError));
      $__export("ViewWrappedError", ViewWrappedError);
      ViewDestroyedError = (function(_super) {
        __extends(ViewDestroyedError, _super);
        function ViewDestroyedError(details) {
          _super.call(this, "Attempt to use a destroyed view: " + details);
        }
        return ViewDestroyedError;
      }(BaseError));
      $__export("ViewDestroyedError", ViewDestroyedError);
    }
  };
});

System.register("@angular/core/src/linker/view_utils.js", ["../animation/animation_queue", "../change_detection/change_detection", "../change_detection/change_detection_util", "../di", "../facade/lang", "../render/api", "../security", "../version", "./errors"], function($__export) {
  "use strict";
  var AnimationQueue,
      devModeEqual,
      UNINITIALIZED,
      Injectable,
      isPresent,
      looseIdentical,
      RenderComponentType,
      RootRenderer,
      Sanitizer,
      VERSION,
      ExpressionChangedAfterItHasBeenCheckedError,
      ViewUtils,
      nextRenderComponentTypeId,
      EMPTY_ARRAY,
      EMPTY_MAP,
      CAMEL_CASE_REGEXP,
      InlineArray0,
      InlineArray2,
      InlineArray4,
      InlineArray8,
      InlineArray16,
      InlineArrayDynamic,
      EMPTY_INLINE_ARRAY;
  function ViewUtils_tsickle_Closure_declarations() {
    ViewUtils.decorators;
    ViewUtils.ctorParameters;
    ViewUtils.prototype.sanitizer;
    ViewUtils.prototype._nextCompTypeId;
    ViewUtils.prototype._renderer;
    ViewUtils.prototype.animationQueue;
  }
  function createRenderComponentType(templateUrl, slotCount, encapsulation, styles, animations) {
    return new RenderComponentType("" + nextRenderComponentTypeId++, templateUrl, slotCount, encapsulation, styles, animations);
  }
  function addToArray(e, array) {
    array.push(e);
  }
  function interpolate(valueCount, constAndInterp) {
    var result = '';
    for (var i = 0; i < valueCount * 2; i = i + 2) {
      result = result + constAndInterp[i] + _toStringWithNull(constAndInterp[i + 1]);
    }
    return result + constAndInterp[valueCount * 2];
  }
  function inlineInterpolate(valueCount, c0, a1, c1, a2, c2, a3, c3, a4, c4, a5, c5, a6, c6, a7, c7, a8, c8, a9, c9) {
    switch (valueCount) {
      case 1:
        return c0 + _toStringWithNull(a1) + c1;
      case 2:
        return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2;
      case 3:
        return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) + c3;
      case 4:
        return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) + c3 + _toStringWithNull(a4) + c4;
      case 5:
        return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) + c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5;
      case 6:
        return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) + c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) + c6;
      case 7:
        return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) + c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) + c6 + _toStringWithNull(a7) + c7;
      case 8:
        return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) + c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) + c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8;
      case 9:
        return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) + c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) + c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8 + _toStringWithNull(a9) + c9;
      default:
        throw new Error("Does not support more than 9 expressions");
    }
  }
  function _toStringWithNull(v) {
    return v != null ? v.toString() : '';
  }
  function checkBinding(throwOnChange, oldValue, newValue) {
    if (throwOnChange) {
      if (!devModeEqual(oldValue, newValue)) {
        throw new ExpressionChangedAfterItHasBeenCheckedError(oldValue, newValue);
      }
      return false;
    } else {
      return !looseIdentical(oldValue, newValue);
    }
  }
  function castByValue(input, value) {
    return (input);
  }
  function pureProxy1(fn) {
    var result;
    var v0 = UNINITIALIZED;
    return function(p0) {
      if (!looseIdentical(v0, p0)) {
        v0 = p0;
        result = fn(p0);
      }
      return result;
    };
  }
  function pureProxy2(fn) {
    var result;
    var v0 = UNINITIALIZED;
    var v1 = UNINITIALIZED;
    return function(p0, p1) {
      if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1)) {
        v0 = p0;
        v1 = p1;
        result = fn(p0, p1);
      }
      return result;
    };
  }
  function pureProxy3(fn) {
    var result;
    var v0 = UNINITIALIZED;
    var v1 = UNINITIALIZED;
    var v2 = UNINITIALIZED;
    return function(p0, p1, p2) {
      if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2)) {
        v0 = p0;
        v1 = p1;
        v2 = p2;
        result = fn(p0, p1, p2);
      }
      return result;
    };
  }
  function pureProxy4(fn) {
    var result;
    var v0,
        v1,
        v2,
        v3;
    v0 = v1 = v2 = v3 = UNINITIALIZED;
    return function(p0, p1, p2, p3) {
      if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) || !looseIdentical(v3, p3)) {
        v0 = p0;
        v1 = p1;
        v2 = p2;
        v3 = p3;
        result = fn(p0, p1, p2, p3);
      }
      return result;
    };
  }
  function pureProxy5(fn) {
    var result;
    var v0,
        v1,
        v2,
        v3,
        v4;
    v0 = v1 = v2 = v3 = v4 = UNINITIALIZED;
    return function(p0, p1, p2, p3, p4) {
      if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) || !looseIdentical(v3, p3) || !looseIdentical(v4, p4)) {
        v0 = p0;
        v1 = p1;
        v2 = p2;
        v3 = p3;
        v4 = p4;
        result = fn(p0, p1, p2, p3, p4);
      }
      return result;
    };
  }
  function pureProxy6(fn) {
    var result;
    var v0,
        v1,
        v2,
        v3,
        v4,
        v5;
    v0 = v1 = v2 = v3 = v4 = v5 = UNINITIALIZED;
    return function(p0, p1, p2, p3, p4, p5) {
      if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) || !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5)) {
        v0 = p0;
        v1 = p1;
        v2 = p2;
        v3 = p3;
        v4 = p4;
        v5 = p5;
        result = fn(p0, p1, p2, p3, p4, p5);
      }
      return result;
    };
  }
  function pureProxy7(fn) {
    var result;
    var v0,
        v1,
        v2,
        v3,
        v4,
        v5,
        v6;
    v0 = v1 = v2 = v3 = v4 = v5 = v6 = UNINITIALIZED;
    return function(p0, p1, p2, p3, p4, p5, p6) {
      if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) || !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) || !looseIdentical(v6, p6)) {
        v0 = p0;
        v1 = p1;
        v2 = p2;
        v3 = p3;
        v4 = p4;
        v5 = p5;
        v6 = p6;
        result = fn(p0, p1, p2, p3, p4, p5, p6);
      }
      return result;
    };
  }
  function pureProxy8(fn) {
    var result;
    var v0,
        v1,
        v2,
        v3,
        v4,
        v5,
        v6,
        v7;
    v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = UNINITIALIZED;
    return function(p0, p1, p2, p3, p4, p5, p6, p7) {
      if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) || !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) || !looseIdentical(v6, p6) || !looseIdentical(v7, p7)) {
        v0 = p0;
        v1 = p1;
        v2 = p2;
        v3 = p3;
        v4 = p4;
        v5 = p5;
        v6 = p6;
        v7 = p7;
        result = fn(p0, p1, p2, p3, p4, p5, p6, p7);
      }
      return result;
    };
  }
  function pureProxy9(fn) {
    var result;
    var v0,
        v1,
        v2,
        v3,
        v4,
        v5,
        v6,
        v7,
        v8;
    v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = v8 = UNINITIALIZED;
    return function(p0, p1, p2, p3, p4, p5, p6, p7, p8) {
      if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) || !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) || !looseIdentical(v6, p6) || !looseIdentical(v7, p7) || !looseIdentical(v8, p8)) {
        v0 = p0;
        v1 = p1;
        v2 = p2;
        v3 = p3;
        v4 = p4;
        v5 = p5;
        v6 = p6;
        v7 = p7;
        v8 = p8;
        result = fn(p0, p1, p2, p3, p4, p5, p6, p7, p8);
      }
      return result;
    };
  }
  function pureProxy10(fn) {
    var result;
    var v0,
        v1,
        v2,
        v3,
        v4,
        v5,
        v6,
        v7,
        v8,
        v9;
    v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = v8 = v9 = UNINITIALIZED;
    return function(p0, p1, p2, p3, p4, p5, p6, p7, p8, p9) {
      if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) || !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) || !looseIdentical(v6, p6) || !looseIdentical(v7, p7) || !looseIdentical(v8, p8) || !looseIdentical(v9, p9)) {
        v0 = p0;
        v1 = p1;
        v2 = p2;
        v3 = p3;
        v4 = p4;
        v5 = p5;
        v6 = p6;
        v7 = p7;
        v8 = p8;
        v9 = p9;
        result = fn(p0, p1, p2, p3, p4, p5, p6, p7, p8, p9);
      }
      return result;
    };
  }
  function setBindingDebugInfoForChanges(renderer, el, changes) {
    Object.keys(changes).forEach(function(propName) {
      setBindingDebugInfo(renderer, el, propName, changes[propName].currentValue);
    });
  }
  function setBindingDebugInfo(renderer, el, propName, value) {
    try {
      renderer.setBindingDebugInfo(el, "ng-reflect-" + camelCaseToDashCase(propName), value ? value.toString() : null);
    } catch (e) {
      renderer.setBindingDebugInfo(el, "ng-reflect-" + camelCaseToDashCase(propName), '[ERROR] Exception while trying to serialize the value');
    }
  }
  function camelCaseToDashCase(input) {
    return input.replace(CAMEL_CASE_REGEXP, function() {
      var m = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        m[_i - 0] = arguments[_i];
      }
      return '-' + m[1].toLowerCase();
    });
  }
  function createRenderElement(renderer, parentElement, name, attrs, debugInfo) {
    var el = renderer.createElement(parentElement, name, debugInfo);
    for (var i = 0; i < attrs.length; i += 2) {
      renderer.setElementAttribute(el, attrs.get(i), attrs.get(i + 1));
    }
    return el;
  }
  function selectOrCreateRenderHostElement(renderer, elementName, attrs, rootSelectorOrNode, debugInfo) {
    var hostElement;
    if (isPresent(rootSelectorOrNode)) {
      hostElement = renderer.selectRootElement(rootSelectorOrNode, debugInfo);
      for (var i = 0; i < attrs.length; i += 2) {
        renderer.setElementAttribute(hostElement, attrs.get(i), attrs.get(i + 1));
      }
      renderer.setElementAttribute(hostElement, 'ng-version', VERSION.full);
    } else {
      hostElement = createRenderElement(renderer, null, elementName, attrs, debugInfo);
    }
    return hostElement;
  }
  function subscribeToRenderElement(view, element, eventNamesAndTargets, listener) {
    var disposables = createEmptyInlineArray(eventNamesAndTargets.length / 2);
    for (var i = 0; i < eventNamesAndTargets.length; i += 2) {
      var eventName = eventNamesAndTargets.get(i);
      var eventTarget = eventNamesAndTargets.get(i + 1);
      var disposable = void 0;
      if (eventTarget) {
        disposable = view.renderer.listenGlobal(eventTarget, eventName, listener.bind(view, eventTarget + ":" + eventName));
      } else {
        disposable = view.renderer.listen(element, eventName, listener.bind(view, eventName));
      }
      disposables.set(i / 2, disposable);
    }
    return disposeInlineArray.bind(null, disposables);
  }
  function disposeInlineArray(disposables) {
    for (var i = 0; i < disposables.length; i++) {
      disposables.get(i)();
    }
  }
  function noop() {}
  function createEmptyInlineArray(length) {
    var ctor;
    if (length <= 2) {
      ctor = InlineArray2;
    } else if (length <= 4) {
      ctor = InlineArray4;
    } else if (length <= 8) {
      ctor = InlineArray8;
    } else if (length <= 16) {
      ctor = InlineArray16;
    } else {
      ctor = InlineArrayDynamic;
    }
    return new ctor(length);
  }
  function InlineArray0_tsickle_Closure_declarations() {
    InlineArray0.prototype.length;
  }
  function InlineArray2_tsickle_Closure_declarations() {
    InlineArray2.prototype.length;
    InlineArray2.prototype._v0;
    InlineArray2.prototype._v1;
  }
  function InlineArray4_tsickle_Closure_declarations() {
    InlineArray4.prototype.length;
    InlineArray4.prototype._v0;
    InlineArray4.prototype._v1;
    InlineArray4.prototype._v2;
    InlineArray4.prototype._v3;
  }
  function InlineArray8_tsickle_Closure_declarations() {
    InlineArray8.prototype.length;
    InlineArray8.prototype._v0;
    InlineArray8.prototype._v1;
    InlineArray8.prototype._v2;
    InlineArray8.prototype._v3;
    InlineArray8.prototype._v4;
    InlineArray8.prototype._v5;
    InlineArray8.prototype._v6;
    InlineArray8.prototype._v7;
  }
  function InlineArray16_tsickle_Closure_declarations() {
    InlineArray16.prototype.length;
    InlineArray16.prototype._v0;
    InlineArray16.prototype._v1;
    InlineArray16.prototype._v2;
    InlineArray16.prototype._v3;
    InlineArray16.prototype._v4;
    InlineArray16.prototype._v5;
    InlineArray16.prototype._v6;
    InlineArray16.prototype._v7;
    InlineArray16.prototype._v8;
    InlineArray16.prototype._v9;
    InlineArray16.prototype._v10;
    InlineArray16.prototype._v11;
    InlineArray16.prototype._v12;
    InlineArray16.prototype._v13;
    InlineArray16.prototype._v14;
    InlineArray16.prototype._v15;
  }
  function InlineArrayDynamic_tsickle_Closure_declarations() {
    InlineArrayDynamic.prototype._values;
    InlineArrayDynamic.prototype.length;
  }
  $__export("createRenderComponentType", createRenderComponentType);
  $__export("addToArray", addToArray);
  $__export("interpolate", interpolate);
  $__export("inlineInterpolate", inlineInterpolate);
  $__export("checkBinding", checkBinding);
  $__export("castByValue", castByValue);
  $__export("pureProxy1", pureProxy1);
  $__export("pureProxy2", pureProxy2);
  $__export("pureProxy3", pureProxy3);
  $__export("pureProxy4", pureProxy4);
  $__export("pureProxy5", pureProxy5);
  $__export("pureProxy6", pureProxy6);
  $__export("pureProxy7", pureProxy7);
  $__export("pureProxy8", pureProxy8);
  $__export("pureProxy9", pureProxy9);
  $__export("pureProxy10", pureProxy10);
  $__export("setBindingDebugInfoForChanges", setBindingDebugInfoForChanges);
  $__export("setBindingDebugInfo", setBindingDebugInfo);
  $__export("createRenderElement", createRenderElement);
  $__export("selectOrCreateRenderHostElement", selectOrCreateRenderHostElement);
  $__export("subscribeToRenderElement", subscribeToRenderElement);
  $__export("noop", noop);
  return {
    setters: [function($__m) {
      AnimationQueue = $__m.AnimationQueue;
    }, function($__m) {
      devModeEqual = $__m.devModeEqual;
    }, function($__m) {
      UNINITIALIZED = $__m.UNINITIALIZED;
    }, function($__m) {
      Injectable = $__m.Injectable;
    }, function($__m) {
      isPresent = $__m.isPresent;
      looseIdentical = $__m.looseIdentical;
    }, function($__m) {
      RenderComponentType = $__m.RenderComponentType;
      RootRenderer = $__m.RootRenderer;
    }, function($__m) {
      Sanitizer = $__m.Sanitizer;
    }, function($__m) {
      VERSION = $__m.VERSION;
    }, function($__m) {
      ExpressionChangedAfterItHasBeenCheckedError = $__m.ExpressionChangedAfterItHasBeenCheckedError;
    }],
    execute: function() {
      ViewUtils = (function() {
        function ViewUtils(_renderer, sanitizer, animationQueue) {
          this._renderer = _renderer;
          this.animationQueue = animationQueue;
          this._nextCompTypeId = 0;
          this.sanitizer = sanitizer;
        }
        ViewUtils.prototype.renderComponent = function(renderComponentType) {
          return this._renderer.renderComponent(renderComponentType);
        };
        ViewUtils.decorators = [{type: Injectable}];
        ViewUtils.ctorParameters = function() {
          return [{type: RootRenderer}, {type: Sanitizer}, {type: AnimationQueue}];
        };
        return ViewUtils;
      }());
      $__export("ViewUtils", ViewUtils);
      nextRenderComponentTypeId = 0;
      EMPTY_ARRAY = [];
      $__export("EMPTY_ARRAY", EMPTY_ARRAY);
      EMPTY_MAP = {};
      $__export("EMPTY_MAP", EMPTY_MAP);
      CAMEL_CASE_REGEXP = /([A-Z])/g;
      InlineArray0 = (function() {
        function InlineArray0() {
          this.length = 0;
        }
        InlineArray0.prototype.get = function(index) {
          return undefined;
        };
        InlineArray0.prototype.set = function(index, value) {};
        return InlineArray0;
      }());
      InlineArray2 = (function() {
        function InlineArray2(length, _v0, _v1) {
          this.length = length;
          this._v0 = _v0;
          this._v1 = _v1;
        }
        InlineArray2.prototype.get = function(index) {
          switch (index) {
            case 0:
              return this._v0;
            case 1:
              return this._v1;
            default:
              return undefined;
          }
        };
        InlineArray2.prototype.set = function(index, value) {
          switch (index) {
            case 0:
              this._v0 = value;
              break;
            case 1:
              this._v1 = value;
              break;
          }
        };
        return InlineArray2;
      }());
      $__export("InlineArray2", InlineArray2);
      InlineArray4 = (function() {
        function InlineArray4(length, _v0, _v1, _v2, _v3) {
          this.length = length;
          this._v0 = _v0;
          this._v1 = _v1;
          this._v2 = _v2;
          this._v3 = _v3;
        }
        InlineArray4.prototype.get = function(index) {
          switch (index) {
            case 0:
              return this._v0;
            case 1:
              return this._v1;
            case 2:
              return this._v2;
            case 3:
              return this._v3;
            default:
              return undefined;
          }
        };
        InlineArray4.prototype.set = function(index, value) {
          switch (index) {
            case 0:
              this._v0 = value;
              break;
            case 1:
              this._v1 = value;
              break;
            case 2:
              this._v2 = value;
              break;
            case 3:
              this._v3 = value;
              break;
          }
        };
        return InlineArray4;
      }());
      $__export("InlineArray4", InlineArray4);
      InlineArray8 = (function() {
        function InlineArray8(length, _v0, _v1, _v2, _v3, _v4, _v5, _v6, _v7) {
          this.length = length;
          this._v0 = _v0;
          this._v1 = _v1;
          this._v2 = _v2;
          this._v3 = _v3;
          this._v4 = _v4;
          this._v5 = _v5;
          this._v6 = _v6;
          this._v7 = _v7;
        }
        InlineArray8.prototype.get = function(index) {
          switch (index) {
            case 0:
              return this._v0;
            case 1:
              return this._v1;
            case 2:
              return this._v2;
            case 3:
              return this._v3;
            case 4:
              return this._v4;
            case 5:
              return this._v5;
            case 6:
              return this._v6;
            case 7:
              return this._v7;
            default:
              return undefined;
          }
        };
        InlineArray8.prototype.set = function(index, value) {
          switch (index) {
            case 0:
              this._v0 = value;
              break;
            case 1:
              this._v1 = value;
              break;
            case 2:
              this._v2 = value;
              break;
            case 3:
              this._v3 = value;
              break;
            case 4:
              this._v4 = value;
              break;
            case 5:
              this._v5 = value;
              break;
            case 6:
              this._v6 = value;
              break;
            case 7:
              this._v7 = value;
              break;
          }
        };
        return InlineArray8;
      }());
      $__export("InlineArray8", InlineArray8);
      InlineArray16 = (function() {
        function InlineArray16(length, _v0, _v1, _v2, _v3, _v4, _v5, _v6, _v7, _v8, _v9, _v10, _v11, _v12, _v13, _v14, _v15) {
          this.length = length;
          this._v0 = _v0;
          this._v1 = _v1;
          this._v2 = _v2;
          this._v3 = _v3;
          this._v4 = _v4;
          this._v5 = _v5;
          this._v6 = _v6;
          this._v7 = _v7;
          this._v8 = _v8;
          this._v9 = _v9;
          this._v10 = _v10;
          this._v11 = _v11;
          this._v12 = _v12;
          this._v13 = _v13;
          this._v14 = _v14;
          this._v15 = _v15;
        }
        InlineArray16.prototype.get = function(index) {
          switch (index) {
            case 0:
              return this._v0;
            case 1:
              return this._v1;
            case 2:
              return this._v2;
            case 3:
              return this._v3;
            case 4:
              return this._v4;
            case 5:
              return this._v5;
            case 6:
              return this._v6;
            case 7:
              return this._v7;
            case 8:
              return this._v8;
            case 9:
              return this._v9;
            case 10:
              return this._v10;
            case 11:
              return this._v11;
            case 12:
              return this._v12;
            case 13:
              return this._v13;
            case 14:
              return this._v14;
            case 15:
              return this._v15;
            default:
              return undefined;
          }
        };
        InlineArray16.prototype.set = function(index, value) {
          switch (index) {
            case 0:
              this._v0 = value;
              break;
            case 1:
              this._v1 = value;
              break;
            case 2:
              this._v2 = value;
              break;
            case 3:
              this._v3 = value;
              break;
            case 4:
              this._v4 = value;
              break;
            case 5:
              this._v5 = value;
              break;
            case 6:
              this._v6 = value;
              break;
            case 7:
              this._v7 = value;
              break;
            case 8:
              this._v8 = value;
              break;
            case 9:
              this._v9 = value;
              break;
            case 10:
              this._v10 = value;
              break;
            case 11:
              this._v11 = value;
              break;
            case 12:
              this._v12 = value;
              break;
            case 13:
              this._v13 = value;
              break;
            case 14:
              this._v14 = value;
              break;
            case 15:
              this._v15 = value;
              break;
          }
        };
        return InlineArray16;
      }());
      $__export("InlineArray16", InlineArray16);
      InlineArrayDynamic = (function() {
        function InlineArrayDynamic(length) {
          var values = [];
          for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
          }
          this.length = length;
          this._values = values;
        }
        InlineArrayDynamic.prototype.get = function(index) {
          return this._values[index];
        };
        InlineArrayDynamic.prototype.set = function(index, value) {
          this._values[index] = value;
        };
        return InlineArrayDynamic;
      }());
      $__export("InlineArrayDynamic", InlineArrayDynamic);
      EMPTY_INLINE_ARRAY = new InlineArray0();
      $__export("EMPTY_INLINE_ARRAY", EMPTY_INLINE_ARRAY);
    }
  };
});

System.register("@angular/core/src/metadata/lifecycle_hooks.js", [], function($__export) {
  "use strict";
  var LifecycleHooks,
      LIFECYCLE_HOOKS_VALUES,
      OnChanges,
      OnInit,
      DoCheck,
      OnDestroy,
      AfterContentInit,
      AfterContentChecked,
      AfterViewInit,
      AfterViewChecked;
  return {
    setters: [],
    execute: function() {
      LifecycleHooks = {};
      $__export("LifecycleHooks", LifecycleHooks);
      LifecycleHooks.OnInit = 0;
      LifecycleHooks.OnDestroy = 1;
      LifecycleHooks.DoCheck = 2;
      LifecycleHooks.OnChanges = 3;
      LifecycleHooks.AfterContentInit = 4;
      LifecycleHooks.AfterContentChecked = 5;
      LifecycleHooks.AfterViewInit = 6;
      LifecycleHooks.AfterViewChecked = 7;
      LifecycleHooks[LifecycleHooks.OnInit] = "OnInit";
      LifecycleHooks[LifecycleHooks.OnDestroy] = "OnDestroy";
      LifecycleHooks[LifecycleHooks.DoCheck] = "DoCheck";
      LifecycleHooks[LifecycleHooks.OnChanges] = "OnChanges";
      LifecycleHooks[LifecycleHooks.AfterContentInit] = "AfterContentInit";
      LifecycleHooks[LifecycleHooks.AfterContentChecked] = "AfterContentChecked";
      LifecycleHooks[LifecycleHooks.AfterViewInit] = "AfterViewInit";
      LifecycleHooks[LifecycleHooks.AfterViewChecked] = "AfterViewChecked";
      LIFECYCLE_HOOKS_VALUES = [LifecycleHooks.OnInit, LifecycleHooks.OnDestroy, LifecycleHooks.DoCheck, LifecycleHooks.OnChanges, LifecycleHooks.AfterContentInit, LifecycleHooks.AfterContentChecked, LifecycleHooks.AfterViewInit, LifecycleHooks.AfterViewChecked];
      $__export("LIFECYCLE_HOOKS_VALUES", LIFECYCLE_HOOKS_VALUES);
      OnChanges = (function() {
        function OnChanges() {}
        OnChanges.prototype.ngOnChanges = function(changes) {};
        return OnChanges;
      }());
      $__export("OnChanges", OnChanges);
      OnInit = (function() {
        function OnInit() {}
        OnInit.prototype.ngOnInit = function() {};
        return OnInit;
      }());
      $__export("OnInit", OnInit);
      DoCheck = (function() {
        function DoCheck() {}
        DoCheck.prototype.ngDoCheck = function() {};
        return DoCheck;
      }());
      $__export("DoCheck", DoCheck);
      OnDestroy = (function() {
        function OnDestroy() {}
        OnDestroy.prototype.ngOnDestroy = function() {};
        return OnDestroy;
      }());
      $__export("OnDestroy", OnDestroy);
      AfterContentInit = (function() {
        function AfterContentInit() {}
        AfterContentInit.prototype.ngAfterContentInit = function() {};
        return AfterContentInit;
      }());
      $__export("AfterContentInit", AfterContentInit);
      AfterContentChecked = (function() {
        function AfterContentChecked() {}
        AfterContentChecked.prototype.ngAfterContentChecked = function() {};
        return AfterContentChecked;
      }());
      $__export("AfterContentChecked", AfterContentChecked);
      AfterViewInit = (function() {
        function AfterViewInit() {}
        AfterViewInit.prototype.ngAfterViewInit = function() {};
        return AfterViewInit;
      }());
      $__export("AfterViewInit", AfterViewInit);
      AfterViewChecked = (function() {
        function AfterViewChecked() {}
        AfterViewChecked.prototype.ngAfterViewChecked = function() {};
        return AfterViewChecked;
      }());
      $__export("AfterViewChecked", AfterViewChecked);
    }
  };
});

System.register("@angular/core/src/metadata/view.js", [], function($__export) {
  "use strict";
  var ViewEncapsulation,
      ViewMetadata;
  function ViewMetadata_tsickle_Closure_declarations() {
    ViewMetadata.prototype.templateUrl;
    ViewMetadata.prototype.template;
    ViewMetadata.prototype.styleUrls;
    ViewMetadata.prototype.styles;
    ViewMetadata.prototype.encapsulation;
    ViewMetadata.prototype.animations;
    ViewMetadata.prototype.interpolation;
  }
  return {
    setters: [],
    execute: function() {
      ViewEncapsulation = {};
      $__export("ViewEncapsulation", ViewEncapsulation);
      ViewEncapsulation.Emulated = 0;
      ViewEncapsulation.Native = 1;
      ViewEncapsulation.None = 2;
      ViewEncapsulation[ViewEncapsulation.Emulated] = "Emulated";
      ViewEncapsulation[ViewEncapsulation.Native] = "Native";
      ViewEncapsulation[ViewEncapsulation.None] = "None";
      ViewMetadata = (function() {
        function ViewMetadata(_a) {
          var _b = _a === void 0 ? {} : _a,
              templateUrl = _b.templateUrl,
              template = _b.template,
              encapsulation = _b.encapsulation,
              styles = _b.styles,
              styleUrls = _b.styleUrls,
              animations = _b.animations,
              interpolation = _b.interpolation;
          this.templateUrl = templateUrl;
          this.template = template;
          this.styleUrls = styleUrls;
          this.styles = styles;
          this.encapsulation = encapsulation;
          this.animations = animations;
          this.interpolation = interpolation;
        }
        return ViewMetadata;
      }());
      $__export("ViewMetadata", ViewMetadata);
    }
  };
});

System.register("@angular/core/src/reflection/reflector.js", ["./reflector_reader"], function($__export) {
  "use strict";
  var __extends,
      ReflectorReader,
      Reflector;
  function Reflector_tsickle_Closure_declarations() {
    Reflector.prototype.reflectionCapabilities;
  }
  return {
    setters: [function($__m) {
      ReflectorReader = $__m.ReflectorReader;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      Reflector = (function(_super) {
        __extends(Reflector, _super);
        function Reflector(reflectionCapabilities) {
          _super.call(this);
          this.reflectionCapabilities = reflectionCapabilities;
        }
        Reflector.prototype.updateCapabilities = function(caps) {
          this.reflectionCapabilities = caps;
        };
        Reflector.prototype.factory = function(type) {
          return this.reflectionCapabilities.factory(type);
        };
        Reflector.prototype.parameters = function(typeOrFunc) {
          return this.reflectionCapabilities.parameters(typeOrFunc);
        };
        Reflector.prototype.annotations = function(typeOrFunc) {
          return this.reflectionCapabilities.annotations(typeOrFunc);
        };
        Reflector.prototype.propMetadata = function(typeOrFunc) {
          return this.reflectionCapabilities.propMetadata(typeOrFunc);
        };
        Reflector.prototype.hasLifecycleHook = function(type, lcProperty) {
          return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
        };
        Reflector.prototype.getter = function(name) {
          return this.reflectionCapabilities.getter(name);
        };
        Reflector.prototype.setter = function(name) {
          return this.reflectionCapabilities.setter(name);
        };
        Reflector.prototype.method = function(name) {
          return this.reflectionCapabilities.method(name);
        };
        Reflector.prototype.importUri = function(type) {
          return this.reflectionCapabilities.importUri(type);
        };
        Reflector.prototype.resolveIdentifier = function(name, moduleUrl, runtime) {
          return this.reflectionCapabilities.resolveIdentifier(name, moduleUrl, runtime);
        };
        Reflector.prototype.resolveEnum = function(identifier, name) {
          return this.reflectionCapabilities.resolveEnum(identifier, name);
        };
        return Reflector;
      }(ReflectorReader));
      $__export("Reflector", Reflector);
    }
  };
});

System.register("@angular/core/src/reflection/reflection.js", ["./reflection_capabilities", "./reflector"], function($__export) {
  "use strict";
  var ReflectionCapabilities,
      Reflector,
      reflector;
  return {
    setters: [function($__m) {
      ReflectionCapabilities = $__m.ReflectionCapabilities;
    }, function($__m) {
      Reflector = $__m.Reflector;
      $__export({Reflector: $__m.Reflector});
    }],
    execute: function() {
      reflector = new Reflector(new ReflectionCapabilities());
      $__export("reflector", reflector);
    }
  };
});

System.register("@angular/core/src/type.js", [], function($__export) {
  "use strict";
  var Type;
  return {
    setters: [],
    execute: function() {
      Type = Function;
      $__export("Type", Type);
    }
  };
});

System.register("@angular/core/src/reflection/reflection_capabilities.js", ["../facade/lang", "../type"], function($__export) {
  "use strict";
  var global,
      isPresent,
      stringify,
      Type,
      DELEGATE_CTOR,
      ReflectionCapabilities;
  function ReflectionCapabilities_tsickle_Closure_declarations() {
    ReflectionCapabilities.prototype._reflect;
  }
  function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
    if (!decoratorInvocations) {
      return [];
    }
    return decoratorInvocations.map(function(decoratorInvocation) {
      var decoratorType = decoratorInvocation.type;
      var annotationCls = decoratorType.annotationCls;
      var annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
      return new (annotationCls.bind.apply(annotationCls, [void 0].concat(annotationArgs)))();
    });
  }
  return {
    setters: [function($__m) {
      global = $__m.global;
      isPresent = $__m.isPresent;
      stringify = $__m.stringify;
    }, function($__m) {
      Type = $__m.Type;
    }],
    execute: function() {
      DELEGATE_CTOR = /^function\s+\S+\(\)\s*{\s*("use strict";)?\s*(return\s+)?\S+\.apply\(this,\s*arguments\)/;
      $__export("DELEGATE_CTOR", DELEGATE_CTOR);
      ReflectionCapabilities = (function() {
        function ReflectionCapabilities(reflect) {
          this._reflect = reflect || global.Reflect;
        }
        ReflectionCapabilities.prototype.isReflectionEnabled = function() {
          return true;
        };
        ReflectionCapabilities.prototype.factory = function(t) {
          return function() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i - 0] = arguments[_i];
            }
            return new (t.bind.apply(t, [void 0].concat(args)))();
          };
        };
        ReflectionCapabilities.prototype._zipTypesAndAnnotations = function(paramTypes, paramAnnotations) {
          var result;
          if (typeof paramTypes === 'undefined') {
            result = new Array(paramAnnotations.length);
          } else {
            result = new Array(paramTypes.length);
          }
          for (var i = 0; i < result.length; i++) {
            if (typeof paramTypes === 'undefined') {
              result[i] = [];
            } else if (paramTypes[i] != Object) {
              result[i] = [paramTypes[i]];
            } else {
              result[i] = [];
            }
            if (paramAnnotations && isPresent(paramAnnotations[i])) {
              result[i] = result[i].concat(paramAnnotations[i]);
            }
          }
          return result;
        };
        ReflectionCapabilities.prototype._ownParameters = function(type, parentCtor) {
          if (DELEGATE_CTOR.exec(type.toString())) {
            return null;
          }
          if (((type)).parameters && ((type)).parameters !== parentCtor.parameters) {
            return ((type)).parameters;
          }
          var tsickleCtorParams = ((type)).ctorParameters;
          if (tsickleCtorParams && tsickleCtorParams !== parentCtor.ctorParameters) {
            var ctorParameters = typeof tsickleCtorParams === 'function' ? tsickleCtorParams() : tsickleCtorParams;
            var paramTypes = ctorParameters.map(function(ctorParam) {
              return ctorParam && ctorParam.type;
            });
            var paramAnnotations = ctorParameters.map(function(ctorParam) {
              return ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators);
            });
            return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
          }
          if (isPresent(this._reflect) && isPresent(this._reflect.getOwnMetadata)) {
            var paramAnnotations = this._reflect.getOwnMetadata('parameters', type);
            var paramTypes = this._reflect.getOwnMetadata('design:paramtypes', type);
            if (paramTypes || paramAnnotations) {
              return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
            }
          }
          return new Array(((type.length))).fill(undefined);
        };
        ReflectionCapabilities.prototype.parameters = function(type) {
          var parentCtor = Object.getPrototypeOf(type.prototype).constructor;
          var parameters = this._ownParameters(type, parentCtor);
          if (!parameters && parentCtor !== Object) {
            parameters = this.parameters(parentCtor);
          }
          return parameters || [];
        };
        ReflectionCapabilities.prototype._ownAnnotations = function(typeOrFunc, parentCtor) {
          if (((typeOrFunc)).annotations && ((typeOrFunc)).annotations !== parentCtor.annotations) {
            var annotations = ((typeOrFunc)).annotations;
            if (typeof annotations === 'function' && annotations.annotations) {
              annotations = annotations.annotations;
            }
            return annotations;
          }
          if (((typeOrFunc)).decorators && ((typeOrFunc)).decorators !== parentCtor.decorators) {
            return convertTsickleDecoratorIntoMetadata(((typeOrFunc)).decorators);
          }
          if (this._reflect && this._reflect.getOwnMetadata) {
            return this._reflect.getOwnMetadata('annotations', typeOrFunc);
          }
        };
        ReflectionCapabilities.prototype.annotations = function(typeOrFunc) {
          var parentCtor = Object.getPrototypeOf(typeOrFunc.prototype).constructor;
          var ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
          var parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];
          return parentAnnotations.concat(ownAnnotations);
        };
        ReflectionCapabilities.prototype._ownPropMetadata = function(typeOrFunc, parentCtor) {
          if (((typeOrFunc)).propMetadata && ((typeOrFunc)).propMetadata !== parentCtor.propMetadata) {
            var propMetadata = ((typeOrFunc)).propMetadata;
            if (typeof propMetadata === 'function' && propMetadata.propMetadata) {
              propMetadata = propMetadata.propMetadata;
            }
            return propMetadata;
          }
          if (((typeOrFunc)).propDecorators && ((typeOrFunc)).propDecorators !== parentCtor.propDecorators) {
            var propDecorators_1 = ((typeOrFunc)).propDecorators;
            var propMetadata_1 = ({});
            Object.keys(propDecorators_1).forEach(function(prop) {
              propMetadata_1[prop] = convertTsickleDecoratorIntoMetadata(propDecorators_1[prop]);
            });
            return propMetadata_1;
          }
          if (this._reflect && this._reflect.getOwnMetadata) {
            return this._reflect.getOwnMetadata('propMetadata', typeOrFunc);
          }
        };
        ReflectionCapabilities.prototype.propMetadata = function(typeOrFunc) {
          var parentCtor = Object.getPrototypeOf(typeOrFunc.prototype).constructor;
          var propMetadata = {};
          if (parentCtor !== Object) {
            var parentPropMetadata_1 = this.propMetadata(parentCtor);
            Object.keys(parentPropMetadata_1).forEach(function(propName) {
              propMetadata[propName] = parentPropMetadata_1[propName];
            });
          }
          var ownPropMetadata = this._ownPropMetadata(typeOrFunc, parentCtor);
          if (ownPropMetadata) {
            Object.keys(ownPropMetadata).forEach(function(propName) {
              var decorators = [];
              if (propMetadata.hasOwnProperty(propName)) {
                decorators.push.apply(decorators, propMetadata[propName]);
              }
              decorators.push.apply(decorators, ownPropMetadata[propName]);
              propMetadata[propName] = decorators;
            });
          }
          return propMetadata;
        };
        ReflectionCapabilities.prototype.hasLifecycleHook = function(type, lcProperty) {
          return type instanceof Type && lcProperty in type.prototype;
        };
        ReflectionCapabilities.prototype.getter = function(name) {
          return ((new Function('o', 'return o.' + name + ';')));
        };
        ReflectionCapabilities.prototype.setter = function(name) {
          return ((new Function('o', 'v', 'return o.' + name + ' = v;')));
        };
        ReflectionCapabilities.prototype.method = function(name) {
          var functionBody = "if (!o." + name + ") throw new Error('\"" + name + "\" is undefined');\n        return o." + name + ".apply(o, args);";
          return ((new Function('o', 'args', functionBody)));
        };
        ReflectionCapabilities.prototype.importUri = function(type) {
          if ((typeof type === 'undefined' ? 'undefined' : $traceurRuntime.typeof(type)) === 'object' && type['filePath']) {
            return type['filePath'];
          }
          return "./" + stringify(type);
        };
        ReflectionCapabilities.prototype.resolveIdentifier = function(name, moduleUrl, runtime) {
          return runtime;
        };
        ReflectionCapabilities.prototype.resolveEnum = function(enumIdentifier, name) {
          return enumIdentifier[name];
        };
        return ReflectionCapabilities;
      }());
      $__export("ReflectionCapabilities", ReflectionCapabilities);
    }
  };
});

System.register("@angular/core/src/reflection/reflector_reader.js", [], function($__export) {
  "use strict";
  var ReflectorReader;
  return {
    setters: [],
    execute: function() {
      ReflectorReader = (function() {
        function ReflectorReader() {}
        ReflectorReader.prototype.parameters = function(typeOrFunc) {};
        ReflectorReader.prototype.annotations = function(typeOrFunc) {};
        ReflectorReader.prototype.propMetadata = function(typeOrFunc) {};
        ReflectorReader.prototype.importUri = function(typeOrFunc) {};
        ReflectorReader.prototype.resolveIdentifier = function(name, moduleUrl, runtime) {};
        ReflectorReader.prototype.resolveEnum = function(identifier, name) {};
        return ReflectorReader;
      }());
      $__export("ReflectorReader", ReflectorReader);
    }
  };
});

System.register("@angular/core/src/facade/errors.js", [], function($__export) {
  "use strict";
  var __extends,
      BaseError,
      WrappedError;
  function unimplemented() {
    throw new Error('unimplemented');
  }
  function BaseError_tsickle_Closure_declarations() {
    BaseError.prototype._nativeError;
  }
  function WrappedError_tsickle_Closure_declarations() {
    WrappedError.prototype.originalError;
  }
  $__export("unimplemented", unimplemented);
  return {
    setters: [],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      BaseError = (function(_super) {
        __extends(BaseError, _super);
        function BaseError(message) {
          _super.call(this, message);
          var nativeError = new Error(message);
          this._nativeError = nativeError;
        }
        Object.defineProperty(BaseError.prototype, "message", {
          get: function() {
            return this._nativeError.message;
          },
          set: function(message) {
            this._nativeError.message = message;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(BaseError.prototype, "name", {
          get: function() {
            return this._nativeError.name;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(BaseError.prototype, "stack", {
          get: function() {
            return ((this._nativeError)).stack;
          },
          set: function(value) {
            ((this._nativeError)).stack = value;
          },
          enumerable: true,
          configurable: true
        });
        BaseError.prototype.toString = function() {
          return this._nativeError.toString();
        };
        return BaseError;
      }(Error));
      $__export("BaseError", BaseError);
      WrappedError = (function(_super) {
        __extends(WrappedError, _super);
        function WrappedError(message, error) {
          _super.call(this, message + " caused by: " + (error instanceof Error ? error.message : error));
          this.originalError = error;
        }
        Object.defineProperty(WrappedError.prototype, "stack", {
          get: function() {
            return (((this.originalError instanceof Error ? this.originalError : this._nativeError))).stack;
          },
          enumerable: true,
          configurable: true
        });
        return WrappedError;
      }(BaseError));
      $__export("WrappedError", WrappedError);
    }
  };
});

System.register("@angular/core/src/render/api.js", ["../facade/errors"], function($__export) {
  "use strict";
  var unimplemented,
      RenderComponentType,
      RenderDebugInfo,
      Renderer,
      RootRenderer;
  function RenderComponentType_tsickle_Closure_declarations() {
    RenderComponentType.prototype.id;
    RenderComponentType.prototype.templateUrl;
    RenderComponentType.prototype.slotCount;
    RenderComponentType.prototype.encapsulation;
    RenderComponentType.prototype.styles;
    RenderComponentType.prototype.animations;
  }
  return {
    setters: [function($__m) {
      unimplemented = $__m.unimplemented;
    }],
    execute: function() {
      RenderComponentType = (function() {
        function RenderComponentType(id, templateUrl, slotCount, encapsulation, styles, animations) {
          this.id = id;
          this.templateUrl = templateUrl;
          this.slotCount = slotCount;
          this.encapsulation = encapsulation;
          this.styles = styles;
          this.animations = animations;
        }
        return RenderComponentType;
      }());
      $__export("RenderComponentType", RenderComponentType);
      RenderDebugInfo = (function() {
        function RenderDebugInfo() {}
        Object.defineProperty(RenderDebugInfo.prototype, "injector", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "component", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "providerTokens", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "references", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "context", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "source", {
          get: function() {
            return unimplemented();
          },
          enumerable: true,
          configurable: true
        });
        return RenderDebugInfo;
      }());
      $__export("RenderDebugInfo", RenderDebugInfo);
      Renderer = (function() {
        function Renderer() {}
        Renderer.prototype.selectRootElement = function(selectorOrNode, debugInfo) {};
        Renderer.prototype.createElement = function(parentElement, name, debugInfo) {};
        Renderer.prototype.createViewRoot = function(hostElement) {};
        Renderer.prototype.createTemplateAnchor = function(parentElement, debugInfo) {};
        Renderer.prototype.createText = function(parentElement, value, debugInfo) {};
        Renderer.prototype.projectNodes = function(parentElement, nodes) {};
        Renderer.prototype.attachViewAfter = function(node, viewRootNodes) {};
        Renderer.prototype.detachView = function(viewRootNodes) {};
        Renderer.prototype.destroyView = function(hostElement, viewAllNodes) {};
        Renderer.prototype.listen = function(renderElement, name, callback) {};
        Renderer.prototype.listenGlobal = function(target, name, callback) {};
        Renderer.prototype.setElementProperty = function(renderElement, propertyName, propertyValue) {};
        Renderer.prototype.setElementAttribute = function(renderElement, attributeName, attributeValue) {};
        Renderer.prototype.setBindingDebugInfo = function(renderElement, propertyName, propertyValue) {};
        Renderer.prototype.setElementClass = function(renderElement, className, isAdd) {};
        Renderer.prototype.setElementStyle = function(renderElement, styleName, styleValue) {};
        Renderer.prototype.invokeElementMethod = function(renderElement, methodName, args) {};
        Renderer.prototype.setText = function(renderNode, text) {};
        Renderer.prototype.animate = function(element, startingStyles, keyframes, duration, delay, easing, previousPlayers) {};
        return Renderer;
      }());
      $__export("Renderer", Renderer);
      RootRenderer = (function() {
        function RootRenderer() {}
        RootRenderer.prototype.renderComponent = function(componentType) {};
        return RootRenderer;
      }());
      $__export("RootRenderer", RootRenderer);
    }
  };
});

System.register("@angular/core/src/util/decorators.js", ["../facade/lang"], function($__export) {
  "use strict";
  var global,
      stringify,
      _nextClassId,
      Reflect;
  function extractAnnotation(annotation) {
    if (typeof annotation === 'function' && annotation.hasOwnProperty('annotation')) {
      annotation = annotation.annotation;
    }
    return annotation;
  }
  function applyParams(fnOrArray, key) {
    if (fnOrArray === Object || fnOrArray === String || fnOrArray === Function || fnOrArray === Number || fnOrArray === Array) {
      throw new Error("Can not use native " + stringify(fnOrArray) + " as constructor");
    }
    if (typeof fnOrArray === 'function') {
      return fnOrArray;
    }
    if (Array.isArray(fnOrArray)) {
      var annotations = fnOrArray;
      var annoLength = annotations.length - 1;
      var fn = fnOrArray[annoLength];
      if (typeof fn !== 'function') {
        throw new Error("Last position of Class method array must be Function in key " + key + " was '" + stringify(fn) + "'");
      }
      if (annoLength != fn.length) {
        throw new Error("Number of annotations (" + annoLength + ") does not match number of arguments (" + fn.length + ") in the function: " + stringify(fn));
      }
      var paramsAnnotations = [];
      for (var i = 0,
          ii = annotations.length - 1; i < ii; i++) {
        var paramAnnotations = [];
        paramsAnnotations.push(paramAnnotations);
        var annotation = annotations[i];
        if (Array.isArray(annotation)) {
          for (var j = 0; j < annotation.length; j++) {
            paramAnnotations.push(extractAnnotation(annotation[j]));
          }
        } else if (typeof annotation === 'function') {
          paramAnnotations.push(extractAnnotation(annotation));
        } else {
          paramAnnotations.push(annotation);
        }
      }
      Reflect.defineMetadata('parameters', paramsAnnotations, fn);
      return fn;
    }
    throw new Error("Only Function or Array is supported in Class definition for key '" + key + "' is '" + stringify(fnOrArray) + "'");
  }
  function Class(clsDef) {
    var constructor = applyParams(clsDef.hasOwnProperty('constructor') ? clsDef.constructor : undefined, 'constructor');
    var proto = constructor.prototype;
    if (clsDef.hasOwnProperty('extends')) {
      if (typeof clsDef.extends === 'function') {
        ((constructor)).prototype = proto = Object.create(((clsDef.extends)).prototype);
      } else {
        throw new Error("Class definition 'extends' property must be a constructor function was: " + stringify(clsDef.extends));
      }
    }
    for (var key in clsDef) {
      if (key !== 'extends' && key !== 'prototype' && clsDef.hasOwnProperty(key)) {
        proto[key] = applyParams(clsDef[key], key);
      }
    }
    if (this && this.annotations instanceof Array) {
      Reflect.defineMetadata('annotations', this.annotations, constructor);
    }
    var constructorName = constructor['name'];
    if (!constructorName || constructorName === 'constructor') {
      ((constructor))['overriddenName'] = "class" + _nextClassId++;
    }
    return (constructor);
  }
  function makeDecorator(name, props, parentClass, chainFn) {
    if (chainFn === void 0) {
      chainFn = null;
    }
    var metaCtor = makeMetadataCtor([props]);
    function DecoratorFactory(objOrType) {
      if (!(Reflect && Reflect.getOwnMetadata)) {
        throw 'reflect-metadata shim is required when using class decorators';
      }
      if (this instanceof DecoratorFactory) {
        metaCtor.call(this, objOrType);
        return this;
      }
      var annotationInstance = new ((DecoratorFactory))(objOrType);
      var chainAnnotation = typeof this === 'function' && Array.isArray(this.annotations) ? this.annotations : [];
      chainAnnotation.push(annotationInstance);
      var TypeDecorator = (function TypeDecorator(cls) {
        var annotations = Reflect.getOwnMetadata('annotations', cls) || [];
        annotations.push(annotationInstance);
        Reflect.defineMetadata('annotations', annotations, cls);
        return cls;
      });
      TypeDecorator.annotations = chainAnnotation;
      TypeDecorator.Class = Class;
      if (chainFn)
        chainFn(TypeDecorator);
      return TypeDecorator;
    }
    if (parentClass) {
      DecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    DecoratorFactory.prototype.toString = function() {
      return ("@" + name);
    };
    ((DecoratorFactory)).annotationCls = DecoratorFactory;
    return DecoratorFactory;
  }
  function makeMetadataCtor(props) {
    return function ctor() {
      var _this = this;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
      }
      props.forEach(function(prop, i) {
        var argVal = args[i];
        if (Array.isArray(prop)) {
          _this[prop[0]] = argVal === undefined ? prop[1] : argVal;
        } else {
          for (var propName in prop) {
            _this[propName] = argVal && argVal.hasOwnProperty(propName) ? argVal[propName] : prop[propName];
          }
        }
      });
    };
  }
  function makeParamDecorator(name, props, parentClass) {
    var metaCtor = makeMetadataCtor(props);
    function ParamDecoratorFactory() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
      }
      if (this instanceof ParamDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }
      var annotationInstance = new ((_a = ((ParamDecoratorFactory))).bind.apply(_a, [void 0].concat(args)))();
      ((ParamDecorator)).annotation = annotationInstance;
      return ParamDecorator;
      function ParamDecorator(cls, unusedKey, index) {
        var parameters = Reflect.getOwnMetadata('parameters', cls) || [];
        while (parameters.length <= index) {
          parameters.push(null);
        }
        parameters[index] = parameters[index] || [];
        parameters[index].push(annotationInstance);
        Reflect.defineMetadata('parameters', parameters, cls);
        return cls;
      }
      var _a;
    }
    if (parentClass) {
      ParamDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    ParamDecoratorFactory.prototype.toString = function() {
      return ("@" + name);
    };
    ((ParamDecoratorFactory)).annotationCls = ParamDecoratorFactory;
    return ParamDecoratorFactory;
  }
  function makePropDecorator(name, props, parentClass) {
    var metaCtor = makeMetadataCtor(props);
    function PropDecoratorFactory() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
      }
      if (this instanceof PropDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }
      var decoratorInstance = new ((_a = ((PropDecoratorFactory))).bind.apply(_a, [void 0].concat(args)))();
      return function PropDecorator(target, name) {
        var meta = Reflect.getOwnMetadata('propMetadata', target.constructor) || {};
        meta[name] = meta.hasOwnProperty(name) && meta[name] || [];
        meta[name].unshift(decoratorInstance);
        Reflect.defineMetadata('propMetadata', meta, target.constructor);
      };
      var _a;
    }
    if (parentClass) {
      PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    PropDecoratorFactory.prototype.toString = function() {
      return ("@" + name);
    };
    ((PropDecoratorFactory)).annotationCls = PropDecoratorFactory;
    return PropDecoratorFactory;
  }
  $__export("Class", Class);
  $__export("makeDecorator", makeDecorator);
  $__export("makeParamDecorator", makeParamDecorator);
  $__export("makePropDecorator", makePropDecorator);
  return {
    setters: [function($__m) {
      global = $__m.global;
      stringify = $__m.stringify;
    }],
    execute: function() {
      _nextClassId = 0;
      Reflect = global.Reflect;
    }
  };
});

System.register("@angular/core/src/util/lang.js", [], function($__export) {
  "use strict";
  function isPromise(obj) {
    return !!obj && typeof obj.then === 'function';
  }
  $__export("isPromise", isPromise);
  return {
    setters: [],
    execute: function() {}
  };
});

System.register("@angular/core/src/core_private_export.js", ["./animation/animation_constants", "./animation/animation_group_player", "./animation/animation_keyframe", "./animation/animation_player", "./animation/animation_sequence_player", "./animation/animation_style_util", "./animation/animation_styles", "./animation/animation_transition", "./application_tokens", "./change_detection/change_detection_util", "./change_detection/constants", "./console", "./debug/debug_renderer", "./di/reflective_provider", "./linker/compiler", "./linker/component_factory", "./linker/component_factory_resolver", "./linker/debug_context", "./linker/ng_module_factory", "./linker/ng_module_factory_loader", "./linker/template_ref", "./linker/view", "./linker/view_container", "./linker/view_type", "./linker/view_utils", "./metadata/lifecycle_hooks", "./metadata/view", "./reflection/reflection", "./reflection/reflection_capabilities", "./reflection/reflector_reader", "./render/api", "./util/decorators", "./util/lang"], function($__export) {
  "use strict";
  var ANY_STATE_,
      DEFAULT_STATE_,
      EMPTY_STATE_,
      FILL_STYLE_FLAG_,
      AnimationGroupPlayer_,
      AnimationKeyframe_,
      AnimationPlayer_,
      NoOpAnimationPlayer_,
      AnimationSequencePlayer_,
      animationUtils,
      AnimationStyles_,
      AnimationTransition,
      application_tokens,
      change_detection_util,
      constants,
      console,
      debug,
      reflective_provider,
      ComponentStillLoadingError,
      component_factory,
      component_factory_resolver,
      debug_context,
      ng_module_factory,
      ng_module_factory_loader,
      template_ref,
      view,
      view_container,
      view_type,
      view_utils,
      lifecycle_hooks,
      metadata_view,
      reflection,
      reflection_capabilities,
      reflector_reader,
      api,
      decorators,
      isPromise,
      __core_private__;
  return {
    setters: [function($__m) {
      ANY_STATE_ = $__m.ANY_STATE;
      DEFAULT_STATE_ = $__m.DEFAULT_STATE;
      EMPTY_STATE_ = $__m.EMPTY_STATE;
      FILL_STYLE_FLAG_ = $__m.FILL_STYLE_FLAG;
    }, function($__m) {
      AnimationGroupPlayer_ = $__m.AnimationGroupPlayer;
    }, function($__m) {
      AnimationKeyframe_ = $__m.AnimationKeyframe;
    }, function($__m) {
      AnimationPlayer_ = $__m.AnimationPlayer;
      NoOpAnimationPlayer_ = $__m.NoOpAnimationPlayer;
    }, function($__m) {
      AnimationSequencePlayer_ = $__m.AnimationSequencePlayer;
    }, function($__m) {
      animationUtils = $__m;
    }, function($__m) {
      AnimationStyles_ = $__m.AnimationStyles;
    }, function($__m) {
      AnimationTransition = $__m.AnimationTransition;
    }, function($__m) {
      application_tokens = $__m;
    }, function($__m) {
      change_detection_util = $__m;
    }, function($__m) {
      constants = $__m;
    }, function($__m) {
      console = $__m;
    }, function($__m) {
      debug = $__m;
    }, function($__m) {
      reflective_provider = $__m;
    }, function($__m) {
      ComponentStillLoadingError = $__m.ComponentStillLoadingError;
    }, function($__m) {
      component_factory = $__m;
    }, function($__m) {
      component_factory_resolver = $__m;
    }, function($__m) {
      debug_context = $__m;
    }, function($__m) {
      ng_module_factory = $__m;
    }, function($__m) {
      ng_module_factory_loader = $__m;
    }, function($__m) {
      template_ref = $__m;
    }, function($__m) {
      view = $__m;
    }, function($__m) {
      view_container = $__m;
    }, function($__m) {
      view_type = $__m;
    }, function($__m) {
      view_utils = $__m;
    }, function($__m) {
      lifecycle_hooks = $__m;
    }, function($__m) {
      metadata_view = $__m;
    }, function($__m) {
      reflection = $__m;
    }, function($__m) {
      reflection_capabilities = $__m;
    }, function($__m) {
      reflector_reader = $__m;
    }, function($__m) {
      api = $__m;
    }, function($__m) {
      decorators = $__m;
    }, function($__m) {
      isPromise = $__m.isPromise;
    }],
    execute: function() {
      __core_private__ = {
        isDefaultChangeDetectionStrategy: constants.isDefaultChangeDetectionStrategy,
        ChangeDetectorStatus: constants.ChangeDetectorStatus,
        constructDependencies: reflective_provider.constructDependencies,
        LifecycleHooks: lifecycle_hooks.LifecycleHooks,
        LIFECYCLE_HOOKS_VALUES: lifecycle_hooks.LIFECYCLE_HOOKS_VALUES,
        ReflectorReader: reflector_reader.ReflectorReader,
        CodegenComponentFactoryResolver: component_factory_resolver.CodegenComponentFactoryResolver,
        ComponentRef_: component_factory.ComponentRef_,
        ViewContainer: view_container.ViewContainer,
        AppView: view.AppView,
        DebugAppView: view.DebugAppView,
        NgModuleInjector: ng_module_factory.NgModuleInjector,
        registerModuleFactory: ng_module_factory_loader.registerModuleFactory,
        ViewType: view_type.ViewType,
        view_utils: view_utils,
        ViewMetadata: metadata_view.ViewMetadata,
        DebugContext: debug_context.DebugContext,
        StaticNodeDebugInfo: debug_context.StaticNodeDebugInfo,
        devModeEqual: change_detection_util.devModeEqual,
        UNINITIALIZED: change_detection_util.UNINITIALIZED,
        ValueUnwrapper: change_detection_util.ValueUnwrapper,
        RenderDebugInfo: api.RenderDebugInfo,
        TemplateRef_: template_ref.TemplateRef_,
        ReflectionCapabilities: reflection_capabilities.ReflectionCapabilities,
        makeDecorator: decorators.makeDecorator,
        DebugDomRootRenderer: debug.DebugDomRootRenderer,
        Console: console.Console,
        reflector: reflection.reflector,
        Reflector: reflection.Reflector,
        NoOpAnimationPlayer: NoOpAnimationPlayer_,
        AnimationPlayer: AnimationPlayer_,
        AnimationSequencePlayer: AnimationSequencePlayer_,
        AnimationGroupPlayer: AnimationGroupPlayer_,
        AnimationKeyframe: AnimationKeyframe_,
        prepareFinalAnimationStyles: animationUtils.prepareFinalAnimationStyles,
        balanceAnimationKeyframes: animationUtils.balanceAnimationKeyframes,
        flattenStyles: animationUtils.flattenStyles,
        clearStyles: animationUtils.clearStyles,
        renderStyles: animationUtils.renderStyles,
        collectAndResolveStyles: animationUtils.collectAndResolveStyles,
        APP_ID_RANDOM_PROVIDER: application_tokens.APP_ID_RANDOM_PROVIDER,
        AnimationStyles: AnimationStyles_,
        ANY_STATE: ANY_STATE_,
        DEFAULT_STATE: DEFAULT_STATE_,
        EMPTY_STATE: EMPTY_STATE_,
        FILL_STYLE_FLAG: FILL_STYLE_FLAG_,
        ComponentStillLoadingError: ComponentStillLoadingError,
        isPromise: isPromise,
        AnimationTransition: AnimationTransition
      };
      $__export("__core_private__", __core_private__);
    }
  };
});

System.register("@angular/core/src/animation/metadata.js", ["../facade/lang"], function($__export) {
  "use strict";
  var __extends,
      isPresent,
      AUTO_STYLE,
      AnimationEntryMetadata,
      AnimationStateMetadata,
      AnimationStateDeclarationMetadata,
      AnimationStateTransitionMetadata,
      AnimationMetadata,
      AnimationKeyframesSequenceMetadata,
      AnimationStyleMetadata,
      AnimationAnimateMetadata,
      AnimationWithStepsMetadata,
      AnimationSequenceMetadata,
      AnimationGroupMetadata;
  function AnimationEntryMetadata_tsickle_Closure_declarations() {
    AnimationEntryMetadata.prototype.name;
    AnimationEntryMetadata.prototype.definitions;
  }
  function AnimationStateDeclarationMetadata_tsickle_Closure_declarations() {
    AnimationStateDeclarationMetadata.prototype.stateNameExpr;
    AnimationStateDeclarationMetadata.prototype.styles;
  }
  function AnimationStateTransitionMetadata_tsickle_Closure_declarations() {
    AnimationStateTransitionMetadata.prototype.stateChangeExpr;
    AnimationStateTransitionMetadata.prototype.steps;
  }
  function AnimationKeyframesSequenceMetadata_tsickle_Closure_declarations() {
    AnimationKeyframesSequenceMetadata.prototype.steps;
  }
  function AnimationStyleMetadata_tsickle_Closure_declarations() {
    AnimationStyleMetadata.prototype.styles;
    AnimationStyleMetadata.prototype.offset;
  }
  function AnimationAnimateMetadata_tsickle_Closure_declarations() {
    AnimationAnimateMetadata.prototype.timings;
    AnimationAnimateMetadata.prototype.styles;
  }
  function AnimationSequenceMetadata_tsickle_Closure_declarations() {
    AnimationSequenceMetadata.prototype._steps;
  }
  function AnimationGroupMetadata_tsickle_Closure_declarations() {
    AnimationGroupMetadata.prototype._steps;
  }
  function animate(timing, styles) {
    if (styles === void 0) {
      styles = null;
    }
    var stylesEntry = styles;
    if (!isPresent(stylesEntry)) {
      var EMPTY_STYLE = {};
      stylesEntry = new AnimationStyleMetadata([EMPTY_STYLE], 1);
    }
    return new AnimationAnimateMetadata(timing, stylesEntry);
  }
  function group(steps) {
    return new AnimationGroupMetadata(steps);
  }
  function sequence(steps) {
    return new AnimationSequenceMetadata(steps);
  }
  function style(tokens) {
    var input;
    var offset = null;
    if (typeof tokens === 'string') {
      input = [(tokens)];
    } else {
      if (Array.isArray(tokens)) {
        input = (tokens);
      } else {
        input = [(tokens)];
      }
      input.forEach(function(entry) {
        var entryOffset = ((entry))['offset'];
        if (isPresent(entryOffset)) {
          offset = offset == null ? parseFloat(entryOffset) : offset;
        }
      });
    }
    return new AnimationStyleMetadata(input, offset);
  }
  function state(stateNameExpr, styles) {
    return new AnimationStateDeclarationMetadata(stateNameExpr, styles);
  }
  function keyframes(steps) {
    return new AnimationKeyframesSequenceMetadata(steps);
  }
  function transition(stateChangeExpr, steps) {
    var animationData = Array.isArray(steps) ? new AnimationSequenceMetadata(steps) : steps;
    return new AnimationStateTransitionMetadata(stateChangeExpr, animationData);
  }
  function trigger(name, animation) {
    return new AnimationEntryMetadata(name, animation);
  }
  $__export("animate", animate);
  $__export("group", group);
  $__export("sequence", sequence);
  $__export("style", style);
  $__export("state", state);
  $__export("keyframes", keyframes);
  $__export("transition", transition);
  $__export("trigger", trigger);
  return {
    setters: [function($__m) {
      isPresent = $__m.isPresent;
    }],
    execute: function() {
      __extends = (this && this.__extends) || function(d, b) {
        for (var p in b)
          if (b.hasOwnProperty(p))
            d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
      AUTO_STYLE = '*';
      $__export("AUTO_STYLE", AUTO_STYLE);
      AnimationEntryMetadata = (function() {
        function AnimationEntryMetadata(name, definitions) {
          this.name = name;
          this.definitions = definitions;
        }
        return AnimationEntryMetadata;
      }());
      $__export("AnimationEntryMetadata", AnimationEntryMetadata);
      AnimationStateMetadata = (function() {
        function AnimationStateMetadata() {}
        return AnimationStateMetadata;
      }());
      $__export("AnimationStateMetadata", AnimationStateMetadata);
      AnimationStateDeclarationMetadata = (function(_super) {
        __extends(AnimationStateDeclarationMetadata, _super);
        function AnimationStateDeclarationMetadata(stateNameExpr, styles) {
          _super.call(this);
          this.stateNameExpr = stateNameExpr;
          this.styles = styles;
        }
        return AnimationStateDeclarationMetadata;
      }(AnimationStateMetadata));
      $__export("AnimationStateDeclarationMetadata", AnimationStateDeclarationMetadata);
      AnimationStateTransitionMetadata = (function(_super) {
        __extends(AnimationStateTransitionMetadata, _super);
        function AnimationStateTransitionMetadata(stateChangeExpr, steps) {
          _super.call(this);
          this.stateChangeExpr = stateChangeExpr;
          this.steps = steps;
        }
        return AnimationStateTransitionMetadata;
      }(AnimationStateMetadata));
      $__export("AnimationStateTransitionMetadata", AnimationStateTransitionMetadata);
      AnimationMetadata = (function() {
        function AnimationMetadata() {}
        return AnimationMetadata;
      }());
      $__export("AnimationMetadata", AnimationMetadata);
      AnimationKeyframesSequenceMetadata = (function(_super) {
        __extends(AnimationKeyframesSequenceMetadata, _super);
        function AnimationKeyframesSequenceMetadata(steps) {
          _super.call(this);
          this.steps = steps;
        }
        return AnimationKeyframesSequenceMetadata;
      }(AnimationMetadata));
      $__export("AnimationKeyframesSequenceMetadata", AnimationKeyframesSequenceMetadata);
      AnimationStyleMetadata = (function(_super) {
        __extends(AnimationStyleMetadata, _super);
        function AnimationStyleMetadata(styles, offset) {
          if (offset === void 0) {
            offset = null;
          }
          _super.call(this);
          this.styles = styles;
          this.offset = offset;
        }
        return AnimationStyleMetadata;
      }(AnimationMetadata));
      $__export("AnimationStyleMetadata", AnimationStyleMetadata);
      AnimationAnimateMetadata = (function(_super) {
        __extends(AnimationAnimateMetadata, _super);
        function AnimationAnimateMetadata(timings, styles) {
          _super.call(this);
          this.timings = timings;
          this.styles = styles;
        }
        return AnimationAnimateMetadata;
      }(AnimationMetadata));
      $__export("AnimationAnimateMetadata", AnimationAnimateMetadata);
      AnimationWithStepsMetadata = (function(_super) {
        __extends(AnimationWithStepsMetadata, _super);
        function AnimationWithStepsMetadata() {
          _super.call(this);
        }
        Object.defineProperty(AnimationWithStepsMetadata.prototype, "steps", {
          get: function() {
            throw new Error('NOT IMPLEMENTED: Base Class');
          },
          enumerable: true,
          configurable: true
        });
        return AnimationWithStepsMetadata;
      }(AnimationMetadata));
      $__export("AnimationWithStepsMetadata", AnimationWithStepsMetadata);
      AnimationSequenceMetadata = (function(_super) {
        __extends(AnimationSequenceMetadata, _super);
        function AnimationSequenceMetadata(_steps) {
          _super.call(this);
          this._steps = _steps;
        }
        Object.defineProperty(AnimationSequenceMetadata.prototype, "steps", {
          get: function() {
            return this._steps;
          },
          enumerable: true,
          configurable: true
        });
        return AnimationSequenceMetadata;
      }(AnimationWithStepsMetadata));
      $__export("AnimationSequenceMetadata", AnimationSequenceMetadata);
      AnimationGroupMetadata = (function(_super) {
        __extends(AnimationGroupMetadata, _super);
        function AnimationGroupMetadata(_steps) {
          _super.call(this);
          this._steps = _steps;
        }
        Object.defineProperty(AnimationGroupMetadata.prototype, "steps", {
          get: function() {
            return this._steps;
          },
          enumerable: true,
          configurable: true
        });
        return AnimationGroupMetadata;
      }(AnimationWithStepsMetadata));
      $__export("AnimationGroupMetadata", AnimationGroupMetadata);
    }
  };
});

System.register("@angular/core/src/animation/animation_transition_event.js", [], function($__export) {
  "use strict";
  var AnimationTransitionEvent;
  function AnimationTransitionEvent_tsickle_Closure_declarations() {
    AnimationTransitionEvent.prototype.fromState;
    AnimationTransitionEvent.prototype.toState;
    AnimationTransitionEvent.prototype.totalTime;
    AnimationTransitionEvent.prototype.phaseName;
  }
  return {
    setters: [],
    execute: function() {
      AnimationTransitionEvent = (function() {
        function AnimationTransitionEvent(_a) {
          var fromState = _a.fromState,
              toState = _a.toState,
              totalTime = _a.totalTime,
              phaseName = _a.phaseName;
          this.fromState = fromState;
          this.toState = toState;
          this.totalTime = totalTime;
          this.phaseName = phaseName;
        }
        return AnimationTransitionEvent;
      }());
      $__export("AnimationTransitionEvent", AnimationTransitionEvent);
    }
  };
});

System.register("@angular/core/src/facade/lang.js", [], function($__export) {
  "use strict";
  var globalScope,
      _global,
      STRING_MAP_PROTO,
      NumberWrapper,
      _symbolIterator;
  function scheduleMicroTask(fn) {
    Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
  }
  function getTypeNameForDebugging(type) {
    return type['name'] || (typeof type === 'undefined' ? 'undefined' : $traceurRuntime.typeof(type));
  }
  function isPresent(obj) {
    return obj != null;
  }
  function isBlank(obj) {
    return obj == null;
  }
  function isStrictStringMap(obj) {
    return (typeof obj === 'undefined' ? 'undefined' : $traceurRuntime.typeof(obj)) === 'object' && obj !== null && Object.getPrototypeOf(obj) === STRING_MAP_PROTO;
  }
  function isDate(obj) {
    return obj instanceof Date && !isNaN(obj.valueOf());
  }
  function stringify(token) {
    if (typeof token === 'string') {
      return token;
    }
    if (token == null) {
      return '' + token;
    }
    if (token.overriddenName) {
      return "" + token.overriddenName;
    }
    if (token.name) {
      return "" + token.name;
    }
    var res = token.toString();
    var newLineIndex = res.indexOf('\n');
    return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
  }
  function looseIdentical(a, b) {
    return a === b || typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);
  }
  function isJsObject(o) {
    return o !== null && (typeof o === 'function' || (typeof o === 'undefined' ? 'undefined' : $traceurRuntime.typeof(o)) === 'object');
  }
  function print(obj) {
    console.log(obj);
  }
  function warn(obj) {
    console.warn(obj);
  }
  function setValueOnPath(global, path, value) {
    var parts = path.split('.');
    var obj = global;
    while (parts.length > 1) {
      var name_1 = parts.shift();
      if (obj.hasOwnProperty(name_1) && obj[name_1] != null) {
        obj = obj[name_1];
      } else {
        obj = obj[name_1] = {};
      }
    }
    if (obj === undefined || obj === null) {
      obj = {};
    }
    obj[parts.shift()] = value;
  }
  function getSymbolIterator() {
    if (!_symbolIterator) {
      if (((globalScope)).Symbol && Symbol.iterator) {
        _symbolIterator = Symbol.iterator;
      } else {
        var keys = Object.getOwnPropertyNames(Map.prototype);
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (key !== 'entries' && key !== 'size' && ((Map)).prototype[key] === Map.prototype['entries']) {
            _symbolIterator = key;
          }
        }
      }
    }
    return _symbolIterator;
  }
  function isPrimitive(obj) {
    return !isJsObject(obj);
  }
  function escapeRegExp(s) {
    return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }
  $__export("scheduleMicroTask", scheduleMicroTask);
  $__export("getTypeNameForDebugging", getTypeNameForDebugging);
  $__export("isPresent", isPresent);
  $__export("isBlank", isBlank);
  $__export("isStrictStringMap", isStrictStringMap);
  $__export("isDate", isDate);
  $__export("stringify", stringify);
  $__export("looseIdentical", looseIdentical);
  $__export("isJsObject", isJsObject);
  $__export("print", print);
  $__export("warn", warn);
  $__export("setValueOnPath", setValueOnPath);
  $__export("getSymbolIterator", getSymbolIterator);
  $__export("isPrimitive", isPrimitive);
  $__export("escapeRegExp", escapeRegExp);
  return {
    setters: [],
    execute: function() {
      if (typeof window === 'undefined') {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
          globalScope = (self);
        } else {
          globalScope = (global);
        }
      } else {
        globalScope = (window);
      }
      _global = globalScope;
      $__export("global", _global);
      _global.assert = function assert(condition) {};
      STRING_MAP_PROTO = Object.getPrototypeOf({});
      NumberWrapper = (function() {
        function NumberWrapper() {}
        NumberWrapper.parseIntAutoRadix = function(text) {
          var result = parseInt(text);
          if (isNaN(result)) {
            throw new Error('Invalid integer literal when parsing ' + text);
          }
          return result;
        };
        NumberWrapper.isNumeric = function(value) {
          return !isNaN(value - parseFloat(value));
        };
        return NumberWrapper;
      }());
      $__export("NumberWrapper", NumberWrapper);
      _symbolIterator = null;
    }
  };
});

System.register("@angular/core/src/animation/animation_player.js", ["../facade/lang"], function($__export) {
  "use strict";
  var scheduleMicroTask,
      AnimationPlayer,
      NoOpAnimationPlayer;
  function NoOpAnimationPlayer_tsickle_Closure_declarations() {
    NoOpAnimationPlayer.prototype._onDoneFns;
    NoOpAnimationPlayer.prototype._onStartFns;
    NoOpAnimationPlayer.prototype._started;
    NoOpAnimationPlayer.prototype.parentPlayer;
  }
  return {
    setters: [function($__m) {
      scheduleMicroTask = $__m.scheduleMicroTask;
    }],
    execute: function() {
      AnimationPlayer = (function() {
        function AnimationPlayer() {}
        AnimationPlayer.prototype.onDone = function(fn) {};
        AnimationPlayer.prototype.onStart = function(fn) {};
        AnimationPlayer.prototype.init = function() {};
        AnimationPlayer.prototype.hasStarted = function() {};
        AnimationPlayer.prototype.play = function() {};
        AnimationPlayer.prototype.pause = function() {};
        AnimationPlayer.prototype.restart = function() {};
        AnimationPlayer.prototype.finish = function() {};
        AnimationPlayer.prototype.destroy = function() {};
        AnimationPlayer.prototype.reset = function() {};
        AnimationPlayer.prototype.setPosition = function(p) {};
        AnimationPlayer.prototype.getPosition = function() {};
        Object.defineProperty(AnimationPlayer.prototype, "parentPlayer", {
          get: function() {
            throw new Error('NOT IMPLEMENTED: Base Class');
          },
          set: function(player) {
            throw new Error('NOT IMPLEMENTED: Base Class');
          },
          enumerable: true,
          configurable: true
        });
        return AnimationPlayer;
      }());
      $__export("AnimationPlayer", AnimationPlayer);
      NoOpAnimationPlayer = (function() {
        function NoOpAnimationPlayer() {
          var _this = this;
          this._onDoneFns = [];
          this._onStartFns = [];
          this._started = false;
          this.parentPlayer = null;
          scheduleMicroTask(function() {
            return _this._onFinish();
          });
        }
        NoOpAnimationPlayer.prototype._onFinish = function() {
          this._onDoneFns.forEach(function(fn) {
            return fn();
          });
          this._onDoneFns = [];
        };
        NoOpAnimationPlayer.prototype.onStart = function(fn) {
          this._onStartFns.push(fn);
        };
        NoOpAnimationPlayer.prototype.onDone = function(fn) {
          this._onDoneFns.push(fn);
        };
        NoOpAnimationPlayer.prototype.hasStarted = function() {
          return this._started;
        };
        NoOpAnimationPlayer.prototype.init = function() {};
        NoOpAnimationPlayer.prototype.play = function() {
          if (!this.hasStarted()) {
            this._onStartFns.forEach(function(fn) {
              return fn();
            });
            this._onStartFns = [];
          }
          this._started = true;
        };
        NoOpAnimationPlayer.prototype.pause = function() {};
        NoOpAnimationPlayer.prototype.restart = function() {};
        NoOpAnimationPlayer.prototype.finish = function() {
          this._onFinish();
        };
        NoOpAnimationPlayer.prototype.destroy = function() {};
        NoOpAnimationPlayer.prototype.reset = function() {};
        NoOpAnimationPlayer.prototype.setPosition = function(p) {};
        NoOpAnimationPlayer.prototype.getPosition = function() {
          return 0;
        };
        return NoOpAnimationPlayer;
      }());
      $__export("NoOpAnimationPlayer", NoOpAnimationPlayer);
    }
  };
});

System.register("@angular/core/src/security.js", [], function($__export) {
  "use strict";
  var SecurityContext,
      Sanitizer;
  return {
    setters: [],
    execute: function() {
      SecurityContext = {};
      $__export("SecurityContext", SecurityContext);
      SecurityContext.NONE = 0;
      SecurityContext.HTML = 1;
      SecurityContext.STYLE = 2;
      SecurityContext.SCRIPT = 3;
      SecurityContext.URL = 4;
      SecurityContext.RESOURCE_URL = 5;
      SecurityContext[SecurityContext.NONE] = "NONE";
      SecurityContext[SecurityContext.HTML] = "HTML";
      SecurityContext[SecurityContext.STYLE] = "STYLE";
      SecurityContext[SecurityContext.SCRIPT] = "SCRIPT";
      SecurityContext[SecurityContext.URL] = "URL";
      SecurityContext[SecurityContext.RESOURCE_URL] = "RESOURCE_URL";
      Sanitizer = (function() {
        function Sanitizer() {}
        Sanitizer.prototype.sanitize = function(context, value) {};
        return Sanitizer;
      }());
      $__export("Sanitizer", Sanitizer);
    }
  };
});

System.register("@angular/core/src/core.js", ["./metadata", "./version", "./util", "./di", "./application_ref", "./application_tokens", "./application_init", "./zone", "./render", "./linker", "./debug/debug_node", "./testability/testability", "./change_detection", "./platform_core_providers", "./i18n/tokens", "./application_module", "./profile/profile", "./type", "./facade/async", "./error_handler", "./core_private_export", "./animation/metadata", "./animation/animation_transition_event", "./animation/animation_player", "./security"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({
        ANALYZE_FOR_ENTRY_COMPONENTS: $__m.ANALYZE_FOR_ENTRY_COMPONENTS,
        Attribute: $__m.Attribute,
        ContentChild: $__m.ContentChild,
        ContentChildren: $__m.ContentChildren,
        Query: $__m.Query,
        ViewChild: $__m.ViewChild,
        ViewChildren: $__m.ViewChildren,
        Component: $__m.Component,
        Directive: $__m.Directive,
        HostBinding: $__m.HostBinding,
        HostListener: $__m.HostListener,
        Input: $__m.Input,
        Output: $__m.Output,
        Pipe: $__m.Pipe,
        AfterContentChecked: $__m.AfterContentChecked,
        AfterContentInit: $__m.AfterContentInit,
        AfterViewChecked: $__m.AfterViewChecked,
        AfterViewInit: $__m.AfterViewInit,
        DoCheck: $__m.DoCheck,
        OnChanges: $__m.OnChanges,
        OnDestroy: $__m.OnDestroy,
        OnInit: $__m.OnInit,
        CUSTOM_ELEMENTS_SCHEMA: $__m.CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA: $__m.NO_ERRORS_SCHEMA,
        NgModule: $__m.NgModule,
        ViewEncapsulation: $__m.ViewEncapsulation
      });
    }, function($__m) {
      $__export({
        Version: $__m.Version,
        VERSION: $__m.VERSION
      });
    }, function($__m) {
      $__export({Class: $__m.Class});
    }, function($__m) {
      $__export({
        forwardRef: $__m.forwardRef,
        resolveForwardRef: $__m.resolveForwardRef,
        Injector: $__m.Injector,
        ReflectiveInjector: $__m.ReflectiveInjector,
        ResolvedReflectiveFactory: $__m.ResolvedReflectiveFactory,
        ReflectiveKey: $__m.ReflectiveKey,
        OpaqueToken: $__m.OpaqueToken,
        Inject: $__m.Inject,
        Optional: $__m.Optional,
        Injectable: $__m.Injectable,
        Self: $__m.Self,
        SkipSelf: $__m.SkipSelf,
        Host: $__m.Host
      });
    }, function($__m) {
      $__export({
        createPlatform: $__m.createPlatform,
        assertPlatform: $__m.assertPlatform,
        destroyPlatform: $__m.destroyPlatform,
        getPlatform: $__m.getPlatform,
        PlatformRef: $__m.PlatformRef,
        ApplicationRef: $__m.ApplicationRef,
        enableProdMode: $__m.enableProdMode,
        isDevMode: $__m.isDevMode,
        createPlatformFactory: $__m.createPlatformFactory,
        NgProbeToken: $__m.NgProbeToken
      });
    }, function($__m) {
      $__export({
        APP_ID: $__m.APP_ID,
        PACKAGE_ROOT_URL: $__m.PACKAGE_ROOT_URL,
        PLATFORM_INITIALIZER: $__m.PLATFORM_INITIALIZER,
        APP_BOOTSTRAP_LISTENER: $__m.APP_BOOTSTRAP_LISTENER
      });
    }, function($__m) {
      $__export({
        APP_INITIALIZER: $__m.APP_INITIALIZER,
        ApplicationInitStatus: $__m.ApplicationInitStatus
      });
    }, function($__m) {
      $__export({NgZone: $__m.NgZone});
    }, function($__m) {
      $__export({
        RenderComponentType: $__m.RenderComponentType,
        Renderer: $__m.Renderer,
        RootRenderer: $__m.RootRenderer
      });
    }, function($__m) {
      $__export({
        COMPILER_OPTIONS: $__m.COMPILER_OPTIONS,
        Compiler: $__m.Compiler,
        CompilerFactory: $__m.CompilerFactory,
        ModuleWithComponentFactories: $__m.ModuleWithComponentFactories,
        ComponentFactory: $__m.ComponentFactory,
        ComponentRef: $__m.ComponentRef,
        ComponentFactoryResolver: $__m.ComponentFactoryResolver,
        ElementRef: $__m.ElementRef,
        NgModuleFactory: $__m.NgModuleFactory,
        NgModuleRef: $__m.NgModuleRef,
        NgModuleFactoryLoader: $__m.NgModuleFactoryLoader,
        getModuleFactory: $__m.getModuleFactory,
        QueryList: $__m.QueryList,
        SystemJsNgModuleLoader: $__m.SystemJsNgModuleLoader,
        SystemJsNgModuleLoaderConfig: $__m.SystemJsNgModuleLoaderConfig,
        TemplateRef: $__m.TemplateRef,
        ViewContainerRef: $__m.ViewContainerRef,
        EmbeddedViewRef: $__m.EmbeddedViewRef,
        ViewRef: $__m.ViewRef
      });
    }, function($__m) {
      $__export({
        DebugElement: $__m.DebugElement,
        DebugNode: $__m.DebugNode,
        asNativeElements: $__m.asNativeElements,
        getDebugNode: $__m.getDebugNode
      });
    }, function($__m) {
      $__export({
        Testability: $__m.Testability,
        TestabilityRegistry: $__m.TestabilityRegistry,
        setTestabilityGetter: $__m.setTestabilityGetter
      });
    }, function($__m) {
      $__export({
        ChangeDetectionStrategy: $__m.ChangeDetectionStrategy,
        ChangeDetectorRef: $__m.ChangeDetectorRef,
        CollectionChangeRecord: $__m.CollectionChangeRecord,
        DefaultIterableDiffer: $__m.DefaultIterableDiffer,
        IterableDiffers: $__m.IterableDiffers,
        KeyValueChangeRecord: $__m.KeyValueChangeRecord,
        KeyValueDiffers: $__m.KeyValueDiffers,
        SimpleChange: $__m.SimpleChange,
        WrappedValue: $__m.WrappedValue
      });
    }, function($__m) {
      $__export({platformCore: $__m.platformCore});
    }, function($__m) {
      $__export({
        TRANSLATIONS: $__m.TRANSLATIONS,
        TRANSLATIONS_FORMAT: $__m.TRANSLATIONS_FORMAT,
        LOCALE_ID: $__m.LOCALE_ID
      });
    }, function($__m) {
      $__export({ApplicationModule: $__m.ApplicationModule});
    }, function($__m) {
      $__export({
        wtfCreateScope: $__m.wtfCreateScope,
        wtfLeave: $__m.wtfLeave,
        wtfStartTimeRange: $__m.wtfStartTimeRange,
        wtfEndTimeRange: $__m.wtfEndTimeRange
      });
    }, function($__m) {
      $__export({Type: $__m.Type});
    }, function($__m) {
      $__export({EventEmitter: $__m.EventEmitter});
    }, function($__m) {
      $__export({ErrorHandler: $__m.ErrorHandler});
    }, function($__m) {
      $__export({__core_private__: $__m.__core_private__});
    }, function($__m) {
      $__export({
        AUTO_STYLE: $__m.AUTO_STYLE,
        AnimationEntryMetadata: $__m.AnimationEntryMetadata,
        AnimationStateMetadata: $__m.AnimationStateMetadata,
        AnimationStateDeclarationMetadata: $__m.AnimationStateDeclarationMetadata,
        AnimationStateTransitionMetadata: $__m.AnimationStateTransitionMetadata,
        AnimationMetadata: $__m.AnimationMetadata,
        AnimationKeyframesSequenceMetadata: $__m.AnimationKeyframesSequenceMetadata,
        AnimationStyleMetadata: $__m.AnimationStyleMetadata,
        AnimationAnimateMetadata: $__m.AnimationAnimateMetadata,
        AnimationWithStepsMetadata: $__m.AnimationWithStepsMetadata,
        AnimationSequenceMetadata: $__m.AnimationSequenceMetadata,
        AnimationGroupMetadata: $__m.AnimationGroupMetadata,
        animate: $__m.animate,
        group: $__m.group,
        sequence: $__m.sequence,
        style: $__m.style,
        state: $__m.state,
        keyframes: $__m.keyframes,
        transition: $__m.transition,
        trigger: $__m.trigger
      });
    }, function($__m) {
      $__export({AnimationTransitionEvent: $__m.AnimationTransitionEvent});
    }, function($__m) {
      $__export({AnimationPlayer: $__m.AnimationPlayer});
    }, function($__m) {
      $__export({
        Sanitizer: $__m.Sanitizer,
        SecurityContext: $__m.SecurityContext
      });
    }],
    execute: function() {}
  };
});

System.register("@angular/core/index.js", ["./src/core"], function($__export) {
  "use strict";
  return {
    setters: [function($__m) {
      $__export({
        createPlatform: $__m.createPlatform,
        assertPlatform: $__m.assertPlatform,
        destroyPlatform: $__m.destroyPlatform,
        getPlatform: $__m.getPlatform,
        PlatformRef: $__m.PlatformRef,
        ApplicationRef: $__m.ApplicationRef,
        enableProdMode: $__m.enableProdMode,
        isDevMode: $__m.isDevMode,
        createPlatformFactory: $__m.createPlatformFactory,
        NgProbeToken: $__m.NgProbeToken,
        APP_ID: $__m.APP_ID,
        PACKAGE_ROOT_URL: $__m.PACKAGE_ROOT_URL,
        PLATFORM_INITIALIZER: $__m.PLATFORM_INITIALIZER,
        APP_BOOTSTRAP_LISTENER: $__m.APP_BOOTSTRAP_LISTENER,
        APP_INITIALIZER: $__m.APP_INITIALIZER,
        ApplicationInitStatus: $__m.ApplicationInitStatus,
        DebugElement: $__m.DebugElement,
        DebugNode: $__m.DebugNode,
        asNativeElements: $__m.asNativeElements,
        getDebugNode: $__m.getDebugNode,
        Testability: $__m.Testability,
        TestabilityRegistry: $__m.TestabilityRegistry,
        setTestabilityGetter: $__m.setTestabilityGetter,
        TRANSLATIONS: $__m.TRANSLATIONS,
        TRANSLATIONS_FORMAT: $__m.TRANSLATIONS_FORMAT,
        LOCALE_ID: $__m.LOCALE_ID,
        ApplicationModule: $__m.ApplicationModule,
        wtfCreateScope: $__m.wtfCreateScope,
        wtfLeave: $__m.wtfLeave,
        wtfStartTimeRange: $__m.wtfStartTimeRange,
        wtfEndTimeRange: $__m.wtfEndTimeRange,
        Type: $__m.Type,
        EventEmitter: $__m.EventEmitter,
        ErrorHandler: $__m.ErrorHandler,
        AnimationTransitionEvent: $__m.AnimationTransitionEvent,
        AnimationPlayer: $__m.AnimationPlayer,
        Sanitizer: $__m.Sanitizer,
        SecurityContext: $__m.SecurityContext,
        ANALYZE_FOR_ENTRY_COMPONENTS: $__m.ANALYZE_FOR_ENTRY_COMPONENTS,
        Attribute: $__m.Attribute,
        ContentChild: $__m.ContentChild,
        ContentChildren: $__m.ContentChildren,
        Query: $__m.Query,
        ViewChild: $__m.ViewChild,
        ViewChildren: $__m.ViewChildren,
        Component: $__m.Component,
        Directive: $__m.Directive,
        HostBinding: $__m.HostBinding,
        HostListener: $__m.HostListener,
        Input: $__m.Input,
        Output: $__m.Output,
        Pipe: $__m.Pipe,
        AfterContentChecked: $__m.AfterContentChecked,
        AfterContentInit: $__m.AfterContentInit,
        AfterViewChecked: $__m.AfterViewChecked,
        AfterViewInit: $__m.AfterViewInit,
        DoCheck: $__m.DoCheck,
        OnChanges: $__m.OnChanges,
        OnDestroy: $__m.OnDestroy,
        OnInit: $__m.OnInit,
        CUSTOM_ELEMENTS_SCHEMA: $__m.CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA: $__m.NO_ERRORS_SCHEMA,
        NgModule: $__m.NgModule,
        ViewEncapsulation: $__m.ViewEncapsulation,
        Version: $__m.Version,
        VERSION: $__m.VERSION,
        Class: $__m.Class,
        forwardRef: $__m.forwardRef,
        resolveForwardRef: $__m.resolveForwardRef,
        Injector: $__m.Injector,
        ReflectiveInjector: $__m.ReflectiveInjector,
        ResolvedReflectiveFactory: $__m.ResolvedReflectiveFactory,
        ReflectiveKey: $__m.ReflectiveKey,
        OpaqueToken: $__m.OpaqueToken,
        Inject: $__m.Inject,
        Optional: $__m.Optional,
        Injectable: $__m.Injectable,
        Self: $__m.Self,
        SkipSelf: $__m.SkipSelf,
        Host: $__m.Host,
        NgZone: $__m.NgZone,
        RenderComponentType: $__m.RenderComponentType,
        Renderer: $__m.Renderer,
        RootRenderer: $__m.RootRenderer,
        COMPILER_OPTIONS: $__m.COMPILER_OPTIONS,
        Compiler: $__m.Compiler,
        CompilerFactory: $__m.CompilerFactory,
        ModuleWithComponentFactories: $__m.ModuleWithComponentFactories,
        ComponentFactory: $__m.ComponentFactory,
        ComponentRef: $__m.ComponentRef,
        ComponentFactoryResolver: $__m.ComponentFactoryResolver,
        ElementRef: $__m.ElementRef,
        NgModuleFactory: $__m.NgModuleFactory,
        NgModuleRef: $__m.NgModuleRef,
        NgModuleFactoryLoader: $__m.NgModuleFactoryLoader,
        getModuleFactory: $__m.getModuleFactory,
        QueryList: $__m.QueryList,
        SystemJsNgModuleLoader: $__m.SystemJsNgModuleLoader,
        SystemJsNgModuleLoaderConfig: $__m.SystemJsNgModuleLoaderConfig,
        TemplateRef: $__m.TemplateRef,
        ViewContainerRef: $__m.ViewContainerRef,
        EmbeddedViewRef: $__m.EmbeddedViewRef,
        ViewRef: $__m.ViewRef,
        ChangeDetectionStrategy: $__m.ChangeDetectionStrategy,
        ChangeDetectorRef: $__m.ChangeDetectorRef,
        CollectionChangeRecord: $__m.CollectionChangeRecord,
        DefaultIterableDiffer: $__m.DefaultIterableDiffer,
        IterableDiffers: $__m.IterableDiffers,
        KeyValueChangeRecord: $__m.KeyValueChangeRecord,
        KeyValueDiffers: $__m.KeyValueDiffers,
        SimpleChange: $__m.SimpleChange,
        WrappedValue: $__m.WrappedValue,
        platformCore: $__m.platformCore,
        __core_private__: $__m.__core_private__,
        AUTO_STYLE: $__m.AUTO_STYLE,
        AnimationEntryMetadata: $__m.AnimationEntryMetadata,
        AnimationStateMetadata: $__m.AnimationStateMetadata,
        AnimationStateDeclarationMetadata: $__m.AnimationStateDeclarationMetadata,
        AnimationStateTransitionMetadata: $__m.AnimationStateTransitionMetadata,
        AnimationMetadata: $__m.AnimationMetadata,
        AnimationKeyframesSequenceMetadata: $__m.AnimationKeyframesSequenceMetadata,
        AnimationStyleMetadata: $__m.AnimationStyleMetadata,
        AnimationAnimateMetadata: $__m.AnimationAnimateMetadata,
        AnimationWithStepsMetadata: $__m.AnimationWithStepsMetadata,
        AnimationSequenceMetadata: $__m.AnimationSequenceMetadata,
        AnimationGroupMetadata: $__m.AnimationGroupMetadata,
        animate: $__m.animate,
        group: $__m.group,
        sequence: $__m.sequence,
        style: $__m.style,
        state: $__m.state,
        keyframes: $__m.keyframes,
        transition: $__m.transition,
        trigger: $__m.trigger
      });
    }],
    execute: function() {}
  };
});

System.registerDynamic("angular2-cookie/services/base-cookie-options.js", ["@angular/common", "@angular/core"], true, function ($__require, exports, module) {
    /**
     * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
     * @version v1.2.6
     * @link https://github.com/salemdar/angular2-cookie#readme
     * @license MIT
     */
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __extends = this && this.__extends || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = this && this.__metadata || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = this && this.__param || function (paramIndex, decorator) {
        return function (target, key) {
            decorator(target, key, paramIndex);
        };
    };
    var common_1 = $__require("@angular/common");
    var core_1 = $__require("@angular/core");
    /** @private */
    var CookieOptions = function () {
        function CookieOptions(_a) {
            var _b = _a === void 0 ? {} : _a,
                path = _b.path,
                domain = _b.domain,
                expires = _b.expires,
                secure = _b.secure;
            this.path = this.isPresent(path) ? path : null;
            this.domain = this.isPresent(domain) ? domain : null;
            this.expires = this.isPresent(expires) ? expires : null;
            this.secure = this.isPresent(secure) ? secure : false;
        }
        CookieOptions.prototype.merge = function (options) {
            return new CookieOptions({
                path: this.isPresent(options) && this.isPresent(options.path) ? options.path : this.path,
                domain: this.isPresent(options) && this.isPresent(options.domain) ? options.domain : this.domain,
                expires: this.isPresent(options) && this.isPresent(options.expires) ? options.expires : this.expires,
                secure: this.isPresent(options) && this.isPresent(options.secure) ? options.secure : this.secure
            });
        };
        CookieOptions.prototype.isPresent = function (obj) {
            return obj !== undefined && obj !== null;
        };
        return CookieOptions;
    }();
    exports.CookieOptions = CookieOptions;
    /** @private */
    var BaseCookieOptions = function (_super) {
        __extends(BaseCookieOptions, _super);
        function BaseCookieOptions(baseHref) {
            _super.call(this, { path: baseHref || '/' });
            this.baseHref = baseHref;
        }
        BaseCookieOptions = __decorate([core_1.Injectable(), __param(0, core_1.Optional()), __param(0, core_1.Inject(common_1.APP_BASE_HREF)), __metadata('design:paramtypes', [String])], BaseCookieOptions);
        return BaseCookieOptions;
    }(CookieOptions);
    exports.BaseCookieOptions = BaseCookieOptions;

    

    return module.exports;
});
System.registerDynamic("angular2-cookie/services/cookies.service.js", ["@angular/core", "./base-cookie-options"], true, function ($__require, exports, module) {
    /**
     * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
     * @version v1.2.6
     * @link https://github.com/salemdar/angular2-cookie#readme
     * @license MIT
     */
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = this && this.__metadata || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = this && this.__param || function (paramIndex, decorator) {
        return function (target, key) {
            decorator(target, key, paramIndex);
        };
    };
    var core_1 = $__require("@angular/core");
    var base_cookie_options_1 = $__require("./base-cookie-options");
    var CookieService = function () {
        function CookieService(_defaultOptions) {
            this._defaultOptions = _defaultOptions;
        }
        Object.defineProperty(CookieService.prototype, "cookieString", {
            get: function () {
                return document.cookie || '';
            },
            set: function (val) {
                document.cookie = val;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @name CookieService#get
         *
         * @description
         * Returns the value of given cookie key.
         *
         * @param {string} key Id to use for lookup.
         * @returns {string} Raw cookie value.
         */
        CookieService.prototype.get = function (key) {
            return this._cookieReader()[key];
        };
        /**
         * @name CookieService#getObject
         *
         * @description
         * Returns the deserialized value of given cookie key.
         *
         * @param {string} key Id to use for lookup.
         * @returns {Object} Deserialized cookie value.
         */
        CookieService.prototype.getObject = function (key) {
            var value = this.get(key);
            return value ? JSON.parse(value) : value;
        };
        /**
         * @name CookieService#getAll
         *
         * @description
         * Returns a key value object with all the cookies.
         *
         * @returns {Object} All cookies
         */
        CookieService.prototype.getAll = function () {
            return this._cookieReader();
        };
        /**
         * @name CookieService#put
         *
         * @description
         * Sets a value for given cookie key.
         *
         * @param {string} key Id for the `value`.
         * @param {string} value Raw value to be stored.
         * @param {CookieOptionsArgs} options (Optional) Options object.
         */
        CookieService.prototype.put = function (key, value, options) {
            this._cookieWriter()(key, value, options);
        };
        /**
         * @name CookieService#putObject
         *
         * @description
         * Serializes and sets a value for given cookie key.
         *
         * @param {string} key Id for the `value`.
         * @param {Object} value Value to be stored.
         * @param {CookieOptionsArgs} options (Optional) Options object.
         */
        CookieService.prototype.putObject = function (key, value, options) {
            this.put(key, JSON.stringify(value), options);
        };
        /**
         * @name CookieService#remove
         *
         * @description
         * Remove given cookie.
         *
         * @param {string} key Id of the key-value pair to delete.
         * @param {CookieOptionsArgs} options (Optional) Options object.
         */
        CookieService.prototype.remove = function (key, options) {
            this._cookieWriter()(key, undefined, options);
        };
        /**
         * @name CookieService#removeAll
         *
         * @description
         * Remove all cookies.
         */
        CookieService.prototype.removeAll = function () {
            var _this = this;
            var cookies = this.getAll();
            Object.keys(cookies).forEach(function (key) {
                _this.remove(key);
            });
        };
        CookieService.prototype._cookieReader = function () {
            var lastCookies = {};
            var lastCookieString = '';
            var that = this;
            var cookieArray, cookie, i, index, name;
            var currentCookieString = this.cookieString;
            if (currentCookieString !== lastCookieString) {
                lastCookieString = currentCookieString;
                cookieArray = lastCookieString.split('; ');
                lastCookies = {};
                for (i = 0; i < cookieArray.length; i++) {
                    cookie = cookieArray[i];
                    index = cookie.indexOf('=');
                    if (index > 0) {
                        name = that._safeDecodeURIComponent(cookie.substring(0, index));
                        // the first value that is seen for a cookie is the most
                        // specific one.  values for the same cookie name that
                        // follow are for less specific paths.
                        if (this.isBlank(lastCookies[name])) {
                            lastCookies[name] = that._safeDecodeURIComponent(cookie.substring(index + 1));
                        }
                    }
                }
            }
            return lastCookies;
        };
        CookieService.prototype._cookieWriter = function () {
            var that = this;
            return function (name, value, options) {
                that.cookieString = that._buildCookieString(name, value, options);
            };
        };
        CookieService.prototype._safeDecodeURIComponent = function (str) {
            try {
                return decodeURIComponent(str);
            } catch (e) {
                return str;
            }
        };
        CookieService.prototype._buildCookieString = function (name, value, options) {
            var cookiePath = '/';
            var path, expires;
            var defaultOpts = this._defaultOptions || new base_cookie_options_1.CookieOptions({ path: cookiePath });
            var opts = this._mergeOptions(defaultOpts, options);
            expires = opts.expires;
            if (this.isBlank(value)) {
                expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
                value = '';
            }
            if (this.isString(expires)) {
                expires = new Date(expires);
            }
            var str = encodeURIComponent(name) + '=' + encodeURIComponent(value);
            str += opts.path ? ';path=' + opts.path : '';
            str += opts.domain ? ';domain=' + opts.domain : '';
            str += expires ? ';expires=' + expires.toUTCString() : '';
            str += opts.secure ? ';secure' : '';
            // per http://www.ietf.org/rfc/rfc2109.txt browser must allow at minimum:
            // - 300 cookies
            // - 20 cookies per unique domain
            // - 4096 bytes per cookie
            var cookieLength = str.length + 1;
            if (cookieLength > 4096) {
                console.log("Cookie '" + name + "' possibly not set or overflowed because it was too \n      large (" + cookieLength + " > 4096 bytes)!");
            }
            return str;
        };
        CookieService.prototype._mergeOptions = function (defaultOpts, providedOpts) {
            var newOpts = defaultOpts;
            if (this.isPresent(providedOpts)) {
                return newOpts.merge(new base_cookie_options_1.CookieOptions(providedOpts));
            }
            return newOpts;
        };
        CookieService.prototype.isBlank = function (obj) {
            return obj === undefined || obj === null;
        };
        CookieService.prototype.isPresent = function (obj) {
            return obj !== undefined && obj !== null;
        };
        CookieService.prototype.isString = function (obj) {
            return typeof obj === 'string';
        };
        CookieService = __decorate([core_1.Injectable(), __param(0, core_1.Optional()), __metadata('design:paramtypes', [base_cookie_options_1.CookieOptions])], CookieService);
        return CookieService;
    }();
    exports.CookieService = CookieService;

    

    return module.exports;
});
System.registerDynamic('angular2-cookie/services.js', ['./services/base-cookie-options', './services/cookies.service'], true, function ($__require, exports, module) {
  /**
   * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
   * @version v1.2.6
   * @link https://github.com/salemdar/angular2-cookie#readme
   * @license MIT
   */
  "use strict";

  var define,
      global = this || self,
      GLOBAL = global;
  var base_cookie_options_1 = $__require('./services/base-cookie-options');
  exports.BaseCookieOptions = base_cookie_options_1.BaseCookieOptions;
  exports.CookieOptions = base_cookie_options_1.CookieOptions;
  var cookies_service_1 = $__require('./services/cookies.service');
  exports.CookieService = cookies_service_1.CookieService;

  

  return module.exports;
});
System.registerDynamic('angular2-cookie/core.js', ['./services'], true, function ($__require, exports, module) {
    /**
     * angular2-cookie - Implementation of Angular 1.x $cookies service to Angular 2
     * @version v1.2.6
     * @link https://github.com/salemdar/angular2-cookie#readme
     * @license MIT
     */
    "use strict";

    var define,
        global = this || self,
        GLOBAL = global;
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    var services_1 = $__require('./services');
    __export($__require('./services'));
    exports.ANGULAR2_COOKIE_PROVIDERS = [{ provide: services_1.CookieOptions, useClass: services_1.BaseCookieOptions }, { provide: services_1.CookieService, useFactory: cookieServiceFactory, deps: [services_1.CookieOptions] }];
    function cookieServiceFactory(options) {
        return new services_1.CookieService(options);
    }
    exports.cookieServiceFactory = cookieServiceFactory;

    

    return module.exports;
});
//# sourceMappingURL=angular2-cookie.js.map