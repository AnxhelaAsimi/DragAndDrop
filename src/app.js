"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var project_input_js_1 = require("./components/project-input.js");
var project_list_js_1 = require("./components/project-list.js");
new project_input_js_1.ProjectInput();
new project_list_js_1.ProjectList('active');
new project_list_js_1.ProjectList('finished');
