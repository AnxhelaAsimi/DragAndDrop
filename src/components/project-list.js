"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectList = void 0;
var project_js_1 = require("../models/project.js");
var base_component_js_1 = require("./base-component.js");
var project_state_js_1 = require("../state/project-state.js");
var project_item_js_1 = require("./project-item.js");
// ProjectList Class
var ProjectList = /** @class */ (function (_super) {
    __extends(ProjectList, _super);
    function ProjectList(type) {
        var _this = _super.call(this, 'project-list', 'app', false, "".concat(type, "-projects")) || this;
        _this.type = type;
        _this.assignedProjects = [];
        _this.configure();
        _this.renderContent();
        return _this;
    }
    ProjectList.prototype.dragOverHandler = function (event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            var listEl = this.element.querySelector('ul');
            listEl.classList.add('droppable');
        }
    };
    ProjectList.prototype.dropHandler = function (event) {
        var prjId = event.dataTransfer.getData('text/plain');
        project_state_js_1.projectState.moveProject(prjId, this.type === 'active' ? project_js_1.ProjectStatus.Active : project_js_1.ProjectStatus.Finished);
    };
    ProjectList.prototype.dragLeaveHandler = function (_) {
        var listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
    };
    ProjectList.prototype.configure = function () {
        var _this = this;
        this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
        this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
        this.element.addEventListener('drop', this.dropHandler.bind(this));
        project_state_js_1.projectState.addListener(function (projects) {
            var relevantProjects = projects.filter(function (prj) {
                if (_this.type === 'active') {
                    return prj.status === project_js_1.ProjectStatus.Active;
                }
                return prj.status === project_js_1.ProjectStatus.Finished;
            });
            _this.assignedProjects = relevantProjects;
            _this.renderProjects();
        });
    };
    ProjectList.prototype.renderContent = function () {
        var listId = "".concat(this.type, "-projects-list");
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + ' PROJECTS';
    };
    ProjectList.prototype.renderProjects = function () {
        var listEl = document.getElementById("".concat(this.type, "-projects-list"));
        listEl.innerHTML = '';
        for (var _i = 0, _a = this.assignedProjects; _i < _a.length; _i++) {
            var prjItem = _a[_i];
            new project_item_js_1.ProjectItem(this.element.querySelector('ul').id, prjItem);
        }
    };
    return ProjectList;
}(base_component_js_1.default));
exports.ProjectList = ProjectList;
