// Generated by CoffeeScript 1.10.0

/*
 * Copyright (C) 2014-2016 Andrey Antukh <niwi@niwi.nz>
 * Copyright (C) 2014-2016 Jesús Espino Garcia <jespinog@gmail.com>
 * Copyright (C) 2014-2016 David Barragán Merino <bameda@dbarragan.com>
 * Copyright (C) 2014-2016 Alejandro Alonso <alejandro.alonso@kaleidos.net>
 * Copyright (C) 2014-2016 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 * Copyright (C) 2014-2016 Xavi Julian <xavier.julian@kaleidos.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: gogs.coffee
 */

(function() {
  var GogsAdmin, GogsWebhooksDirective, debounce, initGogsPlugin, module;

  debounce = function(wait, func) {
    return _.debounce(func, wait, {
      leading: true,
      trailing: false
    });
  };

  GogsAdmin = (function() {
    GogsAdmin.$inject = ["$rootScope", "$scope", "$tgResources", "tgAppMetaService", "$tgConfirm"];

    function GogsAdmin(rootScope, scope, rs, appMetaService, confirm) {
      this.rootScope = rootScope;
      this.scope = scope;
      this.rs = rs;
      this.appMetaService = appMetaService;
      this.confirm = confirm;
      this.scope.sectionName = "Gogs";
      this.scope.sectionSlug = "gogs";
      this.scope.$on('project:loaded', (function(_this) {
        return function() {
          var promise;
          promise = _this.rs.modules.list(_this.scope.projectId, "gogs");
          promise.then(function(gogs) {
            var description, title;
            _this.scope.gogs = gogs;
            title = _this.scope.sectionName + " - Plugins - " + _this.scope.project.name;
            description = _this.scope.project.description;
            return _this.appMetaService.setAll(title, description);
          });
          return promise.then(null, function() {
            return _this.confirm.notify("error");
          });
        };
      })(this));
    }

    return GogsAdmin;

  })();

  GogsWebhooksDirective = function($repo, $confirm, $loading) {
    var link;
    link = function($scope, $el, $attrs) {
      var form, submit, submitButton;
      form = $el.find("form").checksley({
        "onlyOneErrorElement": true
      });
      submit = debounce(2000, (function(_this) {
        return function(event) {
          var currentLoading, promise;
          event.preventDefault();
          if (!form.validate()) {
            return;
          }
          currentLoading = $loading().target(submitButton).start();
          promise = $repo.saveAttribute($scope.gogs, "gogs");
          promise.then(function() {
            currentLoading.finish();
            $confirm.notify("success");
            return $scope.$emit("project:modules:reload");
          });
          return promise.then(null, function(data) {
            currentLoading.finish();
            form.setErrors(data);
            if (data._error_message) {
              return $confirm.notify("error", data._error_message);
            }
          });
        };
      })(this));
      submitButton = $el.find(".submit-button");
      $el.on("submit", "form", submit);
      return $el.on("click", ".submit-button", submit);
    };
    return {
      link: link
    };
  };

  module = angular.module('taigaContrib.gogs', []);

  module.controller("ContribGogsAdminController", GogsAdmin);

  module.directive("contribGogsWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", GogsWebhooksDirective]);

  initGogsPlugin = function($tgUrls) {
    return $tgUrls.update({
      "gogs": "/gogs-hook"
    });
  };

  module.run(["$tgUrls", initGogsPlugin]);

  module.run([
    '$templateCache', function($templateCache) {
      return $templateCache.put('plugin/gogs', '<div contrib-gogs-webhooks="contrib-gogs-webhooks" ng-controller="ContribGogsAdminController as ctrl"><header><h1><span class="project-name">{{::project.name}}</span><span class="green">{{::sectionName}}</span></h1></header><form><fieldset><label for="secret-key">Secret key</label><input type="text" name="secret-key" ng-model="gogs.secret" placeholder="Secret key" id="secret-key"/></fieldset><fieldset><div tg-select-input-text="tg-select-input-text" class="select-input-text"><div><label for="payload-url">Payload URL</label><div class="field-with-option"><input type="text" ng-model="gogs.webhooks_url" name="payload-url" readonly="readonly" placeholder="Payload URL" id="payload-url"/><div class="option-wrapper select-input-content"><svg class="icon icon-clipboard"><use xlink:href="#icon-clipboard"></use></svg></div></div><div class="help-copy">Copy to clipboard: Ctrl+C</div></div></div></fieldset><button type="submit" class="hidden"></button><a href="" title="Save" class="button-green submit-button"><span>Save</span></a></form><a href="https://taiga.io/support/gogs-integration/" target="_blank" class="help-button"><svg class="icon icon-question"><use xlink:href="#icon-question"></use></svg><span>Do you need help? Check out our support page!</span></a></div>');
    }
  ]);

}).call(this);
